import { Component, signal } from '@angular/core';
import { QuestionCardComponent } from '../question-card/question-card.component';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrl: './main-screen.component.scss',
  imports: [
    QuestionCardComponent,
  ],
})
export class MainScreenComponent {
}
