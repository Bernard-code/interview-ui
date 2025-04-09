import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../model/category.model';
import { Question } from '../model/question.model';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  private baseUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);

  public getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  public getCategoryById(categoryId: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/categories/${categoryId}`);
  }

  public createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, category);
  }

  public editCategory(categoryId: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/categories/${categoryId}`, category);
  }

  public deleteCategory(categoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categories/${categoryId}`);
  }

  public getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/questions`);
  }

  public getQuestionById(questionId: number): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/questions/${questionId}`);
  }

  public createQuestion(question: Question): Observable<Question> {
    return this.http.post<Question>(`${this.baseUrl}/questions`, question);
  }

  public editQuestion(questionId: number, question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.baseUrl}/questions/${questionId}`, question);
  }

  public deleteQuestion(questionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/questions/${questionId}`);
  }
}
