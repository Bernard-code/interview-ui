import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { Question, QuestionForm } from '../../model/question.model';
import { Category } from '../../model/category.model';
import { Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
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
    MatFormFieldModule,
    MatInput,
    MatButtonModule,
    MatSelectModule,
    AngularEditorModule,
  ],
})
export class QuestionFormComponent extends EditModalBase implements OnInit {
  private dialogRef: MatDialogRef<QuestionFormComponent> = inject(MatDialogRef);
  private stateService = inject(StateService);

  public questionForm: FormGroup<QuestionForm>;
  public categories: Category[];
  public editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: false,
    height: '350px',
    showToolbar: false,
    placeholder: 'Answer',
    fonts: [
      {class: 'Inter', name: 'Inter'},
    ],
  };

  public ngOnInit(): void {
    this.createForm();
    this.loadCategories().subscribe();
    this.fillEditForm()?.subscribe();
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
    if (isNil(this.dialogData.id)) {
      return void 0;
    }
    return this.mainService.getQuestionById(this.dialogData.id).pipe(
      tap((question: Question) => {
        this.questionForm.patchValue(question);
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public submitForm(): void {
    this.dialogRef.close(this.questionForm.value);
  }
}
