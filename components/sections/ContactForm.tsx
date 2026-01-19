  'use client';

  import React, { useState, useEffect, useCallback } from 'react';
  import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Loader2, UserPlus, Link, Copy, ExternalLink, Globe, Crosshair as CrosshairIcon, RefreshCw } from 'lucide-react';
  import Input from '@/components/ui/Input';
  import Select from '@/components/ui/Select';
  import Textarea from '@/components/ui/Textarea';
  import Button from '@/components/ui/Button';
import ContactFormSearchParams from './ContactFormSearchParams';

// Use motion.div directly to avoid type issues

// Define fadeInUp variants locally
  const fadeInUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  // Stagger container variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Stagger item variants
  const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  /**
   * Form errors type
   */
  interface FormErrors {
    name?: string;
    email?: string;
    company?: string;
    type?: string;
    username?: string;
    affiliateId?: string;
    submit?: string;
    [key: string]: string | undefined;
  }

  /**
   * Form data type
   */
  interface FormData {
    name: string;
    email: string;
    company: string;
    type: string;
    messenger: string;
    username: string;
    message: string;
    affiliateId: string;
    urlId: string;
    sub1: string;
    trackingSource: string;
    campaignId: string;
  }

  // Configuration - These should be in environment variables in production
  const CONFIG = {
    DEFAULT_AFFILIATE_ID: '2',
    URL_ID: '2', // Always 2 as per requirements
    HOOPLASEFT_API_URL: 'https://hooplaseft.com/api/v3/offer/2',
    API_ENDPOINT: '/api/register'
  };

  // Messenger options
  const messengerOptions = [
    { value: '', label: 'Select messenger' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'skype', label: 'Skype' },
    { value: 'discord', label: 'Discord' },
    { value: 'email', label: 'Email' },
  ];

  // Type options
  const typeOptions = [
    { value: '', label: 'I am a...' },
    { value: 'affiliate', label: 'Affiliate / Publisher' },
    { value: 'advertiser', label: 'Advertiser / Brand' },
    { value: 'influencer', label: 'Influencer / Content Creator' },
    { value: 'media_buyer', label: 'Media Buyer' },
    { value: 'agency', label: 'Marketing Agency' },
  ];

  // Traffic source options
  const trafficSourceOptions = [
    { value: 'contact_form', label: 'Website Contact Form' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'google', label: 'Google' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'native', label: 'Native Ads' },
    { value: 'push', label: 'Push Notifications' },
    { value: 'pop', label: 'Pop Traffic' },
    { value: 'email', label: 'Email Marketing' },
    { value: 'seo', label: 'SEO / Organic' },
    { value: 'other', label: 'Other' },
  ];

  const ContactFormContent = ({ searchParams }: { searchParams: URLSearchParams | null }) => {
    // Form state
    const [formData, setFormData] = useState<FormData>({
      name: '',
      email: '',
      company: '',
      type: '',
      messenger: '',
      username: '',
      message: '',
      // Affiliate tracking fields (from URL params)
      affiliateId: CONFIG.DEFAULT_AFFILIATE_ID,
      urlId: CONFIG.URL_ID,
      sub1: '', // Click ID from URL
      trackingSource: 'contact_form',
      campaignId: '',
    });

    // UI state
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
    const [apiStatus, setApiStatus] = useState<'posted' | 'error' | null>(null);
    const [isAffiliate, setIsAffiliate] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [generatedTrackingLink, setGeneratedTrackingLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [apiMessage, setApiMessage] = useState('');

    // Stats state (no database, just React state)
    const [stats, setStats] = useState({
      visitors: 0,
      registrations: 0,
      ftds: 0,
      commission: 0
    });

    // FTD simulation state
    const [isSimulatingFTD, setIsSimulatingFTD] = useState(false);
    const [ftdStatus, setFtdStatus] = useState<'success' | 'error' | null>(null);
    const [ftdMessage, setFtdMessage] = useState('');

    // Capture URL parameters on component mount
    useEffect(() => {
      if (!searchParams) return;

      const affiliateIdFromUrl = searchParams.get('affiliate_id');
      const sub1FromUrl = searchParams.get('sub1');
      const urlIdFromUrl = searchParams.get('url_id');

      if (affiliateIdFromUrl) {
        setFormData(prev => ({ ...prev, affiliateId: affiliateIdFromUrl }));
      }

      if (sub1FromUrl) {
        setFormData(prev => ({ ...prev, sub1: sub1FromUrl }));
      }

      if (urlIdFromUrl) {
        setFormData(prev => ({ ...prev, urlId: urlIdFromUrl }));
      }
    }, [searchParams]);

    // Increment visitor count on component mount
    useEffect(() => {
      setStats(prev => ({ ...prev, visitors: prev.visitors + 1 }));
    }, []);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }

      // Show advanced options when ANY role is selected (not just affiliate)
      if (name === 'type' && value) {
        setShowAdvanced(true);
        setIsAffiliate(value === 'affiliate');
      }
    };

    // Generate tracking link based on form data
    const generateTrackingLink = useCallback(() => {
      const params = new URLSearchParams({
        affiliate_id: formData.affiliateId || CONFIG.DEFAULT_AFFILIATE_ID,
        url_id: formData.urlId || CONFIG.URL_ID,
        source: formData.trackingSource || 'contact_form'
      });

      // Add optional sub1 (click ID) if present
      if (formData.sub1) {
        params.append('sub1', formData.sub1);
      }

      // Add optional parameters for better tracking
      if (formData.name) params.append('name', encodeURIComponent(formData.name));
      if (formData.email) params.append('email', encodeURIComponent(formData.email));
      if (formData.company) params.append('company', encodeURIComponent(formData.company));

      const link = `${CONFIG.HOOPLASEFT_API_URL}?${params.toString()}`;
      setGeneratedTrackingLink(link);
      return link;
    }, [formData]);

    // Copy tracking link to clipboard
    const copyTrackingLink = async () => {
      const link = generatedTrackingLink || generateTrackingLink();
      try {
        await navigator.clipboard.writeText(link);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    };

    // Validate form
    const validateForm = () => {
      const newErrors: FormErrors = {};
      
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!formData.company.trim()) {
        newErrors.company = 'Company name is required';
      }
      
      if (!formData.type) {
        newErrors.type = 'Please select your role';
      }
      
      if (formData.messenger && !formData.username.trim()) {
        newErrors.username = 'Username is required when messenger is selected';
      }

      // Validate affiliate ID format if manually entered
      if (formData.affiliateId && !/^\d+$/.test(formData.affiliateId)) {
        newErrors.affiliateId = 'Affiliate ID must be a number';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsSubmitting(true);
      setSubmitStatus(null);
      setApiStatus(null);
      setApiMessage('');

      try {
        // Submit contact form to local API for record keeping
        const response = await fetch(CONFIG.API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            // Ensure proper type mapping
            type: formData.type === 'affiliate' ? 'affiliate' : formData.type,
            // URL parameters captured
            affiliate_id: formData.affiliateId,
            url_id: formData.urlId,
            sub1: formData.sub1 || undefined,
            // Add tracking parameters
            trackingSource: formData.trackingSource,
            campaignId: formData.campaignId,
          }),
        });

        // Parse response
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = { success: true, message: 'Form submitted successfully' };
        }

        if (response.ok && data.success) {
          setSubmitStatus('success');
          setApiMessage(data.message || 'Form submitted successfully');

          // Update stats
          setStats(prev => ({ ...prev, registrations: prev.registrations + 1 }));

          // Check API statuses - use isAffiliate flag from API response or fallback to form type
          const isAffiliateUser = data.data?.isAffiliate || formData.type === 'affiliate';
          setIsAffiliate(isAffiliateUser);

          if (isAffiliateUser) {
            if (data.data?.affiliatePosted) {
              setApiStatus('posted');
            } else if (data.data?.affiliateError) {
              setApiStatus('error');
            } else {
              setApiStatus('posted');
            }

            // Generate and copy tracking link
            if (data.data?.trackingLink) {
              setGeneratedTrackingLink(data.data.trackingLink);
            } else {
              generateTrackingLink();
            }
          } else {
            setApiStatus('posted'); // For non-affiliates, form is submitted successfully
          }
        } else {
          setSubmitStatus('error');
          setApiMessage(data?.message || 'Something went wrong. Please try again.');
          setErrors({ submit: data?.message || 'Something went wrong. Please try again.' });
        }
      } catch (error) {
        console.error('Form submission error:', error);
        setSubmitStatus('error');
        
        // Provide more specific error message
        if (error.name === 'AbortError') {
          setApiMessage('Request timed out. Please try again.');
          setErrors({ submit: 'Request timed out. Please try again.' });
        } else {
          setApiMessage('Unable to connect to server. Please try again later.');
          setErrors({ submit: 'Unable to connect to server. Please try again later.' });
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    // Simulate FTD (First Time Deposit)
    const simulateFTD = async () => {
      setIsSimulatingFTD(true);
      setFtdStatus(null);
      setFtdMessage('');

      try {
        const response = await fetch('/api/ftd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            affiliate_id: formData.affiliateId,
            sub1: formData.sub1 || undefined,
            deposit_amount: 100, // Default FTD amount
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Non-affiliate success - show message, don't redirect
          setFtdStatus('success');
          setFtdMessage(data.message || 'FTD simulated successfully');
          
          // Update stats
          setStats(prev => ({ 
            ...prev, 
            ftds: prev.ftds + 1,
            commission: prev.commission + (data.commission || 0)
          }));
        } else {
          setFtdStatus('error');
          setFtdMessage(data.message || 'FTD simulation failed');
        }
      } catch (error) {
        console.error('FTD simulation error:', error);
        setFtdStatus('error');
        setFtdMessage('Unable to simulate FTD. Please try again later.');
      } finally {
        setIsSimulatingFTD(false);
      }
    };

    // Reset form to initial state
    const resetForm = () => {
      setFormData({
        name: '',
        email: '',
        company: '',
        type: '',
        messenger: '',
        username: '',
        message: '',
        affiliateId: (searchParams && searchParams.get('affiliate_id')) || CONFIG.DEFAULT_AFFILIATE_ID,
        urlId: CONFIG.URL_ID,
        sub1: (searchParams && searchParams.get('sub1')) || '',
        trackingSource: 'contact_form',
        campaignId: '',
      });
      setErrors({});
      setSubmitStatus(null);
      setApiStatus(null);
      setApiMessage('');
      setGeneratedTrackingLink('');
      setLinkCopied(false);
      setShowAdvanced(false);
      setIsAffiliate(false);
    };

    return (
      <section id="contact" className="section relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUpVariants}
              className="text-center mb-12"
            >
              <h2 className="section-title mb-4">
                {formData.type === 'affiliate' ? 'Get Started as an Affiliate' : 'Contact Our Team'}
              </h2>
              <p className="section-subtitle">
                {formData.type === 'affiliate'
                  ? 'Join our network and start earning commissions. Our team will onboard you within 24 hours.'
                  : 'Get in touch with our partnership team to discuss collaboration opportunities.'}
              </p>
            </motion.div>

            {/* URL Parameter Badge */}
            {(formData.affiliateId !== CONFIG.DEFAULT_AFFILIATE_ID || formData.sub1) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-accent-green/10 border border-accent-green/30 rounded-lg flex flex-wrap items-center gap-3 text-sm"
              >
                <CrosshairIcon className="w-4 h-4 text-accent-green" />
                <span className="font-medium text-text">Tracking Detected:</span>
                {formData.affiliateId !== CONFIG.DEFAULT_AFFILIATE_ID && (
                  <span className="px-2 py-1 bg-primary-100 dark:bg-primary-800 rounded text-xs">
                    Affiliate ID: {formData.affiliateId}
                  </span>
                )}
                {formData.sub1 && (
                  <span className="px-2 py-1 bg-primary-100 dark:bg-primary-800 rounded text-xs">
                    Click ID: {formData.sub1}
                  </span>
                )}
              </motion.div>
            )}

            {/* Form Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="card p-8 md:p-10"
            >
              {/* Quick Stats Bar */}
              <div className="mb-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-medium text-text">
                      Affiliate ID: <strong>{formData.affiliateId}</strong>
                    </span>
                  </div>
                  <div className="text-sm text-text-muted">
                    High converting offers | Weekly payments | 24/7 support
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {submitStatus === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-accent-green" />
                    </div>
                    <h3 className="text-2xl font-bold text-text mb-4">
                      {isAffiliate ? 'Welcome to Our Network!' : 'Thank You!'}
                    </h3>
                    <p className="text-text-muted mb-6 max-w-md mx-auto">
                      {apiMessage}
                    </p>

                    {/* Affiliate Tracking Info */}
                    {isAffiliate && generatedTrackingLink && (
                      <div className="mb-8 p-6 bg-accent-green/5 border border-accent-green/20 rounded-xl max-w-lg mx-auto">
                        <h4 className="text-lg font-semibold text-text mb-3 flex items-center justify-center gap-2">
                          <Link className="w-5 h-5" />
                          Your Tracking Link
                        </h4>
                        <div className="p-3 bg-background rounded-lg border mb-4">
                          <code className="text-sm break-all text-text">
                            {generatedTrackingLink}
                          </code>
                        </div>
                        <div className="flex gap-3 justify-center flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyTrackingLink}
                            leftIcon={linkCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          >
                            {linkCopied ? 'Copied!' : 'Copy Link'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(generatedTrackingLink, '_blank')}
                            leftIcon={<ExternalLink className="w-4 h-4" />}
                          >
                            Test Link
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* FTD Simulation */}
                    {isAffiliate && (
                      <div className="mb-8 p-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-xl max-w-lg mx-auto">
                        <h4 className="text-lg font-semibold text-text mb-3 flex items-center justify-center gap-2">
                          <CrosshairIcon className="w-5 h-5" />
                          Test Affiliate Tracking
                        </h4>
                        <p className="text-sm text-text-muted mb-4 text-center">
                          Simulate a First Time Deposit (FTD) to test your tracking link and earn commission.
                        </p>
                        <div className="flex justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={simulateFTD}
                            disabled={isSimulatingFTD}
                            loading={isSimulatingFTD}
                          >
                            {isSimulatingFTD ? 'Simulating...' : 'Simulate FTD'}
                          </Button>
                        </div>
                        {ftdStatus && (
                          <div className={`mt-4 p-3 rounded-lg text-sm ${
                            ftdStatus === 'success'
                              ? 'bg-accent-green/10 text-accent-green border border-accent-green/30'
                              : 'bg-accent-red/10 text-accent-red border border-accent-red/30'
                          }`}>
                            {ftdMessage}
                          </div>
                        )}
                      </div>
                    )}

                    {/* API Status */}
                    {apiStatus && (
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                        apiStatus === 'posted'
                          ? 'bg-accent-green/10 text-accent-green border border-accent-green/30'
                          : 'bg-accent-red/10 text-accent-red border border-accent-red/30'
                      }`}>
                        {apiStatus === 'posted' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Successfully registered in affiliate network
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            Registration processing - we'll follow up shortly
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="primary"
                        onClick={resetForm}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                      >
                        {isAffiliate ? 'Register Another Affiliate' : 'Submit Another Form'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSubmitStatus(null)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Submit Error */}
                    {errors.submit && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-center gap-3 text-accent-red"
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{errors.submit}</p>
                      </motion.div>
                    )}

                    {/* Row 1: Name & Email */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div variants={staggerItem}>
                        <Input
                          label="Full Name *"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          error={errors.name}
                          required
                        />
                      </motion.div>
                      <motion.div variants={staggerItem}>
                        <Input
                          label="Email Address *"
                          type="email"
                          name="email"
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={handleChange}
                          error={errors.email}
                          required
                        />
                      </motion.div>
                    </div>

                    {/* Row 2: Company & Type */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div variants={staggerItem}>
                        <Input
                          label="Company Name *"
                          name="company"
                          placeholder="Your Company Ltd."
                          value={formData.company}
                          onChange={handleChange}
                          error={errors.company}
                          required
                        />
                      </motion.div>
                      <motion.div variants={staggerItem}>
                        <Select
                          label="I am a... *"
                          name="type"
                          placeholder="Select your role"
                          value={formData.type}
                          onChange={handleChange}
                          options={typeOptions}
                          error={errors.type}
                          required
                        />
                      </motion.div>
                    </div>

                    {/* Row 3: Messenger & Username */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div variants={staggerItem}>
                        <Select
                          label="Preferred Messenger"
                          name="messenger"
                          placeholder="Select messenger"
                          value={formData.messenger}
                          onChange={handleChange}
                          options={messengerOptions}
                        />
                      </motion.div>
                      <motion.div variants={staggerItem}>
                        <Input
                          label={formData.messenger ? `${formData.messenger.charAt(0).toUpperCase() + formData.messenger.slice(1)} Username` : 'Username'}
                          name="username"
                          placeholder={formData.messenger ? `@username` : 'Will be required if messenger selected'}
                          value={formData.username}
                          onChange={handleChange}
                          error={errors.username}
                          disabled={!formData.messenger}
                        />
                      </motion.div>
                    </div>

                    {/* Advanced Settings Toggle - Show for ALL roles */}
                    {(showAdvanced || formData.type === 'affiliate') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 border border-primary-200 dark:border-primary-700 rounded-xl bg-primary-50/30 dark:bg-primary-900/10 space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                            <Link className="w-5 h-5" />
                            {formData.type === 'affiliate' ? 'Affiliate Tracking Settings' : 'Tracking & Advanced Settings'}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            {showAdvanced ? 'Hide' : 'Show'} Advanced
                          </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <motion.div variants={staggerItem}>
                            <Input
                              label={formData.type === 'affiliate' ? "Affiliate ID" : "Reference ID"}
                              name="affiliateId"
                              placeholder={CONFIG.DEFAULT_AFFILIATE_ID}
                              value={formData.affiliateId}
                              onChange={handleChange}
                              error={errors.affiliateId}
                              leftIcon={<UserPlus className="w-4 h-4" />}
                              helpText={formData.type === 'affiliate' 
                                ? "Leave as default unless you have a specific ID" 
                                : "Your reference ID for tracking"}
                            />
                          </motion.div>
                          <motion.div variants={staggerItem}>
                            <Select
                              label="Main Traffic Source"
                              name="trackingSource"
                              value={formData.trackingSource}
                              onChange={handleChange}
                              options={trafficSourceOptions}
                              leftIcon={<Globe className="w-4 h-4" />}
                              helpText="Where will you send traffic from?"
                            />
                          </motion.div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <motion.div variants={staggerItem}>
                            <Input
                              label="URL ID"
                              name="urlId"
                              value={formData.urlId}
                              disabled
                              leftIcon={<CrosshairIcon className="w-4 h-4" />}
                              helpText="Always set to 2 for this offer"
                            />
                          </motion.div>
                          <motion.div variants={staggerItem}>
                            <Input
                              label="Click ID (sub1)"
                              name="sub1"
                              placeholder={(searchParams && searchParams.get('sub1')) || 'Optional'}
                              value={formData.sub1}
                              onChange={handleChange}
                              leftIcon={<Link className="w-4 h-4" />}
                              helpText="Auto-captured from URL parameter"
                            />
                          </motion.div>
                        </div>

                        <motion.div variants={staggerItem}>
                          <Input
                            label="Campaign ID (Optional)"
                            name="campaignId"
                            placeholder="campaign_01"
                            value={formData.campaignId}
                            onChange={handleChange}
                            helpText="Custom campaign identifier for tracking"
                          />
                        </motion.div>

                        {/* Preview Tracking Link - Only for affiliates */}
                        {formData.type === 'affiliate' && (
                          <motion.div variants={staggerItem} className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-text">
                                Preview Tracking Link
                              </label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={copyTrackingLink}
                                disabled={!formData.name || !formData.email}
                                leftIcon={linkCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              >
                                {linkCopied ? 'Copied!' : 'Generate & Copy'}
                              </Button>
                            </div>
                            <div className="p-3 bg-background rounded-lg border text-sm text-text-muted font-mono break-all">
                              {generatedTrackingLink || `${CONFIG.HOOPLASEFT_API_URL}?affiliate_id=${formData.affiliateId || CONFIG.DEFAULT_AFFILIATE_ID}&url_id=${formData.urlId || CONFIG.URL_ID}&source=${formData.trackingSource || 'contact_form'}`}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {/* Row 4: Message */}
                    <motion.div variants={staggerItem}>
                      <Textarea
                        label="Additional Information (Optional)"
                        name="message"
                        placeholder="Tell us about your traffic sources, experience, verticals you work with, expected volume..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        maxLength={1000}
                        helpText="The more details you provide, faster we can onboard you"
                      />
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                      variants={staggerItem}
                      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4"
                    >
                      <div className="text-sm text-text-muted">
                        {formData.type === 'affiliate' ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent-green" />
                            You'll receive affiliate dashboard access within 24 hours
                          </span>
                        ) : (
                          "We'll respond within 24 hours"
                        )}
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        leftIcon={!isSubmitting ? <Send className="w-5 h-5" /> : null}
                      >
                        {isSubmitting 
                          ? 'Submitting...' 
                          : formData.type === 'affiliate' 
                            ? 'Apply as Affiliate' 
                            : formData.type === 'advertiser'
                              ? 'Contact as Advertiser'
                              : formData.type === 'influencer'
                                ? 'Apply as Influencer'
                                : formData.type === 'media_buyer'
                                  ? 'Contact as Media Buyer'
                                  : formData.type === 'agency'
                                    ? 'Partner as Agency'
                                    : 'Send Message'
                        }
                      </Button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Footer Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-8 text-sm text-text-muted"
            >
              <p>
                By submitting, you agree to our{' '}
                <a href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Privacy Policy
                </a>
                . Affiliates must comply with our traffic quality guidelines.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    );
  };

  const ContactForm = () => {
    return (
      <ContactFormSearchParams>
        {(searchParams) => (
          <ContactFormContent searchParams={searchParams} />
        )}
      </ContactFormSearchParams>
    );
  };

  export default ContactForm;