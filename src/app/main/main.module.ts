import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainService } from './services/main.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    MainService,
  ],
  exports: []
})
export class MainModule { }
