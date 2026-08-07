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
    return (
      <div className="page-transition" key="login">
        <LoginRegister onLogin={handleLogin} />
      </div>
    );
  }

  if (showCommandCenter && selectedDroneForCommandCenter) {
    return (
      <div className="page-transition" key="command-center">
        <CommandCenter drone={selectedDroneForCommandCenter} onBackToFleet={handleBackToFleet} />
      </div>
    );
  }

  return (
    <div className="page-transition" key="dashboard">
      <Dashboard user={user} onLogout={handleLogout} onOpenCommandCenter={handleOpenCommandCenter} />
    </div>
  );
}

export default App;

