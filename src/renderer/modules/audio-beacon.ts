// ============================================================================
// Audio Signal Beacon & Antenna Alignment Tool
// ============================================================================

export class AudioBeaconManager {
  private audioCtx: AudioContext | null = null;
  private beeperActive: boolean = false;
  private lastBeepTime: number = 0;
  private beeperGainLevel: number = 0.12;

  // DOM Elements
  private btnToggleBeeperText: HTMLElement | null = null;
  private beeperStatusText: HTMLElement | null = null;
  private beeperRsrpDisplay: HTMLElement | null = null;
  private beeperMeterFill: HTMLElement | null = null;
  private beeperEq: HTMLElement | null = null;
  private onToast?: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;

  constructor(options?: {
    onToast?: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  }) {
    this.onToast = options?.onToast;
    this.initElements();
  }

  private initElements(): void {
    this.btnToggleBeeperText = document.getElementById('btn-toggle-beeper-text');
    this.beeperStatusText = document.getElementById('beeper-status-text');
    this.beeperRsrpDisplay = document.getElementById('beeper-rsrp-display');
    this.beeperMeterFill = document.getElementById('beeper-meter-fill');
    this.beeperEq = document.getElementById('beeper-eq');

    const volumeSlider = document.getElementById('beeper-volume') as HTMLInputElement | null;
    if (volumeSlider) {
      volumeSlider.addEventListener('input', () => {
        this.beeperGainLevel = (parseFloat(volumeSlider.value) / 100) * 0.25;
      });
    }

    const volBtns = document.querySelectorAll('.beeper-vol-btn') as NodeListOf<HTMLButtonElement>;
    if (volBtns && volBtns.length > 0) {
      volBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          volBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const vol = btn.getAttribute('data-vol');
          if (vol === 'low') this.beeperGainLevel = 0.04;
          else if (vol === 'high') this.beeperGainLevel = 0.28;
          else this.beeperGainLevel = 0.12;

          if (this.beeperActive) this.playBeep(750, 100);
        });
      });
    }
  }

  public isActive(): boolean {
    return this.beeperActive;
  }

  public toggle(): void {
    this.beeperActive = !this.beeperActive;
    if (this.beeperActive) {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (this.btnToggleBeeperText) this.btnToggleBeeperText.textContent = 'إيقاف التوجيه الصوتي 🔊';
      if (this.beeperStatusText) this.beeperStatusText.textContent = 'التوجيه الصوتي نشط 🟢';
      if (this.beeperEq) this.beeperEq.classList.add('active');
      this.playBeep(600, 150);
      if (this.onToast) {
        this.onToast('تم تفعيل التوجيه الصوتي! يمكنك الآن تحريك الراوتر للاستماع للنغمة الأوضح والأعلى.', 'info');
      }
    } else {
      if (this.btnToggleBeeperText) this.btnToggleBeeperText.textContent = 'تشغيل التوجيه الصوتي 🔈';
      if (this.beeperStatusText) this.beeperStatusText.textContent = 'التوجيه الصوتي متوقف';
      if (this.beeperEq) this.beeperEq.classList.remove('active');
    }
  }

  public update(rsrpVal?: string | null): void {
    if (!rsrpVal || rsrpVal === 'غير متوفرة') {
      if (this.beeperRsrpDisplay) this.beeperRsrpDisplay.textContent = '-- dBm';
      if (this.beeperMeterFill) this.beeperMeterFill.style.width = '0%';
      return;
    }

    const num = parseFloat(rsrpVal);
    if (isNaN(num)) return;

    if (this.beeperRsrpDisplay) this.beeperRsrpDisplay.textContent = `${num} dBm`;

    // Map RSRP from -125 dBm (poor, 0%) to -65 dBm (excellent, 100%)
    const pct = Math.min(Math.max(Math.round(((num - (-125)) / ((-65) - (-125))) * 100), 2), 100);
    if (this.beeperMeterFill) {
      this.beeperMeterFill.style.width = `${pct}%`;
    }

    if (this.beeperActive && this.audioCtx) {
      const now = Date.now();
      // Rate limit beeps to every 350ms - 1200ms depending on quality
      const intervalMs = Math.max(1200 - (pct * 6), 350);
      if (now - this.lastBeepTime >= intervalMs) {
        this.lastBeepTime = now;
        // Pitch mapping from 380Hz to 1100Hz
        const freq = 380 + (pct * 7.2);
        this.playBeep(freq, 80);
      }
    }
  }

  private playBeep(freq: number, durationMs: number): void {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      const gainLevel = this.beeperGainLevel || 0.12;
      gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainLevel, this.audioCtx.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + (durationMs / 1000));
    } catch {
      // Audio playback suspended or not supported
    }
  }
}
