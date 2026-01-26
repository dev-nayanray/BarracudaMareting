'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function LandingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');

  const sub1 = searchParams.get('sub1') || '';
  const affiliate_id = searchParams.get('affiliate_id') || '2';
  const url_id = searchParams.get('url_id') || '2';

  useEffect(function() {
    if (!sub1) {
      router.push('/');
      return;
    }

    async function sendPostbacks() {
      try {
        console.log('Auto-sending postbacks for:', sub1);
        const uniqueId = sub1.substring(0, 8);
        const userEmail = 'user_' + uniqueId + '@example.com';
        const userName = 'User ' + uniqueId;

        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userName,
            email: userEmail,
            company: 'Auto Registration',
            type: 'affiliate',
            affiliate_id: affiliate_id,
            url_id: url_id,
            sub1: sub1,
            deposit_amount: 100,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setStatus('success');
          setMessage('Postbacks sent successfully!');
          console.log('Postbacks completed for:', sub1);
          setTimeout(function() { router.push('/?sub1=' + sub1); }, 2000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Connection error');
        console.error(err);
      }
    }

    sendPostbacks();
  }, [sub1, affiliate_id, url_id, router]);

  var bgStyle = { backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
  var cardStyle = { backgroundColor: '#1e293b', borderRadius: '16px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' };
  var titleStyle = { color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' };
  var textStyle = { color: '#94a3b8', fontSize: '14px', marginBottom: '12px' };
  var codeStyle = { backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', color: '#22c55e', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' };

  var icon = null;
  var iconColor = '';
  if (status === 'processing') {
    icon = '⏳';
    iconColor = '#eab308';
  } else if (status === 'success') {
    icon = '✅';
    iconColor = '#22c55e';
  } else {
    icon = '❌';
    iconColor = '#ef4444';
  }

  return React.createElement('div', { style: bgStyle },
    React.createElement('div', { style: cardStyle },
      React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, icon),
      React.createElement('h1', { style: titleStyle }, status === 'processing' ? 'Processing...' : status === 'success' ? 'Postbacks Sent!' : 'Failed'),
      React.createElement('p', { style: textStyle }, message || 'Sending registration and deposit postbacks'),
      sub1 ? React.createElement('div', { style: { marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #334155' } },
        React.createElement('p', { style: { color: '#64748b', fontSize: '12px', marginBottom: '4px' } }, 'Tracking ID:'),
        React.createElement('code', { style: codeStyle }, sub1)
      ) : null
    )
  );
}

function LoadingFallback() {
  var bgStyle = { backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
  var cardStyle = { backgroundColor: '#1e293b', borderRadius: '16px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' };
  var textStyle = { color: '#94a3b8', fontSize: '14px', marginBottom: '12px' };

  return React.createElement('div', { style: bgStyle },
    React.createElement('div', { style: cardStyle },
      React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '⏳'),
      React.createElement('h1', { style: { color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' } }, 'Loading...'),
      React.createElement('p', { style: textStyle }, 'Preparing your landing page')
    )
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LandingPageContent />
    </Suspense>
  );
}
