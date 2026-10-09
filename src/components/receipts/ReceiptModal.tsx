import React, { useEffect, useState } from 'react';
import { Receipt } from '../../types';
import { generateQrDataUrl } from '../../utils/qr';
import { printReceipt, PrinterPreset } from '../../utils/printer';
import { AfyaLogo } from '../common/AfyaLogo';
import { Shield, Printer, X, CheckCircle2, SlidersHorizontal } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt
}) => {
  const [qrUrl, setQrUrl] = useState('');
  const [printerFormat, setPrinterFormat] = useState<'80mm' | '58mm' | 'a4'>('80mm');

  useEffect(() => {
    if (isOpen && receipt) {
      generateQrDataUrl(`AFYA-RECEIPT:${receipt.receiptNumber}:${receipt.amount}UGX:${receipt.patientId}`).then(url => setQrUrl(url));
    }
  }, [isOpen, receipt]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const preset: PrinterPreset =
      printerFormat === '80mm' ? 'xprinter-80mm' : printerFormat === '58mm' ? 'xprinter-58mm' : 'a4';
    printReceipt('afya-printable-receipt', preset);
  };

  const containerClass =
    printerFormat === '80mm'
      ? 'max-w-[420px] printer-format-80mm'
      : printerFormat === '58mm'
      ? 'max-w-[340px] printer-format-58mm'
      : 'max-w-2xl printer-format-a4';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50">
      <div className={`bg-white rounded-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] transition-all duration-200 ${containerClass}`}>
        {/* Header Actions */}
        <div className="p-3.5 bg-slate-900 text-white flex flex-col gap-2 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-xs sm:text-sm">Official Receipt</h3>
              <span className="font-mono text-[10px] text-emerald-300">#{receipt.receiptNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printer format toggle */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[10px]">
            <span className="text-slate-400 flex items-center gap-1 font-semibold">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Printer (Xprinter POS):</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setPrinterFormat('80mm')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  printerFormat === '80mm' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Xprinter 80mm
              </button>
              <button
                type="button"
                onClick={() => setPrinterFormat('58mm')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  printerFormat === '58mm' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Xprinter 58mm
              </button>
              <button
                type="button"
                onClick={() => setPrinterFormat('a4')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  printerFormat === 'a4' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                A4 Sheet
              </button>
            </div>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div
          className={`p-6 overflow-y-auto space-y-5 bg-white text-slate-800 print:p-0 print:m-0 print:overflow-visible ${
            printerFormat === '80mm'
              ? 'text-xs printer-format-80mm'
              : printerFormat === '58mm'
              ? 'text-[11px] printer-format-58mm'
              : 'text-sm printer-format-a4'
          }`}
          id="afya-printable-receipt"
        >
          {/* Official Clinic Logo & Header */}
          <AfyaLogo
            variant={printerFormat === 'a4' ? 'receipt' : 'receipt'}
            className="mb-2"
          />

          {/* Receipt Number & Date Metadata */}
          <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Receipt Number</span>
              <strong className="font-mono text-sm text-slate-900">{receipt.receiptNumber}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date &amp; Time</span>
              <span className="font-mono text-slate-700 font-medium">
                {new Date(receipt.createdAt).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient / Client:</span>
              <strong className="text-slate-900 font-bold">{receipt.patientName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ID / Category:</span>
              <span className="font-mono font-semibold text-emerald-800">{receipt.memberId || 'Cash OPD / Non-Member'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Facility / Branch:</span>
              <span className="text-slate-700">{receipt.facilityName}</span>
            </div>
          </div>

          {/* Line Items / Services (Shows item name & quantity only - NO per item rate on receipt as requested) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            {receipt.lineItems && receipt.lineItems.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2 px-3">Service / Drug Item</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Coverage Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipt.lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-900 block">{item.itemName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{item.itemCode} • {item.category}</span>
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-slate-800">{item.quantity}</td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        {item.coveredByPackage ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            Covered by Plan
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                            Billed (Total Below)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700">
                  <span>Encounter Summary</span>
                </div>
                <div className="p-3 border-t border-slate-200">
                  <p className="font-semibold text-slate-900">{receipt.description}</p>
                  {receipt.packageOrProgram && (
                    <p className="text-[11px] text-slate-500 mt-0.5">Program / Category: {receipt.packageOrProgram}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Total & Calculations */}
          <div className="space-y-1.5 border-t border-slate-200 pt-3 text-xs">
            {receipt.subtotal !== undefined && receipt.subtotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Gross Services Total:</span>
                <span className="font-mono font-bold">UGX {receipt.subtotal.toLocaleString()}</span>
              </div>
            )}

            {receipt.packageDeductionValue !== undefined && receipt.packageDeductionValue > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Afya Package Benefit (Deducted Visit):</span>
                <span className="font-mono font-bold">-UGX {receipt.packageDeductionValue.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
              <span>Total Paid:</span>
              <span className="text-base text-emerald-700 font-mono font-black">
                UGX {receipt.amount.toLocaleString()}
              </span>
            </div>

            {receipt.change !== undefined && receipt.change > 0 && (
              <div className="flex justify-between text-teal-800 text-[11px] font-semibold">
                <span>Change Returned:</span>
                <span className="font-mono font-bold">UGX {receipt.change.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 pt-1">
              <span>Payment Method:</span>
              <strong className="text-slate-800">{receipt.paymentMethod}</strong>
            </div>

            {receipt.paymentReference && (
              <div className="flex justify-between text-slate-500 font-mono text-[10px]">
                <span>Transaction Ref:</span>
                <span>{receipt.paymentReference}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Payment Status:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED &amp; PAID
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Issuing Staff:</span>
              <span className="text-slate-700">{receipt.staffName}</span>
            </div>
          </div>

          {/* Footer QR verification & Non E-Money Statement */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
            <div className="text-[10px] text-slate-500 leading-tight">
              <p className="font-bold text-slate-700 uppercase">Healthcare Package Transaction</p>
              <p className="mt-0.5">Official Afya Medicare receipt for clinical services or membership package payment.</p>
              <p className="text-slate-400 mt-1 italic">Thank you for trusting Afya Medicare for your healthcare needs.</p>
            </div>
            {qrUrl && (
              <div className="p-1 rounded-lg border border-slate-200 bg-white shrink-0">
                <img src={qrUrl} alt="Receipt QR" className="w-14 h-14" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
