'use client';

import { motion, Variants } from 'framer-motion';
import { 
  Target, 
  BarChart3, 
  Zap, 
  Shield, 
  Globe2, 
  Users,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem } from '@/lib/animations';

// Define fadeInUp variants locally
const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

/**
 * Advertisers Section Component
 * Value proposition for advertisers
 */
const Advertisers = () => {
  const benefits = [
    {
      icon: Target,
      title: 'Quality Traffic',
      description: 'Access our network of 500+ verified publishers delivering high-intent players from 50+ GEOs.',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Comprehensive dashboard with real-time stats, conversion tracking, and performance insights.',
    },
    {
      icon: Zap,
      title: 'Fast Approvals',
      description: 'Quick publisher verification process. Get your campaigns live within 24 hours.',
    },
    {
      icon: Shield,
      title: 'Fraud Protection',
      description: 'Advanced anti-fraud systems to ensure you only pay for legitimate conversions.',
    },
    {
      icon: Globe2,
      title: 'Global Reach',
      description: 'Expand into new markets with our localized publishers and regional expertise.',
    },
    {
      icon: Users,
      title: 'Dedicated Support',
      description: 'Personal account manager to help optimize your campaigns and maximize ROI.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Active Publishers' },
    { value: '10M+', label: 'Monthly Visitors' },
    { value: '50+', label: 'Countries' },
    { value: '<24h', label: 'Approval Time' },
  ];

  // Styles
  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '4rem',
  };

  const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '1rem',
    marginBottom: '4rem',
  };

  const benefitsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    gap: '1.5rem',
    marginBottom: '4rem',
  };

  const ctaCardStyle: React.CSSProperties = {
    padding: '2rem',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <section id="advertisers" className="section relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-500/5 via-transparent to-primary-500/5" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          style={headerStyle}
        >
          <div className="badge-secondary mb-4">For Advertisers</div>
          <h2 className="section-title mb-4">
            Grow Your Casino Brand Globally
          </h2>
          <p className="section-subtitle">
            Connect with quality publishers and scale your player acquisition with our premium affiliate network
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="card p-6 text-center"
            >
              <p className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</p>
              <p className="text-text-muted text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={staggerItem}
              className="card p-6 hover:border-secondary-500/30"
            >
              <div className="w-14 h-14 bg-secondary-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary-500/20 transition-colors">
                <benefit.icon className="w-7 h-7 text-secondary-500" />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">{benefit.title}</h3>
              <p className="text-text-muted">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          style={ctaCardStyle}
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-500/10 via-transparent to-primary-500/10" />
          
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-text mb-4">
              Ready to Scale Your Brand?
            </h3>
            <p className="text-text-muted mb-8 max-w-2xl mx-auto">
              Join leading casino brands who trust Barracuda for their player acquisition. Get access to quality traffic and dedicated support.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Start Your Campaign
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-green" />
                <span>No Long-term Contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-green" />
                <span>Daily/Weekly Payouts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-green" />
                <span>Dedicated Support</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Advertisers;

