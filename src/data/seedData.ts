import {
  Patient,
  Card,
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
  InventoryItem
} from '../types';

export const initialFacilities: Facility[] = [
  {
    id: 'fac-afya-central',
    name: 'Afya Medicare – Central Clinic',
    location: 'Kitende – Mwenda Stage, Entebbe Road, Uganda',
    type: 'afya_medicare',
    contactPhone: '+256 701 445 920',
    contactEmail: 'reception@afyamedicare.ug',
    status: 'ACTIVE',
    contractStatus: 'Headquarters Operation',
    allowedServices: [
      'General Outpatient Consultation',
      'Specialist Consultation',
      'Laboratory Diagnostics',
      'Ultrasound Imaging',
      'Pharmacy Dispensing',
      'Chronic Care Management',
      'Sickle Cell Specialized Clinic',
      'Emergency Stabilization'
    ],
    settlementRule: {
      consultationRateUGX: 25000,
      labReimbursementPercent: 100,
      pharmacyMarkupPercent: 0,
      notes: 'Direct headquarters facility - internal operational center'
    },
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'fac-seguku-clinic',
    name: 'Seguku Community Medical Centre',
    location: 'Seguku, Entebbe Road, Wakiso',
    type: 'partner_clinic',
    contactPhone: '+256 772 331 990',
    contactEmail: 'admin@segukumedical.ug',
    status: 'ACTIVE',
    contractStatus: 'Valid Partner Contract 2026',
    allowedServices: [
      'General Outpatient Consultation',
      'Routine Laboratory',
      'Basic Pharmacy Dispensing'
    ],
    settlementRule: {
      consultationRateUGX: 20000,
      labReimbursementPercent: 85,
      pharmacyMarkupPercent: 10,
      notes: 'Contracted rate UGX 20,000 per verified outpatient visit'
    },
    createdAt: '2026-02-15T09:30:00Z'
  },
  {
    id: 'fac-kajjansi-lab',
    name: 'Kampala Advanced Diagnostics – Kajjansi',
    location: 'Kajjansi Town Council, Wakiso',
    type: 'partner_laboratory',
    contactPhone: '+256 750 918 200',
    contactEmail: 'partner@kajjansilab.ug',
    status: 'ACTIVE',
    contractStatus: 'Valid Partner Contract 2026',
    allowedServices: [
      'Full Blood Count (CBC)',
      'Liver & Kidney Function Tests',
      'Hb Electrophoresis',
      'Ultrasound Scan',
      'HbA1c & Blood Chemistry'
    ],
    settlementRule: {
      consultationRateUGX: 0,
      labReimbursementPercent: 80,
      pharmacyMarkupPercent: 0,
      notes: '80% fee schedule reimbursement upon pre-authorization'
    },
    createdAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'fac-kitende-pharma',
    name: 'Hope Care Pharmacy – Kitende',
    location: 'Kitende Junction, Entebbe Road',
    type: 'partner_pharmacy',
    contactPhone: '+256 788 123 456',
    contactEmail: 'dispense@hopecarepharma.ug',
    status: 'ACTIVE',
    contractStatus: 'Valid Partner Contract 2026',
    allowedServices: [
      'Chronic Care Drug Dispensing',
      'Acute Prescription Dispensing'
    ],
    settlementRule: {
      consultationRateUGX: 0,
      labReimbursementPercent: 0,
      pharmacyMarkupPercent: 90,
      notes: 'Wholesale cost + 10% dispensing cap'
    },
    createdAt: '2026-03-12T11:00:00Z'
  }
];

