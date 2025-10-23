# 🛍️ NFT 마켓플레이스 구현 가이드

유료 RPC를 사용하면 완전한 NFT 마켓플레이스를 구축할 수 있습니다!

---

## 📊 현재 상태 vs 완성 마켓플레이스

### ✅ 이미 구현된 기능

| 기능 | 상태 | 파일 위치 |
|-----|------|----------|
| NFT 조회 | ✅ | `src/utils/nftVerification.js` |
| 지갑 연결 | ✅ | `src/components/WalletConnect.jsx` |
| NFT 갤러리 | ✅ | `src/components/NFTGallery.jsx` |
| 상품 관리 (기본) | ✅ | `src/pages/Shop.jsx` |
| 장바구니 | ✅ | `src/components/shop/Cart.jsx` |
| 결제 UI | ✅ | `src/components/ClaimButton.jsx` |

### 🚀 추가할 기능 (마켓플레이스)

| 기능 | 난이도 | 예상 시간 | 설명 |
|-----|--------|----------|------|
| **NFT 목록 조회** | ⭐⭐ | 2시간 | 사용자 NFT 전체 표시 |
| **NFT 판매 등록** | ⭐⭐⭐ | 4시간 | 가격 설정, 판매 등록 |
| **NFT 구매** | ⭐⭐⭐⭐ | 6시간 | SPL Token 결제, 소유권 이전 |
| **판매 취소** | ⭐⭐ | 2시간 | 등록 취소 |
| **거래 내역** | ⭐⭐ | 3시간 | 구매/판매 히스토리 |
| **검색/필터** | ⭐⭐ | 2시간 | 가격, 이름으로 검색 |
| **즐겨찾기** | ⭐ | 1시간 | NFT 북마크 |

**총 예상 시간: 20-25시간** (숙련도에 따라 다름)

---

## 🏗️ 마켓플레이스 아키텍처

```
┌─────────────────────────────────────────────┐
│           Frontend (React)                   │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐│
│  │ NFT Gallery│  │Marketplace│  │My Listings││
│  └────────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│         Backend API (Express)                │
│  ┌────────┐  ┌─────────┐  ┌────────────┐   │
│  │Listings│  │Orders   │  │Transactions│   │
│  └────────┘  └─────────┘  └────────────┘   │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│            Solana Blockchain                 │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐│
│  │NFT Transfer│  │SPL Token │  │Escrow    ││
│  └────────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────┘
```

---

## 💻 구현 단계별 가이드

### Phase 1: NFT 마켓플레이스 UI (3-4시간)

#### 1.1 마켓플레이스 페이지 생성

```jsx
// src/pages/Marketplace.jsx
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    loadListings();
  }, []);
  
  const loadListings = async () => {
    const response = await fetch('/api/marketplace/listings');
    const data = await response.json();
    setListings(data.listings);
  };
  
  return (
    <div className="marketplace">
      <h1>🛍️ NFT Marketplace</h1>
      
      {/* 필터 */}
      <div className="filters">
        <select onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All NFTs</option>
          <option value="cheap">Low Price</option>
          <option value="expensive">High Price</option>
        </select>
      </div>
      
      {/* NFT 목록 */}
      <div className="nft-grid">
        {listings.map(listing => (
          <NFTCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
};
```

#### 1.2 NFT 카드 컴포넌트

```jsx
// src/components/marketplace/NFTCard.jsx
const NFTCard = ({ listing }) => {
  const { publicKey } = useWallet();
  const [buying, setBuying] = useState(false);
  
  const handleBuy = async () => {
    setBuying(true);
    try {
      await buyNFT(listing.id, publicKey);
      alert('구매 성공!');
    } catch (error) {
      alert('구매 실패: ' + error.message);
    } finally {
      setBuying(false);
    }
  };
  
  return (
    <div className="nft-card">
      <img src={listing.image} alt={listing.name} />
      <h3>{listing.name}</h3>
      <p className="price">{listing.price} MONG</p>
      <p className="seller">Seller: {listing.seller.slice(0,8)}...</p>
      <button onClick={handleBuy} disabled={buying}>
        {buying ? '구매 중...' : 'Buy Now'}
      </button>
    </div>
  );
};
```

