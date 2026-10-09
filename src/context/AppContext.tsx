import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  UserProfile,
  Patient,
  Card,
  CardType,
  CardStatus,
  HealthcarePackage,
  Membership,
  FamilyMember,
  ChronicProgram,
  ChronicMembership,
  SickleCellProfile,
  Facility,
  Visit,
  Payment,
  Receipt,
  ServiceAuthorization,
  ProviderClaim,
  FacilitySettlement,
  AuditLog,
  PaymentMethod,
  ReceptionViewPermissions,
  InventoryItem,
  ReceiptLineItem
} from '../types';
import {
  initialFacilities,
  initialPackages,
  initialChronicPrograms,
  initialAuditLogs,
  initialInventoryItems
} from '../data/seedData';
import { ConfirmModal, ConfirmDialogOptions } from '../components/common/ConfirmModal';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  FirebaseUser,
  testFirebaseConnection
} from '../firebase/config';
import {
  saveFirestoreDoc,
  deleteFirestoreDoc,
  subscribeToCollection,
  initializeCoreMasterDataIfNeeded
} from '../firebase/db';

interface AppContextType {
  // Network & Connectivity
  isOnline: boolean;
  toggleOnlineStatus: () => void;
  isFirebaseConnected: boolean;

  // Authentication & Session
  firebaseUser: FirebaseUser | null;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  currentUser: UserProfile;
  switchUserRole: (role: UserRole, facilityId?: string) => void;
  currentFacility: Facility;

  // Master Collections (Real-time Firestore)
  facilities: Facility[];
  patients: Patient[];
  cards: Card[];
  packages: HealthcarePackage[];
  memberships: Membership[];
  familyMembers: FamilyMember[];
  chronicPrograms: ChronicProgram[];
  chronicMemberships: ChronicMembership[];
  sickleCellProfiles: SickleCellProfile[];
  visits: Visit[];
  payments: Payment[];
  receipts: Receipt[];
  authorizations: ServiceAuthorization[];
  claims: ProviderClaim[];
  settlements: FacilitySettlement[];
  auditLogs: AuditLog[];

  // Patient & Card Operations
  checkPatientDuplicates: (name: string, phone: string, dob?: string) => Patient[];
  registerPatient: (
    patientData: Omit<Patient, 'id' | 'memberId' | 'registrationDate' | 'createdAt'>,
    packageId?: string,
    chronicProgramId?: string,
    isSickleCell?: boolean
  ) => { patient: Patient; card: Card };
  updatePatient: (
    patientId: string,
    updatedData: Partial<Omit<Patient, 'id' | 'memberId' | 'registrationDate' | 'createdAt'>>
  ) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  issueNewCard: (patientId: string, cardType: CardType) => Card;
  blockCard: (cardId: string, reason: string, status?: 'BLOCKED' | 'LOST' | 'STOLEN') => void;
  unblockCard: (cardId: string) => void;
  replaceCard: (oldCardId: string, reason: string) => Card;
  reportCardLost: (cardId: string, notes: string) => Promise<void>;
  deactivateCard: (cardId: string, reason: string) => Promise<void>;
  reactivateCard: (cardId: string) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;

  // Inventory & Service Catalog (Billing Source)
  inventoryItems: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => InventoryItem;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (itemId: string) => void;

  // Package Management (Admin)
  savePackage: (pkg: HealthcarePackage) => void;
  deletePackage: (packageId: string) => Promise<void>;
  saveChronicProgram: (prog: ChronicProgram) => void;
  deleteChronicProgram: (programId: string) => Promise<void>;

  // Visit & Benefit Operations
  recordVisit: (
    visitData: Omit<Visit, 'id' | 'createdAt' | 'status'>
  ) => { visit: Visit; updatedMembership?: Membership };
  reverseVisit: (visitId: string, reason: string) => void;
  deleteVisit: (visitId: string) => Promise<void>;

  // Payments & Receipts
  recordPayment: (paymentData: {
    patientId: string;
    membershipId?: string;
    chronicMembershipId?: string;
    itemDescription: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
  }) => { payment: Payment; receipt: Receipt };
  deletePayment: (paymentId: string) => Promise<void>;
  issueItemizedReceipt: (receiptData: {
    patientId: string;
    patientName: string;
    memberId: string;
    cardNumber?: string;
    visitId?: string;
    visitSequence?: string;
    queueNumber?: string;
    lineItems: ReceiptLineItem[];
    subtotal: number;
    packageDeductionValue: number;
    totalPayable: number;
    amountPaid: number;
    change: number;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
    notes?: string;
  }) => Receipt;

  // Chronic Care Workflows
  enrollChronicMembership: (
    patientId: string,
    programId: string,
    conditionOrNotes?: string,
    medications?: string[]
  ) => ChronicMembership;
  deleteChronicMembership: (chronicMembershipId: string) => Promise<void>;
  renewChronicMembership: (
    chronicMembershipId: string,
    paidMonth: string,
    paymentMethod: PaymentMethod,
    referenceNumber: string
  ) => void;
  recordMedicationPickup: (
    chronicMembershipId: string,
    itemsDispensed: string,
    pharmacist: string
  ) => void;
  recordChronicConsultation: (
    chronicMembershipId: string,
    doctor: string,
    bpOrVitals: string,
    notes: string
  ) => void;

  // Sickle Cell Clinical Care
  registerSickleCellProfile: (
    profileData: Omit<SickleCellProfile, 'id' | 'createdAt'>
  ) => SickleCellProfile;
  updateSickleCellProfile: (profile: SickleCellProfile) => void;
  deleteSickleCellProfile: (profileId: string) => Promise<void>;
  recordSickleCellConsultation: (
    profileId: string,
    clinician: string,
    crisisType: string,
    vitals: string,
    treatmentGiven: string
  ) => void;

  // Partner Network & Authorization Workflows
  requestAuthorization: (authData: Omit<ServiceAuthorization, 'id' | 'authNumber' | 'createdAt' | 'status'>) => ServiceAuthorization;
  adjudicateAuthorization: (authId: string, status: 'APPROVED' | 'DENIED', notes?: string) => void;
  deleteAuthorization: (authId: string) => Promise<void>;
  submitClaim: (claimData: Omit<ProviderClaim, 'id' | 'claimNumber' | 'createdAt' | 'status'>) => ProviderClaim;
  adjudicateClaim: (claimId: string, status: 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED', approvedAmount: number, notes: string) => void;
  deleteClaim: (claimId: string) => Promise<void>;
  createSettlementBatch: (facilityId: string, period: string) => FacilitySettlement;
  markSettlementPaid: (settlementId: string, reference: string) => void;
  deleteSettlement: (settlementId: string) => Promise<void>;
  addFacility: (facilityData: Omit<Facility, 'id' | 'createdAt'>) => Facility;
  updateFacility: (facility: Facility) => Promise<void>;
  deleteFacility: (facilityId: string) => Promise<void>;

  // Reception View Permissions & Configuration
  receptionPermissions: ReceptionViewPermissions;
  updateReceptionPermissions: (perms: Partial<ReceptionViewPermissions>) => void;

  // Demographic Update with explicit audit logging
  updatePatientDemographics: (
    patientId: string,
    updates: {
      phone?: string;
      address?: string;
      emergencyContact?: { name: string; relationship: string; phone: string };
      nextOfKin?: { name: string; relationship: string; phone: string };
      nationalId?: string;
    },
    reason: string
  ) => Promise<void>;

  // Global Lookup
  findCardOrPatient: (query: string) => {
    patient?: Patient;
    card?: Card;
    membership?: Membership;
    chronicMembership?: ChronicMembership;
    sickleCellProfile?: SickleCellProfile;
    patientVisits?: Visit[];
    duplicateCandidates?: Patient[];
  } | null;

  // Seed prompt demo data helper
  seedDemonstrationData: () => Promise<void>;

  // Reset / Clear database helper
  clearAllPatientData: () => Promise<void>;

  // In-app Confirmation Modal (production-safe, bypasses browser iframe suppression)
  confirmAction: (options: ConfirmDialogOptions) => void;

  // In-app Toast Notifications (replaces native alert)
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Connectivity & Auth
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Active User session
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => ({
    uid: 'usr-admin-01',
    email: 'nakkumary737@gmail.com',
    displayName: 'Mary Nakku',
    role: 'super_admin',
    facilityId: 'fac-afya-central',
    facilityName: 'Afya Medicare – Central Clinic',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  }));

