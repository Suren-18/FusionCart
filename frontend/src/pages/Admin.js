import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import ProductForm from '../components/ProductForm';

const Admin = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <h1 style={{ marginBottom: '30px' }}>Admin Panel</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '20px' }}>Menu</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/admin">
              <button className={`btn btn-secondary ${isActive('/admin')}`} style={{ width: '100%', textAlign: 'left' }}>
                Dashboard
              </button>
            </Link>
            <Link to="/admin/add-product">
              <button className={`btn btn-secondary ${isActive('/admin/add-product')}`} style={{ width: '100%', textAlign: 'left' }}>
                Add Product
              </button>
            </Link>
          </div>
        </div>

        <div>
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="add-product" element={<ProductForm />} />
            <Route path="edit-product/:id" element={<ProductForm />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;