import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle,
  TrendingDown,
  Clock,
  MapPin,
  Truck,
  Sparkles,
  Building2,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  PillButton,
  Badge,
  StatStrip,
  SectionHeading,
  PillTabs,
  EmptyState,
} from '../components/ui';

export default function BuyerDashboard({ harvests = [], onHarvestUpdated }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [purchasedBatch, setPurchasedBatch] = useState(null);
  const [orderingId, setOrderingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter available batches
  const marketplaceBatches = harvests.filter((h) => (h.availableQuantityKg || 0) > 0);

  const handleInstantBuy = (batch) => {
    setOrderingId(batch._id);
    setTimeout(() => {
      confetti({
        particleCount: 140,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0F2A1D', '#2E7D32', '#FF5A1F', '#F4F5F2'],
      });
      setPurchasedBatch({
        batch,
        orderId: `ORD_BUYER_${Date.now().toString().slice(-6)}`,
        qtyKg: batch.distressedQuantityKg > 0 ? batch.distressedQuantityKg : batch.availableQuantityKg,
        pickupAddress: batch.location?.address || 'Niphad, Nashik, Maharashtra',
      });
      if (onHarvestUpdated) {
        onHarvestUpdated(batch._id, 'Sold');
      }
      setOrderingId(null);
    }, 600);
  };

  // Filter logic
  const filteredBatches = marketplaceBatches.filter((b) => {
    if (activeFilter === 'distressed') return b.status === 'Distressed';
    if (activeFilter === 'tomato') return b.cropType?.toLowerCase().includes('tomato');
    if (activeFilter === 'onion') return b.cropType?.toLowerCase().includes('onion');
    return true;
  });

  // Real stats calculation
  const totalVolumeKg = marketplaceBatches.reduce((acc, b) => acc + (b.availableQuantityKg || 0), 0);
  const totalVolumeMT = (totalVolumeKg / 1000).toFixed(1);
  const distressedCount = marketplaceBatches.filter((b) => b.status === 'Distressed').length;
  const avgRate =
    marketplaceBatches.length > 0
      ? (
          marketplaceBatches.reduce((acc, b) => acc + (b.targetPricePerKg || 0), 0) /
          marketplaceBatches.length
        ).toFixed(1)
      : '0';

  const stats = [
    {
      value: marketplaceBatches.length.toString(),
      label: 'Available Lots',
      caption: 'Direct from verified farms',
    },
    {
      value: distressedCount.toString(),
      label: 'Distress Sourcing Lots',
      caption: distressedCount > 0 ? 'Discounted floor pricing' : 'Zero stranded lots',
    },
    {
      value: `${totalVolumeMT} MT`,
      label: 'Sourcing Pipeline',
      caption: `${totalVolumeKg.toLocaleString()} kg volume ready`,
    },
    {
      value: `₹${avgRate}`,
      label: 'Average Base Rate',
      caption: 'Per kg farmgate benchmark',
    },
  ];

  const getCropEmoji = (cropType = '') => {
    const c = cropType.toLowerCase();
    if (c.includes('tomato')) return '🍅';
    if (c.includes('onion')) return '🧅';
    if (c.includes('grape')) return '🍇';
    if (c.includes('potato')) return '🥔';
    return '🌾';
  };

  const tabs = [
    { id: 'all', label: `All Batches (${marketplaceBatches.length})` },
    { id: 'distressed', label: `🚨 Urgent Distress (${distressedCount})` },
    {
      id: 'tomato',
      label: `🍅 Tomatoes (${marketplaceBatches.filter((b) => b.cropType?.toLowerCase().includes('tomato')).length})`,
    },
    {
      id: 'onion',
      label: `🧅 Onions (${marketplaceBatches.filter((b) => b.cropType?.toLowerCase().includes('onion')).length})`,
    },
  ];

  return (
    <div style={{ padding: '24px 20px 80px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* 1. Commercial Procurement Header */}
      <section
        id="buyer-market"
        style={{
          background: 'var(--color-forest-black)',
          borderRadius: 'var(--radius-card)',
          color: '#FFFFFF',
          padding: '36px 32px',
          marginBottom: '28px',
          boxShadow: '0 12px 36px rgba(15, 42, 29, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--color-orange-accent)',
                background: 'rgba(255, 90, 31, 0.15)',
                border: '1px solid rgba(255, 90, 31, 0.3)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Live Procurement Terminal
            </span>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.8)',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              FSSAI & APMC Accredited
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 2.8vw, 2.3rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              marginBottom: '10px',
            }}
          >
            {user?.name || 'Sahyadri Agro Mega Foods Ltd.'}
          </h1>

          <p
            style={{
              fontSize: '0.94rem',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.6,
              marginBottom: '20px',
            }}
          >
            Directly purchase stranded or cancelled harvest lots from verified farmers. Save perishable food supply, reduce mandi middlemen leakage, and lock in volume at fair floor rates.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '0.84rem',
              color: 'rgba(255, 255, 255, 0.75)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} color="var(--color-orange-accent)" />
              {user?.location || 'Dindori Agro Park, Nashik'}
            </span>
            <span>•</span>
            <span>Daily Intake: {user?.dailyIntakeCapacity || '40 Metric Tons'}</span>
            <span>•</span>
            <span>License: {user?.licenseNumber || 'MH-AGRO-78192'}</span>
          </div>
        </div>
      </section>

      {/* 2. Real Live StatStrip */}
      <StatStrip stats={stats} />

      {/* 3. Purchase Confirmation Banner */}
      {purchasedBatch && (
        <section
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-card)',
            background: 'linear-gradient(135deg, var(--color-green-light) 0%, #FFFFFF 100%)',
            border: '2px solid var(--color-green-success)',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                ✅ Bulk Purchase Confirmed! (ऑर्डर यशस्वी)
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-forest-medium)', marginTop: '2px' }}>
                Order #{purchasedBatch.orderId} for {purchasedBatch.qtyKg?.toLocaleString()} kg of{' '}
                <strong>{purchasedBatch.batch?.cropType}</strong> has been secured for dispatch.
              </p>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
            <div>Pickup Address:</div>
            <strong style={{ color: 'var(--color-forest-black)' }}>{purchasedBatch.pickupAddress}</strong>
          </div>
        </section>
      )}

      {/* 4. Filter Pills Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <PillTabs tabs={tabs} activeTab={activeFilter} onChange={setActiveFilter} />

        <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          Showing <strong>{filteredBatches.length}</strong> matching lot{filteredBatches.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* 5. Marketplace Batches Grid (id="buyer-distress") */}
      <section id="buyer-distress">
        {filteredBatches.length === 0 ? (
          <EmptyState
            title="No Batches Match Selected Filter"
            description="There are currently no produce lots matching this criteria. Try selecting 'All Batches' to view live availability."
            actionLabel="View All Lots"
            onAction={() => setActiveFilter('all')}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredBatches.map((b, idx) => {
              const isDistressed = b.status === 'Distressed';
              const discountPct = isDistressed ? 18 : 0;
              const discountedRate = isDistressed
                ? (b.targetPricePerKg * 0.82).toFixed(1)
                : b.targetPricePerKg;
              const batchNum = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={b._id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-card)',
                    border: isDistressed
                      ? '2px solid var(--color-orange-accent)'
                      : '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '26px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Top Row: Index Circle Pill & Status Badge */}
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

                      {isDistressed ? (
                        <Badge variant="orange" size="sm">
                          <TrendingDown size={12} />
                          <span>18% OFF Distress Sale</span>
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Fresh Farmgate Batch
                        </Badge>
                      )}
                    </div>

                    {/* Producer & Crop Identity */}
                    <div style={{ marginBottom: '16px' }}>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--color-text-muted)',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Producer: {b.farmerName}
                      </div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.4rem',
                          fontWeight: 800,
                          color: 'var(--color-forest-black)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '2px',
                        }}
                      >
                        <span>{getCropEmoji(b.cropType)}</span>
                        <span>{b.cropType}</span>
                      </h3>
                      <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        Variety: {b.cropVariety}
                      </div>
                    </div>

                    {/* Wholesale Rate Box */}
                    <div
                      style={{
                        padding: '16px',
                        borderRadius: 'calc(var(--radius-card) - 8px)',
                        background: isDistressed ? 'var(--color-orange-soft)' : 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)',
                        marginBottom: '18px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div
                            style={{
                              fontSize: '0.74rem',
                              color: 'var(--color-text-secondary)',
                              textTransform: 'uppercase',
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                            }}
                          >
                            Wholesale Offer Rate
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
                              ₹{discountedRate}
                            </span>
                            <span style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)' }}>/ kg</span>
                            {isDistressed && (
                              <span
                                style={{
                                  fontSize: '0.86rem',
                                  color: 'var(--color-orange-accent)',
                                  textDecoration: 'line-through',
                                }}
                              >
                                ₹{b.targetPricePerKg}
                              </span>
                            )}
                          </div>
                        </div>

                        {isDistressed && (
                          <div
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-pill)',
                              background: 'var(--color-orange-accent)',
                              color: '#FFFFFF',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              fontFamily: 'var(--font-display)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <TrendingDown size={13} />
                            <span>18% OFF</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Batch Specifications */}
                    <div
                      style={{
                        fontSize: '0.86rem',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '20px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '6px 0',
                          borderBottom: '1px dashed var(--color-border)',
                        }}
                      >
                        <span>Available Volume:</span>
                        <strong style={{ color: 'var(--color-forest-black)' }}>
                          {b.availableQuantityKg?.toLocaleString()} kg
                        </strong>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '6px 0',
                          borderBottom: '1px dashed var(--color-border)',
                        }}
                      >
                        <span>Certified Quality:</span>
                        <strong
                          style={{
                            color: 'var(--color-green-success)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Sparkles size={13} />
                          {b.quality?.grade || 'Grade A'} ({b.quality?.score || 88}%)
                        </strong>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '6px 0',
                          borderBottom: '1px dashed var(--color-border)',
                        }}
                      >
                        <span>Remaining Shelf Life:</span>
                        <strong
                          style={{
                            color: isDistressed ? 'var(--color-orange-accent)' : 'var(--color-forest-black)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Clock size={13} />
                          {b.storageLifeDays} days
                        </strong>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '10px',
                          fontSize: '0.8rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        <MapPin size={13} color="var(--color-orange-accent)" />
                        <span>Pickup: {b.location?.address}</span>
                      </div>
                    </div>
                  </div>

                  <PillButton
                    variant={isDistressed ? 'orange' : 'dark'}
                    size="md"
                    onClick={() => handleInstantBuy(b)}
                    disabled={orderingId === b._id}
                    showArrow
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <ShoppingBag size={16} />
                    <span>
                      {orderingId === b._id
                        ? 'Securing Lot...'
                        : `${t('buyNow')} (₹${discountedRate}/kg)`}
                    </span>
                  </PillButton>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
