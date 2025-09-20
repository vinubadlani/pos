import React, { useState } from 'react';
import { Package, Plus, Edit, Search } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'sweet' | 'namkeen'>('all');

  // Sample product data - matches the main App.tsx catalog
  const products = [
    {
      id: 'thekua',
      name: 'The-Cookies Thekua',
      category: 'sweet' as const,
      variants: [
        {
          id: 'ghee',
          name: 'Shudh Desi Ghee Theukua',
          sizes: [
            { size: '200g' as const, sku: 'THEKUA-GHEE-200', price: 199 },
            { size: '500g' as const, sku: 'THEKUA-GHEE-500', price: 492 },
            { size: '1kg' as const, sku: 'THEKUA-GHEE-1000', price: 920 }
          ]
        },
        {
          id: 'refined-oil',
          name: 'Refined Oil Aata Thekua',
          sizes: [
            { size: '200g' as const, sku: 'THEKUA-OIL-200', price: 189 },
            { size: '500g' as const, sku: 'THEKUA-OIL-500', price: 450 },
            { size: '1kg' as const, sku: 'THEKUA-OIL-1000', price: 900 }
          ]
        },
        {
          id: 'suji-maida',
          name: 'Suji Maida Ghee Theukua',
          sizes: [
            { size: '200g' as const, sku: 'THEKUA-SUJI-200', price: 189 },
            { size: '500g' as const, sku: 'THEKUA-SUJI-500', price: 450 },
            { size: '1kg' as const, sku: 'THEKUA-SUJI-1000', price: 900 }
          ]
        }
      ]
    },
    {
      id: 'shakarpara',
      name: 'Shakarpara',
      category: 'sweet' as const,
      variants: [
        {
          id: 'authentic',
          name: 'Authentic ShankarPara',
          sizes: [
            { size: '200g' as const, sku: 'SHAKAR-AUTH-200', price: 220 },
            { size: '500g' as const, sku: 'SHAKAR-AUTH-500', price: 520 },
            { size: '1kg' as const, sku: 'SHAKAR-AUTH-1000', price: 1050 }
          ]
        },
        {
          id: 'shahi',
          name: 'Shahi Shakar Para',
          sizes: [
            { size: '200g' as const, sku: 'SHAKAR-SHAHI-200', price: 220 },
            { size: '500g' as const, sku: 'SHAKAR-SHAHI-500', price: 520 },
            { size: '1kg' as const, sku: 'SHAKAR-SHAHI-1000', price: 1050 }
          ]
        },
        {
          id: 'rose',
          name: 'Rose Shakar Para',
          sizes: [
            { size: '200g' as const, sku: 'SHAKAR-ROSE-200', price: 220 },
            { size: '500g' as const, sku: 'SHAKAR-ROSE-500', price: 520 },
            { size: '1kg' as const, sku: 'SHAKAR-ROSE-1000', price: 1050 }
          ]
        },
        {
          id: 'elaichi',
          name: 'Elaichi Shakar Para',
          sizes: [
            { size: '200g' as const, sku: 'SHAKAR-ELAICHI-200', price: 220 },
            { size: '500g' as const, sku: 'SHAKAR-ELAICHI-500', price: 520 },
            { size: '1kg' as const, sku: 'SHAKAR-ELAICHI-1000', price: 1050 }
          ]
        },
        {
          id: 'kesariya',
          name: 'Kesariya Shakar Para',
          sizes: [
            { size: '200g' as const, sku: 'SHAKAR-KESAR-200', price: 220 },
            { size: '500g' as const, sku: 'SHAKAR-KESAR-500', price: 520 },
            { size: '1kg' as const, sku: 'SHAKAR-KESAR-1000', price: 1050 }
          ]
        },
        {
          id: 'dalchini',
          name: 'Dalchini Shakarpara',
          sizes: [
            { size: '200g' as const, sku: 'SHAKAR-DALCHINI-200', price: 220 },
            { size: '500g' as const, sku: 'SHAKAR-DALCHINI-500', price: 520 },
            { size: '1kg' as const, sku: 'SHAKAR-DALCHINI-1000', price: 1050 }
          ]
        },
        {
          id: 'chocolate',
          name: 'Chocolate Shakarpara',
          sizes: [
            { size: '200g' as const, sku: 'SHAKAR-CHOCO-200', price: 220 },
            { size: '500g' as const, sku: 'SHAKAR-CHOCO-500', price: 520 },
            { size: '1kg' as const, sku: 'SHAKAR-CHOCO-1000', price: 1050 }
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
            { size: '200g' as const, sku: 'GAJA-AUTH-200', price: 199 },
            { size: '500g' as const, sku: 'GAJA-AUTH-500', price: 450 },
            { size: '1kg' as const, sku: 'GAJA-AUTH-1000', price: 850 }
          ]
        },
        {
          id: 'mini',
          name: 'Mini Gaja',
          sizes: [
            { size: '200g' as const, sku: 'GAJA-MINI-200', price: 199 },
            { size: '500g' as const, sku: 'GAJA-MINI-500', price: 450 },
            { size: '1kg' as const, sku: 'GAJA-MINI-1000', price: 850 }
          ]
        }
      ]
    },
    {
      id: 'anarsa',
      name: 'Anarsa',
      category: 'sweet' as const,
      variants: [
        {
          id: 'big',
          name: 'Authentic Big Anarsa',
          sizes: [
            { size: '200g' as const, sku: 'ANARSA-BIG-200', price: 270 },
            { size: '500g' as const, sku: 'ANARSA-BIG-500', price: 590 },
            { size: '1kg' as const, sku: 'ANARSA-BIG-1000', price: 1050 }
          ]
        },
        {
          id: 'mini',
          name: 'Anarsa Mini Balls',
          sizes: [
            { size: '200g' as const, sku: 'ANARSA-MINI-200', price: 270 },
            { size: '500g' as const, sku: 'ANARSA-MINI-500', price: 590 },
            { size: '1kg' as const, sku: 'ANARSA-MINI-1000', price: 1050 }
          ]
        }
      ]
    },
    {
      id: 'khaja',
      name: 'Khaja',
      category: 'sweet' as const,
      variants: [
        {
          id: 'regular',
          name: 'Khaja',
          sizes: [
            { size: '200g' as const, sku: 'KHAJA-REG-200', price: 270 },
            { size: '500g' as const, sku: 'KHAJA-REG-500', price: 590 },
            { size: '1kg' as const, sku: 'KHAJA-REG-1000', price: 1050 }
          ]
        },
        {
          id: 'mini',
          name: 'Khaja Mini',
          sizes: [
            { size: '200g' as const, sku: 'KHAJA-MINI-200', price: 270 },
            { size: '500g' as const, sku: 'KHAJA-MINI-500', price: 590 },
            { size: '1kg' as const, sku: 'KHAJA-MINI-1000', price: 1050 }
          ]
        }
      ]
    },
    {
      id: 'lai',
      name: 'Lai',
      category: 'sweet' as const,
      variants: [
        {
          id: 'rajgira',
          name: 'Rajgira Lai',
          sizes: [
            { size: '200g' as const, sku: 'LAI-RAJGIRA-200', price: 199 },
            { size: '500g' as const, sku: 'LAI-RAJGIRA-500', price: 450 },
            { size: '1kg' as const, sku: 'LAI-RAJGIRA-1000', price: 820 }
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
          name: 'Namakpara',
          sizes: [
            { size: '200g' as const, sku: 'NAMAK-CLASSIC-200', price: 150 },
            { size: '500g' as const, sku: 'NAMAK-CLASSIC-500', price: 270 },
            { size: '1kg' as const, sku: 'NAMAK-CLASSIC-1000', price: 499 }
          ]
        }
      ]
    },
    {
      id: 'dalmoth',
      name: 'Dalmoth',
      category: 'namkeen' as const,
      variants: [
        {
          id: 'masoor',
          name: 'Dalmoth Masoor',
          sizes: [
            { size: '200g' as const, sku: 'DALMOTH-MASOOR-200', price: 150 },
            { size: '500g' as const, sku: 'DALMOTH-MASOOR-500', price: 270 },
            { size: '1kg' as const, sku: 'DALMOTH-MASOOR-1000', price: 499 }
          ]
        },
        {
          id: 'moong',
          name: 'Dalmoth Moong',
          sizes: [
            { size: '200g' as const, sku: 'DALMOTH-MOONG-200', price: 150 },
            { size: '500g' as const, sku: 'DALMOTH-MOONG-500', price: 270 },
            { size: '1kg' as const, sku: 'DALMOTH-MOONG-1000', price: 499 }
          ]
        }
      ]
    },
    {
      id: 'chanachur',
      name: 'Chanachur',
      category: 'namkeen' as const,
      variants: [
        {
          id: 'roasted',
          name: 'Roasted',
          sizes: [
            { size: '200g' as const, sku: 'CHANACHUR-ROASTED-200', price: 150 },
            { size: '500g' as const, sku: 'CHANACHUR-ROASTED-500', price: 270 },
            { size: '1kg' as const, sku: 'CHANACHUR-ROASTED-1000', price: 499 }
          ]
        }
      ]
    },
    {
      id: 'healthy-mixture',
      name: 'Healthy Mixture',
      category: 'namkeen' as const,
      variants: [
        {
          id: 'millet',
          name: 'Millet Roasted (Rajgira, etc)',
          sizes: [
            { size: '200g' as const, sku: 'HEALTHY-MILLET-200', price: 220 },
            { size: '500g' as const, sku: 'HEALTHY-MILLET-500', price: 499 },
            { size: '1kg' as const, sku: 'HEALTHY-MILLET-1000', price: 900 }
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
