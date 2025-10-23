# 배경 이미지 추가 방법

## 📁 이미지 경로

배경 NFT 이미지는 다음 경로에 넣으세요:

```
nft_Claiming/
└── public/
    └── images/
        └── nft-background.png  <- 여기에 이미지 넣기
```

## 🖼️ 이미지 설정

### 1. 이미지 준비
- 원하는 NFT 이미지 준비
- 권장 크기: 1920x1080 이상
- 형식: PNG, JPG, WEBP 모두 가능

### 2. 이미지 배치
```bash
# 이미지를 public/images/ 폴더에 복사
# 파일명: nft-background.png (또는 다른 이름)
```

### 3. 이미지 경로 변경 (다른 파일명 사용 시)

`src/App.css` 파일에서 다음 부분 수정:

```css
.App::before {
  background-image: url('/images/nft-background.png'); /* 여기 경로 변경 */
}
```

예시:
```css
/* JPG 사용 */
background-image: url('/images/my-nft.jpg');

/* 다른 이름 사용 */
background-image: url('/images/mongmong-bg.png');
```

## 🎨 효과 조정

### 흐림 효과 조정
```css
.App::before {
  filter: blur(20px) brightness(0.3); /* 숫자 변경 */
}
```

- `blur(20px)` - 숫자가 클수록 더 흐림 (0~50px 권장)
- `brightness(0.3)` - 숫자가 작을수록 더 어두움 (0~1)

### 투명도 조정
```css
.App::before {
  opacity: 0.4; /* 0~1 사이 값 */
}
```

## 💡 여러 이미지 사용 (슬라이드쇼)

여러 NFT 이미지를 순서대로 보여주고 싶다면:

```css
.App::before {
  background-image: 
    url('/images/nft1.png'),
    url('/images/nft2.png'),
    url('/images/nft3.png');
  animation: slideshow 15s infinite;
}

@keyframes slideshow {
  0%, 33% { opacity: 1; }
  34%, 66% { opacity: 0.5; }
  67%, 100% { opacity: 0.2; }
}
```

## ⚡ 최적화 팁

1. **이미지 압축**
   - TinyPNG 사용: https://tinypng.com/
   - 파일 크기: 500KB 이하 권장

2. **WebP 형식 사용**
   - 더 작은 파일 크기
   - 더 빠른 로딩

3. **Lazy Loading**
   - 큰 이미지는 나중에 로드

## 🔧 문제 해결

### 이미지가 안 보일 때
1. 파일 경로 확인
2. 파일명 대소문자 확인
3. 브라우저 캐시 삭제 (Ctrl + Shift + R)
4. 개발자 도구에서 Network 탭 확인

### 이미지가 너무 밝을 때
```css
filter: blur(20px) brightness(0.2); /* brightness 값 줄이기 */
opacity: 0.3; /* opacity 값 줄이기 */
```

### 이미지가 너무 흐릴 때
```css
filter: blur(10px) brightness(0.4); /* blur 값 줄이기 */
```
