import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Payment, Receipt } from '../../types';
import {
  Receipt as ReceiptIcon,
  Search,
  Printer,
  PlusCircle,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Trash2
} from 'lucide-react';
import { ReceiptModal } from '../receipts/ReceiptModal';
import { RecordPaymentModal } from '../payments/RecordPaymentModal';

export const PaymentsView: React.FC = () => {
  const { payments, receipts, patients, deletePayment, confirmAction, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.itemDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = filterMethod === 'ALL' || p.paymentMethod === filterMethod;

    return matchesSearch && matchesMethod;
  });

  const totalAmount = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  const handleDeletePayment = async (payment: Payment) => {
    confirmAction({
      title: 'Delete Payment Transaction',
      message: `Are you sure you want to permanently delete payment #${payment.receiptNumber} (UGX ${payment.amount.toLocaleString()}) for ${payment.patientName}?\n\nThis will remove the transaction record and its official receipt from the financial ledger.`,
      confirmLabel: 'Delete Payment',
      variant: 'danger',
      onConfirm: async () => {
        await deletePayment(payment.id);
        showToast(`Payment #${payment.receiptNumber} was removed.`, 'info');
      }
    });
  };

  const handleOpenReceipt = (payment: Payment) => {
    const rcp = receipts.find(r => r.paymentId === payment.id || r.receiptNumber === payment.receiptNumber);
    if (rcp) {
      setSelectedReceipt(rcp);
    } else {
      // Create on the fly if needed
      setSelectedReceipt({
        id: `rcp-${payment.id}`,
        receiptNumber: payment.receiptNumber,
        paymentId: payment.id,
        patientId: payment.patientId,
        patientName: payment.patientName,
        memberId: 'AFY-MEMBER',
        amount: payment.amount,
        currency: 'UGX',
        paymentMethod: payment.paymentMethod,
        description: payment.itemDescription,
        packageOrProgram: payment.itemDescription,
        staffName: payment.staffName,
        facilityName: 'Afya Medicare – Central Clinic',
        facilityLocation: 'Kitende – Mwenda Stage, Uganda',
        createdAt: payment.createdAt
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Healthcare Payment Ledger</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Healthcare membership &amp; package payments ledger. Not an e-money issuer.
          </p>
        </div>

        <button
          onClick={() => setShowRecordModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Healthcare Payment</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Volume (UGX)</span>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            UGX {totalAmount.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{filteredPayments.length} Transactions</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Mobile Money Transactions</span>
          <p className="text-2xl font-black text-emerald-800 font-mono mt-1">
            {payments.filter(p => p.paymentMethod === 'Mobile Money').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">MTN &amp; Airtel Uganda</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Direct Cash &amp; Bank</span>
          <p className="text-2xl font-black text-slate-800 font-mono mt-1">
            {payments.filter(p => p.paymentMethod === 'Cash' || p.paymentMethod === 'Bank').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Counter receipts &amp; EFT</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search patient, receipt number (AFY-RCP-...), transaction ref..."
            className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <select
          value={filterMethod}
          onChange={e => setFilterMethod(e.target.value)}
          className="text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-medium text-slate-700"
        >
          <option value="ALL">All Payment Methods</option>
          <option value="Mobile Money">Mobile Money (MTN / Airtel)</option>
          <option value="Cash">Cash at Counter</option>
          <option value="Bank">Bank Transfer</option>
          <option value="Card/POS">Credit / Debit Card</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3.5 px-4">Receipt Number</th>
                <th className="py-3.5 px-4">Patient / Member</th>
                <th className="py-3.5 px-4">Item Description</th>
                <th className="py-3.5 px-4">Amount (UGX)</th>
                <th className="py-3.5 px-4">Method &amp; Ref</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                    {payment.receiptNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900">{payment.patientName}</strong>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {payment.patientId}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs truncate">
                    {payment.itemDescription}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-xs">
                    UGX {payment.amount.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{payment.paymentMethod}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{payment.referenceNumber}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      {payment.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenReceipt(payment)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Payment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={true}
          onClose={() => setSelectedReceipt(null)}
          receipt={selectedReceipt}
        />
      )}

      {showRecordModal && (
        <RecordPaymentModal
          isOpen={true}
          onClose={() => setShowRecordModal(false)}
          patient={patients[0]}
        />
      )}
    </div>
  );
};
