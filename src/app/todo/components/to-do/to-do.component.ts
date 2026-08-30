import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { filter, forkJoin, switchMap } from 'rxjs';
import { TodoItem, TodoItemDraft, TodoFormData } from '../model/todo-item.model';
import { TodoStatus } from '../model/todo-status.model';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { TodoService } from '../../services/todo.service';
import { DeleteConfirmComponent } from '../../../main/components/delete-confirm/delete-confirm.component';

interface TodoSection {
  status: TodoStatus;
  label: string;
  icon: string;
  items: TodoItem[];
}

const SECTION_META: { status: TodoStatus; label: string; icon: string }[] = [
  { status: TodoStatus.TODO, label: 'To do', icon: 'radio_button_unchecked' },
  { status: TodoStatus.IN_PROGRESS, label: 'In progress', icon: 'timelapse' },
  { status: TodoStatus.DONE, label: 'Done', icon: 'check_circle' },
];

function syncPositions(items: TodoItem[]): void {
  items.forEach((item, index) => {
    item.position = index + 1;
  });
}

@Component({
  selector: 'app-to-do',
  imports: [MatIconModule, CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './to-do.component.html',
  styleUrl: './to-do.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToDoComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly todoService = inject(TodoService);

  protected readonly TodoStatus = TodoStatus;
  protected doneCollapsed = false;
  protected readonly sections: TodoSection[] = SECTION_META.map((section) => ({
    ...section,
    items: [],
  }));

  public ngOnInit(): void {
    this.loadTodos();
  }

  public readonly allowEnter = (drag: CdkDrag<TodoItem>, drop: CdkDropList<TodoItem[]>) => {
    if (!drag.data?.separator) {
      return true;
    }
    const target = this.sections.find((section) => section.items === drop.data);
    return target?.status === TodoStatus.TODO;
  };

  public drop(event: CdkDragDrop<TodoItem[]>, target: TodoSection): void {
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) {
        return;
      }
      moveItemInArray(target.items, event.previousIndex, event.currentIndex);
      syncPositions(target.items);
      this.persistItems(target.items);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      target.items,
      event.previousIndex,
      event.currentIndex,
    );
    target.items[event.currentIndex].status = target.items[event.currentIndex].separator
      ? TodoStatus.TODO
      : target.status;
    syncPositions(event.previousContainer.data);
    syncPositions(target.items);
    this.persistItems(event.previousContainer.data, target.items);
  }

  public toggleDone(): void {
    this.doneCollapsed = !this.doneCollapsed;
  }

  public openCreateModal(status: TodoStatus, separator = false): void {
    this.openTodoForm({ status, separator }, (draft) => this.addItem(draft));
  }

  public openEditModal(item: TodoItem): void {
    this.openTodoForm({ item, separator: item.separator }, (draft) => this.updateItem(item, draft));
  }

  public confirmDelete(event: Event, item: TodoItem): void {
    event.stopPropagation();
    this.dialog.open(DeleteConfirmComponent, {
      width: '400px',
      data: { name: item.text || 'separator' },
      panelClass: 'app-dialog',
      backdropClass: 'app-dialog-backdrop',
    }).afterClosed().pipe(
      filter(Boolean),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.deleteItem(item));
  }

  public deleteItem(item: TodoItem): void {
    this.todoService.delete(item.id).pipe(
      switchMap(() => this.todoService.getAll()),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((items) => this.rebuildSections(items));
  }

  public addItem(draft: TodoItemDraft): void {
    const isSeparator = !!draft.separator;
    const status = isSeparator ? TodoStatus.TODO : draft.status;
    const section = this.sections.find((item) => item.status === status);
    const text = draft.text.trim();
    if (!section || (!isSeparator && !text)) {
      return;
    }

    this.todoService.create({
      text,
      status,
      position: section.items.length + 1,
      separator: isSeparator,
    }).pipe(
      switchMap(() => this.todoService.getAll()),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((items) => this.rebuildSections(items));
  }

  public updateItem(item: TodoItem, draft: TodoItemDraft): void {
    const text = draft.text.trim();
    if (!item.separator && !text) {
      return;
    }

    const status = item.separator ? TodoStatus.TODO : draft.status;
    const target = this.sections.find((section) => section.status === status);
    const position = item.status === status
      ? item.position
      : (target?.items.length ?? 0) + 1;

    this.todoService.edit(item.id, {
      ...item,
      text,
      status,
      position,
      separator: !!item.separator,
    }).pipe(
      switchMap(() => this.todoService.getAll()),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((items) => this.rebuildSections(items));
  }

  protected taskCount(section: TodoSection): number {
    return section.items.filter((item) => !item.separator).length;
  }

  protected taskNumber(section: TodoSection, index: number): number {
    return section.items.slice(0, index + 1).filter((item) => !item.separator).length;
  }

  protected isDoneCollapsed(section: TodoSection): boolean {
    return section.status === TodoStatus.DONE && this.doneCollapsed;
  }

  private loadTodos(): void {
    this.todoService.getAll().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (items) => this.rebuildSections(items),
      error: () => this.rebuildSections([]),
    });
  }

  private persistItems(...lists: TodoItem[][]): void {
    const items = lists.flat();
    if (!items.length) {
      return;
    }
    forkJoin(items.map((item) => this.todoService.edit(item.id, item))).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  private rebuildSections(items: TodoItem[]): void {
    for (const section of this.sections) {
      section.items = items
        .filter((item) => item.status === section.status)
        .filter((item) => section.status === TodoStatus.TODO || !item.separator)
        .sort((a, b) => a.position - b.position);
    }
    this.cdr.markForCheck();
  }

  private openTodoForm(data: TodoFormData, onSave: (draft: TodoItemDraft) => void): void {
    this.dialog.open(TodoFormComponent, {
      width: '420px',
      data,
      panelClass: 'app-dialog',
      backdropClass: 'app-dialog-backdrop',
    }).afterClosed().pipe(
      filter((draft: TodoItemDraft | undefined): draft is TodoItemDraft =>
        !!draft && (!!draft.separator || !!draft.text)
      ),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(onSave);
  }
}
