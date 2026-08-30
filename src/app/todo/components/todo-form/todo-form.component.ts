import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TodoForm, TodoFormData } from '../model/todo-item.model';
import { TodoStatus } from '../model/todo-status.model';

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.scss',
  imports: [ReactiveFormsModule, MatIconModule],
})
export class TodoFormComponent {
  private dialogRef = inject(MatDialogRef<TodoFormComponent>);
  private dialogData = inject<TodoFormData>(MAT_DIALOG_DATA, { optional: true });

  protected readonly isEdit = !!this.dialogData?.item;
  protected readonly isSeparator = !!(this.dialogData?.item?.separator ?? this.dialogData?.separator);
  protected readonly statuses = [
    { value: TodoStatus.TODO, label: 'To do' },
    { value: TodoStatus.IN_PROGRESS, label: 'In progress' },
    { value: TodoStatus.DONE, label: 'Done' },
  ];

  protected readonly todoForm = new FormGroup<TodoForm>({
    text: new FormControl(this.dialogData?.item?.text ?? '', {
      nonNullable: true,
      validators: this.isSeparator ? [] : [Validators.required],
    }),
    status: new FormControl(
      this.dialogData?.item?.status ?? this.dialogData?.status ?? TodoStatus.TODO,
      {
        nonNullable: true,
        validators: Validators.required,
      },
    ),
  });

  protected get title(): string {
    if (this.isSeparator) {
      return this.isEdit ? 'Edit separator' : 'New separator';
    }
    return this.isEdit ? 'Edit todo' : 'New todo';
  }

  public submitForm(): void {
    if (!this.isSeparator && !this.todoForm.valid) {
      return;
    }
    const text = this.todoForm.controls.text.value.trim();
    if (!this.isSeparator && !text) {
      return;
    }
    this.dialogRef.close({
      text,
      status: this.isSeparator ? TodoStatus.TODO : this.todoForm.controls.status.value,
      separator: this.isSeparator,
    });
  }

  public close(): void {
    this.dialogRef.close();
  }
}
