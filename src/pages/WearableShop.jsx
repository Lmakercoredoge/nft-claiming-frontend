import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import './WearableShop.css';

const WearableShop = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // 웨어러블 카테고리
  const categories = [
    { id: 'all', name: 'All Items', icon: '👕' },
    { id: 'hat', name: 'Hats', icon: '🧢' },
    { id: 'glasses', name: 'Glasses', icon: '🕶️' },
    { id: 'jacket', name: 'Jackets', icon: '🧥' },
    { id: 'shoes', name: 'Shoes', icon: '👟' },
    { id: 'accessories', name: 'Accessories', icon: '⌚' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [selectedCategory, sortBy, products]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // 임시 더미 데이터
      const dummyProducts = [
        {
          id: 1,
          name: 'MONGMONG Cap',
          category: 'hat',
          price: 50000,
          image: '/images/wearable/cap.png',
          description: 'Limited edition MONGMONG cap',
          stock: 100,
          featured: true,
        },
        {
          id: 2,
          name: 'Cyber Glasses',
          category: 'glasses',
          price: 75000,
          image: '/images/wearable/glasses.png',
          description: 'Futuristic cyber glasses',
          stock: 50,
          featured: true,
        },
        {
          id: 3,
          name: 'Leather Jacket',
          category: 'jacket',
          price: 200000,
          image: '/images/wearable/jacket.png',
          description: 'Premium leather jacket',
          stock: 30,
          featured: false,
        },
        {
          id: 4,
          name: 'Sneakers Pro',
          category: 'shoes',
          price: 120000,
          image: '/images/wearable/shoes.png',
          description: 'High-performance sneakers',
          stock: 80,
          featured: true,
        },
        {
          id: 5,
          name: 'Gold Chain',
          category: 'accessories',
          price: 150000,
          image: '/images/wearable/chain.png',
          description: '24K gold chain',
          stock: 20,
          featured: false,
        },
      ];

      setProducts(dummyProducts);
      setFilteredProducts(dummyProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // 정렬
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: 'wearable',
    });
  };

  if (loading) {
    return (
      <div className="wearable-shop">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading wearables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wearable-shop">
      {/* Header */}
      <div className="shop-header">
        <h1>👕 MONGMONG Wearables</h1>
        <p>Exclusive digital fashion for your avatar</p>
      </div>

      {/* Filters & Sort */}
      <div className="shop-controls">
        {/* Categories */}
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img 
                  src={product.image} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23667eea" width="300" height="300"/%3E%3Ctext fill="%23fff" font-size="40" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E👕%3C/text%3E%3C/svg%3E';
                  }}
                />
                {product.featured && (
                  <span className="featured-badge">⭐ Featured</span>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <div className="product-price">
                    <span className="price">{product.price.toLocaleString()}</span>
                    <span className="currency">MONG</span>
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
                <div className="product-stock">
                  {product.stock > 0 ? (
                    <span className="in-stock">✅ {product.stock} in stock</span>
                  ) : (
                    <span className="out-of-stock">❌ Out of stock</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <div className="empty-icon">👕</div>
            <h3>No wearables found</h3>
            <p>Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WearableShop;
