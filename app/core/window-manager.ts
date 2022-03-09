// noinspection JSMethodCanBeStatic

import {IStartable} from "./i-startable";
import {MainApp} from "./app";
import {Container, Service } from "typedi";
import {WindowItem} from "./window";
import {BrowserWindow, screen, dialog} from "electron";
import {WindowPluginToken} from "./i-window-plugin";

@Service()
export class WindowManager implements IStartable {
  public constructor(private app: MainApp) {}

  public start(): void {
  }

  public openNewWindow() {
    const size = screen.getPrimaryDisplay().workAreaSize;
    const win = new BrowserWindow({
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        allowRunningInsecureContent: true,
        contextIsolation: false,  // false if you want to run e2e test with Spectron
      },
    });

    const newWindowItem = Container.get(WindowItem);
    newWindowItem.setMainWindow(win);
    this.app.AddWindow(newWindowItem);

    const windowPlugins = Container.getMany(WindowPluginToken);

    windowPlugins.forEach((x) => x.Setup(win, newWindowItem));
  }

  public openMessageBox(title: string, message: string) {
    dialog.showMessageBox({
      title,
      message
    });
  }
}
