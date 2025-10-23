import { MerkleTree } from 'merkletreejs';
import { keccak256 } from 'js-sha3';

/**
 * NFT 민트 주소 리스트로 Merkle Tree 생성
 */
export const createMerkleTree = (mintAddresses) => {
  // 각 주소를 해시화
  const leaves = mintAddresses.map(addr => Buffer.from(keccak256(addr), 'hex'));
  
  // Merkle Tree 생성
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  
  return tree;
};

/**
 * Merkle Root 가져오기
 */
export const getMerkleRoot = (tree) => {
  return tree.getRoot().toString('hex');
};

/**
 * 특정 주소의 Merkle Proof 생성
 */
export const getMerkleProof = (tree, address) => {
  const leaf = Buffer.from(keccak256(address), 'hex');
  const proof = tree.getProof(leaf);
  
  return proof.map(p => p.data.toString('hex'));
};

/**
 * Merkle Proof 검증
 */
export const verifyMerkleProof = (tree, address, proof) => {
  const leaf = Buffer.from(keccak256(address), 'hex');
  const proofBuffers = proof.map(p => Buffer.from(p, 'hex'));
  
  return tree.verify(proofBuffers, leaf, tree.getRoot());
};

/**
 * 화이트리스트 예제 데이터
 * 실제 프로젝트에서는 이 리스트를 업데이트하세요
 */
export const EXAMPLE_WHITELIST = [
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  'DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x',
  '8FE27ioQh3T7o22QsYVT5Re8NnHFqmFNbdqwiF3ywuZQ',
  '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
  // 여기에 더 많은 화이트리스트 NFT 민트 주소 추가
];

/**
 * 화이트리스트로 Merkle Tree 초기화
 */
export const initializeMerkleTree = (whitelist = EXAMPLE_WHITELIST) => {
  return createMerkleTree(whitelist);
};

/**
 * NFT가 화이트리스트에 있는지 확인
 */
export const isNFTWhitelisted = (nftMint, whitelist = EXAMPLE_WHITELIST) => {
  return whitelist.includes(nftMint);
};

/**
 * 여러 NFT 중 화이트리스트에 있는 NFT만 필터링
 */
export const filterWhitelistedNFTs = (nfts, whitelist = EXAMPLE_WHITELIST) => {
  return nfts.filter(nft => whitelist.includes(nft.mint));
};

/**
 * 화이트리스트 NFT 개수 계산
 */
export const countWhitelistedNFTs = (nfts, whitelist = EXAMPLE_WHITELIST) => {
  return filterWhitelistedNFTs(nfts, whitelist).length;
};
