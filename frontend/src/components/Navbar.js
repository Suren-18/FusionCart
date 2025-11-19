import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="logo">ShopHub</Link>
        
        <SearchBar />

        <div className="nav-actions">
          <ul className="nav-links">
            <li><Link to="/products">Products</Link></li>
            
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <li><Link to="/admin">Admin</Link></li>
                )}
                <li><Link to="/cart">Cart</Link></li>
                <li>
                  <span style={{ marginRight: '10px' }}>Hi, {user?.username}</span>
                </li>
                <li>
                  <button onClick={handleLogout} className="btn btn-secondary">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">
                    <button className="btn btn-secondary">Login</button>
                  </Link>
                </li>
                <li>
                  <Link to="/register">
                    <button className="btn btn-primary">Register</button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;