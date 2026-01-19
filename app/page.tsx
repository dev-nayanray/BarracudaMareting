import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Metrics from '@/components/sections/Metrics';
import Partners from '@/components/sections/Partners';
import Advertisers from '@/components/sections/Advertisers';
import Team from '@/components/sections/Team';
import Conferences from '@/components/sections/Conferences';
import Testimonials from '@/components/sections/Testimonials';
import Footer from '@/components/sections/Footer';

const ContactForm = dynamic(
  () => import('@/components/sections/ContactForm'),
  { ssr: false }
);

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Metrics />
        <Partners />
        <Advertisers />
        <Testimonials />
        <Conferences />
        <Team />

        {/* ✅ REQUIRED for useSearchParams */}
        <Suspense fallback={<div className="text-center py-10">Loading contact form…</div>}>
          <ContactForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
