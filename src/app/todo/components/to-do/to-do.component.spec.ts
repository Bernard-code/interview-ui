import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { TodoItem } from '../model/todo-item.model';
import { TodoStatus } from '../model/todo-status.model';
import { TodoService } from '../../services/todo.service';
import { ToDoComponent } from './to-do.component';

const SEED: TodoItem[] = [
  { id: 1, position: 1, text: 'stworzyc bardziej zaawansowane todo', status: TodoStatus.IN_PROGRESS },
  { id: 2, position: 1, text: 'wyroznione pytania np 5 pierwszych, nad ktorymi pracuje aktualnie', status: TodoStatus.TODO },
  { id: 3, position: 2, text: 'stworzyc cos jak jire, do nauki programowania, dodac trakowanie codewarsow przez apke', status: TodoStatus.TODO },
  { id: 4, position: 1, text: 'deploy apki', status: TodoStatus.DONE },
];

describe('ToDoComponent', () => {
  let component: ToDoComponent;
  let fixture: ComponentFixture<ToDoComponent>;
  let todoService: jasmine.SpyObj<TodoService>;
  let items: TodoItem[];

  beforeEach(async () => {
    items = SEED.map((item) => ({ ...item }));
    todoService = jasmine.createSpyObj('TodoService', ['getAll', 'create', 'edit', 'delete']);
    todoService.getAll.and.callFake(() => of(items));
    todoService.create.and.callFake((draft) => {
      const created = { id: 99, ...draft };
      items = [...items, created];
      return of(created);
    });
    todoService.edit.and.callFake((_id, item) => of(item));
    todoService.delete.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [ToDoComponent],
      providers: [
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(undefined) }) } },
        { provide: TodoService, useValue: todoService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToDoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list todo items grouped by status', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.section').length).toBe(3);
    expect(compiled.textContent).toContain('stworzyc bardziej zaawansowane todo');
    expect(compiled.textContent).toContain('deploy apki');
  });

  it('should reorder an item within the same status', () => {
    const section = component.sections[0];
    const [first, second] = section.items;
    const container = { data: section.items };

    component.drop({
      previousContainer: container,
      container,
      previousIndex: 0,
      currentIndex: 1,
    } as CdkDragDrop<TodoItem[]>, section);

    expect(section.items[0]).toBe(second);
    expect(section.items[1]).toBe(first);
    expect(section.items[0].position).toBe(1);
    expect(section.items[1].position).toBe(2);
    expect(todoService.edit).toHaveBeenCalled();
  });

  it('should hide done items when the list is collapsed', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    component.toggleDone();
    fixture.detectChanges();

    const doneSection = compiled.querySelector('[data-status="DONE"]') as HTMLElement;
    expect(doneSection.classList.contains('collapsed')).toBeTrue();
    expect(doneSection.textContent).not.toContain('deploy apki');
    expect(doneSection.querySelector('[aria-expanded="false"]')).toBeTruthy();
  });

  it('should change status when dropped into another list', () => {
    const from = component.sections[0];
    const to = component.sections[2];
    const item = from.items[0];

    component.drop({
      previousContainer: { data: from.items },
      container: { data: to.items },
      previousIndex: 0,
      currentIndex: 0,
    } as CdkDragDrop<TodoItem[]>, to);

    expect(item.status).toBe(TodoStatus.DONE);
    expect(to.items[0]).toBe(item);
    expect(from.items).not.toContain(item);
    expect(item.position).toBe(1);
  });

  it('should add a new item to the matching status list', () => {
    const todoSection = component.sections[0];
    const count = todoSection.items.length;

    component.addItem({ text: 'nowe zadanie', status: TodoStatus.TODO });

    expect(todoService.create).toHaveBeenCalled();
    expect(todoSection.items.length).toBe(count + 1);
    expect(todoSection.items.at(-1)?.text).toBe('nowe zadanie');
    expect(todoSection.items.at(-1)?.status).toBe(TodoStatus.TODO);
  });

  it('should add a separator only to the todo column', () => {
    const todoSection = component.sections[0];
    const progressSection = component.sections[1];

    component.addItem({ text: 'Sprint 1', status: TodoStatus.IN_PROGRESS, separator: true });

    expect(todoSection.items.at(-1)).toEqual(jasmine.objectContaining({
      text: 'Sprint 1',
      status: TodoStatus.TODO,
      separator: true,
    }));
    expect(progressSection.items.some((item) => item.separator)).toBeFalse();
  });

  it('should update todo text and move it when status changes', () => {
    const todoSection = component.sections[0];
    const doneSection = component.sections[2];
    const item = todoSection.items[0];

    todoService.edit.and.callFake((_id, updated) => {
      items = items.map((current) => current.id === updated.id ? updated : current);
      return of(updated);
    });

    component.updateItem(item, { text: 'zaktualizowane', status: TodoStatus.DONE });

    expect(todoService.edit).toHaveBeenCalled();
    expect(todoSection.items.some((current) => current.id === item.id)).toBeFalse();
    expect(doneSection.items.at(-1)?.text).toBe('zaktualizowane');
  });

  it('should reject dropping a separator into another column', () => {
    const todoSection = component.sections[0];
    component.addItem({ text: 'Group', status: TodoStatus.TODO, separator: true });
    const separator = todoSection.items.at(-1)!;
    const doneList = { data: component.sections[2].items } as CdkDropList<TodoItem[]>;
    const drag = { data: separator } as CdkDrag<TodoItem>;

    expect(component.allowEnter(drag, doneList)).toBeFalse();
    expect(component.allowEnter(drag, { data: todoSection.items } as CdkDropList<TodoItem[]>)).toBeTrue();
  });

  it('should delete an item after confirmation', () => {
    const item = component.sections[0].items[0];
    items = items.filter((current) => current.id !== item.id);

    component.deleteItem(item);

    expect(todoService.delete).toHaveBeenCalledWith(item.id);
    expect(component.sections[0].items.some((current) => current.id === item.id)).toBeFalse();
  });
});
