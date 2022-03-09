import {Service} from "typedi";
import {WindowItem} from "../../core/window";
import * as path from "path";
import {HandleLoadWindowBase} from "./base/handle-load-window-base";
import {IWindowPlugin, BrowserWindow, WindowPluginToken} from "../../core/i-window-plugin";

@Service({ id: WindowPluginToken, multiple: true })
export class HandleWindowForDeveloperMode extends HandleLoadWindowBase implements IWindowPlugin {
  public Setup(win: BrowserWindow, windowItem: WindowItem) {
    if (!this.isServeEnabled) { return; }

    win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(path.join(__dirname, '/../../../node_modules/electron'))
    });

    win.loadURL('http://localhost:4200');
  }
}
