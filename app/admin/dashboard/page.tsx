'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import adminAPI from '@/lib/admin-api';
import StatsCard from '@/components/admin/StatsCard';
import Card from '@/components/ui/Card';

/**
 * Admin Dashboard Page
 */
export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAdmin();
  const [stats, setStats] = useState(null);
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch contacts stats and recent contacts
        const [statsRes, contactsRes] = await Promise.all([
          adminAPI.getContactStats(),
          adminAPI.getContacts({ limit: 5 })
        ]);

        if (statsRes.success) {
          setStats(statsRes.data);
        }

        if (contactsRes.success) {
          setRecentContacts(contactsRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-text-muted">Welcome back! Here's what's happening with your affiliate network.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Last 30 Days
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Contacts"
          value={stats?.total || 0}
          icon={Users}
          color="primary"
          trend="up"
          trendValue="12%"
        />
        <StatsCard
          title="New This Month"
          value={stats?.thisMonth || 0}
          icon={UserPlus}
          color="green"
          trend="up"
          trendValue="8%"
        />
        <StatsCard
          title="Publishers"
          value={stats?.byType?.publisher || 0}
          icon={TrendingUp}
          color="purple"
        />
        <StatsCard
          title="Advertisers"
          value={stats?.byType?.advertiser || 0}
          icon={Building2}
          color="primary"
        />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Status Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Contact Status Overview</h3>
          <div className="space-y-4">
            {stats?.byStatus && Object.entries(stats.byStatus).map(([status, count]) => {
              const total = stats.total || 1;
              const countNum = Number(count);
              const percentage = ((countNum / total) * 100).toFixed(1);
              
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text capitalize">{status}</span>
                    <span className="text-sm text-text-muted">{countNum} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        status === 'new' ? 'bg-blue-500' :
                        status === 'contacted' ? 'bg-yellow-500' :
                        status === 'qualified' ? 'bg-accent-green' :
                        'bg-accent-red'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/admin/contacts')}
              className="p-4 bg-surface-200 rounded-xl hover:bg-surface-300 transition-colors text-left"
            >
              <Users className="w-8 h-8 text-primary-500 mb-3" />
              <p className="font-medium text-text">View All Contacts</p>
              <p className="text-sm text-text-muted">Browse and manage contacts</p>
            </button>
            <button
              onClick={() => router.push('/admin/settings')}
              className="p-4 bg-surface-200 rounded-xl hover:bg-surface-300 transition-colors text-left"
            >
              <Building2 className="w-8 h-8 text-secondary-500 mb-3" />
              <p className="font-medium text-text">Site Settings</p>
              <p className="text-sm text-text-muted">Configure site options</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Contacts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">Recent Contacts</h3>
          <button
            onClick={() => router.push('/admin/contacts')}
            className="text-sm text-primary-500 hover:text-primary-400 flex items-center gap-1"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        
        {recentContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-100 border-b border-surface-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300">
                {recentContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-surface-100/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{contact.name}</p>
                      <p className="text-sm text-text-muted">{contact.email}</p>
                    </td>
                    <td className="px-4 py-3 text-text">{contact.company}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        contact.type === 'publisher' 
                          ? 'bg-secondary-500/20 text-secondary-400' 
                          : 'bg-primary-500/20 text-primary-400'
                      }`}>
                        {contact.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        (contact.status || 'new') === 'new' ? 'bg-blue-500/20 text-blue-400' :
                        (contact.status || 'new') === 'contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                        (contact.status || 'new') === 'qualified' ? 'bg-accent-green/20 text-accent-green' :
                        'bg-accent-red/20 text-accent-red'
                      }`}>
                        {contact.status || 'new'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-sm">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted">
            No contacts yet. They will appear here when someone submits the contact form.
          </div>
        )}
      </Card>
    </div>
  );
}

