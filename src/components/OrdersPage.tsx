import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { type Order } from '../App';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  
  // Get orders from localStorage
  const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tlName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.pincode.includes(searchTerm);
    
    // For now, all orders are completed since we don't have status tracking
    const matchesFilter = filterStatus === 'all' || filterStatus === 'completed';
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="pos-container">
      <div className="orders-header">
        <h1 className="page-title">Orders</h1>
        <span className="orders-count">
          {filteredOrders.length} order(s) found
        </span>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by order number, customer name, pincode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-section">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed')}
            className="filter-select"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders found</h3>
          <p>
            {searchTerm ? 'Try adjusting your search criteria.' : 'No orders have been placed yet.'}
          </p>
          {!searchTerm && (
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Start Taking Orders
            </button>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.orderNumber} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3 className="order-number">{order.orderNumber}</h3>
                  <p className="order-date">
                    {format(new Date(order.timestamp), 'MMM dd, yyyy • HH:mm')}
                  </p>
                </div>
                <div className="order-total">
                  <span className="total-amount">₹{order.grandTotal}</span>
                  <span className="total-breakdown">
                    Sub: ₹{order.subtotal} + Del: {order.delivery === 0 ? 'Free' : `₹${order.delivery}`}
                  </span>
                </div>
              </div>
              
              <div className="order-details">
                <div className="customer-info">
                  <p className="customer-name">{order.customerName}</p>
                  <p className="customer-address">{order.address}</p>
                  <p className="customer-contact">📍 {order.pincode} • 📞 {order.contact}</p>
                </div>
                
                <div className="team-info">
                  <p>TL: {order.tlName}</p>
                  <p>Member: {order.memberName}</p>
                  <p>{order.items.length} item(s)</p>
                </div>
              </div>
              
              {/* Order Items Summary */}
              <div className="order-items">
                <div className="items-grid">
                  {order.items.map((item, index) => (
                    <div key={index} className="item-tag">
                      {item.productName} ({item.variant}) - {item.size} x{item.qty}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="order-actions">
                <button
                  onClick={() => navigate(`/invoice/${order.orderNumber}`)}
                  className="btn btn-primary"
                >
                  <Eye size={18} />
                  View Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
