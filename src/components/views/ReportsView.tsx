import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Users,
  Receipt,
  CalendarCheck,
  ClipboardList,
  Activity,
  HeartPulse,
  Network
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    patients,
    memberships,
    payments,
    visits,
    chronicMemberships,
    sickleCellProfiles,
    claims,
    packages,
    facilities
  } = useApp();

  const [activeReport, setActiveReport] = useState<'hmis' | 'visits' | 'financial' | 'memberships' | 'chronic' | 'sickle' | 'partners'>('hmis');

  const exportCsv = (filename: string, rows: string[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    switch (activeReport) {
      case 'hmis':
        exportCsv('Afya_HMIS_031_Outpatient_Attendance_Report', [
          ['HMIS Line', 'Date', 'Time', 'Queue No', 'Patient Name', 'Member ID', 'Sex', 'Address', 'Attendance Type', 'Department', 'Complaint', 'Triage Vitals', 'Facility'],
          ...visits.filter(v => v.status !== 'REVERSED').map((v, i) => {
            const pat = patients.find(p => p.id === v.patientId);
            const isReattend = (v.visitNumber && v.visitNumber > 1);
            return [
              `HMIS-${String(i + 1).padStart(3, '0')}`,
              v.createdAt.split('T')[0],
              new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              v.queueNumber || '—',
              v.patientName,
              pat?.memberId || v.patientId,
              pat?.sex || '—',
              pat?.address || '—',
              isReattend ? 'Re-attendance (Returning)' : 'New Attendance',
              v.department,
              v.reasonForVisit || v.serviceName,
              v.triageVitals || '—',
              v.facilityName
            ];
          })
        ]);
        break;
      case 'memberships':
        exportCsv('Afya_Memberships_Report', [
          ['Membership ID', 'Patient ID', 'Package Name', 'Start Date', 'Expiry Date', 'Purchased Visits', 'Used Visits', 'Remaining Visits', 'Status'],
          ...memberships.map(m => [m.id, m.patientId, m.packageName, m.startDate, m.expiryDate, String(m.visitsPurchased), String(m.visitsUsed), String(m.visitsRemaining), m.status])
        ]);
        break;
      case 'financial':
        exportCsv('Afya_Financial_Payments_Report', [
          ['Receipt Number', 'Patient Name', 'Description', 'Amount (UGX)', 'Method', 'Reference', 'Staff', 'Date'],
          ...payments.map(p => [p.receiptNumber, p.patientName, p.itemDescription, String(p.amount), p.paymentMethod, p.referenceNumber, p.staffName, p.createdAt])
        ]);
        break;
      case 'visits':
        exportCsv('Afya_Clinical_Visits_Report', [
          ['Visit ID', 'Patient Name', 'Facility', 'Service', 'Provider', 'Coverage Status', 'Deducted', 'Date'],
          ...visits.map(v => [v.id, v.patientName, v.facilityName, v.serviceName, v.providerName, v.coverageStatus, String(v.visitDeducted), v.createdAt])
        ]);
        break;
      case 'chronic':
        exportCsv('Afya_Chronic_Care_Report', [
          ['ID', 'Patient ID', 'Program', 'Condition', 'Paid Month', 'Status', 'Renewal Date'],
          ...chronicMemberships.map(c => [c.id, c.patientId, c.programName, c.condition, c.currentPaidMonth, c.status, c.renewalDate])
        ]);
        break;
      case 'sickle':
        exportCsv('Afya_Sickle_Cell_Report', [
          ['Profile ID', 'Patient ID', 'Genotype', 'Blood Group', 'Allergies', 'Next Review'],
          ...sickleCellProfiles.map(s => [s.id, s.patientId, s.genotype, s.bloodGroup, s.allergies.join('; '), s.nextReviewDate])
        ]);
        break;
      case 'partners':
        exportCsv('Afya_Partner_Claims_Report', [
          ['Claim ID', 'Facility', 'Patient', 'Service', 'Claimed UGX', 'Approved UGX', 'Status'],
          ...claims.map(c => [c.claimNumber, c.facilityName, c.patientName, c.serviceName, String(c.amountClaimed), String(c.amountApproved), c.status])
        ]);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Management Reports &amp; Exports</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time analytics and CSV export for membership, financial ledger, visits, and partner settlements
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export {activeReport.toUpperCase()} (CSV)</span>
        </button>
      </div>

      {/* Report Categories Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        <button
          onClick={() => setActiveReport('hmis')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeReport === 'hmis'
              ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-2xs font-bold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <ClipboardList className="w-4 h-4 mb-1 text-teal-600" />
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">Reception</span>
          </div>
          <div className="text-xs">HMIS 031 Register</div>
          <div className="text-[10px] text-slate-400 font-normal">{visits.length} encounters</div>
        </button>

        <button
          onClick={() => setActiveReport('visits')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeReport === 'visits'
              ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-2xs font-bold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <CalendarCheck className="w-4 h-4 mb-1 text-amber-600" />
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">Cashier</span>
          </div>
          <div className="text-xs">Visits &amp; Billing</div>
          <div className="text-[10px] text-slate-400 font-normal">{visits.length} logs</div>
        </button>

        <button
          onClick={() => setActiveReport('financial')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeReport === 'financial'
              ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-2xs font-bold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <Receipt className="w-4 h-4 mb-1 text-emerald-600" />
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">Cashier</span>
          </div>
          <div className="text-xs">Financial Ledger</div>
          <div className="text-[10px] text-slate-400 font-normal">{payments.length} receipts</div>
        </button>

        <button
          onClick={() => setActiveReport('memberships')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeReport === 'memberships'
              ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-2xs font-bold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 mb-1 text-emerald-600" />
          <div className="text-xs">Memberships</div>
          <div className="text-[10px] text-slate-400 font-normal">{memberships.length} active</div>
        </button>

        <button
          onClick={() => setActiveReport('chronic')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeReport === 'chronic'
              ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-2xs font-bold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4 mb-1 text-teal-600" />
          <div className="text-xs">Chronic Programs</div>
          <div className="text-[10px] text-slate-400 font-normal">{chronicMemberships.length} enrolled</div>
        </button>

        <button
          onClick={() => setActiveReport('sickle')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeReport === 'sickle'
              ? 'bg-rose-50 border-rose-600 text-rose-950 shadow-2xs font-bold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <HeartPulse className="w-4 h-4 mb-1 text-rose-600" />
          <div className="text-xs">Sickle Cell Care</div>
          <div className="text-[10px] text-slate-400 font-normal">{sickleCellProfiles.length} registered</div>
        </button>

        <button
          onClick={() => setActiveReport('partners')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeReport === 'partners'
              ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-2xs font-bold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Network className="w-4 h-4 mb-1 text-blue-600" />
          <div className="text-xs">Partner Claims</div>
          <div className="text-[10px] text-slate-400 font-normal">{claims.length} claims</div>
        </button>
      </div>

      {/* Report Data Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 capitalize">{activeReport} Data Preview</h3>
          <span className="text-xs text-slate-500">Kitende – Mwenda Stage Operational Center</span>
        </div>

        {/* HMIS 031 REGISTER REPORT TABLE (RECEPTIONIST DESK) */}
        {activeReport === 'hmis' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">HMIS Serial</th>
                  <th className="p-3">Date &amp; Time</th>
                  <th className="p-3">Queue No.</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Member ID</th>
                  <th className="p-3">Attendance Type</th>
                  <th className="p-3">Clinic / Dept</th>
                  <th className="p-3">Chief Complaint</th>
                  <th className="p-3">Triage Vitals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.filter(v => v.status !== 'REVERSED').map((v, i) => {
                  const pat = patients.find(p => p.id === v.patientId);
                  const isReattend = (v.visitNumber && v.visitNumber > 1);
                  return (
                    <tr key={v.id}>
                      <td className="p-3 font-mono font-bold text-slate-700">HMIS-{String(i + 1).padStart(3, '0')}</td>
                      <td className="p-3">{v.createdAt.split('T')[0]}</td>
                      <td className="p-3 font-mono font-bold text-teal-700">{v.queueNumber || '—'}</td>
                      <td className="p-3 font-semibold text-slate-900">{v.patientName}</td>
                      <td className="p-3 font-mono text-slate-600">{pat?.memberId || v.patientId}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isReattend ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isReattend ? 'Re-attendance' : 'New Attendance'}
                        </span>
                      </td>
                      <td className="p-3">{v.department}</td>
                      <td className="p-3">{v.reasonForVisit || v.serviceName}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">{v.triageVitals || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* MEMBERSHIPS REPORT TABLE */}
        {activeReport === 'memberships' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Package Name</th>
                  <th className="p-3">Patient ID</th>
                  <th className="p-3">Purchased</th>
                  <th className="p-3">Used</th>
                  <th className="p-3">Remaining</th>
                  <th className="p-3">Validity Thru</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberships.map(m => (
                  <tr key={m.id}>
                    <td className="p-3 font-semibold text-slate-900">{m.packageName}</td>
                    <td className="p-3 font-mono text-slate-600">{m.patientId}</td>
                    <td className="p-3">{m.visitsPurchased}</td>
                    <td className="p-3">{m.visitsUsed}</td>
                    <td className="p-3 font-bold text-emerald-800 font-mono text-sm">{m.visitsRemaining}</td>
                    <td className="p-3">{m.expiryDate.split('T')[0]}</td>
                    <td className="p-3 font-bold text-emerald-700">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FINANCIAL REPORT TABLE */}
        {activeReport === 'financial' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Receipt Number</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Amount (UGX)</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="p-3 font-mono font-bold text-slate-900">{p.receiptNumber}</td>
                    <td className="p-3">{p.patientName}</td>
                    <td className="p-3 text-slate-600">{p.itemDescription}</td>
                    <td className="p-3 font-mono font-bold text-emerald-800">UGX {p.amount.toLocaleString()}</td>
                    <td className="p-3">{p.paymentMethod}</td>
                    <td className="p-3 font-mono text-slate-500">{p.referenceNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VISITS REPORT TABLE */}
        {activeReport === 'visits' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Date</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Facility</th>
                  <th className="p-3">Coverage Status</th>
                  <th className="p-3">Deduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map(v => (
                  <tr key={v.id}>
                    <td className="p-3 font-mono">{new Date(v.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 font-semibold">{v.patientName}</td>
                    <td className="p-3">{v.serviceName}</td>
                    <td className="p-3">{v.facilityName}</td>
                    <td className="p-3 font-bold text-emerald-700">{v.coverageStatus}</td>
                    <td className="p-3">{v.visitDeducted ? '-1 Visit' : 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CHRONIC REPORT TABLE */}
        {activeReport === 'chronic' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Condition</th>
                  <th className="p-3">Patient ID</th>
                  <th className="p-3">Current Paid Month</th>
                  <th className="p-3">Renewal Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chronicMemberships.map(c => (
                  <tr key={c.id}>
                    <td className="p-3 font-bold text-slate-900">{c.condition}</td>
                    <td className="p-3 font-mono">{c.patientId}</td>
                    <td className="p-3 font-semibold text-teal-800">{c.currentPaidMonth}</td>
                    <td className="p-3">{c.renewalDate}</td>
                    <td className="p-3 font-bold text-emerald-700">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SICKLE CELL REPORT TABLE */}
        {activeReport === 'sickle' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Patient ID</th>
                  <th className="p-3">Genotype</th>
                  <th className="p-3">Blood Group</th>
                  <th className="p-3">Allergies</th>
                  <th className="p-3">Next Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sickleCellProfiles.map(s => (
                  <tr key={s.id}>
                    <td className="p-3 font-mono font-bold text-rose-900">{s.patientId}</td>
                    <td className="p-3 font-black text-rose-800">{s.genotype}</td>
                    <td className="p-3 font-bold">{s.bloodGroup}</td>
                    <td className="p-3 text-slate-600">{s.allergies.join(', ')}</td>
                    <td className="p-3 font-mono">{s.nextReviewDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PARTNER CLAIMS REPORT TABLE */}
        {activeReport === 'partners' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Claim Number</th>
                  <th className="p-3">Partner Facility</th>
                  <th className="p-3">Patient &amp; Service</th>
                  <th className="p-3">Amount Claimed</th>
                  <th className="p-3">Amount Approved</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map(c => (
                  <tr key={c.id}>
                    <td className="p-3 font-mono font-bold text-slate-900">{c.claimNumber}</td>
                    <td className="p-3 font-medium text-slate-800">{c.facilityName}</td>
                    <td className="p-3">{c.patientName} — {c.serviceName}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">UGX {c.amountClaimed.toLocaleString()}</td>
                    <td className="p-3 font-mono font-bold text-emerald-800">UGX {c.amountApproved.toLocaleString()}</td>
                    <td className="p-3 font-bold text-emerald-700">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
