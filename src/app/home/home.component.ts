// noinspection JSUnusedLocalSymbols

import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../core/services';
import {
  SyntaxHighlighterWrapperConfiguration
} from '../components/syntax-highlighter-wrapper/syntax-highlighter-wrapper-configuration';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit  {
  public code = '';
  public bottomNotice = 0;
  public syntaxEditorConfiguration: SyntaxHighlighterWrapperConfiguration = new SyntaxHighlighterWrapperConfiguration();

  // eslint-disable-next-line @typescript-eslint/member-ordering
  constructor(private router: Router, private electronService: ElectronService) {
  }

  ngOnInit(): void {
    this.electronService.ipcRenderer.send('ipc-request-args');

    this.electronService.ipcRenderer.on('ipc-receive-debug', (event, arg) => {
      console.log('debug', arg);
    });

    this.electronService.ipcRenderer.on('ipc-receive-resetdata', (event, arg) => {
      this.syntaxEditorConfiguration.update('');
    });

    this.electronService.ipcRenderer.on('ipc-opening-file', (event, arg) => {
      document.title = arg + ' - Tailer';
    });

    this.electronService.ipcRenderer.on('ipc-trigger-find', (event, arg) => {

      this.syntaxEditorConfiguration.executeCommand('find');
    });

    this.electronService.ipcRenderer.on('ipc-receive-data', (event, arg) => this.syntaxEditorConfiguration.insert(arg));


    this.electronService.ipcRenderer.on('ipc-arguments', (event, args) => {
      console.log('incoming args', args);
      if (args.length === 1 && args[0].indexOf(':\\') > -1) {
        this.electronService.ipcRenderer.send('ipc-test', args[0]);
        console.log('trying to open', args[0]);
      }
    });

    this.syntaxEditorConfiguration.on('onChange').subscribe(() => {
      if (this.syntaxEditorConfiguration.getSetting('needToScroll', true)) {
        this.bottomNotice = 1;
      }
    });

    setInterval(() => this.updateBottomNotice(), 100);
  }

  private updateBottomNotice() {
    this.bottomNotice -= 0.05;
    if (this.bottomNotice < 0) {
      this.bottomNotice = 0;
    }
  }

}
