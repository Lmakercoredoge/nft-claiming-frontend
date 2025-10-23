import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { NETWORK_CONFIG } from '../config/claimConfig';

// 기본 스타일 import
import '@solana/wallet-adapter-react-ui/styles.css';

// 모바일 감지
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const WalletContextProvider = ({ children }) => {
  // 네트워크 설정
  const network = WalletAdapterNetwork.Mainnet;
  
  // RPC 엔드포인트 설정
  const endpoint = useMemo(() => {
    // 1. 개인 RPC 키 확인
    const customEndpoint = NETWORK_CONFIG.getCustomRPCEndpoint();
    if (customEndpoint) {
      console.log('🔑 Using custom RPC endpoint');
      return customEndpoint;
    }
    
    // 2. 기본 공용 RPC 사용
    return NETWORK_CONFIG.RPC_ENDPOINTS?.[0] || clusterApiUrl(network);
  }, [network]);
  
  // 지원할 지갑들 설정 (모바일 포함)
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={!isMobile}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
