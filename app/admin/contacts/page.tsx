'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Link as LinkIcon,
  Copy,
  Zap,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import adminAPI from '@/lib/admin-api';
import ContactsTable from '@/components/admin/ContactsTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ContactsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAdmin();
  
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState('');
  const [editingNotes, setEditingNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.getContacts();
      if (response.success) {
        setContacts(response.data);
        setStats(response.stats);
      } else {
        setError(response.message || 'Failed to fetch contacts');
      }
    } catch (err: any) {
      console.error('Failed to fetch contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
    }
  }, [isAuthenticated]);

  const handleView = (contact: any) => {
    setSelectedContact(contact);
    setEditingStatus(contact.status || 'new');
    setEditingNotes(contact.notes || '');
    setShowModal(true);
  };

  const handleEdit = (contact: any) => {
    handleView(contact);
  };

  const handleDelete = async (contact: any) => {
    if (!confirm(`Are you sure you want to delete ${contact.name}?`)) {
      return;
    }

    try {
      const response = await adminAPI.deleteContact(contact.id);
      if (response.success) {
        fetchContacts();
      } else {
        alert(response.message || 'Failed to delete contact');
      }
    } catch (err) {
      console.error('Failed to delete contact:', err);
      alert('Failed to delete contact');
    }
  };

  const handleSave = async () => {
    if (!selectedContact) return;

    setSaving(true);
    try {
      const response = await adminAPI.updateContact(selectedContact.id, {
        status: editingStatus,
        notes: editingNotes
      });

      if (response.success) {
        setShowModal(false);
        fetchContacts();
      } else {
        alert(response.message || 'Failed to update contact');
      }
    } catch (err) {
      console.error('Failed to update contact:', err);
      alert('Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAffiliate = async () => {
    if (!selectedContact) return;

    if (!confirm(`Approve ${selectedContact.name} as an affiliate?`)) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/approve-affiliate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Affiliate approved successfully');
        setShowModal(false);
        fetchContacts();
      } else {
        alert(data.message || 'Failed to approve affiliate');
      }
    } catch (err) {
      console.error('Failed to approve affiliate:', err);
      alert('Failed to approve affiliate');
    } finally {
      setSaving(false);
    }
  };

  const handleRejectAffiliate = async () => {
    if (!selectedContact) return;

    const reason = prompt('Please enter a reason for rejection (optional):');
    
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/reject-affiliate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (data.success) {
        alert('Affiliate rejected');
        setShowModal(false);
        fetchContacts();
      } else {
        alert(data.message || 'Failed to reject affiliate');
      }
    } catch (err) {
      console.error('Failed to reject affiliate:', err);
      alert('Failed to reject affiliate');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminAPI.exportContacts();
      if (response) {
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export contacts:', err);
      alert('Failed to export contacts');
    }
  };

  const copyTrackingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('Tracking link copied to clipboard!');
  };

  const renderTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      affiliate: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30',
      publisher: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30',
      advertiser: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
      influencer: 'bg-accent-purple/20 text-accent-purple border-accent-purple/30',
      media_buyer: 'bg-accent-orange/20 text-accent-orange border-accent-orange/30',
      agency: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30'
    };
    
    const labels: Record<string, string> = {
      affiliate: 'Affiliate',
      publisher: 'Publisher',
      advertiser: 'Advertiser',
      influencer: 'Influencer',
      media_buyer: 'Media Buyer',
      agency: 'Agency'
    };

    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${badges[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
        {labels[type] || type || 'Unknown'}
      </span>
    );
  };

  const renderAffiliateStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-accent-green/20 text-accent-green border-accent-green/30',
      rejected: 'bg-accent-red/20 text-accent-red border-accent-red/30'
    };
    
    const labels: Record<string, string> = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${badges[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
        {labels[status] || status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const renderFTDBadge = (contact: any) => {
    if (contact.ftd) {
      return (
        <div className="flex items-center gap-1 text-accent-green" title={`FTD: $${contact.ftd_amount || 0}`}>
          <DollarSign className="w-4 h-4" />
          <span className="text-xs">${contact.ftd_amount || 0}</span>
        </div>
      );
    }
    return <span className="text-text-muted text-xs">-</span>;
  };

  const renderApiStatus = (contact: any) => {
    return (
      <div className="flex items-center gap-2">
        {contact.affiliateRegistered ? (
          <div className="flex items-center gap-1" title="Hooplaseft: Registered">
            <CheckCircle className="w-4 h-4 text-accent-green" />
          </div>
        ) : contact.affiliateError ? (
          <div className="flex items-center gap-1" title={`Hooplaseft: ${contact.affiliateError}`}>
            <XCircle className="w-4 h-4 text-accent-red" />
          </div>
        ) : (
          <div className="flex items-center gap-1" title="Hooplaseft: Pending">
            <AlertCircle className="w-4 h-4 text-text-muted" />
          </div>
        )}
      </div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Contacts</h1>
          <p className="text-text-muted">Manage contact submissions from publishers and advertisers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchContacts}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <div>
                <div className="text-2xl font-bold text-text">{stats.total}</div>
                <div className="text-sm text-text-muted">Total Contacts</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-accent-green" />
              <div>
                <div className="text-2xl font-bold text-accent-green">{stats.affiliateStats?.approved || 0}</div>
                <div className="text-sm text-text-muted">Approved Affiliates</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-secondary-500" />
              <div>
                <div className="text-2xl font-bold text-secondary-400">{stats.ftdCount || 0}</div>
                <div className="text-sm text-text-muted">FTDs</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-orange" />
              <div>
                <div className="text-2xl font-bold text-accent-orange">${stats.totalFtdAmount || 0}</div>
                <div className="text-sm text-text-muted">FTD Revenue</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {error && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-center gap-3 text-accent-red">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto hover:opacity-70"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      <ContactsTable
        contacts={contacts}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderTypeBadge={renderTypeBadge}
        renderAffiliateStatusBadge={renderAffiliateStatusBadge}
        renderApiStatus={renderApiStatus}
        renderFTDBadge={renderFTDBadge}
      />

      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-surface-300">
              <h2 className="text-xl font-bold text-text">Contact Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-surface-300 rounded-lg text-text-muted hover:text-text transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
                  <p className="text-text font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                  <p className="text-text">{selectedContact.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Company</label>
                  <p className="text-text">{selectedContact.company}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Type</label>
                  {renderTypeBadge(selectedContact.type)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Messenger</label>
                  <p className="text-text">{selectedContact.messenger || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Username</label>
                  <p className="text-text">{selectedContact.username || 'Not specified'}</p>
                </div>
              </div>

              {selectedContact.type === 'affiliate' && (
                <div className="p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
                  <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Affiliate Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Affiliate ID</label>
                      <p className="text-text font-mono">{selectedContact.affiliate_id || '2'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Affiliate Status</label>
                      {renderAffiliateStatusBadge(selectedContact.affiliate_status)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Traffic Source</label>
                      <p className="text-text capitalize">{(selectedContact.tracking_source || 'contact_form').replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Campaign ID</label>
                      <p className="text-text font-mono">{selectedContact.campaign_id || '-'}</p>
                    </div>
                    {selectedContact.sub1 && (
                      <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Click ID (sub1)</label>
                        <p className="text-text font-mono">{selectedContact.sub1}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">FTD Status</label>
                      {selectedContact.ftd ? (
                        <div className="flex items-center gap-2 text-accent-green">
                          <CheckCircle className="w-4 h-4" />
                          <span>FTD Completed (${selectedContact.ftd_amount || 0})</span>
                        </div>
                      ) : (
                        <span className="text-text-muted">Not yet</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedContact.message && (
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Message</label>
                  <p className="text-text bg-surface-100 p-4 rounded-xl">{selectedContact.message}</p>
                </div>
              )}

              <div className="p-4 bg-surface-100 rounded-xl">
                <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  API Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Barracuda Postback</label>
                    {renderApiStatus(selectedContact)}
                  </div>
                  {selectedContact.type === 'affiliate' && (
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Hooplaseft</label>
                      {selectedContact.affiliateRegistered ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent-green" />
                          <span className="text-sm text-accent-green">Registered</span>
                        </div>
                      ) : selectedContact.affiliateError ? (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-accent-red" />
                          <span className="text-sm text-accent-red">{selectedContact.affiliateError}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-text-muted" />
                          <span className="text-sm text-text-muted">Pending</span>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedContact.ftd && (
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">FTD Details</label>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-accent-green" />
                        <span className="text-sm text-accent-green">
                          ${selectedContact.ftd_amount || 0}
                        </span>
                        {selectedContact.ftd_date && (
                          <span className="text-xs text-text-muted">
                            ({new Date(selectedContact.ftd_date).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-sm text-text-muted">
                Submitted on {new Date(selectedContact.createdAt).toLocaleString()}
              </div>

              <div className="border-t border-surface-300 pt-6 space-y-4">
                <h3 className="font-semibold text-text">Admin Actions</h3>
                
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Status</label>
                  <Select
                    options={statusOptions}
                    value={editingStatus}
                    onChange={(e: any) => setEditingStatus(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Notes</label>
                  <Textarea
                    placeholder="Add notes about this contact..."
                    value={editingNotes}
                    onChange={(e: any) => setEditingNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {selectedContact.type === 'affiliate' && selectedContact.affiliate_status === 'pending' && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-text">Affiliate Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApproveAffiliate}
                        leftIcon={<UserCheck className="w-4 h-4" />}
                        loading={saving}
                        className="border-accent-green/50 text-accent-green hover:bg-accent-green/10"
                      >
                        Approve Affiliate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRejectAffiliate}
                        leftIcon={<UserX className="w-4 h-4" />}
                        loading={saving}
                        className="border-accent-red/50 text-accent-red hover:bg-accent-red/10"
                      >
                        Reject Affiliate
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-300">
              <Button
                variant="ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

