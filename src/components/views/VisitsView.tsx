import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Visit,
  Patient,
  Card,
  Membership,
  InventoryItem,
  Receipt,
  ReceiptLineItem,
  PaymentMethod,
  CardType
} from '../../types';
import {
  CalendarCheck,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Stethoscope,
  PlusCircle,
  Trash2,
  Receipt as ReceiptIcon,
  DollarSign,
  ShieldCheck,
  CreditCard,
  User,
  ClipboardList,
  ArrowRight,
  QrCode,
  Printer,
  HeartPulse,
  Activity,
  Package,
  Plus,
  Minus,
  Sparkles,
  UserPlus,
  Check,
  X,
  Clock
} from 'lucide-react';
import { CardScannerModal } from '../scanner/CardScannerModal';
import { PrintReceiptModal } from '../payments/PrintReceiptModal';

interface VisitsViewProps {
  onNavigateToHMIS?: () => void;
}

export const VisitsView: React.FC<VisitsViewProps> = ({ onNavigateToHMIS }) => {
  const {
    visits,
    patients,
    cards,
    memberships,
    inventoryItems,
    receipts,
    currentFacility,
    currentUser,
    recordVisit,
    reverseVisit,
    deleteVisit,
    issueItemizedReceipt,
    registerPatient,
    findCardOrPatient,
    confirmAction,
    showToast
  } = useApp();

  // 1. CASHIER COUNTER: Scan / Search State
  const [cashierQuery, setCashierQuery] = useState('');
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Active Loaded Patient and Card
  const [loadedPatient, setLoadedPatient] = useState<Patient | null>(null);
  const [loadedCard, setLoadedCard] = useState<Card | null>(null);
  const [loadedMembership, setLoadedMembership] = useState<Membership | null>(null);
  const [patientHMISVisits, setPatientHMISVisits] = useState<Visit[]>([]);

  // Not-Found Quick Register Panel state
  const [isNotFound, setIsNotFound] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('1994-05-12');
  const [regSex, setRegSex] = useState<'Male' | 'Female'>('Female');
  const [regAddress, setRegAddress] = useState('Kitende, Wakiso');
  const [regKinName, setRegKinName] = useState('');
  const [regKinPhone, setRegKinPhone] = useState('');
  const [regCardType, setRegCardType] = useState<CardType>('HEALTH_PACKAGE');

  // 2. MOH VISIT CAPTURE STATE
  const [department, setDepartment] = useState('General Outpatient (OPD)');
  const [attendanceType, setAttendanceType] = useState<'NEW' | 'REATTENDANCE'>('NEW');
  const [vitalsBp, setVitalsBp] = useState('120/80');
  const [vitalsTemp, setVitalsTemp] = useState('36.8');
  const [vitalsWeight, setVitalsWeight] = useState('68');
  const [vitalsPulse, setVitalsPulse] = useState('76');
  const [vitalsSpo2, setVitalsSpo2] = useState('98');
  const [chiefComplaint, setChiefComplaint] = useState('Fever, headache, chills');
  const [prelimDiagnosis, setPrelimDiagnosis] = useState('Suspected Malaria');
  const [providerName, setProviderName] = useState('Dr. Mukasa David (Medical Officer)');
  const [queueNumber, setQueueNumber] = useState(`Q-${String(visits.length + 1).padStart(3, '0')}`);
  const [deductPackageVisit, setDeductPackageVisit] = useState(true);

  // 3. INVENTORY BILLING STATE
  const [billedItems, setBilledItems] = useState<ReceiptLineItem[]>([]);
  const [inventoryCategory, setInventoryCategory] = useState<string>('ALL');
  const [inventorySearch, setInventorySearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [paymentReference, setPaymentReference] = useState('');

  // 4. PRINT RECEIPT MODAL STATE
  const [receiptToPrint, setReceiptToPrint] = useState<Receipt | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // 5. PAST VISITS FILTER STATE
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFacility, setFilterFacility] = useState('ALL');
  const [filterCoverage, setFilterCoverage] = useState('ALL');
  const [selectedVisitToReverse, setSelectedVisitToReverse] = useState<Visit | null>(null);
  const [reversalReason, setReversalReason] = useState('Patient billed in error / cancelled encounter');

  // Auto-populate initial patient if none selected
  useEffect(() => {
    if (!loadedPatient && patients.length > 0) {
      loadPatientDetails(patients[0]);
    }
  }, [patients]);

  // Load a patient & their card, membership, and HMIS history
  const loadPatientDetails = (pat: Patient) => {
    setLoadedPatient(pat);
    setIsNotFound(false);

    const c = cards.find(card => card.patientId === pat.id && card.status === 'ACTIVE') || cards.find(card => card.patientId === pat.id);
    setLoadedCard(c || null);

    const m = memberships.find(mem => mem.patientId === pat.id && mem.status === 'ACTIVE') || memberships.find(mem => mem.patientId === pat.id);
    setLoadedMembership(m || null);

    const prevVisits = visits.filter(v => v.patientId === pat.id && v.status !== 'REVERSED');
    setPatientHMISVisits(prevVisits);

    // Auto-detect New vs Re-attendance
    setAttendanceType(prevVisits.length > 0 ? 'REATTENDANCE' : 'NEW');

    // Auto-set deduct package visit toggle if remaining visits > 0
    if (m && m.visitsRemaining > 0) {
      setDeductPackageVisit(true);
    } else {
      setDeductPackageVisit(false);
    }

    // Auto-add standard consultation line item from inventory
    const consultItem = inventoryItems.find(i => i.code === 'CNS-GEN') || inventoryItems[0];
    if (consultItem && billedItems.length === 0) {
      setBilledItems([
        {
          itemId: consultItem.id,
          itemCode: consultItem.code,
          itemName: consultItem.name,
          category: consultItem.category,
          unitPrice: consultItem.unitPrice,
          quantity: 1,
          totalPrice: consultItem.unitPrice,
          coveredByPackage: m ? m.visitsRemaining > 0 : false,
          amountPayable: m && m.visitsRemaining > 0 ? 0 : consultItem.unitPrice
        }
      ]);
    }
  };

  // Search or Scan card handler
  const handlePerformLookup = (q: string) => {
    setCashierQuery(q);
    const trimmed = q.trim();
    if (!trimmed) return;

    const res = findCardOrPatient(trimmed);
    if (res && res.patient) {
      loadPatientDetails(res.patient);
      setIsNotFound(false);
    } else {
      // Look through patient list
      const p = patients.find(
        pat =>
          pat.fullName.toLowerCase().includes(trimmed.toLowerCase()) ||
          pat.memberId.toLowerCase() === trimmed.toLowerCase() ||
          pat.phone.includes(trimmed)
      );
      if (p) {
        loadPatientDetails(p);
        setIsNotFound(false);
      } else {
        // Patient non in existence!
        setLoadedPatient(null);
        setLoadedCard(null);
        setLoadedMembership(null);
        setPatientHMISVisits([]);
        setIsNotFound(true);
        setRegFullName(trimmed.startsWith('AFY') ? '' : trimmed);
      }
    }
  };

  // Quick Register Patient from Cashier Table
  const handleQuickRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regPhone.trim()) {
      showToast('Please enter patient full name and phone number.', 'error');
      return;
    }

    const { patient: newPat, card: newC } = registerPatient(
      {
        fullName: regFullName.trim(),
        dob: regDob,
        sex: regSex,
        phone: regPhone.trim(),
        address: regAddress,
        emergencyContact: {
          name: regKinName || 'Next of Kin',
          relationship: 'Family Member',
          phone: regKinPhone || regPhone
        },
        status: 'ACTIVE'
      },
      undefined,
      undefined,
      regCardType === 'SICKLE_CELL'
    );

    showToast(`Patient ${newPat.fullName} (${newPat.memberId}) registered and issued Card ${newC.cardNumber}!`, 'success');
    loadPatientDetails(newPat);
    setIsNotFound(false);
  };

  // Fast Walk-in Cash Patient Billing (No Afya card required)
  const handleStartWalkInBilling = () => {
    const nowStr = new Date().toISOString();
    const walkInPatient: Patient = {
      id: `walkin-${Date.now().toString().slice(-6)}`,
      memberId: `OPD-CASH-${String(visits.length + 1).padStart(4, '0')}`,
      fullName: `Walk-in Cash Patient #${visits.length + 1}`,
      dob: '1995-01-01',
      sex: 'Female',
      phone: 'General OPD',
      address: 'Walk-in / Cash OPD Client',
      emergencyContact: {
        name: 'Walk-in relative',
        relationship: 'Family Member',
        phone: 'General OPD'
      },
      registrationDate: nowStr,
      status: 'ACTIVE',
      createdAt: nowStr
    };
    setLoadedPatient(walkInPatient);
    setLoadedCard(null);
    setLoadedMembership(null);
    setDeductPackageVisit(false);
    setIsNotFound(false);
    setAttendanceType('NEW');
    setDepartment('General Outpatient (OPD)');
    setChiefComplaint('General OPD Consultation & Medication');
    setPrelimDiagnosis('Clinical Review');
    showToast('Loaded Walk-in Cash Patient for billing without card.', 'info');
  };

  // Add Item from Inventory to Bill
  const handleAddInventoryItemToBill = (item: InventoryItem) => {
    const existingIndex = billedItems.findIndex(i => i.itemId === item.id);
    const isCovered = deductPackageVisit && item.isCoveredByDefault;

    if (existingIndex >= 0) {
      setBilledItems(prev =>
        prev.map((bi, idx) => {
          if (idx === existingIndex) {
            const newQty = bi.quantity + 1;
            const newTot = newQty * bi.unitPrice;
            return {
              ...bi,
              quantity: newQty,
              totalPrice: newTot,
              amountPayable: bi.coveredByPackage ? 0 : newTot
            };
          }
          return bi;
        })
      );
    } else {
      setBilledItems(prev => [
        ...prev,
        {
          itemId: item.id,
          itemCode: item.code,
          itemName: item.name,
          category: item.category,
          unitPrice: item.unitPrice,
          quantity: 1,
          totalPrice: item.unitPrice,
          coveredByPackage: isCovered,
          amountPayable: isCovered ? 0 : item.unitPrice
        }
      ]);
    }
  };

  // Toggle item covered by package
  const handleToggleCovered = (index: number) => {
    setBilledItems(prev =>
      prev.map((bi, idx) => {
        if (idx === index) {
          const nextCovered = !bi.coveredByPackage;
          return {
            ...bi,
            coveredByPackage: nextCovered,
            amountPayable: nextCovered ? 0 : bi.totalPrice
          };
        }
        return bi;
      })
    );
  };

  // Change quantity
  const handleUpdateQty = (index: number, delta: number) => {
    setBilledItems(prev =>
      prev
        .map((bi, idx) => {
          if (idx === index) {
            const nextQty = Math.max(1, bi.quantity + delta);
            const nextTotal = nextQty * bi.unitPrice;
            return {
              ...bi,
              quantity: nextQty,
              totalPrice: nextTotal,
              amountPayable: bi.coveredByPackage ? 0 : nextTotal
            };
          }
          return bi;
        })
        .filter(bi => bi.quantity > 0)
    );
  };

  // Remove item from bill
  const handleRemoveBilledItem = (index: number) => {
    setBilledItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Bill Financial Calculations
  const grossServicesTotal = billedItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const packageCoveredValue = billedItems.reduce((sum, i) => sum + (i.coveredByPackage ? i.totalPrice : 0), 0);
  const netTotalPayable = Math.max(0, grossServicesTotal - packageCoveredValue);
  const changeDue = Math.max(0, amountTendered - netTotalPayable);

  // When gross/net payable changes, default amount tendered
  useEffect(() => {
    if (amountTendered < netTotalPayable) {
      setAmountTendered(netTotalPayable);
    }
  }, [netTotalPayable]);

  // COMPLETE ENCOUNTER, DEDUCT CARD & PRINT RECEIPT
  const handleProcessVisitAndBilling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loadedPatient) {
      showToast('Please select or register a patient first.', 'warning');
      return;
    }

    if (billedItems.length === 0) {
      showToast('Please add at least one service or medication from inventory.', 'warning');
      return;
    }

    const triageString = `BP: ${vitalsBp} mmHg, Temp: ${vitalsTemp}°C, Wt: ${vitalsWeight}kg, Pulse: ${vitalsPulse}bpm, SpO2: ${vitalsSpo2}%`;

    // 1. Record the MOH HMIS Visit
    const { visit: newVisit } = recordVisit({
      patientId: loadedPatient.id,
      patientName: loadedPatient.fullName,
      cardId: loadedCard?.id,
      facilityId: currentFacility.id,
      facilityName: currentFacility.name,
      department: department,
      providerName: providerName,
      serviceName: billedItems.map(i => i.itemName).join(', ').slice(0, 100),
      packageId: loadedMembership?.packageId,
      coverageStatus: deductPackageVisit ? 'COVERED' : netTotalPayable === 0 ? 'COVERED' : 'PARTIALLY_COVERED',
      visitDeducted: deductPackageVisit,
      copaymentAmount: netTotalPayable,
      notes: `Chief Complaint: ${chiefComplaint}. Preliminary Dx: ${prelimDiagnosis}`,
      visitType: department,
      reasonForVisit: chiefComplaint,
      diagnosis: prelimDiagnosis,
      queueNumber: queueNumber,
      triageVitals: triageString,
      receptionStaff: currentUser.displayName,
      paymentStatus: netTotalPayable === 0 ? 'COVERED' : 'PAID'
    });

    // 2. Issue the Itemized Receipt
    const newReceipt = issueItemizedReceipt({
      patientId: loadedPatient.id,
      patientName: loadedPatient.fullName,
      memberId: loadedPatient.memberId,
      cardNumber: loadedCard?.cardNumber,
      visitId: newVisit.id,
      visitSequence: newVisit.visitSequence,
      queueNumber: queueNumber,
      lineItems: billedItems,
      subtotal: grossServicesTotal,
      packageDeductionValue: packageCoveredValue,
      totalPayable: netTotalPayable,
      amountPaid: paymentMethod === 'Cash' ? amountTendered : netTotalPayable,
      change: changeDue,
      paymentMethod: paymentMethod,
      paymentReference: paymentReference || (paymentMethod === 'Cash' ? 'CASH-PAID' : `TID-${Date.now().toString().slice(-6)}`),
      notes: `MOH HMIS attendance recorded. Attending: ${providerName}`
    });

    // 3. Open Print Receipt Modal Immediately
    setReceiptToPrint(newReceipt);
    setShowPrintModal(true);

    // Refresh patient details to reflect deducted balance
    const updatedMems = memberships.map(m =>
      m.id === loadedMembership?.id && deductPackageVisit
        ? { ...m, visitsUsed: m.visitsUsed + 1, visitsRemaining: Math.max(0, m.visitsRemaining - 1) }
        : m
    );
    const updatedMem = updatedMems.find(m => m.id === loadedMembership?.id);
    if (updatedMem) setLoadedMembership(updatedMem);

    // Update queue slip
    setQueueNumber(`Q-${String(visits.length + 2).padStart(3, '0')}`);
  };

  // Reversal handler
  const handleReverseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitToReverse) return;
    reverseVisit(selectedVisitToReverse.id, reversalReason);
    setSelectedVisitToReverse(null);
    showToast('Visit encounter reversed. Any package deduction has been credited back to member balance.', 'info');
  };

  // Delete visit
  const handleDeleteVisit = async (visit: Visit) => {
    confirmAction({
      title: 'Delete Visit Encounter',
      message: `Permanently delete encounter #${visit.visitSequence || visit.id} for ${visit.patientName}?\n\nIf a package visit was deducted, the balance will be restored automatically.`,
      confirmLabel: 'Delete Encounter',
      variant: 'danger',
      onConfirm: async () => {
        await deleteVisit(visit.id);
        showToast(`Encounter record for ${visit.patientName} deleted successfully.`, 'success');
      }
    });
  };

  // Filtered Visits for Table
  const filteredVisits = visits.filter(v => {
    const matchesSearch =
      v.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.visitSequence && v.visitSequence.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.queueNumber && v.queueNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFacility = filterFacility === 'ALL' || v.facilityId === filterFacility;
    const matchesCoverage =
      filterCoverage === 'ALL' ||
      (filterCoverage === 'COVERED' && v.visitDeducted) ||
      (filterCoverage === 'COPAY' && !v.visitDeducted) ||
      (filterCoverage === 'REVERSED' && v.status === 'REVERSED');

    return matchesSearch && matchesFacility && matchesCoverage;
  });

  return (
    <div className="space-y-6">
      {/* Role Reminder if Receptionist */}
      {currentUser.role === 'reception' && (
        <div className="p-4 bg-teal-500/10 border-2 border-teal-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-teal-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm">Cashier &amp; Billing Desk</h3>
              <p className="text-xs text-teal-800">
                You are currently logged in as <span className="font-bold">Receptionist</span>. The receptionist's primary workspace is <span className="font-bold">HMIS Data &amp; Outpatient Attendance Register</span>.
              </p>
            </div>
          </div>
          {onNavigateToHMIS && (
            <button
              onClick={onNavigateToHMIS}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Go to HMIS Data Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CASHIER TABLE: SCAN CARD & PATIENT LOOKUP STATION                       */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Cashier Table: Card Scan, MOH Visit &amp; Inventory Billing
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                  Cashier Desk
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Scan card &rarr; Load HMIS &amp; MOH data &rarr; Deduct package visit &rarr; Bill services from inventory &rarr; Print Official Receipt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
            <button
              onClick={handleStartWalkInBilling}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 justify-center flex-1 sm:flex-none"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Walk-in / Cash Patient (No Card)</span>
            </button>

            <button
              onClick={() => setShowScannerModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 justify-center flex-1 sm:flex-none"
            >
              <QrCode className="w-4 h-4" />
              <span>Camera Card Scan</span>
            </button>
          </div>
        </div>

        {/* Scan / Search input */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={cashierQuery}
                onChange={e => handlePerformLookup(e.target.value)}
                placeholder="Scan / Type Afya Card Number (AFY-CRD-882190), Member ID (AFY-000001), Patient Name, or Phone..."
                className="w-full text-xs sm:text-sm font-semibold rounded-2xl border-2 border-slate-200 pl-10 pr-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50 focus:bg-white shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <button
              onClick={() => handlePerformLookup(cashierQuery)}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-colors shrink-0 w-full sm:w-auto"
            >
              Lookup Card
            </button>
          </div>

          {/* Quick Member Selector Chips */}
          {patients.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>Recent Members:</span>
              </span>
              {patients.slice(0, 5).map(p => {
                const c = cards.find(card => card.patientId === p.id);
                const isSelected = loadedPatient?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => loadPatientDetails(p)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-2xs'
                        : 'bg-slate-100 hover:bg-amber-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{p.fullName}</span>
                    <span className="font-mono text-[10px] opacity-70">({c?.cardNumber || p.memberId})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* IF PATIENT IS NOT IN EXISTENCE ("NON IN EXISTENCE") - QUICK REGISTER PANEL */}
      {/* ========================================================================= */}
      {isNotFound && (
        <div className="bg-amber-50 border-2 border-amber-400/80 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">
                Patient Not Found in Database — Quick Intake at Cashier Desk
              </h3>
              <p className="text-slate-600 text-xs">
                No active record found for "{cashierQuery}". Register the patient once to capture their initial MOH HMIS file and issue an Afya Card.
              </p>
            </div>
          </div>

          <form onSubmit={handleQuickRegisterSubmit} className="space-y-4 bg-white p-4 rounded-2xl border border-amber-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Patient Name *</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  placeholder="e.g. Grace Nakato"
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number (MTN / Airtel) *</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="+256 701 445 920"
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sex</label>
                <select
                  value={regSex}
                  onChange={e => setRegSex(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date of Birth (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={regDob}
                  onChange={e => setRegDob(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Village / Parish / Location</label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={e => setRegAddress(e.target.value)}
                  placeholder="e.g. Kitende, Wakiso"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Next of Kin Name</label>
                <input
                  type="text"
                  value={regKinName}
                  onChange={e => setRegKinName(e.target.value)}
                  placeholder="Contact Person"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Next of Kin Phone</label>
                <input
                  type="tel"
                  value={regKinPhone}
                  onChange={e => setRegKinPhone(e.target.value)}
                  placeholder="+256 772 000 000"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Card Type to Issue</label>
                <select
                  value={regCardType}
                  onChange={e => setRegCardType(e.target.value as CardType)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-emerald-800"
                >
                  <option value="HEALTH_PACKAGE">Afya Health Package Card</option>
                  <option value="CHRONIC_CARE">Chronic Disease Care Card</option>
                  <option value="SICKLE_CELL">Sickle Cell Warrior Card</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNotFound(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Register &amp; Proceed to Cashier Billing</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LOADED PATIENT & MOH HMIS HISTORY OVERVIEW                              */}
      {/* ========================================================================= */}
      {loadedPatient && (
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
                {loadedPatient.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-black text-white">{loadedPatient.fullName}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                    {loadedPatient.memberId}
                  </span>
                  {loadedCard ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-900/60 text-teal-200 border border-teal-700">
                      Card: {loadedCard.cardNumber}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-900/60 text-amber-200 border border-amber-700">
                      Cash OPD / Non-Card Patient
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {loadedPatient.sex} • {loadedPatient.dob} • Phone: {loadedPatient.phone} • {loadedPatient.address}
                </p>
              </div>
            </div>

            {/* Package & Entitlement Balance Pill */}
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Health Package Balance</span>
              {loadedMembership ? (
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-mono text-xl font-black text-emerald-400">
                    {loadedMembership.visitsRemaining}
                  </span>
                  <span className="text-slate-300 font-medium">of {loadedMembership.visitsPurchased} visits remaining</span>
                </div>
              ) : (
                <span className="text-amber-400 font-bold block mt-0.5">No Active Package (Cash OPD)</span>
              )}
            </div>
          </div>

          {/* Longitudinal MOH HMIS Past History Row */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-teal-400" />
                <span>MOH HMIS Longitudinal History ({patientHMISVisits.length} previous visit{patientHMISVisits.length === 1 ? '' : 's'})</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {patientHMISVisits.length > 0 ? 'Returning Patient (Re-attendance)' : 'First Clinic Visit (New Attendance)'}
              </span>
            </div>

            {patientHMISVisits.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-800/40 text-slate-400 text-xs text-center border border-slate-800">
                No previous visits in system. This encounter will be registered as a <strong>New Attendance</strong> in MOH HMIS Form 031.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {patientHMISVisits.slice(0, 3).map((v, idx) => (
                  <div key={v.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono font-bold text-emerald-400">{v.visitSequence || `Visit #${idx + 1}`}</span>
                      <span>{new Date(v.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="font-bold text-slate-200 truncate">{v.reasonForVisit || v.serviceName}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Dx: {v.diagnosis || 'Clinical review'} • {v.department}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CURRENT MOH VISIT DATA & INVENTORY BILLING WORKBENCH                     */}
      {/* ========================================================================= */}
      {loadedPatient && (
        <form onSubmit={handleProcessVisitAndBilling} className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs">
                  MOH
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Step 1: Capture Current Visit (MOH HMIS 031 Standards)
                  </h3>
                  <p className="text-xs text-slate-500">Record attendance category, clinical triage vitals, and queue allocation</p>
                </div>
              </div>

              {/* Package Deduction Checkbox */}
              {loadedMembership && loadedMembership.visitsRemaining > 0 && (
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deductPackageVisit}
                    onChange={e => setDeductPackageVisit(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Deduct 1 Visit from Afya Card (Balance: {loadedMembership.visitsRemaining})</span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinic Department *</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                >
                  <option value="General Outpatient (OPD)">General Outpatient (OPD)</option>
                  <option value="Chronic Disease Clinic">Chronic Disease Clinic</option>
                  <option value="Sickle Cell Comprehensive Clinic">Sickle Cell Clinic</option>
                  <option value="Pediatrics">Pediatrics &amp; Child Health</option>
                  <option value="Emergency & Triage">Emergency &amp; Triage</option>
                  <option value="Maternal & Child Health (MCH)">Maternal Health (MCH)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Attendance Category</label>
                <select
                  value={attendanceType}
                  onChange={e => setAttendanceType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                >
                  <option value="NEW">New Attendance (First visit in year)</option>
                  <option value="REATTENDANCE">Re-attendance (Returning Patient)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Queue Number *</label>
                <input
                  type="text"
                  value={queueNumber}
                  onChange={e => setQueueNumber(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono font-bold text-teal-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Attending Provider</label>
                <input
                  type="text"
                  value={providerName}
                  onChange={e => setProviderName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold"
                />
              </div>
            </div>

            {/* Triage Vitals Grid */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                MOH Triage Vitals Assessment
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Blood Pressure (BP)</span>
                  <input
                    type="text"
                    value={vitalsBp}
                    onChange={e => setVitalsBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full rounded-lg border border-slate-200 p-1.5 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Temp (°C)</span>
                  <input
                    type="text"
                    value={vitalsTemp}
                    onChange={e => setVitalsTemp(e.target.value)}
                    placeholder="36.8"
                    className="w-full rounded-lg border border-slate-200 p-1.5 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Weight (kg)</span>
                  <input
                    type="text"
                    value={vitalsWeight}
                    onChange={e => setVitalsWeight(e.target.value)}
                    placeholder="68"
                    className="w-full rounded-lg border border-slate-200 p-1.5 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Pulse (bpm)</span>
                  <input
                    type="text"
                    value={vitalsPulse}
                    onChange={e => setVitalsPulse(e.target.value)}
                    placeholder="76"
                    className="w-full rounded-lg border border-slate-200 p-1.5 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SpO2 Oxygen (%)</span>
                  <input
                    type="text"
                    value={vitalsSpo2}
                    onChange={e => setVitalsSpo2(e.target.value)}
                    placeholder="98"
                    className="w-full rounded-lg border border-slate-200 p-1.5 font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Complaints and Diagnoses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chief Complaint / Presenting Symptoms *</label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                  required
                  placeholder="e.g. Fever, persistent cough, joint aches"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Preliminary Diagnosis</label>
                <input
                  type="text"
                  value={prelimDiagnosis}
                  onChange={e => setPrelimDiagnosis(e.target.value)}
                  placeholder="e.g. Uncomplicated Malaria / URI"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-xs"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STEP 2: INVENTORY BILLING (SERVICES, LABS, MEDICATIONS FROM INVENTORY)    */}
          {/* ========================================================================= */}
          <div className="p-5 sm:p-6 bg-slate-50/60 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs">
                  BILL
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Step 2: Add Services &amp; Medications from Clinic Inventory
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select items received today. The receipt will contain all services and calculate package deduction vs. cash copay.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Catalog Selector */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={e => setInventorySearch(e.target.value)}
                    placeholder="Quick search inventory items (e.g. Malaria RDT, Coartem, CBC, Amoxicillin)..."
                    className="w-full text-xs rounded-xl border border-slate-200 pl-8 pr-3 py-2 bg-slate-50"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                  {(['ALL', 'Consultation', 'Laboratory', 'Pharmacy', 'Procedure'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setInventoryCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap ${
                        inventoryCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Click-to-add items grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
                {inventoryItems
                  .filter(
                    item =>
                      (inventoryCategory === 'ALL' || item.category === inventoryCategory) &&
                      (item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                        item.code.toLowerCase().includes(inventorySearch.toLowerCase()))
                  )
                  .map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAddInventoryItemToBill(item)}
                      className="text-left p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex flex-col justify-between group"
                    >
                      <div className="font-bold text-slate-900 text-xs group-hover:text-emerald-800 line-clamp-1">
                        + {item.name}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="font-mono text-emerald-800 font-bold">UGX {item.unitPrice.toLocaleString()}</span>
                        <span className="text-slate-400">{item.category}</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Selected Items Billed Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Services &amp; Medications Included on Today's Receipt ({billedItems.length})</span>
                <span className="text-[11px] text-slate-500">Check "Covered" to waive item under Afya card benefit</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold bg-slate-50">
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Unit Rate</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Total Price</th>
                      <th className="py-2.5 px-3 text-center">Covered by Card?</th>
                      <th className="py-2.5 px-3 text-right">Copay Due</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {billedItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          Click items above from the clinic inventory to add them to this encounter receipt.
                        </td>
                      </tr>
                    ) : (
                      billedItems.map((bi, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 block">{bi.itemName}</span>
                            <span className="font-mono text-[10px] text-slate-400">{bi.itemCode}</span>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {bi.category}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-mono text-slate-700">
                            UGX {bi.unitPrice.toLocaleString()}
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(idx, -1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="w-7 text-center font-mono font-bold">{bi.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(idx, 1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            UGX {bi.totalPrice.toLocaleString()}
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={bi.coveredByPackage}
                                onChange={() => handleToggleCovered(idx)}
                                className="w-4 h-4 text-emerald-600 rounded"
                              />
                              <span className={`text-[10px] font-bold ${bi.coveredByPackage ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {bi.coveredByPackage ? 'Covered' : 'Cash'}
                              </span>
                            </label>
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono font-black text-amber-900">
                            UGX {bi.amountPayable.toLocaleString()}
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveBilledItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary & Payment Row */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-200 text-xs">
                {/* Total 1: Gross */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Value of Services Today</span>
                  <span className="font-mono text-xl font-black text-slate-900 mt-0.5 block">
                    UGX {grossServicesTotal.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">Gross billing before scheme benefit</span>
                </div>

                {/* Total 2: Package discount */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Afya Scheme Entitlement Value</span>
                  <span className="font-mono text-xl font-black text-emerald-700 mt-0.5 block">
                    -UGX {packageCoveredValue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-medium">Covered by deducted package visit</span>
                </div>

                {/* Total 3: Net Cash / Copay Due */}
                <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950">
                  <span className="text-[10px] font-black text-amber-900 uppercase block">NET CASH / COPAY PAYABLE</span>
                  <span className="font-mono text-2xl font-black text-amber-900 mt-0.5 block">
                    UGX {netTotalPayable.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold">Patient out-of-pocket balance</span>
                </div>
              </div>

              {/* Payment Details Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  >
                    <option value="Cash">Cash (UGX Banknotes)</option>
                    <option value="Mobile Money">MTN / Airtel Mobile Money</option>
                    <option value="Card/POS">Visa / Mastercard / POS</option>
                    <option value="Bank">Direct Bank Transfer</option>
                  </select>
                </div>

                {paymentMethod === 'Cash' ? (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Amount Tendered (UGX)</label>
                    <input
                      type="number"
                      value={amountTendered}
                      onChange={e => setAmountTendered(Number(e.target.value))}
                      min={netTotalPayable}
                      step={500}
                      className="w-full rounded-xl border border-slate-200 p-2.5 font-mono font-bold"
                    />
                    {changeDue > 0 && (
                      <span className="text-[11px] font-bold text-teal-700 block mt-1">
                        Change Due: UGX {changeDue.toLocaleString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile Money TID / Ref No.</label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={e => setPaymentReference(e.target.value)}
                      placeholder="e.g. MTN-TID-88219"
                      className="w-full rounded-xl border border-slate-200 p-2.5 font-mono font-semibold"
                    />
                  </div>
                )}

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Deduct Card &amp; Print Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 4. RECENT CASHIER VISITS & RECEIPTS TABLE (ALL BUTTONS WORKING!)           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-base text-slate-900">
              Cashier Daily Audit &amp; Encounter Ledger
            </h3>
            <p className="text-xs text-slate-500">Every recorded visit with one-click print receipt, package verification, and reversal</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterCoverage}
              onChange={e => setFilterCoverage(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 p-2 bg-white font-medium"
            >
              <option value="ALL">All Encounters</option>
              <option value="COVERED">Package Deducted (-1 visit)</option>
              <option value="COPAY">Copay / Cash Out-of-pocket</option>
              <option value="REVERSED">Reversed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-3">Visit &amp; Queue #</th>
                <th className="py-3 px-3">Patient Name &amp; ID</th>
                <th className="py-3 px-3">Services Billed</th>
                <th className="py-3 px-3">Coverage Status</th>
                <th className="py-3 px-3">Date / Time</th>
                <th className="py-3 px-3 text-right">Cashier Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No encounters recorded yet. Use the Cashier Table above to record visits.
                  </td>
                </tr>
              ) : (
                filteredVisits.map(visit => {
                  const isReversed = visit.status === 'REVERSED';
                  // Find matching receipt
                  const matchingReceipt = receipts.find(
                    r => r.visitId === visit.id || r.patientId === visit.patientId
                  );

                  return (
                    <tr
                      key={visit.id}
                      className={`hover:bg-slate-50 transition-colors ${isReversed ? 'bg-rose-50/30' : ''}`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                            {visit.visitSequence || 'Visit'}
                          </span>
                          {visit.queueNumber && (
                            <span className="font-mono text-[10px] text-teal-700 font-bold">
                              {visit.queueNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{visit.patientName}</div>
                        <div className="font-mono text-[10px] text-slate-400">ID: {visit.patientId}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 line-clamp-1">{visit.serviceName}</div>
                        <div className="text-[10px] text-slate-500">
                          {visit.diagnosis ? `Dx: ${visit.diagnosis}` : visit.department} • By: {visit.providerName}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isReversed
                              ? 'bg-rose-100 text-rose-800'
                              : visit.coverageStatus === 'COVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isReversed ? 'REVERSED' : visit.coverageStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-500">
                        {new Date(visit.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} •{' '}
                        {new Date(visit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* PRINT RECEIPT BUTTON (ALWAYS FUNCTIONAL) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (matchingReceipt) {
                                setReceiptToPrint(matchingReceipt);
                                setShowPrintModal(true);
                              } else {
                                // Synthesize receipt from visit
                                const synReceipt: Receipt = {
                                  id: `rcp-gen-${visit.id}`,
                                  receiptNumber: `AFY-RCP-${new Date(visit.createdAt).getFullYear()}-${visit.id.slice(-4)}`,
                                  visitId: visit.id,
                                  visitSequence: visit.visitSequence,
                                  queueNumber: visit.queueNumber,
                                  patientId: visit.patientId,
                                  patientName: visit.patientName,
                                  memberId: visit.patientId,
                                  cardNumber: visit.cardId,
                                  amount: visit.copaymentAmount || 0,
                                  currency: 'UGX',
                                  paymentMethod: 'Cash',
                                  description: visit.serviceName,
                                  packageOrProgram: visit.visitDeducted ? 'Afya Health Package Covered Visit' : 'Cash OPD',
                                  staffName: currentUser.displayName,
                                  facilityName: currentFacility.name,
                                  facilityLocation: currentFacility.location,
                                  subtotal: visit.copaymentAmount || 15000,
                                  packageDeductionValue: visit.visitDeducted ? 15000 : 0,
                                  totalPayable: visit.copaymentAmount || 0,
                                  amountPaid: visit.copaymentAmount || 0,
                                  change: 0,
                                  createdAt: visit.createdAt
                                };
                                setReceiptToPrint(synReceipt);
                                setShowPrintModal(true);
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs flex items-center gap-1 border border-emerald-200 transition-colors"
                            title="Print Official Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Receipt</span>
                          </button>

                          {/* REVERSAL BUTTON */}
                          {!isReversed && (
                            <button
                              type="button"
                              onClick={() => setSelectedVisitToReverse(visit)}
                              className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg text-xs font-semibold transition-colors"
                              title="Reverse encounter and restore package visit"
                            >
                              Reverse
                            </button>
                          )}

                          {/* DELETE BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleDeleteVisit(visit)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete visit record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS: CAMERA SCANNER, PRINT RECEIPT, REVERSAL                           */}
      {/* ========================================================================= */}

      {/* 1. Camera QR Scanner Modal */}
      {showScannerModal && (
        <CardScannerModal
          isOpen={true}
          onClose={() => setShowScannerModal(false)}
          onCardFound={q => {
            setShowScannerModal(false);
            handlePerformLookup(q);
          }}
        />
      )}

      {/* 2. Official Printable Receipt Modal */}
      <PrintReceiptModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        receipt={receiptToPrint}
      />

      {/* 3. Reversal Modal */}
      {selectedVisitToReverse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Authorize Cashier Reversal</h3>
                <p className="text-[11px] text-slate-500">Visit #{selectedVisitToReverse.id} for {selectedVisitToReverse.patientName}</p>
              </div>
            </div>

            <form onSubmit={handleReverseSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Reversal *</label>
                <select
                  value={reversalReason}
                  onChange={e => setReversalReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                >
                  <option value="Encounter entered in error">Encounter entered in error</option>
                  <option value="Patient left before receiving medical service">Patient left before receiving medical service</option>
                  <option value="Duplicate card scan registered">Duplicate card scan registered</option>
                  <option value="Billing discrepancy corrected">Billing discrepancy corrected</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 text-[11px]">
                <strong className="block font-bold">Automatic Entitlement Restoration:</strong>
                If this encounter had deducted a visit from an active Afya Package, 1 visit will be immediately credited back to the member balance.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVisitToReverse(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
