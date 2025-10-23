import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import './NFTMarketplace.css';

const NFTMarketplace = () => {
  const { addToCart } = useCart();
  const [nfts, setNfts] = useState([]);
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // NFT 희귀도
  const rarities = [
    { id: 'all', name: 'All NFTs', icon: '🖼️' },
    { id: 'common', name: 'Common', icon: '⚪', color: '#95a5a6' },
    { id: 'rare', name: 'Rare', icon: '🔵', color: '#3498db' },
    { id: 'epic', name: 'Epic', icon: '🟣', color: '#9b59b6' },
    { id: 'legendary', name: 'Legendary', icon: '🟠', color: '#e67e22' },
    { id: 'mythic', name: 'Mythic', icon: '🔴', color: '#e74c3c' },
  ];

  useEffect(() => {
    loadNFTs();
  }, []);

  useEffect(() => {
    filterAndSortNFTs();
  }, [selectedRarity, sortBy, nfts]);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      // 임시 더미 데이터
      const dummyNFTs = [
        {
          id: 1,
          name: 'MONGMONG #001',
          rarity: 'legendary',
          price: 500000,
          image: '/images/nft/nft1.png',
          description: 'The first MONGMONG NFT ever minted',
          collection: 'MONGMONG Genesis',
          featured: true,
        },
        {
          id: 2,
          name: 'Cyber Monkey #042',
          rarity: 'epic',
          price: 250000,
          image: '/images/nft/nft2.png',
          description: 'A rare cyber-enhanced monkey',
          collection: 'Cyber Series',
          featured: true,
        },
        {
          id: 3,
          name: 'Golden Banana #123',
          rarity: 'rare',
          price: 150000,
          image: '/images/nft/nft3.png',
          description: 'Limited edition golden banana',
          collection: 'Treasure Hunt',
          featured: false,
        },
        {
          id: 4,
          name: 'Space Ape #999',
          rarity: 'mythic',
          price: 1000000,
          image: '/images/nft/nft4.png',
          description: 'Ultra rare space explorer',
          collection: 'Space Odyssey',
          featured: true,
        },
        {
          id: 5,
          name: 'Jungle King #555',
          rarity: 'epic',
          price: 300000,
          image: '/images/nft/nft5.png',
          description: 'Ruler of the digital jungle',
          collection: 'Royalty Collection',
          featured: false,
        },
        {
          id: 6,
          name: 'Baby Mong #007',
          rarity: 'common',
          price: 50000,
          image: '/images/nft/nft6.png',
          description: 'Cute baby MONGMONG',
          collection: 'Baby Series',
          featured: false,
        },
      ];

      setNfts(dummyNFTs);
      setFilteredNFTs(dummyNFTs);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortNFTs = () => {
    let filtered = [...nfts];

    // 희귀도 필터
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(n => n.rarity === selectedRarity);
    }

    // 정렬
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rarity':
        const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
        filtered.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    setFilteredNFTs(filtered);
  };

  const handleBuyNFT = (nft) => {
    addToCart({
      id: nft.id,
      name: nft.name,
      price: nft.price,
      image: nft.image,
      type: 'nft',
      rarity: nft.rarity,
    });
  };

  const getRarityColor = (rarity) => {
    const rarityObj = rarities.find(r => r.id === rarity);
    return rarityObj?.color || '#95a5a6';
  };

  if (loading) {
    return (
      <div className="nft-marketplace">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading NFTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-marketplace">
      {/* Header */}
      <div className="marketplace-header">
        <h1>🖼️ MONGMONG NFT Marketplace</h1>
        <p>Exclusive digital collectibles</p>
      </div>

      {/* Filters & Sort */}
      <div className="marketplace-controls">
        {/* Rarity Filters */}
        <div className="rarity-filters">
          {rarities.map(rarity => (
            <button
              key={rarity.id}
              className={`rarity-btn ${selectedRarity === rarity.id ? 'active' : ''}`}
              onClick={() => setSelectedRarity(rarity.id)}
              style={{
                borderColor: selectedRarity === rarity.id ? rarity.color : 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <span className="rarity-icon">{rarity.icon}</span>
              <span>{rarity.name}</span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="rarity">Rarity</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* NFTs Grid */}
      <div className="nfts-grid">
        {filteredNFTs.length > 0 ? (
          filteredNFTs.map(nft => (
            <div key={nft.id} className="nft-card">
              <div className="nft-image" style={{ borderColor: getRarityColor(nft.rarity) }}>
                <img 
                  src={nft.image} 
                  alt={nft.name}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23667eea" width="300" height="300"/%3E%3Ctext fill="%23fff" font-size="40" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E🐵%3C/text%3E%3C/svg%3E';
                  }}
                />
                {nft.featured && (
                  <span className="featured-badge">⭐ Featured</span>
                )}
                <span 
                  className="rarity-badge" 
                  style={{ background: getRarityColor(nft.rarity) }}
                >
                  {rarities.find(r => r.id === nft.rarity)?.icon} {nft.rarity.toUpperCase()}
                </span>
              </div>
              <div className="nft-info">
                <h3>{nft.name}</h3>
                <p className="nft-collection">{nft.collection}</p>
                <p className="nft-description">{nft.description}</p>
                <div className="nft-footer">
                  <div className="nft-price">
                    <span className="price">{nft.price.toLocaleString()}</span>
                    <span className="currency">MONG</span>
                  </div>
                  <button 
                    className="buy-nft-btn"
                    onClick={() => handleBuyNFT(nft)}
                  >
                    💎 Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-nfts">
            <div className="empty-icon">🖼️</div>
            <h3>No NFTs found</h3>
            <p>Try selecting a different rarity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMarketplace;
