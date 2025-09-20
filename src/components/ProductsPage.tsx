import React, { useState } from 'react';
import { Package, Plus, Edit, Search } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'sweet' | 'namkeen'>('all');

  // Sample product data - in a real app this would come from an API
  const products = [
    {
      id: 'thekua',
      name: 'Thekua',
      category: 'sweet' as const,
      variants: [
        {
          id: 'shahi',
          name: 'Shahi Thekua',
          sizes: [
            { size: '200g' as const, sku: 'THEKUA-SHAHI-200', price: 150 },
            { size: '500g' as const, sku: 'THEKUA-SHAHI-500', price: 350 },
            { size: '1kg' as const, sku: 'THEKUA-SHAHI-1000', price: 650 }
          ]
        },
        {
          id: 'suji',
          name: 'Suji Maida Thekua',
          sizes: [
            { size: '200g' as const, sku: 'THEKUA-SUJI-200', price: 120 },
            { size: '500g' as const, sku: 'THEKUA-SUJI-500', price: 280 },
            { size: '1kg' as const, sku: 'THEKUA-SUJI-1000', price: 520 }
          ]
        },
        {
          id: 'ghee',
          name: 'Shudh Desi Ghee Thekua',
          sizes: [
            { size: '200g' as const, sku: 'THEKUA-GHEE-200', price: 140 },
            { size: '500g' as const, sku: 'THEKUA-GHEE-500', price: 320 },
            { size: '1kg' as const, sku: 'THEKUA-GHEE-1000', price: 600 }
          ]
        }
      ]
    },
    {
      id: 'gaja',
      name: 'Gaja',
      category: 'sweet' as const,
      variants: [
        {
          id: 'authentic',
          name: 'Authentic GAJA',
          sizes: [
            { size: '200g' as const, sku: 'GAJA-AUTH-200', price: 160 },
            { size: '500g' as const, sku: 'GAJA-AUTH-500', price: 380 },
            { size: '1kg' as const, sku: 'GAJA-AUTH-1000', price: 720 }
          ]
        }
      ]
    },
    {
      id: 'namakpara',
      name: 'Namakpara',
      category: 'namkeen' as const,
      variants: [
        {
          id: 'classic',
          name: 'Classic Namakpara',
          sizes: [
            { size: '200g' as const, sku: 'NAMAK-CLASSIC-200', price: 80 },
            { size: '500g' as const, sku: 'NAMAK-CLASSIC-500', price: 190 },
            { size: '1kg' as const, sku: 'NAMAK-CLASSIC-1000', price: 360 }
          ]
        },
        {
          id: 'spicy',
          name: 'Spicy Namakpara',
          sizes: [
            { size: '200g' as const, sku: 'NAMAK-SPICY-200', price: 85 },
            { size: '500g' as const, sku: 'NAMAK-SPICY-500', price: 200 },
            { size: '1kg' as const, sku: 'NAMAK-SPICY-1000', price: 380 }
          ]
        }
      ]
    },
    {
      id: 'murukku',
      name: 'Murukku',
      category: 'namkeen' as const,
      variants: [
        {
          id: 'traditional',
          name: 'Traditional Murukku',
          sizes: [
            { size: '200g' as const, sku: 'MURUKKU-TRAD-200', price: 90 },
            { size: '500g' as const, sku: 'MURUKKU-TRAD-500', price: 210 },
            { size: '1kg' as const, sku: 'MURUKKU-TRAD-1000', price: 400 }
          ]
        }
      ]
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.variants.some(variant => 
                           variant.name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Products</h1>
        <button className="btn btn-primary">
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="form-label">Search Products</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product or variant name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control pl-10"
                />
              </div>
            </div>
            
            <div className="form-group mb-0">
              <label className="form-label">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as 'all' | 'sweet' | 'namkeen')}
                className="form-control form-select"
              >
                <option value="all">All Categories</option>
                <option value="sweet">🍯 Sweets</option>
                <option value="namkeen">🥨 Namkeen</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="card">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {product.category === 'sweet' ? '🍯' : '🥨'}
                  </div>
                  <div>
                    <h2 className="card-title">{product.name}</h2>
                    <span className="text-sm text-gray-600 capitalize">
                      {product.category}
                    </span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm">
                  <Edit size={16} />
                  Edit
                </button>
              </div>
            </div>
            
            <div className="card-body">
              <div className="grid gap-4">
                {product.variants.map(variant => (
                  <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-3">{variant.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {variant.sizes.map(size => (
                        <div key={size.size} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{size.size}</div>
                            <div className="text-sm text-gray-600">₹{size.price}</div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {size.sku}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="card">
          <div className="card-body text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3>No products found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No products match the selected category.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
