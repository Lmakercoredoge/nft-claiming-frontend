import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getNFTsByOwner } from '../utils/nftVerification';
import { checkClaimEligibility } from '../utils/apiService';
import './NFTChecker.css';

const NFTChecker = ({ onNFTsFound, onEligibilityCheck }) => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eligibility, setEligibility] = useState(null);

  const checkEligibility = async (userNFTs) => {
    if (!publicKey) return;

    try {
      const nftMints = userNFTs.map(nft => nft.mint);
      
      const data = await checkClaimEligibility(publicKey.toString(), nftMints);
      
      setEligibility(data);
      
      if (onEligibilityCheck) {
        onEligibilityCheck(data);
      }

      return data;
    } catch (err) {
      console.error('Eligibility check error:', err);
      setError('클레임 가능 여부 확인 실패: ' + err.message);
      return { eligible: false, error: err.message };
    }
  };

  const checkNFTs = async () => {
    if (!publicKey || !connected) {
      setError('PLEASE CONNECT YOUR WALLET FIRST');
      return;
    }

    setLoading(true);
    setError(null);
    setEligibility(null);

    try {
      console.log('🔍 Checking NFTs for:', publicKey.toString());
      
      const userNFTs = await getNFTsByOwner(connection, publicKey);
      
      console.log('✅ Found NFTs:', userNFTs.length);
      setNfts(userNFTs);
      
      if (onNFTsFound) {
        onNFTsFound(userNFTs);
      }

      // 클레임 가능 여부 확인 (백엔드가 있을 때만)
      if (userNFTs.length > 0) {
        // NFT 개수 제한 (최대 10개까지만 인정)
        const claimableNFTs = Math.min(userNFTs.length, 10);
        const claimAmount = claimableNFTs * 50000; // NFT당 50,000 토큰
        
        // 백엔드 체크 대신 프론트엔드에서 간단히 계산
        const eligibilityData = {
          eligible: true,
          nftCount: userNFTs.length,
          claimableNFTs: claimableNFTs, // 실제 클레임 가능한 NFT 개수
          amount: claimAmount,
          validNFTs: userNFTs.slice(0, 10).map(nft => nft.mint), // 최대 10개만
          message: userNFTs.length > 10 
            ? `${userNFTs.length}개 NFT 보유 (최대 10개까지 인정) → ${claimAmount.toLocaleString()} MONG 클레임 가능!`
            : `${claimableNFTs}개 NFT로 ${claimAmount.toLocaleString()} MONG 클레임 가능!`
        };
        
        setEligibility(eligibilityData);
        
        if (onEligibilityCheck) {
          onEligibilityCheck(eligibilityData);
        }
      } else {
        setError('NO NFTS FOUND IN YOUR WALLET');
      }

    } catch (err) {
      console.error('NFT CHECK ERROR:', err);
      
      // 에러 타입에 따라 다른 메시지 표시
      let errorMessage = 'NFT 조회 실패';
      
      if (err.message.includes('All RPC endpoints failed')) {
        errorMessage = '⚠️ RPC 서버 연결 실패\n\n모든 Solana RPC 서버가 응답하지 않습니다.\n잠시 후 다시 시도해주세요.\n\n또는 개인 RPC 키를 사용해보세요:\n- QuickNode (quicknode.com)\n- Helius (helius.xyz)\n- Alchemy (alchemy.com)';
        
        // 데모 모드: 더미 NFT 데이터 표시
        console.log('🎭 DEMO MODE: Using dummy NFT data');
        const dummyNFTs = [
          { mint: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', name: 'MONGMONG #1234', symbol: 'MONG' },
          { mint: 'DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x', name: 'MONGMONG #5678', symbol: 'MONG' },
          { mint: '8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV', name: 'MONGMONG #9012', symbol: 'MONG' },
        ];
        
        setNfts(dummyNFTs);
        if (onNFTsFound) {
          onNFTsFound(dummyNFTs);
        }
        
        // 더미 eligibility 데이터 (새로운 규칙)
        const claimableNFTs = Math.min(dummyNFTs.length, 10);
        const claimAmount = claimableNFTs * 50000;
        
        const dummyEligibility = {
          eligible: true,
          nftCount: dummyNFTs.length,
          claimableNFTs: claimableNFTs,
          amount: claimAmount, // 3개 xd7 50,000 = 150,000
          validNFTs: dummyNFTs.map(n => n.mint),
        };
        
        setEligibility(dummyEligibility);
        if (onEligibilityCheck) {
          onEligibilityCheck(dummyEligibility);
        }
        
        setError('🎭 DEMO MODE\n\nRPC 서버 연결 실패로 데모 데이터를 표시합니다.\n실제 NFT를 보려면 개인 RPC 키가 필요합니다.');
        
      } else if (err.message.includes('403')) {
        errorMessage = '⚠️ RPC 접근 거부\n\n무료 RPC가 rate limit에 도달했습니다.\n잠시 후 다시 시도하거나\n유료 RPC 서비스를 이용해주세요.';
      } else if (err.message.includes('Timeout')) {
        errorMessage = '⚠️ 연결 시간 초과\n\n네트워크가 느리거나 불안정합니다.\n다시 시도해주세요.';
      } else {
        errorMessage = `⚠️ ${err.message}`;
      }
      
      if (!err.message.includes('All RPC endpoints failed')) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      checkNFTs();
    } else {
      setNfts([]);
      setEligibility(null);
      setError(null);
    }
  }, [connected, publicKey]);

  return (
    <div className="nft-checker">
      <h2>YOUR NFTS</h2>
      
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>CHECKING NFTS...</p>
        </div>
      )}
      
      {error && !loading && (
        <div className="error-message">
          <p className="error">⚠️ {error}</p>
          {connected && (
            <button onClick={checkNFTs} className="retry-button">
              🔄 재시도
            </button>
          )}
        </div>
      )}
      
      {/* 클레임 불가 경고 */}
      {eligibility && !eligibility.eligible && !loading && (
        <div className="eligibility-warning">
          <p className="warning-title">⚠️ 클레임 불가</p>
          <p className="warning-message">
            {eligibility.message || '이 지갑은 클레임 자격이 없습니다'}
          </p>
          {eligibility.reason && (
            <p className="warning-reason">사유: {eligibility.reason}</p>
          )}
        </div>
      )}

      {/* 클레임 가능 성공 */}
      {eligibility && eligibility.eligible && !loading && (
        <div className="eligibility-success">
          <p className="success-title">✅ 클레임 가능!</p>
          <p className="success-message">
            {eligibility.nftCount}개 NFT로 {eligibility.amount} MONG 클레임 가능
          </p>
        </div>
      )}
      
      {/* NFT 목록 */}
      {!loading && !error && nfts.length > 0 && (
        <div className="nft-list">
          <p className="nft-count">
            TOTAL: {nfts.length} NFT{nfts.length > 1 ? 'S' : ''} FOUND
            {eligibility?.validNFTs && eligibility.validNFTs.length > 0 && 
              ` (${eligibility.validNFTs.length} VALID)`
            }
          </p>
          <div className="nft-grid">
            {nfts.slice(0, 6).map((nft, index) => {
              const isValid = eligibility?.validNFTs?.includes(nft.mint);
              return (
                <div key={index} className={`nft-item ${isValid ? 'valid' : 'invalid'}`}>
                  <div className="nft-name">{nft.name || 'UNKNOWN NFT'}</div>
                  <code className="nft-mint">{nft.mint.slice(0, 8)}...</code>
                  {isValid && <span className="valid-badge">✓</span>}
                  {!isValid && eligibility && <span className="invalid-badge">✗</span>}
                </div>
              );
            })}
          </div>
          {nfts.length > 6 && (
            <p className="nft-more">+{nfts.length - 6} more NFTs</p>
          )}
        </div>
      )}
      
      {/* 지갑 미연결 */}
      {!connected && !loading && (
        <p className="no-wallet">PLEASE CONNECT YOUR WALLET</p>
      )}
      
      {/* NFT 없음 */}
      {!loading && !error && connected && nfts.length === 0 && (
        <p className="no-nfts">NO NFTS FOUND IN YOUR WALLET</p>
      )}
    </div>
  );
};

export default NFTChecker;
