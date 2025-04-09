import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Question, QuestionForm } from '../../model/question.model';
import { Category } from '../../model/category.model';
import { MainService } from '../../services/main.service';
import { Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
import { isNil } from '../../utils/is-nil.util';

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
  ],
})
export class QuestionFormComponent implements OnInit {
  private dialogData = inject(MAT_DIALOG_DATA);
  private dialogRef: MatDialogRef<QuestionFormComponent> = inject(MatDialogRef);
  private mainService = inject(MainService);
  private destroyRef = inject(DestroyRef);

  public questionForm: FormGroup<QuestionForm>;
  public categories: Category[];

  public ngOnInit(): void {
    this.createForm();
    this.loadCategories().subscribe();
    this.fillEditForm();
  }

  public createForm(): void {
    this.questionForm = new FormGroup({
      name: new FormControl<string>(''),
      answer: new FormControl<string>(''),
      position: new FormControl<number>(null),
      category: new FormControl<number>(null),
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

  public fillEditForm(): void {
    if (isNil(this.dialogData.id)) {
      return;
    }
    this.mainService.getQuestionById(this.dialogData.id).pipe(
      tap((question: Question) => {
        this.questionForm.patchValue(question);
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public submitQuestion(): void {
    this.dialogRef.close(this.questionForm.value);
  }
}
