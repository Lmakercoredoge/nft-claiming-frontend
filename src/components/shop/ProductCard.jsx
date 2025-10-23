import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product, isNFTHolder }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [imageError, setImageError] = useState(false);
  const { addToCart, openCart } = useCart();

  const originalPrice = product.price;
  const discount = isNFTHolder ? product.nftHolderDiscount : 0;
  const discountedPrice = Math.floor(originalPrice * (1 - discount / 100));
  const hasDiscount = discount > 0;

  const getTotalStock = () => {
    return Object.values(product.stock).reduce((sum, count) => sum + count, 0);
  };

  const isInStock = getTotalStock() > 0;
  const isLowStock = getTotalStock() < 10;

  const handleAddToCart = () => {
    const success = addToCart(product, selectedSize, 1);
    if (success) {
      // 성공 알림 표시 (토스트 메시지로 개선 가능)
      console.log(`✅ Added to cart: ${product.name} (${selectedSize})`);
      // 잠시 후 장바구니 열기
      setTimeout(() => {
        openCart();
      }, 300);
    }
  };

  return (
    <div className={`product-card ${!isInStock ? 'out-of-stock' : ''}`}>
      {/* 배지 */}
      <div className="product-badges">
        {product.featured && (
          <span className="badge featured">⭐ FEATURED</span>
        )}
        {hasDiscount && (
          <span className="badge discount">-{discount}%</span>
        )}
        {!isInStock && (
          <span className="badge sold-out">SOLD OUT</span>
        )}
        {isInStock && isLowStock && (
          <span className="badge low-stock">LOW STOCK</span>
        )}
      </div>

      {/* 이미지 */}
      <div className="product-image">
        {!imageError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-placeholder">
            <span>🖼️</span>
            <p>IMAGE COMING SOON</p>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        {/* 가격 */}
        <div className="product-price">
          {hasDiscount && (
            <span className="original-price">{originalPrice.toLocaleString()} {product.currency}</span>
          )}
          <span className="current-price">
            {discountedPrice.toLocaleString()} {product.currency}
          </span>
        </div>

        {/* 사이즈 선택 */}
        {isInStock && (
          <div className="size-selector">
            <label>SIZE:</label>
            <div className="size-options">
              {product.sizes.map(size => {
                const sizeStock = product.stock[size] || 0;
                const isAvailable = sizeStock > 0;
                
                return (
                  <button
                    key={size}
                    className={`size-option ${selectedSize === size ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                    onClick={() => isAvailable && setSelectedSize(size)}
                    disabled={!isAvailable}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={!isInStock}
        >
          {isInStock ? '🛒 ADD TO CART' : '😢 OUT OF STOCK'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
