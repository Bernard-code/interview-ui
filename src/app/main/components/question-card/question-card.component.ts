import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Question } from '../../model/question.model';
import { combineLatest, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../../services/state.service';
import { highlightAnswerHtml } from '../../utils/highlight-answer.util';

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
  private sanitizer = inject(DomSanitizer);
  private renderToken = 0;

  public question = signal<Question | undefined>(undefined);
  public questionId: number | null;
  public questionIndex = 0;
  public questionCount = 0;
  public showAnswer = signal(false);
  public trustedAnswer = signal<SafeHtml>('');
  private alwaysShowAnswers = false;

  public ngOnInit(): void {
    combineLatest([
      this.stateService.selectedQuestion$,
      this.stateService.questionsInCategory$,
      this.stateService.alwaysShowAnswers$,
    ]).pipe(
      tap(([question, inCategory, alwaysShowAnswers]: [Question | undefined, Question[], boolean]) => {
        const questionId = question?.id ?? null;
        if (questionId !== this.questionId) {
          this.showAnswer.set(alwaysShowAnswers);
        } else if (alwaysShowAnswers && !this.alwaysShowAnswers) {
          this.showAnswer.set(true);
        }
        this.alwaysShowAnswers = alwaysShowAnswers;
        this.questionId = questionId;
        this.question.set(question);
        this.questionCount = inCategory.length;
        const index = inCategory.findIndex((item: Question) => item.id === questionId);
        this.questionIndex = index === -1 ? 0 : index + 1;
        void this.renderAnswer(question?.answer ?? '');
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  public flipAnswer(): void {
    this.showAnswer.update((visible: boolean) => !visible);
  }

  public move(next: boolean = true): void {
    this.stateService.selectNextQuestion(next);
  }

  private async renderAnswer(html: string): Promise<void> {
    const token = ++this.renderToken;
    let highlighted = html;
    try {
      highlighted = await highlightAnswerHtml(html);
    } catch {
      highlighted = html;
    }
    if (token !== this.renderToken) {
      return;
    }
    this.trustedAnswer.set(this.sanitizer.bypassSecurityTrustHtml(highlighted));
  }
}
