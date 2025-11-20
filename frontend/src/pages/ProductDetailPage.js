import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { productAPI, reviewAPI, orderAPI } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import ProductCard from '../components/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [sentimentSummary, setSentimentSummary] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching product with ID:', id);
      
      // Fetch main product data (includes reviews, sentiment, and related products)
      const productRes = await productAPI.getById(id);
      
      console.log('📦 Product response:', productRes.data);
      
      // Handle different response structures
      if (productRes.data) {
        const data = productRes.data;
        
        // Check if response has success flag
        if (data.success === false) {
          setError(data.message || 'Product not found');
          setProduct(null);
          setLoading(false);
          return;
        }
        
        // Extract product data (handle both wrapped and direct responses)
        const productData = data.product || data;
        setProduct(productData);
        setReviews(data.reviews || []);
        setSentimentSummary(data.sentimentSummary || null);
        setRelatedProducts(data.relatedProducts || []);
      }

      // Fetch price history separately
      try {
        const priceRes = await productAPI.getPriceHistory(id);
        console.log('📈 Price history response:', priceRes.data);
        
        if (priceRes.data && priceRes.data.history) {
          // Format price history for the chart
          const formattedHistory = priceRes.data.history.map(item => ({
            date: item.date || item.timestamp,
            price: item.price
          }));
          setPriceHistory(formattedHistory);
        }
      } catch (priceError) {
        console.error('⚠️ Error fetching price history:', priceError);
        setPriceHistory([]);
      }

    } catch (error) {
      console.error('❌ Error fetching product data:', error);
      setError(error.response?.data?.message || 'Failed to load product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      const response = await orderAPI.createOrder({
        products: [{ productId: id, quantity: 1 }]
      });
      if (response.data.success) {
        alert(response.data.message || 'Order placed successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Purchase failed. Please try again.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await reviewAPI.create({
        productId: id,
        rating: reviewForm.rating,
        text: reviewForm.text
      });
      
      if (response.data.success || response.data) {
        setShowReviewForm(false);
        setReviewForm({ rating: 5, text: '' });
        fetchProductData();
        alert('Review submitted successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await reviewAPI.delete(reviewId);
        if (response.data.success || response.data) {
          fetchProductData();
          alert('Review deleted successfully');
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete review');
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '100px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', color: '#666' }}>Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ marginTop: '100px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', color: '#666', marginBottom: '20px' }}>
          {error || 'Product not found'}
        </div>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Go to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        <div>
          <img
            src={product.image_link}
            alt={product.ProductName}
            style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}
            onError={(e) => e.target.src = 'https://via.placeholder.com/500'}
          />
        </div>

        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '15px' }}>{product.ProductName}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
              ${product.price?.toFixed(2)}
            </div>
            <div>
              <div>⭐ {product.averageRating?.toFixed(1) || 'N/A'}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {product.totalReviews || 0} reviews
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Category:</strong> {product.category || 'N/A'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Brand:</strong> {product.brand || 'N/A'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </div>
          </div>

          <div style={{ marginBottom: '30px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '10px' }}>Description</h3>
            <p style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>{product.ProductDescription}</p>
          </div>

          <button 
            onClick={handleBuyNow} 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '15px', fontSize: '18px' }}
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {priceHistory && priceHistory.length > 1 && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>Price History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
              <Line type="monotone" dataKey="price" stroke="#000" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {sentimentSummary && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>Review Sentiment</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{sentimentSummary.positive}%</div>
              <div>Positive</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6b7280' }}>{sentimentSummary.neutral}%</div>
              <div>Neutral</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>{sentimentSummary.negative}%</div>
              <div>Negative</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Customer Reviews</h2>
          <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn btn-primary">
            Write a Review
          </button>
        </div>

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Rating</label>
              <select
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map(num => (
                  <option key={num} value={num}>{num} Stars</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Review</label>
              <textarea
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
                rows="4"
                value={reviewForm.text}
                onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Submit Review</button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(review => (
            <ReviewCard
              key={review._id}
              review={review}
              onDelete={handleDeleteReview}
            />
          ))
        )}
      </div>

      {relatedProducts.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Related Products</h2>
          <div className="product-grid">
            {relatedProducts.map(prod => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;