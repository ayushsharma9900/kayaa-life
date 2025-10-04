'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface MenuItem {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  showInMenu?: boolean;
  menuOrder?: number;
  parentId?: string;
  subcategories?: MenuItem[];
  productCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MenuManagerProps {
  onAddItem?: () => void;
}

export default function MenuManager({ onAddItem }: MenuManagerProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        const mappedItems = (data.data || []).map((item: any) => ({
          ...item,
          showInMenu: item.showInMenu ?? true,
          menuOrder: item.menuOrder ?? 0
        }));
        setMenuItems(mappedItems);
      } else {
        setError('Failed to fetch menu items');
      }
    } catch (err) {
      setError('Error fetching menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleToggleVisibility = async (id: string, showInMenu: boolean) => {
    alert(`Toggle visibility for ${id}: ${showInMenu}`);
  };

  const handleSyncCategories = async () => {
    alert('Sync categories functionality');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage website navigation menu items</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchMenuItems}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2 inline" />
            Refresh
          </button>
          <button
            onClick={handleSyncCategories}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sync Categories
          </button>
          {onAddItem && (
            <button
              onClick={onAddItem}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
            >
              <PlusIcon className="h-4 w-4 mr-2 inline" />
              Add Item
            </button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {menuItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No menu items found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.slug}</p>
                      {item.subcategories && item.subcategories.length > 0 && (
                        <p className="text-xs text-blue-600">{item.subcategories.length} subcategories</p>
                      )}
                      {item.productCount !== undefined && (
                        <p className="text-xs text-gray-500">{item.productCount} products</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleVisibility(item._id, !item.showInMenu)}
                      className={`p-2 rounded-md ${(item.showInMenu ?? true) ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                      title={(item.showInMenu ?? true) ? 'Hide from menu' : 'Show in menu'}
                    >
                      {(item.showInMenu ?? true) ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                    </button>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-900">{menuItems.length}</span> total items
          </div>
          <div>
            <span className="font-medium text-gray-900">
              {menuItems.filter(item => item.showInMenu ?? true).length}
            </span> visible in menu
          </div>
          <div>
            <span className="font-medium text-gray-900">
              {menuItems.filter(item => item.isActive).length}
            </span> active items
          </div>
        </div>
      </div>
    </div>
  );
}