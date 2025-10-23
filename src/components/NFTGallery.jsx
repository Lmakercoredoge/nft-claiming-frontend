import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import './NFTGallery.css';

const NFTGallery = () => {
  const { publicKey } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      loadNFTs();
    }
  }, [publicKey]);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      // TODO: Metaplex로 NFT 조회
      // 임시 더미 데이터
      setNfts([]);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="nft-gallery">
        <div className="not-connected">
          <div className="icon">🎨</div>
          <h2>지갑을 연결해주세요</h2>
          <p>NFT 갤러리를 보려면 지갑 연결이 필요합니다</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="nft-gallery">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>NFT를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-gallery">
      <div className="gallery-header">
        <h1>🎨 My NFT Collection</h1>
        <p className="nft-count">
          {nfts.length > 0 ? `${nfts.length}개의 NFT 보유 중` : 'NFT가 없습니다'}
        </p>
      </div>

      {nfts.length > 0 ? (
        <div className="nft-grid">
          {nfts.map((nft, index) => (
            <div key={index} className="nft-card">
              <div className="nft-image">
                <img src={nft.image} alt={nft.name} />
              </div>
              <div className="nft-info">
                <h3>{nft.name}</h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-gallery">
          <div className="empty-icon">🎨</div>
          <h3>NFT가 없습니다</h3>
          <p>이 지갑에는 아직 NFT가 없습니다</p>
        </div>
      )}
    </div>
  );
};

export default NFTGallery;
