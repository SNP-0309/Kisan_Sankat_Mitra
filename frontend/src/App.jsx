import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DisruptionModal from './components/DisruptionModal';
import AddHarvestModal from './components/AddHarvestModal';
import AiAssistantModal from './components/AiAssistantModal';
import AuthModal from './pages/AuthModal';
import { api } from './services/api';

function MainApp() {
  const { role, user } = useAuth();
  const { t } = useLanguage();

  const [harvests, setHarvests] = useState([]);
  const [loadingHarvests, setLoadingHarvests] = useState(true);

  // Modals state
  const [isDisruptionOpen, setIsDisruptionOpen] = useState(false);
  const [isAddHarvestOpen, setIsAddHarvestOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    loadHarvests();
  }, []);

  const loadHarvests = async () => {
    setLoadingHarvests(true);
    try {
      const res = await api.getHarvests();
      if (res?.data) {
        setHarvests(res.data);
      }
    } catch (err) {
      console.warn('Failed to load harvests:', err);
    } finally {
      setLoadingHarvests(false);
    }
  };

  const handleDisruptionTriggered = (updatedHarvest) => {
    setHarvests((prev) =>
      prev.map((h) => (h._id === updatedHarvest._id ? updatedHarvest : h))
    );
  };

  const handleHarvestAdded = (newHarvest) => {
    setHarvests((prev) => [newHarvest, ...prev]);
  };

  const handleHarvestUpdated = (harvestId, newStatus) => {
    setHarvests((prev) =>
      prev.map((h) => (h._id === harvestId ? { ...h, status: newStatus } : h))
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenAiModal={() => setIsAiModalOpen(true)} />

      <main className="app-container" style={{ flex: 1 }}>
        {role === 'farmer' && (
          <FarmerDashboard
            harvests={harvests}
            onOpenDisruptionModal={() => setIsDisruptionOpen(true)}
            onOpenAddHarvestModal={() => setIsAddHarvestOpen(true)}
            onHarvestUpdated={handleHarvestUpdated}
          />
        )}

        {role === 'buyer' && (
          <BuyerDashboard
            harvests={harvests}
            onHarvestUpdated={handleHarvestUpdated}
          />
        )}

        {role === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Modals */}
      <DisruptionModal
        isOpen={isDisruptionOpen}
        onClose={() => setIsDisruptionOpen(false)}
        harvests={harvests}
        onDisruptionTriggered={handleDisruptionTriggered}
      />

      <AddHarvestModal
        isOpen={isAddHarvestOpen}
        onClose={() => setIsAddHarvestOpen(false)}
        onHarvestAdded={handleHarvestAdded}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      <AuthModal />

      {/* Platform Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-light)',
          background: '#ffffff',
          padding: '24px 20px',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🌾</span>
            <strong>FasalRakshak AI (फसल रक्षक)</strong>
            <span>— Built for Indian Agriculture & Perishable Supply Chain Resilience</span>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <span>Nashik APMC Gateway</span>
            <span>•</span>
            <span>Gemini 2.0 AI Sandboxed</span>
            <span>•</span>
            <span>Pure Deterministic Recovery</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
