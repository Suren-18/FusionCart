import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';

const Cart = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getUserOrders({ limit: 20 });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return '#f59e0b';
      case 'shipped':
        return '#3b82f6';
      case 'delivered':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <h1 style={{ marginBottom: '30px' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div style={{ background: '#fff', padding: '60px', textAlign: 'center', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2>No orders yet</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>Start shopping to see your orders here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <div className="flex-between mb-20">
                <div>
                  <h3 style={{ marginBottom: '5px' }}>Order #{order._id.slice(-8)}</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    ${order.totalAmount?.toFixed(2)}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '500',
                      background: getStatusColor(order.deliveryStatus) + '20',
                      color: getStatusColor(order.deliveryStatus),
                      marginTop: '5px'
                    }}
                  >
                    {order.deliveryStatus}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <h4 style={{ marginBottom: '15px' }}>Items:</h4>
                {order.products.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: index < order.products.length - 1 ? '1px solid #f5f5f5' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '500' }}>{item.productName}</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Quantity: {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600' }}>${item.price?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cart;