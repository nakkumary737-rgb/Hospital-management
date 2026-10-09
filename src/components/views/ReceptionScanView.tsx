import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { hardwareScanner } from '../../services/hardwareScanner';
import { ScannedCardView } from '../scanner/ScannedCardView';
import { CardScannerModal } from '../scanner/CardScannerModal';
import { RecordPaymentModal } from '../payments/RecordPaymentModal';
import { PvcCardPreviewModal } from '../cards/PvcCardPreviewModal';
import { ReceptionHistoryModal } from '../reception/ReceptionHistoryModal';
import { FastVisitModal } from '../reception/FastVisitModal';
import { DemographicUpdateModal } from '../reception/DemographicUpdateModal';
import { DuplicatePatientModal } from '../reception/DuplicatePatientModal';
import { RegisterPatientModal } from '../patients/RegisterPatientModal';
import {
  ChronicConsultationModal,
  MedicationPickupModal,
  SickleCellConsultationModal
} from '../clinical/ClinicalActionModals';
import {
  QrCode,
  Search,
  Radio,
  Sparkles,
  CreditCard,
  UserPlus,
  ShieldCheck,
  HeartPulse,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Stethoscope,
  Users,
  Clock,
  Calendar,
  Activity,
  Receipt,
  RotateCcw,
  ArrowRight,
  Database,
  ClipboardList,
  Scan,
  Check
} from 'lucide-react';
import { Patient, PaymentMethod } from '../../types';

interface ReceptionScanViewProps {
  initialQuery?: string;
  onClearInitialQuery?: () => void;
  onNewPatient?: () => void;
  onNavigateToHMIS?: () => void;
}

