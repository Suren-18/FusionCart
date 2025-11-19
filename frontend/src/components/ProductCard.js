import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product._id}`)}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
    >
      <img
        src={product.image_link || 'https://via.placeholder.com/250'}
        alt={product.ProductName}
        style={{
          width: '100%',
          height: '250px',
          objectFit: 'cover',
          backgroundColor: '#f8f8f8',
        }}
        onError={(e) => (e.target.src = 'https://via.placeholder.com/250?text=No+Image')}
      />
      <div style={{ padding: '10px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
          {product.ProductName}
        </h3>
        <p style={{ color: '#333', fontWeight: 'bold' }}>${product.price?.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
