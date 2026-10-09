import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Visit, Patient } from '../../types';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  User,
  Users,
  Building2,
  Clock,
  ShieldCheck,
  CreditCard,
  HeartPulse,
  Activity,
  PlusCircle,
  UserPlus,
  Eye,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileSpreadsheet,
  Stethoscope,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ReceptionHistoryModal } from '../reception/ReceptionHistoryModal';
import { FastVisitModal } from '../reception/FastVisitModal';
import { DemographicUpdateModal } from '../reception/DemographicUpdateModal';
import { QueueSlipModal } from '../reception/QueueSlipModal';
import { CardScannerModal } from '../scanner/CardScannerModal';
import { WalkInHMISModal } from '../reception/WalkInHMISModal';

interface HMISDataViewProps {
  onNavigateToVisits?: () => void;
  onNavigateToScanner?: () => void;
}

export const HMISDataView: React.FC<HMISDataViewProps> = ({
  onNavigateToVisits,
  onNavigateToScanner
}) => {
  const {
    visits,
    patients,
    cards,
    memberships,
    chronicMemberships,
    sickleCellProfiles,
    currentFacility,
    currentUser,
    switchUserRole
  } = useApp();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'last7' | 'month' | 'all'>('today');
  const [attendanceTypeFilter, setAttendanceTypeFilter] = useState<'ALL' | 'NEW' | 'REATTENDANCE'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Interactive Modals
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Patient | null>(null);
  const [selectedPatientForFastVisit, setSelectedPatientForFastVisit] = useState<Patient | null>(null);
  const [selectedPatientForDemographic, setSelectedPatientForDemographic] = useState<Patient | null>(null);
  const [selectedVisitForQueueSlip, setSelectedVisitForQueueSlip] = useState<{ visit: Visit; patient: Patient } | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Date calculations
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Helper to test if date matches selected filter
  const matchesDateFilter = (isoDate: string) => {
    if (dateFilter === 'all') return true;
    const vDate = new Date(isoDate);
    const vDateStr = isoDate.split('T')[0];

    if (dateFilter === 'today') return vDateStr === todayStr;
    if (dateFilter === 'yesterday') return vDateStr === yesterdayStr;
    if (dateFilter === 'last7') return vDate >= sevenDaysAgo;
    if (dateFilter === 'month') return vDate >= startOfMonth;
    return true;
  };

  // Helper to determine if an encounter is New Attendance or Re-attendance
  // Re-attendance: patient has at least 1 earlier visit prior to this visit
  const isReattendance = (visit: Visit) => {
    const patientVisits = visits.filter(v => v.patientId === visit.patientId && v.status !== 'REVERSED');
    if (patientVisits.length <= 1) return false;
    // If visitNumber > 1 or there is an earlier visit
    if (visit.visitNumber && visit.visitNumber > 1) return true;
    const earlier = patientVisits.some(v => v.id !== visit.id && new Date(v.createdAt) < new Date(visit.createdAt));
    return earlier;
  };

  // Helper to calculate patient age
  const calculateAge = (dobString?: string) => {
    if (!dobString) return '—';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '—';
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (years === 0) {
      const months = Math.floor(ageDiffMs / (1000 * 60 * 60 * 24 * 30.4375));
      return `${months}m`;
    }
    return `${years}y`;
  };

  // Filtered HMIS records
  const filteredVisits = visits.filter(v => {
    if (v.status === 'REVERSED') return false; // Reversed entries excluded from official attendance register
    if (!matchesDateFilter(v.createdAt)) return false;

    const patient = patients.find(p => p.id === v.patientId);
    const reattendance = isReattendance(v);

    if (attendanceTypeFilter === 'NEW' && reattendance) return false;
    if (attendanceTypeFilter === 'REATTENDANCE' && !reattendance) return false;

    if (departmentFilter !== 'ALL' && v.department !== departmentFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const nameMatch = v.patientName.toLowerCase().includes(q);
      const idMatch = v.patientId.toLowerCase().includes(q);
      const memberMatch = patient?.memberId.toLowerCase().includes(q);
      const seqMatch = v.visitSequence?.toLowerCase().includes(q);
      const queueMatch = v.queueNumber?.toLowerCase().includes(q);
      const complaintMatch = v.reasonForVisit?.toLowerCase().includes(q) || v.serviceName.toLowerCase().includes(q);
      const villageMatch = patient?.address.toLowerCase().includes(q);
      return nameMatch || idMatch || memberMatch || seqMatch || queueMatch || complaintMatch || villageMatch;
    }

    return true;
  });

  // Calculate HMIS KPI Statistics (for current dateFilter selection)
  const totalFilteredCount = filteredVisits.length;
  const newAttendanceCount = filteredVisits.filter(v => !isReattendance(v)).length;
  const reattendanceCount = filteredVisits.filter(v => isReattendance(v)).length;

  // Distinct patients
  const distinctPatients = new Set(filteredVisits.map(v => v.patientId)).size;

  // Under-5 count
  const under5Count = filteredVisits.filter(v => {
    const pat = patients.find(p => p.id === v.patientId);
    if (!pat?.dob) return false;
    const dob = new Date(pat.dob);
    const ageDiffMs = Date.now() - dob.getTime();
    const years = Math.abs(new Date(ageDiffMs).getUTCFullYear() - 1970);
    return years < 5;
  }).length;

  // Export to CSV Function (Uganda MOH HMIS 031 format)
  const handleExportHMISCsv = () => {
    const headers = [
      'HMIS Line No',
      'Attendance Date',
      'Time',
      'Queue Number',
      'Patient Name',
      'Member ID',
      'Sex',
      'Age',
      'Village / Address',
      'Phone Number',
      'Attendance Type',
      'Clinic / Department',
      'Chief Complaint / Reason',
      'Preliminary Diagnosis',
      'Triage Vitals',
      'Card Number / Scheme',
      'Receptionist Staff',
      'Facility'
    ];

    const rows = filteredVisits.map((v, index) => {
      const pat = patients.find(p => p.id === v.patientId);
      const card = cards.find(c => c.id === v.cardId || c.patientId === v.patientId);
      const reattendance = isReattendance(v);
      const vDate = new Date(v.createdAt);

      return [
        `HMIS-${String(index + 1).padStart(4, '0')}`,
        vDate.toLocaleDateString(),
        vDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        v.queueNumber || '—',
        v.patientName,
        pat?.memberId || v.patientId,
        pat?.sex || '—',
        calculateAge(pat?.dob),
        pat?.address || '—',
        pat?.phone || '—',
        reattendance ? 'Re-attendance (Returning)' : 'New Attendance',
        v.department,
        v.reasonForVisit || v.serviceName,
        v.diagnosis || '—',
        v.triageVitals || '—',
        card?.cardNumber || 'Cash OPD',
        v.receptionStaff || 'Mary Nakku (Receptionist)',
        v.facilityName
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HMIS_031_Register_${dateFilter}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintHMISSheet = () => {
    window.print();
  };

  const openFastVisitForPatient = (pat: Patient) => {
    setSelectedPatientForFastVisit(pat);
  };

  return (
    <div className="space-y-6">
      {/* Role Reminder Banner if Cashier */}
      {currentUser.role === 'cashier' && (
        <div className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm">HMIS Data Register is for the Receptionist Desk</h3>
              <p className="text-xs text-amber-800">
                You are currently logged in as <span className="font-bold">Cashier</span>. Cashiers oversee <span className="font-bold">Visits Management</span> and the <span className="font-bold">Payment Ledger</span>.
              </p>
            </div>
          </div>
          {onNavigateToVisits && (
            <button
              onClick={onNavigateToVisits}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Go to Visits Management</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  HMIS Data &amp; Outpatient Attendance Register
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-teal-100 text-teal-900 border border-teal-200">
                  Receptionist Desk
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  MOH HMIS Form 031
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Official Uganda MOH Daily Patient Attendance Log • New vs Re-attendances • Triage Vitals • Queue Slips
              </p>
            </div>
          </div>

          {/* Quick Action Buttons for Receptionist */}
          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
            <button
              onClick={() => setShowWalkInModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Log Walk-in / Non-Card</span>
            </button>

            <button
              onClick={() => setShowScannerModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Scan / Tap Afya Card</span>
            </button>

            <button
              onClick={handleExportHMISCsv}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export HMIS CSV</span>
            </button>

            <button
              onClick={handlePrintHMISSheet}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Print HMIS Daily Attendance Register"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Sheet</span>
            </button>
          </div>
        </div>

        {/* HMIS KPI Attendance Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 shadow-2xs">
            <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">
              Total Attendees
            </span>
            <span className="text-2xl font-black text-teal-950 font-mono mt-0.5 block">
              {totalFilteredCount}
            </span>
            <span className="text-[10px] text-teal-700 font-medium">
              {distinctPatients} Distinct Patients
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
              New Attendances
            </span>
            <span className="text-2xl font-black text-emerald-950 font-mono mt-0.5 block">
              {newAttendanceCount}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">
              First facility visit
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 shadow-2xs">
            <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block">
              Re-Attendances
            </span>
            <span className="text-2xl font-black text-blue-950 font-mono mt-0.5 block">
              {reattendanceCount}
            </span>
            <span className="text-[10px] text-blue-700 font-medium">
              Returning patients
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
              Children &lt; 5 Yrs
            </span>
            <span className="text-2xl font-black text-amber-950 font-mono mt-0.5 block">
              {under5Count}
            </span>
            <span className="text-[10px] text-amber-700 font-medium">
              MOH Child Health
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 shadow-2xs">
            <span className="text-[10px] text-purple-800 font-bold uppercase tracking-wider block">
              Above 5 Yrs
            </span>
            <span className="text-2xl font-black text-purple-950 font-mono mt-0.5 block">
              {Math.max(0, totalFilteredCount - under5Count)}
            </span>
            <span className="text-[10px] text-purple-700 font-medium">
              Adolescents &amp; Adults
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Kitende Facility
            </span>
            <span className="text-sm font-black text-slate-900 block mt-1 truncate">
              {currentFacility.name.split('–')[0]}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">
              Live HMIS Sync
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search HMIS register by patient name, Member ID (AFY-000001), queue #, symptom, or village..."
              className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'last7', label: '7 Days' },
                { id: 'month', label: 'Month' },
                { id: 'all', label: 'All' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  dateFilter === tab.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Attendance Type Selector */}
          <select
            value={attendanceTypeFilter}
            onChange={e => setAttendanceTypeFilter(e.target.value as any)}
            className="text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-semibold text-slate-700 w-full md:w-auto"
          >
            <option value="ALL">All Attendance Types</option>
            <option value="NEW">New Attendances Only</option>
            <option value="REATTENDANCE">Re-attendances (Returning)</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-semibold text-slate-700 w-full md:w-auto"
          >
            <option value="ALL">All Departments</option>
            <option value="General Outpatient (OPD)">General OPD</option>
            <option value="Chronic Disease Clinic">Chronic Care</option>
            <option value="Sickle Cell Comprehensive Clinic">Sickle Cell</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Emergency & Triage">Emergency &amp; Triage</option>
          </select>
        </div>
      </div>

      {/* HMIS Form 031 Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">MOH HMIS Form 031 Register Log</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-medium">
              Showing {filteredVisits.length} record{filteredVisits.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Green: New Attendance</span>
            <span className="text-slate-300">|</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Blue: Re-attendance (Returning)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-black">
                <th className="py-3 px-3">Serial / Time</th>
                <th className="py-3 px-3">Queue No.</th>
                <th className="py-3 px-3">Patient &amp; Member ID</th>
                <th className="py-3 px-3">Age / Sex / Location</th>
                <th className="py-3 px-3">Attendance Category</th>
                <th className="py-3 px-3">Department &amp; Complaint</th>
                <th className="py-3 px-3">Triage Vitals</th>
                <th className="py-3 px-3">Card / Entitlement</th>
                <th className="py-3 px-3 text-right">Reception Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No HMIS attendance records match this criteria</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Change the date range or scan an Afya Card to register attendance.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredVisits.map((visit, index) => {
                  const pat = patients.find(p => p.id === visit.patientId);
                  const card = cards.find(c => c.id === visit.cardId || c.patientId === visit.patientId);
                  const reattendance = isReattendance(visit);
                  const vDate = new Date(visit.createdAt);

                  return (
                    <tr
                      key={visit.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* 1. Serial / Time */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-700 block">
                          HMIS-{String(index + 1).padStart(3, '0')}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {vDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} •{' '}
                          {vDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* 2. Queue Number */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {visit.queueNumber ? (
                          <button
                            onClick={() => {
                              if (pat) setSelectedVisitForQueueSlip({ visit, patient: pat });
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 text-teal-800 font-mono font-bold text-xs border border-teal-200 hover:bg-teal-100 transition-colors"
                            title="Print Queue Slip"
                          >
                            <Printer className="w-3 h-3 text-teal-600" />
                            <span>{visit.queueNumber}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* 3. Patient Name & ID */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 hover:text-teal-700 transition-colors">
                          {visit.patientName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>{pat?.memberId || visit.patientId}</span>
                          {pat && sickleCellProfiles.some(s => s.patientId === pat.id) && (
                            <span className="px-1 rounded bg-rose-100 text-rose-800 text-[9px] font-bold">
                              SC
                            </span>
                          )}
                          {pat && chronicMemberships.some(c => c.patientId === pat.id) && (
                            <span className="px-1 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              NCD
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Age / Sex / Address */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {calculateAge(pat?.dob)} • {pat?.sex || '—'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={pat?.address}>
                          {pat?.address || 'Kitende, Wakiso'}
                        </div>
                      </td>

                      {/* 5. Attendance Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {reattendance ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            <span>Re-attendance ({visit.visitSequence || 'Returning'})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>New Attendance</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Department & Complaint */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {visit.reasonForVisit || visit.serviceName}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {visit.department}
                        </div>
                      </td>

                      {/* 7. Triage Vitals */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {visit.triageVitals ? (
                          <div className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 max-w-[150px] truncate" title={visit.triageVitals}>
                            {visit.triageVitals}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No triage recorded</span>
                        )}
                      </td>

                      {/* 8. Scheme / Card */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {card ? (
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                            <div>
                              <span className="font-mono text-[10px] font-bold text-slate-800 block">
                                {card.cardNumber}
                              </span>
                              <span className="text-[9px] text-emerald-700 font-semibold block">
                                {visit.visitDeducted ? 'Package Covered' : 'Copay'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">Cash OPD</span>
                        )}
                      </td>

                      {/* 9. Reception Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {pat && (
                            <>
                              <button
                                onClick={() => setSelectedPatientForHistory(pat)}
                                className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                title="View Patient History"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setSelectedPatientForDemographic(pat)}
                                className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                title="Update Demographics"
                              >
                                <User className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => openFastVisitForPatient(pat)}
                                className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-bold rounded-lg transition-colors border border-teal-200 flex items-center gap-1"
                                title="Record another encounter"
                              >
                                <PlusCircle className="w-3 h-3 text-teal-700" />
                                <span>Visit</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Patient History Modal */}
      {selectedPatientForHistory && (
        <ReceptionHistoryModal
          isOpen={true}
          onClose={() => setSelectedPatientForHistory(null)}
          patient={selectedPatientForHistory}
          card={cards.find(c => c.patientId === selectedPatientForHistory.id)}
          membership={memberships.find(m => m.patientId === selectedPatientForHistory.id)}
          onStartNewVisit={() => {
            const p = selectedPatientForHistory;
            setSelectedPatientForHistory(null);
            setSelectedPatientForFastVisit(p);
          }}
        />
      )}

      {/* 2. Fast Visit Modal */}
      {selectedPatientForFastVisit && (
        <FastVisitModal
          isOpen={true}
          onClose={() => setSelectedPatientForFastVisit(null)}
          patient={selectedPatientForFastVisit}
          card={cards.find(c => c.patientId === selectedPatientForFastVisit.id)}
          membership={memberships.find(m => m.patientId === selectedPatientForFastVisit.id)}
        />
      )}

      {/* 3. Demographic Update Modal */}
      {selectedPatientForDemographic && (
        <DemographicUpdateModal
          isOpen={true}
          onClose={() => setSelectedPatientForDemographic(null)}
          patient={selectedPatientForDemographic}
        />
      )}

      {/* 4. Queue Slip Modal */}
      {selectedVisitForQueueSlip && (
        <QueueSlipModal
          isOpen={true}
          onClose={() => setSelectedVisitForQueueSlip(null)}
          visit={selectedVisitForQueueSlip.visit}
          patient={selectedVisitForQueueSlip.patient}
        />
      )}

      {/* 5. QR / Card Scanner Modal */}
      {showScannerModal && (
        <CardScannerModal
          isOpen={true}
          onClose={() => setShowScannerModal(false)}
          onCardFound={() => {
            setShowScannerModal(false);
            if (onNavigateToScanner) onNavigateToScanner();
          }}
        />
      )}

      {/* 6. Walk-In Non-Card Patient Intake Modal */}
      {showWalkInModal && (
        <WalkInHMISModal
          isOpen={showWalkInModal}
          onClose={() => setShowWalkInModal(false)}
          onEncounterCreated={(visit, patient) => {
            setSelectedVisitForQueueSlip({ visit, patient });
          }}
        />
      )}
    </div>
  );
};
