import { app, BrowserWindow } from 'electron';
import {Observable, Subject} from 'rxjs';
import {IStartable} from "./IStartable";

export class MainApp implements IStartable {
  private readonly app: typeof app;
  private win: BrowserWindow = null;
  private onCreateWindowSubject: Subject<MainApp> = new Subject<MainApp>();
  private onStartSubject: Subject<MainApp> = new Subject<MainApp>();
  private onErrorSubject: Subject<any> = new Subject<any>();
  private onClosedSubject: Subject<MainApp> = new Subject<MainApp>();

  public get onCreateWindow():Observable<MainApp> {return this.onCreateWindowSubject.asObservable(); };
  public get onStart():Observable<MainApp> {return this.onStartSubject.asObservable(); };
  public get onError():Observable<any> {return this.onErrorSubject.asObservable(); };
  public get onClosed():Observable<MainApp> {return this.onClosedSubject.asObservable(); };
  public get electronApp(): typeof app { return this.app; }
  public get primaryWindow(): BrowserWindow { return this.win; }
  public set primaryWindow(win: BrowserWindow) { this.win = win; }

  constructor() {
    this.app = app;
  }

  public start(): void {
    this.onStartSubject.next(this);
    try {
      this.app.on('ready', () => this.ready());
      this.app.on('window-all-closed', () => this.allWindowsClosed());
      this.app.on('activate', () => this.activate());
    } catch (e) {
      this.onErrorSubject.next(e);
    }
  }

  private activate() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (this.win === null) {
      this.onCreateWindowSubject.next(this);
    }
  }

// Quit when all windows are closed.
  private allWindowsClosed() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      this.onClosedSubject.next(this);
      this.app.quit();
    }
  }

  private ready() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    setTimeout(() => this.onCreateWindowSubject.next(this), 400);
  }
}
