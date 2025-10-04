'use client';

import { useState, useEffect } from 'react';


export interface Category {
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
  subcategories?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  sortOrder?: number;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from API
  const fetchCategories = async (params?: { search?: string; active?: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      
      const publicResponse = await fetch('/api/categories?limit=100');
      if (!publicResponse.ok) {
        throw new Error(`HTTP ${publicResponse.status}: ${publicResponse.statusText}`);
      }
      const response = await publicResponse.json();
      
      if (response.success && response.data && Array.isArray(response.data)) {
        const mappedCategories = response.data.map((cat: any) => ({
          ...cat,
          id: cat._id, // Ensure we have both _id and id for compatibility
          productCount: cat.productCount || 0, // Ensure productCount is always a number
          createdAt: new Date(cat.createdAt),
          updatedAt: new Date(cat.updatedAt),
          subcategories: cat.subcategories || []
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

  // Create a new category
  const createCategory = async (categoryData: CategoryFormData) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      
      const data = await response.json();
      if (data.success && data.data) {
        await fetchCategories(); // Refresh categories
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to create category');
      }
    } catch (err: any) {
      console.error('Failed to create category:', err);
      throw new Error(err.message || 'Failed to create category');
    }
  };

  // Update an existing category
  const updateCategory = async (categoryId: string, categoryData: Partial<CategoryFormData>) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId, ...categoryData })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchCategories(); // Refresh categories
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to update category');
      }
    } catch (err: any) {
      console.error('Failed to update category:', err);
      throw new Error(err.message || 'Failed to update category');
    }
  };

  // Toggle category active status
  const toggleCategoryStatus = async (categoryId: string) => {
    try {
      const category = categories.find(c => c._id === categoryId);
      if (!category) throw new Error('Category not found');
      
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId, isActive: !category.isActive })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchCategories(); // Refresh categories
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to toggle category status');
      }
    } catch (err: any) {
      console.error('Failed to toggle category status:', err);
      throw new Error(err.message || 'Failed to toggle category status');
    }
  };

  // Delete a category
  const deleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchCategories(); // Refresh categories
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete category');
      }
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      throw new Error(err.message || 'Failed to delete category');
    }
  };

  // Get a single category by ID
  const getCategory = (categoryId: string) => {
    return categories.find(cat => cat._id === categoryId || cat.id === categoryId);
  };

  // Save category (create if new, update if existing)
  const saveCategory = async (categoryData: CategoryFormData & { _id?: string }) => {
    if (categoryData._id) {
      return await updateCategory(categoryData._id, categoryData);
    } else {
      return await createCategory(categoryData);
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    getCategory,
    saveCategory,
    refreshCategories: fetchCategories
  };
}
