import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Question } from '../../model/question.model';
import { combineLatest, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../../services/state.service';
import { isNil } from '../../utils/is-nil.util';

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

  public questionId: number;
  public question: Question;
  public questionIndex = 0;
  public questionCount = 0;
  public showAnswer = false;

  public ngOnInit(): void {
    combineLatest([
      this.stateService.currentQuestionId$,
      this.stateService.currentCategoryId$,
      this.stateService.questions$,
    ]).pipe(
      tap(([questionId, categoryId, questions]: [number, number, Question[]]) => {
        if (questionId !== this.questionId) {
          this.showAnswer = false;
        }
        this.questionId = questionId;
        this.question = questions.find((question: Question) => question.id === questionId);

        const inCategory = questions
          .filter((question: Question) => Number(question.category) === Number(categoryId))
          .sort((a, b) => a.position - b.position);
        this.questionCount = inCategory.length;
        const index = inCategory.findIndex((question: Question) => question.id === questionId);
        this.questionIndex = index === -1 ? 0 : index + 1;
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  public flipAnswer(): void {
    this.showAnswer = !this.showAnswer;
  }

  public move(next: boolean = true): void {
    const nextId = this.stateService.getNextOrPrevQuestionId(this.questionId, next);
    if (isNil(nextId)) {
      return;
    }
    this.stateService.currentQuestionId$.next(nextId);
  }
}
