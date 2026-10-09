export type UserRole =
  | 'super_admin'
  | 'afya_admin'
  | 'reception'
  | 'cashier'
  | 'doctor'
  | 'nurse'
  | 'pharmacy'
  | 'laboratory'
  | 'partner_admin'
  | 'partner_provider'
  | 'auditor';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  facilityId: string;
  facilityName: string;
  isActive: boolean;
  createdAt: string;
}

export type FacilityType =
  | 'afya_medicare'
  | 'partner_clinic'
  | 'partner_hospital'
  | 'partner_laboratory'
  | 'partner_pharmacy';

export type FacilityStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'TERMINATED';

export interface Facility {
  id: string;
  name: string;
  location: string;
  type: FacilityType;
  logoUrl?: string;
  contactPhone: string;
  contactEmail: string;
  status: FacilityStatus;
  contractStatus: string;
  allowedServices: string[];
  settlementRule: {
    consultationRateUGX: number;
    labReimbursementPercent: number;
    pharmacyMarkupPercent: number;
    notes: string;
  };
  createdAt: string;
}

export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface Patient {
  id: string;
  memberId: string; // e.g. AFY-000001
  fullName: string;
  dob: string; // YYYY-MM-DD
  sex: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  nextOfKin?: {
    name: string;
    relationship: string;
    phone: string;
  };
  nationalId?: string; // Optional NIN / ID
  receptionAlerts?: string[]; // e.g. "Package entitlement expiring", "Allergy alert"
  photoUrl?: string;
  registrationDate: string;
  status: PatientStatus;
  notes?: string;
  createdAt: string;
}

export type CardType = 'HEALTH_PACKAGE' | 'CHRONIC_CARE' | 'SICKLE_CELL';

export type CardStatus =
  | 'ACTIVE'
  | 'BLOCKED'
  | 'LOST'
  | 'STOLEN'
  | 'EXPIRED'
  | 'REPLACED';

export interface Card {
  id: string;
  cardNumber: string; // e.g. AFY-CRD-882190
  patientId: string;
  cardType: CardType;
  qrIdentifier: string; // Unique cryptographic identifier, no sensitive clinical data!
  nfcIdentifier?: string; // Standard adapter identifier
  issueDate: string;
  expiryDate: string;
  status: CardStatus;
  deactivationReason?: string;
  reportedLostAt?: string;
  reportedLostNotes?: string;
  replacementReason?: string;
  replacedCardId?: string;
  createdAt: string;
}

export type InventoryCategory =
  | 'Consultation'
  | 'Laboratory'
  | 'Pharmacy'
  | 'Procedure'
  | 'Supplies';

export type DosageForm =
  | 'Injectable'
  | 'Tablet'
  | 'Capsule'
  | 'Topical'
  | 'Syrup'
  | 'IV Fluid'
  | 'Supply'
  | 'Diagnostic'
  | 'Other';

export interface InventoryItem {
  id: string;
  code: string; // e.g. "INV-MED-001"
  name: string; // e.g. "General OPD Consultation"
  category: InventoryCategory;
  dosageForm?: DosageForm;
  unitPrice: number; // UGX
  stockQuantity: number;
  unit: string; // "visit", "test", "tablets", "session", "vial"
  isCoveredByDefault: boolean;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ReceiptLineItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  coveredByPackage: boolean;
  amountPayable: number;
}

export type PackageType =
  | 'INDIVIDUAL_BASIC'
  | 'INDIVIDUAL_PREMIUM'
  | 'FAMILY_BASIC'
  | 'FAMILY_PREMIUM'
  | 'CUSTOM';

export interface HealthcarePackage {
  id: string;
  name: string;
  packageType: PackageType;
  price: number; // Configurable by admin (UGX)
  currency: string; // Default 'UGX'
  visitsPurchased: number; // Configurable
  validityDays: number; // e.g. 365
  coveredServices: string[];
  excludedServices: string[];
  labBenefits: string;
  consultationBenefits: string;
  ultrasoundBenefits: string;
  medicationBenefits: string;
  specialistBenefits: string;
  emergencyBenefits: string;
  familyRules: {
    maxDependents: number;
    allocationModel: 'shared' | 'individual'; // shared family visits OR individual allocations
    defaultVisitsPerDependent?: number;
  };
  renewalRules: string;
  isActive: boolean;
  createdAt: string;
}

