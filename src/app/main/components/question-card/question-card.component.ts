import { Component, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-question-card',
  templateUrl: './question-card.component.html',
  styleUrl: './question-card.component.scss',
  standalone: true,
  imports: [],
})
export class QuestionCardComponent implements OnInit {
  public title = input<string>('');

  public ngOnInit(): void {
    console.log("=> title", this.title());
  }
}
