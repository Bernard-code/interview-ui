import { inject, Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Category } from '../model/category.model';
import { Question } from '../model/question.model';
import { BehaviorSubject, merge, Observable, tap } from 'rxjs';
import { isNil } from '../utils/is-nil.util';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private mainService = inject(MainService);

  public categories$: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
  public questions$: BehaviorSubject<Question[]> = new BehaviorSubject<Question[]>([]);
  public currentCategoryId$: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public currentQuestionId$: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public highestPosition: number;

  public loadData(): Observable<any> {
    return merge(this.loadCategories(), this.loadQuestions());
  }

  public loadCategories(): Observable<Category[]> {
    return this.mainService.getCategories().pipe(
      tap((categories: Category[]) => {
        this.categories$.next(categories.sort((a, b) => a.position - b.position));
      }),
    );
  }

  public loadQuestions(categoryId?: number): Observable<Question[]> {
    return this.mainService.getQuestions().pipe(
      tap((data: Question[]) => {
        let questions: Question[] = data;
        if (!isNil(categoryId)) {
          questions = data.filter((item: Question) =>
            Number(item.category) === Number(categoryId)
          );
        }
        questions = questions.sort((a, b) => a.position - b.position);
        this.highestPosition = questions[questions.length - 1]?.position ?? 0;
        this.questions$.next(questions);
      }),
    );
  }

  public getNextOrPrevQuestionId(id: number, next: boolean = true): number | null {
    const categoryId = this.currentCategoryId$.getValue();
    const currentQuestions: Question[] = this.questions$.getValue()
      .filter((question: Question) => isNil(categoryId) || Number(question.category) === Number(categoryId))
      .sort((a, b) => a.position - b.position);

    if (!currentQuestions.length) {
      return null;
    }

    const currentIndex = currentQuestions.findIndex((question: Question) => question.id === id);
    if (currentIndex === -1) {
      return currentQuestions[0].id;
    }

    const nextIndex = next ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= currentQuestions.length) {
      return currentQuestions[0].id;
    }
    if (nextIndex < 0) {
      return currentQuestions[currentQuestions.length - 1].id;
    }
    return currentQuestions[nextIndex].id;
  }
}
