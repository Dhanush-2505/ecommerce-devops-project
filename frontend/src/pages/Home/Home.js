import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import API from '../../utils/api';
import { useApp } from '../../context/AppContext';

export default function Home() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('');
  const [loading,    setLoading]    = useState(true);
  const { addToCart } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)   params.set('search', search);
    if (category) params.set('category', category);
    API.get(`/products?${params}`)
      .then(r => setProducts(r.data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <h1>Shop the Best <span>Deals</span> Online</h1>
        <p>Discover thousands of products at amazing prices</p>
        <button className="btn btn-primary" onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}>
          Shop Now ↓
        </button>
      </div>

      <div className="container" id="products">
        <div className="page-header">
          <h1>All Products</h1>
        </div>

        {/* Filters */}
        <div className="filters">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input
              style={{ paddingLeft: 36 }}
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          {(search || category) && (
            <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setCategory(''); }}>
              Clear Filters
            </button>
          )}
        </div>

        {/* Products */}
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <button className="btn btn-primary" onClick={() => { setSearch(''); setCategory(''); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <img
                  src={product.image_url}
                  alt={product.name}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
                <div className="product-card-body">
                  <div className="category">{product.category_name}</div>
                  <h3 onClick={() => navigate(`/product/${product.id}`)}>{product.name}</h3>
                  <div className="price">₹{parseFloat(product.price).toLocaleString()}</div>
                  <div className="stock">{product.stock > 0 ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}</div>
                  <button
                    className="btn btn-primary btn-block"
                    disabled={product.stock === 0}
                    onClick={() => addToCart(product.id)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
