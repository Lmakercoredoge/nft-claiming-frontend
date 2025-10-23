/**
 * 클레임 설정
 */
export const CLAIM_CONFIG = {
  // 기본 클레임 토큰 양 (없음 - NFT 개수로만 계산)
  BASE_CLAIM_AMOUNT: 0,
  
  // NFT 1개당 토큰
  TOKEN_PER_NFT: 50000,
  
  // 최대 인정 NFT 개수
  MAX_CLAIMABLE_NFTS: 10,
  
  // 최대 클레임 토큰 (10개 xd7 50,000)
  MAX_CLAIM_AMOUNT: 500000,
  
  // 클레임 쿨다운 (밀리초) - 24시간
  CLAIM_COOLDOWN: 24 * 60 * 60 * 1000,
  
  // 토큰 심볼
  TOKEN_SYMBOL: 'MONGMONG',
  
  // 토큰 민트 주소 (MONGMONG 토큰)
  TOKEN_MINT_ADDRESS: '6amToBpuYrDhDNg75ZnjnpESLBCtgd3KqzsEcMrizAfX',
  
  // 토큰 Decimals
  TOKEN_DECIMALS: 8,
  
  // Treasury Wallet (토큰을 보유하고 있는 지갑 주소 - 실제 주소로 변경 필요)
  TREASURY_WALLET: 'YourTreasuryWalletAddressHere',
};

/**
 * NFT 컬렉션 설정
 */
export const NFT_CONFIG = {
  // 화이트리스트 NFT 컬렉션 주소들
  WHITELISTED_COLLECTIONS: [
    // 여기에 실제 NFT 컬렉션 주소 추가
    'CollectionAddress1',
    'CollectionAddress2',
  ],
  
  // 화이트리스트 개별 NFT 민트 주소들
  WHITELISTED_MINTS: [
    '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    'DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x',
    // 더 추가...
  ],
};

/**
 * 네트워크 설정
 */
export const NETWORK_CONFIG = {
  NETWORK: 'mainnet-beta',
  
  // 환경 변수에서 RPC 키 가져오기
  getCustomRPCEndpoint: () => {
    // Helius
    if (import.meta.env.VITE_HELIUS_API_KEY) {
      return `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`;
    }
    
    // QuickNode
    if (import.meta.env.VITE_QUICKNODE_ENDPOINT) {
      return import.meta.env.VITE_QUICKNODE_ENDPOINT;
    }
    
    // Alchemy
    if (import.meta.env.VITE_ALCHEMY_API_KEY) {
      return `https://solana-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
    }
    
    return null;
  },
  
  // 여러 RPC 엔드포인트 (fallback 포함)
  RPC_ENDPOINTS: [
    // 1. 사용자 개인 RPC (최우선)
    // 환경 변수에서 동적으로 추가됨
    
    // 2. Primary Mainnet RPCs
    'https://solana.public-rpc.com',
    'https://api.mainnet-beta.solana.com',
    'https://rpc.ankr.com/solana',
    
    // 3. Alternative Mainnet endpoints
    'https://solana-api.projectserum.com',
    'https://solana-mainnet.rpc.extrnode.com',
    'https://mainnet.helius-rpc.com/?api-key=public',
    'https://ssc-dao.genesysgo.net',
    
    // 4. Backup free RPCs
    'https://mainnet.rpcpool.com',
    'https://solana-mainnet.g.alchemy.com/v2/demo',
  ],
  
  // 기본 RPC
  RPC_ENDPOINT: null, // getCustomRPCEndpoint()에서 동적으로 설정
};

/**
 * UI 설정
 */
export const UI_CONFIG = {
  // 앱 제목
  APP_TITLE: 'MONGMONG NFT CLAIMING',
  
  // 앱 설명
  APP_DESCRIPTION: 'CLAIM YOUR MONGMONG TOKENS WITH NFT POWER',
  
  // 푸터 메시지
  FOOTER_MESSAGE: '🐵 HOLD NFT • EARN MONGMONG • JOIN THE REVOLUTION',
};

/**
 * 클레임 가능 토큰 계산
 */
export const calculateClaimAmount = (nftCount) => {
  // 최대 10개까지만 인정
  const claimableNFTs = Math.min(nftCount, CLAIM_CONFIG.MAX_CLAIMABLE_NFTS);
  const amount = claimableNFTs * CLAIM_CONFIG.TOKEN_PER_NFT;
  return amount; // 이미 MAX_CLAIM_AMOUNT와 동일
};
