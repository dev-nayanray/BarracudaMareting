'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Linkedin, Send, Twitter } from 'lucide-react';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';

const teamMembers = [
  {
    name: 'Alexandra Aff',
    position: 'Head of Partner Relations',
    color: 'from-purple-500 to-purple-700',
    messenger: 'telegram',
    username: '@alexenok_aff',
    email: 'alex@barracuda.marketing',
    bio: '10+ years in iGaming Barracuda management.',
  },
  {
    name: 'Maria',
    position: 'Head of Advertisers',
    color: 'from-primary-500 to-primary-700',
    messenger: 'whatsapp',
    username: '+1234567890',
    email: 'Maria@barracuda.marketing',
    bio: 'Specializes in scaling advertiser campaigns.',
  },
  {
    name: 'Elena Rodriguez',
    position: 'Account Manager - LATAM',
    color: 'from-green-500 to-green-700',
    messenger: 'telegram',
    username: '@barracuda_alex ',
    email: 'alex@barracuda.marketing',
    bio: 'Bilingual support for Spanish/Portuguese.',
  },
  {
    name: 'David Kim',
    position: 'Account Manager - APAC',
    color: 'from-red-500 to-red-700',
    messenger: 'wechat',
    username: 'david_barracuda',
    email: 'alex@barracuda.marketing',
    bio: 'Expert in Asian markets.',
  },
];

function getMessengerIcon(messenger) {
  switch (messenger) {
    case 'telegram':
      return React.createElement(Send, { className: 'w-4 h-4' });
    case 'whatsapp':
      return React.createElement(MessageCircle, { className: 'w-4 h-4' });
    default:
      return React.createElement(MessageCircle, { className: 'w-4 h-4' });
  }
}

function Team() {
  return React.createElement('section', { id: 'team', className: 'section relative overflow-hidden' },
    React.createElement('div', { className: 'absolute inset-0' },
      React.createElement('div', { className: 'absolute inset-0 bg-gradient-to-r from-secondary-500/5 via-transparent to-primary-500/5' })
    ),
    React.createElement('div', { className: 'container-custom relative z-10' },
      React.createElement('motion.div', {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true },
        variants: fadeInUp,
        className: 'text-center mb-16'
      },
        React.createElement('h2', { className: 'section-title mb-4' }, 'Contact Our Team'),
        React.createElement('p', { className: 'section-subtitle' }, 'Reach out to your regional account manager.')
      ),
      React.createElement('motion.div', {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true },
        variants: staggerContainer,
        className: 'grid md:grid-cols-2 lg:grid-cols-4 gap-6'
      },
        teamMembers.map(function(member) {
          return React.createElement('motion.div', {
            key: member.name,
            variants: staggerItem,
            className: 'card p-6 hover:border-primary-500/30 group'
          },
            React.createElement('div', { className: 'relative mb-6' },
              React.createElement('div', { className: 'w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ' + member.color + ' flex items-center justify-center' },
                React.createElement('span', { className: 'text-3xl font-bold text-white' },
                  member.name.split(' ').map(function(n) { return n[0]; }).join('')
                )
              ),
              React.createElement('div', { className: 'absolute bottom-0 right-1/2 translate-x-4 translate-y-1 w-4 h-4 bg-accent-green rounded-full border-2 border-background' })
            ),
            React.createElement('div', { className: 'text-center mb-4' },
              React.createElement('h3', { className: 'text-lg font-bold text-text mb-1' }, member.name),
              React.createElement('p', { className: 'text-sm text-text-muted' }, member.position)
            ),
            React.createElement('p', { className: 'text-sm text-text-muted text-center mb-6' }, member.bio),
            React.createElement('div', { className: 'space-y-3' },
              React.createElement('a', {
                href: member.messenger === 'telegram' 
                  ? 'https://t.me/' + member.username.replace('@', '')
                  : member.messenger === 'whatsapp'
                  ? 'https://wa.me/' + member.username.replace(/\D/g, '')
                  : '#',
                target: '_blank',
                rel: 'noopener noreferrer',
                className: 'flex items-center gap-3 p-3 bg-surface-200 rounded-xl hover:bg-primary-500/10 transition-colors'
              },
                React.createElement('div', { className: 'w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center text-primary-500' },
                  getMessengerIcon(member.messenger)
                ),
                React.createElement('div', { className: 'flex-1 min-w-0' },
                  React.createElement('p', { className: 'text-xs text-text-muted uppercase tracking-wider' }, 'Messenger'),
                  React.createElement('p', { className: 'text-sm font-medium text-text truncate' }, member.username)
                )
              ),
              React.createElement('a', {
                href: 'mailto:' + member.email,
                className: 'flex items-center gap-3 p-3 bg-surface-200 rounded-xl hover:bg-primary-500/10 transition-colors'
              },
                React.createElement('div', { className: 'w-8 h-8 bg-secondary-500/10 rounded-lg flex items-center justify-center text-secondary-500' },
                  React.createElement(Mail, { className: 'w-4 h-4' })
                ),
                React.createElement('div', { className: 'flex-1 min-w-0' },
                  React.createElement('p', { className: 'text-xs text-text-muted uppercase tracking-wider' }, 'Email'),
                  React.createElement('p', { className: 'text-sm font-medium text-text truncate' }, member.email)
                )
              )
            ),
            React.createElement('div', { className: 'flex justify-center gap-3 mt-6 pt-4 border-t border-surface-200' },
              React.createElement('a', { href: '#', className: 'text-text-muted hover:text-primary-500 transition-colors' },
                React.createElement(Linkedin, { className: 'w-5 h-5' })
              ),
              React.createElement('a', { href: '#', className: 'text-text-muted hover:text-primary-500 transition-colors' },
                React.createElement(Twitter, { className: 'w-5 h-5' })
              )
            )
          );
        })
      ),
      React.createElement('motion.div', {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true },
        variants: fadeInUp,
        className: 'mt-16 card p-8 md:p-10 text-center'
      },
        React.createElement('h3', { className: 'text-xl font-bold text-text mb-4' }, 'Not sure who to contact?'),
        React.createElement('p', { className: 'text-text-muted mb-6' }, 'Send us a general inquiry.'),
        React.createElement('div', { className: 'flex flex-col sm:flex-row items-center justify-center gap-4' },
          React.createElement('a', {
            href: 'mailto:alex@barracuda.marketing',
            className: 'flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors'
          },
            React.createElement(Mail, { className: 'w-5 h-5' }),
            React.createElement('span', null, 'alex@barracuda.marketing')
          ),
          React.createElement('span', { className: 'hidden sm:block text-text-muted' }, '|'),
          React.createElement('a', {
            href: 'https://t.me/barracuda_support',
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors'
          },
            React.createElement(Send, { className: 'w-5 h-5' }),
            React.createElement('span', null, '@barracuda_alex ')
          )
        )
      )
    )
  );
}

export default Team;
