import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { AfyaLogo } from '../common/AfyaLogo';
import {
  Shield,
  QrCode,
  Wifi,
  WifiOff,
  User,
  Search,
  Building2,
  ChevronDown,
  Database,
  LogIn,
  LogOut,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenScanner: () => void;
  onSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenScanner, onSearch }) => {
  const {
    currentUser,
    switchUserRole,
    currentFacility,
    facilities,
    isOnline,
    toggleOnlineStatus,
    isFirebaseConnected,
    firebaseUser,
    signInWithGoogle,
    logOut,
    clearAllPatientData,
    confirmAction,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showFacilityMenu, setShowFacilityMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const rolesList: { role: UserRole; label: string; department: string }[] = [
    { role: 'super_admin', label: 'Super Admin', department: 'Executive Management' },
    { role: 'afya_admin', label: 'Afya Administrator', department: 'Network & Packages' },
    { role: 'reception', label: 'Receptionist Desk', department: 'HMIS Attendance & Intake' },
    { role: 'cashier', label: 'Cashier Desk', department: 'Visits Management & Copays' },
    { role: 'doctor', label: 'Doctor / Clinician', department: 'Clinical Encounters' },
    { role: 'nurse', label: 'Staff Nurse', department: 'Clinical Triage' },
    { role: 'pharmacy', label: 'Chief Pharmacist', department: 'Medication Dispensing' },
    { role: 'laboratory', label: 'Lab Technologist', department: 'Diagnostics' },
    { role: 'partner_admin', label: 'Partner Facility Admin', department: 'Partner Network' },
    { role: 'partner_provider', label: 'Partner Provider', department: 'Partner Services' },
    { role: 'auditor', label: 'System Auditor', department: 'Governance & Reports' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Organization */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-xs border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-emerald-500/20">
              <AfyaLogo variant="emblem" size="md" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-900 tracking-tight">AFYA MEDICARE</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                  NETWORK
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span>Kitende – Mwenda Stage, Uganda</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-bold">{currentFacility.name.split('–')[0]}</span>
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search patient, Member ID (AFY-000001), card number..."
                className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl pl-9 pr-20 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                Find
              </button>
            </form>
          </div>

          {/* Right Action Elements */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Real-time DB indicator tile */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                isFirebaseConnected
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
              title="Cloud Firestore real-time database connection status"
            >
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isFirebaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isFirebaseConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </div>
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isFirebaseConnected ? 'REAL-TIME DB' : 'CONNECTING'}</span>
            </div>

            {/* Reception Quick Scan Button */}
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors active:scale-95"
              title="Scan Afya Member Card QR / Number"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Card</span>
            </button>

            {/* Google Authentication Tile / Login */}
            {firebaseUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {firebaseUser.photoURL ? (
                    <img
                      src={firebaseUser.photoURL}
                      alt={firebaseUser.displayName || 'User'}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500/30"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {firebaseUser.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-800 hidden xl:inline">
                    {firebaseUser.displayName || firebaseUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 space-y-2 text-xs">
                    <div className="border-b border-slate-100 pb-2">
                      <p className="font-bold text-slate-900">{firebaseUser.displayName || 'Authenticated Staff'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{firebaseUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        GOOGLE VERIFIED
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        confirmAction({
                          title: 'Reset & Wipe Patient Records',
                          message: 'Are you sure you want to clear all patient, card, encounter, and payment records?\n\nCore health packages, facilities, and inventory templates will remain intact.',
                          confirmLabel: 'Wipe Database Clean',
                          variant: 'danger',
                          onConfirm: async () => {
                            await clearAllPatientData();
                            showToast('Database wiped clean. Ready for real patient entries.', 'info');
                          }
                        });
                      }}
                      className="w-full text-left py-1.5 text-slate-600 hover:text-rose-600 flex items-center gap-1.5 font-medium border-t border-slate-100 pt-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      <span>Wipe / Reset Patient Data</span>
                    </button>
                    <button
                      onClick={() => {
                        logOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left py-1.5 text-rose-600 hover:text-rose-700 flex items-center gap-1.5 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors"
                title="Authenticate with Google"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sign in</span>
              </button>
            )}

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowFacilityMenu(false);
                  setShowUserMenu(false);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.role.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-bold text-slate-900 leading-tight">{currentUser.displayName.split('(')[0]}</div>
                  <div className="text-[10px] text-emerald-700 capitalize leading-tight font-semibold">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Switch User Role</p>
                    <p className="text-[11px] text-slate-500">Test multi-role permissions in real-time</p>
                  </div>
                  {rolesList.map(item => (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchUserRole(item.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                        currentUser.role === item.role ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.department}</div>
                      </div>
                      {currentUser.role === item.role && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
