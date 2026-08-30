import { FormControl } from '@angular/forms';
import { TodoStatus } from './todo-status.model';

export interface TodoItem {
  id: number;
  position: number;
  text: string;
  status: TodoStatus;
  separator?: boolean;
}

export interface TodoItemDraft {
  text: string;
  status: TodoStatus;
  separator?: boolean;
}

export interface TodoForm {
  text: FormControl<string>;
  status: FormControl<TodoStatus>;
}

export interface TodoFormData {
  status?: TodoStatus;
  separator?: boolean;
  item?: TodoItem;
}
