import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Question, QuestionForm } from '../../model/question.model';
import { Category } from '../../model/category.model';
import { Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isNil } from '../../utils/is-nil.util';
import { EditModalBase } from '../../utils/edit-modal.base';
import { StateService } from '../../services/state.service';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrl: './question-form.component.scss',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    AngularEditorModule,
  ],
})
export class QuestionFormComponent extends EditModalBase implements OnInit {
  private dialogRef: MatDialogRef<QuestionFormComponent> = inject(MatDialogRef);
  private stateService = inject(StateService);

  public questionForm: FormGroup<QuestionForm>;
  public categories: Category[] = [];
  public isEdit = false;
  public editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: false,
    height: '200px',
    minHeight: '200px',
    showToolbar: false,
    placeholder: 'Write the answer…',
    fonts: [
      { class: 'Inter', name: 'Inter' },
    ],
  };

  public ngOnInit(): void {
    this.isEdit = !isNil(this.dialogData?.id);
    this.createForm();
    this.loadCategories().subscribe();
    if (this.isEdit) {
      this.fillEditForm().subscribe();
    }
  }

  public createForm(): void {
    this.questionForm = new FormGroup({
      name: new FormControl<string>('', Validators.required),
      answer: new FormControl<string>(''),
      position: new FormControl<number>(this.stateService.highestPosition + 1),
      category: new FormControl<number>(this.stateService.currentCategoryId$.getValue(), Validators.required),
    });
  }

  public loadCategories(): Observable<Category[]> {
    return this.mainService.getCategories().pipe(
      tap((categories: Category[]) => {
        this.categories = categories.sort((a, b) => a.position - b.position);
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public fillEditForm(): Observable<Question> {
    return this.mainService.getQuestionById(this.dialogData.id).pipe(
      tap((question: Question) => {
        this.questionForm.patchValue(question);
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public override pressEnterSubmit(target?: EventTarget): void {
    if (target instanceof HTMLElement && target.closest('.text-editor, textarea, [contenteditable]')) {
      return;
    }
    this.submitForm();
  }

  public submitForm(): void {
    if (!this.questionForm?.valid) {
      return;
    }
    const value = this.questionForm.getRawValue();
    this.dialogRef.close({
      ...value,
      category: Number(value.category),
      position: Number(value.position),
    });
  }

  public close(): void {
    this.dialogRef.close();
  }
}
