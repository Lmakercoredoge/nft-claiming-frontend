import React from 'react';
import { useCart } from '../../context/CartContext';
import './CartButton.css';

const CartButton = () => {
  const { getTotalItems, toggleCart } = useCart();
  const itemCount = getTotalItems();

  return (
    <button className="cart-button" onClick={toggleCart}>
      <span className="cart-icon">🛒</span>
      {itemCount > 0 && (
        <span className="cart-badge">{itemCount}</span>
      )}
    </button>
  );
};

export default CartButton;
