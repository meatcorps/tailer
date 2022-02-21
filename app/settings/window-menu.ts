import {Service} from "typedi";
import {Observable, Subject} from "rxjs";

const { Menu } = require('electron')

type actions = 'Open'|'Find'|'Help';

@Service()
export class WindowMenu {
  private readonly menu: Electron.Menu;
  private onActionSubject: Subject<actions> = new Subject<actions>();

  private template: any = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          click: async () => {
            this.onActionSubject.next('Open');
          }
        },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Find',
          click: async () => {
            this.onActionSubject.next('Find');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
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
            // const { shell } = require('electron');
            // await shell.openExternal('https://meatcorps.github.io/tailer/')
            this.onActionSubject.next('Help');
          }
        }
      ]
    }
  ]

  constructor() {
    this.menu = Menu.buildFromTemplate(this.template);
  }

  public get ElectronMenu(): Electron.Menu { return this.menu; }
  public get OnAction(): Observable<actions> { return this.onActionSubject.asObservable(); }
}
