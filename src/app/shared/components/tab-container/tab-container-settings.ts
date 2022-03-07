/* eslint-disable @typescript-eslint/member-ordering */
import {Observable, Subject} from 'rxjs';

export class TabContainerSettings {
  private onInsert: Subject<string> = new Subject<string>();
  private onRemove: Subject<string> = new Subject<string>();
  private onChange: Subject<string[]> = new Subject<string[]>();
  private onActivate: Subject<string> = new Subject<string>();
  private tabs: string[] = [];
  private numbers: number[] = [];
  private currentTab = null;
  private conversionLogic = (data) => data;

  constructor() {
    setInterval(() => {
      this.numbers.forEach((x, i) => {
        if (this.numbers[i] > 0) {
          this.numbers[i] -= 2;
          if (this.numbers[i] < 0) {
            this.numbers[i] = 0;
          }
        }
      });
    }, 10);
  }

  public convert(tabName) {
    return this.conversionLogic(tabName);
  }

  public setConvert(func) {
    this.conversionLogic = func;
  }

  public on(eventName: 'onInsert' | 'onRemove' | 'onChange' | 'onActivate'): Observable<any> {
    return this[eventName].asObservable();
  }

  public add(tabName: string) {
    if (this.tabs.indexOf(tabName) !== -1) {
      this.setActive(tabName);
      return;
    }
    this.tabs.push(tabName);
    this.numbers.push(0);
    this.onInsert.next(tabName);
    this.onChange.next(this.tabs);
    this.setActive(tabName);
  }

  public tabIdentifyNumber(tabName) {
    return this.numbers[this.tabs.indexOf(tabName)];
  }

  public tabIdentify(tabName) {
    this.numbers[this.tabs.indexOf(tabName)] = 100;
  }

  public isTabActive(tabName) {
    return this.currentTab === tabName;
  }

  public setActive(tabName: string) {
    this.currentTab = tabName;
    this.onActivate.next(tabName);
  }

  public hasTabs(): boolean {
    return this.tabs.length > 0;
  }

  public remove(tabName: string) {
    const tabIndex = this.tabs.indexOf(tabName);
    if (tabIndex === -1) {
      return;
    }
    this.tabs.splice(tabIndex, 1);
    this.numbers.splice(tabIndex, 1);
    this.onRemove.next(tabName);
    this.onChange.next(this.tabs);

    if (this.currentTab === tabName) {
      this.setActive(this.tabs.length === 0 ? null : this.tabs[0]);
    }
  }

  public tabContainerReady() {
    this.onChange.next(this.tabs);
    this.onActivate.next(this.currentTab);
  }
}
