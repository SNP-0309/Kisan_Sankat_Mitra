import React, { useState } from 'react';
import { PillNav } from './ui';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AppShell({
  children,
  currentView = 'home',
  onSelectView,
  onOpenAiModal,
  activeSection,
  onSelectSection,
}) {
  const { user, role, logout, setIsAuthModalOpen } = useAuth();
  const { t, lang, setLang } = useLanguage();

  // Determine dynamic links according to active user identity & current view
  const getNavLinks = () => {
    if (currentView === 'auth') {
      return [
        { id: 'go-home', label: '← Platform Home' },
      ];
    }

    if (!user || currentView === 'home') {
      const publicLinks = [
        { id: 'overview', label: 'Overview' },
        { id: 'howItWorks', label: 'How It Works' },
        { id: 'roles', label: 'Ecosystem' },
      ];
      if (user) {
        publicLinks.push({ id: 'go-dashboard', label: '⚡ Enter Portal' });
      } else {
        publicLinks.push({ id: 'go-auth', label: '🔑 Sign In / Register' });
      }
      return publicLinks;
    }

    if (role === 'farmer') {
      return [
        { id: 'go-home', label: '← Home' },
        { id: 'farmer-sos', label: '🚨 SOS Alert' },
        { id: 'farmer-recovery', label: '⚡ Recovery' },
        { id: 'farmer-batches', label: '🌾 Harvests' },
        { id: 'farmer-buyers-map', label: '🗺️ Buyers Map' },
        { id: 'farmer-mandis', label: '🏬 Mandis' },
      ];
    }

    if (role === 'buyer') {
      return [
        { id: 'go-home', label: '← Home' },
        { id: 'buyer-market', label: '🛒 Marketplace' },
        { id: 'buyer-distress', label: '⚡ Distress Lots' },
      ];
    }

    if (role === 'admin') {
      return [
        { id: 'go-home', label: '← Home' },
        { id: 'admin-telemetry', label: '📊 Telemetry' },
        { id: 'admin-facilities', label: '🏢 Facilities' },
      ];
    }

    return [{ id: 'go-home', label: '← Home' }];
  };

  const navLinks = getNavLinks();

  const handleLinkClick = (linkId) => {
    if (linkId === 'go-home') {
      if (onSelectView) onSelectView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (linkId === 'go-auth') {
      if (onSelectView) onSelectView('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (linkId === 'go-dashboard') {
      if (onSelectView) onSelectView(user ? 'dashboard' : 'auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentView !== 'home') {
      if (onSelectView) onSelectView('home');
      setTimeout(() => {
        const targetElement = document.getElementById(linkId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return;
    }

    if (onSelectSection) {
      onSelectSection(linkId);
    }

    // Smooth scroll to section anchor if present on page
    const targetElement = document.getElementById(linkId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Floating Pill Navbar with per-role links and mobile bottom pill bar */}
      <PillNav
        links={navLinks}
        activeLinkId={activeSection}
        onSelectLink={handleLinkClick}
        lang={lang}
        onSelectLang={setLang}
        onOpenAiModal={onOpenAiModal}
        user={user}
        role={role}
        onOpenAuth={() => (onSelectView ? onSelectView('auth') : setIsAuthModalOpen(true))}
        onLogout={() => {
          logout();
          if (onSelectView) onSelectView('home');
        }}
        onBrandClick={() => {
          if (currentView === 'dashboard' || currentView === 'auth') {
            if (onSelectView) onSelectView('home');
          } else {
            handleLinkClick('overview');
          }
        }}
      />

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1, padding: currentView === 'home' && !user ? '0' : undefined }}>
        {children}
      </main>
    </div>
  );
}
