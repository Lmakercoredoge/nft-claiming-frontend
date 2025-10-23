/**
 * Input Validation 미들웨어
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Solana 지갑 주소 검증
 */
export const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * 지갑 주소 검증 미들웨어
 */
export const validateWalletAddress = (req, res, next) => {
  const walletAddress = req.body?.walletAddress || 
                       req.params?.walletAddress ||
                       req.query?.wallet;
  
  if (!walletAddress) {
    return res.status(400).json({
      error: '지갑 주소가 필요합니다',
      field: 'walletAddress',
    });
  }
  
  if (!isValidSolanaAddress(walletAddress)) {
    return res.status(400).json({
      error: '유효하지 않은 Solana 지갑 주소입니다',
      field: 'walletAddress',
      provided: walletAddress,
    });
  }
  
  next();
};

/**
 * NFT Mints 배열 검증
 */
export const validateNFTMints = (req, res, next) => {
  const { nftMints } = req.body;
  
  if (!nftMints) {
    return res.status(400).json({
      error: 'NFT 민트 주소가 필요합니다',
      field: 'nftMints',
    });
  }
  
  if (!Array.isArray(nftMints)) {
    return res.status(400).json({
      error: 'NFT 민트 주소는 배열이어야 합니다',
      field: 'nftMints',
    });
  }
  
  if (nftMints.length === 0) {
    return res.status(400).json({
      error: 'NFT가 최소 1개 이상 필요합니다',
      field: 'nftMints',
    });
  }
  
  if (nftMints.length > 100) {
    return res.status(400).json({
      error: 'NFT는 최대 100개까지 처리할 수 있습니다',
      field: 'nftMints',
    });
  }
  
  // 각 NFT 주소 검증
  for (const mint of nftMints) {
    if (typeof mint !== 'string' || !isValidSolanaAddress(mint)) {
      return res.status(400).json({
        error: '유효하지 않은 NFT 민트 주소가 포함되어 있습니다',
        field: 'nftMints',
        invalidMint: mint,
      });
    }
  }
  
  next();
};

/**
 * 클레임 금액 검증
 */
export const validateClaimAmount = (req, res, next) => {
  const { amount } = req.body;
  
  if (amount === undefined || amount === null) {
    return res.status(400).json({
      error: '클레임 금액이 필요합니다',
      field: 'amount',
    });
  }
  
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      error: '클레임 금액은 양수여야 합니다',
      field: 'amount',
      provided: amount,
    });
  }
  
  if (amount > 10000) {
    return res.status(400).json({
      error: '클레임 금액이 너무 큽니다 (최대: 10,000)',
      field: 'amount',
      provided: amount,
    });
  }
  
  next();
};

/**
 * 주문 데이터 검증
 */
export const validateOrderData = (req, res, next) => {
  const { items, shippingInfo, totalPrice } = req.body;
  
  // 아이템 검증
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: '주문 아이템이 필요합니다',
      field: 'items',
    });
  }
  
  // 배송 정보 검증
  if (!shippingInfo) {
    return res.status(400).json({
      error: '배송 정보가 필요합니다',
      field: 'shippingInfo',
    });
  }
  
  const requiredFields = ['name', 'phone', 'address', 'city', 'postalCode'];
  for (const field of requiredFields) {
    if (!shippingInfo[field]) {
      return res.status(400).json({
        error: `배송 정보의 ${field}가 필요합니다`,
        field: `shippingInfo.${field}`,
      });
    }
  }
  
  // 총 금액 검증
  if (typeof totalPrice !== 'number' || totalPrice <= 0) {
    return res.status(400).json({
      error: '유효한 총 금액이 필요합니다',
      field: 'totalPrice',
    });
  }
  
  next();
};

/**
 * 상품 ID 검증
 */
export const validateProductId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      error: '유효한 상품 ID가 필요합니다',
      field: 'id',
    });
  }
  
  next();
};

/**
 * SQL Injection 방지 - 기본 sanitization
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // HTML 태그 제거
    .trim();
};

/**
 * Request Body Sanitization
 */
export const sanitizeBody = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  next();
};

export default {
  isValidSolanaAddress,
  validateWalletAddress,
  validateNFTMints,
  validateClaimAmount,
  validateOrderData,
  validateProductId,
  sanitizeInput,
  sanitizeBody,
};
