
import {IWindowPlugin, BrowserWindow, WindowPluginToken} from "../../core/i-window-plugin";
import {Service} from "typedi";
import {WindowItem} from "../../core/window";
import {WindowMenu} from "../../settings/window-menu";
import {WindowManager} from "../../core/window-manager";
import {CentralAppConfig} from "../../settings";

@Service({ id: WindowPluginToken, multiple: true })
export class LoadMenuForWindow implements IWindowPlugin {
  private windowItem: WindowItem;

  constructor(private menu: WindowMenu, private windowManager: WindowManager) {
    menu.OnAction.subscribe(data => {
      switch (data) {
        case "Open":
          this.OnFileOpen();
          return;
        case "Settings":
          this.OnToggleSettings();
          return;
        case "Find":
          this.OnFindOpen();
          return;
        case "Help":
          this.OnHelpOpen();
          return;
      }
    });
  }

  public Setup(win: BrowserWindow, windowItem: WindowItem) {
     win.setMenu(this.menu.ElectronMenu);
     this.windowItem = windowItem;
  }

  private OnFileOpen() {
    this.windowItem.invokeIpcEvent('ipc-client-request-open-file');
  }

  private OnFindOpen() {
    this.windowItem.invokeIpcEvent('ipc-server-trigger-find');
  }

  private OnToggleSettings() {
    this.windowItem.invokeIpcEvent('ipc-toggle-settings');
  }

  private OnHelpOpen() {
    this.windowManager.openMessageBox(
      'About Tailer',
      `This is version ${CentralAppConfig.version} Alpha\nFor more information visit https://meatcorps.github.io/tailer/`
    );
  }
}