---

### Phase 2: 판매 등록 기능 (4-5시간)

#### 2.1 판매 등록 페이지

```jsx
// src/pages/ListNFT.jsx
const ListNFT = () => {
  const [myNFTs, setMyNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [price, setPrice] = useState('');
  
  const handleList = async () => {
    if (!selectedNFT || !price) {
      alert('NFT와 가격을 선택하세요');
      return;
    }
    
    try {
      await listNFTForSale(selectedNFT.mint, price);
      alert('판매 등록 완료!');
    } catch (error) {
      alert('등록 실패: ' + error.message);
    }
  };
  
  return (
    <div className="list-nft">
      <h1>💰 Sell Your NFT</h1>
      
      {/* 내 NFT 선택 */}
      <div className="my-nfts">
        {myNFTs.map(nft => (
          <div 
            key={nft.mint}
            className={selectedNFT?.mint === nft.mint ? 'selected' : ''}
            onClick={() => setSelectedNFT(nft)}
          >
            <img src={nft.image} alt={nft.name} />
            <p>{nft.name}</p>
          </div>
        ))}
      </div>
      
      {/* 가격 설정 */}
      <div className="price-input">
        <label>판매 가격 (MONG)</label>
        <input 
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="100"
        />
      </div>
      
      <button onClick={handleList}>판매 등록</button>
    </div>
  );
};
```

#### 2.2 판매 등록 함수

```javascript
// src/utils/marketplace.js
import { Transaction, PublicKey } from '@solana/web3.js';
import { 
  createTransferInstruction,
  getAssociatedTokenAddress 
} from '@solana/spl-token';

export const listNFTForSale = async (
  connection,
  wallet,
  nftMint,
  price
) => {
  try {
    // 1. 백엔드에 판매 등록
    const response = await fetch('/api/marketplace/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seller: wallet.publicKey.toString(),
        nftMint,
        price,
      }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    // 2. NFT를 Escrow 계정으로 전송 (선택사항)
    // 실제 구현 시 Program Derived Address (PDA) 사용
    
    return data.listing;
  } catch (error) {
    console.error('판매 등록 실패:', error);
    throw error;
  }
};
```

---

### Phase 3: 구매 기능 (6-8시간)

#### 3.1 구매 트랜잭션

```javascript
// src/utils/marketplace.js
export const buyNFT = async (
  connection,
  wallet,
  listing
) => {
  try {
    // 1. SPL Token 결제 트랜잭션 생성
    const transaction = new Transaction();
    
    const tokenMint = new PublicKey(CLAIM_CONFIG.TOKEN_MINT_ADDRESS);
    const sellerTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      new PublicKey(listing.seller)
    );
    
    const buyerTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      wallet.publicKey
    );
    
    // 2. 토큰 전송 instruction
    transaction.add(
      createTransferInstruction(
        buyerTokenAccount,
        sellerTokenAccount,
        wallet.publicKey,
        listing.price * (10 ** CLAIM_CONFIG.TOKEN_DECIMALS)
      )
    );
    
    // 3. 트랜잭션 서명 및 전송
    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature);
    
    // 4. 백엔드에 구매 완료 알림
    await fetch('/api/marketplace/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: listing.id,
        buyer: wallet.publicKey.toString(),
        signature,
      }),
    });
    
    return signature;
  } catch (error) {
    console.error('구매 실패:', error);
    throw error;
  }
};
```

---

### Phase 4: 백엔드 API (8-10시간)

#### 4.1 데이터베이스 스키마

```sql
-- Listings 테이블
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  seller VARCHAR(44) NOT NULL,
  nft_mint VARCHAR(44) NOT NULL,
  nft_name VARCHAR(255),
  nft_image TEXT,
  price DECIMAL(20, 8) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, sold, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions 테이블
CREATE TABLE marketplace_transactions (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id),
  buyer VARCHAR(44) NOT NULL,
  seller VARCHAR(44) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  signature VARCHAR(88) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_listings_seller ON listings(seller);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_transactions_buyer ON marketplace_transactions(buyer);
```

