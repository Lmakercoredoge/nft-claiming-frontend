import React from 'react';
import { useCart } from '../../context/CartContext';
import { useWallet } from '@solana/wallet-adapter-react';
import './Cart.css';

const Cart = () => {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity,
    getTotalPrice,
    getTotalPriceWithDiscount,
    clearCart
  } = useCart();
  
  const { publicKey } = useWallet();
  const isNFTHolder = !!publicKey;

  const totalPrice = getTotalPrice();
  const discountedPrice = getTotalPriceWithDiscount(isNFTHolder);
  const discount = totalPrice - discountedPrice;

  const handleCheckout = () => {
    if (!publicKey) {
      alert('지갑을 먼저 연결해주세요!');
      return;
    }
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다!');
      return;
    }
    alert('결제 기능은 곧 추가됩니다!');
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={closeCart}></div>
      <div className="cart-sidebar">
        <div className="cart-header">
          <h2>🛒 장바구니</h2>
          <button className="cart-close-btn" onClick={closeCart}>×</button>
        </div>
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-icon">🛒</div>
              <p>장바구니가 비어있습니다</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="cart-item">
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      {item.selectedSize && <p className="item-size">Size: {item.selectedSize}</p>}
                      <p className="item-price">{item.price} MONG</p>
                      <div className="item-quantity">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}>+</button>
                      </div>
                    </div>
                    <button className="item-remove-btn" onClick={() => removeFromCart(item.id, item.selectedSize)}>🗑️</button>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <div className="summary-row total">
                  <span>총액</span>
                  <span>{discountedPrice.toFixed(2)} MONG</span>
                </div>
              </div>
              <div className="cart-actions">
                <button className="clear-cart-btn" onClick={clearCart}>장바구니 비우기</button>
                <button className="checkout-btn" onClick={handleCheckout}>결제하기</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
