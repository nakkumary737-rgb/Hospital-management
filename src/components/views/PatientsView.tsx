import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import { EditPatientModal } from '../patients/EditPatientModal';
import { ReceptionHistoryModal } from '../reception/ReceptionHistoryModal';
import { FastVisitModal } from '../reception/FastVisitModal';
import {
  Users,
  Search,
  PlusCircle,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle2,
  Package,
  Activity,
  HeartPulse,
  Printer,
  LayoutGrid,
  List,
  ChevronRight,
  Shield,
  Edit3,
  Trash2,
  MoreVertical,
  Clock,
  Sparkles,
  FileText,
  Stethoscope
} from 'lucide-react';

interface PatientsViewProps {
  onNewPatient: () => void;
  onOpenCardPreview: (cardId: string) => void;
  onScanCardForPatient: (cardNumber: string) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  onNewPatient,
  onOpenCardPreview,
  onScanCardForPatient
}) => {
  const {
    patients,
    cards,
    memberships,
    familyMembers,
    chronicMemberships,
    sickleCellProfiles,
    visits,
    payments,
    deletePatient,
    confirmAction,
    showToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'grid'>('split');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showFastVisitModal, setShowFastVisitModal] = useState(false);

  const filteredPatients = patients.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.memberId.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.address.toLowerCase().includes(q)
    );
  });

  const activePatient = patients.find(p => p.id === selectedPatientId) || filteredPatients[0] || patients[0];
  const patientCards = activePatient ? cards.filter(c => c.patientId === activePatient.id) : [];
  const patientMemberships = activePatient ? memberships.filter(m => m.patientId === activePatient.id) : [];
  const patientChronic = activePatient ? chronicMemberships.find(c => c.patientId === activePatient.id) : undefined;
  const patientSickle = activePatient ? sickleCellProfiles.find(s => s.patientId === activePatient.id) : undefined;
  const patientDependents = activePatient ? familyMembers.filter(f => f.primaryPatientId === activePatient.id) : [];

  // Summary counts
  const packageHoldersCount = patients.filter(p => memberships.some(m => m.patientId === p.id && m.status === 'ACTIVE')).length;
  const chronicCount = patients.filter(p => chronicMemberships.some(c => c.patientId === p.id)).length;
  const sickleCount = patients.filter(p => sickleCellProfiles.some(s => s.patientId === p.id)).length;

  const handleDeletePatient = async (p: Patient) => {
    confirmAction({
      title: 'Delete Patient Account',
      message: `Are you sure you want to permanently delete patient ${p.fullName} (${p.memberId})?\n\nThis will remove their profile and associated card credentials from the real-time database.`,
      confirmLabel: 'Delete Patient',
      variant: 'danger',
      onConfirm: async () => {
        await deletePatient(p.id);
        if (selectedPatientId === p.id) {
          setSelectedPatientId(null);
        }
        showToast(`Patient ${p.fullName} (${p.memberId}) has been deleted.`, 'success');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Patient Accounts Registry</h1>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {patients.length} Members
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            One Afya Member → One Patient Account → One Member ID → Multi-Card &amp; Entitlement Management
          </p>
        </div>

        <button
          onClick={onNewPatient}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Patients</span>
          <strong className="text-2xl font-black text-slate-900 font-mono mt-1 block">{patients.length}</strong>
          <span className="text-[10px] text-emerald-700 font-semibold">Active Profiles</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Health Packages</span>
          <strong className="text-2xl font-black text-emerald-800 font-mono mt-1 block">{packageHoldersCount}</strong>
          <span className="text-[10px] text-slate-500 font-medium">Prepaid Encounters</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chronic Care</span>
          <strong className="text-2xl font-black text-teal-800 font-mono mt-1 block">{chronicCount}</strong>
          <span className="text-[10px] text-slate-500 font-medium">Monthly Renewals</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sickle Cell Network</span>
          <strong className="text-2xl font-black text-rose-800 font-mono mt-1 block">{sickleCount}</strong>
          <span className="text-[10px] text-rose-700 font-semibold">Clinical Alerts Only</span>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by full name, Member ID (AFY-000001), phone number, address..."
            className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-4 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Split Drawer</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Patient Tiles</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {patients.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Patient Database Ready</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Sample patient records were removed. Click below to register the first patient with a unique Afya Member ID.
          </p>
          <button
            onClick={onNewPatient}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Register First Patient
          </button>
        </div>
      )}

      {/* GRID / TILE VIEW */}
      {viewMode === 'grid' && patients.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(patient => {
            const pCards = cards.filter(c => c.patientId === patient.id);
            const pMems = memberships.filter(m => m.patientId === patient.id && m.status === 'ACTIVE');
            const pChr = chronicMemberships.find(c => c.patientId === patient.id);
            const pSc = sickleCellProfiles.find(s => s.patientId === patient.id);

            return (
              <div
                key={patient.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4 hover:border-emerald-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-base flex items-center justify-center shadow-xs">
                        {patient.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{patient.fullName}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {patient.memberId}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {patient.sex} • {patient.dob}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingPatient(patient)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Patient"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Patient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{patient.address}</span>
                    </div>
                  </div>

                  {/* Program Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pMems.map(m => (
                      <span key={m.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {m.packageName.split(' ')[0]} ({m.visitsRemaining} visits)
                      </span>
                    ))}
                    {pChr && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        {pChr.condition}
                      </span>
                    )}
                    {pSc && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        Sickle Cell ({pSc.genotype})
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{pCards.length} Card(s)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingPatient(patient)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Edit
                    </button>
                    {pCards[0] ? (
                      <button
                        onClick={() => onScanCardForPatient(pCards[0].cardNumber)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                      >
                        Scan Station
                      </button>
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold">No card</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SPLIT / DRAWER VIEW */}
      {viewMode === 'split' && patients.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Patient List (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Patient Directory</span>
              <span className="text-slate-400">{filteredPatients.length} accounts</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
              {filteredPatients.map(patient => {
                const isSelected = activePatient?.id === patient.id;
                const hasPackage = memberships.some(m => m.patientId === patient.id && m.status === 'ACTIVE');
                const hasChronic = chronicMemberships.some(c => c.patientId === patient.id);
                const hasSickle = sickleCellProfiles.some(s => s.patientId === patient.id);

                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`w-full text-left p-4 transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{patient.fullName}</span>
                        <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {patient.memberId}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{patient.sex}</span>
                        <span>•</span>
                        <span className="font-mono">{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        {hasPackage && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">PACKAGE</span>}
                        {hasChronic && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">CHRONIC</span>}
                        {hasSickle && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">SICKLE CELL</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPatient(patient);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-100/50 rounded-lg transition-colors"
                        title="Edit Patient"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePatient(patient);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100/50 rounded-lg transition-colors"
                        title="Delete Patient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Eye className={`w-4 h-4 ml-1 ${isSelected ? 'text-emerald-700' : 'text-slate-300'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drawer (7 cols) */}
          {activePatient && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white font-black text-2xl flex items-center justify-center shadow-sm">
                    {activePatient.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{activePatient.fullName}</h2>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono">
                        {activePatient.memberId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Registered: {activePatient.registrationDate} • Kitende – Mwenda Stage
                    </p>
                  </div>
                </div>

                {/* Patient Action Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-teal-200"
                    title="View Longitudinal Patient History"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>History ({visits.filter(v => v.patientId === activePatient.id).length})</span>
                  </button>

                  <button
                    onClick={() => setShowFastVisitModal(true)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    title="Start Today's Visit"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>New Visit</span>
                  </button>

                  <button
                    onClick={() => setEditingPatient(activePatient)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Edit Patient Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeletePatient(activePatient)}
                    className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Delete Patient Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {patientCards[0] && (
                    <button
                      onClick={() => onScanCardForPatient(patientCards[0].cardNumber)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Scan Desk</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">GENDER &amp; DOB</span>
                  <span className="text-slate-800 font-bold">{activePatient.sex}</span> • {activePatient.dob}
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">PHONE</span>
                  <span className="text-slate-800 font-mono font-medium">{activePatient.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">LOCATION</span>
                  <span className="text-slate-800 font-medium">{activePatient.address}</span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200 text-slate-600">
                  <span className="text-slate-400 block font-semibold text-[10px]">EMERGENCY CONTACT</span>
                  <strong>{activePatient.emergencyContact.name}</strong> ({activePatient.emergencyContact.relationship}) • {activePatient.emergencyContact.phone}
                </div>
                {activePatient.notes && (
                  <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200 text-slate-600">
                    <span className="text-slate-400 block font-semibold text-[10px]">RECEPTION / CLINICAL NOTES</span>
                    <span>{activePatient.notes}</span>
                  </div>
                )}
              </div>

              {/* Linked Cards Tiles */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Linked Cards ({patientCards.length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {patientCards.map(c => (
                    <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-slate-900">{c.cardNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                          {c.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Classification: <strong>{c.cardType.replace('_', ' ')}</strong>
                      </div>
                      <button
                        onClick={() => onOpenCardPreview(c.id)}
                        className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print CR80 Badge</span>
                      </button>
                    </div>
                  ))}
                  {patientCards.length === 0 && (
                    <div className="col-span-2 p-4 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                      No cards issued yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Entitlement Memberships */}
              {patientMemberships.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span>Active Package Entitlements</span>
                  </h3>

                  {patientMemberships.map(mem => (
                    <div key={mem.id} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 text-sm">{mem.packageName}</strong>
                        <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                          {mem.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-emerald-100 text-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Purchased</span>
                          <strong className="text-sm text-slate-900">{mem.visitsPurchased}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Used</span>
                          <strong className="text-sm text-slate-700">{mem.visitsUsed}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-700 block font-bold">Remaining</span>
                          <strong className="text-base text-emerald-800 font-black">{mem.visitsRemaining}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <EditPatientModal
          isOpen={!!editingPatient}
          onClose={() => setEditingPatient(null)}
          patient={editingPatient}
        />
      )}

      {/* Dedicated Reception History Modal */}
      {showHistoryModal && activePatient && (
        <ReceptionHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          patient={activePatient}
          card={patientCards[0]}
          membership={patientMemberships[0]}
          onStartNewVisit={() => {
            setShowHistoryModal(false);
            setShowFastVisitModal(true);
          }}
        />
      )}

      {/* Fast Returning-Patient Visit Modal */}
      {showFastVisitModal && activePatient && (
        <FastVisitModal
          isOpen={showFastVisitModal}
          onClose={() => setShowFastVisitModal(false)}
          patient={activePatient}
          card={patientCards[0]}
          membership={patientMemberships[0]}
          chronicMembership={patientChronic}
          sickleCellProfile={patientSickle}
        />
      )}
    </div>
  );
};
