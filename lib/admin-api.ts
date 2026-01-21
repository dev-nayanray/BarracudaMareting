// frontend/src/lib/admin-api.ts

// Use empty string for relative URLs (works on any port)
const API_BASE_URL = '';

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
    // Use dynamic origin to work on any port
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // ==================== Auth Routes ====================
  async login(email: string, password: string): Promise<any> {
    const data = await this.request('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success && data.data.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async register(email: string, password: string, name: string): Promise<any> {
    // For now, just use login - registration can be added later
    return this.login(email, password);
  }

  async getProfile(): Promise<any> {
    // Validate token with the server
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const data = await this.request('/api/admin/auth/profile');
      if (data.success) {
        return data;
      }
      throw new Error(data.message || 'Invalid token');
    } catch (error: any) {
      console.error('Profile validation failed:', error.message);
      this.clearToken();
      throw new Error('Not authenticated');
    }
  }

  logout(): void {
    this.clearToken();
  }

  // ==================== Contacts Routes ====================
  async getContacts(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/admin/contacts${query ? `?${query}` : ''}`);
  }

  async getContactStats(): Promise<any> {
    return this.request('/api/admin/contacts/stats');
  }

  async getContact(id: string | number): Promise<any> {
    return this.request(`/api/admin/contacts/${id}`);
  }

  async updateContact(id: string | number, updates: Record<string, any>): Promise<any> {
    return this.request(`/api/admin/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteContact(id: string | number): Promise<any> {
    return this.request(`/api/admin/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async exportContacts(filters: Record<string, any> = {}): Promise<any> {
    return this.request('/api/admin/contacts', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // ==================== Conversions Routes ====================
  async getConversions(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/admin/conversions${query ? `?${query}` : ''}`);
  }

  async getConversionStats(): Promise<any> {
    return this.request('/api/admin/conversions/stats');
  }
}

// Export singleton instance
const adminAPI = new AdminAPI();
export default adminAPI;

// Export class for custom instances
export { AdminAPI };
