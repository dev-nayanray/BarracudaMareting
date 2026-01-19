'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';

/**
 * Partners Section Component
 * Showcase of partner brands (template)
 */
const Partners = () => {
  // Partner logos - using placeholder text for demo
  // In production, replace with actual partner logos
  const partners = [
    { name: 'Royal Casino', tier: 'Premier', color: 'from-purple-500 to-purple-700' },
    { name: 'Lucky Wheel', tier: 'Gold', color: 'from-yellow-500 to-yellow-700' },
    { name: 'Spin Palace', tier: 'Silver', color: 'from-gray-400 to-gray-600' },
    { name: 'Jackpot City', tier: 'Premier', color: 'from-red-500 to-red-700' },
    { name: 'Mega Fortune', tier: 'Gold', color: 'from-green-500 to-green-700' },
    { name: 'Bet Master', tier: 'Silver', color: 'from-blue-500 to-blue-700' },
    { name: 'Gold Rush', tier: 'Premier', color: 'from-amber-500 to-amber-700' },
    { name: 'Casino Stars', tier: 'Gold', color: 'from-pink-500 to-pink-700' },
  ];

  const testimonials = [
    {
      quote: "Barracuda has been our top-performing network for 2 years running. Their conversion rates are unmatched in the industry.",
      author: "Alex M.",
      company: "TrafficKing Media",
      rating: 5,
    },
    {
      quote: "The dedicated account manager helped us increase our revenue by 150% in just 3 months. Highly recommended!",
      author: "Sarah K.",
      company: "IGaming Profits",
      rating: 5,
    },
    {
      quote: "Fast payments, great offers, and excellent communication. Barracuda is our go-to network for casino traffic.",
      author: "Mike R.",
      company: "Casino Leads Co.",
      rating: 5,
    },
  ];

  return (
    <section id="partners" className="section relative overflow-hidden">
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
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">
            Our Trusted Partners
          </h2>
          <p className="section-subtitle">
            Join 500+ successful affiliates who trust Affiiate with their casino campaigns
          </p>
        </motion.div>

        {/* Partner Logos Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              variants={staggerItem}
              className="card p-8 flex items-center justify-center hover:border-primary-500/30 group cursor-pointer"
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${partner.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl font-bold text-white">
                    {partner.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-text mb-1">{partner.name}</h3>
                <p className="text-xs text-text-muted uppercase tracking-wider">{partner.tier}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="card p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-text mb-4">
              Want to Become Our Partner?
            </h3>
            <p className="text-text-muted mb-8 max-w-2xl mx-auto">
              Join our exclusive network and get access to premium casino offers with the highest payouts in the industry.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Apply Now
            </Button>
          </div>
        </motion.div>

        {/* Testimonials Preview */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-16"
        >
          <motion.h3
            variants={staggerItem}
            className="text-2xl font-display font-bold text-text text-center mb-8"
          >
            What Our Partners Say
          </motion.h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="card p-6 hover:border-primary-500/30"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary-500 text-primary-500" />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-text-muted mb-6 italic">"{testimonial.quote}"</p>
                
                {/* Author */}
                <div>
                  <p className="font-semibold text-text">{testimonial.author}</p>
                  <p className="text-sm text-text-muted">{testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Partners;

