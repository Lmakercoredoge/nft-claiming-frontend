import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { publicKey } = useWallet();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (publicKey) {
      loadStats();
    }
  }, [publicKey]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="admin-dashboard">
        <div className="not-authorized">
          <div className="icon">🔐</div>
          <h2>관리자 전용</h2>
          <p>관리자 지갑으로 연결해주세요</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>📊 Admin Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{stats?.totalClaims || 0}</h3>
            <p>총 클레임</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats?.totalOrders || 0}</h3>
            <p>총 주문</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats?.uniqueWallets || 0}</h3>
            <p>고유 지갑</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
