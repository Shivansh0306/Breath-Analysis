import React, { useState } from 'react';
import ThreeBackground from './components/ThreeBackground';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState('Doctor');

  return (
    <div className="app-container" style={{ position: 'relative', width: '100%', minHeight: '100vh', color: '#4a4e69' }}>
      <ThreeBackground />

      <div style={{ position: 'relative', zIndex: 1, padding: '2rem' }}>
        {!user ? (
          <Login onLogin={setUser} />
        ) : (
          <Dashboard user={user} onLogout={() => setUser(null)} />
        )}
      </div>
    </div>
  );
}

export default App;
