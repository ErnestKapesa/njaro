import 'bootstrap/dist/css/bootstrap.min.css';
import '@coinbase/onchainkit/styles.css';
import './index.css';
import giraffeImg from './assets/img/giraffe.jpg';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Address } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { ReactNode } from 'react';
import React from 'react';
import { buildMintTransaction } from '@coinbase/onchainkit/api';
import { useWalletClient } from 'wagmi';

const apiKey = import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY;

function LoginPage({ onConnect, isConnected, setIsConnected }: { onConnect: () => void; isConnected: boolean; setIsConnected: (v: boolean) => void }) {
  const navigate = useNavigate();
  const walletBtnRef = React.useRef<HTMLDivElement>(null);

  // On mount, check if the wallet is already connected by inspecting the ConnectWallet button
  React.useEffect(() => {
    const checkWalletConnected = () => {
      if (walletBtnRef.current) {
        // Look for a button that does NOT say 'Connect Wallet' (i.e., shows address or connected)
        const btn = walletBtnRef.current.querySelector('button');
        if (btn && btn.textContent && !btn.textContent.includes('Connect Wallet')) {
          setIsConnected(true);
          navigate('/mint', { replace: true });
        }
      }
    };
    checkWalletConnected();
    const interval = setInterval(checkWalletConnected, 1000);
    return () => clearInterval(interval);
  }, [navigate, setIsConnected]);

  // Redirect to /mint if already connected (from state)
  React.useEffect(() => {
    if (isConnected) {
      navigate('/mint', { replace: true });
    }
  }, [isConnected, navigate]);

  // Handler for wallet connection
  const handleConnect = () => {
    onConnect();
    navigate('/mint', { replace: true });
  };
  return (
    <div className="d-flex flex-column flex-md-row min-vh-100 align-items-stretch bg-dark">
      {/* Left: Giraffe image with overlay and heading */}
      <div className="col-12 col-md-6 d-flex flex-column justify-content-between p-0 position-relative overflow-hidden" style={{ minHeight: 400 }}>
        <img
          src={giraffeImg}
          alt="Giraffe at zoo"
          className="w-100 h-100 position-absolute top-0 start-0 object-fit-cover"
          style={{ minHeight: '100%', minWidth: '100%', filter: 'brightness(0.7) blur(0.5px)' }}
        />
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.25)', zIndex: 1 }}></div>
        <div className="position-relative z-2 d-flex flex-column justify-content-center align-items-start h-100 p-5" style={{ minHeight: 400 }}>
          <div className="border border-2 rounded-4 p-4" style={{ borderColor: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.25)' }}>
            <h1 className="display-4 fw-bold text-white mb-3" style={{ lineHeight: 1.1 }}>
              <span role="img" aria-label="giraffe">🦒</span> <br /> <span className="fw-bold">Mint Your <br />Best Safari Shot</span>
            </h1>
            <p className="text-white-50 mb-0 fw-bold" style={{ maxWidth: 340, fontWeight: 600 }}>
              Capture your wildest moments and mint them as NFTs. Connect your wallet to start your safari adventure.
            </p>
          </div>
        </div>
      </div>
      {/* Right: Login card with Connect Wallet */}
      <div className="col-12 col-md-6 d-flex align-items-center justify-content-center bg-white p-0" style={{ minHeight: 400 }}>
        <div className="w-100 d-flex flex-column align-items-center justify-content-center" style={{ maxWidth: 400, margin: '0 auto', minHeight: 420 }} ref={walletBtnRef}>
          <div className="text-center mb-4 w-100">
            <span className="d-inline-block mb-2" style={{ fontSize: '2.2rem' }}>🌄</span>
            <h2 className="fw-bold mb-2" style={{ color: '#18122B', fontSize: '2rem' }}>Welcome to <span className="fw-bold" style={{ color: '#E3B505' }}>Njaro Mint</span></h2>
            <p className="mb-2 fw-bold" style={{ color: '#555', fontSize: '1.1rem' }}>
              Connect your <span style={{ color: '#0052ff', fontWeight: 700 }}>Coinbase Wallet</span> to enter the NFT Safari adventure.
            </p>
          </div>
          <Wallet>
            <div className="d-flex justify-content-center align-items-center w-100 mb-3">
              <ConnectWallet 
                className="btn btn-lg fw-bold px-5 py-3 shadow-sm d-flex align-items-center justify-content-center gap-2 w-100" 
                disconnectedLabel={<><span role="img" aria-label="camera">📷</span> <span className="fw-bold">Connect Wallet</span></>} 
                onConnect={handleConnect}
              />
            </div>
          </Wallet>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ isConnected, children }: { isConnected: boolean; children: ReactNode }) {
  return isConnected ? children : <Navigate to="/" replace />;
}

