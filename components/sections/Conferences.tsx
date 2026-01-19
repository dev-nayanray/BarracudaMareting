'use client';

import { motion, Variants } from 'framer-motion';
import { Calendar, MapPin, ExternalLink, Users, Sparkles } from 'lucide-react';
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
 * Conferences Section Component
 * Upcoming iGaming conferences and events
 */
const Conferences = () => {
  const conferences = [
    {
      name: 'SiGMA Europe',
      date: 'November 11-14, 2024',
      location: 'Malta, Mediterranean',
      description: 'The premier iGaming event in Europe. Meet our team at booth A123.',
      status: 'upcoming',
      booth: 'Booth A123',
      image: '/images/conferences/sigma.jpg',
    },
    {
      name: 'iGB Affiliate London',
      date: 'January 22-25, 2025',
      location: 'London, UK',
      description: 'The biggest affiliate conference in the UK. Let\'s connect at our stand.',
      status: 'upcoming',
      booth: 'Stand 4B-21',
      image: '/images/conferences/igb.jpg',
    },
    {
      name: 'Affiliate World Europe',
      date: 'March 2025',
      location: 'Barcelona, Spain',
      description: 'Join thousands of affiliate marketers at Europe\'s premier performance marketing event.',
      status: 'upcoming',
      booth: 'TBA',
      image: '/images/conferences/awe.jpg',
    },
    {
      name: 'SiGMA Asia',
      date: 'June 2-5, 2025',
      location: 'Manila, Philippines',
      description: 'The leading iGaming event in Asia. Visit us to discuss APAC opportunities.',
      status: 'upcoming',
      booth: 'TBA',
      image: '/images/conferences/sigma-asia.jpg',
    },
  ];

  const pastConferences = [
    { name: 'iGB Affiliate Barcelona', location: 'Barcelona, Spain', date: 'October 2023' },
    { name: 'SiGMA Europe Malta', location: 'Malta', date: 'November 2023' },
    { name: 'Affilliate World Dubai', location: 'Dubai, UAE', date: 'March 2024' },
  ];

  // Styles
  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '4rem',
  };

  const ctaStyle: React.CSSProperties = {
    marginTop: '3rem',
    textAlign: 'center',
  };

  return (
    <section id="conferences" className="section relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/3 to-transparent" />
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
          <div className="badge-primary mb-4">Global Presence</div>
          <h2 className="section-title mb-4">
            Meet Us at iGaming Conferences
          </h2>
          <p className="section-subtitle">
            We attend the world\'s leading iGaming events. Come visit us to discuss partnership opportunities.
          </p>
        </motion.div>

        {/* Upcoming Conferences */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6 mb-16"
        >
          {conferences.map((conference, index) => (
            <motion.div
              key={conference.name}
              variants={staggerItem}
              className="card p-0 overflow-hidden hover:border-primary-500/30"
            >
              {/* Conference Banner Placeholder */}
              <div className={`h-32 bg-gradient-to-br ${index % 2 === 0 ? 'from-primary-500/20 to-secondary-500/20' : 'from-secondary-500/20 to-primary-500/20'} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-primary-500/30" />
                </div>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-accent-green/20 text-accent-green text-xs font-semibold rounded-full">
                    {conference.status === 'upcoming' ? 'Upcoming' : 'Past'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Conference Name */}
                <h3 className="text-xl font-bold text-text mb-3 group-hover:text-primary-500 transition-colors">
                  {conference.name}
                </h3>

                {/* Date & Location */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{conference.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{conference.location}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-text-muted text-sm mb-4">
                  {conference.description}
                </p>

                {/* Booth Info */}
                <div className="flex items-center gap-2 p-3 bg-primary-500/10 rounded-xl">
                  <Users className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium text-primary-500">{conference.booth}</span>
                </div>

                {/* Action */}
                {conference.status === 'upcoming' && (
                  <button className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-surface-300 hover:border-primary-500 hover:bg-primary-500/10 transition-all group/btn">
                    <span className="text-sm font-medium text-text group-hover/btn:text-primary-500">
                      Schedule a Meeting
                    </span>
                    <ExternalLink className="w-4 h-4 text-text-muted group-hover/btn:text-primary-500" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Past Conferences */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          className="card p-8 text-center"
        >
          <h3 className="text-xl font-bold text-text mb-6">
            We\'ve Also Been Here
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {pastConferences.map((conf, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-surface-200 rounded-full"
              >
                <MapPin className="w-4 h-4 text-text-muted" />
                <span className="text-sm text-text-muted">{conf.name}</span>
                <span className="text-text-muted">•</span>
                <span className="text-sm text-text-muted">{conf.date}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          style={ctaStyle}
        >
          <p className="text-text-muted mb-4">
            Want to meet us at a conference not listed here?
          </p>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
          >
            Let us know →
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Conferences;

