import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Question } from '../../model/question.model';
import { combineLatest, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-question-card',
  templateUrl: './question-card.component.html',
  styleUrl: './question-card.component.scss',
  standalone: true,
  imports: [
    MatIconModule,
  ],
})
export class QuestionCardComponent implements OnInit {
  private stateService = inject(StateService);
  private destroyRef = inject(DestroyRef);

  public questionId: number | null;
  public question: Question | undefined;
  public questionIndex = 0;
  public questionCount = 0;
  public showAnswer = false;

  public ngOnInit(): void {
    combineLatest([
      this.stateService.selectedQuestion$,
      this.stateService.questionsInCategory$,
    ]).pipe(
      tap(([question, inCategory]: [Question | undefined, Question[]]) => {
        const questionId = question?.id ?? null;
        if (questionId !== this.questionId) {
          this.showAnswer = false;
        }
        this.questionId = questionId;
        this.question = question;
        this.questionCount = inCategory.length;
        const index = inCategory.findIndex((item: Question) => item.id === questionId);
        this.questionIndex = index === -1 ? 0 : index + 1;
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  public flipAnswer(): void {
    this.showAnswer = !this.showAnswer;
  }

  public move(next: boolean = true): void {
    this.stateService.selectNextQuestion(next);
  }
}
