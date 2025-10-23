import express from 'express';
import { getLastClaim, getAllClaims } from '../db/database.js';

const router = express.Router();

const CLAIM_COOLDOWN = 24 * 60 * 60 * 1000; // 24시간

/**
 * POST /api/check-claim
 * 클레임 가능 여부 확인
 */
router.post('/check-claim', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: '지갑 주소가 필요합니다' });
    }
    
    const lastClaim = getLastClaim(walletAddress);
    const now = Date.now();
    
    if (lastClaim) {
      const timeSinceLastClaim = now - lastClaim.timestamp;
      const canClaim = timeSinceLastClaim >= CLAIM_COOLDOWN;
      const timeRemaining = canClaim ? 0 : CLAIM_COOLDOWN - timeSinceLastClaim;
      
      return res.json({
        canClaim,
        timeRemaining,
        lastClaim: lastClaim.timestamp,
        lastAmount: lastClaim.amount,
      });
    }
    
    // 처음 클레임하는 경우
    res.json({
      canClaim: true,
      timeRemaining: 0,
      lastClaim: null,
    });
    
  } catch (error) {
    console.error('클레임 확인 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

/**
 * GET /api/claim-history/:walletAddress
 * 클레임 이력 조회
 */
router.get('/claim-history/:walletAddress', (req, res) => {
  try {
    const { walletAddress } = req.params;
    const history = getAllClaims(walletAddress);
    
    if (!history || history.length === 0) {
      return res.json({ claimed: false, history: [] });
    }
    
    res.json({
      claimed: true,
      history: history,
    });
    
  } catch (error) {
    console.error('이력 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

export default router;
