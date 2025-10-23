import pool, { query, transaction } from './postgres.js';

/**
 * ==================
 * USERS
 * ==================
 */
export const createOrUpdateUser = async (walletAddress, isNFTHolder, nftCount) => {
  const result = await query(
    `INSERT INTO users (wallet_address, is_nft_holder, nft_count)
     VALUES ($1, $2, $3)
     ON CONFLICT (wallet_address) 
     DO UPDATE SET
       is_nft_holder = $2,
       nft_count = $3,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [walletAddress, isNFTHolder, nftCount]
  );
  return result.rows[0];
};

export const getUserByWallet = async (walletAddress) => {
  const result = await query(
    'SELECT * FROM users WHERE wallet_address = $1',
    [walletAddress]
  );
  return result.rows[0];
};

/**
 * ==================
 * CLAIMS
 * ==================
 */
export const saveClaim = async (walletAddress, amount, nftCount, nftMints, signature) => {
  return await transaction(async (client) => {
    // User 생성/업데이트
    await client.query(
      `INSERT INTO users (wallet_address, is_nft_holder, nft_count)
       VALUES ($1, $2, $3)
       ON CONFLICT (wallet_address) 
       DO UPDATE SET
         is_nft_holder = $2,
         nft_count = $3,
         updated_at = CURRENT_TIMESTAMP`,
      [walletAddress, nftCount > 0, nftCount]
    );

    // Claim 생성
    const claimResult = await client.query(
      `INSERT INTO claims (wallet_address, amount, nft_count, nft_mints, signature, status)
       VALUES ($1, $2, $3, $4, $5, 'success')
       RETURNING *`,
      [walletAddress, amount, nftCount, JSON.stringify(nftMints), signature || '']
    );

    // User stats 업데이트
    await client.query(
      `UPDATE users SET
         total_claims = total_claims + 1,
         total_claimed_amount = total_claimed_amount + $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE wallet_address = $2`,
      [amount, walletAddress]
    );

    const claim = claimResult.rows[0];
    return {
      id: claim.id,
      wallet_address: claim.wallet_address,
      amount: parseFloat(claim.amount),
      nft_count: claim.nft_count,
      nft_mints: claim.nft_mints,
      signature: claim.signature,
      status: claim.status,
      timestamp: new Date(claim.created_at).getTime(),
      created_at: claim.created_at,
    };
  });
};

export const getLastClaim = async (walletAddress) => {
  const result = await query(
    `SELECT * FROM claims
     WHERE wallet_address = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [walletAddress]
  );
  
  if (result.rows.length === 0) return null;
  
  const claim = result.rows[0];
  return {
    ...claim,
    amount: parseFloat(claim.amount),
    timestamp: new Date(claim.created_at).getTime(),
  };
};

export const getAllClaims = async (walletAddress = null) => {
  let result;
  
  if (walletAddress) {
    result = await query(
      'SELECT * FROM claims WHERE wallet_address = $1 ORDER BY created_at DESC',
      [walletAddress]
    );
  } else {
    result = await query('SELECT * FROM claims ORDER BY created_at DESC');
  }

  return result.rows.map(claim => ({
    ...claim,
    amount: parseFloat(claim.amount),
    timestamp: new Date(claim.created_at).getTime(),
  }));
};

export const getClaimStats = async () => {
  // 전체 통계
  const statsResult = await query(`
    SELECT
      COUNT(*) as total_claims,
      COALESCE(SUM(amount), 0) as total_amount,
      COUNT(DISTINCT wallet_address) as unique_wallets
    FROM claims
  `);
  
  const stats = statsResult.rows[0];
  
  // Daily stats (last 7 days)
  const dailyStats = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dailyStats[dateKey] = { claims: 0, amount: 0 };
  }
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const dailyResult = await query(`
    SELECT 
      DATE(created_at) as date, 
      COUNT(*) as count, 
      COALESCE(SUM(amount), 0) as total
    FROM claims
    WHERE created_at >= $1
    GROUP BY DATE(created_at)
  `, [sevenDaysAgo.toISOString()]);
  
  dailyResult.rows.forEach(row => {
    const dateKey = row.date.toISOString().split('T')[0];
    if (dailyStats[dateKey]) {
      dailyStats[dateKey] = {
        claims: parseInt(row.count),
        amount: parseFloat(row.total),
      };
    }
  });

  return {
    totalClaims: parseInt(stats.total_claims) || 0,
    totalAmount: parseFloat(stats.total_amount) || 0,
    uniqueWallets: parseInt(stats.unique_wallets) || 0,
    dailyStats,
  };
};

/**
 * ==================
 * ORDERS
 * ==================
 */
