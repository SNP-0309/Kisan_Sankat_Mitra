import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertOctagon, TrendingUp, Clock, Users, Building2, Check, X } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [overview, setOverview] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resOverview, resFacilities] = await Promise.all([
        api.getAdminOverview(),
        api.getNearbyShops(),
      ]);
      if (resOverview?.data) setOverview(resOverview.data);
      if (resFacilities?.data) setFacilities(resFacilities.data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (facilityId, currentStatus) => {
    try {
      await api.verifyShop(facilityId, !currentStatus);
      setFacilities((prev) =>
        prev.map((f) => (f._id === facilityId ? { ...f, verified: !currentStatus } : f))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade">
      {/* Title */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🛡️</span>
          <div>
            <h2 style={{ fontSize: '1.45rem', color: 'var(--green-950)' }}>
              {t('governance')}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              District APMC Supply Chain Crisis Monitoring & Mandi Regulatory Oversight
            </p>
          </div>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '20px',
            borderLeft: '5px solid var(--green-600)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {t('produceValueSaved')}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green-900)', marginTop: 4 }}>
            ₹{overview?.totalEconomicValueSavedRupees ? overview.totalEconomicValueSavedRupees.toLocaleString() : '2,840,500'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--green-700)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={14} /> +18.4% vs last harvest season
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '20px',
            borderLeft: '5px solid var(--green-800)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Crisis Recovery Rate
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green-900)', marginTop: 4 }}>
            {overview?.successRatePercentage || 92.8}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            {overview?.resolvedRecoveryCount || 39} of {overview?.totalDistressIncidents || 42} cases diverted
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '20px',
            borderLeft: '5px solid var(--amber-500)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Avg Turnaround to Dispatch
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber-600)', marginTop: 4 }}>
            {overview?.averageRecoveryTurnaroundMinutes || 34} min
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={14} /> From distress SOS to truck arrival
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '20px',
            borderLeft: '5px solid var(--blue-600)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Active Verified Buyers Online
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue-600)', marginTop: 4 }}>
            {overview?.activeBuyersOnline || 18} Buyers
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            142.5 MT verified produce volume
          </div>
        </div>
      </div>

      {/* Facility Verification Table */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--green-900)' }}>
              🏢 Mandi & Cold Storage Facility Governance
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Authorize accredited intake centers and verify APMC floor licenses
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>Facility Name</th>
                <th style={{ padding: '12px 14px' }}>Category</th>
                <th style={{ padding: '12px 14px' }}>District Location</th>
                <th style={{ padding: '12px 14px' }}>Live Capacity / Volume</th>
                <th style={{ padding: '12px 14px' }}>Regulatory Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((f) => (
                <tr key={f._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {f.name}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span className="badge badge-info">{f.type}</span>
                  </td>
                  <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                    {f.district}
                  </td>
                  <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                    {f.capacityStatus}
                  </td>
                  <td style={{ padding: '14px' }}>
                    {f.verified ? (
                      <span className="badge badge-success">
                        <Check size={13} /> Accredited
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        <Clock size={13} /> Pending Audit
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <button
                      onClick={() => toggleVerification(f._id, f.verified)}
                      className={`btn ${f.verified ? 'btn-outline' : 'btn-primary'}`}
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      {f.verified ? 'Revoke License' : 'Verify & Authorize'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
