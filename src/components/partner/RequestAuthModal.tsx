import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, X, CheckCircle2 } from 'lucide-react';

interface RequestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestAuthModal: React.FC<RequestAuthModalProps> = ({ isOpen, onClose }) => {
  const { facilities, patients, packages, cards, currentUser, requestAuthorization, showToast } = useApp();

  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [facilityId, setFacilityId] = useState(facilities[1]?.id || facilities[0]?.id || '');
  const [serviceName, setServiceName] = useState('Outpatient General Consultation');
  const [packageId, setPackageId] = useState(packages[0]?.id || '');
  const [approvedAmount, setApprovedAmount] = useState(20000);
  const [benefitRule, setBenefitRule] = useState('Standard Partner Consultation Fee Schedule');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === patientId);
    const facility = facilities.find(f => f.id === facilityId);
    const card = cards.find(c => c.patientId === patientId && c.status === 'ACTIVE') || cards[0];

    const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const auth = requestAuthorization({
      patientId,
      patientName: patient ? patient.fullName : 'Afya Patient',
      cardId: card ? card.id : 'crd-temp',
      facilityId,
      facilityName: facility ? facility.name : 'Partner Facility',
      serviceName,
      packageId,
      benefitRule,
      approvedAmount,
      expiryDate: expiry,
      requestingStaff: currentUser.displayName
    });

    showToast(`Authorization generated: ${auth.authNumber} (UGX ${auth.approvedAmount.toLocaleString()})`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Request Service Pre-Authorization</h2>
              <p className="text-xs text-slate-400">Afya Care Network Provider Gateway</p>
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
            <label className="block font-semibold text-slate-700 mb-1">Select Patient</label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-blue-500"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.memberId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Partner Facility</label>
            <select
              value={facilityId}
              onChange={e => setFacilityId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-blue-500"
            >
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Requested Healthcare Service</label>
            <input
              type="text"
              value={serviceName}
              onChange={e => setServiceName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Approved Rate (UGX)</label>
              <input
                type="number"
                value={approvedAmount}
                onChange={e => setApprovedAmount(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contract / Benefit Rule</label>
              <input
                type="text"
                value={benefitRule}
                onChange={e => setBenefitRule(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
            <strong>Network Rule:</strong> An authorization number (e.g. AFY-AUTH-000125) will be generated. The partner facility uses this authorization number to verify patient coverage and submit claims.
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Generate Authorization</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
