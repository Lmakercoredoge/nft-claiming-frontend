# MONGMONG NFT Claiming App 🐵✨

Solana NFT 기반 MONG 토큰 클레임 시스템

## 🎯 기능

- ✅ Solana 지갑 연결 (Phantom, Solflare)
- ✅ 사용자 NFT 자동 확인
- ✅ Merkle Tree 기반 화이트리스트 검증
- ✅ 실제 MONG 토큰 클레임
- ✅ 24시간 쿨다운 시스템
- ✅ NFT 개수에 따른 보너스 계산
- ✅ 네온 글로우 사이버펑크 UI

## 📁 프로젝트 구조

```
nft_Claiming/
├── frontend/              # React 프론트엔드
│   ├── src/
│   │   ├── components/   # React 컴포넌트
│   │   ├── context/      # Wallet Context
│   │   ├── utils/        # 유틸리티 함수
│   │   └── config/       # 설정 파일
│   └── package.json
│
└── backend/              # Node.js 백엔드
    ├── server.js         # Express 서버
    ├── .env.example      # 환경 변수 예제
    └── package.json
```

## 🚀 설치 및 실행

### 1️⃣ 프론트엔드 설정

```bash
# 루트 디렉토리에서
npm install
```

`.env` 파일 생성:
```env
VITE_API_URL=http://localhost:5000
```

### 2️⃣ 백엔드 설정

```bash
cd backend
npm install
```

`.env` 파일 생성 (`.env.example` 복사):
```env
NETWORK=mainnet-beta
TREASURY_PRIVATE_KEY=your_phantom_private_key
TOKEN_MINT_ADDRESS=6amToBpuYrDhDNg75ZnjnpESLBCtgd3KqzsEcMrizAfX
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Phantom 개인키 내보내기:
1. Phantom 열기 → 설정 ⚙️
2. 보안 및 개인정보
3. 개인키 내보내기
4. 복사하여 `.env`의 `TREASURY_PRIVATE_KEY`에 붙여넣기

⚠️ **주의**: 개인키는 절대 공유하지 마세요!

### 3️⃣ 실행

**터미널 1 - 백엔드:**
```bash
cd backend
npm start
```

**터미널 2 - 프론트엔드:**
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## ⚙️ 설정

### 토큰 클레임 설정
`src/config/claimConfig.js`:
```javascript
export const CLAIM_CONFIG = {
  BASE_CLAIM_AMOUNT: 100,      // 기본 클레임 양
  TOKEN_PER_NFT: 50,            // NFT당 보너스
  MAX_CLAIM_AMOUNT: 1000,       // 최대 클레임
  CLAIM_COOLDOWN: 24 * 60 * 60 * 1000, // 24시간
  TOKEN_SYMBOL: 'MONG',
  TOKEN_MINT_ADDRESS: '6amToBpuYrDhDNg75ZnjnpESLBCtgd3KqzsEcMrizAfX',
};
```

### NFT 화이트리스트 설정
`src/utils/merkleTree.js`:
```javascript
export const EXAMPLE_WHITELIST = [
  'NFT_MINT_ADDRESS_1',
  'NFT_MINT_ADDRESS_2',
  // 더 추가...
];
```

## 🎨 UI 특징

- 네온 글로우 효과
- 사이버펑크 다크 테마
- 부드러운 애니메이션
- 반응형 디자인
- MONGMONG 브랜드 스타일

## 🔒 보안

- Treasury 개인키는 백엔드 서버에만 저장
- 프론트엔드에서는 API 요청만 수행
- 24시간 클레임 쿨다운
- Merkle Tree 기반 NFT 검증

## 📡 API 엔드포인트

### POST `/api/check-claim`
클레임 가능 여부 확인

### POST `/api/claim`
토큰 클레임 실행

### GET `/api/claim-history/:walletAddress`
클레임 이력 조회

### GET `/health`
서버 상태 확인

## 🛠 기술 스택

**프론트엔드:**
- React 18
- Vite
- Solana Web3.js
- Solana Wallet Adapter
- Metaplex SDK

**백엔드:**
- Node.js
- Express
- Solana Web3.js
- SPL Token

## 📝 TODO

- [ ] 데이터베이스 연동 (MongoDB/PostgreSQL)
- [ ] Rate Limiting
- [ ] 관리자 대시보드
- [ ] 클레임 통계 페이지
- [ ] 이메일 알림
- [ ] 모바일 최적화

## 🐛 문제 해결

### 토큰 전송 실패
- Treasury 지갑에 충분한 MONG과 SOL 확인
- 네트워크 연결 확인
- 개인키 형식 확인

### CORS 오류
- 백엔드 `.env`의 `ALLOWED_ORIGINS` 확인

### NFT 조회 안 됨
- 네트워크 설정 확인 (mainnet-beta)
- 지갑 연결 확인

## 📄 라이선스

MIT

## 🤝 기여

이슈와 PR은 환영합니다!

---

Made with 💜 for MONGMONG Community
