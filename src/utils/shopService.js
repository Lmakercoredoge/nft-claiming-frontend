/**
 * 쇼핑몰 API 서비스
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:3000');

/**
 * 모든 상품 조회
 */
export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    
    if (!response.ok) {
      throw new Error('상품을 불러올 수 없습니다');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Products fetch error:', error);
    throw error;
  }
};

/**
 * 카테고리별 상품 조회
 */
export const fetchProductsByCategory = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/category/${category}`);
    
    if (!response.ok) {
      throw new Error('상품을 불러올 수 없습니다');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Products by category error:', error);
    throw error;
  }
};

/**
 * 상품 상세 조회
 */
export const fetchProductById = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
    
    if (!response.ok) {
      throw new Error('상품을 찾을 수 없습니다');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Product detail error:', error);
    throw error;
  }
};

/**
 * Featured 상품 조회
 */
export const fetchFeaturedProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/featured/list`);
    
    if (!response.ok) {
      throw new Error('Featured 상품을 불러올 수 없습니다');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Featured products error:', error);
    throw error;
  }
};

/**
 * 설정 조회
 */
export const fetchSettings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/settings`);
    
    if (!response.ok) {
      throw new Error('설정을 불러올 수 없습니다');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Settings error:', error);
    throw error;
  }
};

/**
 * NFT 홀더 자격 확인
 */
export const checkEligibility = async (walletAddress) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/check-eligibility?wallet=${walletAddress}`);
    
    if (!response.ok) {
      throw new Error('자격 확인 실패');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Eligibility check error:', error);
    throw error;
  }
};

/**
 * 주문 생성
 */
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      throw new Error('주문 생성 실패');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Order creation error:', error);
    throw error;
  }
};

/**
 * 주문 조회
 */
export const fetchOrders = async (walletAddress) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${walletAddress}`);
    
    if (!response.ok) {
      throw new Error('주문 조회 실패');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Orders fetch error:', error);
    throw error;
  }
};

export default {
  fetchProducts,
  fetchProductsByCategory,
  fetchProductById,
  fetchFeaturedProducts,
  fetchSettings,
  checkEligibility,
  createOrder,
  fetchOrders,
};
