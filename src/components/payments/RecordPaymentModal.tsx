import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, Membership, ChronicMembership, PaymentMethod, Receipt } from '../../types';
import { ReceiptModal } from '../receipts/ReceiptModal';
import { Receipt as ReceiptIcon, X, DollarSign, CheckCircle2 } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  membership?: Membership;
  chronicMembership?: ChronicMembership;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  patient: initialPatient,
  membership: initialMembership,
  chronicMembership: initialChronicMembership
}) => {
  const { packages, chronicPrograms, recordPayment, patients, memberships, chronicMemberships } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatient?.id || patients[0]?.id || ''
  );
  const activePatient = patients.find(p => p.id === selectedPatientId) || initialPatient || patients[0];
  const activeMembership = initialMembership && initialMembership.patientId === activePatient?.id
    ? initialMembership
    : memberships.find(m => m.patientId === activePatient?.id && m.status === 'ACTIVE');
  const activeChronicMembership = initialChronicMembership && initialChronicMembership.patientId === activePatient?.id
    ? initialChronicMembership
    : chronicMemberships.find(c => c.patientId === activePatient?.id && c.status === 'ACTIVE');

  const [paymentType, setPaymentType] = useState<'package' | 'chronic' | 'service'>(
    activeChronicMembership ? 'chronic' : 'package'
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    activeMembership?.packageId || (packages[0]?.id ?? '')
  );
  const [selectedChronicProgramId, setSelectedChronicProgramId] = useState<string>(
    activeChronicMembership?.programId || (chronicPrograms[0]?.id ?? '')
  );
  const [customDescription, setCustomDescription] = useState('Outpatient Consultation & Laboratory');
  const [amount, setAmount] = useState<number>(() => {
    if (activeChronicMembership) {
      const prog = chronicPrograms.find(p => p.id === activeChronicMembership.programId);
      return prog ? prog.monthlyFee : 45000;
    }
    const pkg = packages[0];
    return pkg ? pkg.price : 150000;
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Mobile Money');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [generatedReceipt, setGeneratedReceipt] = useState<Receipt | null>(null);

  if (!isOpen || !activePatient) return null;

  const handlePackageChange = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = packages.find(p => p.id === pkgId);
    if (pkg) setAmount(pkg.price);
  };

  const handleChronicProgramChange = (progId: string) => {
    setSelectedChronicProgramId(progId);
    const prog = chronicPrograms.find(p => p.id === progId);
    if (prog) setAmount(prog.monthlyFee);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let description = customDescription;
    let memId: string | undefined = activeMembership?.id;
    let chrId: string | undefined = activeChronicMembership?.id;

    if (paymentType === 'package') {
      const pkg = packages.find(p => p.id === selectedPackageId);
      description = `${pkg?.name || 'Healthcare Package'} Purchase (${pkg?.visitsPurchased || 0} Covered Visits)`;
    } else if (paymentType === 'chronic') {
      const prog = chronicPrograms.find(p => p.id === selectedChronicProgramId);
      description = `${prog?.name || 'Chronic Care Program'} Monthly Renewal`;
    }

    const ref = referenceNumber.trim() || `${paymentMethod.toUpperCase()}-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const { receipt } = recordPayment({
      patientId: activePatient.id,
      membershipId: memId,
      chronicMembershipId: chrId,
      itemDescription: description,
      amount,
      paymentMethod,
      referenceNumber: ref
    });

    setGeneratedReceipt(receipt);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ReceiptIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Record Healthcare Payment</h2>
                <p className="text-xs text-slate-400">Healthcare membership &amp; package payment ledger</p>
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
            {/* Patient Header / Select */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <label className="block text-slate-500 text-[10px] uppercase font-bold">Patient Member</label>
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.memberId}) — {p.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transaction Category</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('package');
                    const pkg = packages[0];
                    if (pkg) setAmount(pkg.price);
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    paymentType === 'package'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Health Package
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('chronic');
                    const prog = chronicPrograms[0];
                    if (prog) setAmount(prog.monthlyFee);
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    paymentType === 'chronic'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Chronic Care
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('service');
                    setAmount(50000);
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    paymentType === 'service'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Direct Service
                </button>
              </div>
            </div>

            {paymentType === 'package' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Healthcare Package</label>
                <select
                  value={selectedPackageId}
                  onChange={e => handlePackageChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — UGX {pkg.price.toLocaleString()} ({pkg.visitsPurchased} visits)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {paymentType === 'chronic' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Chronic Care Program</label>
                <select
                  value={selectedChronicProgramId}
                  onChange={e => handleChronicProgramChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {chronicPrograms.map(prog => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name} — UGX {prog.monthlyFee.toLocaleString()} / month
                    </option>
                  ))}
                </select>
              </div>
            )}

            {paymentType === 'service' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Description</label>
                <input
                  type="text"
                  value={customDescription}
                  onChange={e => setCustomDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount (UGX)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                required
                className="w-full text-sm font-mono font-bold rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Mobile Money">Mobile Money (MTN / Airtel)</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="Bank">Bank Transfer / EFT</option>
                  <option value="Card/POS">Credit / Debit POS Card</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">External Transaction Reference</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  placeholder="e.g. MTN-MM-99120"
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
              <strong>Healthcare Membership Ledger:</strong> Payment is recorded directly against patient membership records. Afya Medicare operates as a healthcare provider and does not issue independent electronic money.
            </div>

            {/* Actions */}
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
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Issue Receipt</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {generatedReceipt && (
        <ReceiptModal
          isOpen={true}
          onClose={() => {
            setGeneratedReceipt(null);
            onClose();
          }}
          receipt={generatedReceipt}
        />
      )}
    </>
  );
};
