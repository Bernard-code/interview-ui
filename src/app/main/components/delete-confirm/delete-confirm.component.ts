import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-delete-confirm',
  imports: [
    MatButtonModule,
    MatDialogClose,
  ],
  templateUrl: './delete-confirm.component.html',
  styleUrl: './delete-confirm.component.scss'
})
export class DeleteConfirmComponent {
  private dialogRef: MatDialogRef<DeleteConfirmComponent> = inject(MatDialogRef);

  public data = inject(MAT_DIALOG_DATA);

  public confirm(): void {
    this.dialogRef.close(true);
  }
}
