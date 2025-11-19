import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching featured products...');
      
      const response = await api.get('/products?limit=12&sort=rating');
      console.log('📦 Response received:', response.data);
      
      // Handle both response formats
      const productsData = response.data.products || response.data || [];
      
      console.log(`✓ Found ${productsData.length} products`);
      setProducts(productsData);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load products');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
        <button onClick={fetchFeaturedProducts} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        background: '#000', 
        color: '#fff', 
        padding: '60px 20px', 
        textAlign: 'center',
        marginBottom: '40px',
        borderRadius: '8px'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Welcome to E-Store</h1>
        <p style={{ fontSize: '20px', marginBottom: '30px' }}>
          Discover amazing products at great prices
        </p>
        <button 
          onClick={() => navigate('/products')}
          className="btn btn-primary"
          style={{ 
            background: '#fff', 
            color: '#000', 
            fontSize: '18px',
            padding: '15px 40px'
          }}
        >
          Browse All Products
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '28px' }}>Featured Products</h2>
        <span style={{ color: '#666' }}>{products.length} products available</span>
      </div>
      
      {products.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#fff',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
          <h3 style={{ marginBottom: '10px' }}>No products available</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Products will appear here once they are added to the store.
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;