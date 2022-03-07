// noinspection JSUnusedLocalSymbols

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../core/services';
import {
  SyntaxHighlighterWrapperConfiguration
} from '../shared/components/syntax-highlighter-wrapper/syntax-highlighter-wrapper-configuration';
import {BackendApiService} from '../shared/services/backend-api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit  {
  public code = '';
  public bottomNotice = 0;
  public syntaxEditorConfiguration: SyntaxHighlighterWrapperConfiguration = new SyntaxHighlighterWrapperConfiguration();

  constructor(private router: Router, private backendApi: BackendApiService) {
  }

  public fileDropped(data) {
    console.log(data[0].path);
    this.backendApi.openFileStream(data[0].path);
  }

  ngOnInit(): void {
    this.backendApi.onBackendResetRequest.subscribe(() => this.syntaxEditorConfiguration.update(''));
    this.backendApi.onOpeningFile.subscribe((path) => document.title = path + ' - Tailer');
    this.backendApi.onFindClickedInMenu.subscribe(() => this.syntaxEditorConfiguration.executeCommand('find'));
    this.backendApi.onReceiveNewData.subscribe((newData: string) => this.syntaxEditorConfiguration.insert(newData));
    this.backendApi.requestForArguments().subscribe((args: string) => this.needToOpenCheck(args));
    this.syntaxEditorConfiguration.on('onChange').subscribe(() => this.checkForScroll());
    setInterval(() => this.updateBottomNotice(), 100);
  }

  private needToOpenCheck(args: string) {
    if (!(args.length === 1 && args[0].indexOf('\\') > -1)) { return; }
    this.backendApi.openFileStream(args[0]);
    console.log('trying to open', args[0]);
  }

  private checkForScroll() {
    if (!this.syntaxEditorConfiguration.getSetting('needToScroll', true)) { return; }
    this.bottomNotice = 1;
  }

  private updateBottomNotice() {
    this.bottomNotice -= 0.05;
    if (this.bottomNotice < 0) {
      this.bottomNotice = 0;
    }
  }

}
