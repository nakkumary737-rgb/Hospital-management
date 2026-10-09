import React, { useEffect, useState } from 'react';
import { Card, Patient } from '../../types';
import { generateQrDataUrl } from '../../utils/qr';
import { AfyaLogo } from '../common/AfyaLogo';
import {
  Shield,
  Radio,
  Printer,
  X,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react';

interface PvcCardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
  patient: Patient;
}

export const PvcCardPreviewModal: React.FC<PvcCardPreviewModalProps> = ({
  isOpen,
  onClose,
  card,
  patient
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && card) {
      generateQrDataUrl(card.qrIdentifier).then(url => setQrDataUrl(url));
    }
  }, [isOpen, card]);

  if (!isOpen) return null;

  const getTheme = () => {
    switch (card.cardType) {
      case 'SICKLE_CELL':
        return {
          title: 'Sickle Cell Care Card',
          sub: 'Clinical Identification Credential',
          bgGradient: 'from-rose-800 via-rose-900 to-red-950',
          accent: 'text-rose-300',
          badge: 'bg-rose-950/80 text-rose-200 border-rose-700/50',
          watermark: 'SICKLE CELL CARE'
        };
      case 'CHRONIC_CARE':
        return {
          title: 'Chronic Care Card',
          sub: 'Cardiovascular & Metabolic Care',
          bgGradient: 'from-teal-800 via-teal-900 to-cyan-950',
          accent: 'text-teal-300',
          badge: 'bg-teal-950/80 text-teal-200 border-teal-700/50',
          watermark: 'CHRONIC CARE'
        };
      default:
        return {
          title: 'Health Membership Card',
          sub: 'Healthcare Package Entitlement',
          bgGradient: 'from-emerald-800 via-emerald-900 to-teal-950',
          accent: 'text-emerald-300',
          badge: 'bg-emerald-950/80 text-emerald-200 border-emerald-700/50',
          watermark: 'HEALTH MEMBERSHIP'
        };
    }
  };

  const theme = getTheme();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Standard CR80 PVC Card Specification</h2>
              <p className="text-xs text-slate-400">ISO/IEC 7810 ID-1 standard dimensions (85.60 × 53.98 mm)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Badge</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Canvas Container */}
        <div id="afya-pvc-card-print" className="p-6 overflow-y-auto space-y-8 bg-slate-100 flex flex-col items-center print:bg-white print:p-0 print:m-0">
          {/* FRONT OF CARD */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Card Front (Standard CR80 Layout)
            </span>
            <div
              className={`w-[400px] h-[250px] sm:w-[460px] sm:h-[288px] rounded-2xl bg-gradient-to-br ${theme.bgGradient} text-white p-5 shadow-2xl border border-white/20 relative overflow-hidden flex flex-col justify-between`}
            >
              {/* Subtle background glow */}
              <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none blur-2xl" />

              {/* Security Watermark Crest in Card Body */}
              <AfyaLogo variant="card-watermark" className="inset-0" />

              {/* Front Top: Organization & Card Type */}
              <div className="flex items-start justify-between relative z-10">
                <AfyaLogo variant="card-front" />

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${theme.badge}`}>
                    {theme.title}
                  </span>
                  <Radio className="w-4 h-4 text-white/70" />
                </div>
              </div>

              {/* Front Center: Cardholder Details & Smartcard Security Element (NO PHOTO) */}
              <div className="flex items-center justify-between gap-4 relative z-10 my-auto">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-widest text-white/70 font-semibold">
                      Cardholder Name
                    </span>
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span className="text-[9px] uppercase tracking-wider text-white/70 font-mono">
                      MEMBER ID: <strong className="text-white font-bold">{patient.memberId}</strong>
                    </span>
                  </div>

                  <p className="text-base sm:text-xl font-black text-white tracking-tight leading-tight">
                    {patient.fullName}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] sm:text-[11px] text-white/90 pt-0.5">
                    <div>
                      <span className="text-white/60 text-[9px] block">SEX / DATE OF BIRTH</span>
                      <strong className="font-semibold text-white">{patient.sex} • {patient.dob}</strong>
                    </div>
                    {patient.emergencyContact?.phone && (
                      <div className="border-l border-white/20 pl-3">
                        <span className="text-white/60 text-[9px] block">EMERGENCY CONTACT</span>
                        <strong className="font-mono text-white/95">{patient.emergencyContact.phone}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* EMV Smartcard Chip Graphic (Industry standard CR80 physical card element) */}
                <div className="hidden sm:flex flex-col items-center justify-center shrink-0">
                  <div className="w-11 h-9 rounded-lg bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 border border-amber-300 shadow-md relative overflow-hidden flex items-center justify-center">
                    <div className="w-full h-[1px] bg-amber-600/40 absolute top-3" />
                    <div className="w-full h-[1px] bg-amber-600/40 absolute bottom-3" />
                    <div className="h-full w-[1px] bg-amber-600/40 absolute left-4" />
                    <div className="h-full w-[1px] bg-amber-600/40 absolute right-4" />
                    <div className="w-3.5 h-3 rounded bg-amber-300/80 border border-amber-600/50" />
                  </div>
                  <span className="text-[8px] font-mono tracking-widest text-white/60 mt-1 uppercase">AFYA-CHIP</span>
                </div>
              </div>

              {/* Front Bottom: Card Number, Expiry, QR */}
              <div className="flex items-end justify-between border-t border-white/15 pt-2.5 relative z-10">
                <div className="font-mono">
                  <span className="text-[9px] text-white/60 block font-sans">CARD NUMBER</span>
                  <span className="text-xs sm:text-sm font-bold tracking-widest text-white">{card.cardNumber}</span>
                  <span className="text-[10px] text-white/70 block mt-0.5 font-sans">
                    VALID THRU: <strong className="text-white font-mono">{card.expiryDate}</strong>
                  </span>
                </div>

                {qrDataUrl && (
                  <div className="bg-white p-1 rounded-lg shadow-md shrink-0">
                    <img src={qrDataUrl} alt="QR Code" className="w-11 h-11 sm:w-12 sm:h-12 object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Card Back (Terms, Security &amp; Emergency)
            </span>
            <div className="w-[400px] h-[250px] sm:w-[460px] sm:h-[288px] rounded-2xl bg-slate-900 text-white p-5 shadow-2xl border border-slate-700 relative overflow-hidden flex flex-col justify-between">
              {/* Magnetic Stripe simulation */}
              <div className="absolute top-4 left-0 right-0 h-10 bg-slate-950 border-y border-slate-800" />

              <div className="pt-12 text-[10px] sm:text-[11px] text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2">
                  <AfyaLogo variant="emblem" size="xs" inverted={true} />
                  <p className="font-bold text-slate-100 uppercase tracking-wider">Property of Afya Medicare Network</p>
                </div>
                <p className="leading-tight text-slate-400">
                  This card remains the property of Afya Medicare. It is non-transferable and must be presented by the registered patient or authorized guardian when seeking network healthcare services.
                </p>
                <p className="text-amber-400 font-medium">
                  • Lost or stolen cards should be reported immediately to Afya Reception.
                </p>
                <p className="text-slate-400 text-[10px]">
                  • This card does NOT contain credit, loan, or electronic money balances.
                </p>
              </div>

              {/* Emergency Contact & Network Support */}
              <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[10px] sm:text-[11px]">
                <div>
                  <div className="flex items-center gap-1 text-slate-300 font-semibold">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Emergency Hotline: +256 701 445 920</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-[9px] mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>Kitende – Mwenda Stage, Entebbe Road, Uganda</span>
                  </div>
                </div>

                <div className="text-right font-mono text-[9px] text-slate-500">
                  <span>SN: {card.id}</span>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <AfyaLogo variant="emblem" size="xs" />
                    <span className="text-emerald-400 font-sans font-bold text-[9px]">AFYA NETWORK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Rule Footer Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Security Invariant:</strong> The physical card displays basic identity information and QR/card ID only. Visit deductions, transactions, and detailed clinical notes remain safely encrypted in the central database.
          </span>
        </div>
      </div>
    </div>
  );
};
