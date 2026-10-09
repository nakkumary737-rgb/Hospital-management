import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import {
  UserCheck,
  X,
  Phone,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileText
} from 'lucide-react';

interface DemographicUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export const DemographicUpdateModal: React.FC<DemographicUpdateModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  const { updatePatientDemographics, currentUser, showToast } = useApp();

  const [phone, setPhone] = useState(patient.phone || '');
  const [address, setAddress] = useState(patient.address || '');
  const [nationalId, setNationalId] = useState(patient.nationalId || '');
  const [emergencyName, setEmergencyName] = useState(patient.emergencyContact?.name || '');
  const [emergencyRelation, setEmergencyRelation] = useState(patient.emergencyContact?.relationship || 'Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergencyContact?.phone || '');
  const [nextOfKinName, setNextOfKinName] = useState(patient.nextOfKin?.name || '');
  const [nextOfKinRelation, setNextOfKinRelation] = useState(patient.nextOfKin?.relationship || 'Family');
  const [nextOfKinPhone, setNextOfKinPhone] = useState(patient.nextOfKin?.phone || '');
  const [updateReason, setUpdateReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      showToast('Phone number cannot be empty.', 'error');
      return;
    }
    if (!updateReason.trim()) {
      showToast('Please state a reason for this demographic update (for audit trail).', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePatientDemographics(
        patient.id,
        {
          phone: phone.trim(),
          address: address.trim(),
          nationalId: nationalId.trim() || undefined,
          emergencyContact: {
            name: emergencyName.trim() || 'Next of Kin',
            relationship: emergencyRelation.trim() || 'Next of Kin',
            phone: emergencyPhone.trim() || phone.trim()
          },
          nextOfKin: {
            name: nextOfKinName.trim() || emergencyName.trim() || 'Next of Kin',
            relationship: nextOfKinRelation.trim() || emergencyRelation.trim() || 'Next of Kin',
            phone: nextOfKinPhone.trim() || emergencyPhone.trim() || phone.trim()
          }
        },
        updateReason.trim()
      );

      showToast(`Demographic details for ${patient.fullName} (${patient.memberId}) updated successfully.`, 'success');
      onClose();
    } catch (err: any) {
      showToast('Failed to update patient details: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Update Patient Details</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {patient.memberId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Reception demographic maintenance • Clinical records remain unchanged
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Notice */}
        <div className="p-3 bg-teal-50 border-b border-teal-100 text-xs text-teal-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            Every demographic adjustment is recorded in the permanent audit trail with staff timestamp.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Patient Non-Editable Identity */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient Name</span>
              <strong className="text-slate-900">{patient.fullName}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">DOB &amp; Sex</span>
              <span>{patient.dob} ({patient.sex})</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Contact Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  National ID (NIN)
                </label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  placeholder="e.g. CM88012345ABCD"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-medium focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Residential Address / Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. Kitende – Mwenda Stage, Entebbe Road"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Next of Kin & Emergency Contacts */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Next of Kin &amp; Emergency Contact</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <label className="block text-slate-700 font-semibold mb-1">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={e => setEmergencyRelation(e.target.value)}
                  placeholder="Spouse, Child, Parent"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Reason for Change (Required Audit Trail) */}
          <div className="pt-2">
            <label className="block text-slate-700 font-bold mb-1">
              Reason for Demographic Update <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={updateReason}
              onChange={e => setUpdateReason(e.target.value)}
              placeholder="e.g. Patient changed phone number, relocated residence..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              Staff: <strong className="text-slate-700">{currentUser.displayName}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Update Demographic Record'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
