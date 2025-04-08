import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CategoryForm } from '../../model/category.model';

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
  private dialogRef: MatDialogRef<CategoryFormComponent> = inject(MatDialogRef);
  public categoryForm: FormGroup<CategoryForm>;

  public ngOnInit(): void {
    this.categoryForm = new FormGroup({
      name: new FormControl(''),
      position: new FormControl(),
    });
  }

  public submitCategory(): void {
    this.dialogRef.close(this.categoryForm.value);
  }
}
