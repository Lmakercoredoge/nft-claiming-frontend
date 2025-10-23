import React, { useState, useEffect } from 'react';
import ProductCard from '../components/shop/ProductCard';
import ProductFilters from '../components/shop/ProductFilters';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    
    try {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFilteredProducts(data.products);
      }
    } catch (error) {
      console.error('Filter error:', error);
    }
  };

  if (loading) {
    return (
      <div className="shop-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>상품 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>🛍️ MONGMONG SHOP</h1>
        <p>NFT 홀더는 특별 할인 혜택을 받을 수 있습니다!</p>
      </div>

      <ProductFilters 
        onFilterChange={handleFilterChange}
        categories={['Apparel', 'Accessories', 'Digital', 'Limited']}
      />

      {filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-products">
          <div className="empty-icon">🔍</div>
          <h3>상품이 없습니다</h3>
          <p>필터를 조정해보세요</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
