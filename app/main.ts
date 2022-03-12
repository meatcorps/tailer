import 'reflect-metadata';
import {Container} from "typedi";
import {HandleWindowForNormalMode} from "./plugin/window/handle-window-for-normal-mode.plugin";
import {HandleWindowForDeveloperMode} from "./plugin/window/handle-window-for-developer-mode.plugin";
import {LoadMenuForWindow} from "./plugin/window/load-menu.plugin";
import {PreventWindowGetReloaded} from "./plugin/window/prevent-window-get-reloaded.plugin";
import {SimpleFileListener} from "./plugin/window/simple-file-listener";
import {MainApp} from "./core/app";
import {WindowManager} from "./core/window-manager";
import {WindowItem} from "./core/window";
import {ArgumentsPlugin} from "./plugin/window/arguments.plugin";
import {FileReaderWriterPlugin} from "./plugin/window/file-reader-writer.plugin";

Container.import([
  ArgumentsPlugin,
  HandleWindowForNormalMode,
  HandleWindowForDeveloperMode,
  LoadMenuForWindow,
  PreventWindowGetReloaded,
  SimpleFileListener,
  FileReaderWriterPlugin,
  MainApp,
  WindowManager,
  WindowItem
]);

const app = Container.get<MainApp>(MainApp);
const windowManager = Container.get<WindowManager>(WindowManager);
app.onCreateWindow.subscribe(() => windowManager.openNewWindow());

app.start();





