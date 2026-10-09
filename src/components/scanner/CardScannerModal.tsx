import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { nfcService } from '../../services/nfcAdapter';
import { hardwareScanner } from '../../services/hardwareScanner';
import {
  QrCode,
  CreditCard,
  Radio,
  Search,
  X,
  AlertCircle,
  Camera,
  Scan,
  Volume2
} from 'lucide-react';

interface CardScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardFound: (query: string) => void;
}

export const CardScannerModal: React.FC<CardScannerModalProps> = ({
  isOpen,
  onClose,
  onCardFound
}) => {
  const { cards, patients, findCardOrPatient } = useApp();

  const [activeMode, setActiveMode] = useState<'external_gun' | 'manual' | 'qr_camera' | 'nfc'>('external_gun');
  const [manualInput, setManualInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastScannedPreview, setLastScannedPreview] = useState<string | null>(null);

  // Setup hardware USB/Bluetooth scanner listener
  useEffect(() => {
    if (!isOpen) return;

    const unsubHardware = hardwareScanner.addListener(scannedCode => {
      setLastScannedPreview(scannedCode);
      handleScan(scannedCode);
    });

    return () => {
      unsubHardware();
    };
  }, [isOpen]);

  // Setup NFC listener
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = nfcService.addListener(event => {
      handleScan(event.serialNumber);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScan = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setErrorMessage('Please enter or scan a card number, QR code ID, or Member ID.');
      return;
    }

    const result = findCardOrPatient(trimmed);
    if (!result || !result.patient) {
      setErrorMessage(`No matching patient or card found for "${trimmed}". Verify the number or register a new patient.`);
      hardwareScanner.playBeep(false);
      return;
    }

    setErrorMessage('');
    hardwareScanner.playBeep(true);
    onCardFound(trimmed);
    onClose();
  };

  const registeredCardList = cards.map(c => {
    const p = patients.find(pat => pat.id === c.patientId);
    return {
      patientName: p ? p.fullName : 'Cardholder',
      memberId: p ? p.memberId : 'AFY-MEMBER',
      cardNumber: c.cardNumber,
      qrId: c.qrIdentifier,
      type: c.cardType.replace('_', ' '),
      color:
        c.cardType === 'SICKLE_CELL'
          ? 'bg-rose-50 border-rose-200 text-rose-900'
          : c.cardType === 'CHRONIC_CARE'
          ? 'bg-teal-50 border-teal-200 text-teal-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
    };
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">Afya Card Identification Scanner</h2>
              <p className="text-xs text-slate-400">USB / Bluetooth Scanner Guns, Webcam, or NFC Reader</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveMode('external_gun')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeMode === 'external_gun'
                ? 'bg-white border-emerald-600 text-emerald-900 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Scan className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hardware Scanner Gun</span>
          </button>

          <button
            onClick={() => setActiveMode('manual')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeMode === 'manual'
                ? 'bg-white border-emerald-600 text-emerald-900 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Card No / Member ID</span>
          </button>

          <button
            onClick={() => setActiveMode('qr_camera')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeMode === 'qr_camera'
                ? 'bg-white border-emerald-600 text-emerald-900 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Optical</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('nfc');
              nfcService.startListening();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeMode === 'nfc'
                ? 'bg-white border-emerald-600 text-emerald-900 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>NFC RFID</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MODE 1: EXTERNAL HARDWARE SCANNER GUN (USB / BLUETOOTH) */}
          {activeMode === 'external_gun' && (
            <div className="space-y-4 text-center">
              <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-inner">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-sm animate-pulse">
                  <Scan className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-base text-white">External Scanner Gun Active</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    Point your USB or Bluetooth handheld scanner gun at the Afya physical card QR code or barcode.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[11px] font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>HID KEYBOARD WEDGE LISTENER READY</span>
                </div>
              </div>

              {lastScannedPreview && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-mono font-bold">
                  Last Scanned Input: {lastScannedPreview}
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Supported Hardware Scanners:</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Compatible with all standard handheld barcode & 2D QR scanners (Zebra, Honeywell, Netum, Eyoyo, Sunmi, Datalogic). When scanned, the card is instantly recognized with audio verification chime.
                </p>
              </div>
            </div>
          )}

          {/* MODE 2: MANUAL CARD NUMBER / MEMBER ID */}
          {activeMode === 'manual' && (
            <div className="space-y-4">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleScan(manualInput);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Card Number, QR Identifier, or Member ID:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={manualInput}
                      onChange={e => {
                        setManualInput(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder="e.g. AFY-CRD-882190 or AFY-000001"
                      className="w-full text-sm font-mono font-bold rounded-2xl border border-slate-300 p-3 pl-10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase tracking-wider bg-slate-50 focus:bg-white"
                    />
                    <CreditCard className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Retrieve Afya Patient Record</span>
                </button>
              </form>

              {/* Registered Cards List */}
              {registeredCardList.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Registered Patient Cards in Database ({registeredCardList.length}):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {registeredCardList.map((card, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleScan(card.cardNumber)}
                        className={`text-left p-3 rounded-2xl border text-xs transition-all hover:scale-[1.01] shadow-2xs ${card.color}`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>{card.patientName}</span>
                          <span className="font-mono text-[10px]">{card.memberId}</span>
                        </div>
                        <div className="text-[11px] opacity-80 mt-0.5">{card.type}</div>
                        <div className="font-mono text-[10px] opacity-70 mt-1">Card: {card.cardNumber}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 3: LIVE CAMERA QR SCANNER */}
          {activeMode === 'qr_camera' && (
            <div className="space-y-4 text-center">
              <div className="relative mx-auto w-64 h-64 bg-slate-950 rounded-3xl overflow-hidden border-2 border-emerald-500/50 flex flex-col items-center justify-center text-slate-400 p-4 shadow-inner">
                <div className="absolute inset-8 border-2 border-dashed border-emerald-400/70 rounded-2xl pointer-events-none animate-pulse" />
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-300 font-semibold">Webcam Optical Reader</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">
                  Hold physical card QR code 15–20cm in front of camera lens
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-600">
                <p className="font-medium text-slate-800">Direct Optical Scanning</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Point camera at card. If camera access is restricted in this browser frame, use the Hardware Scanner Gun tab above.
                </p>
              </div>
            </div>
          )}

          {/* MODE 4: NFC RFID READER */}
          {activeMode === 'nfc' && (
            <div className="space-y-4 text-center">
              <div className="p-8 rounded-3xl bg-teal-50 border-2 border-dashed border-teal-300 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md animate-bounce">
                  <Radio className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-sm text-teal-950">Awaiting Physical NFC Card Tap</h3>
                <p className="text-xs text-teal-800 max-w-sm mx-auto">
                  Hold standard ISO 14443 Type A/B smart card against the USB or integrated NFC reader.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