export const ReceptionScanView: React.FC<ReceptionScanViewProps> = ({
  initialQuery,
  onClearInitialQuery,
  onNewPatient,
  onNavigateToHMIS
}) => {
  const {
    findCardOrPatient,
    cards,
    patients,
    visits,
    memberships,
    payments,
    renewChronicMembership,
    isOnline,
    showToast
  } = useApp();

  const [activeQuery, setActiveQuery] = useState<string>(initialQuery || (cards[0]?.cardNumber ?? ''));
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showInternalRegisterModal, setShowInternalRegisterModal] = useState(false);
  const [externalScannerActive, setExternalScannerActive] = useState(false);

  // Reception Modals
  const [showFastVisitModal, setShowFastVisitModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDemographicModal, setShowDemographicModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Secondary Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPvcModal, setShowPvcModal] = useState(false);
  const [showChronicConsultModal, setShowChronicConsultModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showSickleConsultModal, setShowSickleConsultModal] = useState(false);

  // Active filter tab for dashboard overview
  const [receptionFilter, setReceptionFilter] = useState<'scan' | 'hmis_register' | 'today_patients' | 'waiting_queue' | 'package_visits' | 'recent_visits'>('scan');

  // Connect global USB/Bluetooth Hardware Barcode & QR Scanner listener
  useEffect(() => {
    const unsub = hardwareScanner.addListener(scannedCode => {
      setExternalScannerActive(true);
      handleScanDone(scannedCode);
      setTimeout(() => setExternalScannerActive(false), 2500);
    });

    return () => {
      unsub();
    };
  }, []);

  // Lookup results
  const scannedResult = findCardOrPatient(activeQuery);

  const handleScanDone = (q: string) => {
    setActiveQuery(q);
    setReceptionFilter('scan');
    if (onClearInitialQuery) onClearInitialQuery();
  };

  const handleRenewChronic = () => {
    if (!scannedResult?.chronicMembership) return;
    const targetMonth = 'November 2026';
    const method: PaymentMethod = 'Mobile Money';
    renewChronicMembership(
      scannedResult.chronicMembership.id,
      targetMonth,
      method,
      `MTN-RENEW-${Math.floor(100000 + Math.random() * 900000)}`
    );
    showToast(`Membership for ${scannedResult.patient?.fullName} renewed for ${targetMonth}! Receipt issued.`, 'success');
  };

  // Dashboard Stats Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter(v => v.createdAt.startsWith(todayStr));
  const todayPatientsCount = new Set(todayVisits.map(v => v.patientId)).size;
  const todayPackageVisits = todayVisits.filter(v => v.visitDeducted);
  const activeMembershipsCount = memberships.filter(m => m.status === 'ACTIVE').length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 11. RECEPTION DASHBOARD HEADER & QUICK STATS BAR                          */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Reception Desk &amp; Patient Identification Hub
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  Kitende – Mwenda Stage
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                "Register the Patient Once — Record Every Visit Separately" • Fast card scanning &amp; history retrieval
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
            {onNavigateToHMIS && (
              <button
                onClick={onNavigateToHMIS}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                title="Open MOH HMIS Outpatient Register"
              >
                <ClipboardList className="w-4 h-4" />
                <span>HMIS Data Register</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onNewPatient) onNewPatient();
                else setShowInternalRegisterModal(true);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Patient Registration</span>
            </button>

            <button
              onClick={() => setShowScannerModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan / Tap Afya Card</span>
            </button>
          </div>
        </div>

        {/* 11. RECEPTION DASHBOARD STATS TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div
            onClick={() => setReceptionFilter('today_patients')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              receptionFilter === 'today_patients'
                ? 'bg-teal-50 border-teal-500 shadow-2xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Today's Patients</span>
            <span className="text-xl font-black text-slate-900 block mt-0.5">{todayPatientsCount}</span>
            <span className="text-[10px] text-teal-700 font-medium">Distinct attendees</span>
          </div>

          <div
            onClick={() => setReceptionFilter('waiting_queue')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              receptionFilter === 'waiting_queue'
                ? 'bg-teal-50 border-teal-500 shadow-2xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Waiting Patients</span>
            <span className="text-xl font-black text-emerald-700 block mt-0.5">{todayVisits.length}</span>
            <span className="text-[10px] text-emerald-800 font-medium">Queue slips issued</span>
          </div>

          <div
            onClick={() => setReceptionFilter('package_visits')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              receptionFilter === 'package_visits'
                ? 'bg-teal-50 border-teal-500 shadow-2xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Today's Package Visits</span>
            <span className="text-xl font-black text-teal-800 block mt-0.5">{todayPackageVisits.length}</span>
            <span className="text-[10px] text-teal-700 font-medium">Entitlement redeemed</span>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Pending Payments</span>
            <span className="text-xl font-black text-amber-700 block mt-0.5">{pendingPaymentsCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">Copays awaiting</span>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Memberships</span>
            <span className="text-xl font-black text-slate-900 block mt-0.5">{activeMembershipsCount}</span>
            <span className="text-[10px] text-emerald-700 font-medium">Enrolled packages</span>
          </div>

          <div
            onClick={() => setReceptionFilter('recent_visits')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              receptionFilter === 'recent_visits'
                ? 'bg-teal-50 border-teal-500 shadow-2xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Recent Visits</span>
            <span className="text-xl font-black text-slate-900 block mt-0.5">{visits.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">Total audit history</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. & 9. SEARCH / CARD SCANNER BAR WITH MULTI-FIELD PATIENT MATCHING       */}
        {/* ========================================================================= */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-col md:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={activeQuery}
                onChange={e => {
                  setActiveQuery(e.target.value);
                  setReceptionFilter('scan');
                }}
                placeholder="Search patient by Card Number (AFY-CRD-...), Member ID (AFY-...), Full Name, Phone, or DOB (YYYY-MM-DD)..."
                className="w-full text-xs sm:text-sm font-medium rounded-2xl border-2 border-slate-200 pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 focus:bg-white shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <button
              onClick={() => setShowScannerModal(true)}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 shadow-xs shrink-0 w-full md:w-auto justify-center"
            >
              <QrCode className="w-4 h-4" />
              <span>Camera Scan</span>
            </button>
          </div>

          {/* Quick Active Patient Chips */}
          {patients.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>Existing Patient Registry:</span>
              </span>
              {patients.slice(0, 6).map(p => {
                const c = cards.find(card => card.patientId === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveQuery(c?.cardNumber || p.memberId);
                      setReceptionFilter('scan');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      (activeQuery.toLowerCase().includes(p.memberId.toLowerCase()) || activeQuery.toLowerCase().includes(p.fullName.toLowerCase()))
                        ? 'bg-teal-600 text-white border-teal-700 shadow-2xs'
                        : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{p.fullName}</span>
                    <span className="font-mono text-[10px] opacity-75">({p.memberId})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 9. DUPLICATE PATIENT DETECTED WARNING BANNER                              */}
      {/* ========================================================================= */}
      {scannedResult?.duplicateCandidates && scannedResult.duplicateCandidates.length > 1 && (
        <div className="p-4 bg-amber-500 text-slate-950 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">POSSIBLE DUPLICATE PATIENT DETECTED</h3>
              <p className="text-xs text-slate-900">
                Found {scannedResult.duplicateCandidates.length} matching patients for "{activeQuery}". Do not create a new patient.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDuplicateModal(true)}
            className="px-4 py-2 bg-slate-950 text-amber-400 hover:bg-slate-900 font-bold rounded-xl text-xs transition-colors shrink-0 flex items-center justify-center gap-1"
          >
            <span>Resolve &amp; Select Patient</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROMINENT WORKFLOW BANNER: SCAN CARD → IDENTIFY → REVIEW → START VISIT   */}
      {/* ========================================================================= */}
      <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-slate-900 to-teal-950 text-white flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-emerald-400 text-xs tracking-wider">
            PRIMARY RECEPTION FLOW:
          </span>
          <span className="text-slate-300 font-medium">
            1. SCAN AFYA CARD &rarr; 2. RETRIEVE MASTER PATIENT &rarr; 3. REVIEW PERMITTED HISTORY &rarr; 4. START TODAY'S VISIT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-300 font-mono">
            Reception Hub Online • Afya Kitende
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN VIEW AREA: SCANNED PATIENT CARD VIEW OR FILTERED QUEUES              */}
      {/* ========================================================================= */}
      {receptionFilter === 'scan' && (
        <>
          {scannedResult && scannedResult.patient ? (
            <ScannedCardView
              data={{ ...scannedResult, patient: scannedResult.patient }}
              onRecordVisit={() => setShowFastVisitModal(true)}
              onViewHistory={() => setShowHistoryModal(true)}
              onUpdateDetails={() => setShowDemographicModal(true)}
              onRecordPayment={() => setShowPaymentModal(true)}
              onRenewChronic={handleRenewChronic}
              onMedicationPickup={() => setShowPickupModal(true)}
              onChronicConsultation={() => setShowChronicConsultModal(true)}
              onSickleCellConsultation={() => setShowSickleConsultModal(true)}
              onPrintCard={() => setShowPvcModal(true)}
            />
          ) : activeQuery.trim() ? (
            <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border-2 border-amber-300 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-lg text-slate-900">
                  No Patient Record Found for &ldquo;{activeQuery}&rdquo;
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  This card number or identifier is not yet registered in the Afya Medicare system. You can register the patient now and assign this card immediately.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (onNewPatient) onNewPatient();
                    else setShowInternalRegisterModal(true);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Patient with this Card</span>
                </button>
                <button
                  onClick={() => handleScanDone('')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                <CreditCard className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">Awaiting Card Scan or Patient Search</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Zap a physical Afya PVC card with any USB / Bluetooth barcode scanner gun, tap an NFC card reader, or enter the Member ID, Card Number, Phone, or Patient Name above.
                </p>
              </div>

              {/* Hardware Scanner Active Status Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>EXTERNAL SCANNER LISTENER READY (USB / BLUETOOTH HID)</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Launch QR Scanner</span>
                </button>
                <button
                  onClick={() => {
                    if (onNewPatient) onNewPatient();
                    else setShowInternalRegisterModal(true);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register New Patient</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Filter Tab: Today's Patients / Waiting Queue / Package Visits / Recent Visits */}
      {receptionFilter !== 'scan' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900">
                {receptionFilter === 'today_patients' && "Today's Patient Attendances"}
                {receptionFilter === 'waiting_queue' && "Waiting Patients Queue"}
                {receptionFilter === 'package_visits' && "Today's Covered Package Encounters"}
                {receptionFilter === 'recent_visits' && "Recent Longitudinal Patient Encounters"}
              </span>
            </div>
            <button
              onClick={() => setReceptionFilter('scan')}
              className="text-xs text-teal-700 font-bold hover:underline"
            >
              &larr; Back to Card Scanner
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Encounter</th>
                  <th className="py-2.5 px-3">Patient Name</th>
                  <th className="py-2.5 px-3">Complaint / Service</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Coverage</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(receptionFilter === 'package_visits'
                  ? todayPackageVisits
                  : receptionFilter === 'today_patients' || receptionFilter === 'waiting_queue'
                  ? todayVisits
                  : visits
                ).map(v => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-slate-800">{v.visitSequence || v.id}</span>
                      {v.queueNumber && <span className="block text-[10px] text-teal-700 font-bold">{v.queueNumber}</span>}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{v.patientName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{v.reasonForVisit || v.serviceName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                        {v.department}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {v.paymentStatus || 'Covered'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setActiveQuery(v.patientId);
                          setReceptionFilter('scan');
                        }}
                        className="text-teal-700 font-bold hover:underline"
                      >
                        Inspect Patient &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS & WORKFLOWS                                                        */}
      {/* ========================================================================= */}

      {/* 1. Camera / Optical Scanner & NFC Tap Modal */}
      {showScannerModal && (
        <CardScannerModal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          onCardFound={handleScanDone}
        />
      )}

      {/* 2. Returning Patient Dedicated History Screen (Section 5 & 6) */}
      {showHistoryModal && scannedResult?.patient && (
        <ReceptionHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          patient={scannedResult.patient}
          card={scannedResult.card}
          membership={scannedResult.membership}
          onStartNewVisit={() => setShowFastVisitModal(true)}
        />
      )}

      {/* 3. Fast Returning-Patient Mode Modal (Section 3, 4, 7, 12) */}
      {showFastVisitModal && scannedResult?.patient && (
        <FastVisitModal
          isOpen={showFastVisitModal}
          onClose={() => setShowFastVisitModal(false)}
          patient={scannedResult.patient}
          card={scannedResult.card}
          membership={scannedResult.membership}
          chronicMembership={scannedResult.chronicMembership}
          sickleCellProfile={scannedResult.sickleCellProfile}
        />
      )}

      {/* 4. Demographic Update Modal with Audit Logging (Section 13) */}
      {showDemographicModal && scannedResult?.patient && (
        <DemographicUpdateModal
          isOpen={showDemographicModal}
          onClose={() => setShowDemographicModal(false)}
          patient={scannedResult.patient}
        />
      )}

      {/* 5. Duplicate Patient Resolver Modal (Section 9) */}
      {showDuplicateModal && scannedResult?.duplicateCandidates && (
        <DuplicatePatientModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          candidates={scannedResult.duplicateCandidates}
          onSelectPatient={p => {
            setActiveQuery(p.memberId);
            setShowDuplicateModal(false);
          }}
        />
      )}

      {/* 6. PVC Card Print Preview Modal */}
      {showPvcModal && scannedResult?.patient && scannedResult?.card && (
        <PvcCardPreviewModal
          isOpen={showPvcModal}
          onClose={() => setShowPvcModal(false)}
          card={scannedResult.card}
          patient={scannedResult.patient}
        />
      )}

      {/* 7. Record Payment Modal */}
      {showPaymentModal && scannedResult?.patient && (
        <RecordPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          patient={scannedResult.patient}
          membership={scannedResult.membership}
          chronicMembership={scannedResult.chronicMembership}
        />
      )}

      {/* 8. Chronic Care Consultation Modal */}
      {showChronicConsultModal && scannedResult?.chronicMembership && (
        <ChronicConsultationModal
          isOpen={showChronicConsultModal}
          onClose={() => setShowChronicConsultModal(false)}
          chronicMembership={scannedResult.chronicMembership}
        />
      )}

      {/* 9. Medication Pickup Refill Modal */}
      {showPickupModal && scannedResult?.chronicMembership && (
        <MedicationPickupModal
          isOpen={showPickupModal}
          onClose={() => setShowPickupModal(false)}
          membershipId={scannedResult.chronicMembership.id}
          defaultMedications={scannedResult.chronicMembership.currentMedications}
        />
      )}

      {/* 10. Sickle Cell Clinical Consultation Modal */}
      {showSickleConsultModal && scannedResult?.sickleCellProfile && (
        <SickleCellConsultationModal
          isOpen={showSickleConsultModal}
          onClose={() => setShowSickleConsultModal(false)}
          profile={scannedResult.sickleCellProfile}
        />
      )}

      {/* 11. Register Patient Modal (if launched from reception) */}
      {showInternalRegisterModal && (
        <RegisterPatientModal
          isOpen={showInternalRegisterModal}
          onClose={() => setShowInternalRegisterModal(false)}
          onSelectExistingPatient={p => {
            setActiveQuery(p.memberId);
            setShowInternalRegisterModal(false);
          }}
        />
      )}
    </div>
  );
};
