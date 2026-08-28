import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { MainService } from '../../services/main.service';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, filter, Observable, switchMap, tap } from 'rxjs';
import { Category } from '../../model/category.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { MatButtonModule } from '@angular/material/button';
import { PresentationItem } from '../../model/presentation-item.model';
import { ListItem } from '../../model/list-item.model';
import { QuestionFormComponent } from '../question-form/question-form.component';
import { Question } from '../../model/question.model';
import { MatIconModule } from '@angular/material/icon';
import { DeleteConfirmComponent } from '../delete-confirm/delete-confirm.component';
import { isNil } from '../../utils/is-nil.util';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { MatList, MatListItem } from '@angular/material/list';
import { StateService } from '../../services/state.service';
import { AsyncPipe, NgClass } from '@angular/common';
import { QuestionCardComponent } from '../question-card/question-card.component';

@Component({
  selector: 'app-listed-view',
  templateUrl: './listed-view.component.html',
  styleUrl: './listed-view.component.scss',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatList,
    MatListItem,
    NgClass,
    AsyncPipe,
    QuestionCardComponent,
  ],
})
export class ListedViewComponent implements OnInit {
  private mainService = inject(MainService);
  private destroyRef = inject(DestroyRef);
  private matDialog = inject(MatDialog);
  private stateService = inject(StateService);

  public items$: BehaviorSubject<ListItem[]> = new BehaviorSubject<ListItem[]>([]);
  public presentationItem = input<PresentationItem>(PresentationItem.Category);
  public activeCategoryId$: BehaviorSubject<number> = this.stateService.currentCategoryId$;
  public activeQuestionId$: BehaviorSubject<number> = this.stateService.currentQuestionId$;

  protected readonly PresentationItem = PresentationItem;

  public ngOnInit(): void {
    if (this.presentationItem() === PresentationItem.Category) {
      this.stateService.loadData().pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe();
      this.items$ = this.stateService.categories$;
    } else {
      this.items$ = this.stateService.questions$;
      let questions: ListItem[];
      questions = (this.stateService.questions$.getValue()).filter((item: Question) =>
        Number(item.category) === Number(this.activeCategoryId$.getValue())
      );
      this.items$.next(questions.sort((a, b) => a.position - b.position));
    }
  }

  public openEditModal(id?: number): void {
    const modal = this.presentationItem() === PresentationItem.Question
      ? this.matDialog.open(QuestionFormComponent, { width: '800px', data: { id } })
      : this.matDialog.open(CategoryFormComponent, { width: '400px', data: { id } });
    modal
      .afterClosed().pipe(
      filter(Boolean),
      switchMap((data: Question | Category) => {
        return this.presentationItem() === PresentationItem.Question
          ? isNil(id)
            ? this.mainService.createQuestion(data as Question)
            : this.mainService.editQuestion(id, data as Question)
          : isNil(id)
            ? this.mainService.createCategory(data as Question)
            : this.mainService.editCategory(id, data as Category);
      }),
      switchMap(() => this.stateService.loadData()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  public openItem(id: number): void {
    if (this.presentationItem() === PresentationItem.Category) {
      this.stateService.currentCategoryId$.next(id);
    } else {
      this.stateService.currentQuestionId$.next(id);
    }
  }

  public deleteItem(id: number, name: string): void {
    this.matDialog.open(DeleteConfirmComponent, { width: '400px', data: { name } })
      .afterClosed().pipe(
      filter(Boolean),
      switchMap(() =>
        this.presentationItem() === PresentationItem.Question
          ? this.mainService.deleteQuestion(id)
          : this.mainService.deleteCategory(id)
      ),
      switchMap(() => this.stateService.loadData()),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }
}
