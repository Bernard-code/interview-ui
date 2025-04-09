import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Question } from '../../model/question.model';
import { MainService } from '../../services/main.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';

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
    this.questionId = this.activatedRoute.snapshot.params['id'];
    this.loadData().subscribe();
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
