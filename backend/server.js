import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
} from '@solana/spl-token';
import bs58 from 'bs58';
import adminRoutes from './routes/admin.js';
import db from './db/json-db.js';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Admin 라우트
app.use('/api/admin', adminRoutes);

// Solana 연결 설정
const network = process.env.NETWORK || 'mainnet-beta';
const rpcEndpoint = process.env.RPC_ENDPOINT || clusterApiUrl(network);
const connection = new Connection(rpcEndpoint, 'confirmed');

// Treasury 지갑 설정
let treasuryKeypair = null;
try {
  const privateKeyString = process.env.TREASURY_PRIVATE_KEY;
  if (!privateKeyString || privateKeyString === 'your_private_key_here' || privateKeyString === '') {
    console.warn('⚠️  Treasury 개인키가 설정되지 않았습니다.');
  } else {
    const privateKeyBytes = bs58.decode(privateKeyString);
    treasuryKeypair = Keypair.fromSecretKey(privateKeyBytes);
    console.log('✅ Treasury 지갑 로드 성공:', treasuryKeypair.publicKey.toString());
  }
} catch (error) {
  console.warn('⚠️  Treasury 지갑 로드 실패:', error.message);
}

// 토큰 설정
const TOKEN_MINT = new PublicKey(process.env.TOKEN_MINT_ADDRESS);
const TOKEN_DECIMALS = 8;

// 클레임 쿨다운 (24시간)
const CLAIM_COOLDOWN = 24 * 60 * 60 * 1000;

/**
 * 헬스 체크
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    network: network,
    treasuryWallet: treasuryKeypair?.publicKey.toString(),
    timestamp: Date.now(),
  });
});

/**
 * 클레임 가능 여부 확인 (DB 사용)
 */
app.post('/api/check-claim', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: '지갑 주소가 필요합니다' });
    }
    
    // DB에서 마지막 클레임 확인
    const lastClaim = await db.getLastClaim(walletAddress);
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
    
    // 처음 클레임
    res.json({
      canClaim: true,
      timeRemaining: 0,
      lastClaim: null,
    });
    
  } catch (error) {
    console.error('❌ 클레임 확인 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

/**
 * 토큰 클레임 실행 (DB에 저장)
 */
app.post('/api/claim', async (req, res) => {
  try {
    const { walletAddress, nftMints, amount } = req.body;
    
    console.log('🎯 클레임 요청:', { walletAddress, nftCount: nftMints?.length, amount });
    
    // 입력 검증
    if (!walletAddress || !nftMints || !amount) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다' });
    }
    
    // DB에서 쿨다운 체크
    const lastClaim = await db.getLastClaim(walletAddress);
    const now = Date.now();
    
    if (lastClaim) {
      const timeSinceLastClaim = now - lastClaim.timestamp;
      if (timeSinceLastClaim < CLAIM_COOLDOWN) {
        const timeRemaining = CLAIM_COOLDOWN - timeSinceLastClaim;
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        
        return res.status(429).json({
          error: `다음 클레임까지 ${hours}시간 ${minutes}분 남았습니다`,
          timeRemaining,
        });
      }
    }
    
    // NFT 검증
    if (!Array.isArray(nftMints) || nftMints.length === 0) {
      return res.status(400).json({ error: 'NFT를 보유하고 있지 않습니다' });
    }
    
    // 토큰 전송
    const recipient = new PublicKey(walletAddress);
    const transferAmount = amount * Math.pow(10, TOKEN_DECIMALS);
    
    const fromTokenAccount = await getAssociatedTokenAddress(
      TOKEN_MINT,
      treasuryKeypair.publicKey,
      false,
      TOKEN_PROGRAM_ID
    );
    
    const toTokenAccount = await getAssociatedTokenAddress(
      TOKEN_MINT,
      recipient,
      false,
      TOKEN_PROGRAM_ID
    );
    
    const transaction = new Transaction();
    
    // 토큰 계정 생성 확인
    try {
      await getAccount(connection, toTokenAccount);
    } catch (error) {
      console.log('📝 토큰 계정 생성 필요');
      const createIx = createAssociatedTokenAccountInstruction(
        treasuryKeypair.publicKey,
        toTokenAccount,
        recipient,
        TOKEN_MINT,
        TOKEN_PROGRAM_ID
      );
      transaction.add(createIx);
    }
    
    // 토큰 전송
    const transferIx = createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      treasuryKeypair.publicKey,
      transferAmount,
      [],
      TOKEN_PROGRAM_ID
    );
    
    transaction.add(transferIx);
    
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = treasuryKeypair.publicKey;
    
    transaction.sign(treasuryKeypair);
    
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature, 'confirmed');
    
    console.log(`✅ 토큰 전송 성공: ${signature}`);
    
    // ✅ DB에 클레임 저장!
    await db.saveClaim(walletAddress, amount, nftMints.length, nftMints, signature);
    
    console.log('💾 DB 저장 완료');
    
    res.json({
      success: true,
      signature,
      amount,
      explorerUrl: `https://explorer.solana.com/tx/${signature}`,
    });
    
  } catch (error) {
    console.error('❌ 클레임 오류:', error);
    res.status(500).json({
      error: '토큰 클레임에 실패했습니다',
      details: error.message,
    });
  }
});

/**
 * 클레임 이력 조회 (DB 사용)
 */
app.get('/api/claim-history/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const history = await db.getAllClaims(walletAddress);
    
    if (!history || history.length === 0) {
      return res.json({ claimed: false, history: [] });
    }
    
    res.json({
      claimed: true,
      history: history,
    });
    
  } catch (error) {
    console.error('❌ 이력 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 NFT Claiming Backend Server Started!');
  console.log('═══════════════════════════════════════');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin.html`);
  console.log(`🌐 Network: ${network}`);
  console.log(`💰 Treasury: ${treasuryKeypair?.publicKey.toString()}`);
  console.log(`🪙 Token: ${TOKEN_MINT.toString()}`);
  console.log('═══════════════════════════════════════');
  console.log('✨ Ready to process claims with DB!');
  console.log('');
});
