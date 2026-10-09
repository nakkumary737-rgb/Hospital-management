import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, HealthcarePackage, ChronicProgram } from '../../types';
import {
  UserPlus,
  X,
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowRight,
  Shield,
  CreditCard,
  HeartPulse,
  Activity,
  Package,
  Calendar,
  Phone,
  MapPin,
  Sparkles,
  Layers
} from 'lucide-react';

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExistingPatient?: (patient: Patient) => void;
}

export const RegisterPatientModal: React.FC<RegisterPatientModalProps> = ({
  isOpen,
  onClose,
  onSelectExistingPatient
}) => {
  const { packages, chronicPrograms, patients, checkPatientDuplicates, registerPatient, showToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Kitende – Mwenda Stage, Wakiso');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Next of Kin');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Initial Program / Card Option
  const [enrollmentType, setEnrollmentType] = useState<'package' | 'chronic' | 'sickle_cell' | 'none'>('package');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedChronicProgramId, setSelectedChronicProgramId] = useState<string>('');

  // Duplicate candidates
  const [duplicateCandidates, setDuplicateCandidates] = useState<Patient[]>([]);
  const [checkedDuplicates, setCheckedDuplicates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default package when packages are loaded or updated
  useEffect(() => {
    if (packages.length > 0) {
      if (!selectedPackageId || !packages.some(p => p.id === selectedPackageId)) {
        setSelectedPackageId(packages[0].id);
      }
    }
  }, [packages, selectedPackageId]);

  // Sync default chronic program
  useEffect(() => {
    if (chronicPrograms.length > 0) {
      if (!selectedChronicProgramId || !chronicPrograms.some(c => c.id === selectedChronicProgramId)) {
        setSelectedChronicProgramId(chronicPrograms[0].id);
      }
    }
  }, [chronicPrograms, selectedChronicProgramId]);

  if (!isOpen) return null;

  const handleDuplicateCheck = () => {
    if (!fullName.trim() && !phone.trim()) {
      showToast('Please enter at least a Full Name or Phone number to check duplicates.', 'warning');
      return;
    }
    const dupes = checkPatientDuplicates(fullName, phone, dob);
    setDuplicateCandidates(dupes);
    setCheckedDuplicates(true);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Patient Full Name is required.', 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('Phone Number is required.', 'error');
      return;
    }
    if (!dob) {
      showToast('Date of Birth is required.', 'error');
      return;
    }

    // Run duplicate check if not yet run
    if (!checkedDuplicates) {
      const dupes = checkPatientDuplicates(fullName, phone, dob);
      if (dupes.length > 0) {
        setDuplicateCandidates(dupes);
        setCheckedDuplicates(true);
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const targetPackageId =
        enrollmentType === 'package'
          ? (selectedPackageId || packages[0]?.id)
          : undefined;

      const targetChronicId =
        enrollmentType === 'chronic'
          ? (selectedChronicProgramId || chronicPrograms[0]?.id)
          : undefined;

      const isSickleCell = enrollmentType === 'sickle_cell';

      const { patient, card } = registerPatient(
        {
          fullName: fullName.trim(),
          dob,
          sex,
          phone: phone.trim(),
          address: address.trim(),
          emergencyContact: {
            name: emergencyName.trim() || 'Next of Kin',
            relationship: emergencyRelation.trim() || 'Next of Kin',
            phone: emergencyPhone.trim() || phone.trim()
          },
          status: 'ACTIVE',
          notes: notes.trim()
        },
        targetPackageId,
        targetChronicId,
        isSickleCell
      );

      showToast(`Patient ${patient.fullName} (${patient.memberId}) registered successfully! Card: ${card.cardNumber}`, 'success');
      onClose();
    } catch (err: any) {
      showToast('Failed to register patient: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextMemberNumber = patients.length + 1;
  const previewMemberId = `AFY-${String(nextMemberNumber).padStart(6, '0')}`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header with Next Member ID Badge */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Register New Afya Member</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                  Assigned ID: {previewMemberId}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                One Member Account → One Patient ID → Multi-Program Card Issuance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleFinalSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Duplicate candidates warning box */}
          {checkedDuplicates && duplicateCandidates.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Existing Member Match Detected ({duplicateCandidates.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckedDuplicates(false)}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                A member with a matching phone number, name, or birth date already exists. Afya Medicare policy mandates one account per member.
              </p>
              <div className="space-y-2 mt-2">
                {duplicateCandidates.map(dupe => (
                  <div key={dupe.id} className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <strong className="text-slate-900 font-bold text-xs">{dupe.fullName}</strong>
                      <span className="text-slate-500 ml-1.5 font-medium">({dupe.sex}, DOB: {dupe.dob})</span>
                      <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                        Member ID: <span className="text-emerald-700 font-bold">{dupe.memberId}</span> • Phone: {dupe.phone}
                      </div>
                    </div>
                    {onSelectExistingPatient && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectExistingPatient(dupe);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <span>Select Existing</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Demographic & Personal Identity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">1. Member Demographics</span>
              <span className="text-[11px] text-slate-400">* Required Fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => {
                    setFullName(e.target.value);
                    setCheckedDuplicates(false);
                  }}
                  placeholder="e.g. Jane Nakato or John Kato"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Primary Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value);
                      setCheckedDuplicates(false);
                    }}
                    placeholder="e.g. +256 702 118 450"
                    className="flex-1 rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleDuplicateCheck}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors shrink-0"
                    title="Run anti-duplicate search"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Check</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Gender Selection Tile Buttons */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Gender / Sex <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSex('Female')}
                  className={`py-2.5 px-3 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    sex === 'Female'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">👩</span>
                  <span>Female</span>
                  {sex === 'Female' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSex('Male')}
                  className={`py-2.5 px-3 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    sex === 'Male'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">👨</span>
                  <span>Male</span>
                  {sex === 'Male' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSex('Other')}
                  className={`py-2.5 px-3 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    sex === 'Other'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">👤</span>
                  <span>Other</span>
                  {sex === 'Other' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Date of Birth & Physical Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={e => {
                    setDob(e.target.value);
                    setCheckedDuplicates(false);
                  }}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Physical Address / Village</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Kitende – Mwenda Stage, Wakiso"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Program Enrollment & Card Type */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                2. Membership &amp; Care Entitlements
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">Configurable Benefits</span>
            </div>

            {/* Program Type Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setEnrollmentType('package')}
                className={`p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  enrollmentType === 'package'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Package className="w-5 h-5 text-emerald-700" />
                <span className="text-xs">Health Package</span>
                <span className="text-[10px] text-slate-400 font-normal">Covered visits</span>
              </button>

              <button
                type="button"
                onClick={() => setEnrollmentType('chronic')}
                className={`p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  enrollmentType === 'chronic'
                    ? 'bg-teal-50 border-teal-600 text-teal-950 ring-2 ring-teal-500/20 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HeartPulse className="w-5 h-5 text-teal-700" />
                <span className="text-xs">Chronic Care</span>
                <span className="text-[10px] text-slate-400 font-normal">Monthly renewal</span>
              </button>

              <button
                type="button"
                onClick={() => setEnrollmentType('sickle_cell')}
                className={`p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  enrollmentType === 'sickle_cell'
                    ? 'bg-rose-50 border-rose-600 text-rose-950 ring-2 ring-rose-500/20 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Activity className="w-5 h-5 text-rose-700" />
                <span className="text-xs">Sickle Cell ID</span>
                <span className="text-[10px] text-slate-400 font-normal">Clinical profile</span>
              </button>

              <button
                type="button"
                onClick={() => setEnrollmentType('none')}
                className={`p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  enrollmentType === 'none'
                    ? 'bg-slate-100 border-slate-500 text-slate-950 ring-2 ring-slate-400/20 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-slate-600" />
                <span className="text-xs">Card Only</span>
                <span className="text-[10px] text-slate-400 font-normal">Identity badge</span>
              </button>
            </div>

            {/* HEALTH PACKAGE TILES GRID */}
            {enrollmentType === 'package' && (
              <div className="space-y-2 mt-2">
                <label className="block font-bold text-slate-700">
                  Select Covered Health Package <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {packages.map(pkg => {
                    const isSelected = selectedPackageId === pkg.id;
                    const isFamily = pkg.packageType.startsWith('FAMILY_');

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                              {isFamily ? 'Family Care' : 'Individual'}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-black text-slate-900 font-mono">
                                UGX {pkg.price.toLocaleString()}
                              </span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </div>
                          </div>

                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">{pkg.name}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            <strong className="text-emerald-800 font-bold">{pkg.visitsPurchased} Covered Visits</strong> • {pkg.validityDays} Days Validity
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {pkg.consultationBenefits} • {pkg.labBenefits}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CHRONIC CARE PROGRAM TILES */}
            {enrollmentType === 'chronic' && (
              <div className="space-y-2 mt-2">
                <label className="block font-bold text-slate-700">
                  Select Chronic Care Program <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {chronicPrograms.map(prog => {
                    const isSelected = selectedChronicProgramId === prog.id;

                    return (
                      <div
                        key={prog.id}
                        onClick={() => setSelectedChronicProgramId(prog.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-teal-50/70 border-teal-600 ring-2 ring-teal-500/20 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-teal-800 font-bold">
                              UGX {prog.monthlyFee.toLocaleString()}/mo
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 leading-tight">{prog.name}</h4>
                          <p className="text-[11px] text-slate-500">{prog.condition}</p>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{prog.medicationBenefits}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SICKLE CELL PROGRAM ALERT BANNER */}
            {enrollmentType === 'sickle_cell' && (
              <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-950 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <span>Sickle Cell Clinical Identification Program</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Patient will receive a dedicated <strong>Afya Sickle Cell Clinical Care Card</strong>. This card carries strictly medical identity and emergency triage instructions (HbSS status, pain relief, hydration priority). It does <em>not</em> function as a payment or money card.
                </p>
              </div>
            )}

            {/* CARD ONLY BANNER */}
            {enrollmentType === 'none' && (
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs">
                <span>Standard membership card with unique Afya Member ID. Packages or clinical programs can be attached at any later date.</span>
              </div>
            )}
          </div>

          {/* Section 3: Emergency Contact & Notes */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">3. Emergency Contact &amp; Notes</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <span className="font-bold text-slate-800 block text-xs">Emergency Next of Kin</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Contact Full Name"
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                  className="rounded-xl border border-slate-200 p-2 bg-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g. Spouse / Parent)"
                  value={emergencyRelation}
                  onChange={e => setEmergencyRelation(e.target.value)}
                  className="rounded-xl border border-slate-200 p-2 bg-white text-xs"
                />
                <input
                  type="tel"
                  placeholder="Contact Phone Number"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  className="rounded-xl border border-slate-200 p-2 bg-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reception &amp; Intake Notes</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Regular patient residing near Mwenda Stage, Kitende"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 text-xs sm:text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register & Issue Afya Card'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
