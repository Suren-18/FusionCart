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

  const isOwner = user && review.userId?._id === user.id;

  return (
    <div className="review-card">
      <div className="review-header">
        <div>
          <span className="review-user">
            {review.userId?.username || 'Anonymous'}
          </span>
          {review.verifiedPurchase && (
            <span className="verified-badge">Verified Purchase</span>
          )}
        </div>
        <span className="review-date">{formatDate(review.createdAt)}</span>
      </div>

      <div className="review-rating">{renderStars(review.rating)}</div>

      <p className="review-text">{review.text}</p>

      <div className="flex-between mt-20">
        <button
          onClick={handleMarkHelpful}
          className="btn btn-secondary"
          disabled={marked}
        >
          👍 Helpful ({helpful})
        </button>

        {isOwner && (
          <div className="flex gap-10">
            <button onClick={() => onUpdate(review)} className="btn btn-secondary">
              Edit
            </button>
            <button onClick={() => onDelete(review._id)} className="btn btn-danger">
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;