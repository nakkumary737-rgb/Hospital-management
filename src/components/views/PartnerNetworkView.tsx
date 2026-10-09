import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Facility, ServiceAuthorization, ProviderClaim, FacilitySettlement, FacilityType, FacilityStatus } from '../../types';
import {
  Network,
  Building2,
  ShieldCheck,
  FileText,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Trash2,
  Plus,
  X,
  Phone,
  Mail,
  MapPin,
  Ban,
  RotateCcw
} from 'lucide-react';
import { RequestAuthModal } from '../partner/RequestAuthModal';
import { SubmitClaimModal } from '../partner/SubmitClaimModal';

export const PartnerNetworkView: React.FC = () => {
  const {
    facilities,
    authorizations,
    claims,
    settlements,
    adjudicateAuthorization,
    adjudicateClaim,
    createSettlementBatch,
    markSettlementPaid,
    deleteAuthorization,
    deleteClaim,
    deleteSettlement,
    addFacility,
    updateFacility,
    deleteFacility,
    currentUser,
    confirmAction,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'facilities' | 'authorizations' | 'claims' | 'settlements'>('facilities');

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);

  // New Facility Form State
  const [newFacName, setNewFacName] = useState('');
  const [newFacLocation, setNewFacLocation] = useState('Entebbe Road, Wakiso');
  const [newFacType, setNewFacType] = useState<FacilityType>('partner_clinic');
  const [newFacPhone, setNewFacPhone] = useState('+256 701 000 000');
  const [newFacEmail, setNewFacEmail] = useState('contact@partnerclinic.ug');
  const [newFacConsultRate, setNewFacConsultRate] = useState(20000);
  const [newFacLabReimb, setNewFacLabReimb] = useState(80);
  const [newFacPharmMarkup, setNewFacPharmMarkup] = useState(15);
  const [newFacNotes, setNewFacNotes] = useState('Quarterly reimbursement per agreed tariff');
  const [newFacAllowedServices, setNewFacAllowedServices] = useState<string[]>([
    'Outpatient Consultation',
    'Laboratory Tests',
    'Routine Pharmacy'
  ]);

  // Settlement creation
  const [selectedFacilityForSettlement, setSelectedFacilityForSettlement] = useState(facilities[1]?.id || facilities[0]?.id || '');
  const [settlementPeriod, setSettlementPeriod] = useState('October 2026');

  const handleRegisterFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacName.trim()) {
      showToast('Please enter a facility name.', 'error');
      return;
    }
    const created = addFacility({
      name: newFacName.trim(),
      location: newFacLocation.trim(),
      type: newFacType,
      contactPhone: newFacPhone.trim(),
      contactEmail: newFacEmail.trim(),
      status: 'ACTIVE',
      contractStatus: 'Active Partner Provider Agreement',
      allowedServices: newFacAllowedServices,
      settlementRule: {
        consultationRateUGX: Number(newFacConsultRate) || 20000,
        labReimbursementPercent: Number(newFacLabReimb) || 80,
        pharmacyMarkupPercent: Number(newFacPharmMarkup) || 15,
        notes: newFacNotes
      }
    });
    setShowAddFacilityModal(false);
    setNewFacName('');
    showToast(`Partner facility "${created.name}" registered successfully!`, 'success');
  };

  const handleToggleFacilityStatus = async (facility: Facility) => {
    const nextStatus: FacilityStatus = facility.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateFacility({
      ...facility,
      status: nextStatus
    });
    showToast(`Facility ${facility.name} status updated to ${nextStatus}.`, 'info');
  };

  const handleDeletePartnerFacility = async (facility: Facility) => {
    if (facility.type === 'afya_medicare') {
      showToast('Central Afya Medicare clinic is the core hub and cannot be removed.', 'warning');
      return;
    }
    confirmAction({
      title: 'Remove Partner Facility',
      message: `Are you sure you want to permanently remove partner facility "${facility.name}"? Past claims and authorizations will be preserved.`,
      confirmLabel: 'Remove Facility',
      variant: 'danger',
      onConfirm: async () => {
        await deleteFacility(facility.id);
        showToast(`Partner facility "${facility.name}" removed from network.`, 'info');
      }
    });
  };

  const handleDeleteAuth = (auth: ServiceAuthorization) => {
    confirmAction({
      title: 'Delete Service Pre-Authorization',
      message: `Permanently delete pre-authorization #${auth.authNumber} for ${auth.patientName}?`,
      confirmLabel: 'Delete Authorization',
      variant: 'danger',
      onConfirm: () => {
        deleteAuthorization(auth.id);
        showToast(`Authorization #${auth.authNumber} was removed.`, 'info');
      }
    });
  };

  const handleDeleteClaim = (claim: ProviderClaim) => {
    confirmAction({
      title: 'Delete Provider Claim',
      message: `Permanently delete claim #${claim.claimNumber} (${claim.facilityName}) for ${claim.patientName}?`,
      confirmLabel: 'Delete Claim',
      variant: 'danger',
      onConfirm: () => {
        deleteClaim(claim.id);
        showToast(`Claim #${claim.claimNumber} was removed.`, 'info');
      }
    });
  };

  const handleDeleteSettlement = (stl: FacilitySettlement) => {
    confirmAction({
      title: 'Delete Settlement Statement',
      message: `Permanently delete settlement batch #${stl.settlementNumber} for ${stl.facilityName}?`,
      confirmLabel: 'Delete Settlement',
      variant: 'danger',
      onConfirm: () => {
        deleteSettlement(stl.id);
        showToast(`Settlement statement #${stl.settlementNumber} was removed.`, 'info');
      }
    });
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const stl = createSettlementBatch(selectedFacilityForSettlement, settlementPeriod);
    showToast(`Settlement Batch ${stl.settlementNumber} created for UGX ${stl.amountPayable.toLocaleString()} (${stl.claimsCount} claims).`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Partner Healthcare Network</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Approved partner clinics, diagnostic laboratories, hospitals, pre-authorizations &amp; claims adjudication
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddFacilityModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Add Partner Facility</span>
          </button>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Request Pre-Authorization</span>
          </button>
          <button
            onClick={() => setShowClaimModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Submit Claim</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 bg-white px-4 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveTab('facilities')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'facilities'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Network Facilities ({facilities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('authorizations')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'authorizations'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Service Authorizations ({authorizations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'claims'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reimbursement Claims ({claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'settlements'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Settlement Batches ({settlements.length})</span>
        </button>
      </div>

      {/* TAB 1: NETWORK FACILITIES */}
      {activeTab === 'facilities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilities.map(facility => (
            <div key={facility.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{facility.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {facility.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{facility.location}</p>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 capitalize px-2 py-0.5 bg-slate-100 rounded-md">
                  {facility.type.replace('_', ' ')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-700 block text-[11px]">Contracted Settlement Terms:</span>
                <p className="text-slate-600">{facility.settlementRule.notes}</p>
                <div className="flex items-center gap-4 text-slate-500 pt-1 text-[11px]">
                  <span>Rate: <strong>UGX {facility.settlementRule.consultationRateUGX.toLocaleString()}</strong></span>
                  <span>Lab: <strong>{facility.settlementRule.labReimbursementPercent}%</strong></span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block text-xs mb-1.5">Approved Services:</span>
                <div className="flex flex-wrap gap-1.5">
                  {facility.allowedServices.map((srv, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Facility Operational Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                    }}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg font-bold text-[11px] border border-blue-200 transition-colors flex items-center gap-1"
                    title="Generate Pre-Authorization for this facility"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Pre-Auth</span>
                  </button>

                  {facility.type !== 'afya_medicare' && (
                    <button
                      onClick={() => handleToggleFacilityStatus(facility)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 ${
                        facility.status === 'ACTIVE'
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                      title={facility.status === 'ACTIVE' ? 'Suspend facility participation' : 'Reactivate facility'}
                    >
                      {facility.status === 'ACTIVE' ? (
                        <>
                          <Ban className="w-3 h-3 text-amber-600" />
                          <span>Suspend</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3 h-3 text-emerald-600" />
                          <span>Reactivate</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {facility.type !== 'afya_medicare' && (
                  <button
                    onClick={() => handleDeletePartnerFacility(facility)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Partner Facility"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PRE-AUTHORIZATIONS */}
      {activeTab === 'authorizations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Auth Number</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Partner Facility</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Approved Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Adjudication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {authorizations.map(auth => (
                  <tr key={auth.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{auth.authNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{auth.patientName}</td>
                    <td className="py-3.5 px-4 text-slate-700">{auth.facilityName}</td>
                    <td className="py-3.5 px-4 text-slate-700">{auth.serviceName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      UGX {auth.approvedAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {auth.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {auth.status === 'REQUESTED' ? (
                          <>
                            <button
                              onClick={() => adjudicateAuthorization(auth.id, 'APPROVED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => adjudicateAuthorization(auth.id, 'DENIED')}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px]"
                            >
                              Deny
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400">Processed</span>
                        )}
                        <button
                          onClick={() => handleDeleteAuth(auth)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Authorization"
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
      )}

      {/* TAB 3: CLAIMS */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Claim ID</th>
                  <th className="py-3 px-4">Facility</th>
                  <th className="py-3 px-4">Patient &amp; Service</th>
                  <th className="py-3 px-4">Claimed</th>
                  <th className="py-3 px-4">Approved</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Adjudicate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map(claim => (
                  <tr key={claim.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{claim.claimNumber}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">{claim.facilityName}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{claim.patientName}</div>
                      <div className="text-[11px] text-slate-500">{claim.serviceName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      UGX {claim.amountClaimed.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      UGX {claim.amountApproved.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {claim.status === 'SUBMITTED' ? (
                          <>
                            <button
                              onClick={() => adjudicateClaim(claim.id, 'APPROVED', claim.amountClaimed, 'Adjudicated per agreement')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => adjudicateClaim(claim.id, 'REJECTED', 0, 'Does not meet pre-authorization criteria')}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400">Adjudicated</span>
                        )}
                        <button
                          onClick={() => handleDeleteClaim(claim)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Claim"
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
      )}

      {/* TAB 4: SETTLEMENTS */}
      {activeTab === 'settlements' && (
        <div className="space-y-6">
          {/* Create Settlement Generator */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Create Periodic Settlement Statement</h3>
            <form onSubmit={handleCreateBatch} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Facility</label>
                <select
                  value={selectedFacilityForSettlement}
                  onChange={e => setSelectedFacilityForSettlement(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white"
                >
                  {facilities.filter(f => f.type !== 'afya_medicare').map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Period</label>
                <input
                  type="text"
                  value={settlementPeriod}
                  onChange={e => setSettlementPeriod(e.target.value)}
                  placeholder="e.g. October 2026"
                  className="w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
              >
                Compile Settlement Statement
              </button>
            </form>
          </div>

          {/* Settlement Statements List */}
          <div className="space-y-3">
            {settlements.map(stl => (
              <div key={stl.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="font-mono text-sm text-slate-900">{stl.settlementNumber}</strong>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        stl.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {stl.paymentStatus}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{stl.facilityName} • Period: <strong>{stl.period}</strong></p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Net Payable</span>
                    <strong className="font-mono text-base font-black text-emerald-800">
                      UGX {stl.amountPayable.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>Claims Audited: <strong>{stl.claimsCount}</strong></span>
                  <span>Approved Total: <strong>UGX {stl.approvedTotal.toLocaleString()}</strong></span>
                  <div className="flex items-center gap-2">
                    {stl.paymentStatus === 'DRAFT' && (
                      <button
                        onClick={() => {
                          const autoRef = `EFT-STL-${Math.floor(100000 + Math.random() * 900000)}`;
                          confirmAction({
                            title: 'Confirm Settlement Remittance',
                            message: `Mark settlement batch ${stl.settlementNumber} for ${stl.facilityName} as PAID?\n\nAmount: UGX ${stl.amountPayable.toLocaleString()} (${stl.claimsCount} claims audited)\nReference assigned: ${autoRef}`,
                            confirmLabel: 'Confirm Paid (EFT)',
                            variant: 'primary',
                            onConfirm: () => {
                              markSettlementPaid(stl.id, autoRef);
                              showToast(`Settlement ${stl.settlementNumber} marked PAID (${autoRef})!`, 'success');
                            }
                          });
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                      >
                        Mark Paid
                      </button>
                    )}
                    {stl.paymentReference && (
                      <span className="font-mono text-slate-500">Ref: {stl.paymentReference}</span>
                    )}
                    <button
                      onClick={() => handleDeleteSettlement(stl)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Settlement Statement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAuthModal && (
        <RequestAuthModal isOpen={true} onClose={() => setShowAuthModal(false)} />
      )}
      {showClaimModal && (
        <SubmitClaimModal isOpen={true} onClose={() => setShowClaimModal(false)} />
      )}
    </div>
  );
};