export const createOrder = async (orderData) => {
  const {
    walletAddress,
    items,
    totalPrice,
    currency = 'MONG',
    shippingInfo,
    transactionHash,
  } = orderData;

  const orderId = `ORD-${Date.now()}`;

  const createdOrderId = await transaction(async (client) => {
    // User 생성/업데이트
    await client.query(
      `INSERT INTO users (wallet_address, is_nft_holder, nft_count)
       VALUES ($1, FALSE, 0)
       ON CONFLICT (wallet_address) DO NOTHING`,
      [walletAddress]
    );

    // Order 생성
    await client.query(
      `INSERT INTO orders (order_id, wallet_address, total_price, currency, transaction_hash, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [orderId, walletAddress, totalPrice, currency, transactionHash || '']
    );

    // Order Items 생성
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, size, quantity, price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.productId || item.id, item.name, item.size, item.quantity, item.price]
      );
    }

    // Shipping Info 생성
    await client.query(
      `INSERT INTO shipping_info (order_id, name, phone, address, city, postal_code, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        orderId,
        shippingInfo.name,
        shippingInfo.phone,
        shippingInfo.address,
        shippingInfo.city,
        shippingInfo.postalCode,
        shippingInfo.message || ''
      ]
    );

    // User spent 업데이트
    await client.query(
      `UPDATE users SET
         total_spent = total_spent + $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE wallet_address = $2`,
      [totalPrice, walletAddress]
    );

    return orderId;
  });

  return await getOrderById(createdOrderId);
};

export const getOrderById = async (orderId) => {
  const orderResult = await query(
    'SELECT * FROM orders WHERE order_id = $1',
    [orderId]
  );
  
  if (orderResult.rows.length === 0) return null;
  
  const order = orderResult.rows[0];
  
  // Items 조회
  const itemsResult = await query(
    'SELECT * FROM order_items WHERE order_id = $1',
    [orderId]
  );
  
  // Shipping Info 조회
  const shippingResult = await query(
    'SELECT * FROM shipping_info WHERE order_id = $1',
    [orderId]
  );

  return {
    orderId: order.order_id,
    walletAddress: order.wallet_address,
    items: itemsResult.rows.map(item => ({
      productId: item.product_id,
      name: item.product_name,
      size: item.size,
      quantity: item.quantity,
      price: parseFloat(item.price),
    })),
    totalPrice: parseFloat(order.total_price),
    currency: order.currency,
    status: order.status,
    transactionHash: order.transaction_hash,
    shippingInfo: shippingResult.rows[0] ? {
      name: shippingResult.rows[0].name,
      phone: shippingResult.rows[0].phone,
      address: shippingResult.rows[0].address,
      city: shippingResult.rows[0].city,
      postalCode: shippingResult.rows[0].postal_code,
      message: shippingResult.rows[0].message,
    } : null,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    shippedAt: order.shipped_at,
    deliveredAt: order.delivered_at,
  };
};

export const getOrdersByWallet = async (walletAddress) => {
  const result = await query(
    'SELECT * FROM orders WHERE wallet_address = $1 ORDER BY created_at DESC',
    [walletAddress]
  );
  
  const orders = [];
  
  for (const order of result.rows) {
    const itemsResult = await query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.order_id]
    );
    
    orders.push({
      orderId: order.order_id,
      walletAddress: order.wallet_address,
      items: itemsResult.rows.map(item => ({
        productId: item.product_id,
        name: item.product_name,
        size: item.size,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
      totalPrice: parseFloat(order.total_price),
      currency: order.currency,
      status: order.status,
      transactionHash: order.transaction_hash,
      createdAt: order.created_at,
    });
  }
  
  return orders;
};

export const updateOrderStatus = async (orderId, status) => {
  let queryText;
  
  if (status === 'shipped') {
    queryText = `
      UPDATE orders SET
        status = 'shipped',
        shipped_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $1
      RETURNING *
    `;
  } else if (status === 'delivered') {
    queryText = `
      UPDATE orders SET
        status = 'delivered',
        delivered_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $1
      RETURNING *
    `;
  } else {
    queryText = `
      UPDATE orders SET
        status = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $1
      RETURNING *
    `;
  }
  
  const params = status === 'shipped' || status === 'delivered' 
    ? [orderId] 
    : [orderId, status];
  
  await query(queryText, params);
  
  return await getOrderById(orderId);
};

/**
 * ==================
 * PRODUCTS
 * ==================
 */
export const getAllProducts = async () => {
  const result = await query('SELECT * FROM products ORDER BY created_at DESC');
  
  return result.rows.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: parseFloat(product.price),
    nftHolderDiscount: product.nft_holder_discount,
    featured: product.featured,
    images: product.images,
    sizes: product.sizes,
    colors: product.colors,
    stock: product.stock,
    tags: product.tags,
  }));
};

