/**
 * Afya Medicare - External Hardware Barcode & QR Scanner Service
 * 
 * Connects physical handheld USB / Bluetooth barcode and QR code scanners
 * (Zebra, Honeywell, Netum, Eyoyo, Sunmi, Datalogic, etc.) to the applet.
 * 
 * Physical scanners act as HID Keyboard Wedge devices. When an Afya card QR
 * code or barcode is scanned, the scanner inputs characters rapidly (< 50ms per key)
 * and sends an 'Enter' keypress.
 */

type ScanCallback = (scannedCode: string) => void;

class HardwareScannerService {
  private listeners: Set<ScanCallback> = new Set();
  private buffer: string = '';
  private lastKeyTime: number = 0;
  private maxInterKeyDelayMs: number = 55; // Hardware scanners type under 30-50ms
  private minCodeLength: number = 4;
  private isListening: boolean = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  public init(): () => void {
    if (typeof window === 'undefined') return () => {};

    if (!this.isListening) {
      window.addEventListener('keydown', this.handleKeyDown, true);
      this.isListening = true;
    }

    return () => {
      // Return cleanup function
    };
  }

  public addListener(callback: ScanCallback): () => void {
    this.listeners.add(callback);
    this.init();

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Synthesize standard POS / medical scanner confirmation beep
   */
  public playBeep(success: boolean = true) {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }

      if (!this.audioContext) return;
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (success) {
        // High dual chime: 1300Hz -> 1800Hz
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1300, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.start(now);
        osc.stop(now + 0.12);
      } else {
        // Low error buzz: 350Hz -> 200Hz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.2);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // Audio playback failed or blocked by browser policy
    }
  }

  public static sanitizeScannedCode(raw: string): string {
    let clean = raw.trim();
    // If it's a URL or contains slashes
    if (clean.includes('/')) {
      const parts = clean.split('/');
      clean = parts[parts.length - 1] || clean;
    }
    // If it has URI scheme e.g. afya: or card:
    if (clean.includes(':')) {
      const parts = clean.split(':');
      clean = parts[parts.length - 1] || clean;
    }
    // Remove query params if any
    if (clean.includes('?')) {
      clean = clean.split('?')[0];
    }
    return clean.trim();
  }

  /**
   * Simulate a scan (for manual testing or virtual wedge)
   */
  public simulateScan(code: string) {
    const cleaned = HardwareScannerService.sanitizeScannedCode(code);
    this.playBeep(true);
    this.emit(cleaned);
  }

  private emit(code: string) {
    const cleaned = HardwareScannerService.sanitizeScannedCode(code);
    this.listeners.forEach(listener => {
      try {
        listener(cleaned);
      } catch (err) {
        console.error('Error in scanner listener:', err);
      }
    });
  }

  private handleKeyDown(e: KeyboardEvent) {
    const now = Date.now();
    const timeDiff = now - this.lastKeyTime;
    this.lastKeyTime = now;

    // Check if user is typing into an input field or textarea
    const target = e.target as HTMLElement | null;
    const isTextInput = target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      (target as any).isContentEditable
    );

    // If scanner sends 'Enter' or 'Tab'
    if (e.key === 'Enter' || e.key === 'Tab') {
      // If we have accumulated a rapid burst or a recognized Afya code
      if (this.buffer.length >= this.minCodeLength) {
        const rawCode = this.buffer.trim();
        this.buffer = '';

        // If it looks like a barcode or came in rapid bursts (< 90ms average)
        if (rawCode.toUpperCase().includes('AFY') || timeDiff < 120 || rawCode.length >= 6) {
          e.preventDefault();
          e.stopPropagation();
          const cleanCode = HardwareScannerService.sanitizeScannedCode(rawCode);
          this.playBeep(true);
          this.emit(cleanCode);
          return;
        }
      }
      this.buffer = '';
      return;
    }

    // Ignore single modifier keys (excluding Tab which is handled above)
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
      return;
    }

    // If typing latency is too long, reset the hardware buffer (human is typing)
    if (timeDiff > this.maxInterKeyDelayMs && this.buffer.length > 0) {
      // But if the buffer already has Afya prefix, allow slightly wider latency
      if (!this.buffer.toUpperCase().includes('AFY') && !this.buffer.startsWith('crd-') && !this.buffer.startsWith('pat-')) {
        this.buffer = '';
      }
    }

    // Append standard printable characters
    if (e.key.length === 1) {
      this.buffer += e.key;

      // If text input is focused and scanner is firing rapidly, prevent default character duplication if desired
      if (isTextInput && this.buffer.length > 3 && timeDiff < 35) {
        // Let it fill or catch in scanner
      }
    }
  }
}

export const hardwareScanner = new HardwareScannerService();
