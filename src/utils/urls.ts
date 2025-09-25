import { categories } from '@/data/products';

/**
 * Get category URL by category name
 */
export function getCategoryUrl(categoryName: string): string {
  const category = categories.find(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category ? `/${category.slug}` : '/products';
}

/**
 * Get category URL by category slug
 */
export function getCategoryUrlBySlug(slug: string): string {
  const category = categories.find(cat => cat.slug === slug);
  return category ? `/${category.slug}` : '/products';
}

/**
 * Get product URL
 */
export function getProductUrl(productId: string): string {
  return `/product/${productId}`;
}

/**
 * Get search URL with query
 */
export function getSearchUrl(query: string): string {
  return `/products?search=${encodeURIComponent(query)}`;
}

/**
 * Check if a category slug is valid
 */
export function isValidCategorySlug(slug: string): boolean {
  return categories.some(cat => cat.slug === slug);
}

/**
 * Get category name by slug
 */
export function getCategoryNameBySlug(slug: string): string | null {
  const category = categories.find(cat => cat.slug === slug);
  return category ? category.name : null;
}