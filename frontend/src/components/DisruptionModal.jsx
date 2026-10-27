import React, { useState } from 'react';
import { AlertTriangle, X, Truck, ShieldAlert, Clock, Check } from 'lucide-react';
import { api } from '../services/api';

const CRISIS_REASONS = [
  'Buyer canceled bulk purchase order while truck was en route (खरेदीदाराने शेवटच्या क्षणी नकार दिला)',
  'Transport vehicle broke down on highway with perishable load (महामार्गावर वाहतूक वाहन नादुरुस्त झाले)',
  'Heavy rain / humidity causing rapid spoilage risk in field (अचानक अवकाळी पाऊस/बुरशीचा धोका)',
  'Local APMC market shut down unexpectedly / protest (स्थानिक बाजार अचानक बंद)',
];

export default function DisruptionModal({ isOpen, onClose, harvests, onDisruptionTriggered }) {
  if (!isOpen) return null;

  const activeHarvests = harvests.filter((h) => h.availableQuantityKg > 0);
  const [selectedHarvestId, setSelectedHarvestId] = useState(
    activeHarvests[0]?._id || harvests[0]?._id || ''
  );
  const [canceledQty, setCanceledQty] = useState('2000');
  const [reason, setReason] = useState(CRISIS_REASONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedHarvest = harvests.find((h) => h._id === selectedHarvestId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHarvestId) {
      setError('Please select an active harvest batch.');
      return;
    }
    const qty = Number(canceledQty);
    if (!qty || qty <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.disruptHarvest(selectedHarvestId, qty, reason);
      if (res?.data) {
        onDisruptionTriggered(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to trigger distress protocol');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, var(--red-100), #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--red-600)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--red-700)' }}>
                🚨 Declare Supply Chain Disruption / SOS
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                संकटग्रस्त पिकाची तात्काळ माहिती नोंदवून रिकव्हरी सुरू करा
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid var(--border-medium)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--red-100)',
                color: 'var(--red-700)',
                fontSize: '0.9rem',
                marginBottom: 16,
                border: '1px solid rgba(220, 38, 38, 0.2)',
              }}
            >
              {error}
            </div>
          )}

          {/* Select Harvest */}
          <div className="form-group">
            <label className="form-label">
              Select Impacted Crop Lot (संकटात सापडलेला लॉट निवडा)
            </label>
            <select
              className="form-input"
              value={selectedHarvestId}
              onChange={(e) => setSelectedHarvestId(e.target.value)}
            >
              {harvests.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.cropType} — {h.cropVariety} ({h.availableQuantityKg} kg available / ₹{h.targetPricePerKg}/kg)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity in Distress */}
          <div className="form-group">
            <label className="form-label">
              Distressed / Stranded Quantity in KG (संकटात अडकलेले प्रमाण - किलो)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                className="form-input"
                value={canceledQty}
                onChange={(e) => setCanceledQty(e.target.value)}
                min="100"
                max={selectedHarvest ? selectedHarvest.availableQuantityKg : 10000}
                required
              />
              <span
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                KG
              </span>
            </div>
            {selectedHarvest && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Batch total available: {selectedHarvest.availableQuantityKg.toLocaleString()} kg
              </span>
            )}
          </div>

          {/* Disruption Reason */}
          <div className="form-group">
            <label className="form-label">
              Cause of Breakdown / Disruption (समस्येचे मूळ कारण)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CRISIS_REASONS.map((r, i) => (
                <label
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: reason === r ? '2px solid var(--red-600)' : '1px solid var(--border-medium)',
                    background: reason === r ? 'var(--red-100)' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="disruptionReason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    style={{ marginTop: 3 }}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--amber-100)',
              border: '1px solid rgba(217, 119, 6, 0.25)',
              marginBottom: 20,
              display: 'flex',
              gap: 10,
            }}
          >
            <ShieldAlert size={20} color="var(--amber-600)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.84rem', color: 'var(--amber-600)' }}>
              <strong>Immediate Automated Action:</strong> Declaring this disruption activates the Deterministic Recovery Engine to compute optimal diversion options (Spot Mandi, Cold Chain, Secondary Processing) and notifies certified nearby buyers.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={submitting}
              style={{ minWidth: 180 }}
            >
              {submitting ? 'Triggering Recovery Engine...' : '🚨 Trigger Distress SOS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
