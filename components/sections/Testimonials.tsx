'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

/**
 * Testimonials Section Component
 * Interactive slider with fake testimonials
 */
const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: "Affiiate has been our top-performing network for 2 years running. Their conversion rates are unmatched in the industry, and their dedicated account manager is always available to help optimize our campaigns.",
      author: "Alex Martinez",
      position: "CEO",
      company: "TrafficKing Media",
      rating: 5,
      geo: "Spain",
      revenue: "$50K+/month",
      avatar: "AM",
      color: "from-purple-500 to-purple-700",
    },
    {
      id: 2,
      quote: "The team at Affiiate helped us increase our revenue by 150% in just 3 months. Their understanding of the casino vertical and data-driven approach is exceptional. Highly recommended!",
      author: "Sarah Kim",
      position: "Founder",
      company: "iGaming Profits",
      rating: 5,
      geo: "South Korea",
      revenue: "$75K+/month",
      avatar: "SK",
      color: "from-primary-500 to-primary-700",
    },
    {
      id: 3,
      quote: "Fast payments, great offers, and excellent communication. Affiiate is our go-to network for casino traffic. Their GEO-specific landing pages really make a difference.",
      author: "Mike Richardson",
      position: "Director of Marketing",
      company: "Casino Leads Co.",
      rating: 5,
      geo: "UK",
      revenue: "$100K+/month",
      avatar: "MR",
      color: "from-green-500 to-green-700",
    },
    {
      id: 4,
      quote: "We've worked with many networks, but Affiiate stands out for their transparency and real-time reporting. The API integration makes our workflow seamless and efficient.",
      author: "Elena Vasquez",
      position: "Head of Barracuda",
      company: "PlayTime Entertainment",
      rating: 5,
      geo: "LatAm",
      revenue: "$60K+/month",
      avatar: "EV",
      color: "from-red-500 to-red-700",
    },
    {
      id: 5,
      quote: "Their support team is incredible. Whenever we have questions or need assistance, they respond within minutes. The personal approach really sets them apart from other networks.",
      author: "David Chen",
      position: "Affiliate Manager",
      company: "Premium Media Group",
      rating: 5,
      geo: "Singapore",
      revenue: "$45K+/month",
      avatar: "DC",
      color: "from-blue-500 to-blue-700",
    },
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section id="testimonials" className="section relative overflow-hidden">
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
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={staggerItem} className="section-title mb-4">
            What Our Partners Say
          </motion.h2>
          <motion.p variants={staggerItem} className="section-subtitle">
            Success stories from Barracuda who have scaled their business with Affiiate
          </motion.p>
        </motion.div>

        {/* Testimonial Slider */}
        <div className="max-w-4xl mx-auto">
          {/* Main Slider */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-12 h-12 bg-surface-200 rounded-full flex items-center justify-center text-text hover:bg-primary-500 hover:text-background transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-12 h-12 bg-surface-200 rounded-full flex items-center justify-center text-text hover:bg-primary-500 hover:text-background transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slide Container */}
            <div className="overflow-hidden px-4 md:px-0">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="card p-8 md:p-12"
                >
                  {/* Quote Icon */}
                  <div className="absolute top-6 left-8 opacity-10">
                    <Quote className="w-16 h-16 text-primary-500" />
                  </div>

                  <div className="relative z-10">
                    {/* Rating */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-primary-500 text-primary-500" />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-xl md:text-2xl text-text leading-relaxed mb-8">
                      "{testimonials[currentIndex].quote}"
                    </blockquote>

                    {/* Author Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${testimonials[currentIndex].color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xl font-bold text-white">
                          {testimonials[currentIndex].avatar}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <p className="font-bold text-text">{testimonials[currentIndex].author}</p>
                        <p className="text-sm text-text-muted">
                          {testimonials[currentIndex].position} at {testimonials[currentIndex].company}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                          <span>{testimonials[currentIndex].geo}</span>
                          <span>•</span>
                          <span className="text-accent-green">{testimonials[currentIndex].revenue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-primary-500'
                      : 'bg-surface-300 hover:bg-surface-200'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: '500+', label: 'Active Partners' },
            { value: '4.9/5', label: 'Average Rating' },
            { value: '98%', label: 'Would Recommend' },
            { value: '$50M+', label: 'Total Paid' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="card p-6 text-center"
            >
              <p className="text-2xl md:text-3xl font-bold gradient-text mb-1">{stat.value}</p>
              <p className="text-sm text-text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;

