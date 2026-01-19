'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Globe,
  Mail,
  Bell,
  Shield,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import adminAPI from '@/lib/admin-api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

/**
 * Admin Settings Page
 */
export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAdmin();
  
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    companyName: '',
    contactEmail: '',
    maintenanceMode: false,
    allowNewRegistrations: true,
    analytics: {
      trackingId: '',
      googleAnalytics: false
    },
    notifications: {
      emailOnNewContact: true,
      emailOnNewRegistration: true,
      dailyDigest: false
    },
    social: {
      telegram: '',
      skype: '',
      email: ''
    },
    telegramUsername: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch settings
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminAPI.getSettings();
        if (response.success) {
          setSettings({ ...settings, ...response.data });
        } else {
          setError(response.message || 'Failed to fetch settings');
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [isAuthenticated]);

  // Handle input change
  const handleChange = (path, value) => {
    const paths = path.split('.');
    if (paths.length === 1) {
      setSettings(prev => ({ ...prev, [path]: value }));
    } else {
      setSettings(prev => ({
        ...prev,
        [paths[0]]: {
          ...prev[paths[0]],
          [paths[1]]: value
        }
      }));
    }
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminAPI.updateSettings(settings);
      if (response.success) {
        setSuccess('Settings saved successfully');
        setSettings({ ...settings, ...response.data });
      } else {
        setError(response.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle reset to defaults
  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminAPI.resetSettings();
      if (response.success) {
        setSettings(response.data);
        setSuccess('Settings reset to defaults');
      } else {
        setError(response.message || 'Failed to reset settings');
      }
    } catch (err) {
      console.error('Failed to reset settings:', err);
      setError('Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

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
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Settings</h1>
          <p className="text-text-muted">Manage your site configuration and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Reset Defaults
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-center gap-3 text-accent-red">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-accent-green/10 border border-accent-green/30 rounded-xl flex items-center gap-3 text-accent-green">
          <CheckCircle className="w-5 h-5" />
          <p>{success}</p>
        </div>
      )}

      {/* Site Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-text">Site Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Site Name"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              placeholder="Affiiate"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Site Description"
              value={settings.siteDescription}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              placeholder="Premium Casino Affiliate Network"
            />
          </div>
          <Input
            label="Company Name"
            value={settings.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Barracuda Marketing"
          />
          <Input
            label="Contact Email"
            type="email"
            value={settings.contactEmail}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            placeholder="contact@affiiate.com"
          />
        </div>
      </Card>

      {/* Social Links */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <LinkIcon className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-text">Social Links</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Telegram URL"
            value={settings.social.telegram}
            onChange={(e) => handleChange('social.telegram', e.target.value)}
            placeholder="https://t.me/affiiate"
          />
          <Input
            label="Telegram Username"
            value={settings.telegramUsername}
            onChange={(e) => handleChange('telegramUsername', e.target.value)}
            placeholder="barracuda_alex"
          />
          <p className="text-xs text-text-muted -mt-3">Username for frontend display (without @)</p>
          <Input
            label="Skype"
            value={settings.social.skype}
            onChange={(e) => handleChange('social.skype', e.target.value)}
            placeholder="live:affiiate"
          />
          <Input
            label="Support Email"
            value={settings.social.email}
            onChange={(e) => handleChange('social.email', e.target.value)}
            placeholder="support@affiiate.com"
          />
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-text">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <ToggleSetting
            label="Email on New Contact"
            description="Receive email when someone submits the contact form"
            enabled={settings.notifications.emailOnNewContact}
            onToggle={() => handleChange('notifications.emailOnNewContact', !settings.notifications.emailOnNewContact)}
          />
          <ToggleSetting
            label="Email on New Registration"
            description="Receive email when a new admin registers"
            enabled={settings.notifications.emailOnNewRegistration}
            onToggle={() => handleChange('notifications.emailOnNewRegistration', !settings.notifications.emailOnNewRegistration)}
          />
          <ToggleSetting
            label="Daily Digest"
            description="Receive a daily summary of activity"
            enabled={settings.notifications.dailyDigest}
            onToggle={() => handleChange('notifications.dailyDigest', !settings.notifications.dailyDigest)}
          />
        </div>
      </Card>

      {/* Site Options */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-text">Site Options</h2>
        </div>
        
        <div className="space-y-4">
          <ToggleSetting
            label="Maintenance Mode"
            description="Put the site in maintenance mode (show maintenance page to visitors)"
            enabled={settings.maintenanceMode}
            onToggle={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
          />
          <ToggleSetting
            label="Allow New Registrations"
            description="Allow new admin users to register"
            enabled={settings.allowNewRegistrations}
            onToggle={() => handleChange('allowNewRegistrations', !settings.allowNewRegistrations)}
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          loading={saving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save All Settings
        </Button>
      </div>
    </div>
  );
}

/**
 * Toggle Setting Component
 */
function ToggleSetting({ label, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-text">{label}</p>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary-500' : 'bg-surface-300'
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

