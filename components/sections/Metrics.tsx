'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, TrendingUp, DollarSign, Zap, Target } from 'lucide-react';

const metricsData = [
  { icon: Users, value: '500+', label: 'Active Partners' },
  { icon: Globe, value: '50+', label: 'GEOs Covered' },
  { icon: TrendingUp, value: '200+', label: 'Live Offers' },
  { icon: DollarSign, value: '$5M+', label: 'Monthly Payouts' },
  { icon: Zap, value: '99.9%', label: 'Uptime' },
  { icon: Target, value: '48h', label: 'Fast Payouts' },
];

function MetricCard(props) {
  const metric = props.metric;
  
  return React.createElement('div', {
    className: 'card text-center group hover:border-primary-500/30'
  },
    React.createElement('div', { className: 'mb-4' },
      React.createElement(metric.icon, { className: 'w-10 h-10 mx-auto text-primary-500' })
    ),
    React.createElement('div', { className: 'text-3xl font-bold text-text mb-2' }, metric.value),
    React.createElement('div', { className: 'text-sm text-text-muted' }, metric.label)
  );
}

export default function Metrics() {
  return React.createElement('section', {
    className: 'section bg-surface-100/50',
    id: 'metrics'
  },
    React.createElement('div', { className: 'container-custom' },
      React.createElement('div', { className: 'text-center mb-16' },
        React.createElement('h2', { className: 'section-title mb-4' }, 'Our Performance'),
        React.createElement('p', { className: 'section-subtitle' },
          'Industry-leading metrics that demonstrate our commitment to partner success'
        )
      ),
      React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4' },
        metricsData.map(function(metric, index) {
          return React.createElement(MetricCard, { key: index, metric: metric });
        })
      )
    )
  );
}
