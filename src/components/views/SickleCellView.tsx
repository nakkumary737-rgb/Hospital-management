import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SickleCellProfile } from '../../types';
import {
  HeartPulse,
  Shield,
  AlertTriangle,
  Stethoscope,
  Pill,
  Printer,
  Calendar,
  Phone,
  Building2,
  CheckCircle2,
  Plus,
  Trash2,
  UserPlus
} from 'lucide-react';
import {
  SickleCellConsultationModal,
  MedicationPickupModal
} from '../clinical/ClinicalActionModals';

interface SickleCellViewProps {
  onScanCard: (cardNumber: string) => void;
  onOpenCardPreview: (cardId: string) => void;
}

export const SickleCellView: React.FC<SickleCellViewProps> = ({
  onScanCard,
  onOpenCardPreview
}) => {
  const {
    sickleCellProfiles,
    patients,
    cards,
    updateSickleCellProfile,
    registerSickleCellProfile,
    deleteSickleCellProfile,
    confirmAction,
    showToast
  } = useApp();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    sickleCellProfiles[0]?.id || null
  );

  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showEditAlerts, setShowEditAlerts] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newAlert, setNewAlert] = useState('');

  // Register Form State
  const [regPatientId, setRegPatientId] = useState(patients[0]?.id || '');
  const [regGenotype, setRegGenotype] = useState<'HbSS' | 'HbSC' | 'HbS-beta-thalassemia' | 'Other'>('HbSS');
  const [regBloodGroup, setRegBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [regWeight, setRegWeight] = useState(48);
  const [regEmergencyProtocol, setRegEmergencyProtocol] = useState(
    'Rapid IV hydration (Normal Saline 1L), IV Morphine/Tramadol analgesia within 30 mins. Oxygen if SpO2 < 95%.'
  );
  const [regEmergencyName, setRegEmergencyName] = useState('');
  const [regEmergencyRel, setRegEmergencyRel] = useState('Parent');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('+256 701 445 920');
  const [regReferralCenter, setRegReferralCenter] = useState('Mulago National Referral Hospital - Sickle Cell Unit');
  const [regAllergies, setRegAllergies] = useState('None known');
  const [regMeds, setRegMeds] = useState('Hydroxyurea 500mg OD\nFolic Acid 5mg OD\nPaludrine Prophylaxis');

  const activeProfile =
    sickleCellProfiles.find(s => s.id === selectedProfileId) || sickleCellProfiles[0];
  const patient = activeProfile ? patients.find(p => p.id === activeProfile.patientId) : undefined;
  const card = patient ? cards.find(c => c.patientId === patient.id && c.cardType === 'SICKLE_CELL') : undefined;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPatientId) return;

    const medList = regMeds
      .split('\n')
      .map(m => m.trim())
      .filter(Boolean);
    const allergyList = regAllergies
      .split('\n')
      .map(m => m.trim())
      .filter(Boolean);

    const targetPatient = patients.find(p => p.id === regPatientId);

    const newProfile = registerSickleCellProfile({
      patientId: regPatientId,
      genotype: regGenotype,
      bloodGroup: regBloodGroup,
      baselineWeightKg: regWeight,
      carePlan: 'Routine comprehensive sickle cell clinic follow-up and surveillance',
      lastReviewDate: new Date().toISOString().split('T')[0],
      emergencyProtocol: regEmergencyProtocol,
      emergencyContact: {
        name: regEmergencyName || targetPatient?.emergencyContact.name || 'Emergency Contact',
        relation: regEmergencyRel || targetPatient?.emergencyContact.relationship || 'Guardian',
        phone: regEmergencyPhone || targetPatient?.emergencyContact.phone || '+256 700 000 000'
      },
      referralCenter: regReferralCenter,
      clinicalAlerts: ['High priority sickle cell disease patient', 'Prompt triage on admission'],
      allergies: allergyList,
      currentMedications: medList,
      nextReviewDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      consultationHistory: []
    });

    setSelectedProfileId(newProfile.id);
    setShowRegisterModal(false);
    showToast('Sickle Cell Clinical Profile registered! Clinical ID and Emergency Card issued.', 'success');
  };

  const handleDeleteProfile = (profile: SickleCellProfile) => {
    const targetPatient = patients.find(p => p.id === profile.patientId);
    confirmAction({
      title: 'Delete Sickle Cell Profile',
      message: `Are you sure you want to permanently delete the Sickle Cell profile for ${targetPatient?.fullName || 'this patient'}?\n\nThis will remove their crisis protocol, clinical baseline, and surveillance log.`,
      confirmLabel: 'Delete Profile',
      variant: 'danger',
      onConfirm: () => {
        deleteSickleCellProfile(profile.id);
        if (selectedProfileId === profile.id) {
          setSelectedProfileId(null);
        }
        showToast('Sickle Cell profile was removed.', 'info');
      }
    });
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile || !newAlert.trim()) return;

    const updated = {
      ...activeProfile,
      clinicalAlerts: [...activeProfile.clinicalAlerts, newAlert.trim()]
    };
    updateSickleCellProfile(updated);
    setNewAlert('');
    setShowEditAlerts(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Strict Clinical Separation Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Sickle Cell Clinical Network</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Strict clinical identity and emergency triage management. No financial tracking or payment gatekeeping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-rose-100 text-rose-800 rounded-full text-xs font-bold flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>{sickleCellProfiles.length} Registered Sickle Cell Patients</span>
          </span>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Sickle Cell</span>
          </button>
        </div>
      </div>

      {/* Zero Financial Gate Banner */}
      <div className="p-4 bg-gradient-to-r from-rose-900 via-red-900 to-rose-950 text-white rounded-2xl shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
          <Shield className="w-6 h-6 text-rose-300" />
        </div>
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-sm text-white">Emergency Clinical Protocol Notice</p>
          <p className="text-rose-200 leading-relaxed">
            Sickle Cell cards are purely clinical credentials. In accordance with Afya Medicare clinical policy, urgent pain crisis relief and hydration must never be delayed for administrative payment processing.
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Registered Patients List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Sickle Cell Registry
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {sickleCellProfiles.map(sc => {
              const p = patients.find(pat => pat.id === sc.patientId);
              const isSelected = activeProfile?.id === sc.id;

              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedProfileId(sc.id)}
                  className={`w-full text-left p-4 transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-rose-50/80 border-l-4 border-rose-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900">{p?.fullName || 'Patient'}</div>
                    <div className="font-mono text-[11px] text-slate-500">{p?.memberId}</div>
                    <div className="flex items-center gap-2 text-[10px] text-rose-700 font-bold">
                      <span>Genotype: {sc.genotype}</span>
                      <span>•</span>
                      <span>Blood: {sc.bloodGroup}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    CLINICAL ID
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sickle Cell Clinical Care Dashboard (8 cols) */}
        {activeProfile && patient ? (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
            {/* Identity & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-700 text-white font-black text-2xl flex items-center justify-center shadow-sm">
                  {patient.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{patient.fullName}</h2>
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-900 rounded-full text-xs font-black font-mono">
                      {activeProfile.genotype}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Member ID: <strong className="text-slate-800">{patient.memberId}</strong> • DOB: {patient.dob} ({patient.sex})
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
                      <span>Print Clinical Card</span>
                    </button>
                    <button
                      onClick={() => onScanCard(card.cardNumber)}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-2xs"
                    >
                      Scan Desk
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteProfile(activeProfile)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete Sickle Cell Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Clinical Vital Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-semibold">GENOTYPE</span>
                <strong className="text-base text-rose-800 block mt-0.5 font-black">{activeProfile.genotype}</strong>
                <span className="text-[10px] text-slate-400">Sickle cell disease</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-semibold">BLOOD GROUP</span>
                <strong className="text-base text-slate-900 block mt-0.5 font-black">{activeProfile.bloodGroup}</strong>
                <span className="text-[10px] text-slate-400">Transfusion record</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-semibold">BASELINE WEIGHT</span>
                <strong className="text-base text-slate-900 block mt-0.5 font-bold">{activeProfile.baselineWeightKg} kg</strong>
                <span className="text-[10px] text-slate-400">For drug dosing</span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-[10px] text-rose-800 block font-bold">NEXT REVIEW</span>
                <strong className="text-sm text-rose-900 block mt-0.5">{activeProfile.nextReviewDate}</strong>
                <span className="text-[10px] text-rose-700">Scheduled surveillance</span>
              </div>
            </div>

            {/* Emergency Protocol Box */}
            <div className="p-4 bg-rose-50/80 border border-rose-300 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-950 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Immediate Emergency Triage &amp; Crisis Protocol</span>
                </span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-rose-800 border border-rose-200">
                  Priority Action
                </span>
              </div>
              <p className="text-xs text-slate-800 font-mono bg-white p-3 rounded-xl border border-rose-200 leading-relaxed">
                {activeProfile.emergencyProtocol}
              </p>
              <div className="flex items-center justify-between text-[11px] text-rose-900 pt-1">
                <span>Emergency Contact: <strong>{activeProfile.emergencyContact.name} ({activeProfile.emergencyContact.relation})</strong> • {activeProfile.emergencyContact.phone}</span>
                <span>Referral: <strong>{activeProfile.referralCenter}</strong></span>
              </div>
            </div>

            {/* Clinical Alerts and Allergies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Important Clinical Alerts:</span>
                  <button
                    onClick={() => setShowEditAlerts(true)}
                    className="text-[10px] text-rose-700 font-semibold hover:underline"
                  >
                    + Add Alert
                  </button>
                </div>
                <ul className="space-y-1 text-xs text-slate-700">
                  {activeProfile.clinicalAlerts.map((alert, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                <span className="font-bold text-xs text-amber-950 block">Allergies &amp; Contraindications:</span>
                <ul className="space-y-1 text-xs text-amber-900 font-semibold">
                  {activeProfile.allergies.map((alg, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <span>{alg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Current Prophylaxis & Medications */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-rose-600" />
                <span>Current Prophylactic Regimen:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {activeProfile.currentMedications.map((med, i) => (
                  <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
                    {med}
                  </span>
                ))}
              </div>
            </div>

            {/* Clinical Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setShowConsultModal(true)}
                className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Record Crisis / Clinical Review</span>
              </button>

              <button
                onClick={() => setShowRefillModal(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Pill className="w-4 h-4" />
                <span>Dispense Hydroxyurea Refill</span>
              </button>
            </div>

            {/* Consultation & Crisis Log */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Clinical Consultation &amp; Crisis History
              </h4>

              <div className="space-y-2 text-xs">
                {activeProfile.consultationHistory && activeProfile.consultationHistory.length > 0 ? (
                  activeProfile.consultationHistory.map((c, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-rose-900 font-bold">{c.crisisType || 'Clinical Review'}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{c.date} • {c.clinician}</span>
                      </div>
                      <div className="text-slate-700 font-mono text-[11px]">{c.vitals}</div>
                      <p className="text-slate-600 italic">Treatment: {c.treatmentGiven}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs">No recorded crisis encounters yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Add Alert Modal */}
      {showEditAlerts && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Add Clinical Alert</h3>
            <form onSubmit={handleAddAlert} className="space-y-3">
              <input
                type="text"
                required
                value={newAlert}
                onChange={e => setNewAlert(e.target.value)}
                placeholder="e.g. History of acute chest syndrome in 2025"
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditAlerts(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modals */}
      {showConsultModal && activeProfile && (
        <SickleCellConsultationModal
          isOpen={true}
          onClose={() => setShowConsultModal(false)}
          profile={activeProfile}
        />
      )}

      {showRefillModal && activeProfile && (
        <MedicationPickupModal
          isOpen={true}
          onClose={() => setShowRefillModal(false)}
          membershipId={activeProfile.id}
          defaultMedications={activeProfile.currentMedications}
        />
      )}

      {/* REGISTER SICKLE CELL PATIENT MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Register Sickle Cell Patient</h3>
                  <p className="text-[11px] text-slate-500">Strict clinical care &amp; emergency crisis protocol registry</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient</label>
                <select
                  required
                  value={regPatientId}
                  onChange={e => setRegPatientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white font-medium"
                >
                  <option value="">-- Choose Member --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.memberId}) - {p.sex}, {p.dob}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Genotype</label>
                  <select
                    value={regGenotype}
                    onChange={e => setRegGenotype(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 bg-white font-bold"
                  >
                    <option value="HbSS">HbSS</option>
                    <option value="HbSC">HbSC</option>
                    <option value="HbS-beta-thalassemia">HbS-Beta Thal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={regBloodGroup}
                    onChange={e => setRegBloodGroup(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 bg-white font-bold"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={regWeight}
                    onChange={e => setRegWeight(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Crisis Protocol</label>
                <textarea
                  rows={2}
                  required
                  value={regEmergencyProtocol}
                  onChange={e => setRegEmergencyProtocol(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={regEmergencyName}
                    onChange={e => setRegEmergencyName(e.target.value)}
                    placeholder="e.g. Sarah Nakate"
                    className="w-full rounded-xl border border-slate-200 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={regEmergencyPhone}
                    onChange={e => setRegEmergencyPhone(e.target.value)}
                    placeholder="+256 701 ..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Referral Center</label>
                <input
                  type="text"
                  value={regReferralCenter}
                  onChange={e => setRegReferralCenter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Maintained Medications (one per line)</label>
                <textarea
                  rows={2}
                  value={regMeds}
                  onChange={e => setRegMeds(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Clinical Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
