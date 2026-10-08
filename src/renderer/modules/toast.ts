// ============================================================================
// Toast Notification Stack & Floating Feedback System
// ============================================================================

export class ToastManager {
  private stack: HTMLElement | null = null;
  private alertBanner: HTMLElement | null = null;
  private alertText: HTMLElement | null = null;
  private alertTimer: any = null;

  constructor() {
    this.stack = document.getElementById('toast-stack');
    this.alertBanner = document.getElementById('alert-banner');
    this.alertText = document.getElementById('alert-text');

    const alertClose = document.getElementById('alert-close');
    if (alertClose && this.alertBanner) {
      alertClose.addEventListener('click', () => {
        this.alertBanner?.classList.add('hidden');
      });
    }
  }

  public showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', durationMs: number = 3200): void {
    if (!this.stack) {
      this.stack = document.getElementById('toast-stack');
      if (!this.stack) return;
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    else if (type === 'warning') icon = '⚠️';
    else if (type === 'error') icon = '✕';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${this.escapeHtml(message)}</span>
    `;

    this.stack.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 250);
    }, durationMs);
  }

  public showAlert(message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info'): void {
    if (!this.alertBanner || !this.alertText) return;

    this.alertText.textContent = message;
    this.alertBanner.className = `alert-banner alert-${type}`;
    this.alertBanner.classList.remove('hidden');

    if (this.alertTimer) clearTimeout(this.alertTimer);
    this.alertTimer = setTimeout(() => {
      this.alertBanner?.classList.add('hidden');
    }, 6000);
  }

  public copyToClipboard(text: string, successMsg: string, triggerBtn?: HTMLElement | null): void {
    if (triggerBtn) {
      triggerBtn.classList.add('copy-success-flash');
      const originalText = triggerBtn.textContent;
      triggerBtn.textContent = '✓ تم';
      setTimeout(() => {
        triggerBtn.classList.remove('copy-success-flash');
        triggerBtn.textContent = originalText;
      }, 1200);
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(successMsg, 'success');
      }).catch(() => {
        this.showToast(`القيمة: ${text}`, 'info');
      });
    } else {
      this.showToast(`القيمة: ${text}`, 'info');
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
