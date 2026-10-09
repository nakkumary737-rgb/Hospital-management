import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Patient,
  Card,
  Membership,
  ChronicMembership,
  SickleCellProfile
} from '../../types';
import {
  Shield,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Heart,
  Pill,
  Stethoscope,
  PlusCircle,
  FileText,
  Printer,
  Ban,
  ArrowRight,
  UserCheck,
  History,
  Activity,
  MapPin,
  Phone
} from 'lucide-react';

interface ScannedCardViewProps {
  data: {
    patient: Patient;
    card?: Card;
    membership?: Membership;
    chronicMembership?: ChronicMembership;
    sickleCellProfile?: SickleCellProfile;
  };
  onRecordVisit: () => void;
  onRecordPayment: () => void;
  onRenewChronic: () => void;
  onMedicationPickup: () => void;
  onChronicConsultation: () => void;
  onSickleCellConsultation: () => void;
  onPrintCard: () => void;
  onViewHistory?: () => void;
  onUpdateDetails?: () => void;
  onClose?: () => void;
}

export const ScannedCardView: React.FC<ScannedCardViewProps> = ({
  data,
  onRecordVisit,
  onRecordPayment,
  onRenewChronic,
  onMedicationPickup,
  onChronicConsultation,
  onSickleCellConsultation,
  onPrintCard,
  onViewHistory,
  onUpdateDetails
}) => {
  const { patient, card, membership, chronicMembership, sickleCellProfile } = data;
  const { blockCard, replaceCard, currentUser, visits, confirmAction, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'benefits'>('overview');
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replacementReason, setReplacementReason] = useState('');

  // Patient visits history
  const patientVisits = visits.filter(v => v.patientId === patient.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const lastVisit = patientVisits[0];

  const cardType = card?.cardType || (sickleCellProfile ? 'SICKLE_CELL' : chronicMembership ? 'CHRONIC_CARE' : 'HEALTH_PACKAGE');

  const getStatusBadge = () => {
    if (!card) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">NO CARD ISSUED</span>;
    switch (card.status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> CARD ACTIVE</span>;
      case 'BLOCKED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800"><Ban className="w-3.5 h-3.5" /> CARD BLOCKED</span>;
      case 'LOST':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><AlertTriangle className="w-3.5 h-3.5" /> CARD LOST</span>;
      case 'REPLACED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">CARD REPLACED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{card.status}</span>;
    }
  };

  const handleCardBlock = () => {
    if (!card) return;
    confirmAction({
      title: 'Block Membership Card',
      message: `Are you sure you want to block Card ${card.cardNumber}? It will no longer authorize clinical services.`,
      confirmLabel: 'Block Card',
      variant: 'warning',
      onConfirm: () => {
        blockCard(card.id, 'Blocked via Reception Desk', 'BLOCKED');
        showToast(`Card ${card.cardNumber} has been blocked.`, 'warning');
      }
    });
  };

  const handleCardReplaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!card || !replacementReason.trim()) return;
    replaceCard(card.id, replacementReason.trim());
    setShowReplaceModal(false);
    setReplacementReason('');
    showToast('New card issued successfully! The previous card is deactivated while all patient records remain intact.', 'success');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Identity Header */}
      <div className={`p-6 border-b text-white ${
        cardType === 'SICKLE_CELL'
          ? 'bg-gradient-to-r from-rose-700 to-red-800 border-rose-900'
          : cardType === 'CHRONIC_CARE'
          ? 'bg-gradient-to-r from-teal-700 to-cyan-900 border-teal-900'
          : 'bg-gradient-to-r from-emerald-700 to-teal-800 border-emerald-900'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
              {patient.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{patient.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                  {cardType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80 mt-1 flex-wrap font-medium">
                <span>Member ID: <strong className="text-white">{patient.memberId}</strong></span>
                <span>•</span>
                <span>Card No: <strong className="text-white">{card?.cardNumber || 'None'}</strong></span>
                <span>•</span>
                <span>Age: <strong className="text-white">{new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs ({patient.sex})</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={onPrintCard}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 backdrop-blur-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print PVC Card</span>
            </button>
            {card && card.status === 'ACTIVE' && (
              <button
                onClick={handleCardBlock}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600/40 hover:bg-rose-600/60 text-white text-xs font-semibold rounded-xl border border-rose-300/30 transition-colors"
              >
                <Ban className="w-4 h-4" />
                <span>Block Card</span>
              </button>
            )}
            {card && (card.status === 'BLOCKED' || card.status === 'LOST') && (
              <button
                onClick={() => setShowReplaceModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <CreditCard className="w-4 h-4" />
                <span>Issue Replacement Card</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Status & Entitlement Bar */}
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-500 font-medium">Card Status: </span>
            {getStatusBadge()}
          </div>
          <div>
            <span className="text-slate-500 font-medium">Expiry: </span>
            <span className="font-semibold text-slate-800">{card?.expiryDate || 'N/A'}</span>
          </div>
        </div>
        <div className="text-slate-500">
          Phone: <span className="font-semibold text-slate-800 font-mono">{patient.phone}</span>
        </div>
      </div>

      {/* ======================= RETURNING PATIENT FOUND BANNER ======================= */}
      <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-b border-teal-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-teal-700 text-white shadow-2xs">
                  RETURNING PATIENT FOUND
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {patient.memberId}
                </span>
                <span className="text-xs text-slate-500">
                  Registered: {patient.registrationDate}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                "REGISTER THE PATIENT ONCE — RECORD EVERY VISIT SEPARATELY" • Permanent Master ID: <strong className="font-mono text-slate-900">{patient.id}</strong>
              </p>
            </div>
          </div>

          <div className="text-left md:text-right text-xs">
            <span className="text-slate-500 block text-[11px]">Last Visit Recorded:</span>
            {lastVisit ? (
              <strong className="text-slate-900 font-bold block">
                {lastVisit.visitSequence || 'Visit'} on {new Date(lastVisit.createdAt).toLocaleDateString('en-GB')} ({lastVisit.reasonForVisit || lastVisit.serviceName})
              </strong>
            ) : (
              <span className="text-slate-400 italic">No previous visits logged yet</span>
            )}
            <span className="text-[11px] text-teal-800 font-semibold">
              Total Recorded Encounters: {patientVisits.length}
            </span>
          </div>
        </div>

        {/* Reception Alerts if any */}
        {(patient.receptionAlerts && patient.receptionAlerts.length > 0) && (
          <div className="p-3 bg-white/80 rounded-xl border border-teal-200/60 text-xs flex flex-wrap items-center gap-2">
            <span className="font-bold text-teal-900 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Reception Alerts:
            </span>
            {patient.receptionAlerts.map((alert, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold border border-amber-200">
                {alert}
              </span>
            ))}
          </div>
        )}

        {/* 4 PRIMARY RETURNING PATIENT ACTION BUTTONS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Action 1: View Patient History */}
          <button
            type="button"
            onClick={onViewHistory}
            className="p-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-teal-500 rounded-2xl shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-100 group-hover:bg-teal-600 text-teal-800 group-hover:text-white flex items-center justify-center mb-1.5 transition-colors">
              <History className="w-4 h-4" />
            </div>
            <strong className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
              VIEW PATIENT HISTORY
            </strong>
            <span className="text-[10px] text-slate-500 mt-0.5">
              HMIS longitudinal record
            </span>
          </button>

          {/* Action 2: Start New Visit */}
          <button
            type="button"
            onClick={onRecordVisit}
            className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-600 rounded-2xl shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-4 h-4" />
            </div>
            <strong className="text-xs font-black tracking-wide text-white">
              START NEW VISIT
            </strong>
            <span className="text-[10px] text-white/80 mt-0.5 font-medium">
              Today's new encounter
            </span>
          </button>

          {/* Action 3: Update Patient Details */}
          <button
            type="button"
            onClick={onUpdateDetails}
            className="p-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-blue-500 rounded-2xl shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-100 group-hover:bg-blue-600 text-blue-800 group-hover:text-white flex items-center justify-center mb-1.5 transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
            <strong className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
              UPDATE PATIENT DETAILS
            </strong>
            <span className="text-[10px] text-slate-500 mt-0.5">
              Phone, address, next of kin
            </span>
          </button>

          {/* Action 4: Replace / Report Lost Card */}
          <button
            type="button"
            onClick={() => setShowReplaceModal(true)}
            className="p-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-amber-500 rounded-2xl shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 group-hover:bg-amber-600 text-amber-800 group-hover:text-white flex items-center justify-center mb-1.5 transition-colors">
              <CreditCard className="w-4 h-4" />
            </div>
            <strong className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
              REPLACE / REPORT CARD
            </strong>
            <span className="text-[10px] text-slate-500 mt-0.5">
              Lost / damaged card reissue
            </span>
          </button>
        </div>
      </div>

      {/* Main Body: Conditional based on Card Type */}
      <div className="p-6">
        {/* ======================= 1. HEALTH PACKAGE CARD ======================= */}
        {cardType === 'HEALTH_PACKAGE' && (
          <div className="space-y-6">
            {membership ? (
              <>
                {/* Dynamic Visit Calculation Formula: Visits Remaining = Visits Purchased – Valid Covered Visits Used */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Enrolled Package</p>
                    <p className="text-base font-bold text-slate-900 mt-1">{membership.packageName}</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      {membership.isFamilyPackage ? 'Family Membership' : 'Individual Membership'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Visits Purchased</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{membership.visitsPurchased}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Configured entitlement</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Visits Used</p>
                    <p className="text-2xl font-black text-slate-700 mt-1">{membership.visitsUsed}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Audited clinical visits</p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="text-xs font-bold text-emerald-800">Visits Remaining</p>
                    <p className="text-3xl font-black text-emerald-900 mt-1">
                      {Math.max(0, membership.visitsPurchased - membership.visitsUsed)}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      Formula: Purchased – Used
                    </p>
                  </div>
                </div>

                {/* Primary Actions for Health Package Card */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={onRecordVisit}
                    disabled={membership.visitsRemaining <= 0 || card?.status !== 'ACTIVE'}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Use Covered Visit</span>
                  </button>

                  <button
                    onClick={onRecordPayment}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Record Payment / Package Renewal</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                <p className="font-semibold text-base">No active package membership attached</p>
                <p className="text-xs mt-1 text-amber-800">
                  This patient has a registered card but has not yet purchased an active package membership.
                </p>
                <button
                  onClick={onRecordPayment}
                  className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold"
                >
                  Purchase Membership Package
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================= 2. CHRONIC DISEASE CARE CARD ======================= */}
        {cardType === 'CHRONIC_CARE' && (
          <div className="space-y-6">
            {chronicMembership ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Condition Program</p>
                    <p className="text-base font-bold text-slate-900 mt-1">{chronicMembership.condition}</p>
                    <p className="text-[11px] text-teal-700 font-medium mt-0.5">{chronicMembership.programName}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Current Paid Month</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">{chronicMembership.currentPaidMonth}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PAID &amp; ACTIVE
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Renewal Date</p>
                    <p className="text-base font-bold text-slate-900 mt-1">{chronicMembership.renewalDate}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Monthly cycle payment</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Next Clinical Review</p>
                    <p className="text-base font-bold text-teal-800 mt-1">{chronicMembership.nextReviewDate}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Doctor appointment</p>
                  </div>
                </div>

                {/* Chronic Disease Specific Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                      <Pill className="w-4 h-4 text-teal-600" />
                      <span>Current Maintained Medications</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {chronicMembership.currentMedications.map((med, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          <span>{med}</span>
                        </li>
                      ))}
                    </ul>
                    {chronicMembership.lastPickupDate && (
                      <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                        Last Medication Pickup: <strong className="text-slate-700">{chronicMembership.lastPickupDate}</strong>
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                      <Heart className="w-4 h-4 text-teal-600" />
                      <span>Latest Clinical Vitals &amp; Notes</span>
                    </div>
                    {chronicMembership.consultationHistory && chronicMembership.consultationHistory.length > 0 ? (
                      <div className="text-xs text-slate-700 space-y-1">
                        <div className="font-semibold text-slate-900">
                          {chronicMembership.consultationHistory[0].bpOrVitals}
                        </div>
                        <p className="text-slate-600 italic">"{chronicMembership.consultationHistory[0].notes}"</p>
                        <p className="text-[10px] text-slate-400">
                          Recorded on {chronicMembership.consultationHistory[0].date} by {chronicMembership.consultationHistory[0].doctor}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No previous recorded consultations yet.</p>
                    )}
                  </div>
                </div>

                {/* Chronic Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={onRenewChronic}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Renew Month &amp; Record Payment</span>
                  </button>

                  <button
                    onClick={onMedicationPickup}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <Pill className="w-4 h-4" />
                    <span>Record Medication Pickup</span>
                  </button>

                  <button
                    onClick={onChronicConsultation}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Record Clinical Review / Vitals</span>
                  </button>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm">Chronic care membership details loading...</p>
            )}
          </div>
        )}

        {/* ======================= 3. SICKLE CELL CLINICAL CARD ======================= */}
        {cardType === 'SICKLE_CELL' && (
          <div className="space-y-6">
            {/* STRICT CLINICAL IDENTIFICATION: STRICTLY NO PAYMENT BALANCES OR TRANSACTION UI */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>CLINICAL IDENTIFICATION CARD:</strong> This card identifies the sickle cell patient and retrieves emergency care protocols. It does not track money, e-wallets, or package payments.
              </span>
            </div>

            {sickleCellProfile ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Genotype</p>
                    <p className="text-2xl font-black text-rose-700 mt-1">{sickleCellProfile.genotype}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Sickle cell disease</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Blood Group</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{sickleCellProfile.bloodGroup}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Transfusion safety</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Baseline Weight</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{sickleCellProfile.baselineWeightKg} kg</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pediatric/adult dosing</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Next Review Date</p>
                    <p className="text-base font-bold text-rose-800 mt-1">{sickleCellProfile.nextReviewDate}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Scheduled clinic</p>
                  </div>
                </div>

                {/* Important Clinical Alerts & Allergies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
                    <div className="flex items-center gap-2 text-sm font-bold text-rose-900 mb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Important Clinical Alerts</span>
                    </div>
                    <ul className="space-y-1 text-xs text-rose-800">
                      {sickleCellProfile.clinicalAlerts.map((alert, i) => (
                        <li key={i} className="flex items-start gap-1.5 font-medium">
                          <span className="text-rose-500">•</span>
                          <span>{alert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-900 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Allergies &amp; Contraindications</span>
                    </div>
                    <ul className="space-y-1 text-xs text-amber-800">
                      {sickleCellProfile.allergies.map((alg, i) => (
                        <li key={i} className="flex items-start gap-1.5 font-semibold">
                          <span className="text-amber-500">•</span>
                          <span>{alg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Emergency Protocol & Medications */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Crisis Triage &amp; Emergency Protocol</p>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed font-mono bg-white p-2.5 rounded-lg border border-slate-200">
                    {sickleCellProfile.emergencyProtocol}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">Current Prophylaxis &amp; Maintenance Medications</p>
                  <div className="flex flex-wrap gap-2">
                    {sickleCellProfile.currentMedications.map((med, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-800 border border-slate-200">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sickle Cell Clinical Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={onSickleCellConsultation}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Record Sickle Cell Consultation / Crisis Log</span>
                  </button>

                  <button
                    onClick={onMedicationPickup}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <Pill className="w-4 h-4" />
                    <span>Record Hydroxyurea / Prophylaxis Refill</span>
                  </button>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm">Sickle cell clinical profile loading...</p>
            )}
          </div>
        )}
      </div>

      {/* Replacement Card Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Issue Replacement Card</h3>
            <p className="text-xs text-slate-500 mt-1">
              The old card (<strong>{card?.cardNumber}</strong>) will be permanently deactivated. A new card will be issued and linked to patient <strong>{patient.fullName}</strong>. No duplicate patient will be created.
            </p>

            <form onSubmit={handleCardReplaceSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Replacement <span className="text-rose-500">*</span>
                </label>
                <select
                  value={replacementReason}
                  onChange={e => setReplacementReason(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select reason...</option>
                  <option value="Lost physical card">Lost physical card</option>
                  <option value="Stolen card reported by patient">Stolen card reported by patient</option>
                  <option value="Damaged barcode / worn PVC card">Damaged barcode / worn PVC card</option>
                  <option value="Card chip / NFC malfunction">Card chip / NFC malfunction</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReplaceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                >
                  Confirm &amp; Issue New Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
