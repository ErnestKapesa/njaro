import { WalletButton } from '../components/WalletButton';
import giraffeImg from '../assets/img/giraffe.jpg';

export default function LoginPage() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light position-relative" style={{background: 'rgba(255,255,255,0.7)'}}>
      {/* Blurred background image */}
      <img src={giraffeImg} alt="Giraffe at zoo" style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 0, filter: 'blur(16px) brightness(0.8)'}} />
      <div className="row w-100 justify-content-center position-relative" style={{maxWidth: 900, borderRadius: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', background: '#fff', zIndex: 1}}>
        {/* Safari image left side (desktop only) */}
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center position-relative p-0" style={{background: 'rgba(0,0,0,0.7)'}}>
          <img
            src={giraffeImg}
            alt="Woman feeding a giraffe at a zoo"
            className="img-fluid w-100 h-100 object-fit-cover opacity-75"
            style={{minHeight: 400, maxHeight: 600}}
          />
          <div className="position-absolute bottom-0 start-0 m-3 px-3 py-1 bg-white bg-opacity-75 rounded text-dark small fw-semibold shadow">
            Image by Sebastian Ashton
          </div>
        </div>
        {/* Login card */}
        <div className="col-12 col-md-6 d-flex flex-column align-items-center justify-content-center p-5 bg-white">
          <div className="mb-4 d-flex flex-column align-items-center">
            <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width: 64, height: 64, fontSize: '2.5rem', background: '#fff', border: '2px solid #E3B505'}}>
              <span role="img" aria-label="mountain">⛰️</span>
            </div>
            <h1 className="h3 fw-bold text-center mb-2" style={{color: '#E3B505'}}>Mint Your Best Safari Shot</h1>
            <p className="text-center mb-3" style={{color: '#1A936F'}}>Choose your wallet to log in</p>
          </div>
          <div className="w-100 mb-4">
            <WalletButton />
          </div>
          <div className="mt-4 text-center text-muted small">Made with <span role="img" aria-label="love">❤️</span> by Ernest Kapesa</div>
        </div>
      </div>
    </div>
  );
}
