'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PaginationInfo, PaginatedResult } from '@/types';

export interface UsePaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

export function usePagination<T>(
  allItems: T[],
  options: UsePaginationOptions = {}
) {
  const { itemsPerPage = 12, initialPage = 1 } = options;
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNavigatingRef = useRef(false);
  
  // Get current page from URL or use initial page
  const currentPage = useMemo(() => {
    try {
      const pageParam = searchParams?.get('page');
      if (!pageParam) return initialPage;
      
      const page = parseInt(pageParam, 10);
      if (isNaN(page) || page < 1) return initialPage;
      
      return page;
    } catch {
      return initialPage;
    }
  }, [searchParams, initialPage]);

  // Calculate pagination info
  const paginationInfo = useMemo((): PaginationInfo => {
    const totalItems = allItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    
    // If current page is beyond available pages, stay on last page
    const validCurrentPage = totalItems === 0 ? 1 : Math.min(Math.max(1, currentPage), totalPages);

    return {
      currentPage: validCurrentPage,
      totalPages: totalItems === 0 ? 1 : totalPages,
      totalItems,
      itemsPerPage,
      hasNext: validCurrentPage < totalPages && totalItems > 0,
      hasPrev: validCurrentPage > 1 && totalItems > 0
    };
  }, [allItems.length, itemsPerPage, currentPage]);

  // Get paginated data
  const paginatedResult = useMemo((): PaginatedResult<T> => {
    const { currentPage: validPage } = paginationInfo;
    const startIndex = (validPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const data = allItems.slice(startIndex, endIndex);

    return {
      data,
      pagination: paginationInfo
    };
  }, [allItems, paginationInfo, itemsPerPage]);

  // Navigate to a specific page
  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > paginationInfo.totalPages || isNavigatingRef.current) {
      return;
    }

    isNavigatingRef.current = true;
    
    try {
      // Create new URL with updated page parameter
      const newSearchParams = new URLSearchParams(searchParams?.toString() || '');
      
      if (page === 1) {
        // Remove page parameter for page 1 (clean URLs)
        newSearchParams.delete('page');
      } else {
        newSearchParams.set('page', page.toString());
      }

      const queryString = newSearchParams.toString();
      const newUrl = `${pathname}${queryString ? '?' + queryString : ''}`;
      
      // Use router.push for proper navigation
      router.push(newUrl);
      
      // Scroll to top for better UX
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.warn('Failed to navigate to page:', error);
    }
    
    // Reset navigation flag after a short delay
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  }, [router, pathname, searchParams, paginationInfo.totalPages]);

  // Helper functions for navigation
  const goToNextPage = useCallback(() => {
    if (paginationInfo.hasNext) {
      goToPage(paginationInfo.currentPage + 1);
    }
  }, [goToPage, paginationInfo]);

  const goToPrevPage = useCallback(() => {
    if (paginationInfo.hasPrev) {
      goToPage(paginationInfo.currentPage - 1);
    }
  }, [goToPage, paginationInfo]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(paginationInfo.totalPages);
  }, [goToPage, paginationInfo.totalPages]);

  // Reset pagination when filters change (useful for search/filter changes)
  const resetPagination = useCallback(() => {
    goToFirstPage();
  }, [goToFirstPage]);

  return {
    // Paginated data
    ...paginatedResult,
    
    // Navigation functions
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    resetPagination,
    
    // Current state
    currentPage: paginationInfo.currentPage,
    totalPages: paginationInfo.totalPages,
    totalItems: paginationInfo.totalItems,
    itemsPerPage: paginationInfo.itemsPerPage,
    hasNext: paginationInfo.hasNext,
    hasPrev: paginationInfo.hasPrev,
    
    // Helper to check if pagination is needed
    isPaginationVisible: paginationInfo.totalPages > 1
  };
}

// Utility function to create paginated results manually
export function createPaginatedResult<T>(
  allItems: T[],
  page: number,
  itemsPerPage: number
): PaginatedResult<T> {
  const totalItems = allItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validPage = Math.min(Math.max(1, page), totalPages || 1);
  
  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const data = allItems.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      currentPage: validPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNext: validPage < totalPages,
      hasPrev: validPage > 1
    }
  };
}