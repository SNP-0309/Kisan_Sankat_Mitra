import React, { useState, useEffect } from 'react';
import {
  PillButton,
  StatStrip,
  SectionHeading,
  PhotoCard,
  Badge,
} from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Truck, Sparkles, Store, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function LandingPage({ onGetStarted, onSelectView }) {
  const { t, lang } = useLanguage();
  const { user, switchDemoRole, setIsAuthModalOpen } = useAuth();

  const [statsData, setStatsData] = useState([
    { value: '0', label: t('statFarmers'), caption: 'Verified producers' },
    { value: '0', label: t('statBuyers'), caption: 'Commercial buyers' },
    { value: '0', label: t('statHarvests'), caption: 'Total batches' },
    { value: '0', label: t('statFacilities'), caption: 'Accredited mandis & storage' },
  ]);

  useEffect(() => {
    fetchLiveStats();
  }, [lang]);

  const fetchLiveStats = async () => {
    try {
      const res = await api.getHealth(); // Also checks stats
      const statsRes = await fetch('http://localhost:5000/api/v1/stats').then((r) =>
        r.ok ? r.json() : null
      );

      if (statsRes?.data) {
        setStatsData([
          {
            value: statsRes.data.farmers > 0 ? statsRes.data.farmers.toLocaleString() : '0',
            label: t('statFarmers'),
            caption: 'Verified producers',
          },
          {
            value: statsRes.data.verifiedBuyers > 0 ? statsRes.data.verifiedBuyers.toLocaleString() : '0',
            label: t('statBuyers'),
            caption: 'Accredited buyers',
          },
          {
            value: statsRes.data.harvests > 0 ? statsRes.data.harvests.toLocaleString() : '0',
            label: t('statHarvests'),
            caption: 'Batches managed',
          },
          {
            value: statsRes.data.facilities > 0 ? statsRes.data.facilities.toLocaleString() : '0',
            label: t('statFacilities'),
            caption: 'Mandis & cold stores',
          },
        ]);
      }
    } catch (_) {
      // Keep clean 0 or no data yet; never fabricate numbers
    }
  };

  const handleAction = (targetRole) => {
    if (targetRole && switchDemoRole) {
      switchDemoRole(targetRole);
      if (onSelectView) {
        onSelectView('dashboard');
      }
      return;
    }

    if (user) {
      if (onSelectView) {
        onSelectView('dashboard');
      } else if (onGetStarted) {
        onGetStarted();
      }
    } else {
      if (onSelectView) {
        onSelectView('auth');
      } else if (onGetStarted) {
        onGetStarted();
      } else {
        setIsAuthModalOpen(true);
      }
    }
  };

  return (
    <div className="landing-page" style={{ paddingBottom: '60px' }}>
      {/* 1. Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '60px 20px 40px',
          maxWidth: '1060px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Subtle Decorative Sparkle */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '5%',
            color: 'var(--color-orange-accent)',
            fontSize: '24px',
            opacity: 0.7,
            userSelect: 'none',
          }}
        >
          ✦
        </div>
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '8%',
            color: 'var(--color-green-success)',
            fontSize: '18px',
            opacity: 0.7,
            userSelect: 'none',
          }}
        >
          ✦
        </div>

        {/* Category Pill Tag */}
        <div style={{ display: 'inline-block', marginBottom: '16px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              background: '#FFFFFF',
              border: '1px solid var(--color-border)',
              fontSize: '0.8rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: 'var(--color-forest-medium)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-green-success)' }} />
            <span>Top Notch Agro Recovery Platform</span>
          </span>
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
            fontWeight: 800,
            color: 'var(--color-forest-black)',
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            margin: '0 auto 20px',
            maxWidth: '920px',
          }}
        >
          {t('heroHeadline')}
        </h1>

        {/* Subline */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            maxWidth: '720px',
            margin: '0 auto 28px',
          }}
        >
          {t('heroSubline')}
        </p>

        {/* Hero CTA Button */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <PillButton variant="dark" size="lg" onClick={handleAction} showArrow>
            {t('heroCta')}
          </PillButton>
        </div>

        {/* Rounded Hero Photo Tile with Overlay */}
        <div
          style={{
            marginTop: '48px',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-border)',
            position: 'relative',
            maxHeight: '520px',
          }}
        >
          <img
            src="/images/hero_farm.jpg"
            alt="Lush agricultural farmland in Maharashtra"
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '520px',
              objectFit: 'cover',
              display: 'block',
            }}
          />

          {/* Caption Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '36px 32px 24px',
              background: 'linear-gradient(to top, rgba(15, 42, 29, 0.85) 0%, rgba(15, 42, 29, 0) 100%)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              color: '#FFFFFF',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                The Journey to Zero Spoilage.
              </div>
              <div style={{ fontSize: '0.88rem', opacity: 0.9, marginTop: '4px' }}>
                {t('heroPhotoCaption')}
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                fontSize: '0.84rem',
                fontWeight: 600,
              }}
            >
              <span>Maharashtra APMC Gateway</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Strip */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        <StatStrip stats={statsData} />
      </section>

      {/* 3. "How It Works" in 3 PhotoCards */}
      <section
        style={{
          maxWidth: '1240px',
          margin: '40px auto 60px',
          padding: '0 20px',
        }}
      >
        <SectionHeading
          tag="Recovery Workflow"
          title={t('howItWorks')}
          subtitle={t('howItWorksSub')}
          centered
          sparkle
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginTop: '32px',
          }}
        >
          <PhotoCard
            imageSrc="/images/step_harvest.jpg"
            imageAlt="Organic fresh harvested tomatoes"
            title={t('step1Title')}
            description={t('step1Desc')}
            stepNumber="01"
            badge={<Badge variant="neutral">Farmgate</Badge>}
          />
          <PhotoCard
            imageSrc="/images/step_recovery.jpg"
            imageAlt="Agritech supply chain calculation tablet"
            title={t('step2Title')}
            description={t('step2Desc')}
            stepNumber="02"
            badge={<Badge variant="orange">Algorithm</Badge>}
          />
          <PhotoCard
            imageSrc="/images/step_storage.jpg"
            imageAlt="Modern clean cold chain facility"
            title={t('step3Title')}
            description={t('step3Desc')}
            stepNumber="03"
            badge={<Badge variant="success">Dispatched</Badge>}
          />
        </div>
      </section>

      {/* 4. Role Cards Section */}
      <section
        style={{
          maxWidth: '1240px',
          margin: '40px auto 60px',
          padding: '0 20px',
        }}
      >
        <SectionHeading
          tag="Ecosystem Roles"
          title={t('rolesHeading')}
          subtitle={t('rolesSub')}
          centered
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginTop: '32px',
          }}
        >
          {/* Farmer Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '16px',
                }}
              >
                👨‍🌾
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-forest-black)', marginBottom: '8px' }}>
                {t('farmerRole')}
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                {t('roleFarmerDesc')}
              </p>
            </div>
            <PillButton variant="outline" size="sm" onClick={() => handleAction('farmer')} showArrow>
              Access Farmer Tools
            </PillButton>
          </div>

          {/* Buyer Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '16px',
                }}
              >
                🏢
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-forest-black)', marginBottom: '8px' }}>
                {t('buyerRole')}
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                {t('roleBuyerDesc')}
              </p>
            </div>
            <PillButton variant="outline" size="sm" onClick={() => handleAction('buyer')} showArrow>
              Browse Marketplace
            </PillButton>
          </div>

          {/* Admin Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '16px',
                }}
              >
                🛡️
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-forest-black)', marginBottom: '8px' }}>
                {t('adminRole')}
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                {t('roleAdminDesc')}
              </p>
            </div>
            <PillButton variant="outline" size="sm" onClick={() => handleAction('admin')} showArrow>
              Marketplace Telemetry
            </PillButton>
          </div>
        </div>
      </section>

      {/* 5. CTA Banner */}
      <section style={{ maxWidth: '1240px', margin: '40px auto 60px', padding: '0 20px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, var(--color-forest-black) 0%, var(--color-forest-dark) 100%)',
            borderRadius: 'var(--radius-card)',
            padding: '56px 40px',
            color: '#FFFFFF',
            textAlign: 'center',
            position: 'relative',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Sparkle */}
          <div style={{ position: 'absolute', top: '24px', left: '10%', color: 'var(--color-orange-accent)', fontSize: '24px' }}>✦</div>
          <div style={{ position: 'absolute', bottom: '24px', right: '10%', color: 'var(--color-green-success)', fontSize: '20px' }}>✦</div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              fontWeight: 800,
              maxWidth: '700px',
              margin: '0 auto 14px',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {t('ctaBannerTitle')}
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: '560px',
              margin: '0 auto 28px',
              lineHeight: 1.6,
            }}
          >
            {t('ctaBannerSub')}
          </p>

          <PillButton variant="orange" size="lg" onClick={handleAction} showArrow>
            {t('ctaBannerBtn')}
          </PillButton>
        </div>
      </section>

      {/* 6. Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: '#FFFFFF',
          padding: '48px 20px 32px',
          marginTop: '60px',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
            marginBottom: '36px',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '22px' }}>🌱</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-forest-black)' }}>
                FasalRakshak AI
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: '280px' }}>
              Intelligent farm-to-market recovery engine protecting Indian agricultural value chains against disruption.
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-forest-black)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
              <li>Deterministic Recovery Engine</li>
              <li>Nearby Verified Buyers Map</li>
              <li>YOLOv8 Quality Pre-Audit</li>
              <li>Gemini 2.0 Kisan AI Copilot</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-forest-black)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Regional Hubs
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
              <li>Nashik APMC Main Yard</li>
              <li>Lasalgaon Onion Market</li>
              <li>Dindori Agro Cold Storage</li>
              <li>Pimpalgaon Processing Cluster</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-forest-black)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Data Integrity
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Market data sourced from Agmarknet open telemetry. Weather via Open-Meteo. Coordinates obfuscated for privacy.
            </p>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            paddingTop: '24px',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <div>© {new Date().getFullYear()} FasalRakshak AI (फसल रक्षक). Built for Indian Agriculture.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Zero Hallucinations</span>
            <span>•</span>
            <span>Transparent Net Returns</span>
            <span>•</span>
            <span>Privacy Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
