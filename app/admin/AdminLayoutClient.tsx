'use client';

import { useState } from 'react';
import { AdminProvider } from '@/context/AdminContext';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayoutClient({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AdminProvider>
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
    </AdminProvider>
  );
}

