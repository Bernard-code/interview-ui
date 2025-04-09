import { DestroyRef, Directive, HostListener, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MainService } from '../services/main.service';

@Directive({})
export abstract class EditModalBase {
  abstract submitForm(): void;

  protected dialogData = inject(MAT_DIALOG_DATA);
  protected mainService = inject(MainService);
  protected destroyRef = inject(DestroyRef);

  @HostListener('document:keydown.enter', ['$event.target'])
  pressEnterSubmit() {
    this.submitForm();
  }
}
