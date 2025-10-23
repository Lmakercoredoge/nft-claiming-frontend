import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import './UserProfile.css';

const UserProfile = () => {
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState(null);
  const [claims, setClaims] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (publicKey) {
      loadUserData();
    }
  }, [publicKey]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${publicKey.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
        setClaims(data.claims || []);
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="user-profile">
        <div className="not-connected">
          <div className="icon">👤</div>
          <h2>지갑을 연결해주세요</h2>
          <p>프로필을 보려면 지갑 연결이 필요합니다</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-profile">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>프로필 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">👤</div>
        <div className="profile-info">
          <h1>My Profile</h1>
          <p className="wallet-address">
            {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
          </p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-icon">🎁</div>
          <div className="stat-content">
            <h3>{claims.length}</h3>
            <p>총 클레임</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{orders.length}</h3>
            <p>총 주문</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{claims.reduce((sum, c) => sum + (c.amount || 0), 0)}</h3>
            <p>총 획득 MONG</p>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          개요
        </button>
        <button
          className={`tab ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          클레임 내역
        </button>
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          주문 내역
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <h3>환영합니다! 👋</h3>
            <p>MONGMONG NFT Claiming Platform에 오신 것을 환영합니다.</p>
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="claims-tab">
            <h3>클레임 내역</h3>
            {claims.length > 0 ? (
              <div className="claims-list">
                {claims.map((claim, index) => (
                  <div key={index} className="claim-item">
                    <div className="claim-header">
                      <span className="claim-amount">{claim.amount} MONG</span>
                      <span className="claim-date">
                        {new Date(claim.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p>NFT: {claim.nft_count}개</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">클레임 내역이 없습니다</p>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-tab">
            <h3>주문 내역</h3>
            {orders.length > 0 ? (
              <div className="orders-list">
                {orders.map((order, index) => (
                  <div key={index} className="order-item">
                    <div className="order-header">
                      <span className="order-id">#{order.orderId}</span>
                      <span className={`order-status status-${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="order-amount">{order.totalPrice} {order.currency}</p>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">주문 내역이 없습니다</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
