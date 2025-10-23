# 🛍️ MonMon Platform - Development TODO

## 📅 Phase 1: 쇼핑몰 기본 구조 (내일)
- [ ] Shop 페이지 생성
- [ ] ProductCard 컴포넌트
- [ ] ProductGrid 컴포넌트
- [ ] CategoryFilter 컴포넌트
- [ ] 상품 DB 구조 설계
- [ ] products.json 생성
- [ ] Backend products API

## 📅 Phase 2: 장바구니 & 결제
- [ ] Cart 컴포넌트
- [ ] CartItem 컴포넌트
- [ ] CheckoutModal 컴포넌트
- [ ] MONG 토큰 결제 로직
- [ ] 배송 정보 입력 폼
- [ ] 주문 생성 API

## 📅 Phase 3: 사용자 기능
- [ ] UserProfile 페이지
- [ ] TokenBalance 컴포넌트
- [ ] NFTGallery 컴포넌트
- [ ] OrderHistory 컴포넌트
- [ ] NFT 홀더 할인 로직

## 📅 Phase 4: Admin 확장
- [ ] 상품 관리 페이지
- [ ] 주문 관리 페이지
- [ ] 매출 통계 페이지
- [ ] 재고 관리
- [ ] 쿠폰 관리

## 📅 Phase 5: UI/UX 개선
- [ ] Header 컴포넌트
- [ ] Navigation 메뉴
- [ ] Footer 컴포넌트
- [ ] 반응형 디자인
- [ ] 로딩 애니메이션

## 📅 Phase 6: 고급 기능
- [ ] 알림 센터
- [ ] 이벤트 배너
- [ ] 위시리스트
- [ ] 상품 리뷰
- [ ] 검색 기능

---

## 🎨 상품 카테고리

### Clothing:
- Hoodies
- T-Shirts
- Sweatshirts
- Jackets

### Accessories:
- Hats/Caps
- Bags
- Socks
- Phone Cases

### Special:
- Limited Edition
- NFT Holder Exclusive
- Collabs

---

## 💰 가격 정책

### 기본 가격:
- Hoodie: 5,000 - 8,000 MONG
- T-Shirt: 2,000 - 3,500 MONG
- Cap: 1,500 - 2,500 MONG
- Accessories: 500 - 2,000 MONG

### 할인:
- NFT Holder: 10-30% 할인
- 대량 구매: 5-15% 할인
- 이벤트: 20-50% 할인

---

## 🚀 배포 체크리스트

- [ ] Railway 배포
- [ ] 도메인 연결 (nftgoods.net)
- [ ] SSL 인증서
- [ ] 이미지 CDN 설정
- [ ] 환경 변수 설정
- [ ] 백업 시스템

---

## 📊 필요한 데이터 구조

### products.json
```json
{
  "products": [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "description": "string",
      "price": number,
      "currency": "MONG",
      "images": ["string"],
      "sizes": ["string"],
      "colors": ["string"],
      "stock": {},
      "nftHolderDiscount": number,
      "featured": boolean,
      "tags": ["string"]
    }
  ]
}
```

### orders.json
```json
{
  "orders": [
    {
      "orderId": "string",
      "walletAddress": "string",
      "items": [],
      "totalPrice": number,
      "currency": "MONG",
      "shippingInfo": {},
      "status": "string",
      "transactionHash": "string",
      "createdAt": "string"
    }
  ]
}
```

---

## 🎯 성공 지표

- [ ] 주문 처리 시간 < 5초
- [ ] 페이지 로딩 < 2초
- [ ] 모바일 반응형 100%
- [ ] 결제 성공률 > 95%
- [ ] 사용자 만족도 > 4.5/5

---

Last Updated: 2025-10-22