export const getProductById = async (productId) => {
  const result = await query('SELECT * FROM products WHERE id = $1', [productId]);
  
  if (result.rows.length === 0) return null;
  
  const product = result.rows[0];
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: parseFloat(product.price),
    nftHolderDiscount: product.nft_holder_discount,
    featured: product.featured,
    images: product.images,
    sizes: product.sizes,
    colors: product.colors,
    stock: product.stock,
    tags: product.tags,
  };
};

export const getProductsByCategory = async (category) => {
  const result = await query(
    'SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC',
    [category]
  );
  
  return result.rows.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: parseFloat(product.price),
    nftHolderDiscount: product.nft_holder_discount,
    featured: product.featured,
    images: product.images,
  }));
};

export const getFeaturedProducts = async () => {
  const result = await query(
    'SELECT * FROM products WHERE featured = TRUE ORDER BY created_at DESC'
  );
  
  return result.rows.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: parseFloat(product.price),
    images: product.images,
  }));
};

/**
 * ==================
 * WHITELIST
 * ==================
 */
export const addToWhitelist = async (walletAddress, note = '') => {
  await query(
    'INSERT INTO whitelist (wallet_address, note) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [walletAddress, note]
  );
  return await getWhitelist();
};

export const removeFromWhitelist = async (walletAddress) => {
  await query('DELETE FROM whitelist WHERE wallet_address = $1', [walletAddress]);
  return await getWhitelist();
};

export const isWhitelisted = async (walletAddress) => {
  const result = await query(
    'SELECT * FROM whitelist WHERE wallet_address = $1',
    [walletAddress]
  );
  return result.rows.length > 0;
};

export const getWhitelist = async () => {
  const result = await query('SELECT * FROM whitelist ORDER BY added_at DESC');
  return result.rows.map(item => ({
    address: item.wallet_address,
    note: item.note,
    added_at: item.added_at,
  }));
};

/**
 * ==================
 * NFT COLLECTIONS
 * ==================
 */
export const addNFTCollection = async (collectionHash, name = '', rewardAmount = 100) => {
  await query(
    'INSERT INTO nft_collections (collection_hash, name, reward_amount, enabled) VALUES ($1, $2, $3, TRUE) ON CONFLICT DO NOTHING',
    [collectionHash, name, rewardAmount]
  );
  return await getNFTCollections();
};

export const removeNFTCollection = async (collectionHash) => {
  await query('DELETE FROM nft_collections WHERE collection_hash = $1', [collectionHash]);
  return await getNFTCollections();
};

export const toggleNFTCollection = async (collectionHash) => {
  await query(
    'UPDATE nft_collections SET enabled = NOT enabled WHERE collection_hash = $1',
    [collectionHash]
  );
  return await getNFTCollections();
};

export const isValidNFTCollection = async (collectionHash) => {
  const result = await query(
    'SELECT * FROM nft_collections WHERE collection_hash = $1 AND enabled = TRUE',
    [collectionHash]
  );
  return result.rows.length > 0;
};

export const getNFTCollections = async () => {
  const result = await query('SELECT * FROM nft_collections ORDER BY added_at DESC');
  return result.rows.map(col => ({
    hash: col.collection_hash,
    name: col.name,
    rewardAmount: parseFloat(col.reward_amount),
    enabled: col.enabled,
    added_at: col.added_at,
  }));
};

/**
 * ==================
 * SETTINGS
 * ==================
 */
export const getSettings = async () => {
  const result = await query('SELECT key, value FROM settings');
  const settings = {};
  
  result.rows.forEach(row => {
    let value = row.value;
    
    // 자동 타입 변환
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (!isNaN(value)) value = Number(value);
    
    settings[row.key] = value;
  });

  return settings;
};

export const updateSettings = async (newSettings) => {
  await transaction(async (client) => {
    for (const [key, value] of Object.entries(newSettings)) {
      await client.query(
        `INSERT INTO settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value)]
      );
    }
  });
  
  return await getSettings();
};

export default {
  // Users
  createOrUpdateUser,
  getUserByWallet,
  // Claims
  saveClaim,
  getLastClaim,
  getAllClaims,
  getClaimStats,
  // Orders
  createOrder,
  getOrderById,
  getOrdersByWallet,
  updateOrderStatus,
  // Products
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  // Whitelist
  addToWhitelist,
  removeFromWhitelist,
  isWhitelisted,
  getWhitelist,
  // NFT Collections
  addNFTCollection,
  removeNFTCollection,
  toggleNFTCollection,
  isValidNFTCollection,
  getNFTCollections,
  // Settings
  getSettings,
  updateSettings,
};
