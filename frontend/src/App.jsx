import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import AppShell from './components/AppShell';
import LandingPage from './pages/LandingPage';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DisruptionModal from './components/DisruptionModal';
import AddHarvestModal from './components/AddHarvestModal';
import AiAssistantModal from './components/AiAssistantModal';
import AuthModal from './pages/AuthModal';
import AuthPage from './pages/AuthPage';
import { api } from './services/api';

function MainApp() {
  const { role, user, setIsAuthModalOpen } = useAuth();
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'auth' | 'dashboard'

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
    <AppShell
      currentView={currentView}
      onSelectView={setCurrentView}
      onOpenAiModal={() => setIsAiModalOpen(true)}
    >
      {currentView === 'auth' || (currentView === 'dashboard' && !user) ? (
        <AuthPage
          onLoginSuccess={() => setCurrentView('dashboard')}
          onBack={() => setCurrentView('home')}
        />
      ) : currentView === 'home' || !user ? (
        <LandingPage
          onGetStarted={() => {
            if (user) {
              setCurrentView('dashboard');
            } else {
              setCurrentView('auth');
            }
          }}
          onSelectView={setCurrentView}
        />
      ) : (
        <>
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
        </>
      )}

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
    </AppShell>
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
