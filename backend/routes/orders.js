import express from 'express';
import { 
  createOrder as saveOrder, 
  getOrderById, 
  getOrdersByWallet,
  updateOrderStatus 
} from '../db/database.js';
import { 
  validateWalletAddress, 
  validateOrderData 
} from '../middleware/validation.js';

const router = express.Router();

/**
 * POST /api/orders
 * 주문 생성
 */
router.post('/', validateOrderData, async (req, res) => {
  try {
    const { walletAddress, items, totalPrice, shippingInfo, transactionHash, currency } = req.body;

    console.log('📦 Creating order:', {
      wallet: walletAddress,
      items: items.length,
      totalPrice,
      txHash: transactionHash,
    });

    // 주문 데이터 구성
    const orderData = {
      walletAddress,
      items,
      totalPrice,
      currency: currency || 'MONG',
      shippingInfo,
      transactionHash,
    };

    // 주문 저장
    const order = saveOrder(orderData);

    console.log('✅ Order created:', order.orderId);

    res.json({
      success: true,
      order,
      message: '주문이 생성되었습니다',
    });

  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({
      success: false,
      error: '주문 생성 중 오류가 발생했습니다',
    });
  }
});

/**
 * GET /api/orders/:orderId
 * 주문 상세 조회
 */
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다',
      });
    }

    res.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error('❌ Order fetch error:', error);
    res.status(500).json({
      success: false,
      error: '주문 조회 중 오류가 발생했습니다',
    });
  }
});

/**
 * GET /api/orders/wallet/:walletAddress
 * 지갑 주소로 주문 목록 조회
 */
router.get('/wallet/:walletAddress', validateWalletAddress, async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const orders = getOrdersByWallet(walletAddress);

    res.json({
      success: true,
      orders,
      count: orders.length,
    });

  } catch (error) {
    console.error('❌ Orders fetch error:', error);
    res.status(500).json({
      success: false,
      error: '주문 목록 조회 중 오류가 발생했습니다',
    });
  }
});

/**
 * PATCH /api/orders/:orderId/status
 * 주문 상태 업데이트 (관리자용)
 */
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: '올바르지 않은 주문 상태입니다',
      });
    }

    const order = updateOrderStatus(orderId, status);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다',
      });
    }

    console.log('✅ Order status updated:', orderId, status);

    res.json({
      success: true,
      order,
      message: '주문 상태가 업데이트되었습니다',
    });

  } catch (error) {
    console.error('❌ Order status update error:', error);
    res.status(500).json({
      success: false,
      error: '주문 상태 업데이트 중 오류가 발생했습니다',
    });
  }
});

/**
 * POST /api/orders/:orderId/verify
 * 트랜잭션 검증
 */
router.post('/:orderId/verify', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { transactionHash } = req.body;

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        error: '트랜잭션 해시가 필요합니다',
      });
    }

    // 주문 조회
    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다',
      });
    }

    if (order.transactionHash !== transactionHash) {
      return res.status(400).json({
        success: false,
        error: '트랜잭션 해시가 일치하지 않습니다',
      });
    }

    // Solana 블록체인에서 실제 트랜잭션 검증
    const { verifyOrderPayment } = await import('../utils/transactionVerifier.js');
    
    const treasuryAddress = process.env.TREASURY_WALLET_ADDRESS;
    if (!treasuryAddress) {
      console.warn('⚠️ TREASURY_WALLET_ADDRESS not set, skipping on-chain verification');
      
      return res.json({
        success: true,
        verified: true,
        message: '주문이 확인되었습니다 (오프체인)',
      });
    }

    const verification = await verifyOrderPayment(
      transactionHash,
      order.totalPrice,
      treasuryAddress
    );

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        error: '블록체인 검증 실패',
        details: verification.error,
      });
    }

    // 주문 상태 업데이트
    await updateOrderStatus(orderId, 'processing');

    console.log('✅ Order verified on-chain:', orderId);

    res.json({
      success: true,
      verified: true,
      message: '트랜잭션이 블록체인에서 검증되었습니다',
      blockTime: verification.blockTime,
      amount: verification.amount,
    });

  } catch (error) {
    console.error('❌ Transaction verification error:', error);
    res.status(500).json({
      success: false,
      error: '트랜잭션 검증 중 오류가 발생했습니다',
    });
  }
});

export default router;
