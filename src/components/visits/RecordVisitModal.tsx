import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, Card, Membership, BenefitCoverageStatus } from '../../types';
import { evaluateBenefitCoverage } from '../../services/benefitEngine';
import {
  Stethoscope,
  X,
  AlertCircle,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface RecordVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  card?: Card;
  membership?: Membership;
}

export const RecordVisitModal: React.FC<RecordVisitModalProps> = ({
  isOpen,
  onClose,
  patient: initialPatient,
  card: initialCard,
  membership: initialMembership
}) => {
  const { facilities, packages, currentFacility, currentUser, recordVisit, patients, cards, memberships } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatient?.id || patients[0]?.id || '');
  const activePatient = patients.find(p => p.id === selectedPatientId) || initialPatient || patients[0];
  const activeCard = initialCard && initialCard.patientId === activePatient?.id 
    ? initialCard 
    : cards.find(c => c.patientId === activePatient?.id && c.status === 'ACTIVE') || cards.find(c => c.patientId === activePatient?.id);
  const activeMembership = initialMembership && initialMembership.patientId === activePatient?.id
    ? initialMembership
    : memberships.find(m => m.patientId === activePatient?.id && m.status === 'ACTIVE');

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(currentFacility.id);
  const [department, setDepartment] = useState('Outpatient Clinic');
  const [providerName, setProviderName] = useState(currentUser.displayName.split('(')[0].trim());
  const [selectedService, setSelectedService] = useState('General Outpatient Consultation');
  const [notes, setNotes] = useState('');

  const targetFacility = facilities.find(f => f.id === selectedFacilityId) || currentFacility;
  const packageItem = activeMembership ? packages.find(p => p.id === activeMembership.packageId) : undefined;

  // Real-time Benefit Engine check
  const benefitEvaluation = useMemo(() => {
    if (!activePatient) {
      return {
        status: 'NOT_COVERED' as BenefitCoverageStatus,
        isEligible: false,
        reason: 'No patient selected',
        copayRequiredUGX: 0,
        requiresAuthorization: false,
        visitsRemaining: 0,
        notes: ''
      };
    }
    return evaluateBenefitCoverage({
      patient: activePatient,
      card: activeCard,
      membership: activeMembership,
      packageItem,
      requestedService: selectedService,
      facility: targetFacility
    });
  }, [activePatient, activeCard, activeMembership, packageItem, selectedService, targetFacility]);

  if (!isOpen || !activePatient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const willDeduct = benefitEvaluation.isEligible && benefitEvaluation.status !== 'NOT_COVERED';

    recordVisit({
      patientId: activePatient.id,
      patientName: activePatient.fullName,
      cardId: activeCard?.id,
      facilityId: targetFacility.id,
      facilityName: targetFacility.name,
      department,
      providerName,
      serviceName: selectedService,
      packageId: packageItem?.id,
      coverageStatus: benefitEvaluation.status,
      visitDeducted: willDeduct,
      copaymentAmount: benefitEvaluation.copayRequiredUGX,
      authorizationId: benefitEvaluation.requiresAuthorization ? 'REQ-AUTH' : undefined,
      notes: notes.trim() || 'Encounter completed at reception/clinic triage.'
    });

    onClose();
  };

  const commonServices = [
    'General Outpatient Consultation',
    'Specialist Consultation (Physician/ObsGyn)',
    'Full Blood Count (CBC)',
    'Malaria Rapid Diagnostic Test (mRDT)',
    'Random Blood Sugar (RBS)',
    'Abdominal Ultrasound Scan',
    'Essential Acute Medications Formulary',
    'Emergency First-Aid Stabilization'
  ];

  const getStatusBadge = (status: BenefitCoverageStatus) => {
    switch (status) {
      case 'COVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            COVERED BY MEMBERSHIP
          </span>
        );
      case 'PARTIALLY_COVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            PARTIALLY COVERED (CO-PAY REQUIRED)
          </span>
        );
      case 'AUTHORIZATION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            AUTHORIZATION REQUIRED
          </span>
        );
      case 'NOT_COVERED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            NOT COVERED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Record Clinical Visit / Encounter</h2>
              <p className="text-xs text-slate-400">Benefit Adjudication Engine &amp; Entitlement Deduction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Patient Selection / Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2.5">
            <div>
              <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Patient Member</label>
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.memberId}) — {p.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Card Status</span>
                <span className={`font-bold ${activeCard ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {activeCard ? `${activeCard.cardNumber} (${activeCard.status})` : 'No Card Assigned'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Package / Entitlement</span>
                <span className="font-semibold text-emerald-800">
                  {packageItem ? packageItem.name : 'Out-of-Pocket / None'}
                </span>
                {activeMembership && (
                  <div className="text-[11px] text-slate-600">
                    Visits Remaining: <strong className="text-emerald-700 font-bold">{activeMembership.visitsRemaining}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Facility Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Encounter Facility</label>
            <select
              value={selectedFacilityId}
              onChange={e => setSelectedFacilityId(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {facilities.map(fac => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.type.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Requested Service */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Healthcare Service</label>
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {commonServices.map(srv => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          {/* REAL-TIME BENEFIT ENGINE ADJUDICATION RESULT */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Benefit Engine Adjudication:
              </span>
              {getStatusBadge(benefitEvaluation.status)}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {benefitEvaluation.reason}
            </p>

            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/80 flex items-center justify-between">
              <span>{benefitEvaluation.notes}</span>
              {benefitEvaluation.copayRequiredUGX > 0 && (
                <span className="font-bold text-amber-800">
                  Co-Pay: UGX {benefitEvaluation.copayRequiredUGX.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Department & Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Attending Clinician / Provider</label>
              <input
                type="text"
                value={providerName}
                onChange={e => setProviderName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Clinical Encounter Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Notes &amp; Observations</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Chief complaint: fever and malaise for 2 days. Vital signs recorded."
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Record Visit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
