import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, X, CheckCircle2 } from 'lucide-react';

interface SubmitClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitClaimModal: React.FC<SubmitClaimModalProps> = ({ isOpen, onClose }) => {
  const { authorizations, facilities, currentUser, submitClaim, showToast } = useApp();

  const [authorizationId, setAuthorizationId] = useState(authorizations[0]?.id || '');
  const [providerName, setProviderName] = useState(currentUser.displayName.split('(')[0]);
  const [amountClaimed, setAmountClaimed] = useState<number>(20000);
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const selectedAuth = authorizations.find(a => a.id === authorizationId) || authorizations[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuth) return;

    const claim = submitClaim({
      authorizationId: selectedAuth.id,
      patientId: selectedAuth.patientId,
      patientName: selectedAuth.patientName,
      facilityId: selectedAuth.facilityId,
      facilityName: selectedAuth.facilityName,
      serviceName: selectedAuth.serviceName,
      providerName,
      amountClaimed,
      amountApproved: amountClaimed, // Pending adjudication
      serviceDate,
      submissionDate: new Date().toISOString().split('T')[0],
      adjudicationNotes: notes.trim()
    });

    showToast(`Claim submitted: ${claim.claimNumber} (UGX ${claim.amountClaimed.toLocaleString()})`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Submit Partner Reimbursement Claim</h2>
              <p className="text-xs text-slate-400">Post-service claim submission for provider settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pre-Authorization Reference</label>
            <select
              value={authorizationId}
              onChange={e => {
                setAuthorizationId(e.target.value);
                const auth = authorizations.find(a => a.id === e.target.value);
                if (auth) setAmountClaimed(auth.approvedAmount);
              }}
              className="w-full rounded-xl border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
            >
              {authorizations.map(a => (
                <option key={a.id} value={a.id}>
                  {a.authNumber} — {a.patientName} ({a.serviceName})
                </option>
              ))}
            </select>
          </div>

          {selectedAuth && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <strong className="text-slate-900">{selectedAuth.patientName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized Facility:</span>
                <span className="text-slate-700">{selectedAuth.facilityName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="text-slate-700">{selectedAuth.serviceName}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount Claimed (UGX)</label>
              <input
                type="number"
                value={amountClaimed}
                onChange={e => setAmountClaimed(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Service</label>
              <input
                type="date"
                value={serviceDate}
                onChange={e => setServiceDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Attending Provider Name</label>
            <input
              type="text"
              value={providerName}
              onChange={e => setProviderName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinical / Supporting Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Completed routine outpatient consultation and dispensed prescribed formulary medicines."
              className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Reimbursement Claim</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
