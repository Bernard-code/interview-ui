import { Routes } from '@angular/router';
import { MainScreenComponent } from './main/components/main-screen/main-screen.component';
import { ListedViewComponent } from './main/components/listed-view/listed-view.component';

export const routes: Routes = [
  {
    path: '',
    component: MainScreenComponent,
    children: [
      {
        path: 'todo',
        loadChildren: () => import('./todo/todo.module').then((m) => m.TodoModule),
      },
      { path: 'questions', component: ListedViewComponent },
    ],
  },
];

