import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, Card, Membership, ChronicMembership, SickleCellProfile, Visit } from '../../types';
import {
  Stethoscope,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  User,
  HeartPulse,
  Activity,
  CreditCard,
  Printer,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { QueueSlipModal } from './QueueSlipModal';

interface FastVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  card?: Card;
  membership?: Membership;
  chronicMembership?: ChronicMembership;
  sickleCellProfile?: SickleCellProfile;
}

export const FastVisitModal: React.FC<FastVisitModalProps> = ({
  isOpen,
  onClose,
  patient,
  card,
  membership,
  chronicMembership,
  sickleCellProfile
}) => {
  const { visits, recordVisit, currentFacility, currentUser, showToast } = useApp();

  // Calculate next visit sequence
  const patientVisits = visits.filter(v => v.patientId === patient.id);
  const nextVisitNumber = patientVisits.length + 1;
  const nextVisitSequence = `Visit ${String(nextVisitNumber).padStart(3, '0')}`;

  // Package Entitlement Calculation: Purchased - Used = Remaining
  const hasActivePackage = membership && membership.status === 'ACTIVE';
  const visitsRemaining = hasActivePackage ? Math.max(0, membership.visitsPurchased - membership.visitsUsed) : 0;
  const canUsePackageVisit = hasActivePackage && visitsRemaining > 0;

  // Form states
  const [department, setDepartment] = useState<'OPD' | 'General Practice' | 'Pediatrics' | 'Antenatal' | 'Chronic Clinic' | 'Sickle Cell Clinic' | 'Laboratory' | 'Pharmacy'>(
    sickleCellProfile ? 'Sickle Cell Clinic' : chronicMembership ? 'Chronic Clinic' : 'OPD'
  );
  const [visitType, setVisitType] = useState<string>('OPD Consultation');
  const [reasonForVisit, setReasonForVisit] = useState<string>('');
  const [bp, setBp] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>(
    canUsePackageVisit ? 'Covered by Package' : sickleCellProfile ? 'Clinical ID (Zero Copay)' : 'Cash / Mobile Money'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdVisit, setCreatedVisit] = useState<Visit | null>(null);

  if (!isOpen) return null;

  const quickComplaints = [
    'Malaria symptoms',
    'Fever & chills',
    'Headache',
    'Cough & flu',
    'Abdominal pain',
    'Routine review',
    'Prescription refill',
    'Joint pain / Vitals check'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonForVisit.trim()) {
      showToast('Please enter or select a chief complaint / reason for visit.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const vitalsParts: string[] = [];
      if (bp.trim()) vitalsParts.push(`BP: ${bp.trim()} mmHg`);
      if (temperature.trim()) vitalsParts.push(`Temp: ${temperature.trim()}°C`);
      if (weight.trim()) vitalsParts.push(`Wt: ${weight.trim()} kg`);
      const vitalsString = vitalsParts.join(', ');

      const shouldDeduct = !!(paymentMode === 'Covered by Package' && hasActivePackage && canUsePackageVisit);

      const visitData: Omit<Visit, 'id' | 'createdAt' | 'status'> = {
        patientId: patient.id,
        patientName: patient.fullName,
        cardId: card?.id,
        facilityId: currentFacility.id,
        facilityName: currentFacility.name,
        department,
        providerName: currentUser.displayName,
        serviceName: `${department} - ${visitType}`,
        packageId: hasActivePackage ? membership?.packageId : undefined,
        coverageStatus: shouldDeduct ? 'COVERED' : 'NOT_COVERED',
        visitDeducted: shouldDeduct,
        copaymentAmount: shouldDeduct ? 0 : 25000,
        notes: `Encounter registered at Reception. Complaint: ${reasonForVisit.trim()}. ${vitalsString ? `Initial vitals: ${vitalsString}` : ''}`,
        visitNumber: nextVisitNumber,
        visitSequence: nextVisitSequence,
        visitType,
        reasonForVisit: reasonForVisit.trim(),
        diagnosis: undefined,
        treatment: undefined,
        paymentStatus: shouldDeduct ? `Covered by ${membership?.packageName}` : paymentMode,
        receptionStaff: currentUser.displayName,
        triageVitals: vitalsString || undefined
      };

      const result = recordVisit(visitData);
      setCreatedVisit(result.visit);
      showToast(`Encounter ${result.visit.visitSequence} registered for ${patient.fullName}`, 'success');
    } catch (err: any) {
      showToast('Failed to register visit: ' + (err?.message || 'Unknown error'), 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">Start Today's Visit</h2>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {nextVisitSequence}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  New encounter linked to existing Patient ID: <strong className="text-white font-mono">{patient.memberId}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Patient Master Identification & Entitlement Banner */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">RETURNING PATIENT IDENTIFIED</span>
                <span className="text-sm font-black text-slate-900">{patient.fullName}</span>
                <span className="text-slate-500 ml-2">({patient.sex} • {patient.dob} • Phone: {patient.phone})</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">PREVIOUS VISITS</span>
                <strong className="text-slate-800 font-mono text-sm">{patientVisits.length} Visits on File</strong>
              </div>
            </div>

            {/* Package Entitlement Badge */}
            {hasActivePackage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-emerald-950 block">
                    {membership?.packageName}
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    Visits Purchased: <strong>{membership?.visitsPurchased}</strong> | Used: <strong>{membership?.visitsUsed}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Remaining</span>
                  <span className={`text-xl font-black ${visitsRemaining > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {visitsRemaining}
                  </span>
                </div>
              </div>
            )}

            {/* Sickle Cell Alert */}
            {sickleCellProfile && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Sickle Cell Card:</strong> Purely clinical identification (HbSS, Blood Group {sickleCellProfile.bloodGroup}). Zero payment barrier for emergency triage.
                </span>
              </div>
            )}
          </div>

          {/* Visit Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Department and Visit Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Department / Clinic Room <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="OPD">OPD (Outpatient Department)</option>
                  <option value="General Practice">General Practice Consultation</option>
                  <option value="Pediatrics">Pediatrics Clinic</option>
                  <option value="Antenatal">Antenatal &amp; Maternal Care</option>
                  <option value="Chronic Clinic">Chronic Disease Clinic</option>
                  <option value="Sickle Cell Clinic">Sickle Cell Clinic</option>
                  <option value="Laboratory">Laboratory Testing</option>
                  <option value="Pharmacy">Pharmacy Dispensing</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Visit Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={visitType}
                  onChange={e => setVisitType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="OPD Consultation">OPD Consultation</option>
                  <option value="Emergency Care">Emergency / Acute Triage</option>
                  <option value="Follow-up Review">Follow-up / Review Visit</option>
                  <option value="Routine Checkup">Routine Wellness Checkup</option>
                  <option value="Medication Refill">Medication Refill Only</option>
                  <option value="Triage Only">Triage &amp; Vitals Assessment</option>
                </select>
              </div>
            </div>

            {/* Chief Complaint / Reason for Visit */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Reason for Visit / Chief Complaint <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reasonForVisit}
                onChange={e => setReasonForVisit(e.target.value)}
                placeholder="e.g. Headache, Fever, Malaria symptoms, Routine follow-up..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickComplaints.map(qc => (
                  <button
                    key={qc}
                    type="button"
                    onClick={() => setReasonForVisit(qc)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 text-[11px] font-medium border border-slate-200 transition-colors"
                  >
                    + {qc}
                  </button>
                ))}
              </div>
            </div>

            {/* Triage Vitals (Optional initial reception capture) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">
                Initial Triage Vitals (Optional at Reception Desk)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block font-semibold">Blood Pressure</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={e => setBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-semibold">Temperature (°C)</label>
                  <input
                    type="text"
                    value={temperature}
                    onChange={e => setTemperature(e.target.value)}
                    placeholder="36.8"
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-semibold">Weight (kg)</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="65"
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono font-bold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment & Entitlement Coverage */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Payment &amp; Package Entitlement Mode <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                {canUsePackageVisit && (
                  <option value="Covered by Package">
                    Covered by Package (Deduct 1 visit — {visitsRemaining} left)
                  </option>
                )}
                <option value="Cash / Mobile Money">Cash / Mobile Money (UGX 25,000 Out-of-pocket)</option>
                <option value="Clinical ID (Zero Copay)">Clinical ID / Triage Priority (Zero copay)</option>
                <option value="Exempt / Staff">Exempt / Corporate Account</option>
              </select>
              {paymentMode === 'Covered by Package' && (
                <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Will record usage of 1 covered visit in the permanent audit trail.</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Staff: <strong className="text-slate-700">{currentUser.displayName}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : 'Start Encounter & Print Slip'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Printable Queue Slip modal upon successful registration */}
      {createdVisit && (
        <QueueSlipModal
          isOpen={true}
          onClose={() => {
            setCreatedVisit(null);
            onClose();
          }}
          visit={createdVisit}
          patient={patient}
        />
      )}
    </>
  );
};
