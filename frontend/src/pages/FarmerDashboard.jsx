import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Sparkles,
  ShieldCheck,
  Building,
  RefreshCw,
  Plus,
  Phone,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  PillButton,
  Badge,
  StatStrip,
  SectionHeading,
  EmptyState,
} from '../components/ui';
import NearbyBuyersMap from '../components/NearbyBuyersMap';

export default function FarmerDashboard({
  harvests = [],
  onOpenDisruptionModal,
  onOpenAddHarvestModal,
  onHarvestUpdated,
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedDisruptedHarvest, setSelectedDisruptedHarvest] = useState(null);
  const [recoveryCalculation, setRecoveryCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [executingPlanId, setExecutingPlanId] = useState(null);
  const [executionReceipt, setExecutionReceipt] = useState(null);
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  // Identify if any batch is in distress
  const distressedBatch = harvests.find((h) => h.status === 'Distressed') || harvests[0];

  useEffect(() => {
    if (distressedBatch) {
      setSelectedDisruptedHarvest(distressedBatch);
      fetchRecoveryCalculation(distressedBatch);
    }
    fetchFacilities();
  }, [harvests]);

  const fetchFacilities = async () => {
    setLoadingFacilities(true);
    try {
      const res = await api.getNearbyShops();
      if (res?.data) {
        setNearbyFacilities(res.data);
      }
    } catch (e) {
      console.warn('Failed to load facilities:', e);
    } finally {
      setLoadingFacilities(false);
    }
  };

  const fetchRecoveryCalculation = async (batch) => {
    if (!batch) return;
    setCalculating(true);
    setExecutionReceipt(null);
    try {
      const qty = batch.distressedQuantityKg > 0 ? batch.distressedQuantityKg : batch.availableQuantityKg;
      const res = await api.calculateRecovery({
        harvestId: batch._id,
        cropType: batch.cropType,
        quantityKg: qty,
      });
      if (res?.data) {
        setRecoveryCalculation(res.data);
      }
    } catch (err) {
      console.warn('Failed to calculate recovery:', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleExecuteRecovery = async (strategy) => {
    if (!selectedDisruptedHarvest) return;
    setExecutingPlanId(strategy.id);

    try {
      const res = await api.executeRecovery({
        harvestId: selectedDisruptedHarvest._id,
        strategyId: strategy.id,
        channel: strategy.channel,
        netReturnTotal: strategy.netReturnTotal,
      });

      if (res?.status === 'success') {
        confetti({
          particleCount: 140,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#0F2A1D', '#2E7D32', '#FF5A1F', '#F4F5F2'],
        });
        setExecutionReceipt(res.data);
        if (onHarvestUpdated) {
          onHarvestUpdated(selectedDisruptedHarvest._id, 'Recovered');
        }
      }
    } catch (err) {
      alert(err.message || 'Execution failed');
    } finally {
      setExecutingPlanId(null);
    }
  };

  // Compute live real statistics from harvests array
  const totalBatchesCount = harvests.length;
  const distressedLotsCount = harvests.filter((h) => h.status === 'Distressed').length;
  const totalVolumeKg = harvests.reduce((acc, h) => acc + (h.availableQuantityKg || 0), 0);
  const totalVolumeMT = (totalVolumeKg / 1000).toFixed(1);
  const totalPipelineValue = harvests.reduce(
    (acc, h) => acc + (h.availableQuantityKg || 0) * (h.targetPricePerKg || 0),
    0
  );

  const stats = [
    {
      value: totalBatchesCount.toString(),
      label: 'Active Batches',
      caption: 'Real-time registered',
    },
    {
      value: distressedLotsCount.toString(),
      label: 'Distressed Lots',
      caption: distressedLotsCount > 0 ? 'Requires immediate action' : 'Zero active distress',
    },
    {
      value: `${totalVolumeMT} MT`,
      label: 'Total Volume',
      caption: `${totalVolumeKg.toLocaleString()} kg farmgate stock`,
    },
    {
      value: `₹${(totalPipelineValue / 100000).toFixed(2)}L`,
      label: 'Pipeline Value',
      caption: `₹${totalPipelineValue.toLocaleString()} total gross`,
    },
  ];

  const getCropEmoji = (cropType = '') => {
    const c = cropType.toLowerCase();
    if (c.includes('tomato')) return '🍅';
    if (c.includes('onion')) return '🧅';
    if (c.includes('grape')) return '🍇';
    if (c.includes('potato')) return '🥔';
    if (c.includes('chilli')) return '🌶️';
    return '🌾';
  };

  return (
    <div style={{ padding: '24px 20px 80px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* 1. Warm Editorial Farmer Welcome Banner */}
      <section
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '32px 28px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span
              style={{
                fontFamily: 'Noto Sans Devanagari',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--color-green-success)',
                background: 'var(--color-green-light)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              शेतकरी डॅशबोर्ड
            </span>
            <Badge variant="neutral">Kharif / Rabi Season 2026</Badge>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)',
              fontWeight: 800,
              color: 'var(--color-forest-black)',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}
          >
            Welcome, {user?.name || 'Ramesh Patil'}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '0.88rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={15} color="var(--color-orange-accent)" />
              {user?.location || 'Niphad, Nashik, Maharashtra'}
            </span>
            <span>•</span>
            <span>Holding: {user?.holdingAcreage || '6.5 Acres'}</span>
            <span>•</span>
            <span style={{ color: 'var(--color-green-success)', fontWeight: 600 }}>
              APMC Nashik Verified
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <PillButton variant="dark" size="md" onClick={onOpenAddHarvestModal} showArrow>
            <Plus size={16} />
            <span>{t('addNewHarvest')}</span>
          </PillButton>
        </div>
      </section>

      {/* 2. Real Live StatStrip */}
      <StatStrip stats={stats} />

      {/* 3. SOS Distress Crisis Action Banner (id="farmer-sos") */}
      <section
        id="farmer-sos"
        style={{
          background: 'linear-gradient(135deg, #FFF6F3 0%, #FFFFFF 100%)',
          borderRadius: 'var(--radius-card)',
          border: '1.5px solid rgba(255, 90, 31, 0.35)',
          boxShadow: '0 8px 30px rgba(255, 90, 31, 0.08)',
          padding: '28px',
          marginBottom: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', maxWidth: '780px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--color-orange-accent)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(255, 90, 31, 0.35)',
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--color-forest-black)',
                }}
              >
                🚨 {t('sosDisruption')}
              </h2>
              <Badge variant="orange" size="sm">
                High Priority Protocol
              </Badge>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.92rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
              }}
            >
              वाहतूक बंद पडल्यास, खरेदीदाराने ऐनवेळी ऑर्डर रद्द केल्यास किंवा माल नासण्याची भीती असल्यास तात्काळ अलर्ट द्या. आमचे अल्गोरिदम शेताजवळील मंड्या आणि खरेदीदारांशी थेट संपर्क साधून मदत पुरवतो.
            </p>
          </div>
        </div>

        <PillButton variant="orange" size="lg" onClick={onOpenDisruptionModal} showArrow>
          <AlertTriangle size={18} />
          <span>{t('sosDisruption')}</span>
        </PillButton>
      </section>

      {/* 4. Deterministic Recovery Engine Section (id="farmer-recovery") */}
      <section
        id="farmer-recovery"
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '32px 28px',
          marginBottom: '40px',
        }}
      >
        {/* Recovery Engine Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-green-light)',
                  color: 'var(--color-green-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: 'var(--color-forest-black)',
                }}
              >
                ⚡ {t('recoveryEngine')}
              </h2>
              <Badge variant="success">Pure Algorithmic Math</Badge>
            </div>
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--color-text-secondary)',
                marginTop: '6px',
              }}
            >
              Strict Formula: Net Realized Return = Gross Revenue − Transport Cost − Packaging − Platform Fees
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Analyzing Batch:
            </span>
            <select
              className="form-input"
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border)',
                fontWeight: 600,
                fontSize: '0.88rem',
                background: 'var(--color-bg-subtle)',
              }}
              value={selectedDisruptedHarvest?._id || ''}
              onChange={(e) => {
                const found = harvests.find((h) => h._id === e.target.value);
                setSelectedDisruptedHarvest(found);
                fetchRecoveryCalculation(found);
              }}
            >
              {harvests.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.cropType} ({h.status === 'Distressed' ? '🚨 Distressed' : 'Ready'})
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchRecoveryCalculation(selectedDisruptedHarvest)}
              type="button"
              title="Recalculate live prices"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border)',
                background: '#FFFFFF',
                color: 'var(--color-forest-black)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Execution Dispatch Receipt (Shown when confirmed) */}
        {executionReceipt && (
          <div
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-card)',
              background: 'linear-gradient(135deg, var(--color-green-light) 0%, #FFFFFF 100%)',
              border: '2px solid var(--color-green-success)',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--color-green-success)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle size={24} />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--color-forest-black)',
                  }}
                >
                  🎉 Recovery Plan Authorized & Transport Dispatched!
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--color-forest-medium)', marginTop: '2px' }}>
                  ऑर्डर यशस्वीरीत्या नोंदवला गेला आहे. वाहन थेट आपल्या शेताकडे रवाना झाले आहे.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                padding: '18px',
                background: '#FFFFFF',
                borderRadius: 'calc(var(--radius-card) - 6px)',
                border: '1px solid rgba(46, 125, 50, 0.2)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Assigned Vehicle</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-forest-black)', marginTop: '2px' }}>
                  🚛 {executionReceipt.vehicleAssigned}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Driver Contact</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-green-success)', marginTop: '2px' }}>
                  📞 {executionReceipt.driverContact}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>ETA Arrival</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-orange-accent)', marginTop: '2px' }}>
                  ⏱️ {executionReceipt.estimatedPickupTime}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Guaranteed Net Payout</div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--color-green-success)', marginTop: '2px' }}>
                  ₹{executionReceipt.netPayout.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3 Algorithmic Recovery Channels Cards */}
        {calculating ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--color-forest-black)' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-forest-black)' }}>
              Calculating optimal transport routes and real-time net return differentials...
            </div>
          </div>
        ) : recoveryCalculation ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {recoveryCalculation.strategies.map((strat) => (
              <div
                key={strat.id}
                style={{
                  borderRadius: 'var(--radius-card)',
                  border: strat.recommended
                    ? '2px solid var(--color-forest-black)'
                    : '1px solid var(--color-border)',
                  background: strat.recommended ? '#FAFBF9' : '#FFFFFF',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: strat.recommended ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
                  transition: 'all var(--transition-normal)',
                }}
              >
                {strat.recommended && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: 20,
                      background: 'var(--color-forest-black)',
                      color: '#FFFFFF',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '3px 12px',
                      borderRadius: 'var(--radius-pill)',
                      letterSpacing: '0.04em',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    ★ ALGORITHMIC BEST MATCH
                  </div>
                )}

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '14px',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.2rem',
                          color: 'var(--color-forest-black)',
                          fontWeight: 800,
                        }}
                      >
                        {strat.channel}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-orange-accent)', marginTop: '2px', fontWeight: 600 }}>
                        ⏳ {strat.urgency}
                      </div>
                    </div>
                    <Badge variant={strat.recommended ? 'orange' : 'neutral'} size="sm">
                      {strat.confidence}% Match
                    </Badge>
                  </div>

                  {/* Net Return Highlight Box */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: 'calc(var(--radius-card) - 8px)',
                      background: strat.recommended ? 'var(--color-green-light)' : 'var(--color-bg-subtle)',
                      border: '1px solid var(--color-border)',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--color-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 700,
                      }}
                    >
                      {t('netReturn')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '2rem',
                          fontWeight: 800,
                          color: 'var(--color-forest-black)',
                        }}
                      >
                        ₹{strat.netReturnTotal.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-green-success)' }}>
                        (₹{strat.netReturnPerKg}/kg)
                      </span>
                    </div>
                  </div>

                  {/* Mathematical Deduction Breakdown */}
                  <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: '18px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderBottom: '1px dashed var(--color-border)',
                      }}
                    >
                      <span>{t('grossRevenue')}:</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-forest-black)' }}>
                        ₹{strat.grossRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderBottom: '1px dashed var(--color-border)',
                        color: 'var(--color-orange-accent)',
                      }}
                    >
                      <span>− {t('transportFee')}:</span>
                      <span>₹{strat.deductions.transport.toLocaleString()}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderBottom: '1px dashed var(--color-border)',
                        color: 'var(--color-orange-accent)',
                      }}
                    >
                      <span>− Platform & APMC Fee:</span>
                      <span>₹{(strat.deductions.mandiFee || strat.deductions.rentFee || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Verified Linkage: <strong>{strat.buyerMatch}</strong>
                    </div>
                  </div>
                </div>

                <PillButton
                  variant={strat.recommended ? 'dark' : 'outline'}
                  size="md"
                  onClick={() => handleExecuteRecovery(strat)}
                  disabled={executingPlanId === strat.id}
                  showArrow
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {executingPlanId === strat.id ? 'Authorizing Dispatch...' : t('executePlan')}
                </PillButton>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* 5. My Active Harvests Section (id="farmer-batches") */}
      <section id="farmer-batches" style={{ marginBottom: '44px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <SectionHeading
              tag="Inventory Pipeline"
              title={t('activeHarvests')}
              subtitle="Real-time monitoring of crop freshness, quantity, and market pricing"
              style={{ marginBottom: 0 }}
            />
          </div>
          <PillButton variant="dark" size="sm" onClick={onOpenAddHarvestModal} showArrow>
            <Plus size={16} />
            <span>{t('addNewHarvest')}</span>
          </PillButton>
        </div>

        {harvests.length === 0 ? (
          <EmptyState
            title="No Harvest Batches Registered"
            description="Register your harvested produce to track storage life and get protected by FasalRakshak AI."
            actionLabel={t('addNewHarvest')}
            onAction={onOpenAddHarvestModal}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {harvests.map((h, idx) => {
              const isDistressed = h.status === 'Distressed';
              const batchNum = String(idx + 1).padStart(2, '0');
              const totalCount = String(harvests.length).padStart(2, '0');

              return (
                <div
                  key={h._id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-card)',
                    border: isDistressed
                      ? '2px solid var(--color-orange-accent)'
                      : '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '24px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Top Row: Index Circle Badge & Status */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '14px',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-bg-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--color-forest-black)',
                        }}
                      >
                        {batchNum}
                      </div>

                      <Badge
                        variant={
                          isDistressed
                            ? 'distress'
                            : h.status === 'Recovered'
                            ? 'success'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {isDistressed ? '🚨 Distressed' : h.status}
                      </Badge>
                    </div>

                    {/* Crop Name & Variety */}
                    <div style={{ marginBottom: '16px' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {h.cropVariety}
                      </span>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.35rem',
                          fontWeight: 800,
                          color: 'var(--color-forest-black)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '2px',
                        }}
                      >
                        <span>{getCropEmoji(h.cropType)}</span>
                        <span>{h.cropType}</span>
                      </h3>
                    </div>

                    {/* Metrics Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        padding: '14px',
                        background: 'var(--color-bg-subtle)',
                        borderRadius: 'calc(var(--radius-card) - 8px)',
                        marginBottom: '16px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Quantity Available</div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-forest-black)', marginTop: '2px' }}>
                          {h.availableQuantityKg?.toLocaleString()} kg
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Target Rate</div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-green-success)', marginTop: '2px' }}>
                          ₹{h.targetPricePerKg} / kg
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Quality Grade</div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-forest-black)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Sparkles size={13} color="var(--color-orange-accent)" />
                          {h.quality?.grade || 'Grade A'} ({h.quality?.score || 88}%)
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Shelf Life</div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Clock size={13} />
                          {h.storageLifeDays} days
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <MapPin size={13} color="var(--color-orange-accent)" />
                      <span>{h.location?.address || 'Nashik, Maharashtra'}</span>
                    </div>
                  </div>

                  {isDistressed && (
                    <div style={{ marginTop: '16px' }}>
                      <PillButton
                        variant="orange"
                        size="sm"
                        onClick={() => {
                          setSelectedDisruptedHarvest(h);
                          fetchRecoveryCalculation(h);
                          const el = document.getElementById('farmer-recovery');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        showArrow
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        ⚡ Calculate Recovery Plan
                      </PillButton>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Nearby Buyers Interactive OpenStreetMap Map */}
      <NearbyBuyersMap
        farmerLocation={{
          lat: user?.coordinates?.[1] || 20.08,
          lng: user?.coordinates?.[0] || 73.91,
          address: user?.location || 'Niphad, Nashik, Maharashtra',
        }}
      />

      {/* 7. Nearby Mandis & Storage Facilities Directory (id="farmer-mandis") */}
      <section id="farmer-mandis">
        <SectionHeading
          tag="District Infrastructure"
          title={t('mandisNearMe')}
          subtitle="Live intake capacity, distance, and wholesale spot rates in your district"
        />

        {loadingFacilities ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            <div>Checking active mandi intake gates...</div>
          </div>
        ) : nearbyFacilities.length === 0 ? (
          <EmptyState
            title="No Mandis or Facilities Online"
            description="All district intake centers are currently closed for dispatch."
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {nearbyFacilities.map((fac) => (
              <div
                key={fac._id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-card)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '10px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color:
                          fac.type === 'ColdStorage'
                            ? 'var(--color-forest-medium)'
                            : 'var(--color-green-success)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {fac.type === 'ColdStorage'
                        ? '❄️ Cold Storage'
                        : fac.type === 'Processor'
                        ? '🏭 Processing Unit'
                        : '🌾 APMC Mandi'}
                    </span>
                    <Badge variant="success" size="sm">
                      Verified
                    </Badge>
                  </div>

                  <h4
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: 'var(--color-forest-black)',
                      marginBottom: '6px',
                    }}
                  >
                    {fac.name}
                  </h4>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.84rem',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '16px',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="var(--color-orange-accent)" />
                      {fac.distanceKm} km away
                    </span>
                    <span>•</span>
                    <span>{fac.capacityStatus}</span>
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: '14px',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      color: 'var(--color-green-success)',
                    }}
                  >
                    {fac.currentRatePerKg
                      ? `Spot Rate: ₹${fac.currentRatePerKg}/kg`
                      : `Rent: ₹${fac.rentPerKgPerMonth}/kg/mo`}
                  </div>

                  {fac.contact && (
                    <a
                      href={`tel:${fac.contact}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-subtle)',
                        color: 'var(--color-forest-black)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      <Phone size={12} />
                      <span>Contact Desk</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
