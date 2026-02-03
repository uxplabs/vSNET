import { useState } from 'react'
import { Toaster } from './components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'
import LoginPage from './components/LoginPage'
import DashboardPage from './components/DashboardPage'
import DevicesPage from './components/DevicesPage'
import DeviceDetailPage from './components/DeviceDetailPage'
import TasksPage from './components/TasksPage'
import AdministrationPage from './components/AdministrationPage'
import PerformancePage from './components/PerformancePage'
import type { DeviceRow } from './components/devices-data-table'

type Page = 'dashboard' | 'devices' | 'device-detail' | 'tasks' | 'administration' | 'performance'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [devicesTab, setDevicesTab] = useState('device')
  const [region, setRegion] = useState<string>('All')
  const [selectedDevice, setSelectedDevice] = useState<DeviceRow | null>(null)
  const [scrollToNotesForDeviceId, setScrollToNotesForDeviceId] = useState<string | null>(null)

  const handleNavigate = (page: string, tab?: string) => {
    setCurrentPage(page as Page)
    if (page === 'devices') {
      setSelectedDevice(null)
      setScrollToNotesForDeviceId(null)
      if (tab) setDevicesTab(tab)
    }
  }

  const handleNavigateToDeviceDetail = (device: DeviceRow, options?: { openNotes?: boolean }) => {
    setSelectedDevice(device)
    setCurrentPage('device-detail')
    if (options?.openNotes) setScrollToNotesForDeviceId(device.id)
    else setScrollToNotesForDeviceId(null)
  }

  const handleBackToDevices = () => {
    setCurrentPage('devices')
    setSelectedDevice(null)
    setScrollToNotesForDeviceId(null)
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
    <TooltipProvider delayDuration={300}>
      {currentPage === 'dashboard' ? (
        <DashboardPage
          appName="vSNET"
          onSignOut={() => setIsAuthenticated(false)}
          onNavigate={handleNavigate}
          region={region}
          onRegionChange={setRegion}
        />
      ) : currentPage === 'device-detail' && selectedDevice ? (
        <DeviceDetailPage
          device={selectedDevice}
          appName="vSNET"
          onSignOut={() => setIsAuthenticated(false)}
          onBack={handleBackToDevices}
          onNavigate={handleNavigate}
          region={region}
          onRegionChange={setRegion}
          scrollToNotes={scrollToNotesForDeviceId === selectedDevice.id}
          onScrollToNotesDone={() => setScrollToNotesForDeviceId(null)}
        />
      ) : currentPage === 'tasks' ? (
        <div className="h-screen overflow-hidden">
          <TasksPage
            appName="vSNET"
            onSignOut={() => setIsAuthenticated(false)}
            onNavigate={handleNavigate}
            region={region}
            onRegionChange={setRegion}
          />
        </div>
      ) : currentPage === 'performance' ? (
        <div className="h-screen overflow-hidden">
          <PerformancePage
            appName="vSNET"
            onSignOut={() => setIsAuthenticated(false)}
            onNavigate={handleNavigate}
            region={region}
            onRegionChange={setRegion}
          />
        </div>
      ) : currentPage === 'administration' ? (
        <AdministrationPage
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
            onNavigateToDeviceDetail={handleNavigateToDeviceDetail}
          />
        </div>
      )}
      <Toaster />
    </TooltipProvider>
  )
}

export default App
