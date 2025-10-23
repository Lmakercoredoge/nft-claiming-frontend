import express from 'express';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import {
  saveClaim,
  getLastClaim,
  isWhitelisted,
  isValidNFTCollection,
  getSettings,
} from '../db/database.js';
import { claimRateLimiter, apiRateLimiter } from '../middleware/rateLimiter.js';
import { 
  validateWalletAddress, 
  validateNFTMints, 
  validateClaimAmount,
  sanitizeBody 
} from '../middleware/validation.js';

const router = express.Router();

/**
 * POST /api/check-eligibility
 * 클레임 가능 여부 확인
 */
router.post('/check-eligibility', 
  apiRateLimiter,
  sanitizeBody,
  validateWalletAddress,
  async (req, res) => {
    try {
      const { walletAddress, nftMints } = req.body;

      if (!nftMints || !Array.isArray(nftMints)) {
        return res.status(400).json({ 
          eligible: false,
          error: '잘못된 요청입니다' 
        });
      }

      // 설정 로드
      const settings = await getSettings();

      // 1. 클레임 기능이 활성화되어 있는지 확인
      if (!settings.enabled) {
        return res.json({
          eligible: false,
          reason: 'claim_disabled',
          message: '현재 클레임 기능이 비활성화되어 있습니다',
        });
      }

      // 2. 화이트리스트 확인
      const whitelisted = await isWhitelisted(walletAddress);
      if (!whitelisted) {
        return res.json({
          eligible: false,
          reason: 'not_whitelisted',
          message: '화이트리스트에 등록되지 않은 지갑입니다',
        });
      }

      // 3. NFT 컬렉션 검증
      const validNFTs = [];
      for (const mint of nftMints) {
        const isValid = await isValidNFTCollection(mint);
        if (isValid) {
          validNFTs.push(mint);
        }
      }

      if (validNFTs.length === 0) {
        return res.json({
          eligible: false,
          reason: 'no_valid_nfts',
          message: '허용된 NFT 컬렉션이 없습니다',
        });
      }

      // 4. 쿨다운 확인
      const lastClaim = await getLastClaim(walletAddress);
      if (lastClaim) {
        const cooldownMs = settings.cooldownHours * 60 * 60 * 1000;
        const timeSinceLastClaim = Date.now() - lastClaim.timestamp;
        
        if (timeSinceLastClaim < cooldownMs) {
          const remainingMs = cooldownMs - timeSinceLastClaim;
          const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
          
          return res.json({
            eligible: false,
            reason: 'cooldown',
            message: `다음 클레임까지 ${remainingHours}시간 남았습니다`,
            remainingTime: remainingMs,
          });
        }
      }

      // 5. 클레임 금액 계산
      const nftCount = validNFTs.length;
      const amount = Math.min(
        nftCount * settings.claimAmountPerNFT,
        settings.maxClaimAmount
      );

      return res.json({
        eligible: true,
        nftCount,
        validNFTs,
        amount,
        message: `${amount} MONG 토큰을 클레임할 수 있습니다`,
      });

    } catch (error) {
      console.error('❌ 클레임 가능 여부 확인 오류:', error);
      res.status(500).json({ 
        eligible: false,
        error: '서버 오류가 발생했습니다',
        details: error.message 
      });
    }
});

/**
 * POST /api/claim
 * 클레임 실행
 */
router.post('/claim',
  claimRateLimiter,
  sanitizeBody,
  validateWalletAddress,
  validateClaimAmount,
  async (req, res) => {
    try {
      const { walletAddress, amount, nftCount, nftMints, signature } = req.body;

      if (!signature) {
        return res.status(400).json({ 
          success: false,
          error: '트랜잭션 서명이 필요합니다' 
        });
      }

      // 재검증
      const settings = await getSettings();

      // 1. 클레임 기능 활성화 확인
      if (!settings.enabled) {
        return res.status(403).json({
          success: false,
          error: '클레임 기능이 비활성화되어 있습니다',
        });
      }

      // 2. 화이트리스트 확인
      const whitelisted = await isWhitelisted(walletAddress);
      if (!whitelisted) {
        return res.status(403).json({
          success: false,
          error: '화이트리스트에 등록되지 않은 지갑입니다',
        });
      }

      // 3. 쿨다운 확인
      const lastClaim = await getLastClaim(walletAddress);
      if (lastClaim) {
        const cooldownMs = settings.cooldownHours * 60 * 60 * 1000;
        const timeSinceLastClaim = Date.now() - lastClaim.timestamp;
        
        if (timeSinceLastClaim < cooldownMs) {
          const remainingHours = Math.ceil((cooldownMs - timeSinceLastClaim) / (60 * 60 * 1000));
          return res.status(429).json({
            success: false,
            error: `다음 클레임까지 ${remainingHours}시간 남았습니다`,
          });
        }
      }

      // 4. 클레임 저장
      const claim = await saveClaim(
        walletAddress,
        amount,
        nftCount || 0,
        nftMints || [],
        signature
      );

      console.log('✅ 클레임 성공:', claim);

      res.json({
        success: true,
        claim,
        message: '클레임이 완료되었습니다!',
      });

    } catch (error) {
      console.error('❌ 클레임 처리 오류:', error);
      res.status(500).json({ 
        success: false,
        error: '서버 오류가 발생했습니다',
        details: error.message 
      });
    }
});

export default router;
