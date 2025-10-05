'use client';

import { useState } from 'react';
import { 
  CloudArrowDownIcon, 
  ShoppingBagIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    imported: number;
    total: number;
    source: string;
    products: unknown[];
  };
  error?: string;
}

interface ProductImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function ProductImporter({ isOpen, onClose, onImportComplete }: ProductImporterProps) {
  const [selectedSource, setSelectedSource] = useState<string>('amazon');
  const [importCount, setImportCount] = useState<number>(50);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const sources = [
    {
      id: 'amazon',
      name: 'Amazon Beauty',
      description: 'Import beauty products similar to Amazon\'s selection',
      icon: '🛒',
      categories: ['Skincare', 'Makeup', 'Hair Care', 'Personal Care', 'Men\'s Grooming']
    },
    {
      id: 'flipkart',
      name: 'Flipkart Beauty',
      description: 'Import beauty products similar to Flipkart\'s selection',
      icon: '🛍️',
      categories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Personal Care']
    },
    {
      id: 'nykaa',
      name: 'Beauty Store',
      description: 'Import comprehensive beauty product catalog',
      icon: '💄',
      categories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Personal Care', 'Men\'s Grooming', 'Nail Care', 'Baby Care']
    }
  ];

  const handleImport = async () => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: selectedSource,
          count: importCount
        })
      });

      const result: ImportResult = await response.json();
      
      setImportResult(result);
      
      if (result.success) {
        // Wait a moment to show success message, then refresh
        setTimeout(() => {
          onImportComplete();
        }, 2000);
      }
      
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        message: 'Failed to import products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const selectedSourceInfo = sources.find(source => source.id === selectedSource);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <CloudArrowDownIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Import Products</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {!importResult ? (
            <>
              {/* Source Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Import Source
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {sources.map((source) => (
                    <div
                      key={source.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedSource === source.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSource(source.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{source.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{source.name}</h3>
                            {selectedSource === source.id && (
                              <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Categories:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {source.categories.map((category) => (
                                <span
                                  key={category}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Import Settings */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Products to Import
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={importCount}
                    onChange={(e) => setImportCount(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex items-center space-x-2 min-w-[80px]">
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={importCount}
                      onChange={(e) => setImportCount(Math.max(10, Math.min(100, parseInt(e.target.value) || 10)))}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-500">products</span>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>10 products</span>
                  <span>100 products</span>
                </div>
              </div>

              {/* Import Preview */}
              {selectedSourceInfo && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Import Preview</h4>
                  <div className="text-sm text-gray-600">
                    <p>• Source: <strong>{selectedSourceInfo.name}</strong></p>
                    <p>• Products: <strong>{importCount} items</strong></p>
                    <p>• Categories: <strong>{selectedSourceInfo.categories.length} categories</strong></p>
                    <p>• Estimated time: <strong>~{Math.ceil(importCount / 20)} seconds</strong></p>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important Notes:</p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>This will add new products to your existing catalog</li>
                      <li>Imported products will have realistic data and pricing</li>
                      <li>All products will be marked as &quot;in stock&quot; by default</li>
                      <li>You can edit imported products after the import is complete</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Import Result */
            <div className="text-center">
              {importResult.success ? (
                <div className="mb-6">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Import Successful!</h3>
                  <p className="text-gray-600 mb-4">{importResult.message}</p>
                  
                  {importResult.data && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-green-800">Products Imported</p>
                          <p className="text-green-600">{importResult.data.imported}</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Total Products</p>
                          <p className="text-green-600">{importResult.data.total}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    The page will refresh automatically to show new products.
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Import Failed</h3>
                  <p className="text-gray-600 mb-4">{importResult.message}</p>
                  
                  {importResult.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-red-800">{importResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              {importResult?.success ? 'Close' : 'Cancel'}
            </button>
            
            {!importResult && (
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isImporting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <ShoppingBagIcon className="h-4 w-4" />
                <span>{isImporting ? 'Importing...' : `Import ${importCount} Products`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}