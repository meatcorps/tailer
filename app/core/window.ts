import { BrowserWindow, ipcMain } from 'electron';
import {Observable, Subject} from "rxjs";
import {Service} from "typedi";

@Service()
export class WindowItem {
  private onCloseSubject: Subject<void> = new Subject();
  private onReadySubject: Subject<Electron.IpcMainEvent> = new Subject();
  private win: BrowserWindow;
  private handle: Electron.IpcMainEvent = null;
  private ipcEventsSubjects: Map<string, Subject<any>> = new Map<string, Subject<any>>();

  constructor() {
    this.onIpcEvent('ipc-setup').subscribe(() => {
      this.invokeIpcEvent('ipc-ready-from-main');
      this.onReadySubject.next(this.handle);
    });
  }

  public setMainWindow(win: BrowserWindow) {
    this.win = win;
    this.win.on('close', () => this.onCloseSubject.next());
  }

  public onIpcEvent(name: string): Observable<any> {
    if (!this.ipcEventsSubjects.has(name)) {
      const ipcSubject: Subject<any> = new Subject<any>();
      this.ipcEventsSubjects.set(name, ipcSubject);

      ipcMain.on(name, (event, args) => {
        if (event.sender.id != this.win.id) { return; }
        this.handle = event;
        this.invokeIpcEvent('ipc-receive-debug', ['setup', name]);
        ipcSubject.next(args);
      });
    }

    return this.ipcEventsSubjects.get(name).asObservable();
  }

  public invokeIpcEvent(name: string, data: any = null) {
    if (this.ipcEventsSubjects.has(name)) {
      this.ipcEventsSubjects.get(name).next(data);
    }
    if (data === null) {
      this.handle.sender.send(name, []);
      return;
    }
    this.handle.sender.send(name, data);
  }

  public get onClose(): Observable<void> { return this.onCloseSubject.asObservable(); }
  public get onReady(): Observable<Electron.IpcMainEvent> { return this.onReadySubject.asObservable(); }

  public get ipcHandle(): Electron.IpcMainEvent { return this.handle; }
}
