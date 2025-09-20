import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Printer, Upload, X, Menu, Home, Package, Users, FileText, Settings, Heart } from 'lucide-react';

const MrChamparanPOS = () => {
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sample product data - organized by category with variants
  const productData = {
    'Sweets': {
      'Thekua': {
        variants: ['Shahi Thekua', 'Suji Maida Thekua', 'Shudh Desi Ghee Thekua'],
        image: '🍪',
        basePrices: { '200g': 120, '500g': 280, '1kg': 520 }
      },
      'Gaja': {
        variants: ['Authentic GAJA', 'Special GAJA'],
        image: '🥮',
        basePrices: { '200g': 100, '500g': 240, '1kg': 450 }
      },
      'Kheer': {
        variants: ['Traditional Kheer', 'Dry Kheer'],
        image: '🍮',
        basePrices: { '200g': 150, '500g': 350, '1kg': 650 }
      },
      'Pedha': {
        variants: ['Milk Pedha', 'Khoya Pedha'],
        image: '🧀',
        basePrices: { '200g': 180, '500g': 420, '1kg': 780 }
      }
    },
    'Namkeen': {
      'Namakpara': {
        variants: ['Classic Namakpara', 'Spicy Namakpara'],
        image: '🥨',
        basePrices: { '200g': 80, '500g': 190, '1kg': 350 }
      },
      'Bhujia': {
        variants: ['Aloo Bhujia', 'Moong Dal Bhujia'],
        image: '🍜',
        basePrices: { '200g': 90, '500g': 210, '1kg': 380 }
      },
      'Chana Chur': {
        variants: ['Regular Chana Chur', 'Masala Chana Chur'],
        image: '🥜',
        basePrices: { '200g': 70, '500g': 160, '1kg': 290 }
      },
      'Mixture': {
        variants: ['Bengali Mixture', 'South Indian Mixture'],
        image: '🥗',
        basePrices: { '200g': 85, '500g': 200, '1kg': 370 }
      }
    }
  };

  // Form state
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    address: '',
    pincode: '',
    contact: '',
    tlName: '',
    memberName: '',
    paymentMethod: 'Cash',
    paymentScreenshot: null,
    orderNote: ''
  });

  // Generate order number
  const generateOrderNumber = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 15);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MC-${timestamp}-${random}`;
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
    const deliveryFee = subtotal >= 1000 ? 0 : 100;
    const grandTotal = subtotal + deliveryFee;
    return { subtotal, deliveryFee, grandTotal };
  };

  // Add to cart
  const addToCart = (category, productName, variant, size, unitPrice) => {
    const sku = `${productName.toUpperCase().replace(/\s/g, '')}-${variant.split(' ')[0].toUpperCase()}-${size.replace('g', '')}`;
    
    const existingIndex = cart.findIndex(item => 
      item.productName === productName && 
      item.variant === variant && 
      item.size === size
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].qty += 1;
      newCart[existingIndex].lineTotal = newCart[existingIndex].qty * newCart[existingIndex].unitPrice;
      setCart(newCart);
    } else {
      const newItem = {
        id: Date.now(),
        category,
        productName,
        variant,
        size,
        sku,
        unitPrice,
        qty: 1,
        lineTotal: unitPrice
      };
      setCart([...cart, newItem]);
    }
  };

  // Update cart quantity
  const updateCartQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => 
        item.id === id 
          ? { ...item, qty: newQty, lineTotal: newQty * item.unitPrice }
          : item
      ));
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOrderForm(prev => ({ ...prev, paymentScreenshot: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit order to Google Sheets
  const submitOrder = async () => {
    setIsSubmitting(true);
    const { subtotal, deliveryFee, grandTotal } = calculateTotals();
    const orderNumber = generateOrderNumber();
    
    try {
      // Prepare data for Google Sheets - one row per item
      const sheetData = cart.map(item => ({
        orderNumber,
        dateTime: new Date().toISOString(),
        customerName: orderForm.customerName,
        customerPrice: grandTotal, // This might be confusing - using grandTotal
        customerAddress: orderForm.address,
        pincode: orderForm.pincode,
        tlName: orderForm.tlName,
        memberName: orderForm.memberName,
        productName: item.productName,
        productVariant: item.variant,
        size: item.size,
        sku: item.sku,
        quantity: item.qty,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        subtotal,
        deliveryFee,
        grandTotal,
        paymentMethod: orderForm.paymentMethod,
        paymentScreenshot: orderForm.paymentScreenshot ? 'Uploaded' : 'Not provided',
        orderStatus: 'Confirmed'
      }));

      // This would be your actual Google Apps Script URL
      // const GAS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
      
      // For demo purposes, we'll simulate success
      console.log('Order data to be sent to Google Sheets:', sheetData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderData = {
        orderNumber,
        ...orderForm,
        items: cart,
        ...calculateTotals(),
        timestamp: new Date().toISOString()
      };

      setLastOrder(orderData);
      setShowInvoice(true);
      setCart([]);
      setOrderForm({
        customerName: '',
        address: '',
        pincode: '',
        contact: '',
        tlName: '',
        memberName: '',
        paymentMethod: 'Cash',
        paymentScreenshot: null,
        orderNote: ''
      });
      setShowCheckout(false);
      
      alert('Order submitted successfully!');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print invoice
  const printInvoice = () => {
    window.print();
  };

  const ProductGrid = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-orange-800">Select Products</h2>
      {Object.entries(productData).map(([category, products]) => (
        <div key={category} className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-xl font-semibold mb-4 text-orange-700 border-b pb-2">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(products).map(([productName, productInfo]) => (
              <div key={productName} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{productInfo.image}</div>
                  <h4 className="font-semibold text-gray-800">{productName}</h4>
                </div>
                
                {productInfo.variants.map(variant => (
                  <div key={variant} className="mb-4 p-3 bg-gray-50 rounded">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">{variant}</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(productInfo.basePrices).map(([size, price]) => {
                        const sku = `${productName.toUpperCase().replace(/\s/g, '')}-${variant.split(' ')[0].toUpperCase()}-${size.replace('g', '')}`;
                        return (
                          <div key={size} className="text-center">
                            <div className="text-xs text-gray-600">{size}</div>
                            <div className="text-sm font-semibold">₹{price}</div>
                            <div className="text-xs text-gray-500 mb-2">{sku}</div>
                            <button
                              onClick={() => addToCart(category, productName, variant, size, price)}
                              className="w-full bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600 transition-colors"
                            >
                              <Plus className="w-3 h-3 inline mr-1" />
                              Add
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const CartSummary = () => {
    const { subtotal, deliveryFee, grandTotal } = calculateTotals();
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Cart ({cart.length} items)
        </h3>
        
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.productName}</div>
                    <div className="text-xs text-gray-600">{item.variant}</div>
                    <div className="text-xs text-gray-500">{item.size} • {item.sku}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQty(item.id, item.qty - 1)}
                      className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.id, item.qty + 1)}
                      className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-semibold">₹{item.lineTotal}</div>
                    <div className="text-xs text-gray-500">₹{item.unitPrice} each</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Grand Total:</span>
                <span>₹{grandTotal}</span>
              </div>
              {subtotal >= 1000 && (
                <div className="text-green-600 text-sm text-center">
                  🎉 Free delivery applied!
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 hover:bg-orange-600 transition-colors"
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    );
  };

  const CheckoutForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Checkout</h2>
            <button
              onClick={() => setShowCheckout(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Customer Name *"
                value={orderForm.customerName}
                onChange={(e) => setOrderForm(prev => ({...prev, customerName: e.target.value}))}
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="tel"
                placeholder="Contact Number *"
                value={orderForm.contact}
                onChange={(e) => setOrderForm(prev => ({...prev, contact: e.target.value}))}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <textarea
              placeholder="Address *"
              value={orderForm.address}
              onChange={(e) => setOrderForm(prev => ({...prev, address: e.target.value}))}
              className="w-full p-3 border rounded-lg h-24"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Pincode *"
                value={orderForm.pincode}
                onChange={(e) => setOrderForm(prev => ({...prev, pincode: e.target.value}))}
                className="w-full p-3 border rounded-lg"
                maxLength="6"
                pattern="[0-9]{6}"
                required
              />
              <input
                type="text"
                placeholder="TL Name *"
                value={orderForm.tlName}
                onChange={(e) => setOrderForm(prev => ({...prev, tlName: e.target.value}))}
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Member Name *"
                value={orderForm.memberName}
                onChange={(e) => setOrderForm(prev => ({...prev, memberName: e.target.value}))}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={orderForm.paymentMethod}
                onChange={(e) => setOrderForm(prev => ({...prev, paymentMethod: e.target.value}))}
                className="w-full p-3 border rounded-lg"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Online Banking">Online Banking</option>
              </select>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="payment-screenshot"
                />
                <label
                  htmlFor="payment-screenshot"
                  className="w-full p-3 border rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Payment Screenshot
                </label>
              </div>
            </div>

            {orderForm.paymentScreenshot && (
              <div className="text-center">
                <img
                  src={orderForm.paymentScreenshot}
                  alt="Payment Screenshot"
                  className="max-w-48 max-h-32 mx-auto rounded border"
                />
              </div>
            )}

            <textarea
              placeholder="Order Notes (Optional)"
              value={orderForm.orderNote}
              onChange={(e) => setOrderForm(prev => ({...prev, orderNote: e.target.value}))}
              className="w-full p-3 border rounded-lg h-20"
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Items:</span>
                <span>{cart.length}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>₹{calculateTotals().subtotal}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery:</span>
                <span>{calculateTotals().deliveryFee === 0 ? 'Free' : `₹${calculateTotals().deliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Grand Total:</span>
                <span>₹{calculateTotals().grandTotal}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Cart
              </button>
              <button
                onClick={submitOrder}
                disabled={!orderForm.customerName || !orderForm.address || !orderForm.pincode || !orderForm.contact || !orderForm.tlName || !orderForm.memberName || cart.length === 0 || isSubmitting}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Invoice = () => {
    if (!lastOrder) return null;

    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto print:relative print:inset-auto">
        <div className="max-w-2xl mx-auto p-6 print:p-4">
          <div className="flex justify-between items-center mb-6 print:hidden">
            <h2 className="text-2xl font-semibold">Invoice</h2>
            <div className="space-x-2">
              <button
                onClick={printInvoice}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                <Printer className="w-4 h-4 inline mr-2" />
                Print
              </button>
              <button
                onClick={() => setShowInvoice(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="bg-white border print:border-0 print:shadow-none shadow-lg rounded-lg print:rounded-none p-6 print:p-4">
            {/* Header */}
            <div className="text-center mb-6 border-b pb-4">
              <h1 className="text-2xl font-bold text-orange-700">Mr Champaran</h1>
              <p className="text-lg text-orange-600">Mahila Uday Bazaar</p>
              <p className="text-sm text-gray-600 mt-2">🌸 Enlightening & Empowering Entrepreneurship for Women of Bihar 🌸</p>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-semibold">Order Number: {lastOrder.orderNumber}</p>
                <p>Date: {new Date(lastOrder.timestamp).toLocaleDateString()}</p>
                <p>Time: {new Date(lastOrder.timestamp).toLocaleTimeString()}</p>
              </div>
              <div>
                <p><strong>TL:</strong> {lastOrder.tlName}</p>
                <p><strong>Member:</strong> {lastOrder.memberName}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Customer Details</h3>
              <p><strong>Name:</strong> {lastOrder.customerName}</p>
              <p><strong>Address:</strong> {lastOrder.address}</p>
              <p><strong>Pincode:</strong> {lastOrder.pincode}</p>
              <p><strong>Contact:</strong> {lastOrder.contact}</p>
            </div>

            {/* Items Table */}
            <table className="w-full mb-6 border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left text-xs">Item</th>
                  <th className="border p-2 text-left text-xs">Variant</th>
                  <th className="border p-2 text-center text-xs">Size</th>
                  <th className="border p-2 text-center text-xs">SKU</th>
                  <th className="border p-2 text-center text-xs">Qty</th>
                  <th className="border p-2 text-right text-xs">Rate</th>
                  <th className="border p-2 text-right text-xs">Total</th>
                </tr>
              </thead>
              <tbody>
                {lastOrder.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2 text-xs">{item.productName}</td>
                    <td className="border p-2 text-xs">{item.variant}</td>
                    <td className="border p-2 text-center text-xs">{item.size}</td>
                    <td className="border p-2 text-center text-xs">{item.sku}</td>
                    <td className="border p-2 text-center text-xs">{item.qty}</td>
                    <td className="border p-2 text-right text-xs">₹{item.unitPrice}</td>
                    <td className="border p-2 text-right text-xs">₹{item.lineTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b">
                  <span>Subtotal:</span>
                  <span>₹{lastOrder.subtotal}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Delivery:</span>
                  <span>{lastOrder.deliveryFee === 0 ? 'Free' : `₹${lastOrder.deliveryFee}`}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg">
                  <span>Grand Total:</span>
                  <span>₹{lastOrder.grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mb-6">
              <p><strong>Payment Method:</strong> {lastOrder.paymentMethod}</p>
              {lastOrder.paymentScreenshot && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Payment Screenshot:</p>
                  <img
                    src={lastOrder.paymentScreenshot}
                    alt="Payment Screenshot"
                    className="max-w-32 max-h-24 rounded border mt-1"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center border-t pt-4 text-sm text-gray-600">
              <p>This purchase supports women entrepreneurs in Bihar.</p>
              <p className="mt-2">Thank you for your order! 🙏</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Navigation = () => (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-40 bg-orange-500 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 h-full w-64 bg-orange-600 text-white transform transition-transform duration-300 z-30 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold">Mr Champaran</h1>
            <p className="text-sm opacity-90">Mahila Uday Bazaar</p>
            <p className="text-xs mt-2 opacity-80">🌸 Empowering Women of Bihar 🌸</p>
          </div>

          <ul className="space-y-2">
            <li>
              <button
                onClick={() => { setActiveTab('pos'); setMobileMenuOpen(false); }}
                className={`w-full text-left p-3 rounded flex items-center space-x-3 ${activeTab === 'pos' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>POS / Take Order</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full text-left p-3 rounded flex items-center space-x-3 ${activeTab === 'dashboard' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}
                className={`w-full text-left p-3 rounded flex items-center space-x-3 ${activeTab === 'products' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
              >
                <Package className="w-5 h-5" />
                <span>Products</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
                className={`w-full text-left p-3 rounded flex items-center space-x-3 ${activeTab === 'orders' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
              >
                <FileText className="w-5 h-5" />
                <span>Orders</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('customers'); setMobileMenuOpen(false); }}
                className={`w-full text-left p-3 rounded flex items-center space-x-3 ${activeTab === 'customers' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
              >
                <Users className="w-5 h-5" />
                <span>Customers</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                className={`w-full text-left p-3 rounded flex items-center space-x-3 ${activeTab === 'settings' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </li>
          </ul>

          {/* Quick Actions */}
          <div className="mt-8 pt-4 border-t border-orange-500">
            <p className="text-sm font-medium mb-3">Quick Actions</p>
            <button
              onClick={() => { setActiveTab('pos'); setMobileMenuOpen(false); }}
              className="w-full bg-orange-700 hover:bg-orange-800 p-2 rounded text-sm mb-2"
            >
              New Order
            </button>
            {lastOrder && (
              <button
                onClick={() => setShowInvoice(true)}
                className="w-full bg-orange-700 hover:bg-orange-800 p-2 rounded text-sm flex items-center justify-center"
              >
                <Printer className="w-4 h-4 mr-1" />
                Print Last Invoice
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );

  const DashboardContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-orange-800">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full">
              <ShoppingCart className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Orders</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹8,540</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-2xl font-bold text-gray-900">16</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Order #</th>
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">MC-001</td>
                <td className="py-2">Ram Kumar</td>
                <td className="py-2">₹520</td>
                <td className="py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Confirmed</span></td>
              </tr>
              <tr className="border-b">
                <td className="py-2">MC-002</td>
                <td className="py-2">Sita Devi</td>
                <td className="py-2">₹1,200</td>
                <td className="py-2"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Processing</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'pos':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProductGrid />
            </div>
            <div>
              <CartSummary />
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-orange-800 mb-4">Products Management</h2>
            <p className="text-gray-600">Manage your sweets and namkeen inventory here.</p>
          </div>
        );
      case 'orders':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-orange-800 mb-4">Orders Management</h2>
            <p className="text-gray-600">View and manage all orders here.</p>
          </div>
        );
      case 'customers':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-orange-800 mb-4">Customers</h2>
            <p className="text-gray-600">Manage customer information here.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-orange-800 mb-4">Settings</h2>
            <p className="text-gray-600">Configure delivery rules, pricing, and other settings.</p>
          </div>
        );
      default:
        return <DashboardContent />;
    }
  };

  // Mobile menu overlay
  if (mobileMenuOpen) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
        <Navigation />
        <main className="md:ml-64 min-h-screen bg-gray-100 p-4 md:p-6">
          {renderContent()}
        </main>
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navigation />
      
      {/* Main Content */}
      <main className="md:ml-64 flex-1 p-4 md:p-6">
        {renderContent()}
      </main>

      {/* Modals */}
      {showCheckout && <CheckoutForm />}
      {showInvoice && <Invoice />}
    </div>
  );