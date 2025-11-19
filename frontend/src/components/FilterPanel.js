import React, { useState, useEffect } from 'react';
import api from '../services/api';

const FilterPanel = ({ filters, onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get('/products/categories'),
        api.get('/products/brands')
      ]);
      
      // Handle both response formats
      setCategories(categoriesRes.data.categories || categoriesRes.data || []);
      setBrands(brandsRes.data.brands || brandsRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching filters:', error);
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    onFilterChange({ ...filters, category: filters.category === category ? '' : category });
  };

  const handleBrandClick = (brand) => {
    onFilterChange({ ...filters, brand: filters.brand === brand ? '' : brand });
  };

  if (loading) {
    return <div className="filter-panel"><div className="loading">Loading filters...</div></div>;
  }

  return (
    <div className="filter-panel">
      <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Filters</h3>

      {categories.length > 0 && (
        <div className="filter-section">
          <h3>Category</h3>
          <div className="filter-chips">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-chip ${filters.category === category ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {brands.length > 0 && (
        <div className="filter-section">
          <h3>Brand</h3>
          <div className="filter-chips">
            {brands.map((brand) => (
              <button
                key={brand}
                className={`filter-chip ${filters.brand === brand ? 'active' : ''}`}
                onClick={() => handleBrandClick(brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="filter-section">
        <h3>Price Range</h3>
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice || ''}
          onChange={(e) => onFilterChange({ ...filters, minPrice: e.target.value })}
          className="filter-input"
          style={{ marginBottom: '10px' }}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice || ''}
          onChange={(e) => onFilterChange({ ...filters, maxPrice: e.target.value })}
          className="filter-input"
        />
      </div>

      <div className="filter-section">
        <h3>Rating</h3>
        <select
          value={filters.minRating || ''}
          onChange={(e) => onFilterChange({ ...filters, minRating: e.target.value })}
          className="filter-select"
        >
          <option value="">All Ratings</option>
          <option value="4">4★ & above</option>
          <option value="3">3★ & above</option>
          <option value="2">2★ & above</option>
        </select>
      </div>

      <div className="filter-section">
        <h3>Availability</h3>
        <div className="filter-chips">
          <button
            className={`filter-chip ${filters.inStock ? 'active' : ''}`}
            onClick={() => onFilterChange({ ...filters, inStock: !filters.inStock })}
          >
            In Stock Only
          </button>
        </div>
      </div>

      <div className="filter-section">
        <h3>Sort By</h3>
        <select
          value={filters.sort || ''}
          onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
          className="filter-select"
        >
          <option value="">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Rating</option>
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      <button
        onClick={() => onFilterChange({})}
        className="btn btn-secondary"
        style={{ width: '100%', marginTop: '10px' }}
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterPanel;