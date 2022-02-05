import { app, BrowserWindow, screen, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import * as chokidar from 'chokidar';
import { menu } from './menu';

let win: BrowserWindow = null;
let watcher: chokidar.FSWatcher = null;
let currentData = 0;

const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

menu();

function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {

      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
  });

  if (serve) {
    win.webContents.openDevTools();
    require('electron-reload')(__dirname, {
      electron: require(path.join(__dirname, '/../node_modules/electron'))
    });
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

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

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

let mainEvent = null;

ipcMain.on('ipc-setup', (event, args) => {
  mainEvent = event;
});

ipcMain.on('ipc-test', (event, args) => {
  const result = dialog.showOpenDialogSync({ properties: ['openFile', 'multiSelections'] });
  // dialog.showMessageBox({message: JSON.stringify(result)});
  //event.sender.send
  mainEvent.sender.send('ipc-test-replay', result);
  mainEvent.sender.send('ipc-receive-resetdata', '');
  mainEvent.sender.send('ipc-receive-debug', ['setup', result[0]]);
  currentData = 0;
  getFileData(result[0], event);
  setupWatch(result[0], event);
});

function getFileData(filename: string, event: any) {
  try {
    const tempData = fs.readFileSync(filename, 'utf8');
    if (tempData.length == 0) { return; }
    if (currentData > tempData.length) {
      currentData = 0;
      mainEvent.sender.send('ipc-receive-debug', ['reset', currentData, tempData.length]);
    }
    if (tempData.length !== currentData) {
      mainEvent.sender.send('ipc-receive-debug', [tempData.length, currentData]);
      mainEvent.sender.send('ipc-receive-data', tempData.substring(currentData));
      currentData = tempData.length;
    }
  } catch (err) {
    return '';
  }
}

function setupWatch(file: string, event: any) {
  if (typeof watcher !== 'undefined' && watcher !== null) { watcher.close(); }

  var watcher = chokidar.watch(file, {
    persistent: true
  });

  watcher.on('raw', (fileevent, path, details) => {
    // This event should be triggered everytime something happens.
    getFileData(file, event);
    ipcMain.emit('ipc-receive-debug', ['Raw event info:', fileevent, path, details]);

  });
}