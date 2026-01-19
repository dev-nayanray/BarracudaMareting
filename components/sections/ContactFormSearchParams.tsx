'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ContactFormSearchParamsContent({ children }) {
  const searchParams = useSearchParams();
  return children(searchParams);
}

export default function ContactFormSearchParams({ children }) {
  return (
    <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center">Loading...</div>}>
      <ContactFormSearchParamsContent>{children}</ContactFormSearchParamsContent>
    </Suspense>
  );
}
