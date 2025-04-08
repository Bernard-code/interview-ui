import { FormControl } from '@angular/forms';
import { ListItem } from './list-item.model';

export interface Question extends ListItem {
  answer: string;
  category: number;
}

export interface QuestionForm {
  name: FormControl<string>;
  answer: FormControl<string>;
  position: FormControl<number>;
  category: FormControl<number>;
}
