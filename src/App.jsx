import { useState } from 'react';
import LoginRegister from './components/LoginRegister';
import Dashboard from './components/Dashboard';
import CommandCenter from './components/CommandCenter';
import { setCookie, getCookie, deleteCookie } from './utils/cookieUtils';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    // Khôi phục session từ cookie khi khởi tạo
    const saved = getCookie('sah_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [selectedDroneForCommandCenter, setSelectedDroneForCommandCenter] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    // Lưu session vào cookie (7 ngày)
    setCookie('sah_user', JSON.stringify(userData), 7);
  };

  const handleLogout = () => {
    setUser(null);
    // Xoá cookie khi logout
    deleteCookie('sah_user');
  };

  const handleOpenCommandCenter = (drone) => {
    setSelectedDroneForCommandCenter(drone);
    setShowCommandCenter(true);
  };

  const handleBackToFleet = () => {
    setShowCommandCenter(false);
    setSelectedDroneForCommandCenter(null);
  };

  if (!user) {
    return <LoginRegister onLogin={handleLogin} />;
  }

  if (showCommandCenter && selectedDroneForCommandCenter) {
    return <CommandCenter drone={selectedDroneForCommandCenter} onBackToFleet={handleBackToFleet} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} onOpenCommandCenter={handleOpenCommandCenter} />;
}

export default App;


