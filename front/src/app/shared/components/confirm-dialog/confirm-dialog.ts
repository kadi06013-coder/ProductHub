import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialogComponent {
  visible = signal(false);
  config = signal<DialogConfig | null>(null);

  open(cfg: DialogConfig) {
    this.config.set(cfg);
    this.visible.set(true);
  }

  confirm() {
    this.config()?.onConfirm();
    this.close();
  }

  close() {
    this.visible.set(false);
    this.config.set(null);
  }
}
