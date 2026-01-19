'use client';

import { motion, Variants } from 'framer-motion';
import { 
  TrendingUp, 
  Shield, 
  HeadphonesIcon, 
  Zap, 
  Globe, 
  DollarSign,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem } from '@/lib/animations';


// Define animation variants locally since it's not exported from animations file
const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

/**
 * About Section Component
 * Company overview and advantages
 */
const About = () => {
  const advantages = [
    {
      icon: TrendingUp,
      title: 'Highest Conversions',
      description: 'Optimized landing pages and funnels designed for maximum conversion rates across all GEOs.',
    },
    {
      icon: DollarSign,
      title: 'Competitive Rates',
      description: 'Industry-leading CPA rates up to $500 and revshare up to 50% on selected offers.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Active in 50+ countries with localized content and payment methods for each region.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Fraud protection systems and timely payments guaranteed every month.',
    },
    {
      icon: HeadphonesIcon,
      title: 'Dedicated Support',
      description: '24/7 personal account managers to help you optimize your campaigns.',
    },
    {
      icon: Zap,
      title: 'Real-Time Analytics',
      description: 'Advanced tracking dashboard with real-time stats and performance insights.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Active Partners' },
    { value: '$50M+', label: 'Total Paid' },
    { value: '200+', label: 'Live Offers' },
    { value: '99.9%', label: 'Uptime' },
  ];

  // Container style
  const containerStyle: React.CSSProperties = {
    textAlign: 'center',
    maxWidth: '48rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: '4rem',
  };

  // Stats grid style
  const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '1rem',
    marginBottom: '4rem',
  };

  // Advantages grid style
  const advantagesGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    gap: '1.5rem',
    marginBottom: '4rem',
  };

  // CTA card style
  const ctaCardStyle: React.CSSProperties = {
    padding: '2rem',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <section id="about" className="section relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent" />
      
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          style={containerStyle}
        >
          <h2 className="section-title mb-4">
            About Barracuda
          </h2>
          <p className="section-subtitle">
            We are the leading casino Barracuda network connecting publishers with premium iGaming brands worldwide. Our mission is to maximize your earnings through premium offers and dedicated support.
          </p>
        </motion.div>

        {/* Stats Grid */}
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
              className="card p-6 md:p-8 text-center"
            >
              <p className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</p>
              <p className="text-text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Advantages Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {advantages.map((advantage) => (
            <motion.div
              key={advantage.title}
              variants={staggerItem}
              className="card p-6 hover:border-primary-500/30"
            >
              <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-500/20 transition-colors">
                <advantage.icon className="w-7 h-7 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">{advantage.title}</h3>
              <p className="text-text-muted">{advantage.description}</p>
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
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10" />
          
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-text mb-4">
              Ready to Start Earning?
            </h3>
            <p className="text-text-muted mb-8 max-w-2xl mx-auto">
              Join our network today and get access to premium casino offers with the highest converting rates in the industry.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Become a Partner
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;