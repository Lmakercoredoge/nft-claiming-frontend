# NFT Claiming Backend Server

MONGMONG 토큰 클레임 백엔드 서버

## 설정 방법

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일을 열고 다음 정보를 입력:

```env
# Solana 네트워크
NETWORK=mainnet-beta

# Treasury 지갑 개인키
TREASURY_PRIVATE_KEY=your_phantom_wallet_private_key_here

# 토큰 민트 주소
TOKEN_MINT_ADDRESS=6amToBpuYrDhDNg75ZnjnpESLBCtgd3KqzsEcMrizAfX

# 서버 포트
PORT=5000

# CORS 허용 도메인
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Phantom 지갑 개인키 내보내기

1. Phantom 지갑 열기
2. 설정 (⚙️) 클릭
3. **보안 및 개인정보** 클릭
4. **개인키 내보내기** 클릭
5. 비밀번호 입력
6. 개인키 복사
7. `.env` 파일의 `TREASURY_PRIVATE_KEY`에 붙여넣기

⚠️ **주의**: 개인키는 절대 공유하거나 GitHub에 업로드하지 마세요!

### 4. 서버 실행

```bash
npm start
```

또는 개발 모드 (자동 재시작):

```bash
npm run dev
```

서버가 정상적으로 실행되면:
```
🚀 NFT Claiming Backend Server Started!
📡 Server running on port 5000
🌐 Network: mainnet-beta
💰 Treasury Wallet: YOUR_WALLET_ADDRESS
🪙 Token Mint: 6amToBpuYrDhDNg75ZnjnpESLBCtgd3KqzsEcMrizAfX

✨ Ready to process claims!
```

## API 엔드포인트

### 1. 헬스 체크
```
GET /health
```

### 2. 클레임 가능 여부 확인
```
POST /api/check-claim
Body: { "walletAddress": "USER_WALLET_ADDRESS" }
```

### 3. 토큰 클레임
```
POST /api/claim
Body: {
  "walletAddress": "USER_WALLET_ADDRESS",
  "nftMints": ["NFT_MINT_1", "NFT_MINT_2"],
  "amount": 100
}
```

### 4. 클레임 이력 조회
```
GET /api/claim-history/:walletAddress
```

## 보안 주의사항

1. `.env` 파일은 절대 GitHub에 업로드하지 마세요
2. Treasury 지갑에는 필요한 만큼의 토큰만 보관하세요
3. 프로덕션 환경에서는 데이터베이스를 사용하세요 (현재는 메모리 저장)
4. HTTPS를 사용하세요 (프로덕션)
5. Rate Limiting을 추가하세요 (프로덕션)

## 문제 해결

### Treasury 지갑 로드 실패
- `.env` 파일에 `TREASURY_PRIVATE_KEY`가 올바르게 설정되었는지 확인
- Phantom 개인키 형식이 Base58인지 확인

### 토큰 전송 실패
- Treasury 지갑에 충분한 MONG 토큰이 있는지 확인
- Treasury 지갑에 SOL이 있는지 확인 (가스비)
- 네트워크 연결 확인

### CORS 오류
- `.env`의 `ALLOWED_ORIGINS`에 프론트엔드 URL이 포함되어 있는지 확인
