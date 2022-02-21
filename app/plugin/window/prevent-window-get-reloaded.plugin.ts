// noinspection JSMethodCanBeStatic

import {Service} from "typedi";
import {globalShortcut} from "electron";
import {WindowItem} from "../../core/window";
import {IWindowPlugin, BrowserWindow, WindowPluginToken} from "../../core/i-window-plugin";

@Service({ id: WindowPluginToken, multiple: true })
export class PreventWindowGetReloaded implements IWindowPlugin {
  public Setup(win: BrowserWindow, windowItem: WindowItem) {
    win.on('focus', () => this.onFocus());

    win.on('blur', () => this.onBlur());
  }

  private onFocus() {
    globalShortcut.register('CommandOrControl+R', () => {});
    globalShortcut.register('CommandOrControl+Shift+R', () => {});
    globalShortcut.register('F5', () => {});
  }

  private onBlur() {
    globalShortcut.unregisterAll();
  }
}
