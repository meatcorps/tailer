// We disable eslint complete here because of the bindings for ace editor
/* eslint-disable @typescript-eslint/dot-notation */
import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import * as ace from 'ace-builds';
import {SyntaxHighlighterWrapperConfiguration} from './syntax-highlighter-wrapper-configuration';
import {defaultRules, highlightStyleRules} from './highlight-style-rules';
import {BackendApiService} from '../../services/backend-api.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ConfigService} from '../../services/config.service';
import {Subject} from 'rxjs';
import {sampleTime} from 'rxjs/operators';

// noinspection JSMethodCanBeStatic
@Component({
  selector: 'app-syntax-highlighter-wrapper',
  templateUrl: './syntax-highlighter-wrapper.component.html',
  styleUrls: ['./syntax-highlighter-wrapper.component.scss']
})
export class SyntaxHighlighterWrapperComponent implements OnInit, AfterViewInit  {
  @ViewChild('editor') private editor: ElementRef<HTMLElement>;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @Input()
  public configuration: SyntaxHighlighterWrapperConfiguration;

  public tokens = [];
  public tokenCss: any;
  public currentFilter = '';

  private currentFilterInUse = '';
  private onFilterUpdate = new Subject<string>();
  private aceEditor: ace.Ace.Editor = null;
  private oldScrollPosition = 0;
  private syntaxRules = [];
  private colorBase = 'twilight';
  private allData = '';

  constructor(private backendApi: BackendApiService, protected sanitizer: DomSanitizer, private config: ConfigService) {}

  public ngAfterViewInit(): void {

    this.config.loadConfiguration(this.configuration.getSetting('configFile', this.config.defaultFile)).subscribe((data) => {
      this.syntaxRules = data['rules'];
      this.tokens = data['tokens'];
      this.colorBase = data['base'];
      this.convertTokenToCss();
      this.syntaxRules.forEach(x => x.regex = new RegExp(x.regex));

      ace.config.set('fontSize',
        this.configuration.getSetting('fontSize', '14px')
      );
      ace.config.set('basePath', './assets/ace-editor/');

      this.aceEditor = ace.edit(this.editor.nativeElement);
      this.configuration.setAceEditor(this.aceEditor);

      this.aceEditor.session.setValue('');
      this.aceEditor.setTheme(
        this.configuration.getSetting('theme', 'ace/theme/' + this.colorBase)
      );

      const oop = ace.require('ace/lib/oop');
      const textMode = ace.require('ace/mode/text').Mode;
      const textHighlightRules = ace.require('ace/mode/text_highlight_rules').TextHighlightRules;

      console.log('openDataReceived', this.syntaxRules, defaultRules());
      const customHighlightRules = highlightStyleRules(this.syntaxRules);

      oop.inherits(customHighlightRules, textHighlightRules);

      const mode = function() {
        this.HighlightRules = customHighlightRules;
      };
      oop.inherits(mode, textMode);

      (function() {
        this.$id = 'ace/mode/custom';
      }).call(mode.prototype);

      this.aceEditor.session.setMode(new mode());
    });
  }

  ngOnInit(): void {
    this.configuration.on('onInsert')
      .subscribe((code: string) => this.insertCode(code));
    this.configuration.on('onUpdate')
      .subscribe((code: string) => this.updateCode(code));
    this.configuration.on('onExecuteCommand')
      .subscribe((command: string) => this.aceEditor.execCommand(command));

    setInterval(() => {
      let currentScrollPosition = Number.POSITIVE_INFINITY;
      if (!this.isCurrentlyScrolledAtBottom()) {
        currentScrollPosition = this.aceEditor.renderer.getScrollTop();
      }
      if (currentScrollPosition !== this.oldScrollPosition && currentScrollPosition !== -0) {
        this.oldScrollPosition = currentScrollPosition;
        this.configuration.invokeOnScrollChanged(currentScrollPosition);
      }
    },100);

    this.onFilterUpdate
      .pipe(sampleTime(1000))
      .subscribe(x => {
        console.log('onFilterUpdate', x);
        this.currentFilterInUse = x;
        this.updateCode(this.allData, false);
      });
  }

