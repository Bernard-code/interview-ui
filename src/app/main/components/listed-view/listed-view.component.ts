import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, CdkDrag, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { filter, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { MatButtonModule } from '@angular/material/button';
import { PresentationItem } from '../../model/presentation-item.model';
import { QuestionFormComponent } from '../question-form/question-form.component';
import { Question } from '../../model/question.model';
import { Category } from '../../model/category.model';
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
  private destroyRef = inject(DestroyRef);
  private matDialog = inject(MatDialog);
  private stateService = inject(StateService);

  public categories$ = this.stateService.sortedCategories$;
  public activeCategoryId$ = this.stateService.currentCategoryId$;
  public activeQuestionId$ = this.stateService.currentQuestionId$;
  public filteredQuestions$ = this.stateService.questionsInCategory$;
  public selectedCategory$ = this.stateService.selectedCategory$;
  public selectedQuestion$ = this.stateService.selectedQuestion$;

  protected readonly PresentationItem = PresentationItem;
  protected readonly isNil = isNil;

  public ngOnInit(): void {
    this.stateService.loadData().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  public openEditModal(id?: number, type: PresentationItem = PresentationItem.Category): void {
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
          ? this.stateService.saveQuestion(data as Question, id)
          : this.stateService.saveCategory(data as Category, id)
      ),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  public reorderQuestions(event: CdkDragDrop<Question[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const reordered = [...(event.container.data ?? [])];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.stateService.reorderQuestions(reordered).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  public reorderCategories(event: CdkDragDrop<Category[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const reordered = [...(event.container.data ?? [])];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.stateService.reorderCategories(reordered).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  public openItem(id: number, type: PresentationItem): void {
    if (type === PresentationItem.Category) {
      this.stateService.selectCategory(id);
      return;
    }
    this.stateService.selectQuestion(id);
  }

  public clearSelection(): void {
    this.stateService.clearSelection();
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
    }).afterClosed().pipe(
      filter(Boolean),
      switchMap(() =>
        type === PresentationItem.Question
          ? this.stateService.deleteQuestion(id)
          : this.stateService.deleteCategory(id)
      ),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }
}
