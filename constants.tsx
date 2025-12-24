
import React from 'react';

export const PAYMENT_RATES = {
  PANT_MEASUREMENT: { new: 30, old: 15 },
  SHIRT_MEASUREMENT: { new: 20, old: 10 },
  PANT_CUTTING: 50,
  PANT_STITCHING: 220,
  SHIRT_STITCHING: 120,
  PRESS: 20,
  SHOWROOM_RETURN: 20
};

export const HIERARCHY_COMMISSIONS = [
  { level: 1, percent: 1.5, label: 'Manager' },
  { level: 2, percent: 2.0, label: 'Super Manager' },
  { level: 3, percent: 3.0, label: 'Classic Manager' },
  { level: 4, percent: 4.0, label: 'Advance Manager' },
  { level: 5, percent: 5.0, label: 'Operation Head' },
  { level: 6, percent: 6.0, label: 'Director' }
];

export const MATERIAL_ITEMS = [
  'Thread', 'Canvas', 'Box Patti', 'Button Patti', 'Belt Roll', 'Hook', 'Zip', 'Pocketin', 'Dhoti Canvas', 'Fusing Canvas'
];

export const GOLD_SVG_GRADIENT = (
  <svg width="0" height="0" className="absolute">
    <defs>
      <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#f1e292', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#d4af37', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#aa8a2e', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
  </svg>
);
