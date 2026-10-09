import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Search, Shield, Clock, User, ArrowRight } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, clearAllPatientData, confirmAction, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const q = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      (log.notes && log.notes.toLowerCase().includes(q)) ||
      (log.newValue && log.newValue.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Security &amp; Audit Trail</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Immutable log of all card replacements, visit deductions, reversals, and financial transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>{auditLogs.length} Audited Events</span>
          </div>

          <button
            onClick={() => {
              confirmAction({
                title: 'Clear Transactional Data',
                message: 'Clear all patient registrations, card credentials, encounters, and payment records?\n\nCore facilities and package templates will remain intact.',
                confirmLabel: 'Clear Patient Data',
                variant: 'danger',
                onConfirm: async () => {
                  await clearAllPatientData();
                  showToast('Database cleared successfully. Ready for clean patient entries.', 'info');
                }
              });
            }}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
          >
            Clear Patient Data
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by user, action (VISIT_DEDUCTED, BLOCK_CARD...), entity..."
            className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Details / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString('en-GB')}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {log.entityType} ({log.entityId})
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    {log.userName}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {log.notes && <div>{log.notes}</div>}
                    {log.oldValue && log.newValue && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="line-through">{log.oldValue}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-emerald-700 font-semibold">{log.newValue}</span>
                      </div>
                    )}
                    {!log.oldValue && log.newValue && !log.notes && (
                      <div className="text-[11px] text-slate-600">{log.newValue}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
