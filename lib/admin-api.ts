// frontend/src/lib/admin-api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://barracuda.marketing/api';

// AdminAPI class
class AdminAPI {
  private token: string | null = null;

  // ==================== Token Methods ====================
  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  // ==================== Request Helper ====================
  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    };

    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // ==================== Auth Routes ====================
  async login(email: string, password: string): Promise<any> {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success && data.data.token) this.setToken(data.data.token);
    return data;
  }

  async register(email: string, password: string, name: string): Promise<any> {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    if (data.success && data.data.token) this.setToken(data.data.token);
    return data;
  }

  async getProfile(): Promise<any> {
    return this.request('/auth/me');
  }

  logout(): void {
    this.clearToken();
  }

  // ==================== Contacts Routes ====================
  async getContacts(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/contacts${query ? `?${query}` : ''}`);
  }

  async getContactStats(): Promise<any> {
    return this.request('/admin/contacts/stats');
  }

  async getContact(id: string | number): Promise<any> {
    return this.request(`/admin/contacts/${id}`);
  }

  async updateContact(id: string | number, updates: Record<string, any>): Promise<any> {
    return this.request(`/admin/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteContact(id: string | number): Promise<any> {
    return this.request(`/admin/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async exportContacts(filters: Record<string, any> = {}): Promise<any> {
    return this.request('/admin/contacts/export', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // ==================== Settings Routes ====================
  async getSettings(): Promise<any> {
    return this.request('/admin/settings');
  }

  async updateSettings(updates: Record<string, any>): Promise<any> {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getDashboard(): Promise<any> {
    return this.request('/admin/settings/dashboard');
  }

  async resetSettings(): Promise<any> {
    return this.request('/admin/settings/reset', {
      method: 'POST',
    });
  }
}

// Export singleton instance
const adminAPI = new AdminAPI();
export default adminAPI;

// Export class for custom instances
export { AdminAPI };
