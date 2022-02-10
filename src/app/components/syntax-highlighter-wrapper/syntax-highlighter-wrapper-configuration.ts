import {Observable, Subject} from 'rxjs';
import * as ace from 'ace-builds';

export class SyntaxHighlighterWrapperConfiguration {
  private onInsert: Subject<string> = new Subject<string>();
  private onReady: Subject<void> = new Subject<void>();
  private onUpdate: Subject<string> = new Subject<string>();
  private onChange: Subject<void> = new Subject<void>();
  private onExecuteCommand: Subject<string> = new Subject<string>();
  private onSettingChange: Subject<{setting: string; value: any}> = new Subject<{setting: string; value: any}>();
  private aceEditor: ace.Ace.Editor = null;
  private isReady = false;
  private settings: Map<string, any> = new Map<string, any>();

  public setAceEditor(aceEditor: ace.Ace.Editor): SyntaxHighlighterWrapperConfiguration {
    this.aceEditor = aceEditor;

    if (this.isReady) { return this; }

    this.onReady.next();
    this.isReady = true;

    return this;
  }

  public setSetting(setting: string, to: any): SyntaxHighlighterWrapperConfiguration {
    if (this.settings.has(setting) && this.settings.get(setting) === to) {
      return;
    }
    this.settings.set(setting, to);
    this.onSettingChange.next({
      setting,
      value: to
    });
    return this;
  }

  public getSetting(setting: string, defaultValue: any = null): any {
    if (!this.settings.has(setting)) {
      if (defaultValue !== null) { return defaultValue; }
      console.warn(`SyntaxHighlighterWrapperConfiguration unknown setting ${setting}`);
      return null;
    }
    return this.settings.get(setting);
  }

  public requestSyntaxReady(): void {
    if (this.isReady) { return; }
    this.onReady.next();
  }

  public insert(code: string): void {
    this.onInsert.next(code);
  }

  public update(code: string): void {
    this.onUpdate.next(code);
  }

  public invokeOnChange(): void {
    this.onChange.next();
  }

  public executeCommand(command: string): void {
    this.onExecuteCommand.next(command);
  }

  public on(eventName: 'onInsert' | 'onReady' | 'onUpdate' | 'onSettingChange' | 'onChange' | 'onExecuteCommand'): Observable<any> {
    return this[eventName].asObservable();
  }

}
