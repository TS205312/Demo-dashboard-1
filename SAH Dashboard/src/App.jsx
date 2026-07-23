import { useState } from 'react';
import LoginRegister from './components/LoginRegister';
import Dashboard from './components/Dashboard';
import CommandCenter from './components/CommandCenter';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [selectedDroneForCommandCenter, setSelectedDroneForCommandCenter] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
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

