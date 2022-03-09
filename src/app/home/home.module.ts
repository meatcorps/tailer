import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import {
  SyntaxHighlighterWrapperComponent
} from '../shared/components/syntax-highlighter-wrapper/syntax-highlighter-wrapper.component';

@NgModule({
  declarations: [HomeComponent, SyntaxHighlighterWrapperComponent],
    imports: [CommonModule, SharedModule, HomeRoutingModule]
})
export class HomeModule {}
