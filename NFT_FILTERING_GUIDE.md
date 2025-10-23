# 🔍 NFT 필터링 설정 가이드

## 🚨 문제점
현재 **모든 NFT**를 인식하고 있습니다:
- ✅ 몽몽 NFT (원숭이)
- ❌ 다른 컬렉션 NFT
- ❌ 가짜/스캠 NFT

---

## ✅ 해결 방법 (3단계)

### **1단계: NFT 필터링 유틸리티 추가** ✅ 완료!

`src/utils/nftFilter.js` 파일이 생성되었습니다.

### **2단계: claimConfig.js 수정**

`E:\nft_Claiming\src\config\claimConfig.js` 파일을 열어서 NFT_CONFIG 부분을 다음과 같이 수정하세요:

```javascript
/**
 * NFT 컬렉션 설정
 */
export const NFT_CONFIG = {
  // NFT 필터링 방법 선택
  FILTER_METHOD: 'NAME', // ← 이름으로 필터링 (가장 간단)
  
  // 방법 3: NFT 이름으로 필터링 (추천!)
  ALLOWED_NAME_PATTERNS: [
    'MONG',      // "MONG"이 포함된 NFT만
    'MongMong',  // "MongMong"이 포함된 NFT만
    '몽몽',       // "몽몽"이 포함된 NFT만
    'Mong',      // "Mong"이 포함된 NFT만
  ],
  
  // 방법 1: 컬렉션 주소로 필터링 (가장 정확)
  WHITELISTED_COLLECTIONS: [
    // 몽몽 NFT 컬렉션 주소를 여기에 추가
    // Solscan에서 확인 가능
  ],
  
  // 방법 2: 크리에이터 주소로 필터링
  WHITELISTED_CREATORS: [
    // 크리에이터 주소
  ],
  
  // 방법 4: 개별 Mint 주소로 필터링
  WHITELISTED_MINTS: [
    // 특정 NFT Mint 주소
  ],
};
```

### **3단계: NFTChecker.jsx 수정**

`E:\nft_Claiming\src\components\NFTChecker.jsx` 파일을 열어서:

**1) Import 추가 (파일 상단):**
```javascript
import { filterValidNFTs } from '../utils/nftFilter';
```

**2) NFT 조회 후 필터링 적용:**

기존 코드를 찾으세요:
```javascript
console.log('✅ Found NFTs:', userNFTs.length);
setNfts(userNFTs);
```

다음으로 변경:
```javascript
console.log('📦 Total NFTs found:', userNFTs.length);

// 필터링 적용
const validNFTs = filterValidNFTs(userNFTs);
console.log('✅ Valid NFTs:', validNFTs.length);

setNfts(validNFTs);
```

**3) eligibility 계산 부분도 수정:**

기존:
```javascript
if (userNFTs.length > 0) {
  const claimableNFTs = Math.min(userNFTs.length, 10);
  // ...
}
```

변경:
```javascript
if (validNFTs.length > 0) {
  const claimableNFTs = Math.min(validNFTs.length, 10);
  const claimAmount = claimableNFTs * 50000;
  
  const eligibilityData = {
    eligible: true,
    nftCount: validNFTs.length,
    claimableNFTs: claimableNFTs,
    amount: claimAmount,
    validNFTs: validNFTs.slice(0, 10).map(nft => nft.mint),
    message: validNFTs.length > 10 
      ? `${validNFTs.length}개 NFT 보유 (최대 10개까지 인정) → ${claimAmount.toLocaleString()} MONG 클레임 가능!`
      : `${claimableNFTs}개 NFT로 ${claimAmount.toLocaleString()} MONG 클레임 가능!`
  };
  
  setEligibility(eligibilityData);
  
  if (onEligibilityCheck) {
    onEligibilityCheck(eligibilityData);
  }
  
  if (onNFTsFound) {
    onNFTsFound(validNFTs); // userNFTs → validNFTs
  }
} else {
  setError('NO VALID NFTS FOUND');
}
```

---

## 🎯 필터링 방법 선택

### **방법 1: NAME (추천! - 가장 간단)**
```javascript
FILTER_METHOD: 'NAME',
ALLOWED_NAME_PATTERNS: ['MONG', 'MongMong', '몽몽'],
```

**장점:**
- ✅ 설정이 간단
- ✅ 바로 적용 가능
- ✅ NFT 이름만 확인하면 됨

