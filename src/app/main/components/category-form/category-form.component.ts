import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Category, CategoryForm } from '../../model/category.model';
import { Observable, tap } from 'rxjs';
import { isNil } from '../../utils/is-nil.util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EditModalBase } from '../../utils/edit-modal.base';

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
export class CategoryFormComponent extends EditModalBase implements OnInit {
  private dialogRef: MatDialogRef<CategoryFormComponent> = inject(MatDialogRef);

  public categoryForm: FormGroup<CategoryForm>;

  public ngOnInit(): void {
    this.categoryForm = new FormGroup({
      name: new FormControl<string>('', Validators.required),
      position: new FormControl<number>(null),
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

  public submitForm(): void {
    this.dialogRef.close(this.categoryForm.value);
  }
}
