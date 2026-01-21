'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Target,
  Filter,
  Download,
  Search
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import adminAPI from '@/lib/admin-api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export default function ConversionsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAdmin();
  
  const [conversions, setConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGoalType, setFilterGoalType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchConversions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.getConversions();
      if (response.success) {
        setConversions(response.data || []);
        setStats(response.stats);
      } else {
        setError(response.message || 'Failed to fetch conversions');
      }
    } catch (err: any) {
      console.error('Failed to fetch conversions:', err);
      setError('Failed to load conversions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversions();
    }
  }, [isAuthenticated]);

  const filteredConversions = conversions.filter(conv => {
    const matchesSearch = !searchTerm || 
      conv.click_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.affiliate_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.goal_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGoalType = !filterGoalType || conv.goal_type === filterGoalType;
    const matchesStatus = !filterStatus || conv.status === filterStatus;
    
    return matchesSearch && matchesGoalType && matchesStatus;
  });

  const renderGoalTypeBadge = (goalType: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      registration: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Registration' },
      deposit: { color: 'bg-accent-green/20 text-accent-green border-accent-green/30', label: 'Deposit' }
    };
    
    const config = badges[goalType] || { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: goalType };
    
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle, label: 'Pending' },
      approved: { color: 'bg-accent-green/20 text-accent-green', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-accent-red/20 text-accent-red', icon: XCircle, label: 'Rejected' }
    };

    const config = badges[status] || badges.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Group conversions by click_id to show both registration and deposit together
  const conversionsByClick = filteredConversions.reduce((acc, conv) => {
    const key = conv.click_id || 'unknown';
    if (!acc[key]) {
      acc[key] = [] as any[];
    }
    acc[key].push(conv);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Conversions</h1>
          <p className="text-text-muted">Track all conversion events and FTDs</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchConversions}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" />
              <div>
                <div className="text-2xl font-bold text-text">{stats.total || 0}</div>
                <div className="text-sm text-text-muted">Total Conversions</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-green" />
              <div>
                <div className="text-2xl font-bold text-accent-green">{stats.approvedCount || 0}</div>
                <div className="text-sm text-text-muted">Approved</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-secondary-500" />
              <div>
                <div className="text-2xl font-bold text-secondary-400">${stats.totalAmount || 0}</div>
                <div className="text-sm text-text-muted">Total Revenue</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent-orange" />
              <div>
                <div className="text-2xl font-bold text-accent-orange">{stats.thisMonth || 0}</div>
                <div className="text-sm text-text-muted">This Month</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Goal Type Stats */}
      {stats?.byGoalType && Object.keys(stats.byGoalType).length > 0 && (
        <div className="flex flex-wrap gap-4">
          {Object.entries(stats.byGoalType).map(([goalType, count]: [string, any]) => (
            <div key={goalType} className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-lg">
              {renderGoalTypeBadge(goalType)}
              <span className="text-text font-medium">{count} conversions</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by click ID, affiliate ID, or goal type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full md:w-40">
          <Select
            options={[
              { value: '', label: 'All Goals' },
              { value: 'registration', label: 'Registration' },
              { value: 'deposit', label: 'Deposit' }
            ]}
            value={filterGoalType}
            onChange={(e) => setFilterGoalType(e.target.value)}
          />
        </div>
        <div className="w-full md:w-40">
          <Select
            options={[
              { value: '', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' }
            ]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-center gap-3 text-accent-red">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Conversions Table - Grouped by Click ID */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-100 border-b border-surface-300">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Click ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Affiliate
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  FTD Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-text-muted">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      Loading conversions...
                    </div>
                  </td>
                </tr>
              ) : filteredConversions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    No conversions found. Submit the contact form as an affiliate to create conversions.
                  </td>
                </tr>
              ) : (
                Object.entries(conversionsByClick).map(([clickId, convs]) => {
                  const convsArray = convs as any[];
                  const hasDeposit = convsArray.some((c: any) => c.goal_type === 'deposit');
                  const hasRegistration = convsArray.some((c: any) => c.goal_type === 'registration');
                  const totalAmount = convsArray.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
                  const allApproved = convsArray.every((c: any) => c.status === 'approved');

                  return (
                    <tr 
                      key={clickId} 
                      className="hover:bg-surface-100/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-text font-mono text-sm">{clickId}</p>
                          {convs[0]?.sub1 && (
                            <p className="text-xs text-text-muted">sub1: {convs[0].sub1}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-text font-mono text-sm">{convs[0]?.affiliate_id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {hasRegistration && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                              <Target className="w-3 h-3" />
                              Registration
                            </span>
                          )}
                          {hasDeposit && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-green/10 text-accent-green rounded text-xs">
                              <DollarSign className="w-3 h-3" />
                              Deposit
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-text">
                          <DollarSign className="w-4 h-4 text-text-muted" />
                          <span className="font-medium">${totalAmount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {hasDeposit ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-green/20 text-accent-green rounded text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            FTD Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                            <AlertCircle className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-muted text-sm">
                        {convs[0]?.createdAt ? new Date(convs[0].createdAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredConversions.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Showing {Object.keys(conversionsByClick).length} unique click(s) with {filteredConversions.length} conversion(s)
          </p>
        </div>
      )}
    </div>
  );
}

