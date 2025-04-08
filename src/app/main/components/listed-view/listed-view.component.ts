import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MainService } from '../../services/main.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, Observable, switchMap, tap } from 'rxjs';
import { Category } from '../../model/category.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { MatButtonModule } from '@angular/material/button';
import { PresentationItem } from '../../model/presentation-item.model';
import { ListItem } from '../../model/list-item.model';
import { QuestionFormComponent } from '../question-form/question-form.component';
import { Question } from '../../model/question.model';

@Component({
  selector: 'app-listed-view',
  templateUrl: './listed-view.component.html',
  styleUrl: './listed-view.component.scss',
  imports: [
    MatButtonModule,
  ],
})
export class ListedViewComponent implements OnInit {
  private mainService = inject(MainService);
  private destroyRef = inject(DestroyRef);
  private matDialog = inject(MatDialog);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  public items: ListItem[] = [];
  public presentationItem: PresentationItem;
  public categoryId: number;

  public ngOnInit(): void {
    this.categoryId = this.activatedRoute.snapshot.params['id'];
    this.presentationItem = this.activatedRoute.snapshot.params['item'];

    this.loadItems().subscribe();
  }

  public loadItems(): Observable<Category[]> {
    const itemsToLoad = this.presentationItem === PresentationItem.Question
      ? this.mainService.getQuestions()
      : this.mainService.getCategories();
    return itemsToLoad.pipe(
      tap((listItems: ListItem[]) => {
        let questions: ListItem[] = listItems;
        if (this.presentationItem === PresentationItem.Question) {
          questions = (listItems as Question[]).filter((item: Question) => item.category === this.categoryId);
        }
        this.items = questions.sort((a, b) => a.position - b.position);
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public openEditModal(): void {
    const modal = this.presentationItem === PresentationItem.Question
      ? this.matDialog.open(QuestionFormComponent, { width: '400px' })
      : this.matDialog.open(CategoryFormComponent, { width: '400px' });
    modal
      .afterClosed().pipe(
      filter(Boolean),
      switchMap((categoryData: Category) =>
        this.mainService.createCategory(categoryData)
      ),
      switchMap(() => this.loadItems()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  public navigate(categoryId: number): void {
    this.router.navigate(['/category', categoryId]);
  }
}
