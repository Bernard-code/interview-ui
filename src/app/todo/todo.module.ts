import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TODO_ROUTES } from './todo.routes';
import { ToDoComponent } from './components/to-do/to-do.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TODO_ROUTES),
    ToDoComponent,
  ],
})
export class TodoModule {}
