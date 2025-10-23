import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { NETWORK_CONFIG } from '../config/claimConfig';

/**
 * RPC 엔드포인트 순회하며 연결 시도
 */
const getWorkingConnection = async () => {
  // 1. 개인 RPC 키 확인 (최우선)
  const customEndpoint = NETWORK_CONFIG.getCustomRPCEndpoint();
  
  let endpoints = [];
  
  if (customEndpoint) {
    console.log('🔑 Custom RPC endpoint found!');
    endpoints.push(customEndpoint);
  }
  
  // 2. 공용 RPC 엔드포인트 추가
  endpoints = [...endpoints, ...(NETWORK_CONFIG.RPC_ENDPOINTS || [])];

  const errors = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔌 Trying RPC: ${endpoint.replace(/api-key=.+/, 'api-key=***')}`);
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
      });
      
      // 연결 테스트 (timeout 추가)
      const versionPromise = connection.getVersion();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      await Promise.race([versionPromise, timeoutPromise]);
      console.log(`✅ Connected to: ${endpoint.includes('api-key') ? endpoint.split('?')[0] + '?api-key=***' : endpoint}`);
      return connection;
    } catch (error) {
      const errorMsg = error.message || 'Unknown error';
      console.warn(`❌ Failed RPC: ${endpoint.includes('api-key') ? endpoint.split('?')[0] : endpoint} - ${errorMsg}`);
      errors.push({ endpoint: endpoint.split('?')[0], error: errorMsg });
      continue;
    }
  }
  
  console.error('❌ All RPC endpoints failed:', errors);
  throw new Error('All RPC endpoints failed. Please try again later.');
};

/**
 * Helius DAS API로 모든 NFT 조회 (compressed NFT 포함)
 */
const getNFTsViaHelius = async (endpoint, ownerPublicKey) => {
  try {
    console.log('🔍 Helius DAS API로 NFT 조회 중...');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: ownerPublicKey.toString(),
          page: 1,
          limit: 1000, // 최대 1000개까지
          displayOptions: {
            showFungible: false, // 토큰 제외, NFT만
            showNativeBalance: false,
          },
        },
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Helius API 에러');
    }

    const assets = data.result?.items || [];
    console.log(`✅ Helius DAS API: ${assets.length}개 NFT 발견`);
    
    // 포맷팅
    const formattedNFTs = assets.map(asset => ({
      mint: asset.id,
      name: asset.content?.metadata?.name || 'Unknown',
      symbol: asset.content?.metadata?.symbol || '',
      uri: asset.content?.json_uri || asset.content?.metadata?.uri || '',
      image: asset.content?.links?.image || asset.content?.files?.[0]?.uri || '',
      updateAuthority: asset.authorities?.[0]?.address || '',
      collection: asset.grouping?.find(g => g.group_key === 'collection')?.group_value || null,
    }));

    return formattedNFTs;
  } catch (error) {
    console.error('⚠️ Helius DAS API 실패:', error);
    throw error;
  }
};

/**
 * 재시도 로직이 있는 NFT 조회 (Metaplex 방식 - Fallback)
 */
const fetchNFTsWithRetry = async (metaplex, ownerPublicKey, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Metaplex NFT 조회 시도 ${attempt}/${maxRetries}`);
      
      const nfts = await metaplex
        .nfts()
        .findAllByOwner({ owner: ownerPublicKey });
      
      return nfts;
    } catch (error) {
      console.warn(`⚠️ NFT 조회 실패 (${attempt}/${maxRetries}):`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 재시도 전 대기 (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

/**
 * 지갑 주소로 소유한 NFT 목록을 가져옵니다
 */
export const getNFTsByOwner = async (connectionOrNull, ownerPublicKey) => {
  try {
    // 작동하는 RPC 연결 가져오기
    let connection = connectionOrNull;
    
    // 연결이 없거나 실패하면 새 연결 시도
    try {
      if (!connection) {
        connection = await getWorkingConnection();
      } else {
        // 기존 연결 테스트
        await connection.getVersion();
      }
    } catch (error) {
      console.warn('⚠️ 기존 연결 실패, 새 연결 시도...');
      connection = await getWorkingConnection();
    }
    
    // Helius API 키가 있으면 DAS API 사용 (추천!)
    const customEndpoint = NETWORK_CONFIG.getCustomRPCEndpoint();
    
    if (customEndpoint && customEndpoint.includes('helius')) {
      try {
        console.log('🚀 Helius DAS API 사용 (모든 NFT 조회)');
        const nfts = await getNFTsViaHelius(customEndpoint, ownerPublicKey);
        console.log(`✅ NFT 조회 성공: ${nfts.length}개`);
        return nfts;
      } catch (error) {
        console.warn('⚠️ Helius DAS API 실패, Metaplex로 fallback:', error.message);
        // Fallback to Metaplex
      }
    }
    
    // Fallback: Metaplex 사용 (일부 NFT만 조회될 수 있음)
    console.log('📦 Metaplex API 사용 (일부 NFT 누락 가능)');
    const metaplex = Metaplex.make(connection);
    
    // 재시도 로직으로 NFT 조회
    const nfts = await fetchNFTsWithRetry(metaplex, ownerPublicKey);

    // NFT 정보 포맷팅
    const formattedNFTs = nfts.map(nft => ({
      mint: nft.address.toString(),
      name: nft.name,
      symbol: nft.symbol,
      uri: nft.uri,
      updateAuthority: nft.updateAuthorityAddress?.toString(),
    }));

    console.log(`✅ NFT 조회 성공: ${formattedNFTs.length}개`);
    return formattedNFTs;
  } catch (error) {
    console.error('⚠️ NFT 조회 실패:', error);
    throw new Error(`NFT 조회 실패: ${error.message}`);
  }
};

/**
 * 특정 NFT가 화이트리스트에 있는지 확인
 */
export const isNFTWhitelisted = (nftMint, whitelistedMints) => {
  return whitelistedMints.includes(nftMint);
};

/**
 * NFT 컬렉션 검증
 */
export const verifyNFTCollection = async (connection, nftMint, collectionAddress) => {
  try {
    const metaplex = Metaplex.make(connection);
    const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(nftMint) });
    
    return nft.collection?.address.toString() === collectionAddress;
  } catch (error) {
    console.error('NFT 검증 오류:', error);
    return false;
  }
};
