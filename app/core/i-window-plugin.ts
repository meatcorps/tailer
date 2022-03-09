import {WindowItem} from "./window";
import {BrowserWindow} from "electron";
import {Token} from "typedi";

const WindowPluginToken = new Token<IWindowPlugin>('window.plugin');

interface IWindowPlugin {
  Setup(win: BrowserWindow, windowItem: WindowItem);
}

export {IWindowPlugin, BrowserWindow, WindowPluginToken}
