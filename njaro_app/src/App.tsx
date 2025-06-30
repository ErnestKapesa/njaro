import './App.css';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAccount } from 'wagmi';
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';

export default function App() {
  const { isConnected } = useAccount();
  return isConnected ? <FeedPage /> : <LoginPage />;
}
