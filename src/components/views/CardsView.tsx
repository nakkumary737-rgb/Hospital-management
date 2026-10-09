import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardType, CardStatus } from '../../types';
import { AfyaLogo } from '../common/AfyaLogo';
import {
  CreditCard,
  Printer,
  Ban,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  QrCode,
  Radio,
  Layers,
  LayoutGrid,
  List,
  Trash2,
  PlusCircle,
  Check,
  ShieldAlert,
  ShieldOff,
  RotateCcw
} from 'lucide-react';

interface CardsViewProps {
  onOpenCardPreview: (cardId: string) => void;
  onScanCard: (cardNumber: string) => void;
}

export const CardsView: React.FC<CardsViewProps> = ({
  onOpenCardPreview,
  onScanCard
}) => {
  const {
    cards,
    patients,
    blockCard,
    unblockCard,
    replaceCard,
    reportCardLost,
    deactivateCard,
    reactivateCard,
    deleteCard,
    issueNewCard,
    confirmAction,
    showToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [displayMode, setDisplayMode] = useState<'tiles' | 'table'>('tiles');

  const [selectedCardToReplace, setSelectedCardToReplace] = useState<Card | null>(null);
  const [replaceReason, setReplaceReason] = useState('Lost physical PVC card');

  // Report Lost / Stolen Modal
  const [selectedCardToReportLost, setSelectedCardToReportLost] = useState<Card | null>(null);
  const [lostIncidentNotes, setLostIncidentNotes] = useState('Patient reported card misplaced / lost at home');

  // Deactivate Modal
  const [selectedCardToDeactivate, setSelectedCardToDeactivate] = useState<Card | null>(null);
  const [deactivateReasonText, setDeactivateReasonText] = useState('Temporary hold requested by member');

  // Issue New Card Modal state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issuePatientId, setIssuePatientId] = useState(patients[0]?.id || '');
  const [issueCardType, setIssueCardType] = useState<CardType>('HEALTH_PACKAGE');

  const activeCount = cards.filter(c => c.status === 'ACTIVE').length;
  const blockedCount = cards.filter(c => c.status === 'BLOCKED').length;
  const lostCount = cards.filter(c => c.status === 'LOST' || c.status === 'STOLEN').length;
  const replacedCount = cards.filter(c => c.status === 'REPLACED').length;

  const filteredCards = cards.filter(card => {
    const patient = patients.find(p => p.id === card.patientId);
    const matchesSearch =
      card.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.qrIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient && patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient && patient.memberId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'ALL' || card.cardType === filterType;
    const matchesStatus = filterStatus === 'ALL' || card.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeactivate = (card: Card) => {
    setSelectedCardToDeactivate(card);
  };

  const handleDeactivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardToDeactivate) return;
    await deactivateCard(selectedCardToDeactivate.id, deactivateReasonText);
    const cardNum = selectedCardToDeactivate.cardNumber;
    setSelectedCardToDeactivate(null);
    showToast(`Card ${cardNum} deactivated and blocked from service authorization.`, 'info');
  };

  const handleReportLost = (card: Card) => {
    setSelectedCardToReportLost(card);
  };

  const handleReportLostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardToReportLost) return;
    await reportCardLost(selectedCardToReportLost.id, lostIncidentNotes);
    const oldCard = selectedCardToReportLost;
    setSelectedCardToReportLost(null);
    showToast(`Card ${oldCard.cardNumber} marked LOST.`, 'warning');

    confirmAction({
      title: 'Issue Replacement Card?',
      message: `Card ${oldCard.cardNumber} was marked LOST and deactivated.\n\nWould you like to issue a replacement card immediately for this patient?`,
      confirmLabel: 'Issue Replacement Card',
      variant: 'primary',
      onConfirm: () => {
        setSelectedCardToReplace(oldCard);
      }
    });
  };

  const handleUnblock = async (card: Card) => {
    confirmAction({
      title: 'Reactivate Card',
      message: `Reactivate card ${card.cardNumber}? It will be restored to ACTIVE operational status for service authorization.`,
      confirmLabel: 'Reactivate Card',
      variant: 'primary',
      onConfirm: async () => {
        await reactivateCard(card.id);
        showToast(`Card ${card.cardNumber} is now ACTIVE!`, 'success');
      }
    });
  };

  const handleDeleteCard = async (card: Card) => {
    confirmAction({
      title: 'Delete Card Record',
      message: `Are you sure you want to permanently delete card ${card.cardNumber}? This card will be removed from circulation.`,
      confirmLabel: 'Delete Card',
      variant: 'danger',
      onConfirm: async () => {
        await deleteCard(card.id);
        showToast(`Card ${card.cardNumber} deleted successfully.`, 'success');
      }
    });
  };

  const handleReplaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardToReplace) return;

    replaceCard(selectedCardToReplace.id, replaceReason);
    setSelectedCardToReplace(null);
    showToast('New replacement card issued successfully! Old card marked REPLACED.', 'success');
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuePatientId) {
      showToast('Please select a patient to issue the card to.', 'error');
      return;
    }
    const newCard = issueNewCard(issuePatientId, issueCardType);
    setShowIssueModal(false);
    showToast(`Card ${newCard.cardNumber} (${issueCardType.replace('_', ' ')}) issued successfully!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Afya Membership Cards</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            CR80 PVC physical identity &amp; membership credentials (Health Package, Chronic Care &amp; Sickle Cell)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (patients.length === 0) {
                showToast('Please register at least one patient first before issuing a card.', 'warning');
                return;
              }
              if (!issuePatientId && patients[0]) {
                setIssuePatientId(patients[0].id);
              }
              setShowIssueModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue New Card</span>
          </button>
        </div>
      </div>

      {/* Card Status Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Cards</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <strong className="text-2xl font-black text-emerald-800 font-mono mt-1 block">{activeCount}</strong>
          <span className="text-[10px] text-emerald-700 font-medium">Operational</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Blocked</span>
            <Ban className="w-4 h-4 text-rose-600" />
          </div>
          <strong className="text-2xl font-black text-rose-800 font-mono mt-1 block">{blockedCount}</strong>
          <span className="text-[10px] text-rose-600 font-medium">Restricted</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Lost / Stolen</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <strong className="text-2xl font-black text-amber-800 font-mono mt-1 block">{lostCount}</strong>
          <span className="text-[10px] text-amber-700 font-medium">Reported</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Replaced</span>
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </div>
          <strong className="text-2xl font-black text-slate-800 font-mono mt-1 block">{replacedCount}</strong>
          <span className="text-[10px] text-slate-400 font-medium">History Preserved</span>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search card number, QR code ID, patient name, Member ID..."
            className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-4 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 p-2 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Types</option>
            <option value="HEALTH_PACKAGE">Health Package</option>
            <option value="CHRONIC_CARE">Chronic Care</option>
            <option value="SICKLE_CELL">Sickle Cell</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 p-2 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="LOST">LOST</option>
            <option value="REPLACED">REPLACED</option>
          </select>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0">
            <button
              onClick={() => setDisplayMode('tiles')}
              className={`p-1.5 rounded-lg ${displayMode === 'tiles' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
              title="Card Badge Tiles"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDisplayMode('table')}
              className={`p-1.5 rounded-lg ${displayMode === 'table' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {cards.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <CreditCard className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No Physical Cards Issued Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cards are automatically generated upon patient registration with unique QR identifiers and ISO CR80 print specs.
          </p>
        </div>
      )}

      {/* CARD BADGE TILES VIEW */}
      {displayMode === 'tiles' && cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map(card => {
            const patient = patients.find(p => p.id === card.patientId);

            const getCardBg = () => {
              if (card.cardType === 'SICKLE_CELL') return 'from-rose-800 to-red-950';
              if (card.cardType === 'CHRONIC_CARE') return 'from-teal-800 to-cyan-950';
              return 'from-emerald-800 to-teal-950';
            };

            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              >
                {/* Physical Card Simulation Header */}
                <div className={`p-4 bg-gradient-to-br ${getCardBg()} text-white relative overflow-hidden space-y-3`}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-white/90 p-0.5 shadow-xs overflow-hidden flex items-center justify-center shrink-0">
                        <AfyaLogo variant="emblem" size="xs" />
                      </div>
                      <span className="font-bold tracking-tight text-[11px] text-white/95">AFYA MEDICARE</span>
                    </div>
                    <Radio className="w-3.5 h-3.5 text-white/70" />
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/60 block font-semibold">
                      {card.cardType.replace('_', ' ')}
                    </span>
                    <p className="font-bold text-sm tracking-tight text-white truncate">
                      {patient?.fullName || 'Afya Cardholder'}
                    </p>
                  </div>

                  <div className="flex items-end justify-between font-mono text-xs border-t border-white/15 pt-2">
                    <div>
                      <span className="text-[9px] text-white/60 block font-sans">CARD NUMBER</span>
                      <strong className="tracking-wider text-white text-xs">{card.cardNumber}</strong>
                    </div>
                    <span className="text-[10px] text-white/80">{card.expiryDate}</span>
                  </div>
                </div>

                {/* Card Details & Actions */}
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono text-[11px]">QR: {card.qrIdentifier}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        card.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : card.status === 'BLOCKED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {card.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onScanCard(card.cardNumber)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs"
                      >
                        Scan Card
                      </button>

                      <button
                        onClick={() => onOpenCardPreview(card.id)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold text-xs flex items-center gap-1"
                        title="View & Print CR80 PVC Card"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>PVC Badge</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedCardToReplace(card)}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg font-bold text-[11px] border border-amber-200 transition-colors"
                        title="Replace Card with new card number"
                      >
                        Replace
                      </button>

                      {card.status === 'ACTIVE' ? (
                        <>
                          <button
                            onClick={() => handleReportLost(card)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg font-bold text-[11px] border border-rose-200 transition-colors flex items-center gap-1"
                            title="Report card as lost or stolen"
                          >
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Report Lost</span>
                          </button>

                          <button
                            onClick={() => handleDeactivate(card)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors"
                            title="Deactivate / Suspend Card"
                          >
                            Deactivate
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUnblock(card)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                          title="Reactivate card to operational status"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reactivate</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteCard(card)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete Card Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {displayMode === 'table' && cards.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Card Number &amp; QR</th>
                  <th className="py-3 px-4">Cardholder / Patient</th>
                  <th className="py-3 px-4">Card Classification</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCards.map(card => {
                  const patient = patients.find(p => p.id === card.patientId);

                  return (
                    <tr key={card.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{card.cardNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{patient?.fullName || 'Unknown'}</td>
                      <td className="py-3 px-4">{card.cardType.replace('_', ' ')}</td>
                      <td className="py-3 px-4 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            card.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : card.status === 'BLOCKED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {card.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{card.expiryDate}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => onScanCard(card.cardNumber)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs"
                            title="Scan card at reception / cashier"
                          >
                            Scan
                          </button>
                          <button
                            onClick={() => onOpenCardPreview(card.id)}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg font-semibold text-xs flex items-center gap-1"
                            title="Preview & Print CR80 PVC Badge"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>PVC</span>
                          </button>
                          <button
                            onClick={() => setSelectedCardToReplace(card)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg font-bold text-xs border border-amber-200"
                            title="Replace Card with new card number"
                          >
                            Replace
                          </button>
                          {card.status === 'ACTIVE' ? (
                            <>
                              <button
                                onClick={() => handleReportLost(card)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg font-bold text-xs border border-rose-200 flex items-center gap-1"
                                title="Report card as lost or stolen"
                              >
                                <ShieldAlert className="w-3 h-3 text-rose-600" />
                                <span>Report</span>
                              </button>
                              <button
                                onClick={() => handleDeactivate(card)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs"
                                title="Deactivate / Suspend card"
                              >
                                Deactivate
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleUnblock(card)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                              title="Reactivate card to operational status"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reactivate</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCard(card)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete card record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue New Card Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Issue New Afya Membership Card</h3>
            <p className="text-slate-500">
              Generates a new ISO CR80 physical card with unique cryptographic QR and NFC identifiers.
            </p>

            <form onSubmit={handleIssueSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Member / Patient</label>
                <select
                  value={issuePatientId}
                  onChange={e => setIssuePatientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white text-xs"
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.memberId}) — {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Card Classification</label>
                <select
                  value={issueCardType}
                  onChange={e => setIssueCardType(e.target.value as CardType)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white text-xs"
                >
                  <option value="HEALTH_PACKAGE">Health Package Membership Card</option>
                  <option value="CHRONIC_CARE">Chronic Disease Care Card</option>
                  <option value="SICKLE_CELL">Sickle Cell Care Card (Clinical ID)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Confirm &amp; Generate Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replacement Modal */}
      {selectedCardToReplace && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Replace Inactive/Lost Card</h3>
            <p className="text-slate-500">
              Card <strong>{selectedCardToReplace.cardNumber}</strong> will be retired. A new PVC card will be linked to the same patient account.
            </p>

            <form onSubmit={handleReplaceSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Replacement</label>
                <select
                  value={replaceReason}
                  onChange={e => setReplaceReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white"
                >
                  <option value="Lost physical PVC card">Lost physical PVC card</option>
                  <option value="Stolen card reported by member">Stolen card reported by member</option>
                  <option value="Damaged barcode / worn card">Damaged barcode / worn card</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCardToReplace(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Confirm &amp; Issue New Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Report Lost / Stolen Modal */}
      {selectedCardToReportLost && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4 text-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Report Card as Lost or Stolen</h3>
                <p className="text-[11px] text-slate-500">
                  Card {selectedCardToReportLost.cardNumber} will immediately be blocked.
                </p>
              </div>
            </div>

            <form onSubmit={handleReportLostSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Incident / Circumstances</label>
                <textarea
                  value={lostIncidentNotes}
                  onChange={e => setLostIncidentNotes(e.target.value)}
                  rows={3}
                  required
                  placeholder="e.g. Card misplaced in taxi / stolen wallet reported by member..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                />
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-[11px]">
                <strong className="block font-bold">Security Protection Notice:</strong>
                Blocking prevents any unauthorized clinic encounters, drug dispensing, or fraudulent claim authorizations.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCardToReportLost(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Confirm &amp; Block Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate / Suspend Card Modal */}
      {selectedCardToDeactivate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Deactivate / Suspend Card</h3>
                <p className="text-[11px] text-slate-500">
                  Card {selectedCardToDeactivate.cardNumber} will be temporarily placed on hold.
                </p>
              </div>
            </div>

            <form onSubmit={handleDeactivateSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Deactivation</label>
                <select
                  value={deactivateReasonText}
                  onChange={e => setDeactivateReasonText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white text-xs font-medium"
                >
                  <option value="Temporary hold requested by member">Temporary hold requested by member</option>
                  <option value="Payment verification / subscription pending">Payment verification / subscription pending</option>
                  <option value="Administrative review by clinic supervisor">Administrative review by clinic supervisor</option>
                  <option value="Duplicate card issued in error">Duplicate card issued in error</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCardToDeactivate(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs"
                >
                  Deactivate Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
