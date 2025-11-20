import React, { useState } from 'react';
import { reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ReviewCard = ({ review, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [helpful, setHelpful] = useState(review.helpfulCount || 0);
  const [marked, setMarked] = useState(false);

  const handleMarkHelpful = async () => {
    if (marked) return;

    try {
      const response = await reviewAPI.markHelpful(review._id);
      setHelpful(response.data.helpfulCount);
      setMarked(true);
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // Get sentiment badge styling
  const getSentimentBadge = (sentiment) => {
    const badges = {
      positive: {
        label: 'Positive',
        color: '#10b981',
        bgColor: '#d1fae5',
        icon: '😊'
      },
      neutral: {
        label: 'Neutral',
        color: '#6b7280',
        bgColor: '#f3f4f6',
        icon: '😐'
      },
      negative: {
        label: 'Negative',
        color: '#ef4444',
        bgColor: '#fee2e2',
        icon: '😞'
      }
    };
    return badges[sentiment] || badges.neutral;
  };

  const isOwner = user && review.userId?._id === user.id;
  const sentimentBadge = getSentimentBadge(review.sentimentLabel);

  return (
    <div className="review-card" style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '15px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <span style={{ fontWeight: '600', fontSize: '16px' }}>
              {review.userId?.username || 'Anonymous'}
            </span>
            {review.verifiedPurchase && (
              <span style={{
                background: '#dbeafe',
                color: '#1e40af',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                ✓ Verified Purchase
              </span>
            )}
          </div>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {formatDate(review.createdAt)}
          </span>
        </div>
        
        {/* Sentiment Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: sentimentBadge.bgColor,
          color: sentimentBadge.color,
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <span>{sentimentBadge.icon}</span>
          <span>{sentimentBadge.label}</span>
        </div>
      </div>

      <div style={{ fontSize: '20px', marginBottom: '12px' }}>
        {renderStars(review.rating)}
      </div>

      <p style={{
        lineHeight: '1.6',
        color: '#374151',
        marginBottom: '15px',
        fontSize: '15px'
      }}>
        {review.text}
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #f3f4f6'
      }}>
        <button
          onClick={handleMarkHelpful}
          disabled={marked}
          style={{
            background: marked ? '#f3f4f6' : '#fff',
            border: '1px solid #e5e7eb',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: marked ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: marked ? '#9ca3af' : '#374151',
            transition: 'all 0.2s'
          }}
        >
          👍 Helpful ({helpful})
        </button>

        {isOwner && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {onUpdate && (
              <button
                onClick={() => onUpdate(review)}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}
              >
                Edit
              </button>
            )}
            <button
              onClick={() => onDelete(review._id)}
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#dc2626'
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;