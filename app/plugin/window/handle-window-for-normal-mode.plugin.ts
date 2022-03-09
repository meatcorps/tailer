import {Service} from "typedi";
import {WindowItem} from "../../core/window";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import {HandleLoadWindowBase} from "./base/handle-load-window-base";
import {IWindowPlugin, BrowserWindow, WindowPluginToken} from "../../core/i-window-plugin";

@Service({ id: WindowPluginToken, multiple: true })
export class HandleWindowForNormalMode extends HandleLoadWindowBase implements IWindowPlugin {
  public Setup(win: BrowserWindow, windowItem: WindowItem) {
    // Path when running electron executable
    let pathIndex = './../../index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    win.loadURL(url.format({
      pathname: path.join(__dirname, pathIndex),
      protocol: 'file:',
      slashes: true
    }));
  }
}
