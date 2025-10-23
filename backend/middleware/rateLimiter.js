/**
 * 간단한 Rate Limiting 미들웨어
 */

const rateLimitStore = new Map();

// 클린업: 1시간마다 오래된 데이터 삭제
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > oneHour) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

/**
 * Rate Limiter 생성
 * @param {number} maxRequests - 시간 창 내 최대 요청 수
 * @param {number} windowMs - 시간 창 (밀리초)
 */
export const createRateLimiter = (maxRequests = 10, windowMs = 60000) => {
  return (req, res, next) => {
    // IP 주소 또는 지갑 주소로 식별
    const identifier = req.body?.walletAddress || 
                      req.query?.wallet ||
                      req.ip || 
                      req.connection.remoteAddress;
    
    const now = Date.now();
    const key = `${req.path}:${identifier}`;
    
    let record = rateLimitStore.get(key);
    
    if (!record) {
      // 첫 요청
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, record);
      return next();
    }
    
    if (now > record.resetTime) {
      // 시간 창이 만료됨 - 리셋
      record.count = 1;
      record.resetTime = now + windowMs;
      rateLimitStore.set(key, record);
      return next();
    }
    
    if (record.count >= maxRequests) {
      // 제한 초과
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
      
      return res.status(429).json({
        error: '너무 많은 요청입니다',
        message: `${retryAfter}초 후에 다시 시도해주세요`,
        retryAfter,
      });
    }
    
    // 요청 허용
    record.count++;
    rateLimitStore.set(key, record);
    
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - record.count);
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
    
    next();
  };
};

/**
 * 클레임용 엄격한 Rate Limiter (1분에 1회)
 */
export const claimRateLimiter = createRateLimiter(1, 60000);

/**
 * 일반 API용 Rate Limiter (1분에 10회)
 */
export const apiRateLimiter = createRateLimiter(10, 60000);

/**
 * 조회용 Rate Limiter (1분에 30회)
 */
export const readRateLimiter = createRateLimiter(30, 60000);

export default {
  createRateLimiter,
  claimRateLimiter,
  apiRateLimiter,
  readRateLimiter,
};
