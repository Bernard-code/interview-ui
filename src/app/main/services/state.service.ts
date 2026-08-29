import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, map, Observable, switchMap, tap } from 'rxjs';
import { MainService } from './main.service';
import { Category } from '../model/category.model';
import { Question } from '../model/question.model';
import { ListItem } from '../model/list-item.model';
import { isNil } from '../utils/is-nil.util';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private mainService = inject(MainService);

  public categories$ = new BehaviorSubject<Category[]>([]);
  public questions$ = new BehaviorSubject<Question[]>([]);
  public currentCategoryId$ = new BehaviorSubject<number | null>(null);
  public currentQuestionId$ = new BehaviorSubject<number | null>(null);

  public sortedCategories$: Observable<Category[]> = this.categories$.pipe(
    map((categories: Category[]) => this.sortByPosition(categories)),
  );

  public questionsInCategory$: Observable<Question[]> = combineLatest([
    this.questions$,
    this.currentCategoryId$,
  ]).pipe(
    map(([questions, categoryId]) => this.questionsInCategory(categoryId, questions)),
  );

  public selectedCategory$: Observable<Category | undefined> = combineLatest([
    this.sortedCategories$,
    this.currentCategoryId$,
  ]).pipe(
    map(([categories, id]) => categories.find((category: Category) => category.id === id)),
  );

  public selectedQuestion$: Observable<Question | undefined> = combineLatest([
    this.questions$,
    this.currentQuestionId$,
  ]).pipe(
    map(([questions, id]) => questions.find((question: Question) => question.id === id)),
  );

  public get highestPosition(): number {
    return this.questionsInCategory().at(-1)?.position ?? 0;
  }

  public loadData(): Observable<[Category[], Question[]]> {
    return forkJoin([this.loadCategories(), this.loadQuestions()]);
  }

  public loadCategories(): Observable<Category[]> {
    return this.mainService.getCategories().pipe(
      tap((categories: Category[]) => {
        this.categories$.next(this.sortByPosition(categories));
      }),
    );
  }

  public loadQuestions(): Observable<Question[]> {
    return this.mainService.getQuestions().pipe(
      tap((questions: Question[]) => {
        this.questions$.next(this.sortByPosition(questions));
      }),
    );
  }

  public selectCategory(id: number): void {
    this.currentCategoryId$.next(id);
    this.currentQuestionId$.next(this.questionsInCategory(id)[0]?.id ?? null);
  }

  public selectQuestion(id: number): void {
    this.currentQuestionId$.next(id);
  }

  public clearSelection(): void {
    this.currentCategoryId$.next(null);
    this.currentQuestionId$.next(null);
  }

  public selectNextQuestion(next: boolean = true): void {
    const nextId = this.getNextOrPrevQuestionId(this.currentQuestionId$.getValue(), next);
    if (!isNil(nextId)) {
      this.currentQuestionId$.next(nextId);
    }
  }

  public saveCategory(data: Partial<Category>, id?: number): Observable<[Category[], Question[]]> {
    const request = isNil(id)
      ? this.mainService.createCategory(data as Category)
      : this.mainService.editCategory(id, data as Category);
    return request.pipe(switchMap(() => this.loadData()));
  }

  public saveQuestion(data: Partial<Question>, id?: number): Observable<[Category[], Question[]]> {
    const request = isNil(id)
      ? this.mainService.createQuestion(data as Question)
      : this.mainService.editQuestion(id, data as Question);
    return request.pipe(switchMap(() => this.loadData()));
  }

  public deleteCategory(id: number): Observable<[Category[], Question[]]> {
    return this.mainService.deleteCategory(id).pipe(
      tap(() => {
        if (this.currentCategoryId$.getValue() === id) {
          this.clearSelection();
        }
      }),
      switchMap(() => this.loadData()),
    );
  }

  public deleteQuestion(id: number): Observable<[Category[], Question[]]> {
    return this.mainService.deleteQuestion(id).pipe(
      tap(() => {
        if (this.currentQuestionId$.getValue() === id) {
          this.currentQuestionId$.next(null);
        }
      }),
      switchMap(() => this.loadData()),
    );
  }

  public reorderCategories(ordered: Category[]): Observable<[Category[], Question[]]> {
    return this.persistReorder(
      ordered,
      this.categories$,
      (category: Category) => this.mainService.editCategory(category.id, category),
    );
  }

  public reorderQuestions(ordered: Question[]): Observable<[Category[], Question[]]> {
    return this.persistReorder(
      ordered,
      this.questions$,
      (question: Question) => this.mainService.editQuestion(question.id, question),
    );
  }

  public getSortedCategories(): Category[] {
    return this.sortByPosition(this.categories$.getValue());
  }

  public getCategory(id: number): Category | undefined {
    return this.categories$.getValue().find((category: Category) => category.id === id);
  }

  public getQuestion(id: number): Question | undefined {
    return this.questions$.getValue().find((question: Question) => question.id === id);
  }

  public nextCategoryPosition(): number {
    return (this.getSortedCategories().at(-1)?.position ?? 0) + 1;
  }

  public questionsInCategory(
    categoryId: number | null = this.currentCategoryId$.getValue(),
    questions: Question[] = this.questions$.getValue(),
  ): Question[] {
    if (isNil(categoryId)) {
      return [];
    }
    return this.sortByPosition(
      questions.filter((question: Question) => Number(question.category) === Number(categoryId)),
    );
  }

  public getNextOrPrevQuestionId(id: number, next: boolean = true): number | null {
    const currentQuestions = this.questionsInCategory();
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

  private persistReorder<T extends ListItem>(
    ordered: T[],
    subject: BehaviorSubject<T[]>,
    save: (item: T) => Observable<unknown>,
  ): Observable<[Category[], Question[]]> {
    const original = subject.getValue();
    const updates = ordered
      .map((item: T, index: number) => ({ ...item, position: index + 1 }))
      .filter((item: T) => {
        const previous = original.find((entry: T) => entry.id === item.id);
        return previous?.position !== item.position;
      });

    if (!updates.length) {
      return EMPTY;
    }

    const updatedById = new Map(updates.map((item: T) => [item.id, item]));
    subject.next(original.map((item: T) => updatedById.get(item.id) ?? item));

    return forkJoin(updates.map((item: T) => save(item))).pipe(
      switchMap(() => this.loadData()),
    );
  }

  private sortByPosition<T extends ListItem>(items: T[]): T[] {
    return [...items].sort((a, b) => a.position - b.position);
  }
}