  // Master Collections
  const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [packages, setPackages] = useState<HealthcarePackage[]>(initialPackages);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [chronicPrograms, setChronicPrograms] = useState<ChronicProgram[]>(initialChronicPrograms);
  const [chronicMemberships, setChronicMemberships] = useState<ChronicMembership[]>([]);
  const [sickleCellProfiles, setSickleCellProfiles] = useState<SickleCellProfile[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [authorizations, setAuthorizations] = useState<ServiceAuthorization[]>([]);
  const [claims, setClaims] = useState<ProviderClaim[]>([]);
  const [settlements, setSettlements] = useState<FacilitySettlement[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Reception View Configuration (Admin configurable permissions)
  const [receptionPermissions, setReceptionPermissions] = useState<ReceptionViewPermissions>(() => {
    try {
      const saved = localStorage.getItem('afya_reception_perms');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      showBasicDiagnosis: true,
      showMedicationSummary: true,
      showFollowUpDates: true,
      showPackageBenefits: true,
      showTriageVitals: true,
      allowDemographicEdit: true,
      allowVisitReversal: false
    };
  });

  const updateReceptionPermissions = (perms: Partial<ReceptionViewPermissions>) => {
    setReceptionPermissions(prev => {
      const updated = { ...prev, ...perms };
      try {
        localStorage.setItem('afya_reception_perms', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // In-app modal confirmation and toast notification states
  const [confirmModalOptions, setConfirmModalOptions] = useState<ConfirmDialogOptions | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const confirmAction = useCallback((options: ConfirmDialogOptions) => {
    setConfirmModalOptions(options);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Clean old sample data from localStorage if present
  useEffect(() => {
    try {
      const keysToClean = [
        'afya_health_network_patients',
        'afya_health_network_cards',
        'afya_health_network_visits',
        'afya_health_network_payments',
        'afya_health_network_receipts',
        'afya_health_network_memberships',
        'afya_health_network_chronicMemberships',
        'afya_health_network_sickleCellProfiles',
        'afya_health_network_claims',
        'afya_health_network_authorizations'
      ];
      keysToClean.forEach(k => {
        const val = localStorage.getItem(k);
        if (val && val.includes('Nakato')) {
          localStorage.removeItem(k);
        }
      });
    } catch {}
  }, []);

  // Initialize and attach real-time Firestore listeners
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    async function initFirestore() {
      const connected = await testFirebaseConnection();
      setIsFirebaseConnected(connected);

      if (connected) {
        await initializeCoreMasterDataIfNeeded();
      }

      // Attach real-time Firestore listeners
      unsubs = [
        subscribeToCollection<Facility>('facilities', data => { if (data.length > 0) setFacilities(data); }),
        subscribeToCollection<HealthcarePackage>('packages', data => { if (data.length > 0) setPackages(data); }),
        subscribeToCollection<ChronicProgram>('chronicPrograms', data => { if (data.length > 0) setChronicPrograms(data); }),
        subscribeToCollection<Patient>('patients', data => setPatients(data)),
        subscribeToCollection<Card>('cards', data => setCards(data)),
        subscribeToCollection<Membership>('memberships', data => setMemberships(data)),
        subscribeToCollection<FamilyMember>('familyMembers', data => setFamilyMembers(data)),
        subscribeToCollection<ChronicMembership>('chronicMemberships', data => setChronicMemberships(data)),
        subscribeToCollection<SickleCellProfile>('sickleCellProfiles', data => setSickleCellProfiles(data)),
        subscribeToCollection<Visit>('visits', data => setVisits(data)),
        subscribeToCollection<Payment>('payments', data => setPayments(data)),
        subscribeToCollection<Receipt>('receipts', data => setReceipts(data)),
        subscribeToCollection<ServiceAuthorization>('authorizations', data => setAuthorizations(data)),
        subscribeToCollection<ProviderClaim>('claims', data => setClaims(data)),
        subscribeToCollection<FacilitySettlement>('settlements', data => setSettlements(data)),
        subscribeToCollection<InventoryItem>('inventory', data => { if (data.length > 0) setInventoryItems(data); }),
        subscribeToCollection<AuditLog>('auditLogs', data => { if (data.length > 0) setAuditLogs(data); })
      ];
    }

    initFirestore();

    // Listen to Firebase Auth state
    const authUnsub = onAuthStateChanged(auth, user => {
      setFirebaseUser(user);
      if (user) {
        setIsFirebaseConnected(true);
        const isSuperAdminEmail = user.email === 'nakkumary737@gmail.com';
        setCurrentUser(prev => ({
          ...prev,
          uid: user.uid,
          email: user.email || prev.email,
          displayName: user.displayName || prev.displayName,
          role: isSuperAdminEmail ? 'super_admin' : prev.role
        }));
      }
    });

    return () => {
      unsubs.forEach(fn => fn());
      authUnsub();
    };
  }, []);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleOnlineStatus = () => setIsOnline(prev => !prev);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setFirebaseUser(result.user);
        setIsFirebaseConnected(true);
      }
    } catch (err: any) {
      console.warn('Google Sign-In notice:', err?.message || err);
      showToast('Google authentication notice: ' + (err?.message || 'Please check popup settings.'), 'error');
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const currentFacility = facilities.find(f => f.id === currentUser.facilityId) || facilities[0];

  const addAuditLog = useCallback(async (action: string, entityType: string, entityId: string, oldValue?: string, newValue?: string, notes?: string) => {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser.uid,
      userName: `${currentUser.displayName} (${currentUser.role})`,
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString()
    };
    if (oldValue !== undefined && oldValue !== null && oldValue !== '') {
      log.oldValue = String(oldValue);
    }
    if (newValue !== undefined && newValue !== null && newValue !== '') {
      log.newValue = String(newValue);
    }
    if (notes !== undefined && notes !== null && notes !== '') {
      log.notes = String(notes);
    }
    setAuditLogs(prev => [log, ...prev]);
    await saveFirestoreDoc('auditLogs', log.id, log);
  }, [currentUser]);

  // Switch role for test or access control
  const switchUserRole = (role: UserRole, facilityId?: string) => {
    const targetFacility = facilities.find(f => f.id === facilityId) ||
      (role.startsWith('partner_') ? facilities[1] : facilities[0]);

    const roleNames: Record<UserRole, string> = {
      super_admin: 'Mary Nakku (Super Admin)',
      afya_admin: 'Dr. Joseph Ssemwanga (Afya Administrator)',
      reception: 'Mary Nakku (Reception Desk)',
      cashier: 'Patrick Ochieng (Cashier Desk)',
      doctor: 'Dr. Sarah Nabatanzi (Medical Officer)',
      nurse: 'Sr. Beatrice Namukasa (Triage Nurse)',
      pharmacy: 'Grace Nambi (Chief Pharmacist)',
      laboratory: 'David Opolot (Lab Technologist)',
      partner_admin: `Dr. Charles Mugerwa (${targetFacility.name})`,
      partner_provider: `Partner Provider (${targetFacility.name})`,
      auditor: 'Alex Mukisa (System Auditor)'
    };

    setCurrentUser({
      uid: `usr-${role}-${Date.now().toString().slice(-4)}`,
      email: role === 'super_admin' ? 'nakkumary737@gmail.com' : `${role}@afyamedicare.ug`,
      displayName: roleNames[role],
      role,
      facilityId: targetFacility.id,
      facilityName: targetFacility.name,
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z'
    });

    addAuditLog('ROLE_SWITCH', 'UserSession', role, undefined, `Switched to role ${role} at ${targetFacility.name}`);
  };

  // Duplicate patient search
  const checkPatientDuplicates = (name: string, phone: string, dob?: string): Patient[] => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanName = name.trim().toLowerCase();

    return patients.filter(p => {
      const pCleanPhone = p.phone.replace(/[^0-9]/g, '');
      const pCleanName = p.fullName.trim().toLowerCase();

      if (cleanPhone && pCleanPhone && (cleanPhone.includes(pCleanPhone) || pCleanPhone.includes(cleanPhone))) {
        return true;
      }
      if (cleanName && pCleanName === cleanName) {
        return true;
      }
      if (dob && p.dob === dob && (cleanName.includes(pCleanName) || pCleanName.includes(cleanName))) {
        return true;
      }
      return false;
    });
  };

  // Register real patient directly to Firestore
  const registerPatient = (
    patientData: Omit<Patient, 'id' | 'memberId' | 'registrationDate' | 'createdAt'>,
    packageId?: string,
    chronicProgramId?: string,
    isSickleCell?: boolean
  ) => {
    const nextNum = patients.length + 1;
    const memberId = `AFY-${String(nextNum).padStart(6, '0')}`;
    const patientId = `pat-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const newPatient: Patient = {
      ...patientData,
      id: patientId,
      memberId,
      registrationDate: now.split('T')[0],
      createdAt: now
    };

    let cardType: CardType = 'HEALTH_PACKAGE';
    if (isSickleCell) cardType = 'SICKLE_CELL';
    else if (chronicProgramId) cardType = 'CHRONIC_CARE';

    const randomCardSuffix = Math.floor(100000 + Math.random() * 900000);
    const cardNumber = `AFY-CRD-${randomCardSuffix}`;
    const qrIdentifier = `AFY-QR-${cardType.slice(0, 2)}-${randomCardSuffix}`;

    const newCard: Card = {
      id: `crd-${Date.now().toString().slice(-6)}`,
      cardNumber,
      patientId: newPatient.id,
      cardType,
      qrIdentifier,
      nfcIdentifier: `NFC-UG-${Math.floor(1000000 + Math.random() * 9000000)}`,
      issueDate: now.split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE',
      createdAt: now
    };

    // Update local state immediately
    setPatients(prev => [newPatient, ...prev]);
    setCards(prev => [newCard, ...prev]);

    // Save to Firestore in real-time
    saveFirestoreDoc('patients', newPatient.id, newPatient);
    saveFirestoreDoc('cards', newCard.id, newCard);

    if (packageId) {
      const selectedPkg = packages.find(p => p.id === packageId);
      if (selectedPkg) {
        const memId = `mem-${Date.now().toString().slice(-6)}`;
        const expiry = new Date(Date.now() + selectedPkg.validityDays * 24 * 60 * 60 * 1000).toISOString();
        const newMem: Membership = {
          id: memId,
          patientId: newPatient.id,
          packageId: selectedPkg.id,
          packageName: selectedPkg.name,
          startDate: now.split('T')[0],
          expiryDate: expiry,
          visitsPurchased: selectedPkg.visitsPurchased,
          visitsUsed: 0,
          visitsRemaining: selectedPkg.visitsPurchased,
          status: 'ACTIVE',
          isFamilyPackage: selectedPkg.packageType.startsWith('FAMILY_'),
          familyAllocationModel: selectedPkg.familyRules.allocationModel,
          primaryMemberId: newPatient.id,
          createdAt: now
        };
        setMemberships(prev => [newMem, ...prev]);
        saveFirestoreDoc('memberships', newMem.id, newMem);
      }
    }

    if (chronicProgramId) {
      const prog = chronicPrograms.find(p => p.id === chronicProgramId);
      if (prog) {
        const chrId = `chr-${Date.now().toString().slice(-6)}`;
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentMonthYear = `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;

        const newChr: ChronicMembership = {
          id: chrId,
          patientId: newPatient.id,
          programId: prog.id,
          programName: prog.name,
          condition: prog.condition,
          status: 'ACTIVE',
          currentPaidMonth: currentMonthYear,
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          nextReviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          currentMedications: ['Prescription pending clinical consultation'],
          consultationHistory: [],
          medicationPickups: [],
          notes: 'Newly enrolled chronic patient.',
          createdAt: now
        };
        setChronicMemberships(prev => [newChr, ...prev]);
        saveFirestoreDoc('chronicMemberships', newChr.id, newChr);
      }
    }

    if (isSickleCell) {
      const scProfile: SickleCellProfile = {
        id: `sc-${Date.now().toString().slice(-6)}`,
        patientId: newPatient.id,
        genotype: 'HbSS',
        bloodGroup: 'O+',
        allergies: ['Penicillin Allergy'],
        baselineWeightKg: 40,
        currentMedications: ['Folic Acid 5mg OD', 'Hydroxyurea pending clinician evaluation'],
        carePlan: 'High hydration goal (>2.5L/day), malaria prevention, fever vigilance.',
        clinicalAlerts: ['Registered Sickle Cell Program Patient', 'High risk of vaso-occlusive crisis'],
        lastReviewDate: now.split('T')[0],
        nextReviewDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        emergencyProtocol: 'CRISIS TRIAGE: 1. Warmth; 2. IV 0.9% Normal Saline; 3. Urgent analgesia; 4. CBC check. No payment gate before relief.',
        emergencyContact: {
          name: newPatient.emergencyContact.name,
          phone: newPatient.emergencyContact.phone,
          relation: newPatient.emergencyContact.relationship
        },
        referralCenter: 'Mulago Hospital Sickle Cell Unit',
        consultationHistory: [],
        createdAt: now
      };
      setSickleCellProfiles(prev => [scProfile, ...prev]);
      saveFirestoreDoc('sickleCellProfiles', scProfile.id, scProfile);
    }

    addAuditLog('REGISTER_PATIENT', 'Patient', newPatient.id, undefined, `Registered ${newPatient.fullName} (${memberId}) with ${cardType} card.`);

    return { patient: newPatient, card: newCard };
  };

  // Update existing patient
  const updatePatient = async (
    patientId: string,
    updatedData: Partial<Omit<Patient, 'id' | 'memberId' | 'registrationDate' | 'createdAt'>>
  ): Promise<void> => {
    const existing = patients.find(p => p.id === patientId);
    if (!existing) throw new Error('Patient not found');

    const updated: Patient = {
      ...existing,
      ...updatedData
    };

    setPatients(prev => prev.map(p => (p.id === patientId ? updated : p)));
    await saveFirestoreDoc('patients', patientId, updated);
    addAuditLog('PATIENT_UPDATED', 'Patient', patientId, existing.fullName, updated.fullName, 'Updated patient demographic/clinical record');
  };

  // Dedicated Reception Demographic Update with Detailed Audit Record
  const updatePatientDemographics = async (
    patientId: string,
    updates: {
      phone?: string;
      address?: string;
      emergencyContact?: { name: string; relationship: string; phone: string };
      nextOfKin?: { name: string; relationship: string; phone: string };
      nationalId?: string;
    },
    reason: string
  ): Promise<void> => {
    const existing = patients.find(p => p.id === patientId);
    if (!existing) throw new Error('Patient not found');

    const updated: Patient = {
      ...existing,
      ...updates
    };

    setPatients(prev => prev.map(p => (p.id === patientId ? updated : p)));
    await saveFirestoreDoc('patients', patientId, updated);

    const changes: string[] = [];
    if (updates.phone && updates.phone !== existing.phone) {
      changes.push(`Phone: "${existing.phone}" → "${updates.phone}"`);
    }
    if (updates.address && updates.address !== existing.address) {
      changes.push(`Address: "${existing.address}" → "${updates.address}"`);
    }
    if (updates.emergencyContact) {
      changes.push(`Emergency Contact: "${updates.emergencyContact.name} (${updates.emergencyContact.phone})"`);
    }
    if (updates.nextOfKin) {
      changes.push(`Next of Kin: "${updates.nextOfKin.name} (${updates.nextOfKin.phone})"`);
    }
    if (updates.nationalId && updates.nationalId !== existing.nationalId) {
      changes.push(`National ID: "${updates.nationalId}"`);
    }

    addAuditLog(
      'DEMOGRAPHIC_UPDATE',
      'Patient',
      patientId,
      existing.phone,
      updates.phone || existing.phone,
      `Reception demographic update by ${currentUser.displayName}. Reason: ${reason}. Updates: ${changes.join(', ') || 'Contact details updated'}`
    );
  };

  // Delete patient and linked credentials
  const deletePatient = async (patientId: string): Promise<void> => {
    const existing = patients.find(p => p.id === patientId);
    if (!existing) return;

    // Immediately remove from local state
    setPatients(prev => prev.filter(p => p.id !== patientId));
    const associatedCards = cards.filter(c => c.patientId === patientId);
    setCards(prev => prev.filter(c => c.patientId !== patientId));
    setMemberships(prev => prev.filter(m => m.patientId !== patientId));
    setChronicMemberships(prev => prev.filter(c => c.patientId !== patientId));
    setSickleCellProfiles(prev => prev.filter(s => s.patientId !== patientId));

    // Delete in Firestore
    await deleteFirestoreDoc('patients', patientId);
    for (const card of associatedCards) {
      await deleteFirestoreDoc('cards', card.id);
    }
    const mems = memberships.filter(m => m.patientId === patientId);
    for (const m of mems) {
      await deleteFirestoreDoc('memberships', m.id);
    }
    const cMems = chronicMemberships.filter(c => c.patientId === patientId);
    for (const c of cMems) {
      await deleteFirestoreDoc('chronicMemberships', c.id);
    }
    const scs = sickleCellProfiles.filter(s => s.patientId === patientId);
    for (const s of scs) {
      await deleteFirestoreDoc('sickleCellProfiles', s.id);
    }

    addAuditLog('PATIENT_DELETED', 'Patient', patientId, existing.fullName, undefined, `Deleted patient account ${existing.memberId} (${existing.fullName})`);
  };

  // Issue card
  const issueNewCard = (patientId: string, cardType: CardType): Card => {
    const randomCardSuffix = Math.floor(100000 + Math.random() * 900000);
    const cardNumber = `AFY-CRD-${randomCardSuffix}`;
    const qrIdentifier = `AFY-QR-${cardType.slice(0, 2)}-${randomCardSuffix}`;
    const now = new Date().toISOString();

    const newCard: Card = {
      id: `crd-${Date.now().toString().slice(-6)}`,
      cardNumber,
      patientId,
      cardType,
      qrIdentifier,
      nfcIdentifier: `NFC-UG-${Math.floor(1000000 + Math.random() * 9000000)}`,
      issueDate: now.split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE',
      createdAt: now
    };

    setCards(prev => [newCard, ...prev]);
    saveFirestoreDoc('cards', newCard.id, newCard);
    addAuditLog('ISSUE_CARD', 'Card', newCard.id, undefined, `Issued new ${cardType} card ${cardNumber} to patient ${patientId}`);
    return newCard;
  };

  // Block card
  const blockCard = (cardId: string, reason: string, status: 'BLOCKED' | 'LOST' | 'STOLEN' = 'BLOCKED') => {
    setCards(prev =>
      prev.map(c => {
        if (c.id === cardId) {
          const updated = { ...c, status, replacementReason: reason };
          saveFirestoreDoc('cards', c.id, updated);
          addAuditLog('BLOCK_CARD', 'Card', c.id, c.status, status, `Card ${c.cardNumber} marked ${status}: ${reason}`);
          return updated;
        }
        return c;
      })
    );
  };

  // Unblock / Reactivate card
  const unblockCard = (cardId: string) => {
    setCards(prev =>
      prev.map(c => {
        if (c.id === cardId) {
          const updated = { ...c, status: 'ACTIVE' as CardStatus, replacementReason: undefined };
          saveFirestoreDoc('cards', c.id, updated);
          addAuditLog('UNBLOCK_CARD', 'Card', c.id, c.status, 'ACTIVE', `Card ${c.cardNumber} reactivated to ACTIVE status.`);
          return updated;
        }
        return c;
      })
    );
  };

  // Delete card permanently
  const deleteCard = async (cardId: string): Promise<void> => {
    const existing = cards.find(c => c.id === cardId);
    setCards(prev => prev.filter(c => c.id !== cardId));
    await deleteFirestoreDoc('cards', cardId);
    if (existing) {
      addAuditLog('DELETE_CARD', 'Card', cardId, existing.cardNumber, undefined, `Deleted card ${existing.cardNumber} permanently from system.`);
    }
  };

  // Replace lost/stolen card without losing patient history
  const replaceCard = (oldCardId: string, reason: string): Card => {
    const oldCard = cards.find(c => c.id === oldCardId);
    if (!oldCard) throw new Error('Card not found');

    const updatedOld = { ...oldCard, status: 'REPLACED' as CardStatus, replacementReason: reason };
    saveFirestoreDoc('cards', oldCard.id, updatedOld);

    const randomCardSuffix = Math.floor(100000 + Math.random() * 900000);
    const newCardNumber = `AFY-CRD-${randomCardSuffix}`;
    const newQrIdentifier = `AFY-QR-${oldCard.cardType.slice(0, 2)}-${randomCardSuffix}`;
    const now = new Date().toISOString();

    const newCard: Card = {
      id: `crd-${Date.now().toString().slice(-6)}`,
      cardNumber: newCardNumber,
      patientId: oldCard.patientId,
      cardType: oldCard.cardType,
      qrIdentifier: newQrIdentifier,
      nfcIdentifier: `NFC-UG-${Math.floor(1000000 + Math.random() * 9000000)}`,
      issueDate: now.split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE',
      replacedCardId: oldCard.id,
      replacementReason: `Replacement for ${oldCard.cardNumber}: ${reason}`,
      createdAt: now
    };

    setCards(prev => [newCard, ...prev.map(c => (c.id === oldCardId ? updatedOld : c))]);
    saveFirestoreDoc('cards', newCard.id, newCard);

    addAuditLog(
      'REPLACE_CARD',
      'Card',
      newCard.id,
      oldCard.cardNumber,
      newCardNumber,
      `Card ${oldCard.cardNumber} replaced with ${newCardNumber} for patient ${oldCard.patientId}. Old card deactivated.`
    );

    return newCard;
  };

  // Report card as lost or stolen
  const reportCardLost = async (cardId: string, notes: string): Promise<void> => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const now = new Date().toISOString();
    const updated: Card = {
      ...card,
      status: 'LOST',
      reportedLostAt: now,
      reportedLostNotes: notes,
      replacementReason: notes
    };
    setCards(prev => prev.map(c => (c.id === cardId ? updated : c)));
    await saveFirestoreDoc('cards', cardId, updated);
    addAuditLog('REPORT_CARD_LOST', 'Card', cardId, card.status, 'LOST', `Card ${card.cardNumber} reported LOST/STOLEN: ${notes}`);
  };

  // Deactivate / suspend card
  const deactivateCard = async (cardId: string, reason: string): Promise<void> => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const updated: Card = {
      ...card,
      status: 'BLOCKED',
      deactivationReason: reason
    };
    setCards(prev => prev.map(c => (c.id === cardId ? updated : c)));
    await saveFirestoreDoc('cards', cardId, updated);
    addAuditLog('DEACTIVATE_CARD', 'Card', cardId, card.status, 'BLOCKED', `Card ${card.cardNumber} deactivated: ${reason}`);
  };

