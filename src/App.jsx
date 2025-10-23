import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { WalletContextProvider } from './context/WalletContextProvider';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import TopBanner from './components/TopBanner';
import WalletConnect from './components/WalletConnect';
import NFTChecker from './components/NFTChecker';
import ClaimButton from './components/ClaimButton';
import Cart from './components/shop/Cart';
import CartButton from './components/shop/CartButton';
import WearableShop from './pages/WearableShop';
import NFTMarketplace from './pages/NFTMarketplace';
import UserProfile from './pages/UserProfile';
import { UI_CONFIG, calculateClaimAmount, loadConfigFromAPI } from './config/claimConfig';
import './App.css';

// Home 페이지 (기존 클레임 페이지)
function HomePage({ 
  userNFTs, 
  setUserNFTs, 
  claimAmount, 
  setClaimAmount, 
  eligibility, 
  setEligibility,
  imageError,
  setImageError 
}) {
  const handleNFTsFound = (nfts) => {
    setUserNFTs(nfts);
    const amount = calculateClaimAmount(nfts.length);
    setClaimAmount(amount);
    console.log('FOUND NFTs:', nfts);
    console.log('CLAIMABLE TOKENS:', amount);
  };

  const handleEligibilityCheck = (eligibilityData) => {
    setEligibility(eligibilityData);
    if (eligibilityData.eligible) {
      setClaimAmount(eligibilityData.amount);
    }
  };

  return (
    <div className="page-content">
      {/* 배경 NFT 이미지 */}
      {!imageError && (
        <img 
          src="/images/nft-background.png" 
          alt="NFT Background" 
          className="nft-background-image"
          onError={() => {
            console.log('Image load failed');
            setImageError(true);
          }}
          onLoad={() => console.log('Image loaded successfully')}
        />
      )}
      
      {/* 탑 배너 슬라이더 */}
      <TopBanner />
      
      <header className="App-header">
        <h1>{UI_CONFIG.APP_TITLE}</h1>
        <p>{UI_CONFIG.APP_DESCRIPTION}</p>
        
        {/* 리워드 가이드 링크 */}
        <div className="reward-guide-link">
          <a 
            href="/REWARDS_GUIDE.md" 
            target="_blank" 
            rel="noopener noreferrer"
            className="guide-button"
          >
            📖 HOW TO EARN REWARDS
          </a>
        </div>
      </header>

      <main className="App-main">
        <WalletConnect />
        
        {/* Eligibility Warning */}
        {eligibility && !eligibility.eligible && (
          <div className="eligibility-alert error">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h3>WALLET NOT ELIGIBLE</h3>
              <p>{eligibility.message || 'This wallet is not authorized for claiming.'}</p>
            </div>
          </div>
        )}

        {/* Eligibility Success */}
        {eligibility && eligibility.eligible && (
          <div className="eligibility-alert success">
            <div className="alert-icon">✅</div>
            <div className="alert-content">
              <h3>WALLET ELIGIBLE!</h3>
              <p>
                {eligibility.nftCount > 10 
                  ? `You have ${eligibility.nftCount} NFTs (max 10 counted) → You can claim ${eligibility.amount.toLocaleString()} MONGMONG tokens`
                  : `You can claim ${eligibility.amount.toLocaleString()} MONGMONG tokens with ${eligibility.nftCount} NFTs`
                }
              </p>
            </div>
          </div>
        )}
        
        <div className="content-section">
          <NFTChecker 
            onNFTsFound={handleNFTsFound}
            onEligibilityCheck={handleEligibilityCheck}
          />
          <ClaimButton 
            nfts={userNFTs} 
            claimableAmount={claimAmount}
            eligible={eligibility?.eligible}
          />
        </div>

        <footer className="App-footer">
          <p>{UI_CONFIG.FOOTER_MESSAGE}</p>
        </footer>
      </main>
    </div>
  );
}

// Navigation Component
function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">🐵 MONGMONG</Link>
        </div>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <span className="nav-icon">🎯</span>
            <span>CLAIM</span>
          </Link>
          <Link 
            to="/shop" 
            className={`nav-link ${location.pathname === '/shop' ? 'active' : ''}`}
          >
            <span className="nav-icon">👕</span>
            <span>WEARABLE</span>
          </Link>
          <Link 
            to="/gallery" 
            className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`}
          >
            <span className="nav-icon">🖼️</span>
            <span>NFT</span>
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            <span className="nav-icon">👤</span>
            <span>PROFILE</span>
          </Link>
        </div>
        <div className="nav-wallet">
          <WalletConnect compact />
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [userNFTs, setUserNFTs] = useState([]);
  const [claimAmount, setClaimAmount] = useState(100);
  const [imageError, setImageError] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  
  // 앱 시작 시 설정 로드
  useEffect(() => {
    console.log('🚀 App starting, loading configuration...');
    loadConfigFromAPI().then((result) => {
      setConfigLoaded(true);
      if (result.success) {
        console.log('✅ Configuration loaded successfully');
      } else {
        console.warn('⚠️ Using default configuration');
      }
    });
  }, []);
  
  // 설정 로드 중일 때 로딩 표시
  if (!configLoaded) {
    return (
      <div className="App" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
            animation: 'spin 2s linear infinite'
          }}>
            🐵
          </div>
          <h2>로딩 중...</h2>
          <p>설정을 불러오고 있습니다</p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <WalletContextProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Navigation />

              {/* Routes */}
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <HomePage 
                      userNFTs={userNFTs}
                      setUserNFTs={setUserNFTs}
                      claimAmount={claimAmount}
                      setClaimAmount={setClaimAmount}
                      eligibility={eligibility}
                      setEligibility={setEligibility}
                      imageError={imageError}
                      setImageError={setImageError}
                    />
                  } 
                />
                <Route path="/shop" element={<WearableShop />} />
                <Route path="/gallery" element={<NFTMarketplace />} />
                <Route path="/profile" element={<UserProfile />} />
              </Routes>

              {/* 전역 장바구니 */}
              <Cart />
              <CartButton />
            </div>
          </Router>
        </CartProvider>
      </ToastProvider>
    </WalletContextProvider>
  );
}

export default App;