function MintPage({ onLogout }: { onLogout: () => void }) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [mintedNft, setMintedNft] = React.useState<{ metadataUri: string, txHash: string, image?: string } | null>(null);
  const { data: walletClient } = useWalletClient();

  // Preview image when selected
  React.useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuccess(null);
    setError(null);
    setMintedNft(null);
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Fetch NFT metadata image after mint
  const fetchNftImage = async (metadataUri: string) => {
    try {
      // Convert ipfs:// to https://gateway.pinata.cloud/ipfs/
      const httpUri = metadataUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
      const res = await fetch(httpUri);
      const meta = await res.json();
      let imageUrl = meta.image;
      if (imageUrl.startsWith('ipfs://')) {
        imageUrl = imageUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
      }
      return imageUrl;
    } catch {
      return undefined;
    }
  };

  // Handle minting
  const handleMint = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    setMintedNft(null);
    try {
      if (!selectedFile) {
        setError('Please select an image to mint.');
        setLoading(false);
        return;
      }
      if (!walletClient) {
        setError('Wallet not connected.');
        setLoading(false);
        return;
      }
      // 1. Upload image to backend to get metadata URI
      const formData = new FormData();
      formData.append('image', selectedFile);
      const uploadResponse = await fetch('/api/mint', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      if (!uploadData.success || !uploadData.metadataUri) {
        setError(uploadData.error || 'Image upload or metadata creation failed.');
        setLoading(false);
        return;
      }
      // 2. Build mint transaction using OnchainKit
      // TODO: Replace with your actual contract address, taker address, tokenId, and network
      const mintAddress = '0xYourNFTContractAddress';
      const takerAddress = walletClient.account.address;
      const tokenId = uploadData.tokenId || '1';
      const network = 'networks/base-mainnet';
      const txResponse = await buildMintTransaction({
        mintAddress,
        takerAddress,
        tokenId,
        quantity: 1,
        network,
      });
      // Type guard for call_data
      if (!txResponse || typeof txResponse !== 'object' || !('call_data' in txResponse) || !txResponse.call_data) {
        setError('Failed to build mint transaction.');
        setLoading(false);
        return;
      }
      // 3. Send transaction using wallet client
      const txHash = await walletClient.sendTransaction({
        to: txResponse.call_data.to,
        data: txResponse.call_data.data,
        value: BigInt(txResponse.call_data.value || '0'),
      });
      // 4. Fetch NFT image from metadata
      const image = await fetchNftImage(uploadData.metadataUri);
      setSuccess(`Minted! Tx: ${txHash}`);
      setMintedNft({ metadataUri: uploadData.metadataUri, txHash, image });
    } catch (err: any) {
      setError(err.message || 'Minting failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-outline-danger fw-bold" onClick={onLogout}>
          Logout
        </button>
      </div>
      <h2 className="mb-4 fw-bold text-center animate-fade-in" style={{ color: '#E3B505', textShadow: '0 2px 12px #fff8' }}>🦒 <span className="fw-bold">Mint Your Best Safari Shot</span></h2>
      <div className="text-center mb-4">
        <span className="badge fs-6 p-2 mb-3" style={{ background: '#E3B505', color: '#18122B', fontWeight: 600, fontSize: '1.1rem' }}>
          Connected as <Address />
        </span>
      </div>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card glassmorphism p-4 shadow-lg border-0 animate-nft-card">
            <h4 className="fw-bold mb-3 text-center">Upload Your Safari Photo</h4>
            <div className="mb-3 text-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="img-fluid rounded mb-2 shadow" style={{ maxHeight: 260, objectFit: 'cover' }} />
              ) : (
                <div className="border rounded p-4 text-muted bg-light">Image preview will appear here</div>
              )}
            </div>
            <input type="file" accept="image/*" className="form-control mb-3" onChange={handleFileChange} disabled={loading} />
            <button
              className="btn btn-lg btn-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-2 animate-btn-glow"
              onClick={handleMint}
              disabled={loading || !selectedFile}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Minting...
                </>
              ) : (
                <>
                  <span role="img" aria-label="mint">🪙</span> Mint NFT
                </>
              )}
            </button>
            {success && <div className="alert alert-success mt-3 text-center">{success}</div>}
            {error && <div className="alert alert-danger mt-3 text-center">{error}</div>}
            {mintedNft && (
              <div className="alert alert-info mt-4 text-center">
                <div className="mb-2">NFT Minted!</div>
                {mintedNft.image && <img src={mintedNft.image} alt="Minted NFT" className="img-fluid rounded mb-2" style={{ maxHeight: 180 }} />}
                <div className="mt-2">
                  <a href={`https://basescan.org/tx/${mintedNft.txHash}`} target="_blank" rel="noopener noreferrer" className="btn btn-link">View Transaction</a>
                </div>
                <div>
                  <a href={`https://basescan.org/address/${walletClient?.account.address}`} target="_blank" rel="noopener noreferrer" className="btn btn-link">View Your Wallet</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isConnected, setIsConnected] = useState(false);

  // Handler for logout: disconnect wallet and go to login
  const handleLogout = () => {
    setIsConnected(false);
    window.location.href = '/';
  };

  return (
    <OnchainKitProvider apiKey={apiKey} chain={base}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage onConnect={() => setIsConnected(true)} isConnected={isConnected} setIsConnected={setIsConnected} />} />
          <Route path="/mint" element={
            <ProtectedRoute isConnected={isConnected}>
              <MintPage onLogout={handleLogout} />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </OnchainKitProvider>
  );
}

export default App;

// Custom CSS for glassmorphism and animations (add to index.css or App.css):
// .glassmorphism { background: rgba(255,255,255,0.15); backdrop-filter: blur(12px); border-radius: 1.5rem; box-shadow: 0 8px 32px rgba(0,0,0,0.12); transition: transform 0.3s cubic-bezier(.4,2,.3,1), box-shadow 0.3s; }
// .glassmorphism:hover { transform: translateY(-8px) scale(1.03); box-shadow: 0 16px 48px rgba(227,181,5,0.18); }
// .animate-fade-in { animation: fadeIn 1s ease; }
// .animate-slide-in-left { animation: slideInLeft 1.2s cubic-bezier(.4,2,.3,1); }
// .animate-pop-in { animation: popIn 0.7s cubic-bezier(.4,2,.3,1); }
// .animate-btn-glow { box-shadow: 0 0 8px #E3B50588; transition: box-shadow 0.3s; }
// .animate-btn-glow:hover { box-shadow: 0 0 24px #E3B505cc; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// @keyframes slideInLeft { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: none; } }
// @keyframes popIn { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
