import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { CLAIM_CONFIG } from '../config/claimConfig';
import { claimTokens, getClaimStatus } from '../utils/claimService';
import './ClaimButton.css';

const ClaimButton = ({ nfts, claimableAmount }) => {
  const { publicKey, connected } = useWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState(null);
  const [canClaim, setCanClaim] = useState(true);
  const [cooldownInfo, setCooldownInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check claim eligibility
  useEffect(() => {
    const checkStatus = async () => {
      if (publicKey) {
        setLoading(true);
        try {
          const status = await getClaimStatus(publicKey.toString());
          setCanClaim(status.canClaim);
          
          if (!status.canClaim) {
            const hours = Math.floor(status.timeRemaining / (1000 * 60 * 60));
            const minutes = Math.floor((status.timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            setCooldownInfo({ hours, minutes });
          } else {
            setCooldownInfo(null);
          }
        } catch (error) {
          console.error('STATUS CHECK ERROR:', error);
          setCanClaim(true);
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkStatus();
  }, [publicKey]);

  // Cooldown timer
  useEffect(() => {
    if (!canClaim && publicKey) {
      const interval = setInterval(async () => {
        try {
          const status = await getClaimStatus(publicKey.toString());
          setCanClaim(status.canClaim);
          
          if (!status.canClaim) {
            const hours = Math.floor(status.timeRemaining / (1000 * 60 * 60));
            const minutes = Math.floor((status.timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            setCooldownInfo({ hours, minutes });
          } else {
            setCooldownInfo(null);
          }
          
          if (status.canClaim) {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('TIMER UPDATE ERROR:', error);
        }
      }, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [canClaim, publicKey]);

  const handleClaim = async () => {
    if (!connected || !publicKey) {
      setClaimStatus({ type: 'error', message: '⚠️ CONNECT WALLET FIRST' });
      return;
    }

    if (!nfts || nfts.length === 0) {
      setClaimStatus({ type: 'error', message: '⚠️ NO NFTS FOUND' });
      return;
    }

    if (!canClaim) {
      setClaimStatus({ 
        type: 'error', 
        message: `⏰ COOLDOWN: ${cooldownInfo?.hours || 0}H ${cooldownInfo?.minutes || 0}M` 
      });
      return;
    }

    setClaiming(true);
    setClaimStatus(null);

    try {
      const result = await claimTokens(
        connection,
        wallet,
        nfts,
        claimableAmount
      );
      
      setClaimStatus({ 
        type: 'success', 
        message: `🎉 CLAIMED ${result.amount} ${CLAIM_CONFIG.TOKEN_SYMBOL} SUCCESS!`,
        explorerUrl: result.explorerUrl,
      });
      
      setCanClaim(false);
      
    } catch (error) {
      console.error('CLAIM ERROR:', error);
      setClaimStatus({ 
        type: 'error', 
        message: `❌ ${error.message || 'CLAIM FAILED. TRY AGAIN.'}` 
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="claim-section">
      <div className="claim-info">
        <h3>CLAIMABLE TOKENS</h3>
        <div className="claim-amount">
          {claimableAmount || CLAIM_CONFIG.BASE_CLAIM_AMOUNT} 
          <span className="token-symbol">{CLAIM_CONFIG.TOKEN_SYMBOL}</span>
        </div>
        {nfts && nfts.length > 0 && (
          <div className="nft-bonus">
            <p>🎨 {nfts.length} NFTS OWNED</p>
            <p>💰 BONUS: +{Math.min(nfts.length, 10) * CLAIM_CONFIG.TOKEN_PER_NFT} {CLAIM_CONFIG.TOKEN_SYMBOL}</p>
            {nfts.length > 10 && (
              <p className="max-nfts-notice">⚠️ MAX 10 NFTS COUNTED</p>
            )}
          </div>
        )}
        {!canClaim && cooldownInfo && (
          <div className="cooldown-info">
            <p>⏰ NEXT CLAIM IN</p>
            <p className="cooldown-timer">{cooldownInfo.hours}H {cooldownInfo.minutes}M</p>
          </div>
        )}
      </div>

      <button 
        className={`claim-button ${claiming ? 'claiming' : ''} ${!canClaim ? 'cooldown' : ''}`}
        onClick={handleClaim}
        disabled={!connected || claiming || !nfts || nfts.length === 0 || !canClaim || loading}
      >
        {claiming ? '⚡ CLAIMING...' : 
         loading ? '🔄 LOADING...' :
         !canClaim ? '⏰ COOLDOWN' :
         '🚀 CLAIM TOKENS'}
      </button>

      {claimStatus && (
        <div className={`claim-status ${claimStatus.type}`}>
          {claimStatus.message}
          {claimStatus.explorerUrl && (
            <div className="explorer-link">
              <a href={claimStatus.explorerUrl} target="_blank" rel="noopener noreferrer">
                🔍 VIEW TRANSACTION
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClaimButton;
