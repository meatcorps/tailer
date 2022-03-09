// noinspection JSUnusedLocalSymbols

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  SyntaxHighlighterWrapperConfiguration
} from '../shared/components/syntax-highlighter-wrapper/syntax-highlighter-wrapper-configuration';
import {BackendApiService} from '../shared/services/backend-api.service';
import {TabContainerSettings} from '../shared/components/tab-container/tab-container-settings';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit  {
  public code = '';
  public bottomNotice = 0;
  public syntaxEditorConfiguration: SyntaxHighlighterWrapperConfiguration = new SyntaxHighlighterWrapperConfiguration();
  public tabContainerConfiguration: TabContainerSettings = new TabContainerSettings();
  public fileDataCache: Map<string, string> = new Map<string, string>();
  public scrollPositionCache: Map<string, number> = new Map<string, number>();

  constructor(private router: Router, private backendApi: BackendApiService) {
    this.tabContainerConfiguration.setConvert((data: string) => {
      const arr = data.split('\\');
      return arr[arr.length - 1];
    });
  }

  public fileDropped(data) {
    this.backendApi.openFileStream(data[0].path);
  }

  ngOnInit(): void {
    // this.backendApi.onBackendResetRequest.subscribe(() => this.syntaxEditorConfiguration.update(''));
    this.backendApi.onOpeningFile.subscribe((path) => {
      this.tabContainerConfiguration.add(path);
    });
    this.backendApi.onFindClickedInMenu.subscribe(() => this.syntaxEditorConfiguration.executeCommand('find'));
    this.backendApi.onReceiveNewData.subscribe((newData: string[]) => {
      if (!this.fileDataCache.has(newData[1])) {
        this.fileDataCache.set(newData[1], newData[0]);
      } else {
        this.fileDataCache.set(newData[1], this.fileDataCache.get(newData[1]) + newData[0]);
      }
      if (this.tabContainerConfiguration.isTabActive(newData[1])) {
        this.syntaxEditorConfiguration.insert(newData[0]);
      }
      this.tabContainerConfiguration.tabIdentify(newData[1]);
    });

    this.tabContainerConfiguration.on('onActivate').subscribe(tab => {
      if (tab !== null) {
        document.title = tab + ' - Tailer 1.0.0e';
      } else {
        document.title = 'Tailer 1.0.0e';
      }
      if (!this.fileDataCache.has(tab)) {
        this.fileDataCache.set(tab, '');
      }
      if (!this.scrollPositionCache.has(tab)) {
        this.scrollPositionCache.set(tab, Number.POSITIVE_INFINITY);
      }

      this.syntaxEditorConfiguration.update(this.fileDataCache.get(tab));
      setTimeout(() =>
        this.syntaxEditorConfiguration.setScrollPosition(
          this.scrollPositionCache.get(
            this.tabContainerConfiguration.getActiveTab()
          )
        )
      , 100);
    });

    this.backendApi.requestForArguments().subscribe((args: string) => this.needToOpenCheck(args));
    this.syntaxEditorConfiguration.on('onChange').subscribe(() => this.checkForScroll());
    this.syntaxEditorConfiguration.on('onScrollChanged').subscribe((scrollPosition) => {
      this.scrollPositionCache.set(this.tabContainerConfiguration.getActiveTab(), scrollPosition);
    });
    this.tabContainerConfiguration.on('onRemove').subscribe(tab => this.backendApi.stopFileStream(tab));
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

}
