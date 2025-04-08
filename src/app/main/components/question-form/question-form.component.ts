import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { QuestionForm } from '../../model/question.model';
import { Category } from '../../model/category.model';
import { MainService } from '../../services/main.service';
import { Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';

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
  private dialogRef: MatDialogRef<QuestionFormComponent> = inject(MatDialogRef);
  private mainService = inject(MainService);
  private destroyRef = inject(DestroyRef);

  public questionForm: FormGroup<QuestionForm>;
  public categories: Category[];

  public ngOnInit(): void {
    this.createForm();
    this.loadCategories().subscribe();
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
      tap((data: Category[]) => {
        this.categories = data.sort((a, b) => a.position - b.position);
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public submitQuestion(): void {
    this.dialogRef.close(this.questionForm.value);
  }
}
