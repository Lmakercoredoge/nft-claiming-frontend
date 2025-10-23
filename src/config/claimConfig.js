/**
 * 클레임 설정 - 동적 로딩
 */

// 초기 기본값 (API 로드 전)
export let CLAIM_CONFIG = {
  BASE_CLAIM_AMOUNT: 0,
  TOKEN_PER_NFT: 50000,
  MAX_CLAIMABLE_NFTS: 10,
  MAX_CLAIM_AMOUNT: 500000,
  CLAIM_COOLDOWN: 24 * 60 * 60 * 1000,
  TOKEN_SYMBOL: 'MONGMONG',
  TOKEN_MINT_ADDRESS: '6amToBpuYrDhDNg75ZnjnpESLBCtgd3KqzsEcMrizAfX',
  TOKEN_DECIMALS: 8,
  TREASURY_WALLET: 'YourTreasuryWalletAddressHere',
};

/**
 * NFT 컬렉션 설정
 */
export let NFT_CONFIG = {
  WHITELISTED_COLLECTIONS: [],
  WHITELISTED_MINTS: [
    '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    'DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x',
  ],
};

/**
 * 네트워크 설정
 */
export const NETWORK_CONFIG = {
  NETWORK: 'mainnet-beta',
  
  getCustomRPCEndpoint: () => {
    if (import.meta.env.VITE_HELIUS_API_KEY) {
      return `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`;
    }
    
    if (import.meta.env.VITE_QUICKNODE_ENDPOINT) {
      return import.meta.env.VITE_QUICKNODE_ENDPOINT;
    }
    
    if (import.meta.env.VITE_ALCHEMY_API_KEY) {
      return `https://solana-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
    }
    
    return null;
  },
  
  RPC_ENDPOINTS: [
    'https://solana.public-rpc.com',
    'https://api.mainnet-beta.solana.com',
    'https://rpc.ankr.com/solana',
    'https://solana-api.projectserum.com',
    'https://solana-mainnet.rpc.extrnode.com',
    'https://mainnet.helius-rpc.com/?api-key=public',
    'https://ssc-dao.genesysgo.net',
    'https://mainnet.rpcpool.com',
    'https://solana-mainnet.g.alchemy.com/v2/demo',
  ],
  
  RPC_ENDPOINT: null,
};

/**
 * UI 설정
 */
export const UI_CONFIG = {
  APP_TITLE: 'MONGMONG NFT CLAIMING',
  APP_DESCRIPTION: 'CLAIM YOUR MONGMONG TOKENS WITH NFT POWER',
  FOOTER_MESSAGE: '🐵 HOLD NFT • EARN MONGMONG • JOIN THE REVOLUTION',
};

/**
 * API에서 설정 로드하는 함수
 */
export async function loadConfigFromAPI() {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('🔄 Loading config from:', `${API_URL}/api/config`);
    
    const response = await fetch(`${API_URL}/api/config`);
    const data = await response.json();
    
    if (data.success && data.config) {
      console.log('✅ Config loaded from API:', data.config);
      
      // 동적으로 설정 업데이트
      CLAIM_CONFIG = {
        ...CLAIM_CONFIG,
        ENABLED: data.config.enabled,
        TOKEN_PER_NFT: data.config.tokenPerNFT,
        MAX_CLAIMABLE_NFTS: data.config.maxClaimableNFTs,
        MAX_CLAIM_AMOUNT: data.config.maxClaimAmount,
        CLAIM_COOLDOWN: data.config.claimCooldown,
        TOKEN_SYMBOL: data.config.tokenSymbol || 'MONGMONG',
        TOKEN_MINT_ADDRESS: data.config.tokenMintAddress,
        TOKEN_DECIMALS: data.config.tokenDecimals,
      };
      
      // NFT 컬렉션도 업데이트
      if (data.config.nftCollections && data.config.nftCollections.length > 0) {
        NFT_CONFIG.WHITELISTED_COLLECTIONS = data.config.nftCollections.map(c => c.hash);
        console.log('✅ NFT Collections loaded:', NFT_CONFIG.WHITELISTED_COLLECTIONS.length);
      }
      
      console.log('✅ Final CLAIM_CONFIG:', CLAIM_CONFIG);
      return { success: true, config: CLAIM_CONFIG };
    } else {
      console.warn('⚠️ Config API returned no data, using defaults');
      return { success: false, config: CLAIM_CONFIG };
    }
  } catch (error) {
    console.error('❌ Failed to load config from API:', error);
    console.log('⚠️ Using default configuration');
    return { success: false, config: CLAIM_CONFIG, error: error.message };
  }
}

/**
 * 클레임 가능 토큰 계산
 */
export const calculateClaimAmount = (nftCount) => {
  const claimableNFTs = Math.min(nftCount, CLAIM_CONFIG.MAX_CLAIMABLE_NFTS);
  const amount = claimableNFTs * CLAIM_CONFIG.TOKEN_PER_NFT;
  return amount;
};
