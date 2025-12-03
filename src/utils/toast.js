import { useToast } from 'primevue/usetoast';

export class ToastService {
  constructor() {
    this.toast = null;
  }

  init() {
    this.toast = useToast();
  }

  success(summary, detail, life = 3000) {
    this.showToast('success', summary, detail, life);
  }

  error(summary, detail, life = 3000) {
    this.showToast('error', summary, detail, life);
  }

  warn(summary, detail, life = 3000) {
    this.showToast('warn', summary, detail, life);
  }

  info(summary, detail, life = 3000) {
    this.showToast('info', summary, detail, life);
  }

  showToast(severity, summary, detail, life) {
    if (!this.toast) {
      console.warn('Toast not initialized. Call init() first.');
      return;
    }
    
    this.toast.add({
      severity,
      summary,
      detail,
      life,
    });
  }
}

export const toast = new ToastService();