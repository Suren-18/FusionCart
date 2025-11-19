import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialFilters = {
      category: params.get('category') || '',
      brand: params.get('brand') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      minRating: params.get('minRating') || '',
      inStock: params.get('inStock') === 'true',
      sort: params.get('sort') || '',
      search: params.get('search') || '',
      page: params.get('page') || '1'
    };
    setFilters(initialFilters);
    fetchProducts(initialFilters);
    // eslint-disable-next-line
  }, [location.search]);

  const fetchProducts = async (currentFilters) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key] && currentFilters[key] !== '' && currentFilters[key] !== false) {
          params.append(key, currentFilters[key]);
        }
      });

      console.log('🔄 Fetching products with filters:', params.toString());
      const response = await api.get(`/products?${params.toString()}`);
      console.log('📦 Products response:', response.data);
      
      // Handle both response formats
      const productsData = response.data.products || response.data || [];
      const paginationData = response.data.pagination || { 
        page: 1, 
        pages: Math.ceil(productsData.length / 20), 
        total: productsData.length 
      };
      
      setProducts(productsData);
      setPagination(paginationData);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load products');
      setProducts([]);
      setLoading(false);
    }
  };

  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] && newFilters[key] !== '' && newFilters[key] !== false) {
        params.append(key, newFilters[key]);
      }
    });
    navigate(`/products?${params.toString()}`);
  };

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...newFilters, page: '1' };
    setFilters(updatedFilters);
    updateURLParams(updatedFilters);
  };

  const handleSearch = (searchTerm) => {
    const updatedFilters = { ...filters, search: searchTerm, page: '1' };
    setFilters(updatedFilters);
    updateURLParams(updatedFilters);
  };

  const handlePageChange = (newPage) => {
    const updatedFilters = { ...filters, page: newPage.toString() };
    setFilters(updatedFilters);
    updateURLParams(updatedFilters);
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      
      {error && (
        <div className="error" style={{ marginBottom: '20px' }}>
          {error}
          <button 
            onClick={() => fetchProducts(filters)} 
            className="btn btn-primary"
            style={{ marginLeft: '10px' }}
          >
            Retry
          </button>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            background: '#fff',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <h2 style={{ margin: 0 }}>
              Products {pagination.total > 0 && `(${pagination.total})`}
            </h2>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Page {pagination.page} of {pagination.pages}
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#fff',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
              <h3 style={{ marginBottom: '10px' }}>No products found</h3>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Try adjusting your filters or search terms
              </p>
              <button 
                onClick={() => handleFilterChange({})}
                className="btn btn-primary"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '10px',
                  marginTop: '30px',
                  padding: '20px',
                  background: '#fff',
                  borderRadius: '8px'
                }}>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`btn ${pagination.page === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="btn btn-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;