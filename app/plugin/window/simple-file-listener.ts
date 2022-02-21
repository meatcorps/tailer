import {IWindowPlugin, BrowserWindow, WindowPluginToken} from "../../core/i-window-plugin";
import {Service} from "typedi";
import {WindowItem} from "../../core/window";
import {dialog} from "electron";
import * as fs from "fs";
import * as chokidar from "chokidar";

@Service({ id: WindowPluginToken, multiple: true })
export class SimpleFileListener implements IWindowPlugin {
  private windowItem: WindowItem;
  private currentData = 0;
  private watcher: chokidar.FSWatcher = null;

  Setup(win: BrowserWindow, windowItem: WindowItem) {
    this.windowItem = windowItem;
    this.windowItem.onIpcEvent('ipc-client-request-open-file')
      .subscribe((args) => this.clientRequestOpenFile(args))
  }

  private clientRequestOpenFile(args: any) {
    if ((typeof args === 'string' && args.length > 0 && fs.existsSync(args))) {
      this.windowItem.invokeIpcEvent('ipc-receive-debug', ['precheck', fs.existsSync(args)]);
    }

    const result = (typeof args === 'string' && args.length > 0 && fs.existsSync(args))
      ? [args]
      : dialog.showOpenDialogSync({ properties: ['openFile'] });

    this.windowItem.invokeIpcEvent('ipc-test-replay', result);
    this.windowItem.invokeIpcEvent('ipc-receive-resetdata', '');
    this.windowItem.invokeIpcEvent('ipc-receive-debug', ['setup', result[0]]);
    this.windowItem.invokeIpcEvent('ipc-opening-file', result[0]);
    this.currentData = 0;
    this.getFileData(result[0]);
    this.setupWatch(result[0]);
  }

  private getFileData(filename: string) {
    try {
      const tempData = fs.readFileSync(filename).toString(); // 'utf8'
      if (tempData.length == 0) { return; }
      if (this.currentData > tempData.length) {
        this.currentData = 0;
        this.windowItem.invokeIpcEvent('ipc-receive-debug', ['reset', this.currentData, tempData.length]);
      }
      if (tempData.length !== this.currentData) {
        this.windowItem.invokeIpcEvent('ipc-receive-debug', [tempData.length, this.currentData]);
        this.windowItem.invokeIpcEvent('ipc-receive-data', tempData.substring(this.currentData));
        this.currentData = tempData.length;
      }
    } catch (err) {
      return '';
    }
  }

  private setupWatch(file: string) {
    if (typeof this.watcher !== 'undefined' && this.watcher !== null) { this.watcher.close(); }

    this.watcher = chokidar.watch(file, {
      persistent: true,
      usePolling: true
    });

    this.watcher.on('raw', (fileevent, path, details) => {
      // This event should be triggered everytime something happens.
      this.getFileData(file);
      this.windowItem.invokeIpcEvent('ipc-receive-debug', ['Raw event info:', fileevent, path, details]);
    });
  }
}
