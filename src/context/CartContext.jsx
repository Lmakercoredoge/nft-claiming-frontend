import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 로컬 스토리지에서 장바구니 로드
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
  }, []);

  // 장바구니 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * 장바구니에 상품 추가
   */
  const addToCart = (product, quantity = 1, selectedSize = null) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.selectedSize === selectedSize
      );

      if (existingItemIndex > -1) {
        // 이미 있는 상품 - 수량 증가
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // 새 상품 추가
        return [
          ...prevItems,
          {
            ...product,
            quantity,
            selectedSize,
            addedAt: Date.now(),
          },
        ];
      }
    });

    // 장바구니 열기
    setIsCartOpen(true);
  };

  /**
   * 장바구니에서 상품 제거
   */
  const removeFromCart = (productId, selectedSize = null) => {
    setCartItems(prevItems =>
      prevItems.filter(
        item => !(item.id === productId && item.selectedSize === selectedSize)
      )
    );
  };

  /**
   * 상품 수량 변경
   */
  const updateQuantity = (productId, quantity, selectedSize = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  /**
   * 장바구니 비우기
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * 총 상품 개수
   */
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * 총 금액 계산
   */
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  /**
   * NFT 홀더 할인 적용 총 금액
   */
  const getTotalPriceWithDiscount = (isNFTHolder = false) => {
    return cartItems.reduce((total, item) => {
      let price = item.price || 0;
      
      // NFT 홀더 할인 적용
      if (isNFTHolder && item.nftHolderDiscount) {
        price = price * (1 - item.nftHolderDiscount / 100);
      }
      
      return total + price * item.quantity;
    }, 0);
  };

  /**
   * 장바구니 열기/닫기
   */
  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  /**
   * 특정 상품이 장바구니에 있는지 확인
   */
  const isInCart = (productId, selectedSize = null) => {
    return cartItems.some(
      item => item.id === productId && item.selectedSize === selectedSize
    );
  };

  /**
   * 특정 상품의 수량 가져오기
   */
  const getItemQuantity = (productId, selectedSize = null) => {
    const item = cartItems.find(
      item => item.id === productId && item.selectedSize === selectedSize
    );
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getTotalPriceWithDiscount,
    toggleCart,
    openCart,
    closeCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
