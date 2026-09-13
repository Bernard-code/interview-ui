import { AfterViewInit, Component, ElementRef, forwardRef, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-answer-editor',
  standalone: true,
  templateUrl: './answer-editor.component.html',
  styleUrl: './answer-editor.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AnswerEditorComponent),
      multi: true,
    },
  ],
})
export class AnswerEditorComponent implements ControlValueAccessor, AfterViewInit {
  private surface = viewChild<ElementRef<HTMLElement>>('surface');
  private pendingHtml = '';
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  public ngAfterViewInit(): void {
    this.setHtml(this.pendingHtml);
  }

  public writeValue(value: string): void {
    const html = value ?? '';
    this.pendingHtml = html;
    this.setHtml(html);
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public onInput(): void {
    const surface = this.surface()?.nativeElement;
    if (!surface) {
      return;
    }
    this.pendingHtml = surface.innerHTML;
    this.onChange(surface.innerHTML);
  }

  public onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    event.preventDefault();
    document.execCommand('insertText', false, '\t');
    this.onInput();
  }

  public markTouched(): void {
    this.onTouched();
  }

  private setHtml(html: string): void {
    const surface = this.surface()?.nativeElement;
    if (!surface || surface.innerHTML === html) {
      return;
    }
    surface.innerHTML = html;
  }
}