export const initialPackages: HealthcarePackage[] = [
  {
    id: 'pkg-ind-basic',
    name: 'Individual Basic Care',
    packageType: 'INDIVIDUAL_BASIC',
    price: 150000,
    currency: 'UGX',
    visitsPurchased: 3,
    validityDays: 180,
    coveredServices: [
      'General Practitioner Consultation',
      'Vital signs check & Triage',
      'Malaria Rapid Diagnostic Test (mRDT)',
      'Random Blood Sugar (RBS)',
      'Essential Generic Medications (7-day course)'
    ],
    excludedServices: [
      'Specialist Consultation',
      'Advanced Imaging / Ultrasound',
      'Inpatient Admission',
      'Major Surgery'
    ],
    labBenefits: 'mRDT, Urinalysis, RBS included per visit',
    consultationBenefits: '3 covered Outpatient GP consultations',
    ultrasoundBenefits: 'Not covered (discounted out-of-pocket rate)',
    medicationBenefits: 'Standard first-line acute prescription medicines up to UGX 35,000/visit',
    specialistBenefits: 'Not covered',
    emergencyBenefits: 'First-aid triage and stabilization at Afya Medicare',
    familyRules: {
      maxDependents: 0,
      allocationModel: 'individual'
    },
    renewalRules: 'May be renewed anytime; unused visits expire at 180 days',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'pkg-ind-premium',
    name: 'Individual Premium Care',
    packageType: 'INDIVIDUAL_PREMIUM',
    price: 380000,
    currency: 'UGX',
    visitsPurchased: 8,
    validityDays: 365,
    coveredServices: [
      'GP & Medical Officer Consultations',
      '1 Specialist Consultation (Obs/Gyn, Pediatric or Physician)',
      'Full Blood Count (CBC) & Urinalysis',
      '1 Pelvic/Abdominal Ultrasound Scan',
      'Acute Prescription Medicines (up to UGX 60,000/visit)',
      'Partner Network Authorization Access'
    ],
    excludedServices: [
      'Complex surgical procedures',
      'Cosmetic treatments',
      'Long-term dialysis'
    ],
    labBenefits: 'CBC, Malaria RDT, Stool analysis, Liver enzymes screening',
    consultationBenefits: '8 Outpatient visits (including 1 specialist review)',
    ultrasoundBenefits: '1 Complete Abdominal or Pelvic Ultrasound per year',
    medicationBenefits: 'Acute prescription formulary coverage up to UGX 60,000 per visit',
    specialistBenefits: '1 included Specialist session per validity period',
    emergencyBenefits: 'Priority urgent care triage and stabilization',
    familyRules: {
      maxDependents: 0,
      allocationModel: 'individual'
    },
    renewalRules: 'Annual renewal with 10% loyalty bonus on timely renewal',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'pkg-fam-basic',
    name: 'Family Basic Care',
    packageType: 'FAMILY_BASIC',
    price: 450000,
    currency: 'UGX',
    visitsPurchased: 10,
    validityDays: 365,
    coveredServices: [
      'GP Consultations for Primary Member & Dependents',
      'Pediatric Immunization Review & Triage',
      'Malaria & Typhoid testing',
      'Essential Family Medicines Formulary'
    ],
    excludedServices: [
      'Specialist private rooms',
      'Elective surgeries'
    ],
    labBenefits: 'Routine outpatient diagnostics per visit',
    consultationBenefits: '10 shared or allocated family encounters',
    ultrasoundBenefits: 'Available at 25% co-payment discount',
    medicationBenefits: 'Essential medicines included per covered family visit',
    specialistBenefits: 'Pre-authorization required',
    emergencyBenefits: 'Family acute emergency stabilization at Kitende clinic',
    familyRules: {
      maxDependents: 4,
      allocationModel: 'shared',
      defaultVisitsPerDependent: 2
    },
    renewalRules: 'Renewable annually',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'pkg-fam-premium',
    name: 'Family Premium Care',
    packageType: 'FAMILY_PREMIUM',
    price: 850000,
    currency: 'UGX',
    visitsPurchased: 18,
    validityDays: 365,
    coveredServices: [
      'Full GP Consultations for Primary and up to 5 Dependents',
      '2 Specialist Pediatric / Physician Consultations',
      'Comprehensive Lab Panel (CBC, Lipid profile, RBS, Urinalysis)',
      '2 Ultrasound Scans across family',
      'Acute Family Prescriptions',
      'Network Partner Access'
    ],
    excludedServices: [
      'Organ transplants',
      'Non-essential aesthetics'
    ],
    labBenefits: 'Comprehensive clinical lab testing across network',
    consultationBenefits: '18 total family visits across primary & registered dependents',
    ultrasoundBenefits: '2 ultrasound sessions included',
    medicationBenefits: 'Full acute formulary coverage per visit',
    specialistBenefits: '2 included Specialist reviews',
    emergencyBenefits: '24/7 on-call triage consultation and emergency stabilization',
    familyRules: {
      maxDependents: 6,
      allocationModel: 'shared',
      defaultVisitsPerDependent: 3
    },
    renewalRules: 'Annual renewal with rollover of up to 3 unused visits upon renewal',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const initialChronicPrograms: ChronicProgram[] = [
  {
    id: 'prog-htn',
    name: 'Afya Hypertension Wellness Program',
    condition: 'Hypertension (High Blood Pressure)',
    description: 'Monthly cardiovascular management, blood pressure monitoring, doctor reviews, and monthly antihypertensive drug maintenance.',
    visitRule: 'unlimited',
    medicationBenefits: 'Monthly 30-day supply of standard antihypertensives (Amlodipine, Losartan, Bendroflumethiazide)',
    labBenefits: 'Serum Creatinine, Electrolytes & ECG every 6 months included',
    monthlyFee: 45000,
    currency: 'UGX',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'prog-dm2',
    name: 'Afya Diabetes Care Program',
    condition: 'Diabetes Mellitus Type 2',
    description: 'Glycemic control program with regular glucose profiling, HbA1c surveillance, foot exams, and oral hypoglycemic medications.',
    visitRule: 'defined',
    definedVisits: 2,
    medicationBenefits: 'Monthly Metformin, Glibenclamide or designated oral agents',
    labBenefits: 'Bi-monthly Fasting Blood Sugar + Quarterly HbA1c included',
    monthlyFee: 60000,
    currency: 'UGX',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'prog-asthma',
    name: 'Afya Respiratory & Asthma Program',
    condition: 'Chronic Bronchial Asthma',
    description: 'Respiratory monitoring, peak expiratory flow measurement, inhaler technique coaching, and monthly inhaler refills.',
    visitRule: 'unlimited',
    medicationBenefits: 'Salbutamol + Beclomethasone inhalers monthly or as prescribed',
    labBenefits: 'Chest clinical assessment and spirometry screening',
    monthlyFee: 50000,
    currency: 'UGX',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

// CLEAN REAL-TIME PRODUCTION DATA: NO DUMMY PATIENTS OR CARDS
export const initialPatients: Patient[] = [];
export const initialCards: Card[] = [];
export const initialMemberships: Membership[] = [];
export const initialFamilyMembers: FamilyMember[] = [];
export const initialChronicMemberships: ChronicMembership[] = [];
export const initialSickleCellProfiles: SickleCellProfile[] = [];
export const initialVisits: Visit[] = [];
export const initialPayments: Payment[] = [];
export const initialReceipts: Receipt[] = [];
export const initialAuthorizations: ServiceAuthorization[] = [];
export const initialClaims: ProviderClaim[] = [];
export const initialSettlements: FacilitySettlement[] = [];

export const initialInventoryItems: InventoryItem[] = [
  // 1. Consultations & Clinical Diagnostics
  {
    id: 'inv-cns-001',
    code: 'CNS-GEN',
    name: 'General OPD Consultation & Triage',
    category: 'Consultation',
    dosageForm: 'Diagnostic',
    unitPrice: 15000,
    stockQuantity: 999,
    unit: 'visit',
    isCoveredByDefault: true,
    description: 'General outpatient medical review, vitals assessment, and clinical evaluation.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-cns-002',
    code: 'CNS-PED',
    name: 'Pediatric Specialist Consultation',
    category: 'Consultation',
    dosageForm: 'Diagnostic',
    unitPrice: 25000,
    stockQuantity: 999,
    unit: 'visit',
    isCoveredByDefault: true,
    description: 'Child health screening, immunization review, and pediatric consultation.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-cns-003',
    code: 'CNS-NCD',
    name: 'Chronic Disease Review (Hypertension / Diabetes)',
    category: 'Consultation',
    dosageForm: 'Diagnostic',
    unitPrice: 20000,
    stockQuantity: 999,
    unit: 'visit',
    isCoveredByDefault: true,
    description: 'Longitudinal chronic illness monitoring, BP profiling, and lifestyle counseling.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-cns-004',
    code: 'CNS-SCD',
    name: 'Sickle Cell Specialized Clinical Review',
    category: 'Consultation',
    dosageForm: 'Diagnostic',
    unitPrice: 20000,
    stockQuantity: 999,
    unit: 'visit',
    isCoveredByDefault: true,
    description: 'Comprehensive sickle cell warrior evaluation, crisis prevention, and physical exam.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },

  // 2. Laboratory Diagnostics
  {
    id: 'inv-lab-001',
    code: 'LAB-MRDT',
    name: 'Malaria Rapid Diagnostic Test (RDT)',
    category: 'Laboratory',
    dosageForm: 'Diagnostic',
    unitPrice: 5000,
    stockQuantity: 240,
    unit: 'test',
    isCoveredByDefault: true,
    description: 'Capillary blood test for Plasmodium falciparum antigen detection.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-lab-002',
    code: 'LAB-BS',
    name: 'Malaria Blood Smear (BS) Microscopy',
    category: 'Laboratory',
    dosageForm: 'Diagnostic',
    unitPrice: 8000,
    stockQuantity: 180,
    unit: 'slide',
    isCoveredByDefault: true,
    description: 'Thick and thin Giemsa stained blood film parasite quantification.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-lab-003',
    code: 'LAB-CBC',
    name: 'Complete Blood Count (CBC / Hemogram)',
    category: 'Laboratory',
    dosageForm: 'Diagnostic',
    unitPrice: 20000,
    stockQuantity: 120,
    unit: 'test',
    isCoveredByDefault: true,
    description: 'Automated 18-parameter hematology panel including Hb, WBC, platelets.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-lab-004',
    code: 'LAB-RBS',
    name: 'Random Blood Glucose (RBS)',
    category: 'Laboratory',
    dosageForm: 'Diagnostic',
    unitPrice: 5000,
    stockQuantity: 300,
    unit: 'strip',
    isCoveredByDefault: true,
    description: 'Point-of-care capillary glucometry monitoring.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-lab-005',
    code: 'LAB-URN',
    name: 'Urinalysis 10-Parameter Strip',
    category: 'Laboratory',
    dosageForm: 'Diagnostic',
    unitPrice: 6000,
    stockQuantity: 200,
    unit: 'test',
    isCoveredByDefault: true,
    description: 'Screening for protein, glucose, ketones, nitrites, and leukocytes.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-lab-006',
    code: 'LAB-TYP',
    name: 'Widal Typhoid Agglutination Test',
    category: 'Laboratory',
    dosageForm: 'Diagnostic',
    unitPrice: 12000,
    stockQuantity: 85,
    unit: 'test',
    isCoveredByDefault: false,
    description: 'Serum antibody test for Salmonella enterica serotypes O & H.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-lab-007',
    code: 'LAB-SCK',
    name: 'Sickling Screening & Solubility Test',
    category: 'Laboratory',
    dosageForm: 'Diagnostic',
    unitPrice: 15000,
    stockQuantity: 110,
    unit: 'test',
    isCoveredByDefault: true,
    description: 'Rapid sodium metabisulfite sickling confirmation test.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },

  // 3. Injectables (Vials, Ampoules, Injections)
  {
    id: 'inv-inj-001',
    code: 'INJ-CTX',
    name: 'Ceftriaxone 1g Powder for Injection',
    category: 'Pharmacy',
    dosageForm: 'Injectable',
    unitPrice: 15000,
    stockQuantity: 85,
    unit: 'vial',
    isCoveredByDefault: true,
    description: 'Third-generation cephalosporin broad-spectrum antibiotic for IV/IM administration.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-inj-002',
    code: 'INJ-DIC',
    name: 'Diclofenac Sodium 75mg/3ml Injection',
    category: 'Pharmacy',
    dosageForm: 'Injectable',
    unitPrice: 4000,
    stockQuantity: 110,
    unit: 'ampoule',
    isCoveredByDefault: true,
    description: 'Potent injectable NSAID for acute severe pain, renal colic, and post-traumatic inflammation.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-inj-003',
    code: 'INJ-ART',
    name: 'Artemether 80mg/ml Injection',
    category: 'Pharmacy',
    dosageForm: 'Injectable',
    unitPrice: 10000,
    stockQuantity: 45,
    unit: 'ampoule',
    isCoveredByDefault: true,
    description: 'Fast-acting antimalarial injection for severe/complicated Plasmodium falciparum malaria.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-inj-004',
    code: 'INJ-DPO',
    name: 'Depo-Provera (Medroxyprogesterone 150mg/ml)',
    category: 'Pharmacy',
    dosageForm: 'Injectable',
    unitPrice: 12000,
    stockQuantity: 40,
    unit: 'vial',
    isCoveredByDefault: true,
    description: '3-month injectable progestin contraceptive for family planning.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-inj-005',
    code: 'INJ-DEX',
    name: 'Dexamethasone 4mg/ml Injection',
    category: 'Pharmacy',
    dosageForm: 'Injectable',
    unitPrice: 3500,
    stockQuantity: 65,
    unit: 'ampoule',
    isCoveredByDefault: true,
    description: 'Glucocorticoid for severe allergic reactions, croup, and acute inflammatory states.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },

  // 4. Tablets (Tabs)
  {
    id: 'inv-phm-001',
    code: 'MED-COA',
    name: 'Coartem (Artemether/Lumefantrine 20/120mg - 24 tabs)',
    category: 'Pharmacy',
    dosageForm: 'Tablet',
    unitPrice: 12000,
    stockQuantity: 150,
    unit: 'pack',
    isCoveredByDefault: true,
    description: 'First-line ACT antimalarial for uncomplicated malaria treatment.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-phm-002',
    code: 'MED-PCM',
    name: 'Paracetamol 500mg Tablets (10 Tablets Strip)',
    category: 'Pharmacy',
    dosageForm: 'Tablet',
    unitPrice: 2000,
    stockQuantity: 500,
    unit: 'strip',
    isCoveredByDefault: true,
    description: 'Analgesic and antipyretic for pain and fever reduction.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-phm-004',
    code: 'MED-IBU',
    name: 'Ibuprofen 400mg Tablets (10 Tablets Strip)',
    category: 'Pharmacy',
    dosageForm: 'Tablet',
    unitPrice: 3000,
    stockQuantity: 220,
    unit: 'strip',
    isCoveredByDefault: false,
    description: 'NSAID anti-inflammatory for joint pain, headache, and swelling.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-tab-001',
    code: 'MED-CIP',
    name: 'Ciprofloxacin 500mg Tablets (10 Tablets Strip)',
    category: 'Pharmacy',
    dosageForm: 'Tablet',
    unitPrice: 5000,
    stockQuantity: 130,
    unit: 'strip',
    isCoveredByDefault: true,
    description: 'Fluoroquinolone antibiotic for urinary tract and enteric bacterial infections.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-tab-002',
    code: 'MED-MTZ',
    name: 'Metronidazole 400mg Tablets (10 Tablets Strip)',
    category: 'Pharmacy',
    dosageForm: 'Tablet',
    unitPrice: 3000,
    stockQuantity: 175,
    unit: 'strip',
    isCoveredByDefault: true,
    description: 'Nitroimidazole antiprotozoal and anaerobic antibacterial agent.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-phm-007',
    code: 'MED-AML',
    name: 'Amlodipine 5mg Tablets (30 Tablets - Monthly Refill)',
    category: 'Pharmacy',
    dosageForm: 'Tablet',
    unitPrice: 15000,
    stockQuantity: 80,
    unit: 'box',
    isCoveredByDefault: true,
    description: 'Calcium channel blocker for essential hypertension control.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-phm-008',
    code: 'MED-MET',
    name: 'Metformin 500mg Tablets (60 Tablets - Monthly Refill)',
    category: 'Pharmacy',
    dosageForm: 'Tablet',
    unitPrice: 18000,
    stockQuantity: 70,
    unit: 'box',
    isCoveredByDefault: true,
    description: 'Biguanide oral hypoglycemic for Type 2 Diabetes maintenance.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-phm-010',
    code: 'MED-FOL',
    name: 'Folic Acid 5mg Tablets (30 Tablets)',
    category: 'Pharmacy',
    dosageForm: 'Tablet',
    unitPrice: 3000,
    stockQuantity: 300,
    unit: 'pack',
    isCoveredByDefault: true,
    description: 'Erythropoiesis co-factor for red blood cell turnover in sickle cell.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },

  // 5. Capsules (Caps)
  {
    id: 'inv-phm-003',
    code: 'MED-AMX',
    name: 'Amoxicillin 500mg Capsules (20 Capsules)',
    category: 'Pharmacy',
    dosageForm: 'Capsule',
    unitPrice: 8000,
    stockQuantity: 140,
    unit: 'pack',
    isCoveredByDefault: true,
    description: 'Broad-spectrum penicillin antibiotic for bacterial respiratory/ear infections.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-phm-006',
    code: 'MED-OMP',
    name: 'Omeprazole 20mg Capsules (14 Capsules Blister)',
    category: 'Pharmacy',
    dosageForm: 'Capsule',
    unitPrice: 10000,
    stockQuantity: 95,
    unit: 'pack',
    isCoveredByDefault: false,
    description: 'Proton pump inhibitor for peptic ulcer disease and acid reflux.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-cap-001',
    code: 'MED-DOX',
    name: 'Doxycycline 100mg Capsules (10 Capsules Strip)',
    category: 'Pharmacy',
    dosageForm: 'Capsule',
    unitPrice: 4500,
    stockQuantity: 110,
    unit: 'strip',
    isCoveredByDefault: true,
    description: 'Tetracycline antibiotic for pelvic infections, atypical pneumonia, and acne.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-phm-009',
    code: 'MED-HYD',
    name: 'Hydroxyurea 500mg Capsules (30 Capsules Bottle)',
    category: 'Pharmacy',
    dosageForm: 'Capsule',
    unitPrice: 35000,
    stockQuantity: 65,
    unit: 'bottle',
    isCoveredByDefault: true,
    description: 'Fetal hemoglobin inducer to prevent sickle cell vaso-occlusive crises.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },

  // 6. Topical (Creams, Ointments, Drops, Antiseptics)
  {
    id: 'inv-top-001',
    code: 'TOP-HYD',
    name: 'Hydrocortisone 1% Topical Cream (15g Tube)',
    category: 'Pharmacy',
    dosageForm: 'Topical',
    unitPrice: 8000,
    stockQuantity: 55,
    unit: 'tube',
    isCoveredByDefault: true,
    description: 'Mild topical corticosteroid for dermatitis, eczema, pruritus, and skin inflammation.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-top-002',
    code: 'TOP-CLT',
    name: 'Clotrimazole 1% Antifungal Cream (20g Tube)',
    category: 'Pharmacy',
    dosageForm: 'Topical',
    unitPrice: 7000,
    stockQuantity: 60,
    unit: 'tube',
    isCoveredByDefault: true,
    description: 'Broad-spectrum imidazole antifungal for candidiasis, ringworm (tinea), and athlete foot.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-top-003',
    code: 'TOP-BET',
    name: 'Betadine Povidone-Iodine 10% Solution (100ml Bottle)',
    category: 'Pharmacy',
    dosageForm: 'Topical',
    unitPrice: 9000,
    stockQuantity: 40,
    unit: 'bottle',
    isCoveredByDefault: true,
    description: 'Microbicidal skin disinfectant for wound antisepsis, burns, and minor abrasions.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-top-004',
    code: 'TOP-CHL',
    name: 'Chloramphenicol 1% Eye/Ear Ointment (5g Tube)',
    category: 'Pharmacy',
    dosageForm: 'Topical',
    unitPrice: 6000,
    stockQuantity: 50,
    unit: 'tube',
    isCoveredByDefault: true,
    description: 'Ophthalmic antibacterial ointment for bacterial conjunctivitis and blepharitis.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },

  // 7. Syrups & Suspensions (Oral Liquids)
  {
    id: 'inv-syr-001',
    code: 'SYR-PCM',
    name: 'Paracetamol Paediatric Syrup 120mg/5ml (100ml)',
    category: 'Pharmacy',
    dosageForm: 'Syrup',
    unitPrice: 5000,
    stockQuantity: 85,
    unit: 'bottle',
    isCoveredByDefault: true,
    description: 'Pleasant pediatric suspension for pain and fever control in infants and children.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-syr-002',
    code: 'SYR-AMX',
    name: 'Amoxicillin Oral Suspension 125mg/5ml (100ml)',
    category: 'Pharmacy',
    dosageForm: 'Syrup',
    unitPrice: 7500,
    stockQuantity: 65,
    unit: 'bottle',
    isCoveredByDefault: true,
    description: 'Dry powder suspension for reconstitution for pediatric acute respiratory infections.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-syr-003',
    code: 'SYR-MLT',
    name: 'Multivitamin Pediatric Syrup with Lysine (100ml)',
    category: 'Pharmacy',
    dosageForm: 'Syrup',
    unitPrice: 8000,
    stockQuantity: 70,
    unit: 'bottle',
    isCoveredByDefault: true,
    description: 'Appetite and immune support tonic with essential vitamins and zinc.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-syr-004',
    code: 'SYR-CGH',
    name: 'Pediatric Cough Expectorant Linctus (100ml Bottle)',
    category: 'Pharmacy',
    dosageForm: 'Syrup',
    unitPrice: 6000,
    stockQuantity: 60,
    unit: 'bottle',
    isCoveredByDefault: false,
    description: 'Expectorant cough syrup for relief of chesty productive coughs in children.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-phm-005',
    code: 'MED-ORS',
    name: 'Oral Rehydration Salts (ORS) + Zinc Dispersible (Pack)',
    category: 'Pharmacy',
    dosageForm: 'Syrup',
    unitPrice: 4000,
    stockQuantity: 190,
    unit: 'pack',
    isCoveredByDefault: true,
    description: 'WHO formula dehydration management for acute gastroenteritis/diarrhea.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },

  // 8. IV Fluids & Infusions
  {
    id: 'inv-ivf-001',
    code: 'IVF-NS',
    name: 'Normal Saline (0.9% NaCl) IV Infusion 500ml Bottle',
    category: 'Procedure',
    dosageForm: 'IV Fluid',
    unitPrice: 8000,
    stockQuantity: 90,
    unit: 'bottle',
    isCoveredByDefault: true,
    description: 'Isotonic crystalloid solution for vascular volume re-expansion and emergency fluid resuscitation.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-ivf-002',
    code: 'IVF-RL',
    name: 'Ringers Lactate (Hartmanns) IV Infusion 500ml Bottle',
    category: 'Procedure',
    dosageForm: 'IV Fluid',
    unitPrice: 9000,
    stockQuantity: 75,
    unit: 'bottle',
    isCoveredByDefault: true,
    description: 'Balanced electrolyte solution for dehydration, acute blood loss, and metabolic acidosis.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-ivf-003',
    code: 'IVF-D5',
    name: 'Dextrose 5% in Water (D5W) IV Infusion 500ml Bottle',
    category: 'Procedure',
    dosageForm: 'IV Fluid',
    unitPrice: 8500,
    stockQuantity: 60,
    unit: 'bottle',
    isCoveredByDefault: true,
    description: 'Hypotonic glucose solution for maintenance hydration and hypoglycemia.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },

  // 9. Supplies & Consumables
  {
    id: 'inv-sup-001',
    code: 'SUP-SYR',
    name: 'Sterile Disposable Syringe & Needle 5ml (Pack of 10)',
    category: 'Supplies',
    dosageForm: 'Supply',
    unitPrice: 2500,
    stockQuantity: 150,
    unit: 'pack',
    isCoveredByDefault: true,
    description: 'Single-use 5ml Luer lock syringe with 21G sterile needle.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-sup-002',
    code: 'SUP-CAN',
    name: 'Intravenous Cannula 20G / 22G with Injection Port',
    category: 'Supplies',
    dosageForm: 'Supply',
    unitPrice: 3000,
    stockQuantity: 120,
    unit: 'piece',
    isCoveredByDefault: true,
    description: 'PTFE radiopaque peripheral IV catheter with injection port and wings.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-sup-003',
    code: 'SUP-GAU',
    name: 'Sterile Cotton Gauze Swabs & Crepe Bandage (Pack)',
    category: 'Supplies',
    dosageForm: 'Supply',
    unitPrice: 4000,
    stockQuantity: 110,
    unit: 'pack',
    isCoveredByDefault: true,
    description: 'Absorbent medical dressing pack with 10x10cm gauze and elastic retention bandage.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-sup-004',
    code: 'SUP-GLV',
    name: 'Surgical Latex Examination Gloves (Pair)',
    category: 'Supplies',
    dosageForm: 'Supply',
    unitPrice: 1500,
    stockQuantity: 280,
    unit: 'pair',
    isCoveredByDefault: true,
    description: 'Pre-powdered medical examination gloves for hygienic clinical contact.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },

  // 10. Clinical Procedures & Services
  {
    id: 'inv-prc-001',
    code: 'PRC-WND',
    name: 'Wound Cleaning, Aseptic Dressing & Bandaging',
    category: 'Procedure',
    dosageForm: 'Diagnostic',
    unitPrice: 10000,
    stockQuantity: 999,
    unit: 'session',
    isCoveredByDefault: false,
    description: 'Antiseptic surgical wound dressing with sterile gauze and clinical review.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-prc-002',
    code: 'PRC-IVF',
    name: 'Normal Saline 500ml IV Infusion & Cannulation Session',
    category: 'Procedure',
    dosageForm: 'IV Fluid',
    unitPrice: 18000,
    stockQuantity: 75,
    unit: 'session',
    isCoveredByDefault: false,
    description: 'Intravenous hydration therapy including cannula insertion, giving set, and monitoring.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-prc-003',
    code: 'PRC-NEB',
    name: 'Salbutamol Nebulization Session',
    category: 'Procedure',
    dosageForm: 'Diagnostic',
    unitPrice: 15000,
    stockQuantity: 50,
    unit: 'session',
    isCoveredByDefault: true,
    description: 'Acute bronchodilator inhalation for bronchospasm and acute asthma relief.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'inv-prc-004',
    code: 'PRC-USC',
    name: 'Pelvic & Abdominal Ultrasound Scan',
    category: 'Procedure',
    dosageForm: 'Diagnostic',
    unitPrice: 35000,
    stockQuantity: 999,
    unit: 'scan',
    isCoveredByDefault: true,
    description: 'Diagnostic Sonography imaging with printed clinical radiology report.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud-sys-init',
    userId: 'usr-system',
    userName: 'Afya Medicare Network',
    action: 'SYSTEM_BOOTSTRAP',
    entityType: 'System',
    entityId: 'afya-core',
    newValue: 'Afya Medicare Network initialized for Kitende – Mwenda Stage, Uganda',
    timestamp: new Date().toISOString()
  }
];
