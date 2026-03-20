import { useAuth } from './application/useAuth';
import LoginPage from './ui/pages/LoginPage';
import GraphPage from './ui/pages/GraphPage';

export default function App() {
  const { isAuthenticated, login, logout, token } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return <GraphPage token={token} onLogout={logout} />;
}
