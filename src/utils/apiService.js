/**
 * 백엔드 API 기본 URL
 * 프로덕션: 같은 도메인 (Railway)
 * 개발: localhost:5000 (백엔드 서버)
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:5000');

/**
 * 클레임 가능 여부 확인 (쿨다운 + NFT 검증)
 */
export const checkClaimEligibility = async (walletAddress, nftMints = []) => {
  try {
    // nftMints가 제공되면 전체 eligibility 체크
    if (nftMints.length > 0) {
      const response = await fetch(`${API_BASE_URL}/api/check-eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress, nftMints }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '클레임 자격 확인 실패');
      }

      return await response.json();
    }
    
    // 기본 쿨다운만 체크
    const response = await fetch(`${API_BASE_URL}/api/check-claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '클레임 확인 실패');
    }

    return await response.json();
  } catch (error) {
    console.error('클레임 확인 오류:', error);
    throw error;
  }
};

/**
 * 토큰 클레임 요청
 */
export const requestClaim = async (walletAddress, nftMints, amount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        nftMints,
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '클레임 실패');
    }

    return data;
  } catch (error) {
    console.error('클레임 요청 오류:', error);
    throw error;
  }
};

/**
 * 클레임 이력 조회
 */
export const getClaimHistory = async (walletAddress) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/claim-history/${walletAddress}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '이력 조회 실패');
    }

    return await response.json();
  } catch (error) {
    console.error('이력 조회 오류:', error);
    throw error;
  }
};

/**
 * 서버 헬스 체크
 */
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('서버 응답 없음');
    }

    return await response.json();
  } catch (error) {
    console.error('서버 헬스 체크 오류:', error);
    throw error;
  }
};

export default {
  checkClaimEligibility,
  requestClaim,
  getClaimHistory,
  checkServerHealth,
};
