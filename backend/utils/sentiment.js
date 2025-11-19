// Simple sentiment analysis based on keywords
const positiveWords = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
  'perfect', 'love', 'best', 'beautiful', 'nice', 'happy', 'satisfied', 'recommend',
  'quality', 'impressed', 'worth', 'helpful', 'easy'
];

const negativeWords = [
  'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'hate', 'disappointing',
  'useless', 'waste', 'broken', 'defective', 'cheap', 'unhappy', 'difficult',
  'problem', 'issue', 'wrong', 'fake', 'scam'
];

const analyzeSentiment = (text) => {
  if (!text) return 'neutral';

  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) {
    return 'positive';
  } else if (negativeCount > positiveCount) {
    return 'negative';
  } else {
    return 'neutral';
  }
};

module.exports = { analyzeSentiment };