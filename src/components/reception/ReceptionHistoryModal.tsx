import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, Visit, Card, Membership } from '../../types';
import {
  FileText,
  X,
  Calendar,
  Clock,
  User,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer,
  ChevronRight,
  Settings,
  Pill,
  Building2,
  Phone,
  CreditCard,
  PlusCircle
} from 'lucide-react';

interface ReceptionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  card?: Card;
  membership?: Membership;
  onStartNewVisit: () => void;
}

export const ReceptionHistoryModal: React.FC<ReceptionHistoryModalProps> = ({
  isOpen,
  onClose,
  patient,
  card,
  membership,
  onStartNewVisit
}) => {
  const { visits, currentUser, receptionPermissions, updateReceptionPermissions, reverseVisit, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'hmis_table' | 'timeline' | 'master_record'>('hmis_table');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [viewLevel, setViewLevel] = useState<'reception' | 'clinician'>('reception');
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [reversalVisitId, setReversalVisitId] = useState<string | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  if (!isOpen) return null;

  // Filter visits for this patient, sorted chronologically newest first
  const patientVisits = visits
    .filter(v => v.patientId === patient.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handlePrintSummary = () => {
    window.print();
  };

  const handleConfirmReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversalVisitId || !reversalReason.trim()) return;
    try {
      reverseVisit(reversalVisitId, reversalReason.trim());
      showToast('Visit reversed successfully. Entitlement has been audited and restored.', 'success');
      setReversalVisitId(null);
      setReversalReason('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to reverse visit', 'error');
    }
  };

  // Group visits by Year for the timeline
  const visitsByYear: { [year: string]: Visit[] } = {};
  patientVisits.forEach(v => {
    const yr = new Date(v.createdAt).getFullYear().toString();
    if (!visitsByYear[yr]) visitsByYear[yr] = [];
    visitsByYear[yr].push(v);
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xl shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Reception Patient History &amp; Attendance Record
                </h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {patient.memberId}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                  {patientVisits.length} Recorded Visits
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Patient: <strong className="text-white">{patient.fullName}</strong> • DOB: {patient.dob} ({patient.sex}) • Phone: {patient.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap">
            {/* View Level Badge & Switcher */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
              <button
                onClick={() => setViewLevel('reception')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  viewLevel === 'reception'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Strict Reception View: Protects clinical narrative"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Reception Level</span>
              </button>
              <button
                onClick={() => setViewLevel('clinician')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  viewLevel === 'clinician'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Clinical View Level: Full Doctor Access"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Clinician Level</span>
              </button>
            </div>

            <button
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Configure Reception Permissions"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrintSummary}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Print Longitudinal History"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reception Permission Config Banner (if opened) */}
        {showConfigDrawer && (
          <div className="bg-teal-900/40 border-b border-teal-800 p-4 text-xs text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-teal-300">
                <Shield className="w-4 h-4" />
                Administrator Privacy Configuration for Reception View
              </span>
              <p className="text-slate-300 text-[11px]">
                Control exactly what Reception staff can retrieve. Confidential clinical narratives are permanently locked.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={receptionPermissions.showBasicDiagnosis}
                  onChange={e => updateReceptionPermissions({ showBasicDiagnosis: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Basic Diagnosis</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={receptionPermissions.showMedicationSummary}
                  onChange={e => updateReceptionPermissions({ showMedicationSummary: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Medication Summary</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={receptionPermissions.showFollowUpDates}
                  onChange={e => updateReceptionPermissions({ showFollowUpDates: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Follow-up Dates</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={receptionPermissions.showTriageVitals}
                  onChange={e => updateReceptionPermissions({ showTriageVitals: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Triage Vitals</span>
              </label>
            </div>
          </div>
        )}

        {/* View Level Notice Bar */}
        <div className={`px-6 py-2 border-b text-xs flex items-center justify-between font-medium ${
          viewLevel === 'reception'
            ? 'bg-teal-50/70 border-teal-100 text-teal-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {viewLevel === 'reception' ? (
              <>
                <Shield className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  <strong>RECEPTION VIEW LEVEL:</strong> Displaying attendance, service, basic operational outcomes &amp; permitted summaries. Detailed clinical narratives are strictly protected.
                </span>
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>CLINICIAN VIEW LEVEL:</strong> Full clinical consultation narratives, differential diagnoses, and doctor-to-doctor notes unlocked.
                </span>
              </>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
            Permanent Master ID: <strong>{patient.id}</strong>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-4 text-xs font-bold bg-white">
          <button
            onClick={() => setActiveTab('hmis_table')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'hmis_table'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Longitudinal Attendance Log ({patientVisits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Chronological Patient Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('master_record')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'master_record'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Patient Master Record</span>
          </button>
        </div>

        {/* Tab 1: HMIS Table View */}
        {activeTab === 'hmis_table' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {patientVisits.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                <Activity className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">No Previous Visits Recorded</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  This patient is registered in the master record. Today's visit will be recorded as <strong>Visit 001</strong>.
                </p>
                <button
                  onClick={onStartNewVisit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Start First Visit (Visit 001)
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Date &amp; Time</th>
                        <th className="py-3 px-4">Visit No.</th>
                        <th className="py-3 px-4">Reason for Visit</th>
                        <th className="py-3 px-4">Diagnosis / Outcome</th>
                        <th className="py-3 px-4">Treatment / Service</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Coverage</th>
                        <th className="py-3 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patientVisits.map((visit, idx) => {
                        const visitDate = new Date(visit.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        });
                        const visitTime = new Date(visit.createdAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        const seqNumber = visit.visitSequence || `Visit ${String(patientVisits.length - idx).padStart(3, '0')}`;
                        const isReversed = visit.status === 'REVERSED';

                        return (
                          <tr
                            key={visit.id}
                            onClick={() => setSelectedVisit(visit)}
                            className={`cursor-pointer transition-colors ${
                              isReversed
                                ? 'bg-rose-50/50 hover:bg-rose-50 text-slate-500'
                                : 'hover:bg-teal-50/40 text-slate-800'
                            }`}
                          >
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{visitDate}</span>
                              <span className="text-[10px] text-slate-400">{visitTime}</span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                                {seqNumber}
                              </span>
                              {visit.queueNumber && (
                                <span className="block text-[10px] text-teal-700 font-mono font-semibold mt-0.5">
                                  {visit.queueNumber}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 font-medium max-w-[180px] truncate">
                              {visit.reasonForVisit || visit.serviceName || 'Routine consultation'}
                            </td>

                            <td className="py-3 px-4">
                              {viewLevel === 'reception' && !receptionPermissions.showBasicDiagnosis ? (
                                <span className="text-slate-400 italic text-[11px] flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-slate-400" />
                                  <span>Restricted</span>
                                </span>
                              ) : (
                                <span className="font-semibold text-slate-800">
                                  {visit.diagnosis || '—'}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 max-w-[200px] truncate">
                              {viewLevel === 'reception' && !receptionPermissions.showMedicationSummary ? (
                                <span className="text-slate-400 italic text-[11px]">Summary hidden</span>
                              ) : (
                                <span>{visit.treatment || visit.serviceName || 'Consultation'}</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-bold text-slate-700">
                                {visit.department}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              {isReversed ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                  REVERSED
                                </span>
                              ) : (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  visit.visitDeducted
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-teal-100 text-teal-800'
                                }`}>
                                  {visit.paymentStatus || (visit.visitDeducted ? 'Package' : 'Fee')}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center gap-1 text-teal-700 font-bold hover:underline">
                                <span>View</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Chronological Timeline View */}
        {activeTab === 'timeline' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-teal-900 block">Longitudinal Patient Timeline</span>
                <span className="text-teal-700 text-[11px]">
                  Generated automatically from encounters linked to permanent Patient ID: <strong>{patient.id}</strong>
                </span>
              </div>
              <span className="px-3 py-1 bg-white text-teal-800 font-bold rounded-lg border border-teal-200">
                {patientVisits.length} Historical Encounters
              </span>
            </div>

            {patientVisits.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">No visits recorded yet.</p>
            ) : (
              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {patientVisits.map((visit, i) => {
                  const date = new Date(visit.createdAt);
                  const dayMonth = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
                  const year = date.getFullYear();

                  return (
                    <div key={visit.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-teal-600 border-4 border-white shadow-xs flex items-center justify-center text-[9px] text-white font-bold" />

                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-teal-500 transition-all space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-900">
                              {dayMonth} {year}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-slate-100 text-slate-800">
                              {visit.department} {visit.visitSequence || `Visit 00${patientVisits.length - i}`}
                            </span>
                            {visit.queueNumber && (
                              <span className="text-xs font-mono font-bold text-teal-700">
                                ({visit.queueNumber})
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            Attended by: <strong className="text-slate-700">{visit.providerName}</strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Chief Complaint</span>
                            <span className="font-semibold text-slate-900">{visit.reasonForVisit || visit.serviceName || 'Consultation'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Diagnosis / Outcome</span>
                            {viewLevel === 'reception' && !receptionPermissions.showBasicDiagnosis ? (
                              <span className="text-slate-400 italic">[Restricted to Clinicians]</span>
                            ) : (
                              <span className="font-semibold text-slate-800">{visit.diagnosis || '—'}</span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Treatment &amp; Service</span>
                            {viewLevel === 'reception' && !receptionPermissions.showMedicationSummary ? (
                              <span className="text-slate-400 italic">[Restricted]</span>
                            ) : (
                              <span className="text-slate-700">{visit.treatment || visit.serviceName}</span>
                            )}
                          </div>
                        </div>

                        {visit.triageVitals && (
                          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center gap-2 font-mono">
                            <Activity className="w-3.5 h-3.5 text-teal-600" />
                            <span>Triage Vitals: {visit.triageVitals}</span>
                          </div>
                        )}

                        {visit.followUpDate && (
                          <div className="text-[11px] text-teal-800 font-semibold flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-teal-600" />
                            <span>Scheduled Follow-up Review: {visit.followUpDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Permanent Patient Master Record View */}
        {activeTab === 'master_record' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-emerald-900 block text-sm">
                Permanent Patient Master Record (Registered Once)
              </span>
              <p className="text-emerald-800 text-[11px]">
                This master record contains the person's identity and is never duplicated on return visits. Every attendance is logged as an encounter under Patient ID: <strong>{patient.id}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Patient Demographics</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Full Name:</span>
                    <strong className="text-slate-900">{patient.fullName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Member ID:</span>
                    <strong className="font-mono text-slate-900">{patient.memberId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Internal Patient ID:</span>
                    <strong className="font-mono text-slate-900">{patient.id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="font-semibold text-slate-800">{patient.dob} ({patient.sex})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone Number:</span>
                    <span className="font-mono font-bold text-slate-900">{patient.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Residential Address:</span>
                    <span className="text-slate-800 text-right">{patient.address}</span>
                  </div>
                  {patient.nationalId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">National ID (NIN):</span>
                      <span className="font-mono font-bold text-slate-900">{patient.nationalId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Next of Kin &amp; Contacts</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Next of Kin Name:</span>
                    <strong className="text-slate-900">{patient.nextOfKin?.name || patient.emergencyContact?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Relationship:</span>
                    <span className="text-slate-800">{patient.nextOfKin?.relationship || patient.emergencyContact?.relationship}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Phone:</span>
                    <span className="font-mono font-bold text-slate-900">{patient.nextOfKin?.phone || patient.emergencyContact?.phone}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1.5">
                    <span className="text-slate-500">Registered Card Number:</span>
                    <span className="font-mono font-bold text-teal-800">{card?.cardNumber || 'None assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Card Status:</span>
                    <span className="font-bold text-emerald-700">{card?.status || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registration Date:</span>
                    <span className="text-slate-700">{patient.registrationDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Visit Details Drawer / Modal */}
        {selectedVisit && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 z-60 animate-in fade-in duration-100">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Encounter Details</span>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedVisit.visitSequence || 'Visit'} — {new Date(selectedVisit.createdAt).toLocaleDateString('en-GB')}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">FACILITY &amp; DEPARTMENT</span>
                    <strong>{selectedVisit.facilityName} ({selectedVisit.department})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ATTENDING PROVIDER</span>
                    <strong>{selectedVisit.providerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">RECEPTION STAFF</span>
                    <span>{selectedVisit.receptionStaff || 'Receptionist'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">COVERAGE STATUS</span>
                    <span className="font-bold text-emerald-700">{selectedVisit.paymentStatus || 'Covered'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-bold block mb-1">Reason for Visit / Complaint:</span>
                  <p className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-medium">
                    {selectedVisit.reasonForVisit || selectedVisit.serviceName}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 font-bold block mb-1">Diagnosis / Outcome:</span>
                  {viewLevel === 'reception' && !receptionPermissions.showBasicDiagnosis ? (
                    <div className="p-2.5 bg-slate-100 rounded-lg text-slate-500 flex items-center gap-1.5 italic">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Diagnosis is restricted under current Reception Privacy Settings.</span>
                    </div>
                  ) : (
                    <p className="p-2.5 bg-slate-50 rounded-lg text-slate-900 font-semibold">
                      {selectedVisit.diagnosis || 'Standard outpatient consultation'}
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 font-bold block mb-1">Prescription &amp; Treatment Summary:</span>
                  {viewLevel === 'reception' && !receptionPermissions.showMedicationSummary ? (
                    <div className="p-2.5 bg-slate-100 rounded-lg text-slate-500 flex items-center gap-1.5 italic">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Medication details restricted.</span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                      <p className="text-slate-800">{selectedVisit.treatment || selectedVisit.serviceName}</p>
                      {selectedVisit.prescriptions && selectedVisit.prescriptions.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-200 mt-1.5 space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Dispensed Medicines:</span>
                          {selectedVisit.prescriptions.map((rx, idx) => (
                            <span key={idx} className="inline-block px-2 py-0.5 bg-white rounded border border-slate-200 text-[11px] mr-1.5 text-slate-700">
                              {rx}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Confidential Clinician Notes (Strictly hidden for Reception View) */}
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Clinician Narrative:</span>
                  {viewLevel === 'reception' ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>CONFIDENTIAL CLINICAL RECORD:</strong> Detailed doctor narratives, internal physician notes, and differential diagnoses are restricted to Clinical Staff.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 font-mono">
                      {selectedVisit.notes || 'No confidential narrative recorded for this encounter.'}
                    </div>
                  )}
                </div>

                {/* Reversal Action if authorized */}
                {selectedVisit.status !== 'REVERSED' && (
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setReversalVisitId(selectedVisit.id);
                        setSelectedVisit(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Authorized Visit Reversal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Authorized Reversal Modal */}
        {reversalVisitId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-70">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <RotateCcw className="w-6 h-6" />
                <h3 className="font-bold text-base text-slate-900">Authorize Visit Reversal</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reversing an encounter restores the patient's package visit count while maintaining a permanent audit trail. History is never deleted.
              </p>
              <form onSubmit={handleConfirmReversal} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason for Reversal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reversalReason}
                    onChange={e => setReversalReason(e.target.value)}
                    placeholder="e.g. Duplicate entry by reception, patient rescheduled"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReversalVisitId(null)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
                  >
                    Confirm Reversal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Register the patient once — record every visit separately.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Close History
            </button>
            <button
              onClick={() => {
                onClose();
                onStartNewVisit();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start Today's Visit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
