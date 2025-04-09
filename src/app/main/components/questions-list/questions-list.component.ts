import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MainService } from '../../services/main.service';
import { MatDialog } from '@angular/material/dialog';
import { filter, Observable, switchMap, tap } from 'rxjs';
import { Question } from '../../model/question.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QuestionFormComponent } from '../question-form/question-form.component';
import { isNil } from '../../utils/is-nil.util';
import { DeleteConfirmComponent } from '../delete-confirm/delete-confirm.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { MatList, MatListItem } from '@angular/material/list';

@Component({
  selector: 'app-questions-list',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatList,
    MatListItem,
    RouterOutlet,
  ],
  templateUrl: './questions-list.component.html',
  styleUrl: './questions-list.component.scss'
})
export class QuestionsListComponent implements OnInit {
  private mainService = inject(MainService);
  private destroyRef = inject(DestroyRef);
  private matDialog = inject(MatDialog);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  public questions: Question[] = [];
  public categoryId: number;

  public ngOnInit(): void {
    this.categoryId = this.activatedRoute.snapshot.params['id'];
    this.loadQuestions().subscribe();
  }

  public loadQuestions(): Observable<Question[]> {
    return this.mainService.getQuestions().pipe(
      tap((questions: Question[]) => {
        this.questions = questions
          .filter((item: Question) =>
            Number(item.category) === Number(this.categoryId)
          )
          .sort((a, b) => a.position - b.position);
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public openEditModal(id?: number): void {
    this.matDialog.open(QuestionFormComponent, { width: '800px', data: { id } })
      .afterClosed().pipe(
      filter(Boolean),
      switchMap((question: Question) =>
        isNil(id)
          ? this.mainService.createQuestion(question)
          : this.mainService.editQuestion(id, question)),
      switchMap(() => this.loadQuestions()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  public openQuestion(id: number): void {
    this.router.navigate([`categories/${this.categoryId}/question/${id}`]);
  }

  public deleteItem(id: number, name: string): void {
    this.matDialog.open(DeleteConfirmComponent, { width: '400px', data: { name } })
      .afterClosed().pipe(
      filter(Boolean),
      switchMap(() => this.mainService.deleteQuestion(id)),
      switchMap(() => this.loadQuestions()),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

}
