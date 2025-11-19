import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = ({ onManageProducts }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="error">
        {error}
        <button onClick={fetchAnalytics} className="btn btn-primary" style={{ marginTop: '10px' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return <div className="error">No analytics data available</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={onManageProducts} className="btn btn-primary">
          Manage Products
        </button>
      </div>

      {/* Overview Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{analytics.overview.totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{analytics.overview.totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{analytics.overview.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatCurrency(analytics.overview.totalRevenue)}</div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Top Selling Products</h2>
          <button
            onClick={() => exportToCSV(analytics.topSellingProducts, 'top-selling-products.csv')}
            className="btn btn-secondary"
          >
            Export CSV
          </button>
        </div>
        {analytics.topSellingProducts.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Quantity Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topSellingProducts.map((item) => (
                <tr key={item._id}>
                  <td>{item.productName || 'N/A'}</td>
                  <td>{item.category || 'N/A'}</td>
                  <td>{item.brand || 'N/A'}</td>
                  <td>{item.totalQuantity}</td>
                  <td>{formatCurrency(item.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No sales data available yet
          </p>
        )}
      </div>

      {/* Category Statistics */}
      <div className="admin-section">
        <h2>Category Statistics</h2>
        {analytics.categoryStats.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th>Avg Price</th>
                <th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {analytics.categoryStats.map((cat) => (
                <tr key={cat._id}>
                  <td>{cat._id}</td>
                  <td>{cat.count}</td>
                  <td>{formatCurrency(cat.avgPrice)}</td>
                  <td>⭐ {cat.avgRating.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No category data available
          </p>
        )}
      </div>

      {/* Low Stock Alert */}
      <div className="admin-section">
        <h2>Low Stock Alert</h2>
        {analytics.lowStockProducts.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {analytics.lowStockProducts.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td style={{ 
                    color: product.stock === 0 ? '#d32f2f' : '#ff9800',
                    fontWeight: '600'
                  }}>
                    {product.stock}
                  </td>
                  <td>{product.category}</td>
                  <td>{formatCurrency(product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#4caf50', padding: '20px' }}>
            ✓ All products have sufficient stock
          </p>
        )}
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <h2>Recent Orders</h2>
        {analytics.recentOrders.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.substring(0, 8)}...</td>
                  <td>{order.userId?.username || order.userId?.email || 'N/A'}</td>
                  <td>{order.items.length}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: order.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                      color: order.status === 'completed' ? '#2e7d32' : '#f57c00'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No orders yet
          </p>
        )}
      </div>

      <button 
        onClick={fetchAnalytics} 
        className="btn btn-secondary"
        style={{ marginTop: '20px', width: '100%' }}
      >
        Refresh Analytics
      </button>
    </div>
  );
};

export default AdminDashboard;