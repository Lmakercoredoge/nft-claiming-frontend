import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// CORS 설정
app.use(cors());
app.use(express.json());

// 로그
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ===== API: 상품 조회 =====
app.get('/api/products', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf-8');
    const products = JSON.parse(data);
    console.log('✅ Products sent:', products.products.length);
    res.json({ success: true, products: products.products });
  } catch (error) {
    console.error('❌ Products error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== API: 설정 조회 =====
app.get('/api/admin/settings', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'claims.json'), 'utf-8');
    const claims = JSON.parse(data);
    console.log('✅ Settings sent:', claims.settings);
    res.json({ success: true, settings: claims.settings });
  } catch (error) {
    console.error('❌ Settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== API: 화이트리스트 조회 =====
app.get('/api/admin/whitelist', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'claims.json'), 'utf-8');
    const claims = JSON.parse(data);
    console.log('✅ Whitelist sent:', claims.whitelist.length);
    res.json({ success: true, whitelist: claims.whitelist });
  } catch (error) {
    console.error('❌ Whitelist error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== API: 자격 확인 =====
app.get('/api/check-eligibility', async (req, res) => {
  try {
    const wallet = req.query.wallet;
    const data = await fs.readFile(path.join(__dirname, 'data', 'claims.json'), 'utf-8');
    const claims = JSON.parse(data);
    
    const isWhitelisted = claims.whitelist.some(w => w.address === wallet);
    
    console.log(`✅ Eligibility check for ${wallet}: ${isWhitelisted}`);
    
    res.json({ 
      success: true, 
      eligible: isWhitelisted,
      amount: isWhitelisted ? claims.settings.claimAmountPerNFT : 0,
      nftCount: 1
    });
  } catch (error) {
    console.error('❌ Eligibility error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== 헬스 체크 =====
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== 메인 =====
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 MONGMONG Backend',
    endpoints: {
      products: '/api/products',
      settings: '/api/admin/settings',
      whitelist: '/api/admin/whitelist',
      eligibility: '/api/check-eligibility?wallet=YOUR_WALLET'
    }
  });
});

// ===== 서버 시작 =====
app.listen(PORT, () => {
  console.log('\n');
  console.log('🚀 ========================================');
  console.log('🚀  MONGMONG BACKEND SERVER');
  console.log('🚀 ========================================');
  console.log(`📡  http://localhost:${PORT}`);
  console.log(`🛍️  http://localhost:${PORT}/api/products`);
  console.log(`⚙️  http://localhost:${PORT}/api/admin/settings`);
  console.log('🚀 ========================================\n');
});
