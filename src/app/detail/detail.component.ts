import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../core/services';

declare var electron: any;

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  constructor(private electronService: ElectronService) { }

  ngOnInit(): void {
    console.log('DetailComponent INIT');
    
    this.electronService.ipcRenderer.on('ipc-test-replay', (event, arg) => {
      console.log('ipc-test-replay', arg);
    });
  
   }

  doit() {
    this.electronService.ipcRenderer.send('ipc-test', ['whatever']);
  }
}
