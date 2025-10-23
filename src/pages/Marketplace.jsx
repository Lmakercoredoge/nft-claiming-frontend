import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import './Marketplace.css';

const Marketplace = () => {
  const { publicKey } = useWallet();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadListings();
  }, [filter]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/marketplace/listings?filter=${filter}`);
      const data = await response.json();
      
      if (data.success) {
        setListings(data.listings);
      }
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (listing) => {
    if (!publicKey) {
      alert('지갑을 먼저 연결해주세요!');
      return;
    }

    if (listing.seller === publicKey.toString()) {
      alert('자신의 NFT는 구매할 수 없습니다!');
      return;
    }

    // TODO: 실제 구매 트랜잭션 구현
    alert('구매 기능은 곧 추가됩니다!');
  };

  const filteredListings = listings.filter(listing =>
    listing.nft_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="marketplace">
      <div className="marketplace-header">
        <h1>🛍️ NFT Marketplace</h1>
        <p>Buy and sell NFTs with MONG tokens</p>
      </div>

      {/* 검색 및 필터 */}
      <div className="marketplace-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search NFTs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'cheap' ? 'active' : ''}
            onClick={() => setFilter('cheap')}
          >
            Low Price
          </button>
          <button
            className={filter === 'expensive' ? 'active' : ''}
            onClick={() => setFilter('expensive')}
          >
            High Price
          </button>
        </div>
      </div>

      {/* NFT 목록 */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading NFTs...</p>
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="nft-grid">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="nft-card">
              <div className="nft-image">
                <img src={listing.nft_image || '/placeholder.png'} alt={listing.nft_name} />
              </div>
              
              <div className="nft-info">
                <h3>{listing.nft_name}</h3>
                <p className="nft-mint">{listing.nft_mint.slice(0, 8)}...</p>
                
                <div className="nft-price">
                  <span className="price-label">Price</span>
                  <span className="price-value">{listing.price} MONG</span>
                </div>
                
                <div className="nft-seller">
                  <span className="seller-label">Seller</span>
                  <span className="seller-address">
                    {listing.seller.slice(0, 4)}...{listing.seller.slice(-4)}
                  </span>
                </div>
                
                <button
                  className="buy-button"
                  onClick={() => handleBuy(listing)}
                  disabled={!publicKey || listing.seller === publicKey?.toString()}
                >
                  {!publicKey ? 'Connect Wallet' : 
                   listing.seller === publicKey?.toString() ? 'Your NFT' : 
                   'Buy Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No NFTs found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
