import { Injectable } from '@angular/core';
import {ElectronService} from '../../core/services';
import {Observable, Subject} from 'rxjs';
import {filter, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private subjects: Map<string, Subject<any>> = new Map<string, Subject<any>>();

  constructor(private electron: ElectronService) {
    this.onReceiveDebugInfo.subscribe(
      (debugString: string) => console.log('debug', debugString)
    );
  }

  public get onReceiveDebugInfo(): Observable<string> {
    return this.getSubscriberFromElectronBackend('ipc-receive-debug');
  }

  public get onBackendResetRequest(): Observable<void> {
    return this.getSubscriberFromElectronBackend('ipc-receive-resetdata');
  }

  public get onOpeningFile(): Observable<string> {
    return this.getSubscriberFromElectronBackend('ipc-opening-file');
  }

  public get onFindClickedInMenu(): Observable<void> {
    return this.getSubscriberFromElectronBackend('ipc-server-trigger-find');
  }

  public get onReceiveNewData(): Observable<string[]> {
    return this.getSubscriberFromElectronBackend('ipc-receive-data');
  }

  public get onArguments(): Observable<string> {
    return this.getSubscriberFromElectronBackend('ipc-arguments');
  }

  public get onToggleSettings(): Observable<string> {
    return this.getSubscriberFromElectronBackend('ipc-toggle-settings');
  }

  public triggerToggleSettings() {
    this.subjects.get('ipc-toggle-settings').next([]);
  }

  public openFileStream(file: string): void {
    this.electron.ipcRenderer.send('ipc-client-request-open-file', file);
  }

  public stopFileStream(file: string): void {
    this.electron.ipcRenderer.send('ipc-client-stop-tailing-file', file);
  }

  public requestForArguments(): Observable<string> {
    const returnObservable = this.onArguments;
    this.electron.ipcRenderer.send('ipc-request-args');
    return returnObservable;
  }

  public onOpenFile(location: string, defaultData: string): Observable<string[]> {
    this.electron.ipcRenderer.send('ipc-client-get-file', [location, defaultData]);
    return this.getSubscriberFromElectronBackend('ipc-client-get-file-data')
      .pipe(
        filter(x => x[0] === location),
        take(1)
      );
  }

  public onSaveFile(location: string, data: string): Observable<string[]> {
    this.electron.ipcRenderer.send('ipc-client-set-file', [location, data]);
    return this.getSubscriberFromElectronBackend('ipc-client-set-file-data')
      .pipe(
        filter(x => x[0] === location),
        take(1)
      );
  }

  private getSubscriberFromElectronBackend(name: string): Observable<any> {
    if (!this.subjects.has(name)) {
      this.subjects.set(name, new Subject<any>());

      this.electron.ipcRenderer.on(name, (event, arg) => {
        this.subjects.get(name).next(arg);
      });
    }

    return this.subjects.get(name).asObservable();
  }

}
