'use client';

import { useState, useEffect } from 'react';

export interface PublicCategory {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  productCount: number;
  sortOrder?: number;
  parentId?: string;
  subcategories?: PublicCategory[];
  createdAt: Date;
  updatedAt: Date;
}

export function usePublicCategories() {
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from public API
  const fetchCategories = async (params?: { search?: string; limit?: number }) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `/api/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        const mappedCategories = data.data.map((cat: any) => ({
          ...cat,
          id: cat._id, // Ensure we have both _id and id for compatibility
          createdAt: new Date(cat.createdAt),
          updatedAt: new Date(cat.updatedAt)
        }));
        setCategories(mappedCategories);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Failed to fetch categories');
      setCategories([]); // Clear categories on error
    } finally {
      setLoading(false);
    }
  };

  // Initialize categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Get a single category by slug or ID
  const getCategory = (identifier: string) => {
    return categories.find(cat => 
      cat.slug === identifier || 
      cat._id === identifier || 
      cat.id === identifier
    );
  };

  return {
    categories,
    loading,
    error,
    getCategory,
    refreshCategories: fetchCategories
  };
}