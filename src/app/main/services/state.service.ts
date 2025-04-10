import { inject, Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Category } from '../model/category.model';
import { Question } from '../model/question.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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

  public loadCategories(): Observable<Category[]> {
    return this.mainService.getQuestions().pipe(
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
        this.questions$.next(questions);
      }),
    );
  }

  public getNextOrPrevQuestionId(id: number, next: boolean = true): number {
    let nextQuestionIndex: number;
    const currentQuestions: Question[] = this.questions$.getValue();
    this.questions$.getValue().every((question: Question, index: number) => {
      if (question.id === id) {
        nextQuestionIndex = next ? index + 1 : index - 1;
        return false;
      }
      return true;
    });
    if (next && nextQuestionIndex === currentQuestions.length || nextQuestionIndex < 0) {
      return next ? currentQuestions[0].id : currentQuestions[currentQuestions.length - 1].id;
    }
    return currentQuestions[nextQuestionIndex].id;
  }
}
