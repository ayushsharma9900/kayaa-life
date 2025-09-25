import { Product } from '@/types';

const API_BASE_URL = '/api/products';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ProductsAPI {
  // Fetch all products
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Product[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch products');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Create a new product
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Product> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create product');
      }

      if (!result.data) {
        throw new Error('No product data returned');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update an existing product
  async updateProduct(product: Product): Promise<Product> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Product> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update product');
      }

      if (!result.data) {
        throw new Error('No product data returned');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete a product
  async deleteProduct(productId: string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}?id=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Product> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete product');
      }

      if (!result.data) {
        throw new Error('No product data returned');
      }

      return result.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Save product (create or update based on existence of ID)
  async saveProduct(product: Product | Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    if ('id' in product && product.id) {
      // Update existing product
      return await this.updateProduct(product as Product);
    } else {
      // Create new product
      return await this.createProduct(product);
    }
  }
}

// Export singleton instance
export const productsAPI = new ProductsAPI();