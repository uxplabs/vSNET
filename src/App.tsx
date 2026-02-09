import { useState, useCallback } from 'react'
import { Toaster } from './components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { DeviceLinkProvider } from './components/ui/device-link'
import { DeviceDrawer } from './components/device-drawer'
import { RadioNodeDrawer, findRadioNode } from './components/radio-node-drawer'
import { NrCellDrawer, findNrCell } from './components/nr-cell-drawer'
import { DEVICES_DATA } from './components/devices-data-table'
import type { RadioNodeRow } from './components/radio-nodes-data-table'
import type { NrCellRow } from './components/nr-cells-data-table'
import LoginPage from './components/LoginPage'
import DashboardPage from './components/DashboardPage'
import DevicesPage from './components/DevicesPage'
import DeviceDetailPage from './components/DeviceDetailPage'
import TasksPage from './components/TasksPage'
import AdministrationPage from './components/AdministrationPage'
import PerformancePage from './components/PerformancePage'
import DesignSystemPage from './components/DesignSystemPage'
import type { DeviceRow } from './components/devices-data-table'

type Page = 'dashboard' | 'devices' | 'device-detail' | 'tasks' | 'administration' | 'performance' | 'design-system'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [devicesTab, setDevicesTab] = useState('device')
  const [devicesStatusFilter, setDevicesStatusFilter] = useState<string>('Status')
  const [devicesConfigStatusFilter, setDevicesConfigStatusFilter] = useState<string>('Config status')
  const [regions, setRegions] = useState<string[]>(['Pacific Northwest'])
  const region = regions[0] ?? 'Pacific Northwest'
  const [selectedDevice, setSelectedDevice] = useState<DeviceRow | null>(null)
  const [scrollToNotesForDeviceId, setScrollToNotesForDeviceId] = useState<string | null>(null)
  const [globalDrawerOpen, setGlobalDrawerOpen] = useState(false)
  const [globalDrawerDevice, setGlobalDrawerDevice] = useState<DeviceRow | null>(null)
  const [radioNodeDrawerOpen, setRadioNodeDrawerOpen] = useState(false)
  const [globalRadioNode, setGlobalRadioNode] = useState<RadioNodeRow | null>(null)
  const [nrCellDrawerOpen, setNrCellDrawerOpen] = useState(false)
  const [globalNrCell, setGlobalNrCell] = useState<NrCellRow | null>(null)

  const handleDeviceLinkClick = useCallback((deviceName: string) => {
    // Check if this is a radio node (e.g. "Radio Node 1", "RN-001")
    if (/^Radio Node \d+$/i.test(deviceName) || /^RN-\d+$/i.test(deviceName)) {
      const rn = findRadioNode(deviceName)
      if (rn) {
        setGlobalRadioNode(rn)
        setRadioNodeDrawerOpen(true)
        return
      }
    }

    // Check if this is an NR cell (e.g. "NR-001", "NR Cell 1")
    if (/^NR-\d+$/i.test(deviceName) || /^NR Cell \d+$/i.test(deviceName)) {
      const cell = findNrCell(deviceName)
      if (cell) {
        setGlobalNrCell(cell)
        setNrCellDrawerOpen(true)
        return
      }
    }

    // Exact match first, then fall back to matching prefix (e.g. eNB-SEA)
    let device = DEVICES_DATA.find((d) => d.device === deviceName)
    if (!device) {
      const prefix = deviceName.replace(/-\d+$/, '')
      device = DEVICES_DATA.find((d) => d.device.startsWith(prefix + '-'))
    }
    if (!device) {
      // Create a synthetic device for items not in DEVICES_DATA
      device = {
        id: deviceName,
        device: deviceName,
        type: 'SN-LTE',
        notes: '',
        status: 'Connected',
        alarms: 0,
        alarmType: 'None' as const,
        configStatus: '—',
        ipAddress: '—',
        version: '—',
        deviceGroup: 'Radio access',
        region: 'Pacific Northwest',
        labels: [],
      }
    }
    setGlobalDrawerDevice(device)
    setGlobalDrawerOpen(true)
  }, [])

  const handleNavigate = (page: string, tab?: string, filters?: { statusFilter?: string; configStatusFilter?: string }) => {
    setCurrentPage(page as Page)
    if (page === 'devices') {
      setSelectedDevice(null)
      setScrollToNotesForDeviceId(null)
      setDevicesTab(tab ?? 'device')
      setDevicesStatusFilter(filters?.statusFilter ?? 'Status')
      setDevicesConfigStatusFilter(filters?.configStatusFilter ?? 'Config status')
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
          appName="AMS"
          onLogin={async () => setIsAuthenticated(true)}
          onLoginWithSSO={async () => setIsAuthenticated(true)}
        />
        <Toaster />
      </>
    )
  }

  return (
    <DeviceLinkProvider onDeviceClick={handleDeviceLinkClick}>
    <TooltipProvider delayDuration={300}>
      {currentPage === 'dashboard' ? (
        <DashboardPage
          appName="AMS"
          onSignOut={() => setIsAuthenticated(false)}
          onNavigate={handleNavigate}
          region={region}
          regions={regions}
          onRegionChange={(r) => setRegions([r])}
          onRegionsChange={setRegions}
        />
      ) : currentPage === 'device-detail' && selectedDevice ? (
        <DeviceDetailPage
          device={selectedDevice}
          appName="AMS"
          onSignOut={() => setIsAuthenticated(false)}
          onBack={handleBackToDevices}
          onNavigate={handleNavigate}
          region={region}
          regions={regions}
          onRegionChange={(r) => setRegions([r])}
          onRegionsChange={setRegions}
          scrollToNotes={scrollToNotesForDeviceId === selectedDevice.id}
          onScrollToNotesDone={() => setScrollToNotesForDeviceId(null)}
        />
      ) : currentPage === 'tasks' ? (
        <div className="h-screen overflow-hidden">
          <TasksPage
            appName="AMS"
            onSignOut={() => setIsAuthenticated(false)}
            onNavigate={handleNavigate}
            region={region}
            regions={regions}
            onRegionChange={(r) => setRegions([r])}
            onRegionsChange={setRegions}
          />
        </div>
      ) : currentPage === 'performance' ? (
        <div className="h-screen overflow-hidden">
          <PerformancePage
            appName="AMS"
            onSignOut={() => setIsAuthenticated(false)}
            onNavigate={handleNavigate}
            region={region}
            regions={regions}
            onRegionChange={(r) => setRegions([r])}
            onRegionsChange={setRegions}
          />
        </div>
      ) : currentPage === 'design-system' ? (
        <DesignSystemPage
          appName="AMS"
          onSignOut={() => setIsAuthenticated(false)}
          onNavigate={handleNavigate}
          region={region}
          regions={regions}
          onRegionChange={(r) => setRegions([r])}
          onRegionsChange={setRegions}
        />
      ) : currentPage === 'administration' ? (
        <div className="h-screen overflow-hidden">
          <AdministrationPage
            appName="AMS"
            onSignOut={() => setIsAuthenticated(false)}
            onNavigate={handleNavigate}
            region={region}
            regions={regions}
            onRegionChange={(r) => setRegions([r])}
            onRegionsChange={setRegions}
          />
        </div>
      ) : (
        <div className="h-screen overflow-hidden">
          <DevicesPage
            appName="AMS"
            onSignOut={() => setIsAuthenticated(false)}
            onNavigate={handleNavigate}
            mainTab={devicesTab}
            onMainTabChange={setDevicesTab}
            region={region}
            regions={regions}
            onRegionChange={(r) => setRegions([r])}
            onRegionsChange={setRegions}
            onNavigateToDeviceDetail={handleNavigateToDeviceDetail}
            initialStatusFilter={devicesStatusFilter}
            initialConfigStatusFilter={devicesConfigStatusFilter}
          />
        </div>
      )}
      <Toaster />
      <DeviceDrawer
        device={globalDrawerDevice}
        open={globalDrawerOpen}
        onOpenChange={setGlobalDrawerOpen}
        onNavigateToDetails={handleNavigateToDeviceDetail}
      />
      <RadioNodeDrawer
        radioNode={globalRadioNode}
        open={radioNodeDrawerOpen}
        onOpenChange={setRadioNodeDrawerOpen}
        onNavigateToHost={(name) => {
          // Find the parent device for the radio node and navigate to its detail page
          const idx = parseInt(name.replace(/\D/g, ''), 10) || 1
          const device = DEVICES_DATA[Math.min(idx - 1, DEVICES_DATA.length - 1)]
          if (device) handleNavigateToDeviceDetail(device)
        }}
      />
      <NrCellDrawer
        nrCell={globalNrCell}
        open={nrCellDrawerOpen}
        onOpenChange={setNrCellDrawerOpen}
      />
    </TooltipProvider>
    </DeviceLinkProvider>
  )
}

export default App
