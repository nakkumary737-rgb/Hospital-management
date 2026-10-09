import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChronicMembership, SickleCellProfile } from '../../types';
import { Stethoscope, Pill, X, CheckCircle2, Heart } from 'lucide-react';

/* 1. Chronic Care Consultation Modal */
export const ChronicConsultationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  chronicMembership: ChronicMembership;
}> = ({ isOpen, onClose, chronicMembership }) => {
  const { currentUser, recordChronicConsultation, showToast } = useApp();
  const [bpOrVitals, setBpOrVitals] = useState('BP: 130/82 mmHg, HR: 72 bpm');
  const [notes, setNotes] = useState('Patient is compliant with medications. No dizziness reported.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordChronicConsultation(
      chronicMembership.id,
      currentUser.displayName.split('(')[0],
      bpOrVitals,
      notes
    );
    showToast('Clinical review recorded successfully.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-sm text-slate-900">Chronic Review / Vitals Log</h3>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Blood Pressure / Vital Signs</label>
            <input
              type="text"
              required
              value={bpOrVitals}
              onChange={e => setBpOrVitals(e.target.value)}
              placeholder="e.g. BP: 130/80 mmHg, FBS: 5.6 mmol/L"
              className="w-full rounded-xl border border-slate-200 p-2.5 font-mono focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Doctor / Clinician Review Notes</label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Clinical Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* 2. Medication Pickup Dispensing Modal */
export const MedicationPickupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  membershipId: string;
  defaultMedications?: string[];
}> = ({ isOpen, onClose, membershipId, defaultMedications = [] }) => {
  const { currentUser, recordMedicationPickup, showToast } = useApp();
  const [items, setItems] = useState(defaultMedications.join(', ') || 'Monthly maintenance medicines dispensed');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordMedicationPickup(membershipId, items, currentUser.displayName.split('(')[0]);
    showToast('Medication pickup recorded.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Dispense Medication Pickup</h3>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Medications Dispensed</label>
            <textarea
              rows={3}
              required
              value={items}
              onChange={e => setItems(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Dispensation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* 3. Sickle Cell Consultation & Crisis Log Modal */
export const SickleCellConsultationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  profile: SickleCellProfile;
}> = ({ isOpen, onClose, profile }) => {
  const { currentUser, recordSickleCellConsultation, showToast } = useApp();
  const [crisisType, setCrisisType] = useState('Routine review / Stable');
  const [vitals, setVitals] = useState('Temp: 36.6°C, BP: 108/68, SpO2: 99% on room air, Hb: 8.2 g/dL');
  const [treatment, setTreatment] = useState('Oral hydration reinforced. Hydroxyurea 500mg daily continued. Folic acid 5mg daily refilled.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordSickleCellConsultation(
      profile.id,
      currentUser.displayName.split('(')[0],
      crisisType,
      vitals,
      treatment
    );
    showToast('Sickle Cell consultation recorded in clinical database.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-sm text-slate-900">Sickle Cell Clinical Consultation</h3>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Encounter / Crisis Classification</label>
            <select
              value={crisisType}
              onChange={e => setCrisisType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-rose-500"
            >
              <option value="Routine review / Stable">Routine review / Stable</option>
              <option value="Vaso-occlusive pain crisis (Bone/Joint)">Vaso-occlusive pain crisis (Bone/Joint)</option>
              <option value="Acute febrile illness / Malaria check">Acute febrile illness / Malaria check</option>
              <option value="Acute anemia / Splenic sequestration evaluation">Acute anemia / Splenic sequestration evaluation</option>
              <option value="Respiratory symptoms / Acute chest syndrome rule-out">Respiratory symptoms / Acute chest syndrome rule-out</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vital Signs &amp; Laboratory Findings</label>
            <input
              type="text"
              required
              value={vitals}
              onChange={e => setVitals(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-mono focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Treatment Administered / Care Plan</label>
            <textarea
              rows={3}
              required
              value={treatment}
              onChange={e => setTreatment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Clinical Encounter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
