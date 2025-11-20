// backend/utils/sentiment.js
// Enhanced sentiment analysis with product-level classification

const positiveWords = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
  'perfect', 'love', 'best', 'beautiful', 'nice', 'happy', 'satisfied', 'recommend',
  'quality', 'impressed', 'worth', 'helpful', 'easy', 'superb', 'outstanding',
  'brilliant', 'exceptional', 'incredible', 'magnificent', 'terrific', 'fabulous',
  'delightful', 'pleased', 'comfortable', 'reliable', 'durable', 'sturdy'
];

const negativeWords = [
  'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'hate', 'disappointing',
  'useless', 'waste', 'broken', 'defective', 'cheap', 'unhappy', 'difficult',
  'problem', 'issue', 'wrong', 'fake', 'scam', 'inferior', 'mediocre',
  'uncomfortable', 'unreliable', 'fragile', 'flimsy', 'overpriced', 'disappointing',
  'returned', 'refund', 'avoid', 'never', 'regret'
];

// Analyze sentiment of individual review text
const analyzeSentiment = (text) => {
  if (!text) return 'neutral';

  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  // Count positive words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) positiveCount += matches.length;
  });

  // Count negative words
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeCount += matches.length;
  });

  // Determine sentiment based on word counts and ratio
  const difference = positiveCount - negativeCount;
  
  if (difference >= 2) {
    return 'positive';
  } else if (difference <= -2) {
    return 'negative';
  } else if (positiveCount > negativeCount) {
    return 'positive';
  } else if (negativeCount > positiveCount) {
    return 'negative';
  } else {
    return 'neutral';
  }
};

// Calculate sentiment summary from reviews
const getReviewSentimentSummary = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return {
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      overallRating: 'No Reviews',
      sentimentScore: 0
    };
  }

  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0
  };

  // Count sentiments
  reviews.forEach(review => {
    const sentiment = review.sentimentLabel || 'neutral';
    sentimentCounts[sentiment]++;
  });

  const total = reviews.length;
  
  // Calculate percentages
  const positivePercent = Math.round((sentimentCounts.positive / total) * 100);
  const neutralPercent = Math.round((sentimentCounts.neutral / total) * 100);
  const negativePercent = Math.round((sentimentCounts.negative / total) * 100);

  // Calculate sentiment score (0-100)
  const sentimentScore = Math.round(
    ((sentimentCounts.positive * 100) + 
     (sentimentCounts.neutral * 50) + 
     (sentimentCounts.negative * 0)) / total
  );

  // Determine overall product rating based on sentiment
  let overallRating;
  if (sentimentScore >= 80) {
    overallRating = 'Excellent';
  } else if (sentimentScore >= 65) {
    overallRating = 'Good';
  } else if (sentimentScore >= 45) {
    overallRating = 'Average';
  } else if (sentimentScore >= 30) {
    overallRating = 'Below Average';
  } else {
    overallRating = 'Poor';
  }

  return {
    total,
    positive: positivePercent,
    neutral: neutralPercent,
    negative: negativePercent,
    overallRating,
    sentimentScore,
    counts: sentimentCounts
  };
};

// Get sentiment badge info for display
const getSentimentBadge = (sentimentLabel) => {
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

  return badges[sentimentLabel] || badges.neutral;
};

// Get overall rating badge
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

module.exports = {
  analyzeSentiment,
  getReviewSentimentSummary,
  getSentimentBadge,
  getOverallRatingBadge
};