#### 4.2 백엔드 라우트

```javascript
// backend/routes/marketplace.js
import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// 전체 판매 목록 조회
router.get('/listings', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM listings 
       WHERE status = 'active' 
       ORDER BY created_at DESC`
    );
    
    res.json({ success: true, listings: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 판매 등록
router.post('/list', async (req, res) => {
  const { seller, nftMint, price, nftName, nftImage } = req.body;
  
  try {
    const { rows } = await query(
      `INSERT INTO listings (seller, nft_mint, nft_name, nft_image, price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [seller, nftMint, nftName, nftImage, price]
    );
    
    res.json({ success: true, listing: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// NFT 구매
router.post('/buy', async (req, res) => {
  const { listingId, buyer, signature } = req.body;
  
  try {
    // 1. 리스팅 상태 확인
    const { rows: listings } = await query(
      'SELECT * FROM listings WHERE id = $1 AND status = $active',
      [listingId]
    );
    
    if (listings.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '이미 판매된 NFT입니다' 
      });
    }
    
    const listing = listings[0];
    
    // 2. 트랜잭션 기록
    await query(
      `INSERT INTO marketplace_transactions 
       (listing_id, buyer, seller, price, signature)
       VALUES ($1, $2, $3, $4, $5)`,
      [listingId, buyer, listing.seller, listing.price, signature]
    );
    
    // 3. 리스팅 상태 업데이트
    await query(
      'UPDATE listings SET status = $sold WHERE id = $1',
      [listingId]
    );
    
    res.json({ success: true, message: '구매 완료' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 내 판매 목록
router.get('/my-listings/:wallet', async (req, res) => {
  const { wallet } = req.params;
  
  try {
    const { rows } = await query(
      'SELECT * FROM listings WHERE seller = $1 ORDER BY created_at DESC',
      [wallet]
    );
    
    res.json({ success: true, listings: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
```

---

## 🔐 보안 고려사항

### 1. Escrow 계정 (필수!)
NFT를 안전하게 보관하기 위해 **Escrow Program** 사용:

```rust
// Solana Program (Rust)
// 실제 프로덕션에서는 Anchor 프레임워크 사용 권장
```

### 2. 트랜잭션 검증
- 모든 트랜잭션 서명 검증
- 이중 지불 방지
- Rate limiting

### 3. 가격 조작 방지
- 최소/최대 가격 설정
- 급격한 가격 변동 감지

---

## 💰 예상 비용

### RPC 비용
- **Helius Pro**: $49/월 (1M requests)
- 거래당 RPC 요청: ~5-10회
- 월 10,000 거래 → ~100,000 requests

### 추가 비용
- **데이터베이스**: Railway Postgres ($5-20/월)
- **Solana 트랜잭션 수수료**: 거래당 ~0.000005 SOL
- **서버 호스팅**: Railway ($5-20/월)

**총 예상 비용: $60-90/월** (초기 단계)

---

## 📊 수익 모델

### 1. 거래 수수료
- 판매 금액의 2-5% 수수료
- 예: 100 MONG 판매 → 2-5 MONG 수수료

### 2. 등록 수수료
- NFT 등록 시 고정 수수료
- 예: 10 MONG/건

### 3. 프리미엄 기능
- 하이라이트 광고
- 검증 배지
- 우선 노출

---

## 🎯 다음 단계

### 즉시 시작 가능:
1. ✅ **RPC 설정** (Helius 무료 티어)
2. ✅ **UI 구현** (2-3일)
3. ✅ **백엔드 API** (2-3일)

### 고급 기능:
4. 🔄 **Escrow Program** (1-2주, Rust 필요)
5. 🔄 **오퍼/입찰 시스템** (1주)
6. 🔄 **로열티 지원** (3-5일)

---

## 📚 참고 자료

- [Metaplex NFT Standard](https://docs.metaplex.com/)
- [Solana Token Program](https://spl.solana.com/token)
- [Anchor Framework](https://www.anchor-lang.com/)

---

**궁금한 점이 있으면 언제든 물어보세요!** 🚀
