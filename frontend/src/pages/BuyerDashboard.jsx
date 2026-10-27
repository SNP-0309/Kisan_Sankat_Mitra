import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, TrendingDown, Clock, MapPin, Truck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';

export default function BuyerDashboard({ harvests, onHarvestUpdated }) {
  const { t } = useLanguage();
  const [purchasedBatch, setPurchasedBatch] = useState(null);
  const [orderingId, setOrderingId] = useState(null);

  // Distressed & Available batches
  const marketplaceBatches = harvests.filter((h) => h.availableQuantityKg > 0);

  const handleInstantBuy = (batch) => {
    setOrderingId(batch._id);
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
      });
      setPurchasedBatch({
        batch,
        orderId: `ORD_BUYER_${Date.now()}`,
        qtyKg: batch.distressedQuantityKg > 0 ? batch.distressedQuantityKg : 2000,
        pickupAddress: batch.location?.address || 'Niphad, Nashik',
      });
      if (onHarvestUpdated) {
        onHarvestUpdated(batch._id, 'Sold');
      }
      setOrderingId(null);
    }, 600);
  };

  return (
    <div className="animate-fade">
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, var(--green-950) 0%, var(--green-800) 100%)',
          color: '#ffffff',
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>🏢</span>
              <h2 style={{ fontSize: '1.45rem', color: '#ffffff' }}>
                {t('marketplace')}
              </h2>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                LIVE PROCUREMENT PIPELINE
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: 6, maxWidth: 680 }}>
              Directly purchase stranded or cancelled harvest lots from verified farmers. Save perishable food supply, reduce mandi middlemen leakage, and lock in volume at fair floor rates.
            </p>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Toast */}
      {purchasedBatch && (
        <div
          className="animate-fade"
          style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--green-100) 0%, #FFFFFF 100%)',
            border: '2px solid var(--green-500)',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle size={28} color="var(--green-700)" />
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--green-900)' }}>
                ✅ Bulk Purchase Confirmed! (ऑर्डर यशस्वी)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Order #{purchasedBatch.orderId} for {purchasedBatch.qtyKg.toLocaleString()} kg of {purchasedBatch.batch.cropType} has been assigned to dispatch.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Batches Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 22,
        }}
      >
        {marketplaceBatches.map((b) => {
          const isDistressed = b.status === 'Distressed';
          const discountPct = isDistressed ? 18 : 0;
          const discountedRate = isDistressed
            ? (b.targetPricePerKg * 0.82).toFixed(1)
            : b.targetPricePerKg;

          return (
            <div
              key={b._id}
              className="glass-panel"
              style={{
                padding: '24px',
                border: isDistressed ? '2px solid var(--amber-500)' : '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Farmer: {b.farmerName}
                    </span>
                    <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                      {b.cropType}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Variety: {b.cropVariety}
                    </div>
                  </div>
                  {isDistressed ? (
                    <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                      ⚡ Urgent Distress Sale
                    </span>
                  ) : (
                    <span className="badge badge-success">Fresh Batch</span>
                  )}
                </div>

                {/* Price Matrix */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: isDistressed ? 'var(--amber-100)' : 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wholesale Offer Rate</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green-900)' }}>
                          ₹{discountedRate}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ kg</span>
                        {isDistressed && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--red-600)', textDecoration: 'line-through' }}>
                            ₹{b.targetPricePerKg}
                          </span>
                        )}
                      </div>
                    </div>
                    {isDistressed && (
                      <span className="badge badge-danger">
                        <TrendingDown size={14} /> {discountPct}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Batch specs */}
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span>Available Volume:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{b.availableQuantityKg.toLocaleString()} kg</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span>Quality Grade:</span>
                    <strong style={{ color: 'var(--green-800)' }}>{b.quality?.grade || 'Grade A'} ({b.quality?.score || 88}%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span>Remaining Shelf Life:</span>
                    <strong style={{ color: 'var(--amber-600)' }}>{b.storageLifeDays} days left</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} />
                    <span>Pickup Location: {b.location?.address}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleInstantBuy(b)}
                disabled={orderingId === b._id}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontWeight: 700 }}
              >
                <ShoppingBag size={18} />
                <span>{orderingId === b._id ? 'Securing Lot...' : `${t('buyNow')} (₹${discountedRate}/kg)`}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
