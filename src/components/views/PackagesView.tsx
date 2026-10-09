import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HealthcarePackage, PackageType } from '../../types';
import {
  Package,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
  Clock,
  Sparkles,
  Shield,
  Layers,
  Power
} from 'lucide-react';

export const PackagesView: React.FC = () => {
  const { packages, savePackage, deletePackage, currentUser, confirmAction, showToast } = useApp();

  const [editingPackage, setEditingPackage] = useState<HealthcarePackage | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [packageType, setPackageType] = useState<PackageType>('INDIVIDUAL_BASIC');
  const [price, setPrice] = useState(150000);
  const [visitsPurchased, setVisitsPurchased] = useState(3);
  const [validityDays, setValidityDays] = useState(180);
  const [coveredServices, setCoveredServices] = useState('');
  const [excludedServices, setExcludedServices] = useState('');
  const [labBenefits, setLabBenefits] = useState('');
  const [consultationBenefits, setConsultationBenefits] = useState('');
  const [ultrasoundBenefits, setUltrasoundBenefits] = useState('');
  const [medicationBenefits, setMedicationBenefits] = useState('');
  const [specialistBenefits, setSpecialistBenefits] = useState('');
  const [emergencyBenefits, setEmergencyBenefits] = useState('');
  const [allocationModel, setAllocationModel] = useState<'shared' | 'individual'>('shared');
  const [maxDependents, setMaxDependents] = useState(4);
  const [renewalRules, setRenewalRules] = useState('Renewable annually');

  const startEdit = (pkg: HealthcarePackage) => {
    setEditingPackage(pkg);
    setIsCreating(false);
    setName(pkg.name);
    setPackageType(pkg.packageType);
    setPrice(pkg.price);
    setVisitsPurchased(pkg.visitsPurchased);
    setValidityDays(pkg.validityDays);
    setCoveredServices(pkg.coveredServices.join('\n'));
    setExcludedServices(pkg.excludedServices.join('\n'));
    setLabBenefits(pkg.labBenefits);
    setConsultationBenefits(pkg.consultationBenefits);
    setUltrasoundBenefits(pkg.ultrasoundBenefits);
    setMedicationBenefits(pkg.medicationBenefits);
    setSpecialistBenefits(pkg.specialistBenefits);
    setEmergencyBenefits(pkg.emergencyBenefits);
    setAllocationModel(pkg.familyRules?.allocationModel || 'shared');
    setMaxDependents(pkg.familyRules?.maxDependents || 0);
    setRenewalRules(pkg.renewalRules);
  };

  const startCreate = () => {
    setEditingPackage(null);
    setIsCreating(true);
    setName('Custom Healthcare Package');
    setPackageType('CUSTOM');
    setPrice(200000);
    setVisitsPurchased(5);
    setValidityDays(365);
    setCoveredServices('General Outpatient Consultation\nMalaria & Routine Lab\nFirst-line Essential Medicines');
    setExcludedServices('Elective Surgeries\nMajor Dialysis');
    setLabBenefits('Routine basic outpatient testing');
    setConsultationBenefits('Outpatient medical officer reviews');
    setUltrasoundBenefits('Available with 20% discount');
    setMedicationBenefits('Essential prescription drugs');
    setSpecialistBenefits('By referral');
    setEmergencyBenefits('First-aid triage stabilization');
    setAllocationModel('shared');
    setMaxDependents(3);
    setRenewalRules('Renewable annually');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const coveredList = coveredServices
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    const excludedList = excludedServices
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const now = new Date().toISOString();

    const pkgToSave: HealthcarePackage = {
      id: editingPackage ? editingPackage.id : `pkg-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      packageType,
      price,
      currency: 'UGX',
      visitsPurchased,
      validityDays,
      coveredServices: coveredList,
      excludedServices: excludedList,
      labBenefits,
      consultationBenefits,
      ultrasoundBenefits,
      medicationBenefits,
      specialistBenefits,
      emergencyBenefits,
      familyRules: {
        maxDependents,
        allocationModel
      },
      renewalRules,
      isActive: true,
      createdAt: editingPackage ? editingPackage.createdAt : now
    };

    savePackage(pkgToSave);
    setEditingPackage(null);
    setIsCreating(false);
    showToast(`Healthcare Package "${pkgToSave.name}" saved successfully (UGX ${pkgToSave.price.toLocaleString()})!`, 'success');
  };

  const handleDeletePackage = (pkg: HealthcarePackage) => {
    confirmAction({
      title: 'Delete Healthcare Package',
      message: `Are you sure you want to permanently delete package "${pkg.name}"?\n\nThis will remove it from future patient registration and plan selections.`,
      confirmLabel: 'Delete Package',
      variant: 'danger',
      onConfirm: () => {
        deletePackage(pkg.id);
        if (editingPackage?.id === pkg.id) {
          setEditingPackage(null);
        }
        showToast(`Package "${pkg.name}" was removed.`, 'info');
      }
    });
  };

  const handleToggleStatus = (pkg: HealthcarePackage) => {
    const updated: HealthcarePackage = {
      ...pkg,
      isActive: !pkg.isActive
    };
    savePackage(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Healthcare Package Builder</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Admin configurable package prices, covered visits, benefit rules &amp; family allocation models
          </p>
        </div>

        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map(pkg => {
          const isFamily = pkg.packageType.startsWith('FAMILY_');

          return (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5 hover:border-emerald-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {pkg.packageType.replace('_', ' ')}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{pkg.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(pkg)}
                      className={`p-1.5 rounded-xl transition-colors ${
                        pkg.isActive !== false
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={pkg.isActive !== false ? 'Package Active (Click to pause)' : 'Package Inactive (Click to activate)'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEdit(pkg)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                      title="Edit Package Configuration"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price & Visits Highlights */}
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">PRICE (UGX)</span>
                    <strong className="text-sm sm:text-base font-black text-slate-900 font-mono">
                      {pkg.price.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">COVERED VISITS</span>
                    <strong className="text-sm sm:text-base font-black text-emerald-800 font-mono">
                      {pkg.visitsPurchased} Visits
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">VALIDITY</span>
                    <strong className="text-xs sm:text-sm font-bold text-slate-800">
                      {pkg.validityDays} Days
                    </strong>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="text-xs space-y-2">
                  <div className="font-semibold text-slate-800">Key Benefits Configured:</div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Consultations:</strong> {pkg.consultationBenefits}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Diagnostics:</strong> {pkg.labBenefits}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Medications:</strong> {pkg.medicationBenefits}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Ultrasound:</strong> {pkg.ultrasoundBenefits}</span>
                    </li>
                  </ul>
                </div>

                {/* Family Rules if Family Package */}
                {isFamily && (
                  <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900">
                    <span className="font-bold block text-[11px] mb-0.5">Family Model:</span>
                    <span>
                      Up to {pkg.familyRules.maxDependents} dependents • Model:{' '}
                      <strong>
                        {pkg.familyRules.allocationModel === 'shared'
                          ? 'Shared Family Visit Pool'
                          : 'Individual Allocated Visits'}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold text-[11px]">
                  Configurable without code modification
                </span>
                <button
                  onClick={() => startEdit(pkg)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                >
                  Edit Configuration
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT / CREATE PACKAGE MODAL */}
      {(editingPackage || isCreating) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {isCreating ? 'Create Healthcare Package' : `Configure: ${name}`}
                  </h2>
                  <p className="text-xs text-slate-400">Admin pricing, visits, and clinical rules editor</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingPackage(null);
                  setIsCreating(false);
                }}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Classification</label>
                  <select
                    value={packageType}
                    onChange={e => setPackageType(e.target.value as PackageType)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="INDIVIDUAL_BASIC">Individual Basic</option>
                    <option value="INDIVIDUAL_PREMIUM">Individual Premium</option>
                    <option value="FAMILY_BASIC">Family Basic</option>
                    <option value="FAMILY_PREMIUM">Family Premium</option>
                    <option value="CUSTOM">Custom Package</option>
                  </select>
                </div>
              </div>

              {/* Price, Visits, Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (UGX)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-mono focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Number of Covered Visits</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={visitsPurchased}
                    onChange={e => setVisitsPurchased(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-mono focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    required
                    min="30"
                    value={validityDays}
                    onChange={e => setValidityDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Family Rules if applicable */}
              {packageType.startsWith('FAMILY_') && (
                <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl space-y-3">
                  <span className="font-bold text-teal-950 block">Family Package Rules</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-teal-900 mb-1">Visit Allocation Model</label>
                      <select
                        value={allocationModel}
                        onChange={e => setAllocationModel(e.target.value as any)}
                        className="w-full rounded-lg border border-teal-300 p-2 bg-white"
                      >
                        <option value="shared">Shared Family Visits Pool</option>
                        <option value="individual">Individual Dependent Allocations</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-teal-900 mb-1">Max Dependents</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={maxDependents}
                        onChange={e => setMaxDependents(Number(e.target.value))}
                        className="w-full rounded-lg border border-teal-300 p-2 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits Specifications */}
              <div className="space-y-3 pt-1">
                <span className="font-bold text-slate-800 block">Specific Clinical Entitlement Rules</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Consultation Benefits</label>
                    <input
                      type="text"
                      value={consultationBenefits}
                      onChange={e => setConsultationBenefits(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Laboratory Benefits</label>
                    <input
                      type="text"
                      value={labBenefits}
                      onChange={e => setLabBenefits(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Medication Benefits</label>
                    <input
                      type="text"
                      value={medicationBenefits}
                      onChange={e => setMedicationBenefits(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ultrasound Benefits</label>
                    <input
                      type="text"
                      value={ultrasoundBenefits}
                      onChange={e => setUltrasoundBenefits(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Covered Services (one per line)</label>
                  <textarea
                    rows={3}
                    value={coveredServices}
                    onChange={e => setCoveredServices(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Excluded Services (one per line)</label>
                  <textarea
                    rows={2}
                    value={excludedServices}
                    onChange={e => setExcludedServices(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <div>
                  {editingPackage && (
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(editingPackage)}
                      className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Package</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPackage(null);
                      setIsCreating(false);
                    }}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Package Configuration</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
