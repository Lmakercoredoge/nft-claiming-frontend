import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRateLimit, claimRateLimit } from './backend/middleware/rateLimit.js';
import { sanitizeBody } from './backend/middleware/validation.js';
import { initializeDatabase } from './backend/db/postgres.js';

// 환경변수 로드
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ===== 데이터베이스 초기화 =====
initializeDatabase().catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});

// ===== 보안 미들웨어 =====
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // JSON 크기 제한
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeBody); // XSS 방지

// Rate Limiting - API 경로에만 적용
app.use('/api/claim', claimRateLimit);
app.use('/api/check-eligibility', claimRateLimit);
app.use('/api', apiRateLimit);

// 요청 로깅
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  next();
});

// ===== PUBLIC 폴더 =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== API 라우트 임포트 =====
import claimRoutes from './backend/routes/claim.js';
import checkRoutes from './backend/routes/check.js';
import adminRoutes from './backend/routes/admin.js';
import productsRoutes from './backend/routes/products.js';
import ordersRoutes from './backend/routes/orders.js';

// ===== API 라우트 등록 =====
app.use('/api', claimRoutes);
app.use('/api', checkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);

// ===== 기본 라우트 =====
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 MONGMONG NFT Platform API',
    status: 'running',
    endpoints: {
      health: '/health',
      admin: '/admin',
      products: '/api/products',
      claim: '/api/check-eligibility',
    }
  });
});

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Admin 페이지
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ===== 프론트엔드 (프로덕션) =====
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// ===== 404 핸들러 =====
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path 
  });
});

// ===== 에러 핸들러 =====
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: '서버 오류가 발생했습니다',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===== 서버 시작 =====
app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log('🚀  MONGMONG NFT PLATFORM BACKEND');
  console.log('🚀 ========================================');
  console.log(`📡  Server: http://localhost:${PORT}`);
  console.log(`🏥  Health: http://localhost:${PORT}/health`);
  console.log(`🛍️  Shop API: http://localhost:${PORT}/api/products`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
  console.log(`🌍  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ========================================\n');
});

// 프로세스 종료 처리
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});
