import React, { useState } from 'react';
import { Visit, Patient } from '../../types';
import { printReceipt, PrinterPreset } from '../../utils/printer';
import { AfyaLogo } from '../common/AfyaLogo';
import {
  Printer,
  CheckCircle2,
  X,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface QueueSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit;
  patient: Patient;
}

export const QueueSlipModal: React.FC<QueueSlipModalProps> = ({
  isOpen,
  onClose,
  visit,
  patient
}) => {
  const [printerFormat, setPrinterFormat] = useState<'80mm' | '58mm' | 'a4'>('80mm');
  const [showPrinterInfo, setShowPrinterInfo] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    const preset: PrinterPreset =
      printerFormat === '80mm' ? 'xprinter-80mm' : printerFormat === '58mm' ? 'xprinter-58mm' : 'a4';
    printReceipt('afya-visit-slip', preset);
  };

  const visitDate = new Date(visit.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const visitTime = new Date(visit.createdAt).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const containerClass =
    printerFormat === '80mm'
      ? 'max-w-[400px] printer-format-80mm'
      : printerFormat === '58mm'
      ? 'max-w-[320px] printer-format-58mm'
      : 'max-w-xl printer-format-a4';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-70 animate-in fade-in duration-150">
      <div className={`bg-white rounded-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 flex flex-col max-h-[92vh] overflow-y-auto ${containerClass}`}>
        {/* Top Controls Bar (Hidden during print) */}
        <div className="print:hidden space-y-3">
          <div className="flex items-center justify-between">
            {/* Success Alert Banner */}
            <div className="flex items-center gap-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex-1 mr-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold">Encounter Logged</strong>
                <span className="text-[10px] text-emerald-700">{visit.department} Queue</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowPrinterInfo(prev => !prev)}
                className={`p-1.5 rounded-xl border text-xs transition-colors ${
                  showPrinterInfo ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title="Printer Setup Guide"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printer Format Switcher */}
          <div className="flex items-center justify-between gap-1 p-1 bg-slate-100 rounded-xl text-[10px] font-bold">
            <span className="text-slate-500 pl-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Printer:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPrinterFormat('80mm')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  printerFormat === '80mm' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Xprinter 80mm
              </button>
              <button
                type="button"
                onClick={() => setPrinterFormat('58mm')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  printerFormat === '58mm' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Xprinter 58mm
              </button>
              <button
                type="button"
                onClick={() => setPrinterFormat('a4')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  printerFormat === 'a4' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Standard
              </button>
            </div>
          </div>

          {/* Printer Info Guide */}
          {showPrinterInfo && (
            <div className="p-2.5 rounded-xl bg-slate-900 text-white text-[10px] space-y-1">
              <p className="font-bold text-emerald-400">Thermal Printer Compatibility:</p>
              <p>• Compatible with all 80mm &amp; 58mm POS receipt printers (Epson, Star, Xprinter, Sunmi, Rongta, Munbyn).</p>
              <p>• Tip: In your browser print window, select Margins: &quot;None&quot; and enable Background graphics.</p>
            </div>
          )}
        </div>

        {/* Printable Thermal Slip Ticket */}
        <div
          id="afya-visit-slip"
          className="border-2 border-dashed border-slate-300 rounded-2xl p-4 sm:p-5 bg-white text-slate-900 space-y-3 font-mono text-center print:border-none print:p-0"
        >
          {/* Header with Logo */}
          <div className="space-y-1 border-b border-slate-200 pb-2.5">
            <div className="flex justify-center mb-1">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs p-1 border border-slate-200 flex items-center justify-center overflow-hidden">
                <AfyaLogo variant="emblem" size="sm" />
              </div>
            </div>
            <h3 className="font-black text-sm tracking-tight text-slate-950 uppercase">
              AFYA MEDICARE CENTRAL CLINIC
            </h3>
            <p className="text-[10px] text-slate-600 font-sans font-medium">
              Kitende – Mwenda Stage, Entebbe Road, Uganda
            </p>
            <p className="text-[9px] text-slate-400 font-sans">
              Tel: +256 701 445 920 • Reg: MOH-HSD-2026/891
            </p>
          </div>

          {/* Queue Number */}
          <div className="py-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest font-sans">
              TRIAGE QUEUE TICKET
            </span>
            <span className="text-4xl font-black text-slate-950 tracking-tight block my-0.5">
              {visit.queueNumber || 'Q-001'}
            </span>
            <span className="text-[11px] font-bold text-emerald-800 uppercase font-sans">
              {visit.department}
            </span>
          </div>

          {/* Patient Details */}
          <div className="text-left text-xs space-y-1.5 pt-1 border-b border-slate-200 pb-3 font-sans">
            <div className="flex justify-between">
              <span className="text-slate-400 text-[10px]">PATIENT:</span>
              <strong className="text-slate-900 text-right">{patient.fullName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[10px]">MEMBER ID:</span>
              <span className="font-mono font-bold text-slate-800">{patient.memberId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[10px]">ENCOUNTER:</span>
              <span className="font-bold text-teal-800">{visit.visitSequence || 'Visit 001'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[10px]">DATE &amp; TIME:</span>
              <span className="text-slate-700">{visitDate} {visitTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[10px]">SERVICE:</span>
              <span className="text-slate-800 font-medium">{visit.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[10px]">COVERAGE STATUS:</span>
              <strong className="text-emerald-700 font-bold">{visit.paymentStatus || 'Covered by Membership'}</strong>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-[10px] text-slate-500 font-sans leading-relaxed">
            Please proceed to <strong>Triage Room 1</strong> for vital signs check. Keep this queue ticket with you.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-2 pt-1 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Queue Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
