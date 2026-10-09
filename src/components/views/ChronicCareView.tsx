import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChronicMembership, ChronicProgram, PaymentMethod } from '../../types';
import {
  Activity,
  Heart,
  Calendar,
  Pill,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Clock,
  Printer,
  Trash2,
  UserPlus
} from 'lucide-react';
import {
  ChronicConsultationModal,
  MedicationPickupModal
} from '../clinical/ClinicalActionModals';

interface ChronicCareViewProps {
  onScanCard: (cardNumber: string) => void;
  onOpenCardPreview: (cardId: string) => void;
}

export const ChronicCareView: React.FC<ChronicCareViewProps> = ({
  onScanCard,
  onOpenCardPreview
}) => {
  const {
    chronicPrograms,
    chronicMemberships,
    patients,
    cards,
    renewChronicMembership,
    saveChronicProgram,
    deleteChronicProgram,
    enrollChronicMembership,
    deleteChronicMembership,
    confirmAction,
    showToast
  } = useApp();

  const [selectedChronicId, setSelectedChronicId] = useState<string | null>(
    chronicMemberships[0]?.id || null
  );

  // Modals
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // Enrollment form state
  const [enrollPatientId, setEnrollPatientId] = useState(patients[0]?.id || '');
  const [enrollProgramId, setEnrollProgramId] = useState(chronicPrograms[0]?.id || '');
  const [enrollCondition, setEnrollCondition] = useState('Hypertension Management');
  const [enrollMeds, setEnrollMeds] = useState('Amlodipine 5mg OD\nLosartan 50mg OD');

  // Renewal form
  const [renewalMonth, setRenewalMonth] = useState('November 2026');
  const [renewalMethod, setRenewalMethod] = useState<PaymentMethod>('Mobile Money');
  const [renewalRef, setRenewalRef] = useState('MTN-MM-RENEW-');

  const activeChronic =
    chronicMemberships.find(c => c.id === selectedChronicId) || chronicMemberships[0];
  const patient = activeChronic ? patients.find(p => p.id === activeChronic.patientId) : undefined;
  const card = patient ? cards.find(c => c.patientId === patient.id && c.cardType === 'CHRONIC_CARE') : undefined;
  const program = activeChronic ? chronicPrograms.find(p => p.id === activeChronic.programId) : undefined;

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollPatientId || !enrollProgramId) return;

    const medList = enrollMeds
      .split('\n')
      .map(m => m.trim())
      .filter(Boolean);

    const enrolled = enrollChronicMembership(
      enrollPatientId,
      enrollProgramId,
      enrollCondition,
      medList
    );

    setSelectedChronicId(enrolled.id);
    setShowEnrollModal(false);
    showToast('Patient successfully enrolled in Chronic Disease Care Program! Card & profile are now active.', 'success');
  };

  const handleDeleteChronicMembership = (cm: ChronicMembership) => {
    const targetPatient = patients.find(p => p.id === cm.patientId);
    confirmAction({
      title: 'Delete Chronic Care Enrollment',
      message: `Are you sure you want to permanently delete the chronic care enrollment for ${targetPatient?.fullName || 'this patient'} (${cm.condition})?\n\nThis will remove the enrollment record and active package status.`,
      confirmLabel: 'Delete Enrollment',
      variant: 'danger',
      onConfirm: () => {
        deleteChronicMembership(cm.id);
        if (selectedChronicId === cm.id) {
          setSelectedChronicId(null);
        }
        showToast('Chronic care enrollment was removed.', 'info');
      }
    });
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChronic) return;

    renewChronicMembership(
      activeChronic.id,
      renewalMonth,
      renewalMethod,
      renewalRef + Math.floor(10000 + Math.random() * 90000)
    );

    setShowRenewModal(false);
    showToast(`Membership for ${patient?.fullName} renewed for ${renewalMonth}! Receipt generated.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Chronic Disease Care Programs</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Hypertension, Diabetes &amp; Respiratory Wellness with monthly renewal tracking &amp; medication pickups
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">
            {chronicMemberships.length} Enrolled Chronic Patients
          </span>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Patient</span>
          </button>
        </div>
      </div>

      {/* Program Profiles Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {chronicPrograms.map(prog => (
          <div key={prog.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900">{prog.name}</span>
              <span className="font-mono text-xs font-bold text-slate-900">
                UGX {prog.monthlyFee.toLocaleString()}/mo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">{prog.description}</p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>Visits: {prog.visitRule === 'unlimited' ? 'Unlimited' : `${prog.definedVisits}/mo`}</span>
              <span className="text-emerald-700 font-medium">Monthly Refill Program</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Patient List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Enrolled Chronic Members ({chronicMemberships.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {chronicMemberships.map(cm => {
              const p = patients.find(pat => pat.id === cm.patientId);
              const isSelected = activeChronic?.id === cm.id;

              return (
                <button
                  key={cm.id}
                  onClick={() => setSelectedChronicId(cm.id)}
                  className={`w-full text-left p-4 transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-teal-50/80 border-l-4 border-teal-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{p?.fullName || 'Patient'}</span>
                      <span className="font-mono text-[10px] text-slate-500">{p?.memberId}</span>
                    </div>

                    <div className="text-[11px] text-teal-800 font-medium">{cm.condition}</div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                      <span>Paid Month: <strong className="text-slate-800">{cm.currentPaidMonth}</strong></span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cm.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cm.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chronic Patient Care Dashboard (7 cols) */}
        {activeChronic && patient ? (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
            {/* Top Identity Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white font-black text-2xl flex items-center justify-center shadow-sm">
                  {patient.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{patient.fullName}</h2>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">
                      {activeChronic.condition}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Member ID: <strong className="text-slate-800">{patient.memberId}</strong> • Phone: {patient.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {card && (
                  <>
                    <button
                      onClick={() => onOpenCardPreview(card.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Card</span>
                    </button>
                    <button
                      onClick={() => onScanCard(card.cardNumber)}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-2xs"
                    >
                      Scan Desk
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteChronicMembership(activeChronic)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete Chronic Care Enrollment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monthly Status Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-semibold">PAID MONTH</span>
                <strong className="text-sm text-slate-900 mt-0.5 block">{activeChronic.currentPaidMonth}</strong>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-semibold">MONTHLY FEE</span>
                <strong className="text-sm text-slate-900 mt-0.5 block font-mono">
                  UGX {program?.monthlyFee.toLocaleString()}
                </strong>
                <span className="text-[10px] text-slate-400">Fixed rate</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-semibold">RENEWAL DUE</span>
                <strong className="text-sm text-slate-900 mt-0.5 block">{activeChronic.renewalDate}</strong>
                <span className="text-[10px] text-slate-400">30-day cycle</span>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <span className="text-[10px] text-teal-800 block font-bold">NEXT DOCTOR REVIEW</span>
                <strong className="text-sm text-teal-900 mt-0.5 block">{activeChronic.nextReviewDate}</strong>
                <span className="text-[10px] text-teal-700">Clinical appointment</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setShowRenewModal(true)}
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Renew Monthly Membership</span>
              </button>

              <button
                onClick={() => setShowPickupModal(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Pill className="w-4 h-4" />
                <span>Dispense Medication Refill</span>
              </button>

              <button
                onClick={() => setShowConsultationModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Record Clinical Vitals</span>
              </button>
            </div>

            {/* Current Medications */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>Maintained Medications &amp; Formulary:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {activeChronic.currentMedications.map((med, i) => (
                  <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
                    {med}
                  </span>
                ))}
              </div>
              {activeChronic.lastPickupDate && (
                <div className="text-[11px] text-slate-500 pt-1">
                  Last recorded dispensing date: <strong>{activeChronic.lastPickupDate}</strong>
                </div>
              )}
            </div>

            {/* Consultation and Vitals History */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Clinical Reviews &amp; Blood Pressure Log
              </h4>

              <div className="space-y-2 text-xs">
                {activeChronic.consultationHistory && activeChronic.consultationHistory.length > 0 ? (
                  activeChronic.consultationHistory.map((c, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-900 font-mono text-xs">{c.bpOrVitals}</strong>
                        <span className="text-[10px] text-slate-400">{c.date} • {c.doctor}</span>
                      </div>
                      <p className="text-slate-600 italic">"{c.notes}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs">No recorded reviews yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* RENEW MONTHLY MODAL */}
      {showRenewModal && activeChronic && patient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              Renew Monthly Chronic Care: {patient.fullName}
            </h3>
            <p className="text-slate-500">
              Enrolled in {activeChronic.condition}. Fee: <strong>UGX {program?.monthlyFee.toLocaleString()}</strong>.
            </p>

            <form onSubmit={handleRenewSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Renewal Month</label>
                <input
                  type="text"
                  required
                  value={renewalMonth}
                  onChange={e => setRenewalMonth(e.target.value)}
                  placeholder="e.g. November 2026"
                  className="w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={renewalMethod}
                  onChange={e => setRenewalMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white"
                >
                  <option value="Mobile Money">Mobile Money (MTN / Airtel)</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Card/POS">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">External Payment Reference</label>
                <input
                  type="text"
                  value={renewalRef}
                  onChange={e => setRenewalRef(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold shadow-sm"
                >
                  Confirm Renewal &amp; Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modals */}
      {showConsultationModal && activeChronic && (
        <ChronicConsultationModal
          isOpen={true}
          onClose={() => setShowConsultationModal(false)}
          chronicMembership={activeChronic}
        />
      )}

      {showPickupModal && activeChronic && (
        <MedicationPickupModal
          isOpen={true}
          onClose={() => setShowPickupModal(false)}
          membershipId={activeChronic.id}
          defaultMedications={activeChronic.currentMedications}
        />
      )}

      {/* ENROLL PATIENT IN CHRONIC CARE MODAL */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Enroll Patient in Chronic Care</h3>
                  <p className="text-[11px] text-slate-500">Links member account to monthly refill &amp; clinical reviews</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient</label>
                <select
                  required
                  value={enrollPatientId}
                  onChange={e => setEnrollPatientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white font-medium"
                >
                  <option value="">-- Choose Member --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.memberId}) - {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Program</label>
                <select
                  required
                  value={enrollProgramId}
                  onChange={e => {
                    setEnrollProgramId(e.target.value);
                    const selectedProg = chronicPrograms.find(cp => cp.id === e.target.value);
                    if (selectedProg) {
                      setEnrollCondition(selectedProg.name);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white font-medium"
                >
                  {chronicPrograms.map(prog => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name} — UGX {prog.monthlyFee.toLocaleString()}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Condition / Diagnosis</label>
                <input
                  type="text"
                  required
                  value={enrollCondition}
                  onChange={e => setEnrollCondition(e.target.value)}
                  placeholder="e.g. Hypertension Stage 2"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Maintained Prescription Medications (one per line)
                </label>
                <textarea
                  rows={3}
                  value={enrollMeds}
                  onChange={e => setEnrollMeds(e.target.value)}
                  placeholder="e.g. Amlodipine 5mg OD&#10;Losartan 50mg OD"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enroll &amp; Activate Membership</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
