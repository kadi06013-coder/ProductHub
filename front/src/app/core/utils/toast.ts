import { DestroyRef, inject, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface Toast {
  message: string;
  type: ToastType;
}

/**
 * Small toast state holder. Call it from a field initializer (injection context):
 *   private readonly toaster = createToast();
 *   toast = this.toaster.toast;
 * The timer is cleared automatically when the component is destroyed.
 */
export function createToast(durationMs = 3500) {
  const destroyRef = inject(DestroyRef);
  const toast = signal<Toast | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;

  destroyRef.onDestroy(() => clearTimeout(timer));

  const show = (message: string, type: ToastType): void => {
    clearTimeout(timer);
    toast.set({ message, type });
    timer = setTimeout(() => toast.set(null), durationMs);
  };

  return { toast, show };
}
