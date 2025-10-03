'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { 
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  HeartIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { state } = useCart();
  const { state: wishlistState } = useWishlist();
  const { categories } = usePublicCategories();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="bg-white shadow-sm">
      {/* Top banner */}
      <div className="bg-pink-50 text-center py-2 text-sm">
        <p className="text-pink-800">FREE SHIPPING ON ORDERS ABOVE ₹499 | COD AVAILABLE</p>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-pink-600">
              kaayalife
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {categories.slice(0, 4).map((category) => (
              <div key={category.id} className="relative group">
                <Link 
                  href={`/${category.slug}`} 
                  className="text-gray-700 hover:text-pink-600 font-medium"
                >
                  {category.name}
                </Link>
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                      {category.name}
                    </div>
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/${category.slug}/${sub.slug}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      >
                        <div className="w-2 h-2 bg-pink-300 rounded-full mr-3"></div>
                        {sub.name}
                      </Link>
                    ))}
                    <div className="border-t mt-1 pt-1">
                      <Link
                        href={`/${category.slug}`}
                        className="block px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors"
                      >
                        View All {category.name}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md text-pink-600 placeholder-pink-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button type="submit" className="absolute right-2 top-2 hover:text-pink-600">
                <MagnifyingGlassIcon className="h-5 w-5 text-pink-500" />
              </button>
            </form>
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-4">
            {/* Mobile search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            <Link href="/wishlist" className="text-gray-600 hover:text-gray-900 relative">
              <HeartIcon className="h-6 w-6" />
              {wishlistState.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {wishlistState.itemCount > 99 ? '99+' : wishlistState.itemCount}
                </span>
              )}
            </Link>
            
            <Link href="/account" className="text-gray-600 hover:text-gray-900">
              <UserIcon className="h-6 w-6" />
            </Link>
            
            <Link href="/cart" className="text-gray-600 hover:text-gray-900 relative">
              <ShoppingBagIcon className="h-6 w-6" />
              {state.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {state.itemCount > 99 ? '99+' : state.itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden py-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md text-pink-600 placeholder-pink-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                autoFocus
              />
              <button type="submit" className="absolute right-2 top-2 hover:text-pink-600">
                <MagnifyingGlassIcon className="h-5 w-5 text-pink-500" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="py-4 space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="space-y-1">
                  <Link 
                    href={`/${category.slug}`} 
                    className="block text-gray-700 hover:text-pink-600 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="pl-4 space-y-1">
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/${category.slug}/${sub.slug}`}
                          className="flex items-center text-sm text-gray-600 hover:text-pink-600 py-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
