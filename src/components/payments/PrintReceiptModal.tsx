import React, { useState } from 'react';
import { Receipt } from '../../types';
import { printReceipt, PrinterPreset } from '../../utils/printer';
import { AfyaLogo } from '../common/AfyaLogo';
import {
  Printer,
  X,
  CheckCircle2,
  Building2,
  User,
  Clock,
  Calendar,
  CreditCard,
  Receipt as ReceiptIcon,
  ShieldCheck,
  QrCode,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt | null;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt
}) => {
  const [printerFormat, setPrinterFormat] = useState<'80mm' | '58mm' | 'a4'>('80mm');
  const [showPrinterInfo, setShowPrinterInfo] = useState(false);

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    const preset: PrinterPreset =
      printerFormat === '80mm' ? 'xprinter-80mm' : printerFormat === '58mm' ? 'xprinter-58mm' : 'a4';
    printReceipt('printable-receipt', preset);
  };

  const grossTotal = receipt.subtotal ?? receipt.amount;
  const packageDiscount = receipt.packageDeductionValue ?? 0;
  const netPayable = receipt.totalPayable ?? receipt.amount;
  const amountPaid = receipt.amountPaid ?? netPayable;
  const change = receipt.change ?? Math.max(0, amountPaid - netPayable);

  const containerClass =
    printerFormat === '80mm'
      ? 'max-w-[420px] printer-format-80mm'
      : printerFormat === '58mm'
      ? 'max-w-[340px] printer-format-58mm'
      : 'max-w-3xl printer-format-a4';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Modal Container */}
      <div className={`bg-white rounded-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] transition-all duration-200 ${containerClass}`}>
        {/* Top Controls Bar (Hidden during print) */}
        <div className="p-3.5 bg-slate-900 text-white flex flex-col gap-2.5 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ReceiptIcon className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-xs sm:text-sm">Official Receipt</span>
              <span className="font-mono text-[11px] text-emerald-300">#{receipt.receiptNumber}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrinterInfo(prev => !prev)}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  showPrinterInfo ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Printer Setup & Hardware Advice"
              >
                <Info className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Printers</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printer Mode Switcher */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400 text-[10px] font-semibold flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Target Printer:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setPrinterFormat('80mm')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                  printerFormat === '80mm' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Xprinter 80mm
              </button>
              <button
                type="button"
                onClick={() => setPrinterFormat('58mm')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                  printerFormat === '58mm' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Xprinter 58mm
              </button>
              <button
                type="button"
                onClick={() => setPrinterFormat('a4')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                  printerFormat === 'a4' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                A4 Sheet
              </button>
            </div>
          </div>

          {/* Printer Guide Drawer */}
          {showPrinterInfo && (
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] text-slate-300 space-y-1">
              <p className="font-bold text-emerald-400">Recommended Hardware & Settings:</p>
              <p>• <strong>80mm Thermal (Recommended):</strong> Epson TM-T88/T20, Xprinter XP-N160, Sunmi POS, Star TSP100, Rongta, Bixolon (USB/Bluetooth/LAN).</p>
              <p>• <strong>58mm Mini POS:</strong> Portable Bluetooth receipt printers for counter or mobile checkout.</p>
              <p>• <strong>A4 Office:</strong> Standard HP LaserJet, Canon, Epson for complete patient statements.</p>
              <p className="text-slate-400 font-mono pt-0.5">Tip: In your browser print window, select Margins: "None" or "Minimum" for thermal rolls.</p>
            </div>
          )}
        </div>

        {/* Printable Receipt Paper Container */}
        <div
          className={`p-5 sm:p-7 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:m-0 print:overflow-visible ${
            printerFormat === '80mm'
              ? 'text-xs printer-format-80mm'
              : printerFormat === '58mm'
              ? 'text-[11px] printer-format-58mm leading-tight'
              : 'text-sm printer-format-a4'
          }`}
          id="printable-receipt"
        >
          {/* Clinic Header with Official Logo */}
          <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
            <div className="flex justify-center mb-1">
              <div className="w-12 h-12 rounded-xl bg-white shadow-xs p-1 border border-slate-200 flex items-center justify-center overflow-hidden">
                <AfyaLogo variant="emblem" size="md" />
              </div>
            </div>
            <h1 className="text-base font-black tracking-tight text-slate-950 uppercase leading-tight">
              Afya Medicare Central Clinic
            </h1>
            <p className="text-[11px] font-semibold text-slate-700">
              Kitende – Mwenda Stage, Entebbe Road, Wakiso, Uganda
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Tel: +256 701 445 920 • Reg: MOH-HSD-2026/891
            </p>
            <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-800 border border-slate-300">
              Official Medical Receipt
            </div>
          </div>

          {/* Meta & Encounter Info */}
          <div className="grid grid-cols-2 gap-3 py-3 border-b border-dashed border-slate-300 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Receipt Number</span>
              <strong className="font-mono text-sm font-black text-slate-950">{receipt.receiptNumber}</strong>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Date &amp; Time</span>
              <span className="font-medium text-slate-800">
                {new Date(receipt.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })} •{' '}
                {new Date(receipt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
              <strong className="text-sm font-bold text-slate-900">{receipt.patientName}</strong>
              <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                Member ID: {receipt.memberId}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Afya Card / Queue</span>
              <span className="font-mono font-bold text-xs text-teal-800 block">
                {receipt.cardNumber || 'Cash OPD'}
              </span>
              {receipt.queueNumber && (
                <span className="font-mono text-[10px] text-slate-500 block">Queue: {receipt.queueNumber}</span>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cashier / Staff</span>
              <span className="text-slate-700 font-medium">{receipt.staffName || 'Cashier Desk'}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Encounter Program</span>
              <span className="text-slate-800 font-medium text-[11px]">
                {receipt.packageOrProgram || 'Clinical Services'}
              </span>
            </div>
          </div>

          {/* Itemized Services Table (Shows item name & qty only - NO per item rate on receipt as requested) */}
          <div className="py-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              Billed Services &amp; Supplies (from Clinic Inventory)
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2 px-1">Item / Medicine</th>
                  <th className="py-2 px-1 text-center">Qty</th>
                  <th className="py-2 px-1 text-right">Coverage Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {receipt.lineItems && receipt.lineItems.length > 0 ? (
                  receipt.lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-1">
                        <div className="font-bold text-slate-900">{item.itemName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{item.itemCode} • {item.category}</div>
                      </td>
                      <td className="py-2 px-1 text-center font-mono font-bold text-slate-800">{item.quantity}</td>
                      <td className="py-2 px-1 text-right whitespace-nowrap">
                        {item.coveredByPackage ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            Covered
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                            Cash / Copay
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-2 px-1 font-bold text-slate-900">{receipt.description || 'Clinical Care Visit'}</td>
                    <td className="py-2 px-1 text-center font-mono">1</td>
                    <td className="py-2 px-1 text-right">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                        Paid
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Box */}
          <div className="border-t-2 border-slate-900 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Services Total:</span>
              <span className="font-mono font-bold">UGX {grossTotal.toLocaleString()}</span>
            </div>

            {packageDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Afya Package Benefit (Deducted Visit):</span>
                <span className="font-mono font-bold">-UGX {packageDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-950 font-black text-sm pt-1 border-t border-slate-200">
              <span>NET AMOUNT PAYABLE:</span>
              <span className="font-mono text-base text-emerald-800">UGX {netPayable.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-700 pt-1 text-[11px]">
              <span>Amount Tendered ({receipt.paymentMethod}):</span>
              <span className="font-mono font-bold">UGX {amountPaid.toLocaleString()}</span>
            </div>

            {change > 0 && (
              <div className="flex justify-between text-teal-800 text-[11px] font-semibold">
                <span>Change Returned:</span>
                <span className="font-mono font-bold">UGX {change.toLocaleString()}</span>
              </div>
            )}

            {receipt.paymentReference && (
              <div className="flex justify-between text-slate-500 text-[10px] font-mono">
                <span>Reference / Transaction ID:</span>
                <span>{receipt.paymentReference}</span>
              </div>
            )}
          </div>

          {/* Payment Status & Stamp */}
          <div className="mt-6 pt-4 border-t border-dashed border-slate-300 flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-950 font-black text-xs border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>PAID &amp; AUDITED</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Thank you for choosing Afya Medicare Kitende.
              </p>
            </div>

            <div className="text-center font-mono text-[9px] text-slate-400">
              <div className="w-12 h-12 rounded border border-slate-300 flex items-center justify-center mx-auto mb-1 text-slate-600">
                <QrCode className="w-9 h-9" />
              </div>
              <span>SCAN TO VERIFY</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden during print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
          >
            Close Receipt
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
