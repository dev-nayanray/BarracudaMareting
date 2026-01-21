'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Target
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import Button from '@/components/ui/Button';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Contacts',
    href: '/admin/contacts',
    icon: Users,
  },
  {
    name: 'Conversions',
    href: '/admin/conversions',
    icon: Target,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

/**
 * Admin Sidebar Component
 */
export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const { user, logout } = useAdmin();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-surface-200 border-r border-surface-300 z-40 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-surface-300">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-black" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-xl text-text">
              Barracuda
            </span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-surface-300 transition-colors text-text-muted hover:text-text"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500 text-black'
                  : 'text-text-muted hover:text-text hover:bg-surface-300'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-black' : ''}`} />
              {!collapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-300">
        {user && (
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-500 font-bold">
                {user.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{user.name}</p>
                <p className="text-sm text-text-muted truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={`w-full mt-3 ${collapsed ? 'px-0 justify-center' : ''}`}
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </aside>
  );
}

