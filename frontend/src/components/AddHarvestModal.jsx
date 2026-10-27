import React, { useState } from 'react';
import { Sprout, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const MAHARASHTRA_CROPS = [
  { name: 'Tomato (टोमॅटो)', variety: 'Abhinav Hybrid (अभिनव)', defaultPrice: 28, shelfLife: 6 },
  { name: 'Onion (कांदा)', variety: 'Gavran Red (गावरान लाल)', defaultPrice: 22, shelfLife: 30 },
  { name: 'Pomegranate (डाळिंब)', variety: 'Bhagwa (भगवा)', defaultPrice: 85, shelfLife: 20 },
  { name: 'Grapes (द्राक्षे)', variety: 'Thomson Seedless', defaultPrice: 65, shelfLife: 10 },
  { name: 'Soybean (सोयाबीन)', variety: 'JS 335', defaultPrice: 48, shelfLife: 90 },
];

export default function AddHarvestModal({ isOpen, onClose, onHarvestAdded }) {
  if (!isOpen) return null;

  const [cropIdx, setCropIdx] = useState(0);
  const [variety, setVariety] = useState(MAHARASHTRA_CROPS[0].variety);
  const [quantityKg, setQuantityKg] = useState('3000');
  const [targetPrice, setTargetPrice] = useState(MAHARASHTRA_CROPS[0].defaultPrice.toString());
  const [shelfLifeDays, setShelfLifeDays] = useState(MAHARASHTRA_CROPS[0].shelfLife.toString());
  const [locationAddress, setLocationAddress] = useState('Niphad, Nashik, Maharashtra');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCropChange = (idx) => {
    setCropIdx(idx);
    setVariety(MAHARASHTRA_CROPS[idx].variety);
    setTargetPrice(MAHARASHTRA_CROPS[idx].defaultPrice.toString());
    setShelfLifeDays(MAHARASHTRA_CROPS[idx].shelfLife.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantityKg || Number(quantityKg) <= 0) {
      setError('Please provide a valid quantity.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        cropType: MAHARASHTRA_CROPS[cropIdx].name,
        cropVariety: variety,
        totalQuantityKg: Number(quantityKg),
        targetPricePerKg: Number(targetPrice),
        storageLifeDays: Number(shelfLifeDays),
        locationAddress,
        harvestDate: new Date().toISOString().split('T')[0],
      };

      const res = await api.createHarvest(payload);
      if (res?.data) {
        onHarvestAdded(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create harvest batch.');
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
            background: 'linear-gradient(135deg, var(--green-100), #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--green-800)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sprout size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--green-900)' }}>
                Register New Harvest Batch (नवीन पीक नोंदणी)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Record batch details for automated price tracking and distress protection
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
              }}
            >
              {error}
            </div>
          )}

          {/* Select Crop */}
          <div className="form-group">
            <label className="form-label">Crop Name (पिकाचे नाव)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
              {MAHARASHTRA_CROPS.map((c, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleCropChange(i)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: cropIdx === i ? '2px solid var(--green-700)' : '1px solid var(--border-medium)',
                    background: cropIdx === i ? 'var(--green-100)' : '#ffffff',
                    color: cropIdx === i ? 'var(--green-900)' : 'var(--text-primary)',
                    fontWeight: cropIdx === i ? 700 : 500,
                    fontSize: '0.86rem',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Variety & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Crop Variety (वाण / जात)</label>
              <input
                type="text"
                className="form-input"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Farm Location (ठिकाण / जिल्हा)</label>
              <input
                type="text"
                className="form-input"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quantity & Target Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Harvested Quantity (वजन - किलो)</label>
              <input
                type="number"
                className="form-input"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                min="100"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Rate (अपेक्षित भाव ₹/किलो)</label>
              <input
                type="number"
                className="form-input"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>

          {/* Shelf Life */}
          <div className="form-group">
            <label className="form-label">Estimated Ambient Shelf Life (टिकवण क्षमता - दिवस)</label>
            <input
              type="number"
              className="form-input"
              value={shelfLifeDays}
              onChange={(e) => setShelfLifeDays(e.target.value)}
              min="1"
              required
            />
          </div>

          {/* Automated ML Quality Banner */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--green-50)',
              border: '1px solid var(--green-200)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Sparkles size={20} color="var(--green-700)" />
            <div style={{ fontSize: '0.84rem', color: 'var(--green-900)' }}>
              <strong>AI Quality Pre-Audit:</strong> YOLOv8 vision pipeline will auto-verify produce blemish rate and assign certified Grade A badge upon photo submission.
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
              className="btn btn-primary"
              disabled={submitting}
              style={{ minWidth: 160 }}
            >
              {submitting ? 'Registering...' : 'Save Harvest Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
