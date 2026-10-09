/**
 * NFC Card Reader Bridge Interface & Adapter
 *
 * NOTE: Ordinary web browsers cannot universally connect directly to USB desktop NFC/RFID
 * contactless smartcard readers without a dedicated local bridge (e.g. PC/SC WebSocket bridge,
 * WebUSB/WebHID with explicit device driver pairing, or local native daemon).
 *
 * This adapter provides a clean hardware-agnostic interface that accepts:
 * 1. Web NFC (NDEFReader on supported Android Chrome devices)
 * 2. Localhost WebSocket Bridge (for USB desktop NFC readers e.g. ACR122U / Omnikey)
 * 3. Simulated Reader for verification and staff training
 */

export interface NfcReadEvent {
  serialNumber: string; // UID / CSN
  ndefMessage?: string;
  source: 'web_nfc' | 'local_usb_bridge' | 'manual_keyboard_wedge' | 'simulated';
  timestamp: string;
}

export type NfcListener = (event: NfcReadEvent) => void;

class NfcReaderService {
  private listeners: Set<NfcListener> = new Set();
  private isScanning = false;
  private bridgeStatus: 'disconnected' | 'connecting' | 'connected' | 'unsupported' = 'disconnected';

  public addListener(listener: NfcListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getStatus(): {
    isWebNfcSupported: boolean;
    bridgeStatus: string;
    description: string;
  } {
    const isWebNfcSupported = typeof window !== 'undefined' && 'NDEFReader' in window;
    return {
      isWebNfcSupported,
      bridgeStatus: this.bridgeStatus,
      description: isWebNfcSupported
        ? 'Web NFC is supported on this browser (Android Chrome). Ready to tap NFC cards.'
        : 'Desktop browser environment: USB NFC readers connect via local bridge WebSocket or keyboard wedge emulator.'
    };
  }

  /**
   * Hardware input emulator / test tap trigger for UI reception testing
   */
  public triggerCardTap(cardIdentifier: string, source: NfcReadEvent['source'] = 'simulated') {
    const event: NfcReadEvent = {
      serialNumber: cardIdentifier,
      source,
      timestamp: new Date().toISOString()
    };
    this.listeners.forEach(cb => cb(event));
  }

  /**
   * Start listening for NFC events via Web NFC or local WebSocket bridge
   */
  public async startListening(): Promise<boolean> {
    if (this.isScanning) return true;

    // Check for native Web NFC (supported on Android Chrome with NFC turned on)
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      try {
        const NDEFReaderClass = (window as any).NDEFReader;
        const ndef = new NDEFReaderClass();
        await ndef.scan();
        this.isScanning = true;
        this.bridgeStatus = 'connected';

        ndef.addEventListener('reading', ({ serialNumber, message }: any) => {
          const event: NfcReadEvent = {
            serialNumber: serialNumber || 'NFC-UNREGISTERED',
            ndefMessage: message ? JSON.stringify(message) : undefined,
            source: 'web_nfc',
            timestamp: new Date().toISOString()
          };
          this.listeners.forEach(cb => cb(event));
        });
        return true;
      } catch (err) {
        console.warn('Web NFC scan error:', err);
      }
    }

    // Attempt optional local USB bridge connection (e.g. ws://localhost:8383/nfc)
    this.attemptLocalUsbBridge();
    this.isScanning = true;
    return true;
  }

  private attemptLocalUsbBridge() {
    try {
      const ws = new WebSocket('ws://localhost:8383/afya-nfc-bridge');
      this.bridgeStatus = 'connecting';

      ws.onopen = () => {
        this.bridgeStatus = 'connected';
        console.log('Afya USB NFC Bridge connected on localhost:8383');
      };

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (data.cardUid) {
            this.triggerCardTap(data.cardUid, 'local_usb_bridge');
          }
        } catch {
          // Ignore non-json
        }
      };

      ws.onerror = () => {
        this.bridgeStatus = 'unsupported';
      };

      ws.onclose = () => {
        this.bridgeStatus = 'disconnected';
      };
    } catch {
      this.bridgeStatus = 'unsupported';
    }
  }

  public stopListening() {
    this.isScanning = false;
  }
}

export const nfcService = new NfcReaderService();
