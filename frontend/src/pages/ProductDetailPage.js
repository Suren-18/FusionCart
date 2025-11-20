import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, reviewAPI, orderAPI } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import ProductCard from '../components/ProductCard';
import PriceHistoryChart from '../components/PriceHistoryChart';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [sentimentSummary, setSentimentSummary] = useState(null);
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [priceHistory, setPriceHistory] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });

  useEffect(() => {
    fetchProductData();
  }, [id]);

  useEffect(() => {
    filterReviews();
  }, [sentimentFilter, reviews]);

  const filterReviews = () => {
    if (sentimentFilter === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(r => r.sentimentLabel === sentimentFilter));
    }
  };

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productRes = await productAPI.getById(id);
      
      if (productRes.data) {
        const data = productRes.data;
        
        if (data.success === false) {
          setError(data.message || 'Product not found');
          setProduct(null);
          setLoading(false);
          return;
        }
        
        const productData = data.product || data;
        setProduct(productData);
        setReviews(data.reviews || []);
        setSentimentSummary(data.sentimentSummary || null);
        setRelatedProducts(data.relatedProducts || []);
      }

      try {
        const priceRes = await productAPI.getPriceHistory(id);
        
        if (priceRes.data && priceRes.data.history) {
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

  const getOverallRatingBadge = (rating) => {
    const badges = {
      'Excellent': {
        color: '#059669',
        bgColor: '#d1fae5',
        icon: '🌟',
        description: 'Highly recommended by customers'
      },
      'Good': {
        color: '#10b981',
        bgColor: '#d1fae5',
        icon: '👍',
        description: 'Generally positive feedback'
      },
      'Average': {
        color: '#f59e0b',
        bgColor: '#fef3c7',
        icon: '👌',
        description: 'Mixed customer opinions'
      },
      'Below Average': {
        color: '#f97316',
        bgColor: '#ffedd5',
        icon: '👎',
        description: 'Some concerns from customers'
      },
      'Poor': {
        color: '#dc2626',
        bgColor: '#fee2e2',
        icon: '⚠️',
        description: 'Many negative reviews'
      }
    };
    return badges[rating] || {
      color: '#6b7280',
      bgColor: '#f3f4f6',
      icon: 'ℹ️',
      description: 'No reviews yet'
    };
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

  const overallBadge = sentimentSummary ? getOverallRatingBadge(sentimentSummary.overallRating) : null;

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

          {/* Overall Rating Badge */}
          {sentimentSummary && overallBadge && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              background: overallBadge.bgColor,
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '24px' }}>{overallBadge.icon}</span>
              <div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: overallBadge.color 
                }}>
                  {sentimentSummary.overallRating}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {overallBadge.description}
                </div>
              </div>
            </div>
          )}

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

      {/* Price History Chart */}
      <PriceHistoryChart 
        priceHistory={priceHistory} 
        currentPrice={product.price}
      />

      {/* Enhanced Sentiment Summary */}
      {sentimentSummary && sentimentSummary.total > 0 && (
        <div style={{ 
          background: '#fff', 
          padding: '30px', 
          borderRadius: '12px', 
          marginBottom: '40px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <h2 style={{ marginBottom: '25px', fontSize: '24px' }}>Customer Sentiment Analysis</h2>
          
          {/* Sentiment Distribution */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '20px',
            marginBottom: '25px' 
          }}>
            <div style={{ 
              textAlign: 'center',
              padding: '20px',
              background: '#d1fae5',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#10b981', marginBottom: '5px' }}>
                {sentimentSummary.positive}%
              </div>
              <div style={{ fontSize: '16px', color: '#059669', fontWeight: '600' }}>
                😊 Positive
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '5px' }}>
                {sentimentSummary.counts?.positive || 0} reviews
              </div>
            </div>
            <div style={{ 
              textAlign: 'center',
              padding: '20px',
              background: '#f3f4f6',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#6b7280', marginBottom: '5px' }}>
                {sentimentSummary.neutral}%
              </div>
              <div style={{ fontSize: '16px', color: '#4b5563', fontWeight: '600' }}>
                😐 Neutral
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '5px' }}>
                {sentimentSummary.counts?.neutral || 0} reviews
              </div>
            </div>
            <div style={{ 
              textAlign: 'center',
              padding: '20px',
              background: '#fee2e2',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#ef4444', marginBottom: '5px' }}>
                {sentimentSummary.negative}%
              </div>
              <div style={{ fontSize: '16px', color: '#dc2626', fontWeight: '600' }}>
                😞 Negative
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '5px' }}>
                {sentimentSummary.counts?.negative || 0} reviews
              </div>
            </div>
          </div>

          {/* Sentiment Score Bar */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span>Sentiment Score</span>
              <span>{sentimentSummary.sentimentScore}/100</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '12px', 
              background: '#e5e7eb', 
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${sentimentSummary.sentimentScore}%`, 
                height: '100%', 
                background: sentimentSummary.sentimentScore >= 65 ? '#10b981' : 
                           sentimentSummary.sentimentScore >= 45 ? '#f59e0b' : '#ef4444',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '40px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h2 style={{ margin: 0 }}>Customer Reviews ({reviews.length})</h2>
          <button 
            onClick={() => setShowReviewForm(!showReviewForm)} 
            className="btn btn-primary"
          >
            Write a Review
          </button>
        </div>

        {/* Sentiment Filter */}
        {reviews.length > 0 && (
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            {[
              { value: 'all', label: 'All Reviews', count: reviews.length },
              { value: 'positive', label: '😊 Positive', count: reviews.filter(r => r.sentimentLabel === 'positive').length },
              { value: 'neutral', label: '😐 Neutral', count: reviews.filter(r => r.sentimentLabel === 'neutral').length },
              { value: 'negative', label: '😞 Negative', count: reviews.filter(r => r.sentimentLabel === 'negative').length }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setSentimentFilter(filter.value)}
                style={{
                  padding: '8px 16px',
                  border: sentimentFilter === filter.value ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  background: sentimentFilter === filter.value ? '#eff6ff' : '#fff',
                  color: sentimentFilter === filter.value ? '#2563eb' : '#6b7280',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        )}

        {showReviewForm && (
          <form 
            onSubmit={handleSubmitReview} 
            style={{ 
              marginBottom: '30px', 
              padding: '20px', 
              background: '#f9f9f9', 
              borderRadius: '8px' 
            }}
          >
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: '600' 
              }}>
                Rating
              </label>
              <select
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd' 
                }}
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map(num => (
                  <option key={num} value={num}>{num} Stars</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: '600' 
              }}>
                Review
              </label>
              <textarea
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd', 
                  resize: 'vertical' 
                }}
                rows="4"
                value={reviewForm.text}
                onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                required
                placeholder="Share your experience with this product..."
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Submit Review
            </button>
          </form>
        )}

        {filteredReviews.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
            {sentimentFilter === 'all' 
              ? 'No reviews yet. Be the first to review!' 
              : `No ${sentimentFilter} reviews found.`}
          </p>
        ) : (
          filteredReviews.map(review => (
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