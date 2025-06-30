import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useState } from 'react';

export const WalletButton = () => {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="position-relative w-100">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button 
                      onClick={openConnectModal}
                      className="btn btn-lg w-100 d-flex align-items-center justify-content-center gap-2 fw-bold shadow-sm"
                      style={{borderRadius: 32, fontSize: '1.1rem', background: '#1A936F', color: '#fff', border: 'none'}}
                    >
                      <span role="img" aria-label="wallet" style={{fontSize: '1.5rem'}}>👛</span>
                      Connect Wallet
                    </button>
                  );
                }

                return (
                  <div className="d-flex align-items-center gap-3">
                    <button
                      onClick={openChainModal}
                      className="btn btn-success d-flex align-items-center gap-2"
                      style={{borderRadius: 24, background: '#1A936F', border: 'none'}}
                    >
                      <span role="img" aria-label="chain" style={{fontSize: '1.3rem'}}>🔗</span>
                      {chain.name}
                    </button>
                    <button
                      onClick={openAccountModal}
                      className="btn btn-outline-dark d-flex align-items-center gap-2"
                      style={{borderRadius: 24}}
                    >
                      <span role="img" aria-label="user" style={{fontSize: '1.3rem'}}>🧑‍💼</span>
                      {account.displayName}
                    </button>
                    <button
                      onClick={copyAddress}
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      style={{borderRadius: 24}}
                    >
                      <span role="img" aria-label="copy">📋</span>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};
