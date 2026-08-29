import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { QuestionForm } from '../../model/question.model';
import { Category } from '../../model/category.model';
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
    this.categories = this.stateService.getSortedCategories();
    this.createForm();
  }

  public createForm(): void {
    const question = this.isEdit
      ? this.stateService.getQuestion(this.dialogData.id)
      : undefined;
    this.questionForm = new FormGroup({
      name: new FormControl<string>(question?.name ?? '', Validators.required),
      answer: new FormControl<string>(question?.answer ?? ''),
      position: new FormControl<number>(question?.position ?? this.stateService.highestPosition + 1),
      category: new FormControl<number>(
        question?.category ?? this.stateService.currentCategoryId$.getValue(),
        Validators.required,
      ),
      positiveCount: new FormControl<number>(question?.positiveCount ?? 0),
      negativeCount: new FormControl<number>(question?.negativeCount ?? 0),
    });
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
      positiveCount: Number(value.positiveCount),
      negativeCount: Number(value.negativeCount),
    });
  }

  public close(): void {
    this.dialogRef.close();
  }
}
