'use client';

import { useState } from 'react';
import { 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  User,
  MessageSquare,
  Mail,
  Building2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

/**
 * Status badge component
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    new: { color: 'bg-blue-500/20 text-blue-400', icon: Clock, label: 'New' },
    contacted: { color: 'bg-yellow-500/20 text-yellow-400', icon: MessageSquare, label: 'Contacted' },
    qualified: { color: 'bg-accent-green/20 text-accent-green', icon: CheckCircle, label: 'Qualified' },
    rejected: { color: 'bg-accent-red/20 text-accent-red', icon: XCircle, label: 'Rejected' },
  };

  const config = statusConfig[status] || statusConfig.new;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

/**
 * Affiliate Status badge component
 */
const AffiliateStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Pending' },
    approved: { color: 'bg-accent-green/20 text-accent-green border-accent-green/30', label: 'Approved' },
    rejected: { color: 'bg-accent-red/20 text-accent-red border-accent-red/30', label: 'Rejected' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

/**
 * Type badge component
 */
const TypeBadge = ({ type }) => {
  const typeConfig = {
    affiliate: { color: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30', label: 'Affiliate' },
    publisher: { color: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30', label: 'Publisher' },
    advertiser: { color: 'bg-primary-500/20 text-primary-400 border-primary-500/30', label: 'Advertiser' },
    influencer: { color: 'bg-accent-purple/20 text-accent-purple border-accent-purple/30', label: 'Influencer' },
    media_buyer: { color: 'bg-accent-orange/20 text-accent-orange border-accent-orange/30', label: 'Media Buyer' },
    agency: { color: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30', label: 'Agency' },
  };

  const config = typeConfig[type] || { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: type };

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

/**
 * API Status component - shows Hooplaseft status for affiliates
 */
const ApiStatus = ({ contact }) => {
  return (
    <div className="flex items-center gap-2">
      {/* Hooplaseft Status (for affiliates) */}
      {contact.registration_type === 'affiliate' && (
        <>
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
              <Clock className="w-4 h-4 text-text-muted" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Contacts Table Component
 * Displays contacts with search, filter, and actions
 * Supports affiliate-specific features
 */
export default function ContactsTable({ 
  contacts = [], 
  loading = false, 
  onView, 
  onEdit, 
  onDelete,
  renderTypeBadge,
  renderAffiliateStatusBadge,
  renderApiStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAffiliateStatus, setFilterAffiliateStatus] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  // Filter contacts based on search and filters
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || contact.type === filterType;
    const matchesStatus = !filterStatus || contact.status === filterStatus;
    const matchesAffiliateStatus = !filterAffiliateStatus || contact.affiliate_status === filterAffiliateStatus;
    
    return matchesSearch && matchesType && matchesStatus && matchesAffiliateStatus;
  });

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'affiliate', label: 'Affiliate' },
    { value: 'publisher', label: 'Publisher' },
    { value: 'advertiser', label: 'Advertiser' },
    { value: 'influencer', label: 'Influencer' },
    { value: 'media_buyer', label: 'Media Buyer' },
    { value: 'agency', label: 'Agency' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const affiliateStatusOptions = [
    { value: '', label: 'All Affiliate Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />
        </div>
        <div className="w-full md:w-40">
          <Select
            options={typeOptions}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
        </div>
        <div className="w-full md:w-40">
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            options={affiliateStatusOptions}
            value={filterAffiliateStatus}
            onChange={(e) => setFilterAffiliateStatus(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-100 border-b border-surface-300">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Type
                </th>
                {contacts.some(c => c.registration_type === 'affiliate') && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Affiliate Status
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Contact Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  APIs
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-text-muted">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      Loading contacts...
                    </div>
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-text-muted">
                    No contacts found
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    className="hover:bg-surface-100/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="font-medium text-text">{contact.name}</p>
                          <p className="text-sm text-text-muted">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-text">
                        <Building2 className="w-4 h-4 text-text-muted" />
                        {contact.company}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderTypeBadge ? (
                        renderTypeBadge(contact.type)
                      ) : (
                        <TypeBadge type={contact.type} />
                      )}
                    </td>
                    {/* Affiliate Status Column */}
                    {contacts.some(c => c.registration_type === 'affiliate') && (
                      <td className="px-6 py-4">
                        {contact.registration_type === 'affiliate' ? (
                          renderAffiliateStatusBadge ? (
                            renderAffiliateStatusBadge(contact.affiliate_status)
                          ) : (
                            <AffiliateStatusBadge status={contact.affiliate_status} />
                          )
                        ) : (
                          <span className="text-text-muted text-xs">-</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <StatusBadge status={contact.status || 'new'} />
                    </td>
                    <td className="px-6 py-4">
                      {renderApiStatus ? (
                        renderApiStatus(contact)
                      ) : (
                        <ApiStatus contact={contact} />
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-muted text-sm">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === contact.id ? null : contact.id)}
                            className="p-2 rounded-lg hover:bg-surface-300 text-text-muted hover:text-text transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {openMenu === contact.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-surface-200 border border-surface-300 rounded-xl shadow-lg z-10 py-1">
                              <button
                                onClick={() => {
                                  onView?.(contact);
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface-300 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={() => {
                                  onEdit?.(contact);
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface-300 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  onDelete?.(contact);
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-accent-red hover:bg-surface-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      {!loading && filteredContacts.length > 0 && (
        <p className="text-sm text-text-muted">
          Showing {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

export { StatusBadge, AffiliateStatusBadge, TypeBadge, ApiStatus };

