import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Question } from '../../model/question.model';
import { MainService } from '../../services/main.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { PresentationItem } from '../../model/presentation-item.model';

@Component({
  selector: 'app-question-card',
  templateUrl: './question-card.component.html',
  styleUrl: './question-card.component.scss',
  standalone: true,
  imports: [
    MatButtonModule,
  ],
})
export class QuestionCardComponent implements OnInit {
  private mainService = inject(MainService);
  private activatedRoute = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  public questionId: number;
  public question: Question;
  public showAnswer: boolean = false;

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(
      tap((params: ParamMap) => {
        this.questionId = Number(params.get('id'));
      }),
      switchMap(() => this.loadData()),
      takeUntilDestroyed(this.destroyRef),
    )
      .subscribe();
  }

  public loadData(): Observable<Question> {
    return this.mainService.getQuestionById(this.questionId).pipe(
      tap((question: Question) => {
        this.question = question;
      }),
      takeUntilDestroyed(this.destroyRef)
    )
  }

  public flipAnswer(): void {
    this.showAnswer = !this.showAnswer;
  }
}
