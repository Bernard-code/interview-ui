import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
  ],
})
export class CategoryFormComponent extends EditModalBase implements OnInit {
  private dialogRef: MatDialogRef<CategoryFormComponent> = inject(MatDialogRef);

  public categoryForm: FormGroup<CategoryForm>;
  public isEdit = false;

  public ngOnInit(): void {
    this.isEdit = !isNil(this.dialogData?.id);
    this.categoryForm = new FormGroup({
      name: new FormControl<string>('', Validators.required),
      position: new FormControl<number>(null),
    });
    if (this.isEdit) {
      this.fillEditForm().subscribe();
    }
  }

  public fillEditForm(): Observable<Category> {
    return this.mainService.getCategoryById(this.dialogData.id).pipe(
      tap((category: Category) => {
        this.categoryForm.patchValue(category);
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public submitForm(): void {
    if (!this.categoryForm?.valid) {
      return;
    }
    this.dialogRef.close(this.categoryForm.value);
  }

  public close(): void {
    this.dialogRef.close();
  }
}
