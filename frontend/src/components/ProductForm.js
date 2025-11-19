import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: '',
    category: '',
    price: '',
    brand: '',
    stock: '',
    sku: '',
    deliveryDays: 5,
    specifications: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      // Convert specifications Map to string
      let specsString = '';
      if (product.specifications) {
        const specsArray = [];
        if (product.specifications instanceof Map) {
          product.specifications.forEach((value, key) => {
            specsArray.push(`${key}:${value}`);
          });
        } else if (typeof product.specifications === 'object') {
          Object.entries(product.specifications).forEach(([key, value]) => {
            specsArray.push(`${key}:${value}`);
          });
        }
        specsString = specsArray.join(', ');
      }

      setFormData({
        name: product.name || '',
        description: product.description || '',
        images: product.images?.join(', ') || '',
        category: product.category || '',
        price: product.price || '',
        brand: product.brand || '',
        stock: product.stock || '',
        sku: product.sku || '',
        deliveryDays: product.deliveryDays || 5,
        specifications: specsString
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Parse specifications
      const specifications = {};
      if (formData.specifications) {
        const specs = formData.specifications.split(',').map(s => s.trim());
        specs.forEach(spec => {
          const [key, value] = spec.split(':').map(s => s.trim());
          if (key && value) {
            specifications[key] = value;
          }
        });
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        images: formData.images.split(',').map(img => img.trim()).filter(img => img),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        brand: formData.brand.trim(),
        stock: parseInt(formData.stock),
        sku: formData.sku.trim().toUpperCase(),
        deliveryDays: parseInt(formData.deliveryDays),
        specifications
      };

      // Validation
      if (!productData.name || !productData.description || !productData.category || 
          !productData.brand || !productData.sku) {
        throw new Error('Please fill all required fields');
      }

      if (productData.images.length === 0) {
        throw new Error('Please provide at least one image URL');
      }

      if (isNaN(productData.price) || productData.price <= 0) {
        throw new Error('Please enter a valid price');
      }

      if (isNaN(productData.stock) || productData.stock < 0) {
        throw new Error('Please enter a valid stock quantity');
      }

      if (product) {
        await api.put(`/admin/products/${product._id}`, productData);
      } else {
        await api.post('/admin/products', productData);
      }

      setLoading(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save product');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '20px' }}>{product ? 'Edit Product' : 'Add New Product'}</h2>
      
      {error && (
        <div className="error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label>Product Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g., Sony WH-1000XM5 Wireless Headphones"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea"
          placeholder="Detailed product description..."
          required
          disabled={loading}
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>Image URLs (comma-separated) *</label>
        <textarea
          name="images"
          value={formData.images}
          onChange={handleChange}
          className="form-textarea"
          placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
          required
          disabled={loading}
          rows="3"
        />
        <small style={{ color: '#666', fontSize: '12px' }}>
          Enter multiple image URLs separated by commas
        </small>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div className="form-group">
          <label>Category *</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Electronics"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Brand *</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Sony"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
        <div className="form-group">
          <label>Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="form-input"
            placeholder="29999"
            step="0.01"
            min="0"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Stock *</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="form-input"
            placeholder="50"
            min="0"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Delivery Days</label>
          <input
            type="number"
            name="deliveryDays"
            value={formData.deliveryDays}
            onChange={handleChange}
            className="form-input"
            placeholder="5"
            min="1"
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <label>SKU (Stock Keeping Unit) *</label>
        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          className="form-input"
          placeholder="SONY-WH1000XM5-BLK"
          required
          disabled={loading || product}
        />
        {product && (
          <small style={{ color: '#666', fontSize: '12px' }}>
            SKU cannot be changed after creation
          </small>
        )}
      </div>

      <div className="form-group">
        <label>Specifications (optional)</label>
        <textarea
          name="specifications"
          value={formData.specifications}
          onChange={handleChange}
          className="form-textarea"
          placeholder="Battery Life:30 hours, Noise Cancellation:Yes, Weight:250g"
          disabled={loading}
          rows="3"
        />
        <small style={{ color: '#666', fontSize: '12px' }}>
          Format: Key:Value, separated by commas
        </small>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
          style={{ flex: 1 }}
        >
          {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn btn-secondary"
          disabled={loading}
          style={{ flex: 1 }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;