import { Component, OnInit } from '@angular/core';
import {BackendApiService} from '../shared/services/backend-api.service';
import {
  SyntaxHighlighterWrapperConfiguration
} from '../shared/components/syntax-highlighter-wrapper/syntax-highlighter-wrapper-configuration';
import {ConfigService} from '../shared/services/config.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public settings: ISettings = null;
  public syntaxSettings: SyntaxHighlighterWrapperConfiguration = new SyntaxHighlighterWrapperConfiguration();
  public turnOnEditor = true;

  constructor(private backendApi: BackendApiService, private config: ConfigService) { }

  ngOnInit(): void {
    this.config.loadConfiguration(this.config.defaultFile).subscribe(data => {
      this.settings = data;
      this.settings.rules.forEach((item, i) => item.prio = i);
    });
  }

  addColor() {
    this.settings.tokens.push({
      token: 'lorem',
      color: '',
      'background-color': ''
    });
  }

  removeColor(color: any) {
    if (!confirm('Are you sure?')) {
      return;
    }
    this.settings.tokens.splice(this.settings.tokens.indexOf(color), 1);
  }

  addRule() {
    this.settings.rules.push({regex: '', token: ''});
  }

  removeRule(rule: any) {
    if (!confirm('Are you sure?')) {
      return;
    }
    this.settings.rules.splice(this.settings.rules.indexOf(rule), 1);
  }

  save() {
    this.settings.rules.forEach((item, i) => delete this.settings.rules[i].prio);
    this.settings.rules.forEach((item, i) => item.prio = i);
    const codeData = this.syntaxSettings.getCurrentValue();

    this.config.saveConfiguration(this.config.defaultFile, this.settings).subscribe(() => {
      setTimeout(() =>  this.turnOnEditor = true, 200);
      setTimeout(() =>  this.syntaxSettings.update(codeData), 300);
    });
    this.turnOnEditor = false;
  }

  orderRules() {
    this.settings.rules.sort((a, b) => a.prio > b.prio ? 1 : -1);
    this.settings.rules.forEach((item, i) => item.prio = i);
  }

  close() {
    if (!confirm('Are you sure?')) {
      return;
    }
    this.backendApi.triggerToggleSettings();
  }
}


interface ISettings {
  rules: Array<{regex: string; token: string; prio?: number}>;
  tokens: Array<{token: string; color: string; 'background-color': string}>;
  base: string;
}
