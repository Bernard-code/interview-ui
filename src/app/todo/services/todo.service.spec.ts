import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TodoStatus } from '../components/model/todo-status.model';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;
  let http: HttpTestingController;
  const baseUrl = 'https://interview-spring-production.up.railway.app/api/todos';
  const todo = {
    id: 4,
    position: 1,
    text: 'nowe zadanie',
    status: TodoStatus.TODO,
    separator: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TodoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll requests GET /todos', () => {
    service.getAll().subscribe();

    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([todo]);
  });

  it('create requests POST /todos', () => {
    const { id: _id, ...draft } = todo;
    service.create(draft).subscribe();

    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.separator).toBeFalse();
    req.flush(todo);
  });

  it('edit requests PUT /todos/:id', () => {
    service.edit(todo.id, todo).subscribe();

    const req = http.expectOne(`${baseUrl}/4`);
    expect(req.request.method).toBe('PUT');
    req.flush(todo);
  });

  it('delete requests DELETE /todos/:id', () => {
    service.delete(todo.id).subscribe();

    const req = http.expectOne(`${baseUrl}/4`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
