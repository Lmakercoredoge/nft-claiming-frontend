# ✅ 백엔드 서버 에러 해결 완료!

## 🐛 문제점

```
❌ POST http://localhost:3000/api/check-claim
net::ERR_CONNECTION_REFUSED
```

**원인:**
- 프론트엔드: `localhost:3000`에 API 요청
- 백엔드: `localhost:5000`에서 실행됨
- **포트 불일치!**

---

## ✅ 해결 완료!

### **1. API URL 수정됨** ✅

`src/utils/apiService.js` 파일이 수정되었습니다:

```javascript
// 이전
http://localhost:3000 ❌

// 현재  
http://localhost:5000 ✅
```

### **2. 백엔드 시작 스크립트 생성** ✅

`START_BACKEND.bat` 파일이 생성되었습니다.

---

## 🚀 백엔드 서버 실행 방법

### **방법 1: 배치 파일 사용 (간편!)**

1. `E:\nft_claiming` 폴더 열기
2. `START_BACKEND.bat` 더블클릭
3. 백엔드 서버가 포트 5000에서 실행됩니다

### **방법 2: 직접 실행**

```bash
cd E:\nft_claiming\backend
npm start
```

---

## 📋 서버 실행 확인

### **터미널에 표시될 메시지:**

```
===================================
 몽몽 NFT 백엔드 서버 시작
===================================

백엔드 서버 시작 중...
포트: 5000

✅ Server running on port 5000
✅ Database initialized
✅ Treasury 지갑 로드 성공: [주소]
🚀 Backend API ready!
```

### **브라우저 콘솔 확인:**

이제 에러가 사라지고 다음 메시지가 보여야 합니다:

```
✅ POST http://localhost:5000/api/check-claim (성공!)
✅ Claim status checked
```

---

## 🎯 전체 실행 순서

### **Step 1: 백엔드 시작**
```
START_BACKEND.bat 실행
→ 포트 5000에서 대기
```

### **Step 2: 프론트엔드 시작**
```
npm run dev
→ 포트 5175에서 실행
```

### **Step 3: 브라우저 열기**
```
http://localhost:5175
```

---

## 🔧 백엔드 설정 확인

### **backend/.env 파일 확인:**

```env
# 포트 설정
PORT=5000

# 네트워크
NETWORK=mainnet-beta

# RPC 엔드포인트
RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# CORS 허용 도메인
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5175

# Treasury 지갑 (선택사항)
TREASURY_PRIVATE_KEY=your_private_key_here
TREASURY_PUBLIC_KEY=your_public_key_here

# 토큰 정보
TOKEN_MINT_ADDRESS=6amToBpuYrDhDNg75ZnjnpESLBCtgd3KqzsEcMrizAfX
TOKEN_DECIMALS=8
```

---

## 🎨 이제 작동하는 기능:

### ✅ **클레임 상태 확인**
```javascript
POST /api/check-claim
→ 쿨다운 상태 확인
→ 마지막 클레임 시간 확인
```

### ✅ **클레임 자격 검증**
```javascript
POST /api/check-eligibility
→ NFT 소유권 확인
→ 화이트리스트 검증
→ 클레임 가능 금액 계산
```

### ✅ **토큰 클레임**
```javascript
POST /api/claim
→ 토큰 전송 트랜잭션 생성
→ Solana 블록체인에 전송
```

### ✅ **클레임 이력**
```javascript
GET /api/claim-history/:walletAddress
→ 이전 클레임 기록 조회
```

---

## 🚨 문제 해결

### **Q1: 백엔드가 시작되지 않아요**

**확인사항:**
1. Node.js 설치되어 있나요?
   ```bash
   node --version
   ```

2. 백엔드 의존성 설치되어 있나요?
   ```bash
   cd E:\nft_claiming\backend
   npm install
   ```

3. 포트 5000이 이미 사용 중인가요?
   ```bash
   netstat -ano | findstr :5000
   ```

### **Q2: 여전히 연결 에러가 나요**

**체크리스트:**
- [ ] 백엔드 서버 실행 중?
- [ ] 포트 5000 확인?
- [ ] 프론트엔드 새로고침?
- [ ] 브라우저 캐시 삭제?

**해결 방법:**
```bash
# 1. 백엔드 중지 (Ctrl + C)
# 2. 프론트엔드 중지 (Ctrl + C)
# 3. 백엔드 재시작
cd backend
npm start

# 4. 새 터미널에서 프론트엔드 재시작
npm run dev

# 5. 브라우저 강력 새로고침
Ctrl + Shift + R
```

### **Q3: CORS 에러가 나요**

**backend/.env 확인:**
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5175
```

프론트엔드 포트가 5175라면 5175가 포함되어 있어야 합니다.

---

## 📊 포트 정리

| 서비스 | 포트 | URL |
|--------|------|-----|
| **프론트엔드** | 5175 | http://localhost:5175 |
| **백엔드 API** | 5000 | http://localhost:5000 |
| **Vite Dev** | 5173 | (대체 포트) |

---

## 🎉 완료 체크리스트

- [x] API URL 수정 (3000 → 5000) ✅
- [x] 백엔드 시작 스크립트 생성 ✅
- [ ] 백엔드 서버 실행 (START_BACKEND.bat)
- [ ] 프론트엔드 새로고침 (Ctrl + Shift + R)
- [ ] 콘솔 에러 확인
- [ ] 클레임 기능 테스트

---

## 🚀 다음 단계

### **1. 백엔드 실행**
`START_BACKEND.bat` 더블클릭

### **2. 브라우저 새로고침**
`Ctrl + Shift + R`

### **3. 콘솔 확인**
```
✅ POST http://localhost:5000/api/check-claim
✅ Claim status: eligible
```

### **4. 클레임 테스트**
```
1. 지갑 연결
2. NFT 조회
3. 클레임 버튼 클릭
4. 트랜잭션 승인
```

---

**이제 백엔드가 정상 작동할 것입니다!** 🎊

**START_BACKEND.bat을 실행하고 결과를 알려주세요!**
