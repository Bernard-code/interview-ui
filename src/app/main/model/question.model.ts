import { FormControl } from '@angular/forms';
import { ListItem } from './list-item.model';

export type AnswerMark = 'good' | 'bad';

export interface Question extends ListItem {
  answer: string;
  category: number;
  positiveCount: number;
  negativeCount: number;
}

export interface QuestionForm {
  name: FormControl<string>;
  answer: FormControl<string>;
  position: FormControl<number>;
  category: FormControl<number>;
  positiveCount: FormControl<number>;
  negativeCount: FormControl<number>;
}
