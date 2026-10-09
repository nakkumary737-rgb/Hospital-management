import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, Visit } from '../../types';
import {
  UserPlus,
  X,
  CheckCircle2,
  Stethoscope,
  Activity,
  HeartPulse,
  Phone,
  MapPin,
  Calendar,
  User,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface WalkInHMISModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEncounterCreated: (visit: Visit, patient: Patient) => void;
}

export const WalkInHMISModal: React.FC<WalkInHMISModalProps> = ({
  isOpen,
  onClose,
  onEncounterCreated
}) => {
  const {
    patients,
    registerPatient,
    recordVisit,
    visits,
    currentFacility,
    currentUser,
    showToast
  } = useApp();

  // Form State for Non-Card / Walk-In Patient
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male'>('Female');
  const [ageYears, setAgeYears] = useState('28');
  const [address, setAddress] = useState('Kitende, Entebbe Road');
  const [department, setDepartment] = useState('General Outpatient (OPD)');
  const [reasonForVisit, setReasonForVisit] = useState('Fever, headache, general body weakness');
  const [prelimDiagnosis, setPrelimDiagnosis] = useState('Suspected Malaria / Viral Syndrome');
  const [attendingDoctor, setAttendingDoctor] = useState('Dr. Mukasa David (Medical Officer)');

  // Triage vitals
  const [vitalsBp, setVitalsBp] = useState('120/80');
  const [vitalsTemp, setVitalsTemp] = useState('37.8');
  const [vitalsPulse, setVitalsPulse] = useState('84');
  const [vitalsSpo2, setVitalsSpo2] = useState('98');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please enter patient full name.', 'error');
      return;
    }

    // 1. Calculate approximate date of birth from age
    const currentYear = new Date().getFullYear();
    const parsedAge = parseInt(ageYears, 10) || 25;
    const birthYear = currentYear - parsedAge;
    const approximateDob = `${birthYear}-01-01`;

    // 2. Check if a non-card or existing patient already exists with this name and phone
    let targetPatient: Patient | undefined = patients.find(
      p => p.fullName.toLowerCase() === fullName.trim().toLowerCase() && (phone ? p.phone.includes(phone.trim()) : true)
    );

    // If not found, create new non-card patient
    if (!targetPatient) {
      const reg = registerPatient({
        fullName: fullName.trim(),
        dob: approximateDob,
        sex: gender,
        phone: phone.trim() || 'N/A',
        address: address.trim() || 'General OPD',
        status: 'ACTIVE',
        emergencyContact: {
          name: 'Walk-in relative',
          relationship: 'Family Member',
          phone: phone.trim() || 'N/A'
        },
        notes: 'Non-Afya card patient • Cash / Self-pay OPD registered at Reception Desk'
      });
      targetPatient = reg.patient;
    }

    if (!targetPatient) {
      showToast('Could not register patient record. Please check inputs.', 'error');
      return;
    }

    // 3. Format triage vitals string
    const triageString = `BP: ${vitalsBp} mmHg, Temp: ${vitalsTemp}°C, HR: ${vitalsPulse} bpm, SpO2: ${vitalsSpo2}%`;

    // 4. Generate queue number for today
    const queueNumber = `Q-${String(visits.length + 1).padStart(3, '0')}`;

    // 5. Record official MOH HMIS 031 Visit encounter
    const { visit } = recordVisit({
      patientId: targetPatient.id,
      patientName: targetPatient.fullName,
      cardId: undefined, // Explicitly no Afya card
      facilityId: currentFacility.id,
      facilityName: currentFacility.name,
      department: department,
      providerName: attendingDoctor,
      serviceName: reasonForVisit,
      coverageStatus: 'NOT_COVERED', // Cash OPD
      visitDeducted: false,
      copaymentAmount: 0,
      notes: `Chief Complaint: ${reasonForVisit}. Prelim Dx: ${prelimDiagnosis}`,
      visitType: department,
      reasonForVisit: reasonForVisit,
      diagnosis: prelimDiagnosis,
      queueNumber: queueNumber,
      triageVitals: triageString,
      receptionStaff: currentUser.displayName,
      paymentStatus: 'PENDING'
    });

    showToast(`Registered ${targetPatient.fullName} in HMIS Daily Register! Queue: ${queueNumber}`, 'success');
    onEncounterCreated(visit, targetPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-60 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base">Log Walk-in / Non-Card Patient</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-900 text-teal-200 border border-teal-700">
                  MOH HMIS 031
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Register general patients without an Afya card for daily attendance, triage, and billing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Section 1: Demographics */}
          <div>
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>1. Patient Personal Info</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Full Patient Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Samuel Okello"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={ageYears}
                  onChange={e => setAgeYears(e.target.value)}
                  placeholder="28"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0701445920"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Village / Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Kitende, Zone B"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Encounter & Department */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>2. Clinic Encounter &amp; Reason</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinic Department *</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="General Outpatient (OPD)">General Outpatient (OPD)</option>
                  <option value="Antenatal Care (ANC)">Antenatal Care (ANC)</option>
                  <option value="Child Health / Immunization">Child Health / Immunization</option>
                  <option value="Emergency &amp; Triage">Emergency &amp; Triage</option>
                  <option value="Dental Clinic">Dental Clinic</option>
                  <option value="Eye / Ophthalmology">Eye / Ophthalmology</option>
                  <option value="Laboratory Diagnostic">Laboratory Diagnostic</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Attending Clinician</label>
                <input
                  type="text"
                  value={attendingDoctor}
                  onChange={e => setAttendingDoctor(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chief Complaint / Symptoms *</label>
                <input
                  type="text"
                  required
                  value={reasonForVisit}
                  onChange={e => setReasonForVisit(e.target.value)}
                  placeholder="e.g. Fever, cough for 3 days"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Preliminary Diagnosis</label>
                <input
                  type="text"
                  value={prelimDiagnosis}
                  onChange={e => setPrelimDiagnosis(e.target.value)}
                  placeholder="e.g. Malaria / URTI"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Triage Vitals */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>3. Triage Vital Signs</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <label className="font-semibold text-slate-600 block text-[10px] mb-1">BP (mmHg)</label>
                <input
                  type="text"
                  value={vitalsBp}
                  onChange={e => setVitalsBp(e.target.value)}
                  placeholder="120/80"
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block text-[10px] mb-1">Temp (°C)</label>
                <input
                  type="text"
                  value={vitalsTemp}
                  onChange={e => setVitalsTemp(e.target.value)}
                  placeholder="37.2"
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block text-[10px] mb-1">Heart Rate (bpm)</label>
                <input
                  type="text"
                  value={vitalsPulse}
                  onChange={e => setVitalsPulse(e.target.value)}
                  placeholder="78"
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block text-[10px] mb-1">SpO2 (%)</label>
                <input
                  type="text"
                  value={vitalsSpo2}
                  onChange={e => setVitalsSpo2(e.target.value)}
                  placeholder="98"
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* Notice info banner */}
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-2 text-teal-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              This patient will be logged into the <strong>MOH HMIS Daily Attendance Register</strong> and automatically added to the <strong>Cashier &amp; Billing Desk</strong> queue for prescription and service billing.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Register in HMIS &amp; Issue Slip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
