import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Category, CategoryForm } from '../../model/category.model';
import { Observable, tap } from 'rxjs';
import { isNil } from '../../utils/is-nil.util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MainService } from '../../services/main.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInput,
    MatButtonModule,
  ],
})
export class CategoryFormComponent implements OnInit {
  private dialogData = inject(MAT_DIALOG_DATA);
  private dialogRef: MatDialogRef<CategoryFormComponent> = inject(MatDialogRef);
  private mainService = inject(MainService);
  public categoryForm: FormGroup<CategoryForm>;
  private destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this.categoryForm = new FormGroup({
      name: new FormControl(''),
      position: new FormControl(),
    });
    this.fillEditForm().subscribe();
  }

  public fillEditForm(): Observable<Category> {
    if (isNil(this.dialogData.id)) {
      return void 0;
    }
    return this.mainService.getCategoryById(this.dialogData.id).pipe(
      tap((category: Category) => {
        this.categoryForm.patchValue(category);
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public submitCategory(): void {
    this.dialogRef.close(this.categoryForm.value);
  }
}
