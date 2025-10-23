import express from 'express';
import db from '../db/json-db.js';

const router = express.Router();

// Admin 계정
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

// ===== 로그인 =====
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('🔐 로그인 시도:', username);
  
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    console.log('✅ 로그인 성공');
    res.json({ success: true, token });
  } else {
    console.log('❌ 로그인 실패');
    res.status(401).json({ error: '아이디 또는 비밀번호가 틀렸습니다' });
  }
});

// ===== 설정 =====
router.get('/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('❌ Settings get error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { enabled, claimAmountPerNFT, maxClaimAmount, cooldownHours, maxClaimableNFTs } = req.body;
    
    const updateData = {};
    if (enabled !== undefined) updateData.enabled = enabled;
    if (claimAmountPerNFT !== undefined) updateData.claimAmountPerNFT = claimAmountPerNFT;
    if (maxClaimAmount !== undefined) updateData.maxClaimAmount = maxClaimAmount;
    if (cooldownHours !== undefined) updateData.cooldownHours = cooldownHours;
    if (maxClaimableNFTs !== undefined) updateData.maxClaimableNFTs = maxClaimableNFTs;
    
    const settings = await db.updateSettings(updateData);
    
    console.log('✅ Settings updated:', settings);
    res.json({ success: true, settings });
  } catch (error) {
    console.error('❌ Settings update error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// ===== 통계 =====
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

router.get('/recent-claims', async (req, res) => {
  try {
    const allClaims = await db.getAllClaims('');
    const recentClaims = allClaims.slice(0, 10);
    res.json({ success: true, claims: recentClaims });
  } catch (error) {
    console.error('❌ Recent claims error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// ===== 화이트리스트 =====
router.get('/whitelist', async (req, res) => {
  try {
    const whitelist = await db.getWhitelist();
    res.json({ success: true, whitelist });
  } catch (error) {
    console.error('❌ Whitelist get error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

router.post('/whitelist', async (req, res) => {
  try {
    const { address, note } = req.body;
    if (!address) {
      return res.status(400).json({ error: '지갑 주소가 필요합니다' });
    }
    const whitelist = await db.addToWhitelist(address, note);
    res.json({ success: true, whitelist });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/whitelist/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const whitelist = await db.removeFromWhitelist(address);
    res.json({ success: true, whitelist });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// ===== NFT 컬렉션 =====
router.get('/nft-collections', async (req, res) => {
  try {
    const collections = await db.getNFTCollections();
    res.json({ success: true, collections });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

router.post('/nft-collections', async (req, res) => {
  try {
    const { hash, name, rewardAmount } = req.body;
    if (!hash) {
      return res.status(400).json({ error: '컬렉션 해시가 필요합니다' });
    }
    const collections = await db.addNFTCollection(hash, name, rewardAmount);
    res.json({ success: true, collections });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/nft-collections/:hash/toggle', async (req, res) => {
  try {
    const { hash } = req.params;
    const collections = await db.toggleNFTCollection(hash);
    res.json({ success: true, collections });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

router.delete('/nft-collections/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const collections = await db.removeNFTCollection(hash);
    res.json({ success: true, collections });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

export default router;