  public updateFilter(filterData: string) {
    this.currentFilter = filterData;
    this.onFilterUpdate.next(filterData);
  }

  private convertTokenToCss() {
    this.tokenCss = '';
    this.tokens.slice().forEach(token => {
      this.tokenCss += `.ace_${token['token'].replace(' ', '')} { `;
      delete token['token'];
      const tokenKeys = Object.keys(token);
      tokenKeys.forEach(tokenKey => {
        if (token[tokenKey].length > 0) {
          this.tokenCss += `${tokenKey}: ${token[tokenKey]} !important; `;
        }
      });
      this.tokenCss += '}\n';
    });

    this.tokenCss = this.tokenCss.replace('<', '');
    this.tokenCss = this.tokenCss.replace('>', '');

    this.tokenCss = this.sanitizer.bypassSecurityTrustHtml('<style>' + this.tokenCss + '</style>');
  }

  private insertCode(code: string) {
    const needToScroll = this.isCurrentlyScrolledAtBottom();
    setTimeout(() => {
      this.aceEditor.session.insert({
        row: this.aceEditor.session.getLength(),
        column: 0
      }, this.updateWithFilter(code));

      this.allData += code;

      this.configuration.setSetting('needToScroll', needToScroll);

      this.updateScrollPosition(needToScroll);

      this.configuration.invokeOnChange();
    }, 10);
  }


  private updateCode(code: string, setAllData = true) {
    const needToScroll = this.isCurrentlyScrolledAtBottom();
    setTimeout(() => {
      this.aceEditor.session.setValue(this.updateWithFilter(code));

      if (setAllData) {
        this.allData = code;
      }

      this.configuration.setSetting('needToScroll', needToScroll);

      this.updateScrollPosition(needToScroll);

      this.configuration.invokeOnChange();
    }, 10);
  }

  private updateWithFilter(code: string): string {
    if (this.currentFilter.trim().length === 0) {
      return code;
    }
    const filters: Array<{filter: string; positive: boolean; caseSensitive: boolean}> = this.currentFilterInUse.split('|')
      .map(x => x.trim())
      .map(x => {
        if (x.substring(0, 2) === '--') {
          return {filter: x.substring(2).trim().toLowerCase(), positive: false, caseSensitive: false};
        }
        if (x.substring(0, 2) === '!!') {
          return {filter: x.substring(2).trim(), positive: false, caseSensitive: true};
        }
        return {filter: x.trim().toLowerCase(), positive: true, caseSensitive: false};
      });

    const codeLines = code.split('\n');
    const codeLinesToAdd = new Array<string>();

    for(const codeLine of codeLines) {
      let canBeAdd = true;
      for (const filterItem of filters.filter(x => x.filter.length > 0)) {
        const codeLineToCheck = filterItem.caseSensitive ? codeLine : codeLine.toLowerCase();
        if (filterItem.positive && !codeLineToCheck.includes(filterItem.filter)) {
          canBeAdd = false;
        }
        if (!filterItem.positive && codeLineToCheck.includes(filterItem.filter)) {
          canBeAdd = false;
        }
      }

      if (canBeAdd) {
        codeLinesToAdd.push(codeLine);
      }
    }

    return codeLinesToAdd.join('\n');
  }

  private updateScrollPosition(toTheEnd: boolean) {
    if (!toTheEnd) {  return; }
    this.configuration.setScrollPosition(Number.POSITIVE_INFINITY);
  }

  private isCurrentlyScrolledAtBottom() {
    const currentPosition = this.aceEditor.renderer['scrollBarV'].scrollHeight;
    if (this.aceEditor.renderer['$size'].height >= currentPosition) {
      return true;
    }
    const totalPosition = this.aceEditor.renderer['scrollBarV'].scrollTop + this.aceEditor.renderer['$size'].height + 50;

    return currentPosition <= totalPosition;
  }

}
