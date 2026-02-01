import { useState } from 'react'
import { Toaster } from './components/ui/sonner'
import LoginPage from './components/LoginPage'
import { Navbar01 } from './components/navbar-01'
import DashboardPage from './components/DashboardPage'
import DevicesPage from './components/DevicesPage'
import { NORTH_AMERICAN_REGIONS } from './constants/regions'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'devices'>('dashboard')
  const [devicesTab, setDevicesTab] = useState('device')
  const [region, setRegion] = useState<string>(NORTH_AMERICAN_REGIONS[0])

  const handleNavigate = (page: string, tab?: string) => {
    setCurrentPage(page as 'dashboard' | 'devices')
    if (page === 'devices' && tab) setDevicesTab(tab)
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          appName="vSNET"
          onLogin={async () => setIsAuthenticated(true)}
          onLoginWithSSO={async () => setIsAuthenticated(true)}
        />
        <Toaster />
      </>
    )
  }

  return (
    <>
      {currentPage === 'dashboard' ? (
        <DashboardPage
          appName="vSNET"
          onSignOut={() => setIsAuthenticated(false)}
          onNavigate={handleNavigate}
          region={region}
          onRegionChange={setRegion}
        />
      ) : (
        <div className="h-screen overflow-hidden">
          <DevicesPage
            appName="vSNET"
            onSignOut={() => setIsAuthenticated(false)}
            onNavigate={handleNavigate}
            mainTab={devicesTab}
            onMainTabChange={setDevicesTab}
            region={region}
            onRegionChange={setRegion}
          />
        </div>
      )}
      <Toaster />
    </>
  )
}

export default App
