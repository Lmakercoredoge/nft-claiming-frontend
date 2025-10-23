import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useMobileWalletConnect } from '../hooks/useMobileWalletConnect';
import './WalletConnect.css';

const WalletConnect = ({ compact = false }) => {
  const { publicKey, connected } = useWallet();
  const { isMobile } = useMobileWalletConnect();

  // Compact mode for navigation
  if (compact) {
    return (
      <div className="wallet-connect-compact">
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      {isMobile && !connected && (
        <div className="mobile-guide">
          <div className="guide-box">
            <p className="guide-title">📱 HOW TO CONNECT ON MOBILE</p>
            <ol className="guide-steps">
              <li>Open <strong>Phantom App</strong></li>
              <li>Tap <strong>"Browser"</strong> tab at bottom</li>
              <li>Enter this website URL</li>
              <li>Tap <strong>"Connect"</strong> button below</li>
              <li>Approve connection in popup</li>
            </ol>
            <p className="guide-warning">⚠️ MUST USE PHANTOM IN-APP BROWSER</p>
          </div>
        </div>
      )}
      
      <WalletMultiButton />
      
      {connected && (
        <div className="wallet-info">
          <p>✅ CONNECTED WALLET:</p>
          <code>{publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}</code>
        </div>
      )}
      
      {isMobile && !connected && (
        <div className="mobile-instructions">
          <p>🔹 NO PHANTOM APP?</p>
          <a 
            href="https://phantom.app/download" 
            target="_blank" 
            rel="noopener noreferrer"
            className="download-link"
          >
            DOWNLOAD PHANTOM
          </a>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
