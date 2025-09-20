import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  ShoppingBag,
  ClipboardList
} from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import CheckoutPage from './components/CheckoutPage';
import OrdersPage from './components/OrdersPage';
import InvoicePage from './components/InvoicePage';
import ImageRecoveryAdmin from './components/ImageRecoveryAdmin';

// Types
export interface Product {
  id: string;
  name: string;
  category: 'sweet' | 'namkeen';
  description?: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  description?: string;
  sizes: ProductSize[];
}

export interface ProductSize {
  size: '200g' | '500g' | '1kg';
  sku: string;
  price: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  variant: string;
  size: '200g' | '500g' | '1kg';
  sku: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export interface Order {
  orderNumber: string;
  customerName: string;
  address: string;
  pincode: string;
  contact: string;
  tlName: string;
  memberName: string;
  subtotal: number;
  delivery: number;
  grandTotal: number;
  paymentScreenshotUrl?: string;
  items: CartItem[];
  timestamp: string;
  orderNote?: string;
}

// Updated product catalog with your items
const PRODUCTS: Product[] = [
  // SWEETS
  {
    id: 'thekua',
    name: 'Thekua',
    category: 'sweet',
    variants: [
      {
        id: 'suji-maida',
        name: 'Suji Maida Thekua',
        sizes: [
          { size: '200g', sku: 'THEKUA-SUJI-200', price: 120 },
          { size: '500g', sku: 'THEKUA-SUJI-500', price: 280 },
          { size: '1kg', sku: 'THEKUA-SUJI-1000', price: 520 }
        ]
      },
      {
        id: 'refined-oil',
        name: 'Refined Oil Aata Thekua',
        sizes: [
          { size: '200g', sku: 'THEKUA-OIL-200', price: 100 },
          { size: '500g', sku: 'THEKUA-OIL-500', price: 240 },
          { size: '1kg', sku: 'THEKUA-OIL-1000', price: 450 }
        ]
      },
      {
        id: 'ghee',
        name: 'Shudh Desi Ghee Thekua',
        sizes: [
          { size: '200g', sku: 'THEKUA-GHEE-200', price: 160 },
          { size: '500g', sku: 'THEKUA-GHEE-500', price: 380 },
          { size: '1kg', sku: 'THEKUA-GHEE-1000', price: 720 }
        ]
      }
    ]
  },
  {
    id: 'shakarpara',
    name: 'Shakarpara',
    category: 'sweet',
    variants: [
      {
        id: 'authentic',
        name: 'Authentic ShankarPara',
        sizes: [
          { size: '200g', sku: 'SHAKAR-AUTH-200', price: 140 },
          { size: '500g', sku: 'SHAKAR-AUTH-500', price: 330 },
          { size: '1kg', sku: 'SHAKAR-AUTH-1000', price: 620 }
        ]
      },
      {
        id: 'shahi',
        name: 'Shahi ShakarPara',
        sizes: [
          { size: '200g', sku: 'SHAKAR-SHAHI-200', price: 180 },
          { size: '500g', sku: 'SHAKAR-SHAHI-500', price: 420 },
          { size: '1kg', sku: 'SHAKAR-SHAHI-1000', price: 800 }
        ]
      },
      {
        id: 'rose',
        name: 'Rose ShakarPara',
        sizes: [
          { size: '200g', sku: 'SHAKAR-ROSE-200', price: 200 },
          { size: '500g', sku: 'SHAKAR-ROSE-500', price: 480 },
          { size: '1kg', sku: 'SHAKAR-ROSE-1000', price: 920 }
        ]
      },
      {
        id: 'elaichi',
        name: 'Elaichi ShakarPara',
        sizes: [
          { size: '200g', sku: 'SHAKAR-ELAICHI-200', price: 190 },
          { size: '500g', sku: 'SHAKAR-ELAICHI-500', price: 450 },
          { size: '1kg', sku: 'SHAKAR-ELAICHI-1000', price: 860 }
        ]
      },
      {
        id: 'kesariya',
        name: 'Kesariya ShakarPara',
        sizes: [
          { size: '200g', sku: 'SHAKAR-KESAR-200', price: 220 },
          { size: '500g', sku: 'SHAKAR-KESAR-500', price: 520 },
          { size: '1kg', sku: 'SHAKAR-KESAR-1000', price: 1000 }
        ]
      },
      {
        id: 'dalchini',
        name: 'Dalchini Shakarpara',
        sizes: [
          { size: '200g', sku: 'SHAKAR-DALCHINI-200', price: 170 },
          { size: '500g', sku: 'SHAKAR-DALCHINI-500', price: 400 },
          { size: '1kg', sku: 'SHAKAR-DALCHINI-1000', price: 760 }
        ]
      },
      {
        id: 'chocolate',
        name: 'Chocolate Shakarpara',
        sizes: [
          { size: '200g', sku: 'SHAKAR-CHOCO-200', price: 240 },
          { size: '500g', sku: 'SHAKAR-CHOCO-500', price: 560 },
          { size: '1kg', sku: 'SHAKAR-CHOCO-1000', price: 1080 }
        ]
      }
    ]
  },
  {
    id: 'gaja',
    name: 'Gaja',
    category: 'sweet',
    variants: [
      {
        id: 'authentic',
        name: 'Authentic GAJA',
        sizes: [
          { size: '200g', sku: 'GAJA-AUTH-200', price: 160 },
          { size: '500g', sku: 'GAJA-AUTH-500', price: 380 },
          { size: '1kg', sku: 'GAJA-AUTH-1000', price: 720 }
        ]
      },
      {
        id: 'mini',
        name: 'Mini Gaja',
        sizes: [
          { size: '200g', sku: 'GAJA-MINI-200', price: 140 },
          { size: '500g', sku: 'GAJA-MINI-500', price: 330 },
          { size: '1kg', sku: 'GAJA-MINI-1000', price: 620 }
        ]
      }
    ]
  },
  {
    id: 'anarsa',
    name: 'Anarsa',
    category: 'sweet',
    variants: [
      {
        id: 'big',
        name: 'Authentic Big Anarsa',
        sizes: [
          { size: '200g', sku: 'ANARSA-BIG-200', price: 180 },
          { size: '500g', sku: 'ANARSA-BIG-500', price: 420 },
          { size: '1kg', sku: 'ANARSA-BIG-1000', price: 800 }
        ]
      },
      {
        id: 'mini',
        name: 'Anarsa Mini Balls',
        sizes: [
          { size: '200g', sku: 'ANARSA-MINI-200', price: 160 },
          { size: '500g', sku: 'ANARSA-MINI-500', price: 380 },
          { size: '1kg', sku: 'ANARSA-MINI-1000', price: 720 }
        ]
      }
    ]
  },
  {
    id: 'khaja',
    name: 'Khaja',
    category: 'sweet',
    variants: [
      {
        id: 'regular',
        name: 'Khaja',
        sizes: [
          { size: '200g', sku: 'KHAJA-REG-200', price: 150 },
          { size: '500g', sku: 'KHAJA-REG-500', price: 350 },
          { size: '1kg', sku: 'KHAJA-REG-1000', price: 660 }
        ]
      },
      {
        id: 'mini',
        name: 'Khaja Mini',
        sizes: [
          { size: '200g', sku: 'KHAJA-MINI-200', price: 130 },
          { size: '500g', sku: 'KHAJA-MINI-500', price: 300 },
          { size: '1kg', sku: 'KHAJA-MINI-1000', price: 580 }
        ]
      }
    ]
  },
  {
    id: 'lai',
    name: 'Lai',
    category: 'sweet',
    variants: [
      {
        id: 'rajgira',
        name: 'Rajgira Lai (sweet)',
        sizes: [
          { size: '200g', sku: 'LAI-RAJGIRA-200', price: 120 },
          { size: '500g', sku: 'LAI-RAJGIRA-500', price: 280 },
          { size: '1kg', sku: 'LAI-RAJGIRA-1000', price: 520 }
        ]
      }
    ]
  },
  // NAMKEEN
  {
    id: 'namakpara',
    name: 'Namakpara',
    category: 'namkeen',
    variants: [
      {
        id: 'classic',
        name: 'Namakpara',
        sizes: [
          { size: '200g', sku: 'NAMAK-CLASSIC-200', price: 80 },
          { size: '500g', sku: 'NAMAK-CLASSIC-500', price: 190 },
          { size: '1kg', sku: 'NAMAK-CLASSIC-1000', price: 360 }
        ]
      }
    ]
  },
  {
    id: 'dalmoth',
    name: 'Dalmoth',
    category: 'namkeen',
    variants: [
      {
        id: 'masoor',
        name: 'Dalmoth Masoor',
        sizes: [
          { size: '200g', sku: 'DALMOTH-MASOOR-200', price: 90 },
          { size: '500g', sku: 'DALMOTH-MASOOR-500', price: 210 },
          { size: '1kg', sku: 'DALMOTH-MASOOR-1000', price: 400 }
        ]
      },
      {
        id: 'moong',
        name: 'Dalmoth Moong',
        sizes: [
          { size: '200g', sku: 'DALMOTH-MOONG-200', price: 95 },
          { size: '500g', sku: 'DALMOTH-MOONG-500', price: 220 },
          { size: '1kg', sku: 'DALMOTH-MOONG-1000', price: 420 }
        ]
      }
    ]
  },
  {
    id: 'chanachur',
    name: 'Chanachur',
    category: 'namkeen',
    variants: [
      {
        id: 'roasted',
        name: 'Roasted',
        sizes: [
          { size: '200g', sku: 'CHANACHUR-ROASTED-200', price: 85 },
          { size: '500g', sku: 'CHANACHUR-ROASTED-500', price: 200 },
          { size: '1kg', sku: 'CHANACHUR-ROASTED-1000', price: 380 }
        ]
      }
    ]
  },
  {
    id: 'healthy-mixture',
    name: 'Healthy Mixture',
    category: 'namkeen',
    variants: [
      {
        id: 'millet',
        name: 'Millet Roasted (Rajgira, etc.)',
        sizes: [
          { size: '200g', sku: 'HEALTHY-MILLET-200', price: 100 },
          { size: '500g', sku: 'HEALTHY-MILLET-500', price: 240 },
          { size: '1kg', sku: 'HEALTHY-MILLET-1000', price: 460 }
        ]
      }
    ]
  }
];

// Context for cart management
export const CartContext = React.createContext<{
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (index: number, qty: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  subtotal: number;
  delivery: number;
  grandTotal: number;
}>({
  cart: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  subtotal: 0,
  delivery: 0,
  grandTotal: 0
});

// Cart Provider
const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        cartItem => 
          cartItem.productId === item.productId && 
          cartItem.variant === item.variant && 
          cartItem.size === item.size
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].qty += item.qty;
        updated[existingIndex].lineTotal = updated[existingIndex].qty * updated[existingIndex].unitPrice;
        return updated;
      } else {
        return [...prev, item];
      }
    });
  };

  const updateQuantity = (index: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(index);
      return;
    }
    
    setCart(prev => {
      const updated = [...prev];
      updated[index].qty = qty;
      updated[index].lineTotal = qty * updated[index].unitPrice;
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const delivery = subtotal >= 1000 ? 0 : 100;
  const grandTotal = subtotal + delivery;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      delivery,
      grandTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Product Card Component
const ProductCard: React.FC<{ product: Product; variant: ProductVariant }> = ({ product, variant }) => {
  const { addToCart } = React.useContext(CartContext);
  const [selectedSize, setSelectedSize] = useState<'200g' | '500g' | '1kg'>('200g');
  const [quantity, setQuantity] = useState(1);

  const selectedSizeData = variant.sizes.find(s => s.size === selectedSize);

  const handleAddToCart = () => {
    if (!selectedSizeData) return;
    
    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      variant: variant.name,
      size: selectedSize,
      sku: selectedSizeData.sku,
      unitPrice: selectedSizeData.price,
      qty: quantity,
      lineTotal: selectedSizeData.price * quantity
    };

    addToCart(cartItem);
    setQuantity(1);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {product.category === 'sweet' ? '🍯' : '🥨'}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-variant">{variant.name}</p>
        
        <div className="product-controls">
          <div className="form-group">
            <label className="form-label">Size & Price</label>
            <select 
              className="form-control form-select"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value as '200g' | '500g' | '1kg')}
            >
              {variant.sizes.map(size => (
                <option key={size.size} value={size.size}>
                  {size.size} - ₹{size.price}
                </option>
              ))}
            </select>
          </div>

          {selectedSizeData && (
            <div className="size-price-row">
              <span>SKU: {selectedSizeData.sku}</span>
            </div>
          )}

          <div className="quantity-controls">
            <button 
              className="quantity-btn"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <input 
              type="number" 
              className="quantity-input"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
            <button 
              className="quantity-btn"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>

          <button 
            className="btn btn-primary btn-sm w-full"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// Cart Component - Updated for right sidebar
const Cart: React.FC<{ isOpen: boolean; onClose: () => void; onCheckout: () => void; isFixed?: boolean }> = ({ 
  isOpen, 
  onClose, 
  onCheckout,
  isFixed = true
}) => {
  const { cart, updateQuantity, removeFromCart, subtotal, delivery, grandTotal } = React.useContext(CartContext);

  const cartClass = isFixed 
    ? `cart-drawer ${isOpen ? 'open' : ''}` 
    : 'cart-sidebar';

  return (
    <>
      {isFixed && isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>}
      <div className={cartClass}>
        <div className="cart-header">
          <h2 className="cart-title">🛒 Your Cart ({cart.length})</h2>
          {isFixed && <button onClick={onClose} className="btn btn-secondary btn-sm">×</button>}
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <p>Your cart is empty</p>
              <p className="empty-cart-subtitle">Add some delicious items to get started!</p>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="cart-item-header">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.productName}</div>
                      <div className="cart-item-details">{item.variant}</div>
                      <div className="cart-item-size">{item.size} • SKU: {item.sku}</div>
                    </div>
                    <div className="cart-item-price">₹{item.lineTotal}</div>
                  </div>
                  
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn"
                        onClick={() => updateQuantity(index, item.qty - 1)}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.qty}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => updateQuantity(index, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(index)}
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Delivery:</span>
                <span className={delivery === 0 ? 'free-delivery' : ''}>
                  {delivery === 0 ? 'FREE' : `₹${delivery}`}
                </span>
              </div>
              <div className="summary-row total-row">
                <span>Total:</span>
                <span>₹{grandTotal}</span>
              </div>
              {subtotal < 1000 && (
                <div className="delivery-notice">
                  <small>Add ₹{1000 - subtotal} more for FREE delivery! 🚚</small>
                </div>
              )}
            </div>
            <button 
              className="checkout-btn"
              onClick={onCheckout}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Main POS Component with Hierarchical Product Selection
const POS: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'sweet' | 'namkeen'>('sweet');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const { cart } = React.useContext(CartContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get products for selected category
  const categoryProducts = PRODUCTS.filter(product => product.category === selectedCategory);
  
  // Get current product object
  const currentProduct = PRODUCTS.find(p => p.id === selectedProduct);
  
  // Get current variant object
  const currentVariant = currentProduct?.variants.find(v => v.id === selectedVariant);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  // Reset selections when category changes
  const handleCategoryChange = (category: 'sweet' | 'namkeen') => {
    setSelectedCategory(category);
    setSelectedProduct('');
    setSelectedVariant('');
  };

  // Reset variant when product changes
  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    setSelectedVariant('');
  };

  return (
    <div className="pos-container">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <h2>🌸 Mr Champaran — Mahila Uday Bazaar 🌸</h2>
        <p>Empowering Women Entrepreneurs of Bihar</p>
      </div>

      <div className="pos-layout">
        {/* Left Side - Product Selection */}
        <div className="pos-main">
          {/* Navigation for mobile */}
          {isMobile && (selectedProduct || selectedVariant) && (
            <div className="selection-nav">
              <div className="nav-breadcrumb">
                <span>Category: {selectedCategory === 'sweet' ? 'Sweets' : 'Namkeen'}</span>
                {selectedProduct && (
                  <>
                    <span className="separator">→</span>
                    <span>{currentProduct?.name}</span>
                  </>
                )}
                {selectedVariant && (
                  <>
                    <span className="separator">→</span>
                    <span>{currentVariant?.name}</span>
                  </>
                )}
              </div>
              <div className="nav-actions">
                <button 
                  className="back-btn"
                  onClick={() => {
                    if (selectedVariant) setSelectedVariant('');
                    else if (selectedProduct) setSelectedProduct('');
                    else setSelectedCategory(selectedCategory === 'sweet' ? 'namkeen' : 'sweet');
                  }}
                >
                  ← Back
                </button>
                <button 
                  className="cart-toggle-btn"
                  onClick={() => setIsCartOpen(true)}
                >
                  🛒 Cart
                  {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Category Selection */}
          <div className="selection-step">
            <h3 className="step-title">1. Select Category</h3>
            <div className="category-grid">
              <button 
                className={`category-button ${selectedCategory === 'sweet' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('sweet')}
              >
                <div className="icon">🍯</div>
                <div className="label">Sweets</div>
                <div className="count">{PRODUCTS.filter(p => p.category === 'sweet').length} items</div>
              </button>
              <button 
                className={`category-button ${selectedCategory === 'namkeen' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('namkeen')}
              >
                <div className="icon">🥨</div>
                <div className="label">Namkeen</div>
                <div className="count">{PRODUCTS.filter(p => p.category === 'namkeen').length} items</div>
              </button>
            </div>
          </div>

          {/* Step 2: Product Selection */}
          {selectedCategory && (
            <div className="selection-step">
              <h3 className="step-title">2. Select Product</h3>
              <div className="product-type-grid">
                {categoryProducts.map(product => (
                  <button
                    key={product.id}
                    className={`product-type-button ${selectedProduct === product.id ? 'active' : ''}`}
                    onClick={() => handleProductChange(product.id)}
                  >
                    <div className="icon">{selectedCategory === 'sweet' ? '🟤' : '🥜'}</div>
                    <div className="name">{product.name}</div>
                    <div className="description">{product.description || 'Traditional delicacy'}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Variant Selection */}
          {currentProduct && (
            <div className="selection-step">
              <h3 className="step-title">3. Select Variant</h3>
              <div className="variant-grid">
                {currentProduct.variants.map(variant => (
                  <div
                    key={variant.id}
                    className={`variant-card ${selectedVariant === variant.id ? 'selected' : ''}`}
                    onClick={() => setSelectedVariant(variant.id)}
                  >
                    <div className="variant-info">
                      <div className="variant-name">{variant.name}</div>
                      <div className="variant-details">{variant.description || currentProduct.description}</div>
                      <div className="variant-price">₹{variant.sizes[0]?.price || 'N/A'}</div>
                    </div>
                    
                    {selectedVariant === variant.id && (
                      <ProductCard 
                        product={currentProduct} 
                        variant={variant}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Cart (Desktop) */}
        <div className="pos-sidebar">
          <Cart 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            onCheckout={handleCheckout}
            isFixed={isMobile}
          />
        </div>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation: React.FC = () => {
  const location = useLocation();
  const { cart } = React.useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Top Header - Mobile Optimized */}
      <header className="top-header">
        <div className="container">
          <h1 className="app-title">Mr Champaran — Mahila Uday Bazaar</h1>
          <div className="header-actions">
            <button 
              className="cart-trigger"
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          <ShoppingCart size={24} />
          <span>Shop</span>
        </Link>
        <div className="cart-indicator" onClick={() => setIsCartOpen(!isCartOpen)}>
          <ShoppingBag size={24} />
          <span>Cart</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>
        <Link to="/orders" className={location.pathname === '/orders' ? 'active' : ''}>
          <ClipboardList size={24} />
          <span>Orders</span>
        </Link>
      </nav>

      {/* Cart Component */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={handleCheckout}
      />
    </>
  );
};

// Main App Component
function App() {
  return (
    <CartProvider>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<POS />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/invoice/:orderNumber" element={<InvoicePage />} />
            <Route path="/admin/images" element={<ImageRecoveryAdmin />} />
          </Routes>
        </main>
        <SpeedInsights />
      </div>
    </CartProvider>
  );
}

export default App;
