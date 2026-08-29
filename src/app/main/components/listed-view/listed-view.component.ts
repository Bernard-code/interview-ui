import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MainService } from '../../services/main.service';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, CdkDrag, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { combineLatest, filter, forkJoin, map, Observable, switchMap } from 'rxjs';
import { Category } from '../../model/category.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { MatButtonModule } from '@angular/material/button';
import { PresentationItem } from '../../model/presentation-item.model';
import { QuestionFormComponent } from '../question-form/question-form.component';
import { ListItem } from '../../model/list-item.model';
import { Question } from '../../model/question.model';
import { MatIconModule } from '@angular/material/icon';
import { DeleteConfirmComponent } from '../delete-confirm/delete-confirm.component';
import { isNil } from '../../utils/is-nil.util';
import { StateService } from '../../services/state.service';
import { AsyncPipe } from '@angular/common';
import { QuestionCardComponent } from '../question-card/question-card.component';

@Component({
  selector: 'app-listed-view',
  templateUrl: './listed-view.component.html',
  styleUrl: './listed-view.component.scss',
  imports: [
    MatButtonModule,
    MatIconModule,
    AsyncPipe,
    QuestionCardComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
})
export class ListedViewComponent implements OnInit {
  private mainService = inject(MainService);
  private destroyRef = inject(DestroyRef);
  private matDialog = inject(MatDialog);
  private stateService = inject(StateService);

  public categories$: Observable<Category[]> = this.stateService.categories$.pipe(
    map((categories: Category[]) =>
      [...categories].sort((a, b) => a.position - b.position)
    ),
  );
  public activeCategoryId$ = this.stateService.currentCategoryId$;
  public activeQuestionId$ = this.stateService.currentQuestionId$;

  public filteredQuestions$: Observable<Question[]> = combineLatest([
    this.stateService.questions$,
    this.activeCategoryId$,
  ]).pipe(
    map(([questions, categoryId]) =>
      questions
        .filter((item: Question) => Number(item.category) === Number(categoryId))
        .sort((a, b) => a.position - b.position)
    ),
  );

  public selectedCategory$: Observable<Category | undefined> = combineLatest([
    this.categories$,
    this.activeCategoryId$,
  ]).pipe(
    map(([categories, id]) => categories.find((category: Category) => category.id === id)),
  );

  public selectedQuestion$: Observable<Question | undefined> = combineLatest([
    this.stateService.questions$,
    this.activeQuestionId$,
  ]).pipe(
    map(([questions, id]) => questions.find((question: Question) => question.id === id)),
  );

  protected readonly PresentationItem = PresentationItem;
  protected readonly isNil = isNil;

  public ngOnInit(): void {
    this.stateService.loadData().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  public openEditModal(id?: number, type: PresentationItem = PresentationItem.Category): void {
    if (type === PresentationItem.Question) {
      const categoryId = this.activeCategoryId$.getValue();
      const questions = this.stateService.questions$.getValue()
        .filter((item: Question) => Number(item.category) === Number(categoryId))
        .sort((a, b) => a.position - b.position);
      this.stateService.highestPosition = questions[questions.length - 1]?.position ?? 0;
    }

    const modal = type === PresentationItem.Question
      ? this.matDialog.open(QuestionFormComponent, {
          width: '640px',
          maxWidth: '92vw',
          data: { id },
          panelClass: 'app-dialog',
          backdropClass: 'app-dialog-backdrop',
        })
      : this.matDialog.open(CategoryFormComponent, {
          width: '420px',
          data: { id },
          panelClass: 'app-dialog',
          backdropClass: 'app-dialog-backdrop',
        });

    modal.afterClosed().pipe(
      filter(Boolean),
      switchMap((data: Question | Category) =>
        type === PresentationItem.Question
          ? isNil(id)
            ? this.mainService.createQuestion(data as Question)
            : this.mainService.editQuestion(id, data as Question)
          : isNil(id)
            ? this.mainService.createCategory(data as Category)
            : this.mainService.editCategory(id, data as Category)
      ),
      switchMap(() => this.stateService.loadData()),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  public reorderQuestions(event: CdkDragDrop<Question[]>): void {
    this.persistReorder(
      event,
      (updates: Question[]) => {
        const updatedById = new Map(updates.map((item: Question) => [item.id, item]));
        this.stateService.questions$.next(
          this.stateService.questions$.getValue().map((question: Question) =>
            updatedById.get(question.id) ?? question
          ),
        );
      },
      (question: Question) => this.mainService.editQuestion(question.id, question),
    );
  }

  public reorderCategories(event: CdkDragDrop<Category[]>): void {
    this.persistReorder(
      event,
      (updates: Category[]) => {
        const updatedById = new Map(updates.map((item: Category) => [item.id, item]));
        this.stateService.categories$.next(
          this.stateService.categories$.getValue().map((category: Category) =>
            updatedById.get(category.id) ?? category
          ),
        );
      },
      (category: Category) => this.mainService.editCategory(category.id, category),
    );
  }

  private persistReorder<T extends ListItem>(
    event: CdkDragDrop<T[]>,
    applyLocal: (updates: T[]) => void,
    save: (item: T) => Observable<unknown>,
  ): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const original = event.container.data ?? [];
    const reordered = [...original];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);

    const updates = reordered
      .map((item: T, index: number) => ({ ...item, position: index + 1 }))
      .filter((item: T) => {
        const previous = original.find((entry: T) => entry.id === item.id);
        return previous?.position !== item.position;
      });

    if (!updates.length) {
      return;
    }

    applyLocal(updates);
    forkJoin(updates.map((item: T) => save(item))).pipe(
      switchMap(() => this.stateService.loadData()),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  public openItem(id: number, type: PresentationItem): void {
    if (type === PresentationItem.Category) {
      this.stateService.currentCategoryId$.next(id);
      const firstQuestion = this.stateService.questions$.getValue()
        .filter((item: Question) => Number(item.category) === id)
        .sort((a, b) => a.position - b.position)[0];
      this.stateService.currentQuestionId$.next(firstQuestion?.id ?? null);
      return;
    }
    this.stateService.currentQuestionId$.next(id);
  }

  public clearSelection(): void {
    this.stateService.currentCategoryId$.next(null);
    this.stateService.currentQuestionId$.next(null);
  }

  public deleteItem(
    event: Event,
    id: number,
    name: string,
    type: PresentationItem,
  ): void {
    event.stopPropagation();
    this.matDialog.open(DeleteConfirmComponent, {
      width: '400px',
      data: { name },
      panelClass: 'app-dialog',
      backdropClass: 'app-dialog-backdrop',
    })
      .afterClosed().pipe(
        filter(Boolean),
        switchMap(() =>
          type === PresentationItem.Question
            ? this.mainService.deleteQuestion(id)
            : this.mainService.deleteCategory(id)
        ),
        switchMap(() => this.stateService.loadData()),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(() => {
        if (type === PresentationItem.Category && this.activeCategoryId$.getValue() === id) {
          this.clearSelection();
        }
        if (type === PresentationItem.Question && this.activeQuestionId$.getValue() === id) {
          this.stateService.currentQuestionId$.next(null);
        }
      });
  }
}
