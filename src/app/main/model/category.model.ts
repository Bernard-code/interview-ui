import { FormControl } from '@angular/forms';
import { ListItem } from './list-item.model';

export interface Category extends ListItem {
}

export interface CategoryForm {
  name: FormControl<string>;
  position: FormControl<number>;
}
