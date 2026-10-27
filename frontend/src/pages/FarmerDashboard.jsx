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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function FarmerDashboard({
  harvests,
  onOpenDisruptionModal,
  onOpenAddHarvestModal,
  onHarvestUpdated,
}) {
  const { t } = useLanguage();
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
      console.warn(e);
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
      console.warn(err);
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
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1A6B3A', '#237A45', '#5CB87A', '#FDE68A'],
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

  return (
    <div className="animate-fade">
      {/* 1. SOS Distress Top Alert Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)',
          border: '1.5px solid #FCA5A5',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            className="animate-sos"
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--red-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--red-700)' }}>
                🚨 {t('sosDisruption')}
              </h2>
              <span className="badge badge-danger">High Priority Protocol</span>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              वाहतूक बंद पडल्यास, खरेदीदाराने ऐनवेळी ऑर्डर रद्द केल्यास किंवा माल नासण्याची भीती असल्यास तात्काळ अलर्ट द्या.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onOpenDisruptionModal}
            className="btn btn-danger"
            style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 700 }}
          >
            <AlertTriangle size={20} />
            <span>{t('sosDisruption')}</span>
          </button>
        </div>
      </div>

      {/* 2. Deterministic Recovery Engine Section */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          marginBottom: 32,
          border: '1.5px solid var(--green-200)',
          background: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--green-100)',
                  color: 'var(--green-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--green-900)' }}>
                ⚡ {t('recoveryEngine')}
              </h2>
              <span className="badge badge-success">Pure Algorithmic Math</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Strict Formula: Net Realized Return = Gross Revenue − Transport Cost − Packaging − Platform Fees
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Analyzing Batch:
            </span>
            <select
              className="form-input"
              style={{ width: 'auto', padding: '6px 12px', fontWeight: 600 }}
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
              className="btn btn-outline"
              title="Recalculate live prices"
              style={{ padding: '8px 12px' }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Execution Dispatch Receipt (Shown when confirmed) */}
        {executionReceipt && (
          <div
            className="animate-fade"
            style={{
              padding: '20px 24px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--green-100) 0%, #FFFFFF 100%)',
              border: '2px solid var(--green-500)',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'var(--green-700)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--green-900)' }}>
                  🎉 Recovery Plan Authorized & Transport Dispatched!
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--green-800)' }}>
                  ऑर्डर यशस्वीरीत्या नोंदवला गेला आहे. वाहन थेट आपल्या शेताकडे रवाना झाले आहे.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                padding: '16px',
                background: '#ffffff',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--green-200)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Assigned Vehicle</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  🚛 {executionReceipt.vehicleAssigned}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Driver Contact</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--green-800)' }}>
                  📞 {executionReceipt.driverContact}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ETA Arrival</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--amber-600)' }}>
                  ⏱️ {executionReceipt.estimatedPickupTime}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Guaranteed Net Payout</div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-800)' }}>
                  ₹{executionReceipt.netPayout.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3 Algorithmic Recovery Channels Cards */}
        {calculating ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Calculating transport routes, APMC bid orderbooks, and net return differentials...</div>
          </div>
        ) : recoveryCalculation ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 20,
            }}
          >
            {recoveryCalculation.strategies.map((strat) => (
              <div
                key={strat.id}
                style={{
                  borderRadius: 'var(--radius-lg)',
                  border: strat.recommended
                    ? '2px solid var(--green-600)'
                    : '1px solid var(--border-medium)',
                  background: strat.recommended ? '#FAFCFA' : '#ffffff',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: strat.recommended ? 'var(--shadow-md)' : 'var(--shadow-xs)',
                  transition: 'all 0.2s',
                }}
              >
                {strat.recommended && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: 20,
                      background: 'var(--green-700)',
                      color: '#ffffff',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      letterSpacing: '0.04em',
                      boxShadow: '0 2px 6px rgba(26, 107, 58, 0.4)',
                    }}
                  >
                    ★ ALGORITHMIC BEST MATCH
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: '1.12rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                        {strat.channel}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--amber-600)', marginTop: 2 }}>
                        ⏳ {strat.urgency}
                      </div>
                    </div>
                    <span className="badge badge-info">{strat.confidence}% Match</span>
                  </div>

                  {/* Net Return Highlight */}
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: strat.recommended ? 'var(--green-100)' : 'var(--bg-subtle)',
                      border: '1px solid var(--border-light)',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('netReturn')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green-900)' }}>
                        ₹{strat.netReturnTotal.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--green-700)' }}>
                        (₹{strat.netReturnPerKg}/kg)
                      </span>
                    </div>
                  </div>

                  {/* Mathematical Deduction Breakdown */}
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border-light)' }}>
                      <span>{t('grossRevenue')}:</span>
                      <span style={{ fontWeight: 600 }}>₹{strat.grossRevenue.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border-light)', color: 'var(--red-600)' }}>
                      <span>− {t('transportFee')}:</span>
                      <span>₹{strat.deductions.transport.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border-light)', color: 'var(--red-600)' }}>
                      <span>− Platform & APMC Fee:</span>
                      <span>₹{(strat.deductions.mandiFee || strat.deductions.rentFee || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Verified Linkage: <strong>{strat.buyerMatch}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleExecuteRecovery(strat)}
                  disabled={executingPlanId === strat.id}
                  className={`btn ${strat.recommended ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%', padding: '12px', fontWeight: 700 }}
                >
                  {executingPlanId === strat.id ? (
                    'Authorizing...'
                  ) : (
                    <>
                      <span>{t('executePlan')}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* 3. My Active Harvests Section */}
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--green-900)' }}>
              🌾 {t('activeHarvests')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Real-time monitoring of crop freshness, quantity, and market pricing
            </p>
          </div>
          <button onClick={onOpenAddHarvestModal} className="btn btn-primary">
            <Plus size={18} />
            <span>{t('addNewHarvest')}</span>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: 20,
          }}
        >
          {harvests.map((h) => {
            const isDistressed = h.status === 'Distressed';
            return (
              <div
                key={h._id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  border: isDistressed ? '2px solid var(--red-500)' : '1px solid var(--border-light)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      {h.cropVariety}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--green-950)' }}>
                      {h.cropType}
                    </h3>
                  </div>
                  <span
                    className={`badge ${
                      isDistressed
                        ? 'badge-danger'
                        : h.status === 'Recovered'
                        ? 'badge-success'
                        : 'badge-info'
                    }`}
                  >
                    {isDistressed ? '🚨 Distressed' : h.status}
                  </span>
                </div>

                {/* Metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    padding: '12px',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Quantity Available</div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {h.availableQuantityKg.toLocaleString()} kg
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Target Rate</div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--green-800)' }}>
                      ₹{h.targetPricePerKg} / kg
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Quality Grade</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--green-700)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Sparkles size={14} /> {h.quality?.grade || 'Grade A'} ({h.quality?.score || 88}%)
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Shelf Life</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} /> {h.storageLifeDays} days
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <MapPin size={14} />
                  <span>{h.location?.address || 'Nashik, Maharashtra'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Nearby Mandis & Facilities Directory */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--green-900)' }}>
              🏬 {t('mandisNearMe')}
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Live intake capacity and wholesale spot rates in your district
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {nearbyFacilities.map((fac) => (
            <div
              key={fac._id}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: '#ffffff',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: fac.type === 'ColdStorage' ? 'var(--blue-600)' : 'var(--green-700)',
                  }}
                >
                  {fac.type === 'ColdStorage' ? '❄️ Cold Storage' : fac.type === 'Processor' ? '🏭 Processing' : '🌾 APMC Mandi'}
                </span>
                <span className="badge badge-success">Verified</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', marginTop: 6, color: 'var(--text-primary)' }}>
                {fac.name}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>📍 {fac.distanceKm} km away</span>
                <span>• {fac.capacityStatus}</span>
              </div>
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--green-800)' }}>
                  {fac.currentRatePerKg ? `Spot Rate: ₹${fac.currentRatePerKg}/kg` : `Rent: ₹${fac.rentPerKgPerMonth}/kg/mo`}
                </div>
                <a
                  href={`tel:${fac.contact}`}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  Contact Desk
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
