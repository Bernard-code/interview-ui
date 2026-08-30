import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TodoItem } from '../components/model/todo-item.model';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private baseUrl = 'https://interview-spring-production.up.railway.app/api';
  private http = inject(HttpClient);

  public getAll(): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(`${this.baseUrl}/todos`);
  }

  public getById(todoId: number): Observable<TodoItem> {
    return this.http.get<TodoItem>(`${this.baseUrl}/todos/${todoId}`);
  }

  public create(todo: Omit<TodoItem, 'id'>): Observable<TodoItem> {
    return this.http.post<TodoItem>(`${this.baseUrl}/todos`, this.payload(todo));
  }

  public edit(todoId: number, todo: TodoItem): Observable<TodoItem> {
    return this.http.put<TodoItem>(`${this.baseUrl}/todos/${todoId}`, this.payload(todo));
  }

  public delete(todoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/todos/${todoId}`);
  }

  private payload<T extends Omit<TodoItem, 'id'>>(todo: T): T {
    return {
      ...todo,
      separator: !!todo.separator,
    };
  }
}
