import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LatestFilesService {
  private items: IFileItem[] = [];

  constructor() {
    this.getSetting();
  }

  public addToHistory(file: string) {
    const index = this.items.findIndex(x => x.location === file);
    const dateNow = new Date();

    const toInsert: IFileItem = {
      location: file,
      date: dateNow.toString()
    };

    if (index !== -1) {
      this.items.splice(index, 1);
    }

    this.items.unshift(toInsert);

    this.setSetting();
  }

  public removeFromHistory(file: string) {
    const index = this.items.findIndex(x => x.location === file);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
    this.setSetting();
  }

  public removeAll() {
    this.items = [];
    this.setSetting();
  }

  public get getItems(): IFileItem[] {
    return this.items;
  }

  private getSetting() {
    this.items = localStorage.getItem('latestOpen') === null
      ? []
      : JSON.parse(localStorage.getItem('latestOpen'));
  }

  private setSetting() {
    localStorage.setItem('latestOpen', JSON.stringify(this.items));
  }

}

interface IFileItem {
  location: string;
  date: string;
}
