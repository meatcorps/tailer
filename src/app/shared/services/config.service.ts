// noinspection JSMethodCanBeStatic

import { Injectable } from '@angular/core';
import {BackendApiService} from './backend-api.service';
import {Observable, Subject} from 'rxjs';
import {defaultRules, defaultTokens} from '../components/syntax-highlighter-wrapper/highlight-style-rules';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public get defaultFile(): string {
    return 'SyntaxSettings.json';
  }

  constructor(private backendApi: BackendApiService) { }

  public loadConfiguration(file: string): Observable<any> {
    const returnSubject = new Subject<any>();

    this.backendApi.onOpenFile(file, this.getJson()).subscribe((data) => {
      const configData = JSON.parse(data[1]);
      returnSubject.next(configData);
    });

    return returnSubject
      .asObservable()
      .pipe(take(1));
  }

  public saveConfiguration(file: string, data: any): Observable<any> {
    const returnSubject = new Subject<any>();

    this.backendApi.onSaveFile(file, JSON.stringify(data,null, 4)).subscribe(() => {
      returnSubject.next(data);
    });

    return returnSubject
      .asObservable()
      .pipe(take(1));
  }

  private getJson() {
    const rules = defaultRules();
    rules.forEach(x => x.regex = this.ignoreType(x.regex.source));
    return JSON.stringify({rules, tokens: defaultTokens(), base: 'twilight' }, null, 4);
  }

  private ignoreType(data: any): any {
    return data;
  }
}
