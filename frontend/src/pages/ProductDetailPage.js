import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { productAPI, reviewAPI, orderAPI } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import ProductCard from '../components/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [sentimentSummary, setSentimentSummary] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      const [productRes, reviewsRes, sentimentRes, priceRes, relatedRes] = await Promise.all([
        productAPI.getProductById(id),
        reviewAPI.getProductReviews(id, { limit: 10 }),
        reviewAPI.getSentimentSummary(id),
        productAPI.getPriceHistory(id),
        productAPI.getRelatedProducts(id)
      ]);

      setProduct(productRes.data);
      setReviews(reviewsRes.data.reviews);
      setSentimentSummary(sentimentRes.data);
      setPriceHistory(priceRes.data);
      setRelatedProducts(relatedRes.data);
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      const response = await orderAPI.createOrder({
        products: [{ productId: id, quantity: 1 }]
      });
      alert(response.data.message);
    } catch (error) {
      alert('Purchase failed. Please try again.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await reviewAPI.addReview({
        productId: id,
        rating: reviewForm.rating,
        text: reviewForm.text
      });
      setShowReviewForm(false);
      setReviewForm({ rating: 5, text: '' });
      fetchProductData();
    } catch (error) {
      alert('Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewAPI.deleteReview(reviewId);
        fetchProductData();
      } catch (error) {
        alert('Failed to delete review');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) {
    return <div className="container text-center mt-20">Product not found</div>;
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

          <div style={{ marginBottom: '30px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '10px' }}>Description</h3>
            <p style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>{product.ProductDescription}</p>
          </div>

          <button onClick={handleBuyNow} className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '18px' }}>
            Buy Now
          </button>
        </div>
      </div>

      {priceHistory && priceHistory.length > 0 && (
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
        <div className="flex-between mb-20">
          <h2>Customer Reviews</h2>
          <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn btn-primary">
            Write a Review
          </button>
        </div>

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
            <div className="form-group">
              <label>Rating</label>
              <select
                className="form-control"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map(num => (
                  <option key={num} value={num}>{num} Stars</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Review</label>
              <textarea
                className="form-control"
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
            {relatedProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;