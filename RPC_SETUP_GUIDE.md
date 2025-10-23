# 🚀 유료 RPC 설정 가이드

NFT Claiming 플랫폼을 안정적으로 운영하려면 유료 RPC 서비스가 필요합니다.

---

## 📋 목차
1. [RPC 서비스 선택](#rpc-서비스-선택)
2. [Helius 설정 (추천)](#helius-설정)
3. [QuickNode 설정](#quicknode-설정)
4. [Alchemy 설정](#alchemy-설정)
5. [환경 변수 설정](#환경-변수-설정)
6. [테스트](#테스트)

---

## 🎯 RPC 서비스 선택

### 비교표

| 서비스 | 무료 티어 | 가격 | 특징 |
|--------|-----------|------|------|
| **Helius** ⭐ | 100K req/월 | $49/월~ | NFT 조회 최적화, 가장 빠름 |
| **QuickNode** | 7일 무료 | $49/월~ | 안정적, 다양한 네트워크 |
| **Alchemy** | 300M CU/월 | $49/월~ | 대시보드 우수 |

**추천: Helius** - NFT 프로젝트에 최적화되어 있습니다!

---

## 1️⃣ Helius 설정 (추천)

### 가입 방법

1. **https://helius.xyz** 접속
2. **"Get Started"** 클릭
3. 이메일로 가입
4. Dashboard → **"Create New Project"**
5. **API Key 복사**

### 무료 티어 제한
- **100,000 requests/월**
- NFT 조회 최적화
- Rate limit: 무제한 (합리적 사용)

### .env 설정

프로젝트 루트에 `.env` 파일 생성:

```env
# Helius API Key
VITE_HELIUS_API_KEY=your_helius_api_key_here
```

**예시:**
```env
VITE_HELIUS_API_KEY=abc123-def456-ghi789
```

---

## 2️⃣ QuickNode 설정

### 가입 방법

1. **https://quicknode.com** 접속
2. **"Start for Free"** 클릭 (7일 무료 체험)
3. **Network 선택**: Solana Mainnet
4. **Endpoint Type**: HTTP
5. **Endpoint URL 복사**

### 가격
- 7일 무료 체험
- **Discover**: $49/월 (25M credits)
- **Build**: $299/월 (100M credits)

### .env 설정

```env
# QuickNode Endpoint
VITE_QUICKNODE_ENDPOINT=https://solana-mainnet.quiknode.pro/YOUR_ENDPOINT_ID/
```

**예시:**
```env
VITE_QUICKNODE_ENDPOINT=https://solana-mainnet.quiknode.pro/abc123def456/
```

---

## 3️⃣ Alchemy 설정

### 가입 방법

1. **https://alchemy.com** 접속
2. **"Get started free"** 클릭
3. **Create App**:
   - Chain: Solana
   - Network: Mainnet
4. **API Key 복사**

### 무료 티어
- **300M Compute Units/월**
- NFT API 포함
- Webhooks 지원

### .env 설정

```env
# Alchemy API Key
VITE_ALCHEMY_API_KEY=your_alchemy_api_key_here
```

**예시:**
```env
VITE_ALCHEMY_API_KEY=abc123def456ghi789
```

---

## 🔧 환경 변수 설정

### 1. .env 파일 생성

프로젝트 루트(`nft_claiming/`)에 `.env` 파일 생성:

```bash
cd E:\nft_claiming
notepad .env
```

### 2. 원하는 서비스 키 추가

**Helius 사용 시:**
```env
VITE_HELIUS_API_KEY=your_helius_key_here
```

**QuickNode 사용 시:**
```env
VITE_QUICKNODE_ENDPOINT=your_quicknode_endpoint_here
```

**Alchemy 사용 시:**
```env
VITE_ALCHEMY_API_KEY=your_alchemy_key_here
```

### 3. .env 파일 보안

`.gitignore`에 추가되어 있는지 확인:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

---

## ✅ 테스트

### 1. 개발 서버 재시작

```bash
npm run dev
```

### 2. 콘솔 확인

브라우저 콘솔(F12)에서 다음 메시지 확인:

```
🔑 Custom RPC endpoint found!
🔌 Trying RPC: https://mainnet.helius-rpc.com/?api-key=***
✅ Connected to: https://mainnet.helius-rpc.com/?api-key=***
```

### 3. NFT 조회 테스트

1. 지갑 연결
2. NFT가 정상적으로 표시되는지 확인
3. 콘솔에 에러가 없는지 확인

---

## 🎭 데모 모드 vs 실제 모드

### 데모 모드 (무료 RPC 실패 시)
- 더미 NFT 3개 표시
- 250 MONG 클레임 가능
- `🎭 DEMO MODE` 메시지 표시

### 실제 모드 (유료 RPC 사용 시)
- 실제 지갑의 NFT 조회
- 실제 클레임 가능 금액 계산
- 안정적인 서비스

---

## 💰 비용 예상

### 월간 사용량 기준

**소규모 (사용자 100명)**
- 예상 requests: ~10,000/월
- 추천: **Helius 무료 티어** ✅

**중규모 (사용자 1,000명)**
- 예상 requests: ~100,000/월
- 추천: **Helius Pro ($49/월)** ✅

**대규모 (사용자 10,000명+)**
- 예상 requests: 1M+/월
- 추천: **Helius Business ($249/월)** 또는 **QuickNode Build**

---

## 🆘 문제 해결

### Q1: API 키를 입력했는데도 무료 RPC를 사용해요
**A:** 개발 서버를 완전히 재시작하세요 (Ctrl+C → `npm run dev`)

### Q2: "Access forbidden" 에러가 계속 나와요
**A:** API 키가 올바른지 확인하세요:
- Helius: Dashboard에서 키 재확인
- QuickNode: Endpoint URL 전체 복사 (trailing slash 포함)
- Alchemy: API Key만 복사 (URL 아님)

### Q3: 무료 티어 한도를 초과했어요
**A:** 
1. 대시보드에서 사용량 확인
2. 유료 플랜으로 업그레이드
3. 또는 다른 서비스로 교체

---

## 📚 추가 자료

- [Helius 문서](https://docs.helius.xyz/)
- [QuickNode 문서](https://www.quicknode.com/docs/solana)
- [Alchemy 문서](https://docs.alchemy.com/docs/solana-development)

---

## ✨ 다음 단계

RPC 설정이 완료되면:
1. ✅ NFT 조회 안정화
2. ✅ 클레임 기능 활성화
3. ✅ 백엔드 API 연동
4. ✅ 프로덕션 배포

---

**Need help?** 문제가 있으면 프로젝트 이슈에 남겨주세요!
