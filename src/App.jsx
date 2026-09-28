import React, { useState } from 'react'
import Login from './login'
import Dashboard from './User'
import OfficerDashboard from './Lmo'
import AdminDashboard from './Admin'
const App = () => {
  const [currentView, setCurrentView] = useState('login')

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <div className="flex-1">
        {currentView === 'login' && (
          <Login
            onSelectPortal={(portal) => {
              if (portal === 'user') {
                setCurrentView('user')
              } else if (portal === 'lmo') {
                setCurrentView('lmo')
              } else if (portal === 'admin') {
                setCurrentView('admin')
              } else {
                setCurrentView('user')
              }
            }}
          />
        )}
        {currentView === 'user' && (
          <Dashboard onLogout={() => setCurrentView('login')} />
        )}
        {currentView === 'lmo' && (
          <OfficerDashboard onLogout={() => setCurrentView('login')} />
        )}
        {currentView === 'admin' && (
          <AdminDashboard onLogout={() => setCurrentView('login')} />
        )}
      </div>
    </div>
  )
}

export default App