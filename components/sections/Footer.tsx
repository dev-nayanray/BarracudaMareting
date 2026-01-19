'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Mail, 
  Send, 
  Twitter, 
  Linkedin, 
  Facebook,
  ArrowRight,
  Shield,
  Award,
  Clock
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', href: '#about' },
      { label: 'Advantages', href: '#advantages' },
      { label: 'Our Partners', href: '#partners' },
      { label: 'For Advertisers', href: '#advertisers' },
    ],
    resources: [
      { label: 'Contact Us', href: '#contact' },
      { label: 'Our Team', href: '#team' },
      { label: 'Conferences', href: '#conferences' },
      { label: 'Testimonials', href: '#testimonials' },
    ],
    legal: [
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'AML Policy', href: '#' },
    ],
    support: [
      { label: 'FAQ', href: '#' },
      { label: 'Getting Started', href: '#' },
      { label: 'API Documentation', href: '#' },
      { label: 'Trackers', href: '#' },
    ],
  };

  const contactInfo = {
    email: 'partners@barracuda.marketing',
    telegram: '@barracuda_alex',
    hours: '24/7 Support',
  };

  return (
    React.createElement('footer', { className: 'relative bg-surface-100 border-t border-surface-200' },
      React.createElement('div', { className: 'absolute inset-0 opacity-5' },
        React.createElement('div', { className: 'absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.1)_1px,transparent_1px)] bg-[size:64px_64px]' })
      ),
      React.createElement('div', { className: 'container-custom relative z-10' },
        React.createElement('div', { className: 'py-16' },
          React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-12' },
            React.createElement('div', { className: 'lg:col-span-4' },
              React.createElement(Link, { href: '/', className: 'flex items-center space-x-2 mb-6' },
                React.createElement('div', { className: 'relative' },
                  React.createElement('div', { className: 'w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center' },
                    React.createElement(Sparkles, { className: 'w-6 h-6 text-background' })
                  ),
                  React.createElement('div', { className: 'absolute -inset-1 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl blur opacity-30' })
                ),
                React.createElement('span', { className: 'text-2xl font-display font-bold gradient-text' }, 'Barracuda')
              ),
              React.createElement('p', { className: 'text-text-muted mb-6' },
                'The leading casino Barracuda network connecting publishers with premium iGaming brands worldwide.'
              ),
              React.createElement('div', { className: 'flex flex-wrap gap-4 mb-6' },
                React.createElement('div', { className: 'flex items-center gap-2 text-xs text-text-muted' },
                  React.createElement(Shield, { className: 'w-4 h-4 text-accent-green' }),
                  React.createElement('span', null, 'Secure & Trusted')
                ),
                React.createElement('div', { className: 'flex items-center gap-2 text-xs text-text-muted' },
                  React.createElement(Award, { className: 'w-4 h-4 text-primary-500' }),
                  React.createElement('span', null, 'Award Winning')
                ),
                React.createElement('div', { className: 'flex items-center gap-2 text-xs text-text-muted' },
                  React.createElement(Clock, { className: 'w-4 h-4 text-secondary-500' }),
                  React.createElement('span', null, '24/7 Support')
                )
              ),
              React.createElement('div', { className: 'flex items-center gap-4' },
                React.createElement('a', { href: 'https://t.me/' + contactInfo.telegram.replace('@', ''), target: '_blank', rel: 'noopener noreferrer', className: 'w-10 h-10 bg-surface-200 rounded-xl flex items-center justify-center text-text-muted hover:bg-primary-500 hover:text-background transition-colors' },
                  React.createElement(Send, { className: 'w-5 h-5' })
                ),
                React.createElement('a', { href: 'https://twitter.com/barracuda_alex', target: '_blank', rel: 'noopener noreferrer', className: 'w-10 h-10 bg-surface-200 rounded-xl flex items-center justify-center text-text-muted hover:bg-primary-500 hover:text-background transition-colors' },
                  React.createElement(Twitter, { className: 'w-5 h-5' })
                ),
                React.createElement('a', { href: 'https://linkedin.com/in/barracuda_alex', target: '_blank', rel: 'noopener noreferrer', className: 'w-10 h-10 bg-surface-200 rounded-xl flex items-center justify-center text-text-muted hover:bg-primary-500 hover:text-background transition-colors' },
                  React.createElement(Linkedin, { className: 'w-5 h-5' })
                ),
                React.createElement('a', { href: 'https://facebook.com/barracuda_alex', target: '_blank', rel: 'noopener noreferrer', className: 'w-10 h-10 bg-surface-200 rounded-xl flex items-center justify-center text-text-muted hover:bg-primary-500 hover:text-background transition-colors' },
                  React.createElement(Facebook, { className: 'w-5 h-5' })
                )
              )
            ),
            React.createElement('div', { className: 'lg:col-span-2' },
              React.createElement('h4', { className: 'font-semibold text-text mb-4' }, 'Company'),
              React.createElement('ul', { className: 'space-y-3' },
                footerLinks.company.map(function(link) {
                  return React.createElement('li', { key: link.label },
                    React.createElement(Link, { href: link.href, className: 'text-text-muted hover:text-primary-500 transition-colors text-sm' }, link.label)
                  );
                })
              )
            ),
            React.createElement('div', { className: 'lg:col-span-2' },
              React.createElement('h4', { className: 'font-semibold text-text mb-4' }, 'Resources'),
              React.createElement('ul', { className: 'space-y-3' },
                footerLinks.resources.map(function(link) {
                  return React.createElement('li', { key: link.label },
                    React.createElement(Link, { href: link.href, className: 'text-text-muted hover:text-primary-500 transition-colors text-sm' }, link.label)
                  );
                })
              )
            ),
            React.createElement('div', { className: 'lg:col-span-2' },
              React.createElement('h4', { className: 'font-semibold text-text mb-4' }, 'Support'),
              React.createElement('ul', { className: 'space-y-3' },
                footerLinks.support.map(function(link) {
                  return React.createElement('li', { key: link.label },
                    React.createElement(Link, { href: link.href, className: 'text-text-muted hover:text-primary-500 transition-colors text-sm' }, link.label)
                  );
                })
              )
            ),
            React.createElement('div', { className: 'lg:col-span-2' },
              React.createElement('h4', { className: 'font-semibold text-text mb-4' }, 'Contact Us'),
              React.createElement('ul', { className: 'space-y-4' },
                React.createElement('li', { className: 'flex items-start gap-3' },
                  React.createElement(Mail, { className: 'w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5' }),
                  React.createElement('a', { href: 'mailto:' + contactInfo.email, className: 'text-text-muted hover:text-primary-500 transition-colors text-sm' }, contactInfo.email)
                ),
                React.createElement('li', { className: 'flex items-start gap-3' },
                  React.createElement(Send, { className: 'w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5' }),
                  React.createElement('a', { href: 'https://t.me/' + contactInfo.telegram.replace('@', ''), target: '_blank', rel: 'noopener noreferrer', className: 'text-text-muted hover:text-primary-500 transition-colors text-sm' }, contactInfo.telegram)
                ),
                React.createElement('li', { className: 'flex items-start gap-3' },
                  React.createElement(Clock, { className: 'w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5' }),
                  React.createElement('span', { className: 'text-text-muted text-sm' }, contactInfo.hours)
                )
              ),
              React.createElement('div', { className: 'mt-6' },
                React.createElement('h5', { className: 'text-sm font-medium text-text mb-3' }, 'Subscribe to our newsletter'),
                React.createElement('div', { className: 'flex gap-2' },
                  React.createElement('input', { type: 'email', placeholder: 'Your email', className: 'flex-1 px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary-500' }),
                  React.createElement('button', { className: 'px-3 py-2 bg-primary-500 text-background rounded-lg hover:bg-primary-400 transition-colors' },
                    React.createElement(ArrowRight, { className: 'w-4 h-4' })
                  )
                )
              )
            )
          )
        ),
        React.createElement('div', { className: 'py-6 border-t border-surface-200' },
          React.createElement('div', { className: 'flex flex-col md:flex-row items-center justify-between gap-4' },
            React.createElement('p', { className: 'text-sm text-text-muted' }, currentYear + ' Barracuda. All rights reserved.'),
            React.createElement('div', { className: 'flex flex-wrap items-center justify-center gap-6' },
              footerLinks.legal.map(function(link) {
                return React.createElement(Link, { key: link.label, href: link.href, className: 'text-sm text-text-muted hover:text-primary-500 transition-colors' }, link.label);
              })
            ),
            React.createElement('div', { className: 'flex items-center gap-2 text-xs text-text-muted' },
              React.createElement('span', { className: 'w-5 h-5 bg-surface-200 rounded-full flex items-center justify-center font-bold' }, '18'),
              React.createElement('span', null, 'Gambling involves risk. Play responsibly.')
            )
          )
        )
      )
    )
  );
};

export default Footer;
