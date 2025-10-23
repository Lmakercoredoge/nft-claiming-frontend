import { 
  initializeMerkleTree, 
  getMerkleProof, 
  verifyMerkleProof,
  filterWhitelistedNFTs 
} from './merkleTree';
import { requestClaim, checkClaimEligibility } from './apiService';
import { CLAIM_CONFIG } from '../config/claimConfig';

/**
 * NFT 소유권 검증 및 화이트리스트 확인
 */
export const verifyNFTOwnership = async (userNFTs) => {
  // 화이트리스트에 있는 NFT만 필터링
  const whitelistedNFTs = filterWhitelistedNFTs(userNFTs);
  
  if (whitelistedNFTs.length === 0) {
    throw new Error('화이트리스트에 등록된 NFT가 없습니다');
  }
  
  // Merkle Tree 생성
  const merkleTree = initializeMerkleTree();
  
  // 각 NFT에 대한 Merkle Proof 생성 및 검증
  const verifiedNFTs = [];
  
  for (const nft of whitelistedNFTs) {
    const proof = getMerkleProof(merkleTree, nft.mint);
    const isValid = verifyMerkleProof(merkleTree, nft.mint, proof);
    
    if (isValid) {
      verifiedNFTs.push({
        ...nft,
        proof,
      });
    }
  }
  
  return verifiedNFTs;
};

/**
 * 토큰 클레임 실행 (백엔드 API 사용)
 */
export const claimTokens = async (
  connection,
  wallet,
  userNFTs,
  claimAmount
) => {
  try {
    // 1. 지갑 연결 확인
    if (!wallet.publicKey) {
      throw new Error('지갑이 연결되지 않았습니다');
    }
    
    const walletAddress = wallet.publicKey.toString();
    
    // 2. 백엔드에서 쿨다운 체크
    const eligibility = await checkClaimEligibility(walletAddress);
    
    if (!eligibility.canClaim) {
      const timeRemaining = eligibility.timeRemaining;
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      throw new Error(`다음 클레임까지 ${hours}시간 ${minutes}분 남았습니다`);
    }
    
    // 3. NFT 소유권 및 화이트리스트 검증
    const verifiedNFTs = await verifyNFTOwnership(userNFTs);
    
    if (verifiedNFTs.length === 0) {
      throw new Error('검증된 NFT가 없습니다');
    }
    
    console.log('검증된 NFT:', verifiedNFTs);
    
    // 4. 백엔드 API로 클레임 요청
    const nftMints = verifiedNFTs.map(nft => nft.mint);
    const result = await requestClaim(walletAddress, nftMints, claimAmount);
    
    if (!result.success) {
      throw new Error(result.error || '클레임 실패');
    }
    
    return {
      success: true,
      amount: result.amount,
      nftCount: verifiedNFTs.length,
      signature: result.signature,
      explorerUrl: result.explorerUrl,
    };
    
  } catch (error) {
    console.error('클레임 오류:', error);
    throw error;
  }
};

/**
 * 클레임 가능 상태 정보 (백엔드에서 가져오기)
 */
export const getClaimStatus = async (walletAddress) => {
  try {
    const eligibility = await checkClaimEligibility(walletAddress);
    
    return {
      canClaim: eligibility.canClaim,
      timeRemaining: eligibility.timeRemaining,
      lastClaim: eligibility.lastClaim,
      nextClaimDate: eligibility.lastClaim 
        ? new Date(eligibility.lastClaim + CLAIM_CONFIG.CLAIM_COOLDOWN)
        : null,
    };
  } catch (error) {
    console.error('클레임 상태 확인 오류:', error);
    // 오류 시 기본값 반환
    return {
      canClaim: true,
      timeRemaining: 0,
      lastClaim: null,
      nextClaimDate: null,
    };
  }
};
