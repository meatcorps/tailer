import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { DndDirective } from './directives/dnd/dnd.directive';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, DndDirective],
  imports: [CommonModule, TranslateModule, FormsModule],
  exports: [TranslateModule, WebviewDirective, FormsModule, DndDirective]
})
export class SharedModule {}
