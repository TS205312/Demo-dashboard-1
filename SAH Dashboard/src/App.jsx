import { useState } from 'react';
import LoginRegister from './components/LoginRegister';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <div className="page-transition" key="login">
        <LoginRegister onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="page-transition" key="dashboard">
      <Dashboard user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;
