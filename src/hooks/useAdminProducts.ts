'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { products as fallbackProducts } from '@/data/products';

import { mapBackendToFrontend, mapFrontendToBackend } from '@/lib/dataMapper';
import { validateProductForAPI, logValidationResults } from '@/lib/productValidation';

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products for admin (including inactive ones)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.warn('Failed to fetch from API, using fallback data:', err);
      setError('Using offline data - API connection failed');
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  // Initialize products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Add a new product
  const addProduct = async (product: Product) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Failed to create product');
      const result = await response.json();
      
      if (result.success && result.data) {
        const newProduct = result.data;
        setProducts(prev => [...prev, newProduct]);
        return newProduct;
      } else {
        throw new Error('Failed to create product');
      }
    } catch (err) {
      console.error('Failed to add product:', err);
      // Fallback to local state update
      const newProduct = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    }
  };

  // Update an existing product
  const updateProduct = async (updatedProduct: Product) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: updatedProduct.id, ...updatedProduct })
      });
      if (!response.ok) throw new Error('Failed to update product');
      const result = await response.json();
      
      if (result.success && result.data) {
        const mappedProduct = result.data;
        setProducts(prev => 
          prev.map(product => 
            product.id === updatedProduct.id ? mappedProduct : product
          )
        );
        return mappedProduct;
      } else {
        throw new Error('Failed to update product');
      }
    } catch (err) {
      console.error('Failed to update product:', err);
      // Fallback to local state update
      const updated = { ...updatedProduct, updatedAt: new Date() };
      setProducts(prev => 
        prev.map(product => 
          product.id === updatedProduct.id ? updated : product
        )
      );
      return updated;
    }
  };

  // Delete a product
  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete product');
      const result = await response.json();
      
      if (result.success) {
        setProducts(prev => prev.filter(product => product.id !== productId));
        return true;
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      // Fallback to local state update
      setProducts(prev => prev.filter(product => product.id !== productId));
      return true;
    }
  };

  // Get a single product by ID
  const getProduct = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  // Save product (add if new, update if existing)
  const saveProduct = async (product: Product) => {
    const existingProduct = products.find(p => p.id === product.id);
    if (existingProduct) {
      return await updateProduct(product);
    } else {
      return await addProduct(product);
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    saveProduct,
    refreshProducts: fetchProducts
  };
}
