import {Component, ElementRef, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { Router } from '@angular/router';
import * as ace from 'ace-builds';
import { ElectronService } from '../core/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit  {
  @ViewChild('editor') private editor: ElementRef<HTMLElement>;

  public code = '';

  private aceEditor: ace.Ace.Editor = null;

  public ngAfterViewInit(): void {
    ace.config.set('fontSize', '14px');
    ace.config.set('basePath', './assets/ace-editor/');

    this.aceEditor = ace.edit(this.editor.nativeElement);

    this.aceEditor.session.setValue('');
    this.aceEditor.setTheme('ace/theme/twilight');

    const oop = ace.require('ace/lib/oop');
    const textMode = ace.require('ace/mode/text').Mode;
    const textHighlightRules = ace.require('ace/mode/text_highlight_rules').TextHighlightRules;

    const customHighlightRules = this.getLogRules();

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

  // eslint-disable-next-line @typescript-eslint/member-ordering
  constructor(private router: Router, private electronService: ElectronService) {
  }

  ngOnInit(): void {
    console.log('HomeComponent INIT');//ipc-setup
    // setTimeout(() => this.electronService.ipcRenderer.send('ipc-test', ['whatever']), 100);
    this.electronService.ipcRenderer.on('ipc-receive-debug', (event, arg) => {
      console.log('debug', arg);
    });

    this.electronService.ipcRenderer.on('ipc-receive-resetdata', (event, arg) => {
      this.aceEditor.session.setValue('');
    });

    this.electronService.ipcRenderer.on('ipc-opening-file', (event, arg) => {
      document.title = arg + ' - Tailer';
    });

    this.electronService.ipcRenderer.on('ipc-trigger-find', (event, arg) => {
      console.log('trigger find');
      this.aceEditor.execCommand('find');
    });

    this.electronService.ipcRenderer.on('ipc-receive-data', (event, arg) => {
      const toAdd: string = arg;
      this.aceEditor.session.insert({
        row: this.aceEditor.session.getLength(),
        column: 0
      }, toAdd);
      this.aceEditor.renderer.scrollToLine(Number.POSITIVE_INFINITY, false, true, () => {});
    });

    this.electronService.ipcRenderer.send('ipc-request-args');

    this.electronService.ipcRenderer.on('ipc-arguments', (event, args) => {
      console.log('incoming args', args);
      if (args.length === 1 && args[0].indexOf(':\\') > -1) {
        this.electronService.ipcRenderer.send('ipc-test', args[0]);
        console.log('trying to open', args[0]);
      }
    });
  }

  private getLogRules(): any {
    return function customHighlightRules() {
      this.$rules = {
        start: [
          {
            regex: /\b(Trace)\b:/,
            token: 'verbose' // verbose
          },{
            regex: /\b(DEBUG|Debug)\b|\b(debug)\:/,
            token: 'debug' // debug
          },{
            regex: /\b(HINT|INFO|INFORMATION|Info|NOTICE|II)\b|\b(info|information)\:/,
            token: 'info' // info
          },{
            regex: /\b(WARNING|WARN|Warn|WW)\b|\b(warning)\:/,
            token: 'warning' // warning
          },{
            regex: /\b(ALERT|CRITICAL|EMERGENCY|ERROR|FAILURE|FAIL|Fatal|FATAL|Error|EE)\b|\b(error)\:/,
            token: 'error' // error
          },{
            regex: /\b\d{4}-\d{2}-\d{2}(T|\b)/,
            token: 'date' // date
          },{
            regex: /(?<=(^|\s))\d{2}[^\w\s]\d{2}[^\w\s]\d{4}\b/,
            token: 'date' // date
          },{
            regex: /\d{1,2}:\d{2}(:\d{2}([.,]\d{1,})?)?(Z| ?[+-]\d{1,2}:\d{2})?\b/,
            token: 'date' // date
          },{
            regex: /\b([0-9a-fA-F]{40}|[0-9a-fA-F]{10}|[0-9a-fA-F]{7})\b/,
            token: 'language' // language Git commit hashes of length 40, 10 or 7
          },{
            regex: /\b[0-9a-fA-F]{8}[-]?([0-9a-fA-F]{4}[-]?){3}[0-9a-fA-F]{12}\b/,
            token: 'constant' // constant
          },{
            regex: /\b([0-9a-fA-F]{2,}[:-])+[0-9a-fA-F]{2,}\b/,
            token: 'constant' // constant
          },{
            regex: /\b([0-9]+|true|false|null)\b/,
            token: 'constant' // constant
          },{
            regex: /"[^"]*"/,
            token: 'string' // string
          },{
            regex: /(?<![\w])'[^']*'/,
            token: 'string' // string
          },{
            regex: /\b([a-zA-Z.]*Exception)\b/,
            token: 'regexp' // regexp
          },{
            regex: /(http:|https:)\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/,
            token: 'url' // url
          },{
            regex: /(?<![\w/\\])([\w-]+\.)+([\w-])+(?![\w/\\])/,
            token: 'keyword' // constant
          }
        ]
      };
    };
  }
}
