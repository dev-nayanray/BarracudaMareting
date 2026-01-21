'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import Sidebar from '@/components/admin/Sidebar';

function AdminLayoutContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAdmin();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !isLoginPage) {
        router.push('/admin/login');
      } else if (isAuthenticated && isLoginPage) {
        router.push('/admin/dashboard');
      }
    }
  }, [isAuthenticated, loading, isLoginPage, router]);

  // Show loading for authenticated pages
  if (loading && !isLoginPage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't show sidebar on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <main 
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        } p-6`}
      >
        {children}
      </main>
    </div>
  );
}

export default function AdminLayoutClient({ children }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}

