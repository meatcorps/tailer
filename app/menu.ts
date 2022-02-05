const { app, Menu, ipcMain } = require('electron')

export function menu() {
    const template: any = [
        {
          label: 'File',
          submenu: [
            { 
                label: 'Open',
                click: () => {
                    ipcMain.emit('ipc-test')
                }
            },
            { role: 'quit' }
          ]
        },
        // { role: 'editMenu' }
        {
          label: 'Edit',
          submenu: [
            { 
                label: 'find'
            }
          ]
        },
        // { role: 'viewMenu' }
        {
          label: 'View',
          submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
          ]
        },
        // { role: 'windowMenu' }
        {
          label: 'Window',
          submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            { role: 'close' }
          ]
        },
        {
          role: 'help',
          submenu: [
            {
              label: 'Learn More',
              click: async () => {
                const { shell } = require('electron')
                await shell.openExternal('https://electronjs.org')
              }
            }
          ]
        }
      ]
      
      const menu = Menu.buildFromTemplate(template)
      Menu.setApplicationMenu(menu)
}