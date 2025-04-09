import { Routes } from '@angular/router';
import { MainScreenComponent } from './main/components/main-screen/main-screen.component';
import { ToDoComponent } from './main/components/to-do/to-do.component';
import { QuestionCardComponent } from './main/components/question-card/question-card.component';
import { CategoriesListComponent } from './main/components/categories-list/categories-list.component';
import { QuestionsListComponent } from './main/components/questions-list/questions-list.component';

export const routes: Routes = [
  { path: '', component: MainScreenComponent,
    children: [
      { path: 'todo', component: ToDoComponent },
      { path: 'categories', component: CategoriesListComponent,
        children: [
          { path: ':id', component: QuestionsListComponent,
            children: [
              { path: 'question/:id', component: QuestionCardComponent },
            ]
          },
        ]
      },
    ]
  },
];
