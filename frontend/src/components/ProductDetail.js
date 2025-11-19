import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProductDetail = ({ product, priceHistory, onAddToCart }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
  };

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + (product.deliveryDays || 5));

  const formatPriceHistory = (history) => {
    if (!history || history.length === 0) return [];
    
    return history.map(item => ({
      date: new Date(item.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      price: item.price
    }));
  };

  const renderSpecifications = () => {
    if (!product.specifications || product.specifications.size === 0) {
      return null;
    }

    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>Specifications</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {Array.from(product.specifications).map(([key, value]) => (
              <tr key={key} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '10px 0', fontWeight: '500', width: '40%' }}>
                  {key}
                </td>
                <td style={{ padding: '10px 0', color: '#666' }}>
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderVariants = () => {
    if (!product.variants || product.variants.length === 0) {
      return null;
    }

    return (
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>Available Variants</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {product.variants.map((variant, index) => (
            <div
              key={index}
              style={{
                padding: '10px 15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: '#f9f9f9'
              }}
            >
              <div style={{ fontWeight: '500' }}>{variant.name}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {variant.value}
                {variant.price && ` - ₹${variant.price.toLocaleString()}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        {/* Product Gallery */}
        <div className="product-gallery">
          <img
            src={product.images?.[selectedImage] || 'https://via.placeholder.com/500'}
            alt={product.name}
            className="main-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500?text=No+Image';
            }}
          />
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-images">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="product-details-info">
          <h1>{product.name}</h1>
          <p className="product-brand">{product.brand}</p>
          
          <div className="product-rating">
            <span>⭐ {product.rating?.toFixed(1) || '0.0'}</span>
            <span> ({product.numReviews || 0} reviews)</span>
          </div>

          <p className="product-price">₹{product.price?.toLocaleString()}</p>

          <p className="product-description">{product.description}</p>

          <div style={{ marginTop: '20px', marginBottom: '15px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Category:</strong> <span style={{ color: '#666' }}>{product.category}</span>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>SKU:</strong> <span style={{ color: '#666' }}>{product.sku}</span>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>Delivery by:</strong>{' '}
              <span style={{ color: '#4caf50', fontWeight: '500' }}>
                {deliveryDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong>Availability:</strong>{' '}
              <span 
                style={{ 
                  color: product.stock === 0 ? '#d32f2f' : product.stock < 10 ? '#ff9800' : '#4caf50',
                  fontWeight: '500'
                }}
              >
                {product.stock === 0 
                  ? 'Out of stock' 
                  : product.stock < 10 
                    ? `Only ${product.stock} left in stock` 
                    : 'In stock'}
              </span>
            </div>
          </div>

          {/* Variants */}
          {renderVariants()}

          {/* Quantity and Actions */}
          {product.stock > 0 && (
            <>
              <div className="quantity-controls" style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '15px', fontWeight: '500' }}>Quantity:</label>
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span style={{ 
                  padding: '0 20px', 
                  fontSize: '16px', 
                  fontWeight: '500',
                  minWidth: '40px',
                  textAlign: 'center',
                  display: 'inline-block'
                }}>
                  {quantity}
                </span>
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className="product-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={handleAddToCart}
                  style={{ fontSize: '16px', padding: '14px 32px' }}
                >
                  Add to Cart
                </button>
                <button 
                  className="btn btn-secondary"
                  style={{ fontSize: '16px', padding: '14px 32px' }}
                >
                  Add to Wishlist
                </button>
              </div>
            </>
          )}

          {product.stock === 0 && (
            <div style={{ 
              padding: '15px', 
              background: '#ffebee', 
              color: '#d32f2f',
              borderRadius: '4px',
              fontWeight: '500'
            }}>
              This product is currently out of stock
            </div>
          )}

          {/* Specifications */}
          {renderSpecifications()}
        </div>
      </div>

      {/* Price History Chart */}
      {priceHistory && priceHistory.length > 1 && (
        <div className="price-chart-section">
          <h2>Price History</h2>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
            Track price changes over time
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatPriceHistory(priceHistory)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                style={{ fontSize: '12px' }}
                stroke="#666"
              />
              <YAxis 
                style={{ fontSize: '12px' }}
                stroke="#666"
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Price']}
                contentStyle={{ 
                  background: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#000" 
                strokeWidth={2}
                dot={{ fill: '#000', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            background: '#f5f5f5', 
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-around'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Lowest Price</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ₹{Math.min(...priceHistory.map(h => h.price)).toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Highest Price</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ₹{Math.max(...priceHistory.map(h => h.price)).toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Current Price</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>
                ₹{product.price.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Features Section */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: '#f9f9f9', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ marginBottom: '15px' }}>Why Choose This Product?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>✓</span>
            <span>Genuine Product</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>✓</span>
            <span>Fast Delivery</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>✓</span>
            <span>Easy Returns</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>✓</span>
            <span>Secure Payment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;