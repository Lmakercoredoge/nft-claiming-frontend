# 🔧 백엔드 Admin 접속 가이드

## 📍 Admin 페이지 접속 주소

```
http://localhost:5000/admin.html
```

**이게 전부입니다!**

---

## 🚀 실행 방법

### **1단계: 백엔드 서버 실행**

```bash
cd E:\nft_claiming\backend
npm start
```

### **2단계: 브라우저에서 접속**

```
http://localhost:5000/admin.html
```

---

## ⚠️ 중요: server.js 수정 필요

현재 server.js에 static 파일 서빙이 없습니다.

**E:\nft_claiming\backend\server.js** 파일을 열어서:

### **import 추가 (상단에):**

```javascript
import adminRoutes from './routes/admin.js';
```

### **미들웨어 부분 수정:**

**찾기:**
```javascript
app.use(express.json());
```

**다음으로 변경:**
```javascript
app.use(express.json());
app.use(express.static('public'));

// Admin 라우트
app.use('/api/admin', adminRoutes);
```

---

## ✅ 수정 후 재시작

```bash
# 백엔드 중지 (Ctrl + C)
# 재시작
npm start
```

---

## 🎯 이제 접속!

```
http://localhost:5000/admin.html
```

**끝!**
