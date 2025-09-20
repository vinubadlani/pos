import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Printer } from 'lucide-react';
import { type Order } from '../App';

const InvoicePage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  
  // Get order from localStorage
  const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
  const order = orders.find(o => o.orderNumber === orderNumber);

  if (!order) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body text-center">
            <h2>Order not found</h2>
            <p>The order with number {orderNumber} could not be found.</p>
            <button onClick={() => navigate('/orders')} className="btn btn-primary">
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container">
      {/* Print Controls - Hidden on print */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button onClick={() => navigate('/orders')} className="btn btn-secondary">
          <ArrowLeft size={20} />
          Back to Orders
        </button>
        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={20} />
          Print Invoice
        </button>
      </div>

      {/* Invoice */}
      <div className="invoice">
        {/* Header */}
        <div className="invoice-header">
          <h1 className="invoice-title">Mr Champaran — Mahila Uday Bazaar</h1>
          <p className="invoice-subtitle">Authentic Bihari Sweets & Namkeen</p>
          <p className="invoice-mission">🌸 Enlightening & Empowering Entrepreneurship for Women of Bihar 🌸</p>
        </div>

        {/* Invoice Details */}
        <div className="invoice-details">
          <div className="invoice-section">
            <h3>Order Information</h3>
            <p><strong>Order Number:</strong> {order.orderNumber}</p>
            <p><strong>Date & Time:</strong> {format(new Date(order.timestamp), 'MMM dd, yyyy • HH:mm:ss')}</p>
            <p><strong>TL Name:</strong> {order.tlName}</p>
            <p><strong>Member Name:</strong> {order.memberName}</p>
          </div>

          <div className="invoice-section">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> {order.customerName}</p>
            <p><strong>Address:</strong> {order.address}</p>
            <p><strong>Pincode:</strong> {order.pincode}</p>
            <p><strong>Contact:</strong> {order.contact}</p>
          </div>
        </div>

        {/* Items Table */}
        <h3>Order Items</h3>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Variant</th>
              <th>Size</th>
              <th>SKU</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Unit Price</th>
              <th className="text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td>{item.productName}</td>
                <td>{item.variant}</td>
                <td>{item.size}</td>
                <td>{item.sku}</td>
                <td className="text-right">{item.qty}</td>
                <td className="text-right">₹{item.unitPrice}</td>
                <td className="text-right">₹{item.lineTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="invoice-summary">
          <table>
            <tbody>
              <tr>
                <td>Subtotal:</td>
                <td className="text-right">₹{order.subtotal}</td>
              </tr>
              {order.discount > 0 && (
                <tr className="discount-row">
                  <td>Discount ({order.subtotal >= 2000 ? '15' : order.subtotal >= 1000 ? '10' : '5'}%):</td>
                  <td className="text-right discount-amount">-₹{order.discount}</td>
                </tr>
              )}
              <tr>
                <td>Delivery Fee:</td>
                <td className="text-right">{order.delivery === 0 ? 'Free' : `₹${order.delivery}`}</td>
              </tr>
              <tr className="total-row">
                <td>Grand Total:</td>
                <td className="text-right">₹{order.grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Screenshot */}
        {order.paymentScreenshotUrl && (
          <div style={{ marginTop: '20px' }}>
            <h3>Payment Screenshot</h3>
            <img 
              src={order.paymentScreenshotUrl} 
              alt="Payment screenshot" 
              className="payment-screenshot"
            />
          </div>
        )}

        {/* Order Note */}
        {order.orderNote && (
          <div style={{ marginTop: '20px' }}>
            <h3>Order Note</h3>
            <p>{order.orderNote}</p>
          </div>
        )}

        {/* Shipping Disclaimer */}
        <div className="disclaimer-section" style={{ marginTop: '24px' }}>
          <div className="disclaimer-box">
            <p className="disclaimer-text">
              <strong>📦 Shipping Information:</strong><br />
              Your product will be shipped to you within 24 to 48 working hours. 
              Tracking ID will be shared with you soon after dispatch.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p>This purchase supports women entrepreneurs in Bihar.</p>
          <p>Thank you for choosing Mr Champaran — Mahila Uday Bazaar!</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
