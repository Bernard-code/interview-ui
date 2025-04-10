import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Question } from '../../model/question.model';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, switchMap, take, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PresentationItem } from '../../model/presentation-item.model';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-question-card',
  templateUrl: './question-card.component.html',
  styleUrl: './question-card.component.scss',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
  ],
})
export class QuestionCardComponent implements OnInit {
  private stateService = inject(StateService);
  private activatedRoute = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  public questionId: number;
  public question: Question;
  public showAnswer: boolean = false;

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(
      tap((params: ParamMap) => {
        this.questionId = Number(params.get('id'));
        this.stateService.currentQuestionId$.next(this.questionId);
        this.showAnswer = false;
      }),
      switchMap(() => this.loadData()),
      takeUntilDestroyed(this.destroyRef),
    )
      .subscribe();
  }

  public loadData(): Observable<Question[]> {
    this.stateService.loadQuestions(this.stateService.currentCategoryId$.getValue())
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe()
    return this.stateService.questions$.pipe(
      tap((questions: Question[]) => {
        this.question = questions.find((question: Question) => question.id === this.questionId);
      }),
      takeUntilDestroyed(this.destroyRef)
    )
  }

  public flipAnswer(): void {
    this.showAnswer = !this.showAnswer;
  }

  public move(next: boolean = true): void {
    const nextId: number = this.stateService.getNextOrPrevQuestionId(this.questionId, next);
    const currentCategoryId: number = this.stateService.currentCategoryId$.getValue();
    this.router.navigate([`/categories/${PresentationItem.Category}/${currentCategoryId}/${PresentationItem.Question}/${nextId}`]);
  }
}
