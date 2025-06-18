import { Routes } from '@angular/router';
import { MainScreenComponent } from './main/components/main-screen/main-screen.component';
import { ToDoComponent } from './main/components/to-do/to-do.component';
import { ListedViewComponent } from './main/components/listed-view/listed-view.component';
import { QuestionCardComponent } from './main/components/question-card/question-card.component';

export const routes: Routes = [
  {
    path: '', component: MainScreenComponent,
    children: [
      { path: 'todo', component: ToDoComponent },
      { path: 'categories/:item', component: ListedViewComponent },
      { path: 'categories/:item/:id', component: ListedViewComponent },
      { path: 'categories/:item/:id/:item', component: ListedViewComponent },
      { path: 'categories/:item/:id/:item/:id', component: QuestionCardComponent },
    ]
  },
];
