import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MainService } from '../../services/main.service';
import { MatDialog } from '@angular/material/dialog';
import { filter, Observable, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { Category } from '../../model/category.model';
import { isNil } from '../../utils/is-nil.util';
import { DeleteConfirmComponent } from '../delete-confirm/delete-confirm.component';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { MatList, MatListItem } from '@angular/material/list';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-categories-list',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatList,
    MatListItem,
    RouterOutlet,
  ],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss'
})
export class CategoriesListComponent implements OnInit {
  private mainService = inject(MainService);
  private destroyRef = inject(DestroyRef);
  private matDialog = inject(MatDialog);
  private router = inject(Router);

  public categories: Category[] = [];

  public ngOnInit(): void {
    this.loadCategories().subscribe();
  }

  public loadCategories(): Observable<Category[]> {
    return this.mainService.getCategories().pipe(
      tap((categories: Category[]) => {
        this.categories = categories.sort((a, b) => a.position - b.position);
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public openEditModal(id?: number): void {
    this.matDialog.open(CategoryFormComponent, { width: '400px', data: { id } })
      .afterClosed().pipe(
      filter(Boolean),
      switchMap((category: Category) =>
        isNil(id)
          ? this.mainService.createCategory(category)
          : this.mainService.editCategory(id, category as Category)
      ),
      switchMap(() => this.loadCategories()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  public openCategory(id: number): void {
    this.router.navigate([`/categories/${id}`]);
  }

  public deleteItem(id: number, name: string): void {
    this.matDialog.open(DeleteConfirmComponent, { width: '400px', data: { name } })
      .afterClosed().pipe(
        filter(Boolean),
        switchMap(() => this.mainService.deleteCategory(id)),
        switchMap(() => this.loadCategories()),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe();
  }
}
