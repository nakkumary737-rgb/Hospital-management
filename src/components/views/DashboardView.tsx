import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CreditCard,
  Package,
  Activity,
  HeartPulse,
  CalendarCheck,
  Receipt,
  Network,
  QrCode,
  ClipboardList,
  PlusCircle,
  Building2,
  Database,
  ArrowUpRight,
  Shield,
  Stethoscope,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  Radio,
  FileCheck2,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface DashboardViewProps {
  onScanCard: () => void;
  onNewPatient: () => void;
  onNavigate: (tab: any) => void;
  onSelectPatient: (patientId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onScanCard,
  onNewPatient,
  onNavigate
}) => {
  const {
    patients,
    cards,
    memberships,
    chronicMemberships,
    sickleCellProfiles,
    visits,
    payments,
    facilities,
    authorizations,
    claims,
    currentFacility,
    isFirebaseConnected,
    isOnline
  } = useApp();

  const totalPatients = patients.length;
  const activeCards = cards.filter(c => c.status === 'ACTIVE').length;
  const activePackageMembers = memberships.filter(m => m.status === 'ACTIVE').length;
  const activeChronicMembers = chronicMemberships.filter(c => c.status === 'ACTIVE').length;
  const sickleCellCount = sickleCellProfiles.length;
  const totalVisits = visits.length;
  const totalPaymentsUGX = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAuthorizations = authorizations.filter(a => a.status === 'REQUESTED').length;
  const pendingClaims = claims.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;

  const recentVisits = visits.slice(0, 5);
  const recentPayments = payments.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Operational Station Tile */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-xs">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentFacility.name}</span>
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isFirebaseConnected
                  ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                  : 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <Database className="w-3.5 h-3.5" />
                <span>{isFirebaseConnected ? 'Real-Time Firestore Live' : 'Connecting to Live Database...'}</span>
              </span>

              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isOnline ? 'bg-teal-500/20 text-teal-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {isOnline ? 'Network Online' : 'Offline Mode'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Afya Health Membership &amp; Care Network
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Kitende – Mwenda Stage, Uganda. Secure patient identity, package benefit formula calculations, chronic disease maintenance, and approved partner clinic network.
            </p>
          </div>

          {/* Quick Direct Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={onScanCard}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95"
            >
              <QrCode className="w-5 h-5 text-slate-950" />
              <span>Scan Member Card</span>
            </button>

            <button
              onClick={onNewPatient}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-xs transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Register Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTION TILES GRID */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Quick Workflow Stations</h2>
          <span className="text-[11px] text-emerald-700 font-bold">Fast One-Click Access</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Action 1: Card Scanner */}
          <div
            onClick={onScanCard}
            className="group bg-gradient-to-b from-white to-emerald-50/40 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-700">Scan Afya Card</h4>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">Intake</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Verify benefits &amp; returning member</p>
            </div>
          </div>

          {/* Action 2: HMIS Data Register (Receptionist Desk) */}
          <div
            onClick={() => onNavigate('hmis')}
            className="group bg-gradient-to-b from-white to-teal-50/40 p-4 rounded-2xl border border-teal-200/80 shadow-2xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 group-hover:text-teal-700">HMIS Data Register</h4>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">Receptionist</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">MOH 031 OPD log &amp; triage</p>
            </div>
          </div>

          {/* Action 3: Visits Management (Cashier Desk) */}
          <div
            onClick={() => onNavigate('visits')}
            className="group bg-gradient-to-b from-white to-amber-50/40 p-4 rounded-2xl border border-amber-200/80 shadow-2xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 group-hover:text-amber-700">Visits Management</h4>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">Cashier</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Billing, copays &amp; reversals</p>
            </div>
          </div>

          {/* Action 4: Take Payment */}
          <div
            onClick={() => onNavigate('payments')}
            className="group bg-gradient-to-b from-white to-amber-50/40 p-4 rounded-2xl border border-amber-200/80 shadow-2xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-amber-700">Payments &amp; Receipts</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">MoMo, cash, bank ledger</p>
            </div>
          </div>

          {/* Action 5: Partner Network */}
          <div
            onClick={() => onNavigate('partner_portal')}
            className="group bg-gradient-to-b from-white to-indigo-50/40 p-4 rounded-2xl border border-indigo-200/80 shadow-2xs hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-700">Partner Network</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Authorizations &amp; claims</p>
            </div>
          </div>

          {/* Action 6: Packages */}
          <div
            onClick={() => onNavigate('packages')}
            className="group bg-gradient-to-b from-white to-purple-50/40 p-4 rounded-2xl border border-purple-200/80 shadow-2xs hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-purple-700">Care Packages</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Pricing &amp; benefit builder</p>
            </div>
          </div>
        </div>
      </div>

      {/* CORE OPERATIONAL KPI TILES GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tile 1: Registered Patients */}
        <div
          onClick={() => onNavigate('patients')}
          className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-700">
              Registered Patients
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{totalPatients}</span>
            <span className="text-[11px] font-bold text-emerald-700">Unique IDs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>One Member → One Account</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600" />
          </p>
        </div>

        {/* Tile 2: Active PVC Cards */}
        <div
          onClick={() => onNavigate('cards')}
          className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-teal-700">
              Active Afya Cards
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{activeCards}</span>
            <span className="text-[11px] font-bold text-teal-700">{cards.length} Total</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>CR80 Physical Badges</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600" />
          </p>
        </div>

        {/* Tile 3: Package Memberships */}
        <div
          onClick={() => onNavigate('packages')}
          className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-700">
              Package Members
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{activePackageMembers}</span>
            <span className="text-[11px] font-bold text-blue-700">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Basic &amp; Premium Care</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600" />
          </p>
        </div>

        {/* Tile 4: Chronic & Sickle Cell */}
        <div
          onClick={() => onNavigate('chronic')}
          className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-rose-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-rose-700">
              Chronic &amp; Sickle Cell
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {activeChronicMembers + sickleCellCount}
            </span>
            <span className="text-[11px] font-bold text-rose-700">{sickleCellCount} Sickle Cell</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Specialized Clinical Care</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-600" />
          </p>
        </div>
      </div>

      {/* SECONDARY OPERATIONAL TILES: FINANCIAL, CLINICAL ENCOUNTERS & PARTNER NETWORK */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Payments Ledger Tile */}
        <div
          onClick={() => onNavigate('payments')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-400 cursor-pointer transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Payments Ledger</span>
            <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
              UGX {totalPaymentsUGX.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold">{payments.length} Audited Receipts Issued</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600" />
        </div>

        {/* Encounters Tile */}
        <div
          onClick={() => onNavigate('visits')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-400 cursor-pointer transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Encounters &amp; Visits</span>
            <p className="text-xl font-black text-slate-900 font-mono mt-0.5">{totalVisits}</p>
            <p className="text-[11px] text-teal-700 font-semibold">Automatic Formula Deductions</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600" />
        </div>

        {/* Partner Network Tile */}
        <div
          onClick={() => onNavigate('partner_portal')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 cursor-pointer transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Network className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Partner Network</span>
            <p className="text-xl font-black text-slate-900 font-mono mt-0.5">{facilities.length} Facilities</p>
            <p className="text-[11px] text-blue-700 font-semibold">{pendingClaims} Pending Claims • {pendingAuthorizations} Auth</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
        </div>
      </div>

      {/* AFYA HEALTH CARE NETWORK FACILITIES TILES */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Afya Care Network Participating Facilities</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Headquarters operational center and contracted accredited partner clinics, laboratories, and pharmacies
            </p>
          </div>
          <button
            onClick={() => onNavigate('partner_portal')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Manage Network</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {facilities.map(fac => {
            const isHq = fac.type === 'afya_medicare';
            return (
              <div
                key={fac.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isHq
                    ? 'bg-emerald-50/60 border-emerald-300/80 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isHq
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isHq ? 'Headquarters' : fac.type.replace('partner_', '').toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Active</span>
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{fac.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{fac.location}</p>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>{fac.allowedServices.length} Services</span>
                  <span className="font-mono text-slate-700">{fac.contactPhone}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fresh Clean Real-Time Database State Notice if 0 patients */}
      {totalPatients === 0 && (
        <div className="p-8 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 rounded-3xl border-2 border-dashed border-emerald-300 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Live Real-Time Database Ready</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Sample dummy data has been completely cleared. Your Afya Health network is running on Cloud Firestore. All new patient registrations, cards, visits, and payments will sync in real-time.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <button
              onClick={onNewPatient}
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register First Member</span>
            </button>
            <button
              onClick={onScanCard}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs sm:text-sm font-bold border border-slate-300 shadow-2xs transition-colors"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Open Scan Terminal</span>
            </button>
          </div>
        </div>
      )}

      {/* Two-Column Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visits Tile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Recent Visits &amp; Benefit Encounters</h3>
            </div>
            <button
              onClick={() => onNavigate('visits')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentVisits.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentVisits.map(visit => (
                <div key={visit.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{visit.patientName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {visit.serviceName} • <span className="text-slate-700">{visit.facilityName.split('–')[0]}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        visit.status === 'REVERSED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {visit.status === 'REVERSED' ? 'REVERSED' : visit.visitDeducted ? '-1 VISIT DEDUCTED' : 'COVERED'}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(visit.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400 space-y-2">
              <CalendarCheck className="w-7 h-7 text-slate-300 mx-auto" />
              <p>No clinical visits recorded yet. Use the reception card scanner to record the first encounter.</p>
            </div>
          )}
        </div>

        {/* Recent Healthcare Payments Tile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Recent Healthcare Payments</h3>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentPayments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentPayments.map(payment => (
                <div key={payment.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{payment.patientName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {payment.itemDescription} • <span className="font-mono text-slate-700">{payment.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-800 text-xs">
                      UGX {payment.amount.toLocaleString()}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {payment.receiptNumber}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400 space-y-2">
              <Receipt className="w-7 h-7 text-slate-300 mx-auto" />
              <p>No payments recorded yet. Record package purchases or chronic renewals to populate the ledger.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
