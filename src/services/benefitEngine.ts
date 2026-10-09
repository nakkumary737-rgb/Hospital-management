import {
  Patient,
  Card,
  HealthcarePackage,
  Membership,
  BenefitCoverageStatus,
  Facility
} from '../types';

export interface BenefitCheckInput {
  patient: Patient;
  card?: Card;
  membership?: Membership;
  packageItem?: HealthcarePackage;
  requestedService: string;
  facility: Facility;
}

export interface BenefitCheckResult {
  status: BenefitCoverageStatus;
  isEligible: boolean;
  reason: string;
  visitsRemaining: number;
  copayRequiredUGX: number;
  requiresAuthorization: boolean;
  notes: string;
}

export function evaluateBenefitCoverage(input: BenefitCheckInput): BenefitCheckResult {
  const { patient, card, membership, packageItem, requestedService, facility } = input;

  // 1. Is the patient active?
  if (patient.status !== 'ACTIVE') {
    return {
      status: 'NOT_COVERED',
      isEligible: false,
      reason: `Patient account is currently ${patient.status}. Services cannot be authorized.`,
      visitsRemaining: membership ? membership.visitsRemaining : 0,
      copayRequiredUGX: 0,
      requiresAuthorization: false,
      notes: 'Reception must review patient status.'
    };
  }

  // 2. Is the card valid?
  if (card && card.status !== 'ACTIVE') {
    return {
      status: 'NOT_COVERED',
      isEligible: false,
      reason: `Card ${card.cardNumber} is ${card.status}. Cannot authorize benefits on an inactive/blocked card.`,
      visitsRemaining: membership ? membership.visitsRemaining : 0,
      copayRequiredUGX: 0,
      requiresAuthorization: false,
      notes: 'Card must be unblocked or replaced.'
    };
  }

  // 3. Is there a membership?
  if (!membership || !packageItem) {
    return {
      status: 'NOT_COVERED',
      isEligible: false,
      reason: 'No active healthcare package membership found for this patient.',
      visitsRemaining: 0,
      copayRequiredUGX: 0,
      requiresAuthorization: false,
      notes: 'Patient can purchase a package or pay out-of-pocket.'
    };
  }

  // 4. Is the membership active & within validity date?
  const now = new Date();
  const expiry = new Date(membership.expiryDate);
  if (membership.status !== 'ACTIVE' || expiry < now) {
    return {
      status: 'NOT_COVERED',
      isEligible: false,
      reason: `Membership has ${membership.status === 'ACTIVE' ? 'expired on ' + membership.expiryDate.split('T')[0] : membership.status}.`,
      visitsRemaining: membership.visitsRemaining,
      copayRequiredUGX: 0,
      requiresAuthorization: false,
      notes: 'Membership renewal required.'
    };
  }

  // 5. Does the patient have remaining entitlement?
  // Formula: Visits Remaining = Visits Purchased – Valid Covered Visits Used
  const calculatedRemaining = Math.max(0, membership.visitsPurchased - membership.visitsUsed);
  if (calculatedRemaining <= 0) {
    return {
      status: 'NOT_COVERED',
      isEligible: false,
      reason: 'All covered visits for this package have been exhausted (0 remaining).',
      visitsRemaining: 0,
      copayRequiredUGX: 0,
      requiresAuthorization: false,
      notes: 'Patient may purchase an add-on or renew package.'
    };
  }

  // 6. Is the service available at this facility?
  const facilityOffersService = facility.allowedServices.some(s =>
    s.toLowerCase().includes(requestedService.toLowerCase()) ||
    requestedService.toLowerCase().includes(s.toLowerCase())
  );
  if (!facilityOffersService && facility.type !== 'afya_medicare') {
    return {
      status: 'NOT_COVERED',
      isEligible: false,
      reason: `Requested service "${requestedService}" is not contracted or offered at ${facility.name}.`,
      visitsRemaining: calculatedRemaining,
      copayRequiredUGX: 0,
      requiresAuthorization: false,
      notes: 'Patient should be redirected to Afya Medicare Central Clinic.'
    };
  }

  // 7. Is the service explicitly excluded in package rules?
  const isExcluded = packageItem.excludedServices.some(ex =>
    requestedService.toLowerCase().includes(ex.toLowerCase())
  );
  if (isExcluded) {
    return {
      status: 'NOT_COVERED',
      isEligible: false,
      reason: `"${requestedService}" is an excluded service under ${packageItem.name}.`,
      visitsRemaining: calculatedRemaining,
      copayRequiredUGX: 0,
      requiresAuthorization: false,
      notes: 'Standard fee schedule applies out-of-pocket.'
    };
  }

  // 8. Is this at a Partner facility?
  const isPartnerFacility = facility.type !== 'afya_medicare';
  if (isPartnerFacility) {
    // Partner facility access requires authorization or pre-authorization
    return {
      status: 'AUTHORIZATION_REQUIRED',
      isEligible: true,
      reason: `Service at partner facility (${facility.name}) requires verified network pre-authorization.`,
      visitsRemaining: calculatedRemaining,
      copayRequiredUGX: 0,
      requiresAuthorization: true,
      notes: 'Submit authorization request to Afya Network Adjudication.'
    };
  }

  // 9. Check if service is fully or partially covered under package
  const isFullyCovered = packageItem.coveredServices.some(cs =>
    requestedService.toLowerCase().includes(cs.toLowerCase()) ||
    cs.toLowerCase().includes(requestedService.toLowerCase())
  );

  if (isFullyCovered) {
    return {
      status: 'COVERED',
      isEligible: true,
      reason: `Fully covered under ${packageItem.name}. Will consume 1 covered visit.`,
      visitsRemaining: calculatedRemaining,
      copayRequiredUGX: 0,
      requiresAuthorization: false,
      notes: `1 visit will be deducted upon clinical encounter confirmation. Post-deduction remaining: ${calculatedRemaining - 1}.`
    };
  }

  // Check specialist / ultrasound partial coverage
  if (requestedService.toLowerCase().includes('specialist') || requestedService.toLowerCase().includes('ultrasound')) {
    if (packageItem.packageType === 'INDIVIDUAL_PREMIUM' || packageItem.packageType === 'FAMILY_PREMIUM') {
      return {
        status: 'COVERED',
        isEligible: true,
        reason: `Included premium tier benefit under ${packageItem.name}.`,
        visitsRemaining: calculatedRemaining,
        copayRequiredUGX: 0,
        requiresAuthorization: false,
        notes: 'Premium entitlement verified.'
      };
    } else {
      return {
        status: 'PARTIALLY_COVERED',
        isEligible: true,
        reason: `Partial co-payment benefit available on basic package.`,
        visitsRemaining: calculatedRemaining,
        copayRequiredUGX: 20000,
        requiresAuthorization: false,
        notes: 'Co-payment required at cashier desk.'
      };
    }
  }

  // Default fallback for general care within clinic
  return {
    status: 'COVERED',
    isEligible: true,
    reason: `Standard outpatient encounter covered by package entitlement.`,
    visitsRemaining: calculatedRemaining,
    copayRequiredUGX: 0,
    requiresAuthorization: false,
    notes: `Encounter consumes 1 covered visit.`
  };
}
