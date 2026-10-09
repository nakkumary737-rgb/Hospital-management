import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { HMISDataView } from './components/views/HMISDataView';
import { ReceptionScanView } from './components/views/ReceptionScanView';
import { PatientsView } from './components/views/PatientsView';
import { CardsView } from './components/views/CardsView';
import { PackagesView } from './components/views/PackagesView';
import { InventoryView } from './components/views/InventoryView';
import { PointOfSaleView } from './components/views/PointOfSaleView';
import { ChronicCareView } from './components/views/ChronicCareView';
import { SickleCellView } from './components/views/SickleCellView';
import { VisitsView } from './components/views/VisitsView';
import { PaymentsView } from './components/views/PaymentsView';
import { PartnerNetworkView } from './components/views/PartnerNetworkView';
import { ReportsView } from './components/views/ReportsView';
import { AuditLogView } from './components/views/AuditLogView';
import { CardScannerModal } from './components/scanner/CardScannerModal';
import { RegisterPatientModal } from './components/patients/RegisterPatientModal';
import { PvcCardPreviewModal } from './components/cards/PvcCardPreviewModal';
import { hardwareScanner } from './services/hardwareScanner';

const MainAppContent: React.FC = () => {
  const { cards, patients, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [showGlobalScanner, setShowGlobalScanner] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [previewCardId, setPreviewCardId] = useState<string | null>(null);
  const [searchScanQuery, setSearchScanQuery] = useState<string>('');

  // Global external hardware barcode / QR scanner gun listener
  useEffect(() => {
    const unsub = hardwareScanner.addListener(scannedCode => {
      setSearchScanQuery(scannedCode);
      setActiveTab('scanner');
      showToast(`Hardware Scanner Input: ${scannedCode}`, 'info');
    });

    return () => {
      unsub();
    };
  }, [showToast]);

  const handleGlobalSearch = (query: string) => {
    setSearchScanQuery(query);
    setActiveTab('scanner');
  };

  const handleScanCardFound = (query: string) => {
    setSearchScanQuery(query);
    setActiveTab('scanner');
    setShowGlobalScanner(false);
  };

  const previewCard = cards.find(c => c.id === previewCardId);
  const previewPatient = previewCard ? patients.find(p => p.id === previewCard.patientId) : undefined;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenScanner={() => setShowGlobalScanner(true)}
        onSearch={handleGlobalSearch}
      />

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onScanCard={() => setActiveTab('scanner')}
              onNewPatient={() => setShowRegisterModal(true)}
              onNavigate={tab => setActiveTab(tab)}
              onSelectPatient={id => setActiveTab('patients')}
            />
          )}

          {activeTab === 'pos' && <PointOfSaleView />}

          {activeTab === 'hmis' && (
            <HMISDataView
              onNavigateToVisits={() => setActiveTab('visits')}
              onNavigateToScanner={() => setActiveTab('scanner')}
            />
          )}

          {activeTab === 'scanner' && (
            <ReceptionScanView
              initialQuery={searchScanQuery}
              onClearInitialQuery={() => setSearchScanQuery('')}
              onNavigateToHMIS={() => setActiveTab('hmis')}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsView
              onNewPatient={() => setShowRegisterModal(true)}
              onOpenCardPreview={cardId => setPreviewCardId(cardId)}
              onScanCardForPatient={cardNumber => {
                setSearchScanQuery(cardNumber);
                setActiveTab('scanner');
              }}
            />
          )}

          {activeTab === 'cards' && (
            <CardsView
              onOpenCardPreview={cardId => setPreviewCardId(cardId)}
              onScanCard={cardNumber => {
                setSearchScanQuery(cardNumber);
                setActiveTab('scanner');
              }}
            />
          )}

          {activeTab === 'packages' && <PackagesView />}

          {activeTab === 'inventory' && <InventoryView />}

          {activeTab === 'chronic' && (
            <ChronicCareView
              onScanCard={cardNumber => {
                setSearchScanQuery(cardNumber);
                setActiveTab('scanner');
              }}
              onOpenCardPreview={cardId => setPreviewCardId(cardId)}
            />
          )}

          {activeTab === 'sickle_cell' && (
            <SickleCellView
              onScanCard={cardNumber => {
                setSearchScanQuery(cardNumber);
                setActiveTab('scanner');
              }}
              onOpenCardPreview={cardId => setPreviewCardId(cardId)}
            />
          )}

          {activeTab === 'visits' && <VisitsView onNavigateToHMIS={() => setActiveTab('hmis')} />}

          {activeTab === 'payments' && <PaymentsView />}

          {activeTab === 'partner_portal' && <PartnerNetworkView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'audit' && <AuditLogView />}
        </main>
      </div>

      {/* Global Scanner Modal */}
      {showGlobalScanner && (
        <CardScannerModal
          isOpen={true}
          onClose={() => setShowGlobalScanner(false)}
          onCardFound={handleScanCardFound}
        />
      )}

      {/* Global Register Patient Modal */}
      {showRegisterModal && (
        <RegisterPatientModal
          isOpen={true}
          onClose={() => setShowRegisterModal(false)}
          onSelectExistingPatient={p => {
            const c = cards.find(card => card.patientId === p.id);
            if (c) {
              setSearchScanQuery(c.cardNumber);
              setActiveTab('scanner');
            }
          }}
        />
      )}

      {/* Global PVC Card Preview Modal */}
      {previewCard && previewPatient && (
        <PvcCardPreviewModal
          isOpen={true}
          onClose={() => setPreviewCardId(null)}
          card={previewCard}
          patient={previewPatient}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
