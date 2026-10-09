import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, PatientStatus } from '../../types';
import {
  Edit3,
  X,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  ShieldAlert,
  Trash2
} from 'lucide-react';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  const { updatePatient, deletePatient, confirmAction, showToast } = useApp();

  const [fullName, setFullName] = useState(patient.fullName);
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>(patient.sex);
  const [dob, setDob] = useState(patient.dob);
  const [phone, setPhone] = useState(patient.phone);
  const [address, setAddress] = useState(patient.address);
  const [emergencyName, setEmergencyName] = useState(patient.emergencyContact?.name || '');
  const [emergencyRelation, setEmergencyRelation] = useState(patient.emergencyContact?.relationship || 'Next of Kin');
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergencyContact?.phone || '');
  const [status, setStatus] = useState<PatientStatus>(patient.status);
  const [notes, setNotes] = useState(patient.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      showToast('Full Name and Phone Number are required.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePatient(patient.id, {
        fullName: fullName.trim(),
        sex,
        dob,
        phone: phone.trim(),
        address: address.trim(),
        emergencyContact: {
          name: emergencyName.trim() || 'Next of Kin',
          relationship: emergencyRelation.trim() || 'Next of Kin',
          phone: emergencyPhone.trim() || phone.trim()
        },
        status,
        notes: notes.trim()
      });

      showToast(`Patient details for ${fullName} (${patient.memberId}) updated successfully.`, 'success');
      onClose();
    } catch (err: any) {
      showToast('Failed to update patient: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Edit Patient Profile</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {patient.memberId}
                </span>
              </div>
              <p className="text-xs text-slate-400">Update demographic, contact, and clinical metadata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Gender Selector Tiles */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Gender / Sex <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSex('Female')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  sex === 'Female'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>👩</span>
                <span>Female</span>
              </button>

              <button
                type="button"
                onClick={() => setSex('Male')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  sex === 'Male'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>👨</span>
                <span>Male</span>
              </button>

              <button
                type="button"
                onClick={() => setSex('Other')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  sex === 'Other'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>👤</span>
                <span>Other</span>
              </button>
            </div>
          </div>

          {/* DOB & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Date of Birth</label>
              <input
                type="date"
                required
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Patient Account Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as PatientStatus)}
                className="w-full rounded-xl border border-slate-200 p-2.5 bg-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ACTIVE">ACTIVE (Operational)</option>
                <option value="INACTIVE">INACTIVE (Temporarily Paused)</option>
                <option value="ARCHIVED">ARCHIVED (Closed Account)</option>
              </select>
            </div>
          </div>

          {/* Physical Address */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Physical Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Kitende – Mwenda Stage, Wakiso"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Emergency Contact Block */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <span className="font-bold text-slate-800 block text-xs">Emergency Contact Details</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Full Name"
                value={emergencyName}
                onChange={e => setEmergencyName(e.target.value)}
                className="rounded-xl border border-slate-200 p-2 bg-white text-xs"
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Spouse)"
                value={emergencyRelation}
                onChange={e => setEmergencyRelation(e.target.value)}
                className="rounded-xl border border-slate-200 p-2 bg-white text-xs"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                className="rounded-xl border border-slate-200 p-2 bg-white text-xs font-mono"
              />
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Reception &amp; Clinical Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Medical alerts, allergies, or notes..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => {
                confirmAction({
                  title: 'Delete Patient Account',
                  message: `Are you sure you want to permanently delete patient ${patient.fullName} (${patient.memberId})?\n\nThis will remove their profile and cards from the database.`,
                  confirmLabel: 'Delete Patient',
                  variant: 'danger',
                  onConfirm: async () => {
                    await deletePatient(patient.id);
                    onClose();
                    showToast(`Patient ${patient.fullName} was deleted.`, 'success');
                  }
                });
              }}
              className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors text-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Patient</span>
            </button>

            <div className="flex items-center gap-2">
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
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 text-xs sm:text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