export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';

export interface Membership {
  id: string;
  patientId: string;
  packageId: string;
  packageName: string;
  startDate: string;
  expiryDate: string;
  visitsPurchased: number;
  visitsUsed: number;
  visitsRemaining: number; // Automatically calculated: Visits Purchased – Valid Covered Visits Used
  status: MembershipStatus;
  isFamilyPackage: boolean;
  familyAllocationModel?: 'shared' | 'individual';
  primaryMemberId?: string;
  dependentIds?: string[];
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  primaryPatientId: string;
  dependentPatientId: string;
  dependentName: string;
  relationship: string; // Spouse, Child, Parent, etc.
  membershipId: string;
  allocationModel: 'shared' | 'individual';
  allocatedVisits?: number;
  usedVisits: number;
  createdAt: string;
}

export interface ChronicProgram {
  id: string;
  name: string;
  condition: string; // Hypertension, Diabetes, Asthma, etc.
  description: string;
  visitRule: 'unlimited' | 'defined';
  definedVisits?: number;
  medicationBenefits: string;
  labBenefits: string;
  monthlyFee: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

export type ChronicStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING';

export interface ChronicMembership {
  id: string;
  patientId: string;
  programId: string;
  programName: string;
  condition: string;
  status: ChronicStatus;
  currentPaidMonth: string; // e.g. "October 2026"
  renewalDate: string;
  nextReviewDate: string;
  currentMedications: string[];
  lastPickupDate?: string;
  consultationHistory: Array<{
    date: string;
    doctor: string;
    notes: string;
    bpOrVitals?: string;
  }>;
  medicationPickups: Array<{
    date: string;
    pharmacist: string;
    itemsDispensed: string;
  }>;
  notes?: string;
  createdAt: string;
}

// Strict separation: Sickle Cell Card is purely clinical ID; NO payment or money tracking!
export interface SickleCellProfile {
  id: string;
  patientId: string;
  genotype: 'HbSS' | 'HbSC' | 'HbS-beta-thalassemia' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  baselineWeightKg: number;
  currentMedications: string[];
  carePlan: string;
  clinicalAlerts: string[]; // e.g. "Penicillin prophylaxis daily", "High pain crisis risk during malaria season"
  lastReviewDate: string;
  nextReviewDate: string;
  emergencyProtocol: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  referralCenter: string;
  consultationHistory: Array<{
    date: string;
    clinician: string;
    crisisType?: string;
    vitals: string;
    treatmentGiven: string;
  }>;
  createdAt: string;
}

export type BenefitCoverageStatus =
  | 'COVERED'
  | 'PARTIALLY_COVERED'
  | 'NOT_COVERED'
  | 'AUTHORIZATION_REQUIRED';

export type VisitStatus = 'OPEN' | 'COMPLETED' | 'CANCELLED' | 'REVERSED';

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  cardId?: string;
  facilityId: string;
  facilityName: string;
  department: string;
  providerName: string;
  serviceName: string;
  packageId?: string;
  coverageStatus: BenefitCoverageStatus;
  visitDeducted: boolean;
  copaymentAmount: number;
  authorizationId?: string;
  notes: string;
  status: VisitStatus;
  reversalReason?: string;
  reversedBy?: string;
  reversedAt?: string;
  createdAt: string;

