import { useEffect } from 'react';

/**
 * 모바일 지갑 연결을 위한 Deep Link Hook
 */
export const useMobileWalletConnect = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  useEffect(() => {
    if (isMobile) {
      console.log('Mobile device detected');
      
      // Phantom Deep Link 설정
      const setupPhantomDeepLink = () => {
        const currentUrl = window.location.href;
        const phantomUrl = `https://phantom.app/ul/browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(currentUrl)}`;
        
        // 지갑 버튼 클릭 시 Phantom 앱 열기
        const handleWalletClick = (e) => {
          const target = e.target;
          if (target.closest('.wallet-adapter-button')) {
            // Phantom이 설치되어 있는지 확인
            if (!window.solana?.isPhantom) {
              e.preventDefault();
              window.location.href = phantomUrl;
            }
          }
        };
        
        document.addEventListener('click', handleWalletClick);
        
        return () => {
          document.removeEventListener('click', handleWalletClick);
        };
      };
      
      return setupPhantomDeepLink();
    }
  }, [isMobile]);
  
  return { isMobile };
};
