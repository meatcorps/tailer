// noinspection JSUnusedLocalSymbols

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  SyntaxHighlighterWrapperConfiguration
} from '../shared/components/syntax-highlighter-wrapper/syntax-highlighter-wrapper-configuration';
import {BackendApiService} from '../shared/services/backend-api.service';
import {TabContainerSettings} from '../shared/components/tab-container/tab-container-settings';
import {delay, take} from 'rxjs/operators';
import {CentralAppConfig} from '../../../app/settings';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit  {
  public code = '';
  public bottomNotice = 0;
  public tabSettings: Array<{path: string; settings: SyntaxHighlighterWrapperConfiguration}> = [];
  public tabContainerConfiguration: TabContainerSettings = new TabContainerSettings();
  public syntaxEditorConfigurations: Map<string, SyntaxHighlighterWrapperConfiguration> =
    new Map<string, SyntaxHighlighterWrapperConfiguration>();

  private get currentTab(): string {
    return this.tabContainerConfiguration.getActiveTab();
  }

  public get syntaxEditorConfiguration(): SyntaxHighlighterWrapperConfiguration {
    return this.syntaxEditorConfigurations.get(this.currentTab);
  }

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
    this.backendApi.onFindClickedInMenu.subscribe(() => this.syntaxEditorConfiguration.executeCommand('find'));
    this.backendApi.onReceiveNewData.subscribe((newData: string[]) => {
      const filePath = newData[1];
      const data = newData[0];
      if (this.syntaxEditorConfigurations.has(filePath)) {
        this.syntaxEditorConfigurations.get(filePath).insert(data);
      } else {
        this.syntaxEditorConfigurations.set(filePath, new SyntaxHighlighterWrapperConfiguration());
        this.tabSettings = [];
        this.syntaxEditorConfigurations.forEach((setting, i) => this.tabSettings.push({
          path: i,
          settings: setting
        }));
        this.tabContainerConfiguration.add(filePath);
        this.syntaxEditorConfigurations
          .get(filePath)
          .on('onReady')
          .pipe(take(1), delay(100))
          .subscribe(() => {
            this.syntaxEditorConfigurations.get(filePath).update(data);
          });
        this.syntaxEditorConfigurations.get(filePath).requestSyntaxReady();
      }
      this.tabContainerConfiguration.tabIdentify(filePath);
    });

    this.tabContainerConfiguration.on('onActivate').subscribe(tab => {
      if (tab !== null) {
        document.title = `${tab} - Tailer ${CentralAppConfig.version}`;
      } else {
        document.title = `Tailer ${CentralAppConfig.version}`;
      }
    });

    this.backendApi.requestForArguments().subscribe((args: string) => this.needToOpenCheck(args));
    this.tabContainerConfiguration.on('onRemove').subscribe(tab => {
      this.backendApi.stopFileStream(tab);
      this.syntaxEditorConfigurations.delete(tab);
    });
  }

  private needToOpenCheck(args: string) {
    if (!(args.length === 1 && args[0].indexOf('\\') > -1)) { return; }
    this.backendApi.openFileStream(args[0]);
    console.log('trying to open', args[0]);
  }

}
