import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Category, CategoryForm } from '../../model/category.model';
import { isNil } from '../../utils/is-nil.util';
import { EditModalBase } from '../../utils/edit-modal.base';
import { StateService } from '../../services/state.service';

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
  private stateService = inject(StateService);

  public categoryForm: FormGroup<CategoryForm>;
  public isEdit = false;

  public ngOnInit(): void {
    this.isEdit = !isNil(this.dialogData?.id);
    const category: Category | undefined = this.isEdit
      ? this.stateService.getCategory(this.dialogData.id)
      : undefined;
    this.categoryForm = new FormGroup({
      name: new FormControl<string>(category?.name ?? '', Validators.required),
      position: new FormControl<number>(category?.position ?? this.stateService.nextCategoryPosition()),
    });
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
