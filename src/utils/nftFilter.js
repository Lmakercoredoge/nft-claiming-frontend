import { NFT_CONFIG } from '../config/claimConfig';

/**
 * NFT 필터링 유틸리티
 */

/**
 * NFT가 유효한지 검증
 */
export const isValidNFT = (nft) => {
  const method = NFT_CONFIG.FILTER_METHOD || 'ALL';
  
  console.log(`🔍 Filtering NFT: ${nft.name} (Method: ${method})`);
  
  switch (method) {
    case 'COLLECTION':
      return filterByCollection(nft);
      
    case 'CREATOR':
      return filterByCreator(nft);
      
    case 'NAME':
      return filterByName(nft);
      
    case 'MINT':
      return filterByMint(nft);
      
    case 'ALL':
    default:
      return true; // 모든 NFT 허용
  }
};

/**
 * 컬렉션 주소로 필터링
 */
const filterByCollection = (nft) => {
  if (!NFT_CONFIG.WHITELISTED_COLLECTIONS || NFT_CONFIG.WHITELISTED_COLLECTIONS.length === 0) {
    console.warn('⚠️ WHITELISTED_COLLECTIONS가 비어있습니다!');
    return true;
  }
  
  const collection = nft.collection;
  if (!collection) {
    console.log(`❌ ${nft.name}: 컬렉션 정보 없음`);
    return false;
  }
  
  const isValid = NFT_CONFIG.WHITELISTED_COLLECTIONS.includes(collection);
  console.log(`${isValid ? '✅' : '❌'} ${nft.name}: Collection ${collection.slice(0, 8)}...`);
  return isValid;
};

/**
 * 크리에이터 주소로 필터링
 */
const filterByCreator = (nft) => {
  if (!NFT_CONFIG.WHITELISTED_CREATORS || NFT_CONFIG.WHITELISTED_CREATORS.length === 0) {
    console.warn('⚠️ WHITELISTED_CREATORS가 비어있습니다!');
    return true;
  }
  
  const creator = nft.updateAuthority;
  if (!creator) {
    console.log(`❌ ${nft.name}: 크리에이터 정보 없음`);
    return false;
  }
  
  const isValid = NFT_CONFIG.WHITELISTED_CREATORS.includes(creator);
  console.log(`${isValid ? '✅' : '❌'} ${nft.name}: Creator ${creator.slice(0, 8)}...`);
  return isValid;
};

/**
 * NFT 이름으로 필터링
 */
const filterByName = (nft) => {
  if (!NFT_CONFIG.ALLOWED_NAME_PATTERNS || NFT_CONFIG.ALLOWED_NAME_PATTERNS.length === 0) {
    console.warn('⚠️ ALLOWED_NAME_PATTERNS가 비어있습니다!');
    return true;
  }
  
  const name = nft.name || '';
  const symbol = nft.symbol || '';
  
  // 이름이나 심볼에 허용된 패턴이 포함되어 있는지 확인
  const isValid = NFT_CONFIG.ALLOWED_NAME_PATTERNS.some(pattern => {
    return name.includes(pattern) || symbol.includes(pattern);
  });
  
  console.log(`${isValid ? '✅' : '❌'} ${nft.name} (${symbol})`);
  return isValid;
};

/**
 * Mint 주소로 필터링
 */
const filterByMint = (nft) => {
  if (!NFT_CONFIG.WHITELISTED_MINTS || NFT_CONFIG.WHITELISTED_MINTS.length === 0) {
    console.warn('⚠️ WHITELISTED_MINTS가 비어있습니다!');
    return true;
  }
  
  const mint = nft.mint;
  if (!mint) {
    console.log(`❌ ${nft.name}: Mint 주소 없음`);
    return false;
  }
  
  const isValid = NFT_CONFIG.WHITELISTED_MINTS.includes(mint);
  console.log(`${isValid ? '✅' : '❌'} ${nft.name}: Mint ${mint.slice(0, 8)}...`);
  return isValid;
};

/**
 * NFT 목록 필터링
 */
export const filterValidNFTs = (nfts) => {
  console.log(`\n🔍 NFT 필터링 시작: ${nfts.length}개 → 필터 방법: ${NFT_CONFIG.FILTER_METHOD}`);
  
  const validNFTs = nfts.filter(isValidNFT);
  
  console.log(`✅ 필터링 완료: ${validNFTs.length}개 유효 NFT\n`);
  
  if (validNFTs.length < nfts.length) {
    console.log(`🚫 제외된 NFT: ${nfts.length - validNFTs.length}개`);
  }
  
  return validNFTs;
};
