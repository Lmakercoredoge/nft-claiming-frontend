import React, { useState } from 'react';
import './ProductFilters.css';

const ProductFilters = ({ onFilterChange, categories = [] }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'newest',
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="product-filters">
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 상품 검색..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filters-row">
        <div className="filter-group">
          <label>카테고리</label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="all">전체</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>정렬</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
          >
            <option value="newest">최신순</option>
            <option value="price-asc">가격 낮은순</option>
            <option value="price-desc">가격 높은순</option>
            <option value="name-asc">이름순</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
