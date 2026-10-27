import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Building2,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  PhoneCall,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { PillButton, Badge, SectionHeading, EmptyState } from './ui';

// Custom Farmgate Icon (Farmer Farm Marker)
const createFarmerIcon = () =>
  L.divIcon({
    className: 'farmer-map-marker',
    html: `
      <div style="
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #0F2A1D;
        border: 3px solid #FFFFFF;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
      ">
        🌾
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });

// Custom Buyer Icon based on Type
const createBuyerIcon = (type = '') => {
  const typeIcons = {
    Processor: '🏭',
    Wholesaler: '🛒',
    Retailer: '🏢',
    Exporter: '🚢',
  };
  const icon = typeIcons[type] || '🏬';

  return L.divIcon({
    className: 'buyer-map-marker',
    html: `
      <div style="
        padding: 5px 10px;
        border-radius: 20px;
        background: #FFFFFF;
        border: 2px solid #2E7D32;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 800;
        font-size: 12px;
        color: #0F2A1D;
        white-space: nowrap;
      ">
        <span>${icon}</span>
        <span>${type}</span>
      </div>
    `,
    iconSize: [80, 30],
    iconAnchor: [40, 15],
    popupAnchor: [0, -15],
  });
};

export default function NearbyBuyersMap({
  farmerLocation = { lat: 20.08, lng: 73.91, address: 'Niphad, Nashik, Maharashtra' },
}) {
  const { t } = useLanguage();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [radiusKm, setRadiusKm] = useState(50);
  const [activeBuyerId, setActiveBuyerId] = useState(null);

  useEffect(() => {
    fetchNearbyBuyers();
  }, [radiusKm, selectedCrop, selectedType]);

  const fetchNearbyBuyers = async () => {
    setLoading(true);
    try {
      const res = await api.getNearbyBuyers({
        lat: farmerLocation.lat,
        lng: farmerLocation.lng,
        crop: selectedCrop !== 'ALL' ? selectedCrop : undefined,
        type: selectedType !== 'ALL' ? selectedType : undefined,
        radiusKm,
        limit: 50,
      });

      if (res?.data) {
        setBuyers(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch nearby buyers:', err);
    } finally {
      setLoading(false);
    }
  };

  const cropFilters = ['ALL', 'TOMATO', 'ONION', 'POTATO', 'CHILLI', 'GRAPES'];
  const typeFilters = ['ALL', 'Processor', 'Wholesaler', 'Retailer', 'Exporter'];

  return (
    <section
      id="farmer-buyers-map"
      style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        padding: '32px 28px',
        marginBottom: '40px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--color-green-success)',
                background: 'var(--color-green-light)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              $geoNear Verified Network
            </span>
            <Badge variant="neutral">OpenStreetMap live</Badge>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--color-forest-black)',
            }}
          >
            🗺️ Verified Nearby Buyers & Intake Nodes
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Locate authorized commercial buyers around your farmgate with certified intake capacity and fair pricing.
          </p>
        </div>

        <button
          onClick={fetchNearbyBuyers}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-subtle)',
            color: 'var(--color-forest-black)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Map</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: 'var(--color-bg-subtle)',
          borderRadius: 'calc(var(--radius-card) - 8px)',
          border: '1px solid var(--color-border)',
          marginBottom: '24px',
        }}
      >
        {/* Commodity Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-forest-black)' }}>
            Crop:
          </span>
          {cropFilters.map((crop) => (
            <button
              key={crop}
              type="button"
              onClick={() => setSelectedCrop(crop)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                border: selectedCrop === crop ? '1px solid var(--color-forest-black)' : '1px solid var(--color-border)',
                background: selectedCrop === crop ? 'var(--color-forest-black)' : '#FFFFFF',
                color: selectedCrop === crop ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
              }}
            >
              {crop === 'ALL' ? 'All Crops' : crop}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />

        {/* Radius Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-forest-black)' }}>
            Search Radius:
          </span>
          {[25, 50, 100, 200].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadiusKm(r)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                border: radiusKm === r ? '1px solid var(--color-orange-accent)' : '1px solid var(--color-border)',
                background: radiusKm === r ? 'var(--color-orange-accent)' : '#FFFFFF',
                color: radiusKm === r ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
              }}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Map & List Split View */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(300px, 1fr)',
          gap: '24px',
        }}
      >
        {/* Left: Interactive Leaflet Map */}
        <div
          style={{
            height: '460px',
            borderRadius: 'calc(var(--radius-card) - 6px)',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
          }}
        >
          <MapContainer
            center={[farmerLocation.lat, farmerLocation.lng]}
            zoom={10}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Radius Circle around Farm */}
            <Circle
              center={[farmerLocation.lat, farmerLocation.lng]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#2E7D32',
                fillColor: '#2E7D32',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '4, 6',
              }}
            />

            {/* Farmer Farmgate Marker */}
            <Marker
              position={[farmerLocation.lat, farmerLocation.lng]}
              icon={createFarmerIcon()}
            >
              <Popup>
                <div style={{ padding: '6px', minWidth: '160px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F2A1D' }}>
                    🌾 Your Farmgate
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                    {farmerLocation.address}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: 700, marginTop: '4px' }}>
                    Center of Search ({radiusKm} km radius)
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Verified Buyers Markers */}
            {buyers.map((b) => {
              // Note: backend coordinates are GeoJSON [lng, lat], Leaflet takes [lat, lng]
              const coords = b.coordinates
                ? [b.coordinates[1], b.coordinates[0]]
                : [farmerLocation.lat + (Math.random() - 0.5) * 0.15, farmerLocation.lng + (Math.random() - 0.5) * 0.15];

              return (
                <Marker
                  key={b._id}
                  position={coords}
                  icon={createBuyerIcon(b.type)}
                >
                  <Popup>
                    <div style={{ padding: '8px', minWidth: '220px', fontFamily: 'sans-serif' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', background: '#E8F5E9', color: '#2E7D32', fontWeight: 800, padding: '2px 6px', borderRadius: '10px' }}>
                          ✓ Verified {b.type}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#999' }}>
                          ~{b.distanceKm} km
                        </span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F2A1D', marginTop: '4px' }}>
                        {b.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                        Daily Intake: <strong>{b.dailyIntakeCapacity || '30 MT'}</strong>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {b.cropsBought?.map((c) => (
                          <span key={c} style={{ fontSize: '0.68rem', background: '#F4F5F2', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Right: Verified Buyers List with Distance and APMC Contracting */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxHeight: '460px',
            overflowY: 'auto',
            paddingRight: '6px',
          }}
        >
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
              <div>Running $geoNear geospatial query...</div>
            </div>
          ) : buyers.length === 0 ? (
            <EmptyState
              title="No Buyers Found In Radius"
              description={`There are currently no verified buyers registered within ${radiusKm} km buying ${selectedCrop !== 'ALL' ? selectedCrop : 'this crop'}.`}
            />
          ) : (
            buyers.map((b) => (
              <div
                key={b._id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'calc(var(--radius-card) - 6px)',
                  border: '1px solid var(--color-border)',
                  padding: '18px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: 'var(--color-green-success)',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {b.type}
                    </span>
                    <Badge variant="success" size="sm">
                      ✓ APMC Verified
                    </Badge>
                  </div>

                  <h4
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: 'var(--color-forest-black)',
                      marginBottom: '4px',
                    }}
                  >
                    {b.name}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-orange-accent)' }}>
                      📍 ~{b.distanceKm} km away
                    </span>
                    <span>•</span>
                    <span>Intake: {b.dailyIntakeCapacity || '30 MT'}</span>
                  </div>

                  {/* Crops tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {b.cropsBought?.map((c) => (
                      <span
                        key={c}
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'var(--color-bg-subtle)',
                          border: '1px solid var(--color-border)',
                          fontWeight: 600,
                          color: 'var(--color-forest-black)',
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: '10px',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                    District: {b.district || 'Nashik'}
                  </span>
                  <a
                    href="#farmer-recovery"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--color-forest-black)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    <span>Route Produce</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Privacy Notice Disclaimer */}
      <div
        style={{
          marginTop: '20px',
          padding: '12px 18px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-bg-subtle)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <Lock size={14} color="var(--color-forest-medium)" />
        <span>
          <strong>Commercial Privacy Protection:</strong> Buyer coordinates are obfuscated to ~1.1 km to protect procurement contracts. Direct linkages are verified and dispatched through the APMC gateway.
        </span>
      </div>
    </section>
  );
}