  // Longitudinal HMIS & Returning Patient additions
  visitNumber?: number; // e.g. 1, 2, 3
  visitSequence?: string; // e.g. "Visit 001", "Visit 002", "Visit 003"
  visitType?: string; // e.g. "OPD Consultation", "Emergency", "Review/Follow-up", "Triage Only", "Routine Checkup"
  reasonForVisit?: string; // e.g. "Headache", "Fever", "Malaria symptoms", "Medication Refill"
  diagnosis?: string; // e.g. "Malaria", "Upper Respiratory Tract Infection"
  treatment?: string; // e.g. "Artemether/Lumefantrine + Paracetamol"
  prescriptions?: string[]; // e.g. ["Paracetamol 500mg TDS", "Amoxicillin 500mg TDS"]
  paymentStatus?: string; // e.g. "Covered by Package", "Cash / Mobile Money", "Pending Copay", "Exempt"
  authorizationStatus?: string; // e.g. "Approved", "Pre-authorized", "Direct Settlement"
  receptionStaff?: string; // e.g. "Mary Nakku (Receptionist)"
  queueNumber?: string; // e.g. "Q-008"
  triageVitals?: string; // e.g. "BP: 120/80 mmHg, Temp: 37.1°C, Wt: 65kg"
  followUpDate?: string; // e.g. "2026-10-24"
  clinicalNarrative?: string; // Confidential clinician notes (Restricted to Doctor/Nurse roles)
  isConfidential?: boolean;
}

export interface ReceptionViewPermissions {
  showBasicDiagnosis: boolean;
  showMedicationSummary: boolean;
  showFollowUpDates: boolean;
  showPackageBenefits: boolean;
  showTriageVitals: boolean;
  allowDemographicEdit: boolean;
  allowVisitReversal: boolean;
}

export type PaymentMethod = 'Cash' | 'Mobile Money' | 'Bank' | 'Card/POS' | 'Cheque';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'REFUNDED'
  | 'REVERSED'
  | 'CANCELLED';

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. AFY-RCP-2026-0045
  patientId: string;
  patientName: string;
  membershipId?: string;
  chronicMembershipId?: string;
  itemDescription: string;
  amount: number; // UGX
  currency: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string; // e.g. MTN MoMo TID: 28471940
  staffId: string;
  staffName: string;
  status: PaymentStatus;
  refundReason?: string;
  notes?: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string; // e.g. "AFY-RCP-2026-0045"
  paymentId?: string;
  visitId?: string;
  visitSequence?: string;
  queueNumber?: string;
  patientId: string;
  patientName: string;
  memberId: string;
  cardNumber?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  description: string;
  packageOrProgram?: string;
  staffName: string;
  facilityName: string;
  facilityLocation: string;
  lineItems?: ReceiptLineItem[];
  subtotal?: number;
  packageDeductionValue?: number;
  totalPayable?: number;
  amountPaid?: number;
  change?: number;
  paymentReference?: string;
  createdAt: string;
}

export type AuthStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'DENIED'
  | 'USED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface ServiceAuthorization {
  id: string;
  authNumber: string; // e.g. AFY-AUTH-000125
  patientId: string;
  patientName: string;
  cardId: string;
  facilityId: string;
  facilityName: string;
  serviceName: string;
  packageId: string;
  benefitRule: string;
  approvedAmount: number;
  status: AuthStatus;
  expiryDate: string;
  requestingStaff: string;
  adjudicatedBy?: string;
  responseNotes?: string;
  createdAt: string;
}

export type ClaimStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'
  | 'PAID';

export interface ProviderClaim {
  id: string;
  claimNumber: string; // e.g. AFY-CLM-1082
  authorizationId: string;
  patientId: string;
  patientName: string;
  facilityId: string;
  facilityName: string;
  serviceName: string;
  providerName: string;
  amountClaimed: number;
  amountApproved: number;
  status: ClaimStatus;
  serviceDate: string;
  submissionDate: string;
  adjudicationNotes?: string;
  settlementId?: string;
  createdAt: string;
}

export type SettlementStatus = 'DRAFT' | 'APPROVED' | 'PAID';

export interface FacilitySettlement {
  id: string;
  settlementNumber: string; // e.g. AFY-STL-2026-Q3-01
  facilityId: string;
  facilityName: string;
  period: string; // e.g. "September 2026"
  claimsCount: number;
  claimedTotal: number;
  approvedTotal: number;
  adjustments: number;
  amountPayable: number;
  paymentStatus: SettlementStatus;
  paymentReference?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  notes?: string;
  timestamp: string;
}
