import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_FILE = path.join(__dirname, '../../data/products.json');
const ORDERS_FILE = path.join(__dirname, '../../data/orders.json');

console.log('📦 Shop DB file:', PRODUCTS_FILE);

// Products 읽기
const readProducts = async () => {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { products: [] };
  }
};

// Products 쓰기
const writeProducts = async (data) => {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(data, null, 2));
};

// Orders 읽기
const readOrders = async () => {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { orders: [], cart: {} };
  }
};

// Orders 쓰기
const writeOrders = async (data) => {
  await fs.writeFile(ORDERS_FILE, JSON.stringify(data, null, 2));
};

// ===== 상품 관리 =====

export const getAllProducts = async () => {
  const data = await readProducts();
  return data.products || [];
};

export const getProductById = async (productId) => {
  const data = await readProducts();
  return data.products.find(p => p.id === productId);
};

export const getProductsByCategory = async (category) => {
  const data = await readProducts();
  return data.products.filter(p => p.category === category);
};

export const getFeaturedProducts = async () => {
  const data = await readProducts();
  return data.products.filter(p => p.featured);
};

export const updateProductStock = async (productId, size, quantity) => {
  const data = await readProducts();
  const product = data.products.find(p => p.id === productId);
  
  if (product && product.stock[size] !== undefined) {
    product.stock[size] -= quantity;
    if (product.stock[size] < 0) product.stock[size] = 0;
    await writeProducts(data);
  }
  
  return product;
};

// ===== 주문 관리 =====

export const createOrder = async (orderData) => {
  const data = await readOrders();
  
  const order = {
    orderId: `ORD-${Date.now()}`,
    ...orderData,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  data.orders.push(order);
  await writeOrders(data);
  
  console.log('✅ Order created:', order.orderId);
  return order;
};

export const getOrderById = async (orderId) => {
  const data = await readOrders();
  return data.orders.find(o => o.orderId === orderId);
};

export const getOrdersByWallet = async (walletAddress) => {
  const data = await readOrders();
  return data.orders
    .filter(o => o.walletAddress === walletAddress)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const updateOrderStatus = async (orderId, status) => {
  const data = await readOrders();
  const order = data.orders.find(o => o.orderId === orderId);
  
  if (order) {
    order.status = status;
    if (status === 'shipped') order.shippedAt = new Date().toISOString();
    if (status === 'delivered') order.deliveredAt = new Date().toISOString();
    await writeOrders(data);
  }
  
  console.log('✅ Order status updated:', orderId, status);
  return order;
};

console.log('✅ Shop database initialized');

export default {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  updateProductStock,
  createOrder,
  getOrderById,
  getOrdersByWallet,
  updateOrderStatus,
};
