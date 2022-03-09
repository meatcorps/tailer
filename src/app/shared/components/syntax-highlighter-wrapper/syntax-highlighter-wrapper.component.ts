// We disable eslint complete here because of the bindings for ace editor
/* eslint-disable @typescript-eslint/dot-notation */
import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import * as ace from 'ace-builds';
import {SyntaxHighlighterWrapperConfiguration} from './syntax-highlighter-wrapper-configuration';
import { highlightStyleRules } from './highlight-style-rules';

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

  private aceEditor: ace.Ace.Editor = null;
  private oldScrollPosition = 0;

  public ngAfterViewInit(): void {
    ace.config.set('fontSize',
      this.configuration.getSetting('fontSize', '14px')
    );
    ace.config.set('basePath', './assets/ace-editor/');

    this.aceEditor = ace.edit(this.editor.nativeElement);
    this.configuration.setAceEditor(this.aceEditor);

    this.aceEditor.session.setValue('');
    this.aceEditor.setTheme(
      this.configuration.getSetting('theme', 'ace/theme/twilight'));

    const oop = ace.require('ace/lib/oop');
    const textMode = ace.require('ace/mode/text').Mode;
    const textHighlightRules = ace.require('ace/mode/text_highlight_rules').TextHighlightRules;

    const customHighlightRules = highlightStyleRules();

    oop.inherits(customHighlightRules, textHighlightRules);

    const mode = function() {
      this.HighlightRules = customHighlightRules;
    };
    oop.inherits(mode, textMode);

    (function() {
      this.$id = 'ace/mode/custom';
    }).call(mode.prototype);

    this.aceEditor.session.setMode(new mode());
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
  }

  private insertCode(code: string) {
    const needToScroll = this.isCurrentlyScrolledAtBottom();
    setTimeout(() => {
      this.aceEditor.session.insert({
        row: this.aceEditor.session.getLength(),
        column: 0
      }, code);

      this.configuration.setSetting('needToScroll', needToScroll);

      this.updateScrollPosition(needToScroll);

      this.configuration.invokeOnChange();
    }, 10);
  }


  private updateCode(code: string) {
    const needToScroll = this.isCurrentlyScrolledAtBottom();
    setTimeout(() => {
      this.aceEditor.session.setValue(code);

      this.configuration.setSetting('needToScroll', needToScroll);

      // this.updateScrollPosition(needToScroll);

      this.configuration.invokeOnChange();
    }, 10);
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