  // Reactivate / Unblock card
  const reactivateCard = async (cardId: string): Promise<void> => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const updated: Card = {
      ...card,
      status: 'ACTIVE',
      deactivationReason: undefined,
      replacementReason: undefined
    };
    setCards(prev => prev.map(c => (c.id === cardId ? updated : c)));
    await saveFirestoreDoc('cards', cardId, updated);
    addAuditLog('REACTIVATE_CARD', 'Card', cardId, card.status, 'ACTIVE', `Card ${card.cardNumber} reactivated to ACTIVE status.`);
  };

  // Save / Update Package (Admin Configurable)
  const savePackage = (pkg: HealthcarePackage) => {
    setPackages(prev => {
      const exists = prev.some(p => p.id === pkg.id);
      saveFirestoreDoc('packages', pkg.id, pkg);
      if (exists) {
        addAuditLog('UPDATE_PACKAGE', 'Package', pkg.id, undefined, `Updated package "${pkg.name}" (Price: UGX ${pkg.price.toLocaleString()}, Visits: ${pkg.visitsPurchased})`);
        return prev.map(p => (p.id === pkg.id ? pkg : p));
      } else {
        addAuditLog('CREATE_PACKAGE', 'Package', pkg.id, undefined, `Created new package "${pkg.name}"`);
        return [pkg, ...prev];
      }
    });
  };

  const deletePackage = async (packageId: string): Promise<void> => {
    const existing = packages.find(p => p.id === packageId);
    setPackages(prev => prev.filter(p => p.id !== packageId));
    await deleteFirestoreDoc('packages', packageId);
    if (existing) {
      addAuditLog('DELETE_PACKAGE', 'Package', packageId, existing.name, undefined, `Deleted package "${existing.name}"`);
    }
  };

  const saveChronicProgram = (prog: ChronicProgram) => {
    setChronicPrograms(prev => {
      const exists = prev.some(p => p.id === prog.id);
      saveFirestoreDoc('chronicPrograms', prog.id, prog);
      if (exists) {
        addAuditLog('UPDATE_CHRONIC_PROGRAM', 'ChronicProgram', prog.id, undefined, `Updated program ${prog.name}`);
        return prev.map(p => (p.id === prog.id ? prog : p));
      } else {
        addAuditLog('CREATE_CHRONIC_PROGRAM', 'ChronicProgram', prog.id, undefined, `Created program ${prog.name}`);
        return [prog, ...prev];
      }
    });
  };

  const deleteChronicProgram = async (programId: string): Promise<void> => {
    const existing = chronicPrograms.find(p => p.id === programId);
    setChronicPrograms(prev => prev.filter(p => p.id !== programId));
    await deleteFirestoreDoc('chronicPrograms', programId);
    if (existing) {
      addAuditLog('DELETE_CHRONIC_PROGRAM', 'ChronicProgram', programId, existing.name, undefined, `Deleted chronic program "${existing.name}"`);
    }
  };

  // Record Visit & Deduct entitlement automatically
  const recordVisit = (visitData: Omit<Visit, 'id' | 'createdAt' | 'status'>) => {
    const visitId = `vis-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const patientVisits = visits.filter(v => v.patientId === visitData.patientId);
    const visitNumber = visitData.visitNumber || (patientVisits.length + 1);
    const visitSequence = visitData.visitSequence || `Visit ${String(visitNumber).padStart(3, '0')}`;
    const todayDateStr = now.split('T')[0];
    const todayVisits = visits.filter(v => v.createdAt.startsWith(todayDateStr));
    const queueNumber = visitData.queueNumber || `Q-${String(todayVisits.length + 1).padStart(3, '0')}`;

    const newVisit: Visit = {
      ...visitData,
      id: visitId,
      visitNumber,
      visitSequence,
      queueNumber,
      receptionStaff: visitData.receptionStaff || currentUser.displayName,
      facilityId: visitData.facilityId || currentFacility.id,
      facilityName: visitData.facilityName || currentFacility.name,
      status: 'COMPLETED',
      createdAt: now
    };

    setVisits(prev => [newVisit, ...prev]);
    saveFirestoreDoc('visits', newVisit.id, newVisit);

    let updatedMembership: Membership | undefined;

    if (visitData.visitDeducted && visitData.packageId) {
      setMemberships(prev =>
        prev.map(m => {
          if (m.packageId === visitData.packageId && m.patientId === visitData.patientId) {
            const newVisitsUsed = m.visitsUsed + 1;
            const newVisitsRemaining = Math.max(0, m.visitsPurchased - newVisitsUsed);
            updatedMembership = {
              ...m,
              visitsUsed: newVisitsUsed,
              visitsRemaining: newVisitsRemaining
            };
            saveFirestoreDoc('memberships', m.id, updatedMembership);
            addAuditLog(
              'VISIT_DEDUCTED',
              'Membership',
              m.id,
              `Remaining: ${m.visitsRemaining}`,
              `Remaining: ${newVisitsRemaining}`,
              `Deducted 1 visit for ${visitData.serviceName} at ${visitData.facilityName}`
            );
            return updatedMembership;
          }
          return m;
        })
      );
    }

    addAuditLog('RECORD_VISIT', 'Visit', visitId, undefined, `Logged visit for ${visitData.patientName}: ${visitData.serviceName}`);

    return { visit: newVisit, updatedMembership };
  };

  // Reverse visit & restore visit count
  const reverseVisit = (visitId: string, reason: string) => {
    const visit = visits.find(v => v.id === visitId);
    if (!visit) throw new Error('Visit not found');
    if (visit.status === 'REVERSED') throw new Error('Visit already reversed');

    const now = new Date().toISOString();
    const updatedVisit: Visit = {
      ...visit,
      status: 'REVERSED' as const,
      reversalReason: reason,
      reversedBy: currentUser.displayName,
      reversedAt: now
    };

    setVisits(prev => prev.map(v => (v.id === visitId ? updatedVisit : v)));
    saveFirestoreDoc('visits', visitId, updatedVisit);

    if (visit.visitDeducted && visit.packageId) {
      setMemberships(prev =>
        prev.map(m => {
          if (m.packageId === visit.packageId && m.patientId === visit.patientId) {
            const restoredUsed = Math.max(0, m.visitsUsed - 1);
            const restoredRemaining = m.visitsPurchased - restoredUsed;
            const updatedMem: Membership = {
              ...m,
              visitsUsed: restoredUsed,
              visitsRemaining: restoredRemaining
            };
            saveFirestoreDoc('memberships', m.id, updatedMem);
            addAuditLog(
              'VISIT_REVERSED_RESTORED',
              'Membership',
              m.id,
              `Remaining: ${m.visitsRemaining}`,
              `Remaining: ${restoredRemaining}`,
              `Restored 1 visit due to reversal: ${reason}`
            );
            return updatedMem;
          }
          return m;
        })
      );
    }

    addAuditLog('REVERSE_VISIT', 'Visit', visitId, 'COMPLETED', 'REVERSED', `Reversed by ${currentUser.displayName}: ${reason}`);
  };

  // Delete visit record permanently
  const deleteVisit = async (visitId: string): Promise<void> => {
    const visit = visits.find(v => v.id === visitId);
    if (!visit) return;

    // If visit had deducted a visit and was not reversed, restore it
    if (visit.status !== 'REVERSED' && visit.visitDeducted && visit.packageId) {
      setMemberships(prev =>
        prev.map(m => {
          if (m.packageId === visit.packageId && m.patientId === visit.patientId) {
            const restoredUsed = Math.max(0, m.visitsUsed - 1);
            const restoredRemaining = m.visitsPurchased - restoredUsed;
            const updatedMem: Membership = {
              ...m,
              visitsUsed: restoredUsed,
              visitsRemaining: restoredRemaining
            };
            saveFirestoreDoc('memberships', m.id, updatedMem);
            return updatedMem;
          }
          return m;
        })
      );
    }

    setVisits(prev => prev.filter(v => v.id !== visitId));
    await deleteFirestoreDoc('visits', visitId);
    addAuditLog('DELETE_VISIT', 'Visit', visitId, visit.serviceName, undefined, `Deleted visit record for ${visit.patientName} (${visit.serviceName})`);
  };

  // Payments & Receipts
  const recordPayment = (paymentData: {
    patientId: string;
    membershipId?: string;
    chronicMembershipId?: string;
    itemDescription: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
  }) => {
    const paymentId = `pay-${Date.now().toString().slice(-6)}`;
    const receiptNum = `AFY-RCP-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const patient = patients.find(p => p.id === paymentData.patientId);

    const newPayment: Payment = {
      id: paymentId,
      receiptNumber: receiptNum,
      patientId: paymentData.patientId,
      patientName: patient ? patient.fullName : 'Afya Member',
      membershipId: paymentData.membershipId,
      chronicMembershipId: paymentData.chronicMembershipId,
      itemDescription: paymentData.itemDescription,
      amount: paymentData.amount,
      currency: 'UGX',
      paymentMethod: paymentData.paymentMethod,
      referenceNumber: paymentData.referenceNumber,
      staffId: currentUser.uid,
      staffName: currentUser.displayName,
      status: 'PAID',
      createdAt: now
    };

    const newReceipt: Receipt = {
      id: `rcp-${Date.now().toString().slice(-6)}`,
      receiptNumber: receiptNum,
      paymentId: paymentId,
      patientId: paymentData.patientId,
      patientName: patient ? patient.fullName : 'Afya Member',
      memberId: patient ? patient.memberId : 'AFY-MEMBER',
      amount: paymentData.amount,
      currency: 'UGX',
      paymentMethod: paymentData.paymentMethod,
      description: paymentData.itemDescription,
      packageOrProgram: paymentData.itemDescription,
      staffName: currentUser.displayName,
      facilityName: currentFacility.name,
      facilityLocation: currentFacility.location,
      createdAt: now
    };

    setPayments(prev => [newPayment, ...prev]);
    setReceipts(prev => [newReceipt, ...prev]);

    saveFirestoreDoc('payments', newPayment.id, newPayment);
    saveFirestoreDoc('receipts', newReceipt.id, newReceipt);

    if (paymentData.membershipId) {
      setMemberships(prev =>
        prev.map(m => {
          if (m.id === paymentData.membershipId) {
            const updated = { ...m, status: 'ACTIVE' as const };
            saveFirestoreDoc('memberships', m.id, updated);
            return updated;
          }
          return m;
        })
      );
    }

    addAuditLog('RECORD_PAYMENT', 'Payment', paymentId, undefined, `Received UGX ${paymentData.amount.toLocaleString()} via ${paymentData.paymentMethod} (Ref: ${paymentData.referenceNumber})`);

    return { payment: newPayment, receipt: newReceipt };
  };

  // Delete payment record and associated receipt
  const deletePayment = async (paymentId: string): Promise<void> => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    const receipt = receipts.find(r => r.paymentId === paymentId || r.receiptNumber === payment.receiptNumber);

    setPayments(prev => prev.filter(p => p.id !== paymentId));
    if (receipt) {
      setReceipts(prev => prev.filter(r => r.id !== receipt.id));
      await deleteFirestoreDoc('receipts', receipt.id);
    }
    await deleteFirestoreDoc('payments', paymentId);
    addAuditLog('DELETE_PAYMENT', 'Payment', paymentId, payment.receiptNumber, undefined, `Deleted payment ${payment.receiptNumber} (UGX ${payment.amount})`);
  };

  // Issue Itemized Receipt from Inventory Billing
  const issueItemizedReceipt = (receiptData: {
    patientId: string;
    patientName: string;
    memberId: string;
    cardNumber?: string;
    visitId?: string;
    visitSequence?: string;
    queueNumber?: string;
    lineItems: ReceiptLineItem[];
    subtotal: number;
    packageDeductionValue: number;
    totalPayable: number;
    amountPaid: number;
    change: number;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
    notes?: string;
  }): Receipt => {
    const receiptId = `rcp-${Date.now().toString().slice(-6)}`;
    const receiptNum = `AFY-RCP-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(4, '0')}`;
    const paymentId = `pay-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    // Create payment ledger record for the cash/copay payable portion
    if (receiptData.totalPayable > 0) {
      const newPayment: Payment = {
        id: paymentId,
        receiptNumber: receiptNum,
        patientId: receiptData.patientId,
        patientName: receiptData.patientName,
        itemDescription: receiptData.lineItems.map(i => `${i.itemName} (x${i.quantity})`).join(', ').slice(0, 150),
        amount: receiptData.totalPayable,
        currency: 'UGX',
        paymentMethod: receiptData.paymentMethod,
        referenceNumber: receiptData.paymentReference || `POS-${Math.floor(100000 + Math.random() * 900000)}`,
        staffId: currentUser.uid,
        staffName: currentUser.displayName,
        status: 'PAID',
        createdAt: now
      };
      setPayments(prev => [newPayment, ...prev]);
      saveFirestoreDoc('payments', newPayment.id, newPayment);
    }

    // Deduct inventory quantities for pharmacy/lab items where applicable
    setInventoryItems(prev =>
      prev.map(item => {
        const line = receiptData.lineItems.find(l => l.itemId === item.id);
        if (line && typeof item.stockQuantity === 'number' && item.stockQuantity > 0) {
          const updatedStock = Math.max(0, item.stockQuantity - line.quantity);
          const updatedItem = { ...item, stockQuantity: updatedStock };
          saveFirestoreDoc('inventory', item.id, updatedItem);
          return updatedItem;
        }
        return item;
      })
    );

    const newReceipt: Receipt = {
      id: receiptId,
      receiptNumber: receiptNum,
      ...(receiptData.totalPayable > 0 ? { paymentId } : {}),
      ...(receiptData.visitId ? { visitId: receiptData.visitId } : {}),
      ...(receiptData.visitSequence ? { visitSequence: receiptData.visitSequence } : {}),
      ...(receiptData.queueNumber ? { queueNumber: receiptData.queueNumber } : {}),
      patientId: receiptData.patientId,
      patientName: receiptData.patientName,
      memberId: receiptData.memberId,
      ...(receiptData.cardNumber ? { cardNumber: receiptData.cardNumber } : {}),
      amount: receiptData.totalPayable,
      currency: 'UGX',
      paymentMethod: receiptData.paymentMethod,
      description: receiptData.lineItems.map(l => l.itemName).join(', ').slice(0, 100),
      packageOrProgram: receiptData.packageDeductionValue > 0 ? 'Afya Health Package Covered Visit' : 'Cash OPD Encounter',
      staffName: currentUser.displayName,
      facilityName: currentFacility.name,
      facilityLocation: currentFacility.location,
      lineItems: receiptData.lineItems,
      subtotal: receiptData.subtotal,
      packageDeductionValue: receiptData.packageDeductionValue,
      totalPayable: receiptData.totalPayable,
      amountPaid: receiptData.amountPaid,
      change: receiptData.change,
      ...(receiptData.paymentReference ? { paymentReference: receiptData.paymentReference } : {}),
      createdAt: now
    };

    setReceipts(prev => [newReceipt, ...prev]);
    saveFirestoreDoc('receipts', newReceipt.id, newReceipt);

    addAuditLog(
      'ISSUE_RECEIPT',
      'Receipt',
      newReceipt.id,
      undefined,
      `Issued Receipt #${receiptNum} for ${receiptData.patientName} (UGX ${receiptData.totalPayable.toLocaleString()}, ${receiptData.lineItems.length} items billed from inventory)`
    );

    return newReceipt;
  };

  // Inventory Management CRUD
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'createdAt'>): InventoryItem => {
    const id = `inv-${Date.now().toString().slice(-6)}`;
    const newItem: InventoryItem = {
      ...itemData,
      id,
      createdAt: new Date().toISOString()
    };
    setInventoryItems(prev => [newItem, ...prev]);
    saveFirestoreDoc('inventory', id, newItem);
    addAuditLog('ADD_INVENTORY', 'InventoryItem', id, undefined, undefined, `Added inventory item ${newItem.name} (${newItem.code})`);
    return newItem;
  };

  const updateInventoryItem = (item: InventoryItem) => {
    const prevItem = inventoryItems.find(i => i.id === item.id);
    setInventoryItems(prev => prev.map(i => (i.id === item.id ? item : i)));
    saveFirestoreDoc('inventory', item.id, item);
    addAuditLog('UPDATE_INVENTORY', 'InventoryItem', item.id, prevItem?.name, item.name, `Updated inventory item ${item.name}`);
  };

  const deleteInventoryItem = (itemId: string) => {
    const existing = inventoryItems.find(i => i.id === itemId);
    setInventoryItems(prev => prev.filter(i => i.id !== itemId));
    deleteFirestoreDoc('inventory', itemId);
    addAuditLog('DELETE_INVENTORY', 'InventoryItem', itemId, existing?.name || itemId, undefined, `Deleted inventory item #${itemId} (${existing?.name || ''})`);
  };

  // Chronic Care Workflows
  const enrollChronicMembership = (
    patientId: string,
    programId: string,
    conditionOrNotes?: string,
    medications?: string[]
  ): ChronicMembership => {
    const prog = chronicPrograms.find(p => p.id === programId) || chronicPrograms[0];
    const patient = patients.find(p => p.id === patientId);
    const chrId = `chr-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthYear = `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;

    const newChr: ChronicMembership = {
      id: chrId,
      patientId,
      programId: prog.id,
      programName: prog.name,
      condition: conditionOrNotes || prog.condition,
      status: 'ACTIVE',
      currentPaidMonth: currentMonthYear,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextReviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currentMedications: medications && medications.length > 0 ? medications : ['Prescription pending clinical consultation'],
      consultationHistory: [],
      medicationPickups: [],
      notes: conditionOrNotes ? `Enrolled with condition: ${conditionOrNotes}` : 'Enrolled in chronic care clinic.',
      createdAt: now
    };

    setChronicMemberships(prev => [newChr, ...prev]);
    saveFirestoreDoc('chronicMemberships', newChr.id, newChr);

    // If patient does not have a Chronic card yet, issue one
    const hasCard = cards.some(c => c.patientId === patientId && c.cardType === 'CHRONIC_CARE' && c.status === 'ACTIVE');
    if (!hasCard) {
      issueNewCard(patientId, 'CHRONIC_CARE');
    }

    addAuditLog('ENROLL_CHRONIC', 'ChronicMembership', newChr.id, undefined, `Enrolled ${patient?.fullName || patientId} in ${prog.name}`);
    return newChr;
  };

  const deleteChronicMembership = async (chronicMembershipId: string): Promise<void> => {
    const cm = chronicMemberships.find(c => c.id === chronicMembershipId);
    setChronicMemberships(prev => prev.filter(c => c.id !== chronicMembershipId));
    await deleteFirestoreDoc('chronicMemberships', chronicMembershipId);
    if (cm) {
      addAuditLog('DELETE_CHRONIC_MEMBERSHIP', 'ChronicMembership', chronicMembershipId, cm.programName, undefined, `Deleted chronic enrollment for patient ${cm.patientId}`);
    }
  };
  const renewChronicMembership = (
    chronicMembershipId: string,
    paidMonth: string,
    paymentMethod: PaymentMethod,
    referenceNumber: string
  ) => {
    const cm = chronicMemberships.find(c => c.id === chronicMembershipId);
    if (!cm) return;

    const prog = chronicPrograms.find(p => p.id === cm.programId);
    const fee = prog ? prog.monthlyFee : 45000;

    recordPayment({
      patientId: cm.patientId,
      chronicMembershipId: cm.id,
      itemDescription: `${cm.programName} Monthly Renewal (${paidMonth})`,
      amount: fee,
      paymentMethod,
      referenceNumber
    });

    const nextRenewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const updated = {
      ...cm,
      status: 'ACTIVE' as const,
      currentPaidMonth: paidMonth,
      renewalDate: nextRenewal
    };

    setChronicMemberships(prev => prev.map(c => (c.id === chronicMembershipId ? updated : c)));
    saveFirestoreDoc('chronicMemberships', chronicMembershipId, updated);

    addAuditLog('RENEW_CHRONIC_MEMBERSHIP', 'ChronicMembership', chronicMembershipId, cm.currentPaidMonth, paidMonth, `Renewed for ${paidMonth}`);
  };

  const recordMedicationPickup = (chronicMembershipId: string, itemsDispensed: string, pharmacist: string) => {
    const now = new Date().toISOString().split('T')[0];
    const cm = chronicMemberships.find(c => c.id === chronicMembershipId);
    if (!cm) return;

    const updated = {
      ...cm,
      lastPickupDate: now,
      medicationPickups: [{ date: now, pharmacist, itemsDispensed }, ...(cm.medicationPickups || [])]
    };
    setChronicMemberships(prev => prev.map(c => (c.id === chronicMembershipId ? updated : c)));
    saveFirestoreDoc('chronicMemberships', chronicMembershipId, updated);
    addAuditLog('MEDICATION_PICKUP', 'ChronicMembership', chronicMembershipId, undefined, `Dispensed: ${itemsDispensed} by ${pharmacist}`);
  };

  const recordChronicConsultation = (chronicMembershipId: string, doctor: string, bpOrVitals: string, notes: string) => {
    const now = new Date().toISOString().split('T')[0];
    const cm = chronicMemberships.find(c => c.id === chronicMembershipId);
    if (!cm) return;

    const updated = {
      ...cm,
      consultationHistory: [{ date: now, doctor, bpOrVitals, notes }, ...(cm.consultationHistory || [])]
    };
    setChronicMemberships(prev => prev.map(c => (c.id === chronicMembershipId ? updated : c)));
    saveFirestoreDoc('chronicMemberships', chronicMembershipId, updated);
    addAuditLog('CHRONIC_CONSULTATION', 'ChronicMembership', chronicMembershipId, undefined, `Consultation recorded by ${doctor}: ${bpOrVitals}`);
  };

  // Sickle Cell Care Workflows (STRICTLY CLINICAL, NO PAYMENTS)
  const registerSickleCellProfile = (
    profileData: Omit<SickleCellProfile, 'id' | 'createdAt'>
  ): SickleCellProfile => {
    const scId = `sc-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const newProfile: SickleCellProfile = {
      ...profileData,
      id: scId,
      createdAt: now
    };

    setSickleCellProfiles(prev => [newProfile, ...prev]);
    saveFirestoreDoc('sickleCellProfiles', scId, newProfile);

    // If patient does not have a sickle cell card yet, issue one
    const hasCard = cards.some(c => c.patientId === profileData.patientId && c.cardType === 'SICKLE_CELL' && c.status === 'ACTIVE');
    if (!hasCard) {
      issueNewCard(profileData.patientId, 'SICKLE_CELL');
    }

    addAuditLog('REGISTER_SICKLE_CELL', 'SickleCellProfile', scId, undefined, `Registered patient ${profileData.patientId} into sickle cell network (Genotype: ${profileData.genotype})`);
    return newProfile;
  };

  const updateSickleCellProfile = (profile: SickleCellProfile) => {
    setSickleCellProfiles(prev => prev.map(p => (p.id === profile.id ? profile : p)));
    saveFirestoreDoc('sickleCellProfiles', profile.id, profile);
    addAuditLog('UPDATE_SICKLE_CELL_PROFILE', 'SickleCellProfile', profile.id, undefined, `Updated clinical care plan for sickle cell patient ${profile.patientId}`);
  };

  const deleteSickleCellProfile = async (profileId: string): Promise<void> => {
    const sc = sickleCellProfiles.find(s => s.id === profileId);
    setSickleCellProfiles(prev => prev.filter(s => s.id !== profileId));
    await deleteFirestoreDoc('sickleCellProfiles', profileId);
    if (sc) {
      addAuditLog('DELETE_SICKLE_CELL', 'SickleCellProfile', profileId, sc.genotype, undefined, `Deleted sickle cell profile for patient ${sc.patientId}`);
    }
  };

  const recordSickleCellConsultation = (
    profileId: string,
    clinician: string,
    crisisType: string,
    vitals: string,
    treatmentGiven: string
  ) => {
    const now = new Date().toISOString().split('T')[0];
    const sc = sickleCellProfiles.find(s => s.id === profileId);
    if (!sc) return;

    const updated = {
      ...sc,
      lastReviewDate: now,
      consultationHistory: [{ date: now, clinician, crisisType, vitals, treatmentGiven }, ...(sc.consultationHistory || [])]
    };
    setSickleCellProfiles(prev => prev.map(p => (p.id === profileId ? updated : p)));
    saveFirestoreDoc('sickleCellProfiles', profileId, updated);
    addAuditLog('SICKLE_CELL_CONSULTATION', 'SickleCellProfile', profileId, undefined, `Clinical consultation recorded by ${clinician} (Crisis: ${crisisType || 'Routine'})`);
  };

  // Partner Network & Authorization Workflows
  const requestAuthorization = (authData: Omit<ServiceAuthorization, 'id' | 'authNumber' | 'createdAt' | 'status'>) => {
    const authId = `auth-${Date.now().toString().slice(-6)}`;
    const authNumber = `AFY-AUTH-${String(authorizations.length + 125).padStart(6, '0')}`;
    const now = new Date().toISOString();

    const newAuth: ServiceAuthorization = {
      ...authData,
      id: authId,
      authNumber,
      status: 'APPROVED',
      createdAt: now
    };

    setAuthorizations(prev => [newAuth, ...prev]);
    saveFirestoreDoc('authorizations', newAuth.id, newAuth);
    addAuditLog('REQUEST_AUTHORIZATION', 'ServiceAuthorization', authId, undefined, `Generated ${authNumber} for ${authData.serviceName} at ${authData.facilityName}`);
    return newAuth;
  };

  const adjudicateAuthorization = (authId: string, status: 'APPROVED' | 'DENIED', notes?: string) => {
    const existing = authorizations.find(a => a.id === authId);
    if (!existing) return;

    const updated = { ...existing, status, responseNotes: notes, adjudicatedBy: currentUser.displayName };
    setAuthorizations(prev => prev.map(a => (a.id === authId ? updated : a)));
    saveFirestoreDoc('authorizations', authId, updated);
    addAuditLog('ADJUDICATE_AUTHORIZATION', 'ServiceAuthorization', authId, undefined, `Status changed to ${status}: ${notes || ''}`);
  };

  const deleteAuthorization = async (authId: string): Promise<void> => {
    const auth = authorizations.find(a => a.id === authId);
    setAuthorizations(prev => prev.filter(a => a.id !== authId));
    await deleteFirestoreDoc('authorizations', authId);
    if (auth) {
      addAuditLog('DELETE_AUTHORIZATION', 'ServiceAuthorization', authId, auth.authNumber, undefined, `Deleted pre-authorization ${auth.authNumber}`);
    }
  };

  const submitClaim = (claimData: Omit<ProviderClaim, 'id' | 'claimNumber' | 'createdAt' | 'status'>) => {
    const claimId = `clm-${Date.now().toString().slice(-6)}`;
    const claimNumber = `AFY-CLM-${String(claims.length + 1083).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newClaim: ProviderClaim = {
      ...claimData,
      id: claimId,
      claimNumber,
      status: 'SUBMITTED',
      createdAt: now
    };

    setClaims(prev => [newClaim, ...prev]);
    saveFirestoreDoc('claims', newClaim.id, newClaim);
    addAuditLog('SUBMIT_CLAIM', 'ProviderClaim', claimId, undefined, `Submitted claim ${claimNumber} for UGX ${claimData.amountClaimed.toLocaleString()}`);
    return newClaim;
  };

  const adjudicateClaim = (claimId: string, status: 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED', approvedAmount: number, notes: string) => {
    const existing = claims.find(c => c.id === claimId);
    if (!existing) return;

    const updated = { ...existing, status, amountApproved: approvedAmount, adjudicationNotes: notes };
    setClaims(prev => prev.map(c => (c.id === claimId ? updated : c)));
    saveFirestoreDoc('claims', claimId, updated);
    addAuditLog('ADJUDICATE_CLAIM', 'ProviderClaim', claimId, undefined, `Claim adjudicated: ${status}, Approved: UGX ${approvedAmount.toLocaleString()}`);
  };

  const deleteClaim = async (claimId: string): Promise<void> => {
    const claim = claims.find(c => c.id === claimId);
    setClaims(prev => prev.filter(c => c.id !== claimId));
    await deleteFirestoreDoc('claims', claimId);
    if (claim) {
      addAuditLog('DELETE_CLAIM', 'ProviderClaim', claimId, claim.claimNumber, undefined, `Deleted claim ${claim.claimNumber}`);
    }
  };

  const createSettlementBatch = (facilityId: string, period: string): FacilitySettlement => {
    const targetFacility = facilities.find(f => f.id === facilityId);
    const facilityName = targetFacility ? targetFacility.name : 'Partner Facility';

    const eligibleClaims = claims.filter(c => c.facilityId === facilityId && (c.status === 'APPROVED' || c.status === 'PARTIALLY_APPROVED') && !c.settlementId);
    const claimedTotal = eligibleClaims.reduce((sum, c) => sum + c.amountClaimed, 0);
    const approvedTotal = eligibleClaims.reduce((sum, c) => sum + c.amountApproved, 0);
    const settlementId = `stl-${Date.now().toString().slice(-6)}`;
    const settlementNumber = `AFY-STL-${new Date().getFullYear()}-${period.replace(/\s+/g, '-').slice(0, 7)}-${String(settlements.length + 1).padStart(2, '0')}`;
    const now = new Date().toISOString();

    const newSettlement: FacilitySettlement = {
      id: settlementId,
      settlementNumber,
      facilityId,
      facilityName,
      period,
      claimsCount: eligibleClaims.length,
      claimedTotal,
      approvedTotal,
      adjustments: 0,
      amountPayable: approvedTotal,
      paymentStatus: 'DRAFT',
      createdAt: now
    };

    setClaims(prev =>
      prev.map(c => {
        if (eligibleClaims.some(ec => ec.id === c.id)) {
          const updatedClaim = { ...c, settlementId };
          saveFirestoreDoc('claims', c.id, updatedClaim);
          return updatedClaim;
        }
        return c;
      })
    );

    setSettlements(prev => [newSettlement, ...prev]);
    saveFirestoreDoc('settlements', newSettlement.id, newSettlement);
    addAuditLog('CREATE_SETTLEMENT', 'FacilitySettlement', settlementId, undefined, `Created settlement batch ${settlementNumber} for ${facilityName} (${eligibleClaims.length} claims, UGX ${approvedTotal.toLocaleString()})`);

    return newSettlement;
  };

  const markSettlementPaid = (settlementId: string, reference: string) => {
    const existing = settlements.find(s => s.id === settlementId);
    if (!existing) return;

    const updated = { ...existing, paymentStatus: 'PAID' as const, paymentReference: reference };
    setSettlements(prev => prev.map(s => (s.id === settlementId ? updated : s)));
    saveFirestoreDoc('settlements', settlementId, updated);
    addAuditLog('SETTLEMENT_PAID', 'FacilitySettlement', settlementId, 'DRAFT', 'PAID', `Settlement marked paid with reference: ${reference}`);
  };

  const deleteSettlement = async (settlementId: string): Promise<void> => {
    const stl = settlements.find(s => s.id === settlementId);
    // Unlink claims that belonged to this settlement
    setClaims(prev =>
      prev.map(c => {
        if (c.settlementId === settlementId) {
          const updatedClaim = { ...c, settlementId: undefined };
          saveFirestoreDoc('claims', c.id, updatedClaim);
          return updatedClaim;
        }
        return c;
      })
    );
    setSettlements(prev => prev.filter(s => s.id !== settlementId));
    await deleteFirestoreDoc('settlements', settlementId);
    if (stl) {
      addAuditLog('DELETE_SETTLEMENT', 'FacilitySettlement', settlementId, stl.settlementNumber, undefined, `Deleted settlement batch ${stl.settlementNumber}`);
    }
  };

  const addFacility = (facilityData: Omit<Facility, 'id' | 'createdAt'>): Facility => {
    const id = `fac-${Date.now().toString().slice(-6)}`;
    const newFacility: Facility = {
      ...facilityData,
      id,
      createdAt: new Date().toISOString()
    };
    setFacilities(prev => [...prev, newFacility]);
    saveFirestoreDoc('facilities', id, newFacility);
    addAuditLog('CREATE_FACILITY', 'Facility', id, undefined, `Added facility ${newFacility.name} (${newFacility.type})`);
    return newFacility;
  };

  const updateFacility = async (updatedFacility: Facility): Promise<void> => {
    setFacilities(prev => prev.map(f => (f.id === updatedFacility.id ? updatedFacility : f)));
    await saveFirestoreDoc('facilities', updatedFacility.id, updatedFacility);
    addAuditLog('UPDATE_FACILITY', 'Facility', updatedFacility.id, undefined, `Updated facility ${updatedFacility.name}`);
  };

  const deleteFacility = async (facilityId: string): Promise<void> => {
    const fac = facilities.find(f => f.id === facilityId);
    setFacilities(prev => prev.filter(f => f.id !== facilityId));
    await deleteFirestoreDoc('facilities', facilityId);
    if (fac) {
      addAuditLog('DELETE_FACILITY', 'Facility', facilityId, fac.name, undefined, `Removed partner facility ${fac.name}`);
    }
  };

  // Global Lookup with Duplicate Patient Detection
  const findCardOrPatient = (query: string) => {
    let raw = query.trim();
    if (raw.includes('/')) {
      const parts = raw.split('/');
      raw = parts[parts.length - 1] || raw;
    }
    if (raw.includes(':')) {
      const parts = raw.split(':');
      raw = parts[parts.length - 1] || raw;
    }
    if (raw.includes('?')) {
      raw = raw.split('?')[0];
    }
    const q = raw.trim().toLowerCase();
    if (!q) return null;

    // Direct card search
    const matchedCard = cards.find(
      c => c.qrIdentifier.toLowerCase() === q || c.cardNumber.toLowerCase() === q
    );

    // Multi-criteria patient search
    const cleanDigits = q.replace(/[^0-9]/g, '');
    const candidatePatients = patients.filter(p => {
      const matchMemberId = p.memberId.toLowerCase() === q || p.id.toLowerCase() === q;
      const matchDob = p.dob === q;
      const matchNationalId = p.nationalId && p.nationalId.toLowerCase() === q;
      const matchName = p.fullName.toLowerCase().includes(q);
      const matchPhone = cleanDigits.length >= 4 && p.phone.replace(/[^0-9]/g, '').includes(cleanDigits);
      return matchMemberId || matchDob || matchNationalId || matchName || matchPhone;
    });

    let matchedPatient: Patient | undefined;
    if (matchedCard) {
      matchedPatient = patients.find(p => p.id === matchedCard.patientId);
    } else if (candidatePatients.length > 0) {
      matchedPatient = candidatePatients[0];
    }

    if (!matchedPatient && !matchedCard) return null;

    const patient = matchedPatient || (matchedCard ? patients.find(p => p.id === matchedCard.patientId) : undefined);
    if (!patient) return null;

    const card = matchedCard || cards.find(c => c.patientId === patient.id && c.status === 'ACTIVE') || cards.find(c => c.patientId === patient.id);
    const membership = memberships.find(m => m.patientId === patient.id && m.status === 'ACTIVE') || memberships.find(m => m.patientId === patient.id);
    const chronicMembership = chronicMemberships.find(cm => cm.patientId === patient.id);
    const sickleCellProfile = sickleCellProfiles.find(sc => sc.patientId === patient.id);
    const patientVisits = visits.filter(v => v.patientId === patient.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      patient,
      card,
      membership,
      chronicMembership,
      sickleCellProfile,
      patientVisits,
      duplicateCandidates: candidatePatients.length > 1 ? candidatePatients : []
    };
  };

  // Seed prompt demo data helper to test returning patient workflow immediately
  const seedDemonstrationData = async () => {
    // 1. Patient John Doe (AFY-PAT-000245) - 1 Visit remaining
    const johnId = 'pat-000245';
    const johnCardId = 'crd-000245';
    const johnMemId = 'mem-000245';

    const johnPatient: Patient = {
      id: johnId,
      memberId: 'AFY-PAT-000245',
      fullName: 'John Doe',
      dob: '1988-06-15',
      sex: 'Male',
      phone: '+256 701 234 567',
      address: 'Kitende – Mwenda Stage, Entebbe Road, Uganda',
      emergencyContact: {
        name: 'Mary Doe',
        relationship: 'Spouse',
        phone: '+256 772 987 654'
      },
      nextOfKin: {
        name: 'Mary Doe',
        relationship: 'Wife',
        phone: '+256 772 987 654'
      },
      nationalId: 'CM88012345ABCD',
      receptionAlerts: [
        'Package Entitlement Active: 1 Visit Remaining',
        'Routine BP follow-up review due'
      ],
      registrationDate: '2026-08-01',
      status: 'ACTIVE',
      notes: 'Registered patient. Longitudinal attendance record active.',
      createdAt: '2026-08-01T08:00:00Z'
    };

    const johnCard: Card = {
      id: johnCardId,
      cardNumber: 'AFY-CRD-000245',
      patientId: johnId,
      cardType: 'HEALTH_PACKAGE',
      qrIdentifier: 'AFY-PAT-000245',
      issueDate: '2026-08-01',
      expiryDate: '2027-08-01',
      status: 'ACTIVE',
      createdAt: '2026-08-01T08:10:00Z'
    };

    const johnMembership: Membership = {
      id: johnMemId,
      patientId: johnId,
      packageId: 'pkg-ind-basic',
      packageName: 'Individual Basic Care',
      startDate: '2026-08-01',
      expiryDate: '2027-02-01',
      visitsPurchased: 3,
      visitsUsed: 2,
      visitsRemaining: 1, // Formula: 3 - 2 = 1 remaining!
      status: 'ACTIVE',
      isFamilyPackage: false,
      createdAt: '2026-08-01T08:15:00Z'
    };

    // Historical Visits for John Doe (Read-Only longitudinal history)
    const visit1: Visit = {
      id: 'vis-000245-001',
      patientId: johnId,
      patientName: 'John Doe',
      cardId: johnCardId,
      facilityId: 'fac-afya-central',
      facilityName: 'Afya Medicare – Central Clinic',
      department: 'OPD',
      providerName: 'Dr. Kigozi Emmanuel',
      serviceName: 'General Outpatient Consultation',
      packageId: 'pkg-ind-basic',
      coverageStatus: 'COVERED',
      visitDeducted: true,
      copaymentAmount: 0,
      notes: 'Patient presented with low-grade fever and mild headache for 2 days.',
      status: 'COMPLETED',
      visitNumber: 1,
      visitSequence: 'Visit 001',
      visitType: 'OPD Consultation',
      reasonForVisit: 'Fever',
      diagnosis: 'Malaria Suspect',
      treatment: 'Consultation & mRDT testing',
      prescriptions: ['Paracetamol 1g TDS x 3 days'],
      paymentStatus: 'Covered by Package',
      receptionStaff: 'Mary Nakku (Receptionist)',
      queueNumber: 'Q-003',
      triageVitals: 'BP: 122/80 mmHg, Temp: 37.8°C, Wt: 68kg',
      followUpDate: '2026-08-20',
      createdAt: '2026-08-12T09:15:00Z'
    };

    const visit2: Visit = {
      id: 'vis-000245-002',
      patientId: johnId,
      patientName: 'John Doe',
      cardId: johnCardId,
      facilityId: 'fac-afya-central',
      facilityName: 'Afya Medicare – Central Clinic',
      department: 'OPD',
      providerName: 'Dr. Kigozi Emmanuel',
      serviceName: 'Outpatient Treatment & Laboratory',
      packageId: 'pkg-ind-basic',
      coverageStatus: 'COVERED',
      visitDeducted: true,
      copaymentAmount: 0,
      notes: 'Follow-up attendance with confirmed positive mRDT for Plasmodium falciparum.',
      status: 'COMPLETED',
      visitNumber: 2,
      visitSequence: 'Visit 002',
      visitType: 'OPD Consultation',
      reasonForVisit: 'Malaria symptoms',
      diagnosis: 'Malaria',
      treatment: 'Treatment',
      prescriptions: ['Artemether/Lumefantrine 20/120mg (Coartem) 4 tabs BD x 3 days', 'Paracetamol 1g TDS'],
      paymentStatus: 'Covered by Package',
      receptionStaff: 'Mary Nakku (Receptionist)',
      queueNumber: 'Q-009',
      triageVitals: 'BP: 118/76 mmHg, Temp: 38.4°C, Wt: 67.5kg',
      followUpDate: '2026-09-05',
      createdAt: '2026-08-24T10:30:00Z'
    };

    // 2. Patient Sarah Namukasa (Chronic Care)
    const sarahId = 'pat-000102';
    const sarahCardId = 'crd-000102';
    const sarahPatient: Patient = {
      id: sarahId,
      memberId: 'AFY-000102',
      fullName: 'Sarah Namukasa',
      dob: '1974-11-20',
      sex: 'Female',
      phone: '+256 752 443 210',
      address: 'Seguku, Wakiso, Uganda',
      emergencyContact: {
        name: 'David Musoke',
        relationship: 'Son',
        phone: '+256 703 112 334'
      },
      nextOfKin: {
        name: 'David Musoke',
        relationship: 'Son',
        phone: '+256 703 112 334'
      },
      nationalId: 'CF74098765KLMN',
      receptionAlerts: ['Hypertension Program Active', 'Monthly medication review due'],
      registrationDate: '2026-06-10',
      status: 'ACTIVE',
      createdAt: '2026-06-10T09:00:00Z'
    };

    const sarahCard: Card = {
      id: sarahCardId,
      cardNumber: 'AFY-CRD-000102',
      patientId: sarahId,
      cardType: 'CHRONIC_CARE',
      qrIdentifier: 'AFY-000102',
      issueDate: '2026-06-10',
      expiryDate: '2027-06-10',
      status: 'ACTIVE',
      createdAt: '2026-06-10T09:10:00Z'
    };

    const sarahChronic: ChronicMembership = {
      id: 'chr-000102',
      patientId: sarahId,
      programId: 'prog-htn',
      programName: 'Afya Hypertension Wellness Program',
      condition: 'Hypertension (High Blood Pressure)',
      status: 'ACTIVE',
      currentPaidMonth: 'October 2026',
      renewalDate: '2026-11-05',
      nextReviewDate: '2026-10-25',
      currentMedications: ['Amlodipine 10mg OD', 'Losartan 50mg OD', 'Bendroflumethiazide 2.5mg OD'],
      lastPickupDate: '2026-09-28',
      consultationHistory: [
        {
          date: '2026-09-28',
          doctor: 'Dr. Kigozi Emmanuel',
          notes: 'BP controlled on dual therapy. Patient adherent.',
          bpOrVitals: 'BP: 130/82 mmHg'
        }
      ],
      medicationPickups: [
        {
          date: '2026-09-28',
          pharmacist: 'Pharm. Grace Nalwanga',
          itemsDispensed: 'Amlodipine 10mg x 30 tabs, Losartan 50mg x 30 tabs'
        }
      ],
      createdAt: '2026-06-10T09:20:00Z'
    };

    // 3. Patient Joshua Mukasa (Sickle Cell Clinical Card - Purely Clinical)
    const joshuaId = 'pat-000103';
    const joshuaCardId = 'crd-000103';
    const joshuaPatient: Patient = {
      id: joshuaId,
      memberId: 'AFY-000103',
      fullName: 'Joshua Mukasa',
      dob: '2016-04-12',
      sex: 'Male',
      phone: '+256 782 559 876',
      address: 'Kajjansi Town Council, Uganda',
      emergencyContact: {
        name: 'Agnes Mukasa (Mother)',
        relationship: 'Mother',
        phone: '+256 782 559 876'
      },
      nextOfKin: {
        name: 'Agnes Mukasa',
        relationship: 'Mother',
        phone: '+256 782 559 876'
      },
      receptionAlerts: [
        'SICKLE CELL DISEASE (HbSS) - FAST TRACK EMERGENCY',
        'Penicillin V prophylaxis daily',
        'Zero copay payment barrier for triage'
      ],
      registrationDate: '2026-05-15',
      status: 'ACTIVE',
      createdAt: '2026-05-15T11:00:00Z'
    };

    const joshuaCard: Card = {
      id: joshuaCardId,
      cardNumber: 'AFY-CRD-000103',
      patientId: joshuaId,
      cardType: 'SICKLE_CELL',
      qrIdentifier: 'AFY-000103',
      issueDate: '2026-05-15',
      expiryDate: '2027-05-15',
      status: 'ACTIVE',
      createdAt: '2026-05-15T11:05:00Z'
    };

    const joshuaSickle: SickleCellProfile = {
      id: 'sc-000103',
      patientId: joshuaId,
      genotype: 'HbSS',
      bloodGroup: 'O+',
      allergies: ['Penicillin Allergy (Mild rash - switched to Erythromycin)'],
      baselineWeightKg: 24,
      currentMedications: ['Hydroxyurea 500mg OD', 'Folic Acid 5mg OD', 'Erythromycin 250mg BD'],
      carePlan: 'High hydration goal (>2L/day), malaria chemoprophylaxis, annual transcranial doppler screening.',
      clinicalAlerts: [
        'Registered Sickle Cell Program Patient',
        'Vaso-occlusive pain crisis protocol priority'
      ],
      lastReviewDate: '2026-09-18',
      nextReviewDate: '2026-10-30',
      emergencyProtocol: 'CRISIS TRIAGE: 1. Warmth; 2. IV 0.9% Normal Saline; 3. Urgent analgesia; 4. CBC check. No payment gate before relief.',
      emergencyContact: {
        name: 'Agnes Mukasa',
        phone: '+256 782 559 876',
        relation: 'Mother'
      },
      referralCenter: 'Mulago Hospital Sickle Cell Unit',
      consultationHistory: [
        {
          date: '2026-09-18',
          clinician: 'Dr. Kigozi Emmanuel',
          crisisType: 'Mild Bone Pain Crisis',
          vitals: 'Temp: 37.2°C, SpO2: 98%, HR: 92 bpm',
          treatmentGiven: 'Oral hydration + Ibuprofen syrup 200mg TDS x 3 days'
        }
      ],
      createdAt: '2026-05-15T11:15:00Z'
    };

    // Commit to state and Firestore
    const newPatients = [johnPatient, sarahPatient, joshuaPatient];
    const newCards = [johnCard, sarahCard, joshuaCard];
    const newMemberships = [johnMembership];
    const newChronic = [sarahChronic];
    const newSickle = [joshuaSickle];
    const newVisits = [visit2, visit1];

    setPatients(newPatients);
    setCards(newCards);
    setMemberships(newMemberships);
    setChronicMemberships(newChronic);
    setSickleCellProfiles(newSickle);
    setVisits(newVisits);

    for (const p of newPatients) await saveFirestoreDoc('patients', p.id, p);
    for (const c of newCards) await saveFirestoreDoc('cards', c.id, c);
    for (const m of newMemberships) await saveFirestoreDoc('memberships', m.id, m);
    for (const cm of newChronic) await saveFirestoreDoc('chronicMemberships', cm.id, cm);
    for (const sc of newSickle) await saveFirestoreDoc('sickleCellProfiles', sc.id, sc);
    for (const v of newVisits) await saveFirestoreDoc('visits', v.id, v);

    addAuditLog('SEED_DEMO_DATA', 'System', 'demo-bootstrap', undefined, 'Loaded demonstration patients (John Doe AFY-PAT-000245 with 2 visits, Sarah Namukasa, Joshua Mukasa)');
  };

  const clearAllPatientData = async () => {
    setPatients([]);
    setCards([]);
    setMemberships([]);
    setFamilyMembers([]);
    setChronicMemberships([]);
    setSickleCellProfiles([]);
    setVisits([]);
    setPayments([]);
    setReceipts([]);
    setAuthorizations([]);
    setClaims([]);
    setSettlements([]);
    localStorage.clear();
    addAuditLog('DATABASE_CLEARED', 'System', 'all', undefined, 'Cleaned all patient and transactional data from network');
  };

  return (
    <AppContext.Provider
      value={{
        isOnline,
        toggleOnlineStatus,
        isFirebaseConnected,
        firebaseUser,
        signInWithGoogle,
        logOut,
        currentUser,
        switchUserRole,
        currentFacility,
        facilities,
        patients,
        cards,
        packages,
        memberships,
        familyMembers,
        chronicPrograms,
        chronicMemberships,
        sickleCellProfiles,
        visits,
        payments,
        receipts,
        authorizations,
        claims,
        settlements,
        auditLogs,
        checkPatientDuplicates,
        registerPatient,
        updatePatient,
        deletePatient,
        issueNewCard,
        blockCard,
        unblockCard,
        replaceCard,
        reportCardLost,
        deactivateCard,
        reactivateCard,
        deleteCard,
        inventoryItems,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        savePackage,
        deletePackage,
        saveChronicProgram,
        deleteChronicProgram,
        recordVisit,
        reverseVisit,
        deleteVisit,
        recordPayment,
        deletePayment,
        issueItemizedReceipt,
        enrollChronicMembership,
        deleteChronicMembership,
        renewChronicMembership,
        recordMedicationPickup,
        recordChronicConsultation,
        registerSickleCellProfile,
        updateSickleCellProfile,
        deleteSickleCellProfile,
        recordSickleCellConsultation,
        requestAuthorization,
        adjudicateAuthorization,
        deleteAuthorization,
        submitClaim,
        adjudicateClaim,
        deleteClaim,
        createSettlementBatch,
        markSettlementPaid,
        deleteSettlement,
        addFacility,
        updateFacility,
        deleteFacility,
        receptionPermissions,
        updateReceptionPermissions,
        updatePatientDemographics,
        findCardOrPatient,
        seedDemonstrationData,
        clearAllPatientData,
        confirmAction,
        showToast
      }}
    >
      {children}
      <ConfirmModal
        isOpen={!!confirmModalOptions}
        options={confirmModalOptions}
        onClose={() => setConfirmModalOptions(null)}
      />
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