**단점:**
- ⚠️ 이름이 비슷한 가짜 NFT가 있으면 통과 가능

---

### **방법 2: COLLECTION (가장 정확!)**
```javascript
FILTER_METHOD: 'COLLECTION',
WHITELISTED_COLLECTIONS: ['실제_컬렉션_주소'],
```

**장점:**
- ✅ 가장 정확
- ✅ 가짜 NFT 완벽 차단

**단점:**
- ⚠️ 컬렉션 주소를 확인해야 함

**컬렉션 주소 확인 방법:**
1. https://solscan.io 접속
2. 몽몽 NFT mint 주소 검색
3. "Collection" 항목 확인
4. 주소 복사

---

### **방법 3: CREATOR**
```javascript
FILTER_METHOD: 'CREATOR',
WHITELISTED_CREATORS: ['크리에이터_주소'],
```

**장점:**
- ✅ 한 크리에이터의 모든 NFT 인정

**단점:**
- ⚠️ 크리에이터 주소 확인 필요

---

### **방법 4: ALL (현재 상태)**
```javascript
FILTER_METHOD: 'ALL',
```

**모든 NFT 인정** - 필터링 없음

---

## 🚀 테스트 방법

### 1. 설정 파일 수정
```javascript
// claimConfig.js
FILTER_METHOD: 'NAME',
ALLOWED_NAME_PATTERNS: ['MONG', 'MongMong', '몽몽'],
```

### 2. NFTChecker.jsx 수정
- Import 추가
- filterValidNFTs() 호출
- validNFTs 사용

### 3. 브라우저 새로고침
```
Ctrl + Shift + R
```

### 4. 콘솔 확인
```
📦 Total NFTs found: 35
🔍 NFT 필터링 시작: 35개 → 필터 방법: NAME
✅ MongMong #1234
❌ Other NFT (이름에 MONG 없음)
✅ 몽몽 #5678
✅ Valid NFTs: 20개 (예시)

🚫 제외된 NFT: 15개
```

### 5. 화면 확인
```
🎨 20 NFTS OWNED (35개 → 20개로 줄어듦!)
💰 BONUS: +500,000 MONGMONG
⚠️ MAX 10 NFTS COUNTED
```

---

## 📊 예상 결과

### **Before (필터링 없음):**
```
총 NFT: 35개
- 몽몽 NFT: 20개 ✅
- 다른 NFT: 15개 ❌
클레임: 500,000 MONG (10개 최대)
```

### **After (NAME 필터링):**
```
총 NFT: 35개
필터링 후: 20개 (몽몽 NFT만)
- 몽몽 NFT: 20개 ✅
- 다른 NFT: 제외됨 ✅
클레임: 500,000 MONG (10개 최대)
```

---

## ⚠️ 주의사항

### **1. NFT 이름 확인**
몽몽 NFT의 정확한 이름을 확인하세요:
- "MONG"
- "MongMong"  
- "몽몽"
- 다른 패턴?

### **2. 필터가 너무 엄격하면**
유효한 NFT도 제외될 수 있습니다.

**해결책:**
```javascript
// 더 많은 패턴 추가
ALLOWED_NAME_PATTERNS: [
  'MONG',
  'Mong', 
  'mong',
  'MongMong',
  'Mongmong',
  '몽몽',
  '몽',
],
```

### **3. 필터가 너무 느슨하면**
가짜 NFT가 통과할 수 있습니다.

**해결책:**
```javascript
// COLLECTION 방법으로 변경
FILTER_METHOD: 'COLLECTION',
```

---

## 🎉 완료 체크리스트

- [ ] `nftFilter.js` 파일 생성됨 ✅
- [ ] `claimConfig.js`에 NFT_CONFIG 수정
- [ ] `NFTChecker.jsx`에 import 추가
- [ ] `NFTChecker.jsx`에서 `filterValidNFTs()` 호출
- [ ] 브라우저 새로고침
- [ ] 콘솔에서 필터링 로그 확인
- [ ] 유효한 NFT 개수 확인
- [ ] 클레임 금액 확인

---

## 💡 도움이 필요하면

1. **콘솔 로그를 확인**하세요 (F12 → Console)
2. 필터링 과정이 자세히 표시됩니다
3. 어떤 NFT가 제외되는지 확인 가능

**질문이 있으면 알려주세요!** 🚀
