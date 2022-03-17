
// noinspection JSMethodCanBeStatic

import {IWindowPlugin, BrowserWindow, WindowPluginToken} from "../../core/i-window-plugin";
import {Service} from "typedi";
import {WindowItem} from "../../core/window";
import * as fs from "fs";
import {app} from "electron";
import * as path from "path";

@Service({ id: WindowPluginToken, multiple: true })
export class FileReaderWriterPlugin implements IWindowPlugin {
  private windowItem: WindowItem;

  public Setup(win: BrowserWindow, windowItem: WindowItem) {
    this.windowItem = windowItem;

    this.windowItem.onIpcEvent('ipc-client-get-file').subscribe(data => this.OpenFile(data[0], data[1]));
    this.windowItem.onIpcEvent('ipc-client-set-file').subscribe(data => this.WriteFile(data[0], data[1]));
  }

  private OpenFile(location: string, defaultData: string) {
    let data = defaultData;
    if (fs.existsSync(this.GetRealLocation(location))) {
      data = fs.readFileSync(
        this.GetRealLocation(location)
      ).toString();
    } else {
      this.WriteFile(location, defaultData);
    }
    this.windowItem.invokeIpcEvent('ipc-client-get-file-data', [location, data]);
  }

  private WriteFile(location: string, data: string) {
    fs.writeFileSync(
      this.GetRealLocation(location),
      data
    );
    this.windowItem.invokeIpcEvent('ipc-client-set-file-data', [location, 'done']);
  }

  private GetRealLocation(location: string): string {
    return path.normalize(app.getPath('userData') + '/' + location);
  }
}
