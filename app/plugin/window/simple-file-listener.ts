import {IWindowPlugin, BrowserWindow, WindowPluginToken} from "../../core/i-window-plugin";
import {Service} from "typedi";
import {WindowItem} from "../../core/window";
import {dialog} from "electron";
import * as fs from "fs";
import * as chokidar from "chokidar";
import {WindowManager} from "../../core/window-manager";

@Service({ id: WindowPluginToken, multiple: true })
export class SimpleFileListener implements IWindowPlugin {
  private windowItem: WindowItem;

  private watchersCurrentData: Map<string, number> = new Map<string, number>();
  private watchers: Map<string, chokidar.FSWatcher> = new Map<string, chokidar.FSWatcher>();

  constructor(private manager: WindowManager) {
  }

  Setup(win: BrowserWindow, windowItem: WindowItem) {
    this.windowItem = windowItem;
    this.windowItem.onIpcEvent('ipc-client-request-open-file')
      .subscribe((args) => this.clientRequestOpenFile(args))

    this.windowItem.onIpcEvent('ipc-client-stop-tailing-file')
      .subscribe((args) => {
        if (!this.watchers.has(args)) {
          return;
        }
        this.watchersCurrentData.delete(args);
        this.watchers.get(args).close();
        this.watchers.delete(args);
      });
  }

  private clientRequestOpenFile(args: any) {
    if ((typeof args === 'string' && args.length > 0 && fs.existsSync(args))) {
      this.windowItem.invokeIpcEvent('ipc-receive-debug', ['precheck', fs.existsSync(args)]);
    }

    const result = (typeof args === 'string' && args.length > 0 && fs.existsSync(args))
      ? [args]
      : dialog.showOpenDialogSync({ properties: ['openFile'] });

    if (Array.isArray(result) && fs.existsSync(result[0])) {
      this.windowItem.invokeIpcEvent('ipc-test-replay', result);
      this.windowItem.invokeIpcEvent('ipc-receive-resetdata', '');
      this.windowItem.invokeIpcEvent('ipc-receive-debug', ['setup', result[0]]);
      this.windowItem.invokeIpcEvent('ipc-opening-file', result[0]);
      this.watchersCurrentData.set(result[0], 0);
      this.getFileData(result[0]);
      this.setupWatch(result[0]);
    } else {
      this.manager.openMessageBox('Uh oh something went wrong', 'Nothing selected or unable to open file')
    }
  }

  private getFileData(filename: string) {
    if (!this.watchersCurrentData.has(filename)) {
      this.watchersCurrentData.set(filename, 0);
    }
    try {
      const tempData = fs.readFileSync(filename).toString(); // 'utf8'
      if (tempData.length == 0) { return; }
      if (this.watchersCurrentData.get(filename) > tempData.length) {
        this.watchersCurrentData.set(filename, 0)
        this.windowItem.invokeIpcEvent('ipc-receive-debug', ['reset', this.watchersCurrentData.get(filename), tempData.length]);
      }
      if (tempData.length !== this.watchersCurrentData.get(filename)) {
        this.windowItem.invokeIpcEvent('ipc-receive-debug', [tempData.length, this.watchersCurrentData.get(filename)]);
        this.windowItem.invokeIpcEvent('ipc-receive-data', [tempData.substring(this.watchersCurrentData.get(filename)), filename]);
        this.watchersCurrentData.set(filename, tempData.length);
      }
    } catch (err) {
      return '';
    }
  }

  private setupWatch(file: string) {
    if (this.watchers.has(file)) {
      return;
    }

    this.watchers.set(file, chokidar.watch(file, {
      persistent: true,
      usePolling: true
    }));

    this.watchers.get(file).on('raw', (fileevent, path, details) => {
      // This event should be triggered everytime something happens.
      this.getFileData(file);
      this.windowItem.invokeIpcEvent('ipc-receive-debug', ['Raw event info:', fileevent, path, details]);
    });
  }
}
