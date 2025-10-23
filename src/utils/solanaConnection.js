import { Connection, clusterApiUrl } from '@solana/web3.js';
import { NETWORK_CONFIG } from '../config/claimConfig';

/**
 * Solana 연결 설정
 */
export const NETWORK = NETWORK_CONFIG.NETWORK;

export const getConnection = () => {
  const endpoint = NETWORK_CONFIG.RPC_ENDPOINT || clusterApiUrl(NETWORK);
  return new Connection(endpoint, 'confirmed');
};

/**
 * RPC 엔드포인트
 */
export const RPC_ENDPOINT = NETWORK_CONFIG.RPC_ENDPOINT || clusterApiUrl(NETWORK);

/**
 * 네트워크별 Explorer URL
 */
export const EXPLORER_URL = {
  'mainnet-beta': 'https://explorer.solana.com',
  'devnet': 'https://explorer.solana.com/?cluster=devnet',
  'testnet': 'https://explorer.solana.com/?cluster=testnet'
};

export const getExplorerUrl = (address, type = 'address') => {
  return `${EXPLORER_URL[NETWORK]}/${type}/${address}`;
};
