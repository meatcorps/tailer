import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { DndDirective } from './directives/dnd/dnd.directive';
import { TabContainerComponent } from './components/tab-container/tab-container.component';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, DndDirective, TabContainerComponent],
  imports: [CommonModule, TranslateModule, FormsModule],
  exports: [TranslateModule, WebviewDirective, FormsModule, DndDirective, TabContainerComponent]
})
export class SharedModule {}
