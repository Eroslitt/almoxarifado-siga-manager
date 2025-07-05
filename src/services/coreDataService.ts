interface DataResponse<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class CoreDataService {
  private baseUrl = '/api';
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return { 
        success: false, 
        data: null as T,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Tools API
  async getTools() {
    return this.request<any[]>('/tools');
  }

  async getToolById(id: string) {
    return this.request<any>(`/tools/${id}`);
  }

  async updateToolStatus(id: string, status: string) {
    return this.request<any>(`/tools/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Stock API
  async getStockItems() {
    return this.request<any[]>('/stock');
  }

  async updateStock(id: string, quantity: number) {
    return this.request<any>(`/stock/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity })
    });
  }

  // Analytics API
  async getAnalytics(period: string = '30d') {
    return this.request<any>(`/analytics?period=${period}`);
  }

  async getKPIs() {
    return this.request<any>('/analytics/kpis');
  }

  // Search API
  async search(query: string, filters: Record<string, any> = {}) {
    const params = new URLSearchParams({
      q: query,
      ...Object.entries(filters).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: String(value)
      }), {})
    });
    
    return this.request<any[]>(`/search?${params.toString()}`);
  }
}

export const coreDataService = new CoreDataService();