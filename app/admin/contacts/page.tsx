
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
  Zap
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import adminAPI from '@/lib/admin-api';
import ContactsTable from '@/components/admin/ContactsTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';

/**
 * Status options for contact status
 */
const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'rejected', label: 'Rejected' },
];

/**
 * Admin Contacts Management Page
 * Includes affiliate-specific management features
 */
export default function ContactsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAdmin();
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState('');
  const [editingNotes, setEditingNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch contacts and stats
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
    } catch (err) {
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

  // Handle view contact
  const handleView = (contact) => {
    setSelectedContact(contact);
    setEditingStatus(contact.status || 'new');
    setEditingNotes(contact.notes || '');
    setShowModal(true);
  };

  // Handle edit contact
  const handleEdit = (contact) => {
    handleView(contact);
  };

  // Handle delete contact
  const handleDelete = async (contact) => {
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

  // Handle save contact changes
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

  // Handle approve affiliate
  const handleApproveAffiliate = async () => {
    if (!selectedContact) return;

    if (!confirm(`Approve ${selectedContact.name} as an affiliate?`)) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/approve-affiliate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
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

  // Handle reject affiliate
  const handleRejectAffiliate = async () => {
    if (!selectedContact) return;

    const reason = prompt('Please enter a reason for rejection (optional):');
    
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/reject-affiliate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
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

  // Handle export contacts
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

  // Copy tracking link
  const copyTrackingLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('Tracking link copied to clipboard!');
  };

  // Render type badge
  const renderTypeBadge = (type) => {
    const badges = {
      affiliate: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30',
      publisher: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30',
      advertiser: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
      influencer: 'bg-accent-purple/20 text-accent-purple border-accent-purple/30',
      media_buyer: 'bg-accent-orange/20 text-accent-orange border-accent-orange/30',
      agency: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30'
    };
    
    const labels = {
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

  // Render affiliate status badge
  const renderAffiliateStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-accent-green/20 text-accent-green border-accent-green/30',
      rejected: 'bg-accent-red/20 text-accent-red border-accent-red/30'
    };
    
    const labels = {
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

  // Render API status
  const renderApiStatus = (contact) => {
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
      {/* Page Header */}
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-text">{stats.total}</div>
            <div className="text-sm text-text-muted">Total Contacts</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-accent-green">{stats.affiliateStats?.pending || 0}</div>
            <div className="text-sm text-text-muted">Pending Affiliates</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-primary-400">{stats.byType?.affiliate || 0}</div>
            <div className="text-sm text-text-muted">Affiliates</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-secondary-400">{stats.byType?.advertiser || 0}</div>
            <div className="text-sm text-text-muted">Advertisers</div>
          </Card>
        </div>
      )}

      {/* Error Message */}
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

      {/* Contacts Table */}
      <ContactsTable
        contacts={contacts}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderTypeBadge={renderTypeBadge}
        renderAffiliateStatusBadge={renderAffiliateStatusBadge}
        renderApiStatus={renderApiStatus}
      />

      {/* Contact Detail Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-300">
              <h2 className="text-xl font-bold text-text">Contact Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-surface-300 rounded-lg text-text-muted hover:text-text transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Contact Basic Info */}
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

              {/* Affiliate-specific Section */}
              {selectedContact.registration_type === 'affiliate' && (
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
                      <p className="text-text capitalize">{selectedContact.traffic_source?.replace(/_/g, ' ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Campaign ID</label>
                      <p className="text-text font-mono">{selectedContact.campaign_id || '2'}</p>
                    </div>
                    {selectedContact.tracking_link && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-text-muted mb-1">Tracking Link</label>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-surface-100 p-2 rounded flex-1 overflow-x-auto text-text">
                            {selectedContact.tracking_link}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyTrackingLink(selectedContact.tracking_link)}
                            leftIcon={<Copy className="w-4 h-4" />}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedContact.message && (
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Message</label>
                  <p className="text-text bg-surface-100 p-4 rounded-xl">{selectedContact.message}</p>
                </div>
              )}

              {/* API Status Section */}
              <div className="p-4 bg-surface-100 rounded-xl">
                <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  API Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Blitz API</label>
                    {renderApiStatus(selectedContact)}
                  </div>
                  {selectedContact.registration_type === 'affiliate' && (
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
                      <label className="block text-sm font-medium text-text-muted mb-1">FTD Status</label>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent-green" />
                        <span className="text-sm text-accent-green">FTD Detected</span>
                        {selectedContact.ftdDate && (
                          <span className="text-xs text-text-muted">
                            ({new Date(selectedContact.ftdDate).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="text-sm text-text-muted">
                Submitted on {new Date(selectedContact.createdAt).toLocaleString()}
              </div>

              {/* Edit Form */}
              <div className="border-t border-surface-300 pt-6 space-y-4">
                <h3 className="font-semibold text-text">Admin Actions</h3>
                
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Status</label>
                  <Select
                    options={statusOptions}
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Notes</label>
                  <Textarea
                    placeholder="Add notes about this contact..."
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Affiliate Actions */}
                {selectedContact.registration_type === 'affiliate' && selectedContact.affiliate_status === 'pending' && (
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

            {/* Modal Footer */}
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



