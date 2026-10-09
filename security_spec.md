# Security Specification for Afya Health Membership & Care Network

## 1. Data Invariants & Zero-Trust Access Control
1. **Clinical / Financial Separation:** Sickle Cell profiles are strictly clinical identification records; no financial transactions, payment balances, or package visit calculations are permitted to be stored or queried on sickle cell profile collections.
2. **Visit Calculation Integrity:** Visits remaining must follow the strict rule: `Visits Remaining = Visits Purchased - Valid Covered Visits Used`. Deductions cannot exceed remaining visits and every deduction must create an auditable transaction.
3. **Card Identity & Status:** Inactive, blocked, lost, or stolen cards cannot authorize clinical services or visit deductions. Card replacement must link to the existing patient identity without duplicate patient creation.
4. **Partner Isolation:** Partner facility staff must only query authorizations, claims, and settlements belonging to their assigned `facilityId`. Partner staff cannot query the entire patient database or edit package prices.
5. **Auditability:** High-value actions (card blocking, package price adjustments, visit reversals, payment refunds) must generate an audit log record.
6. **No E-Money Issuance:** Balances reflect only prepaid healthcare package visit allocations and clinical care programs for Afya Medicare and approved network providers.

## 2. The "Dirty Dozen" Threat Payloads
1. **Partner Cross-Facility Claim Scraping:** Partner user from Facility B queries claims where `facilityId == "afya_central"`. Must return PERMISSION_DENIED.
2. **Direct Visit Balance Tampering:** Receptionist attempts to manually update `visitsRemaining` on a membership without a corresponding valid visit transaction record. Must be rejected.
3. **Financial Data Injection on Sickle Cell Card:** Malicious client attempts to write `outstandingBalance` or `walletAmount` into `/sickleCellProfiles/{id}`. Must be rejected.
4. **Card Re-use on Blocked Card:** Attempting to log a covered visit using a card marked `status: "BLOCKED"` or `"LOST"`.
5. **Unauthorized Package Price Alteration:** Receptionist or partner doctor attempts to modify `/packages/{id}` price. Must be restricted to Admin.
6. **Orphaned Dependent Record:** Creating a `/familyMembers` record referencing a non-existent `primaryPatientId`.
7. **Negative Visit Deduction:** Sending `visitsUsed: -5` to artificially inflate available visits. Must be blocked.
8. **Unverified Email Privilege Escalation:** Setting `role: "super_admin"` in `/users/{uid}` via client write.
9. **Claim Amount Alteration After Approval:** Modifying `amountApproved` on `/claims/{id}` by non-admin provider.
10. **Shadow Field Injection:** Adding undocumented `isFreeVIP: true` to a membership document.
11. **Partner Unauthorized Patient Dumping:** Unbounded list query on `/patients` by a restricted partner facility account.
12. **Settlement Self-Approval:** Partner facility admin attempting to change settlement status to `"PAID"`.
