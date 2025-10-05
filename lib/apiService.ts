// Dynamic API service that works in all environments
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URLs
    return '/api';
  }
  
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || '/api';
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private baseURL = getBaseURL();

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data as T;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Products
  async getProducts() {
    return this.request('/products');
  }

  async createProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(product: any) {
    return this.request('/products', {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(category: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(category: any) {
    return this.request('/categories', {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories?id=${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;