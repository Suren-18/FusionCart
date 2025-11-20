import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PriceHistoryChart = ({ priceHistory, currentPrice }) => {
  const [timePeriod, setTimePeriod] = useState('1W');

  const periods = [
    { label: '1D', days: 1 },
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: '1Y', days: 365 },
    { label: 'ALL', days: null }
  ];

  const filteredData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];

    const now = new Date();
    const selectedPeriod = periods.find(p => p.label === timePeriod);
    
    if (selectedPeriod.days === null) {
      return priceHistory.map(item => ({
        date: new Date(item.date),
        price: item.price,
        displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
    }

    const cutoffDate = new Date(now.getTime() - (selectedPeriod.days * 24 * 60 * 60 * 1000));
    
    return priceHistory
      .filter(item => new Date(item.date) >= cutoffDate)
      .map(item => ({
        date: new Date(item.date),
        price: item.price,
        displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
  }, [priceHistory, timePeriod]);

  const priceChange = useMemo(() => {
    if (filteredData.length < 2) return { amount: 0, percentage: 0 };
    
    const firstPrice = filteredData[0].price;
    const lastPrice = filteredData[filteredData.length - 1].price;
    const change = lastPrice - firstPrice;
    const percentage = ((change / firstPrice) * 100).toFixed(2);
    
    return { amount: change.toFixed(2), percentage };
  }, [filteredData]);

  const lowestPrice = useMemo(() => {
    if (filteredData.length === 0) return 0;
    return Math.min(...filteredData.map(d => d.price));
  }, [filteredData]);

  const highestPrice = useMemo(() => {
    if (filteredData.length === 0) return 0;
    return Math.max(...filteredData.map(d => d.price));
  }, [filteredData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#2563eb',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          ${payload[0].value.toFixed(2)}
        </div>
      );
    }
    return null;
  };

  if (!priceHistory || priceHistory.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: '#fff',
      padding: '24px',
      borderRadius: '8px',
      marginBottom: '40px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '32px', fontWeight: '700' }}>
            ${currentPrice?.toFixed(2) || filteredData[filteredData.length - 1]?.price.toFixed(2)}
          </span>
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: priceChange.amount >= 0 ? '#10b981' : '#ef4444'
          }}>
            {priceChange.amount >= 0 ? '↑' : '↓'} ${Math.abs(priceChange.amount)} ({priceChange.percentage}%)
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '16px'
        }}>
          {periods.map(period => (
            <button
              key={period.label}
              onClick={() => setTimePeriod(period.label)}
              style={{
                padding: '6px 16px',
                border: 'none',
                background: timePeriod === period.label ? '#000' : 'transparent',
                color: timePeriod === period.label ? '#fff' : '#666',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={filteredData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="displayDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
            dx={-10}
            domain={['dataMin - 10', 'dataMax + 10']}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#colorPrice)"
            dot={false}
            activeDot={{ r: 4, fill: '#2563eb' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginTop: '24px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '6px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Low</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>${lowestPrice.toFixed(2)}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>High</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>${highestPrice.toFixed(2)}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Current</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#2563eb' }}>
            ${currentPrice?.toFixed(2) || filteredData[filteredData.length - 1]?.price.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryChart;