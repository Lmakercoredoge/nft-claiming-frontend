# 🚀 빠른 시작 가이드

## 1️⃣ RPC 설정 (필수)

NFT를 조회하려면 **유료 RPC 서비스**가 필요합니다.

### 추천: Helius (무료 티어 제공)

1. **https://helius.xyz** 에서 가입
2. API Key 받기
3. `.env` 파일 생성:

```bash
cp .env.example .env
```

4. `.env` 파일에 키 입력:

```env
VITE_HELIUS_API_KEY=your_api_key_here
```

5. 개발 서버 재시작:

```bash
npm run dev
```

### 📚 자세한 설정 방법

전체 가이드는 [RPC_SETUP_GUIDE.md](./RPC_SETUP_GUIDE.md) 참고

---

## 2️⃣ 데모 모드

RPC 키 없이 테스트하려면:
- 지갑 연결 시 자동으로 **데모 모드** 활성화
- 더미 NFT 3개 표시
- UI 테스트 가능

---

## 3️⃣ 비용

| 사용자 수 | 월 비용 | 추천 서비스 |
|----------|---------|------------|
| ~100명 | **무료** | Helius 무료 티어 |
| ~1,000명 | $49 | Helius Pro |
| 10,000명+ | $249+ | Helius Business |

---

## ⚡ 빠른 테스트

1. RPC 키 설정 (위 참고)
2. `npm run dev`
3. 지갑 연결
4. NFT 조회 확인

성공! 🎉
