import React from 'react';
import { Patient, Visit } from '../../types';
import { AlertTriangle, Users, CheckCircle2, X, ArrowRight, ShieldCheck, Phone, Calendar } from 'lucide-react';

interface DuplicatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

export const DuplicatePatientModal: React.FC<DuplicatePatientModalProps> = ({
  isOpen,
  onClose,
  candidates,
  onSelectPatient
}) => {
  if (!isOpen || candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Warning */}
        <div className="p-5 sm:p-6 bg-amber-500 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                Possible Duplicate Patient Detected
              </h2>
              <p className="text-xs text-slate-900 font-medium">
                The search query matches {candidates.length} existing patient records in the master registry.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Advisory */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2 font-medium">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Do not create a new patient!</strong> Select the matching Master Record below to continue to today's visit under the same Patient ID.
          </span>
        </div>

        {/* Candidate Cards */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {candidates.map(candidate => (
            <div
              key={candidate.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{candidate.fullName}</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200">
                    {candidate.memberId}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[11px]">
                  <span>DOB: <strong className="text-slate-700">{candidate.dob} ({candidate.sex})</strong></span>
                  <span>Phone: <strong className="text-slate-800 font-mono">{candidate.phone}</strong></span>
                  <span>Registered: {candidate.registrationDate}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Address: {candidate.address}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectPatient(candidate);
                  onClose();
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
              >
                <span>Select Patient</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
          >
            Cancel Search
          </button>
        </div>
      </div>
    </div>
  );
};
