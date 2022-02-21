import {Service} from "typedi";
import {WindowItem} from "../../core/window";
import {IWindowPlugin, BrowserWindow, WindowPluginToken} from "../../core/i-window-plugin";

@Service({ id: WindowPluginToken, multiple: true })
export class ArgumentsPlugin implements IWindowPlugin {
  private readonly args: any;

  constructor() {
    this.args = process.argv.slice(1);
  }

  Setup(win: BrowserWindow, windowItem: WindowItem) {
    windowItem.onIpcEvent('ipc-request-args').subscribe(() => {
      windowItem.invokeIpcEvent('ipc-arguments', this.args);
    });
  }
}
