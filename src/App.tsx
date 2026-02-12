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

  // Per-user region restrictions
  const currentUserEmail = (() => { try { return (localStorage.getItem('ams-current-user') ?? '').toLowerCase(); } catch { return ''; } })();
  const fixedRegion = currentUserEmail === 'acooper@acme.com' ? 'Pacific Northwest' : undefined;
  const [selectedDevice, setSelectedDevice] = useState<DeviceRow | null>(null)
  const [deviceInitialSection, setDeviceInitialSection] = useState<string | undefined>(undefined)
  const [deviceCreatedTemplate, setDeviceCreatedTemplate] = useState<string | null>(null)
  const [scrollToNotesForDeviceId, setScrollToNotesForDeviceId] = useState<string | null>(null)
  const [scrollToAlarmsForDeviceId, setScrollToAlarmsForDeviceId] = useState<string | null>(null)
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

  const handleNavigateToDeviceDetail = (device: DeviceRow, options?: { openNotes?: boolean; scrollToAlarms?: boolean; initialSection?: string; createdTemplate?: string }) => {
    setSelectedDevice(device)
    setDeviceInitialSection(options?.initialSection)
    setDeviceCreatedTemplate(options?.createdTemplate ?? null)
    setCurrentPage('device-detail')
    if (options?.openNotes) setScrollToNotesForDeviceId(device.id)
    else setScrollToNotesForDeviceId(null)
    if (options?.scrollToAlarms) setScrollToAlarmsForDeviceId(device.id)
    else setScrollToAlarmsForDeviceId(null)
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
    // Reset to light mode for login page
    document.documentElement.classList.remove('dark')
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
          onLogin={async (username) => { try { localStorage.setItem('ams-current-user', username); } catch {} setIsAuthenticated(true); }}
          onLoginWithSSO={async () => { try { localStorage.setItem('ams-current-user', 'sso-user'); } catch {} setIsAuthenticated(true); }}
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
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          region={region}
          regions={regions}
          onRegionChange={(r) => setRegions([r])}
          onRegionsChange={setRegions}
          fixedRegion={fixedRegion}
        />
      ) : currentPage === 'device-detail' && selectedDevice ? (
        <DeviceDetailPage
          device={selectedDevice}
          appName="AMS"
          onSignOut={handleSignOut}
          onBack={handleBackToDevices}
          onNavigate={handleNavigate}
          region={region}
          regions={regions}
          onRegionChange={(r) => setRegions([r])}
          onRegionsChange={setRegions}
          fixedRegion={fixedRegion}
          scrollToAlarms={scrollToAlarmsForDeviceId === selectedDevice.id}
          onScrollToAlarmsDone={() => setScrollToAlarmsForDeviceId(null)}
          scrollToNotes={scrollToNotesForDeviceId === selectedDevice.id}
          onScrollToNotesDone={() => setScrollToNotesForDeviceId(null)}
          initialSection={deviceInitialSection}
          initialCreatedTemplate={deviceCreatedTemplate}
        />
      ) : currentPage === 'tasks' ? (
        <div className="h-screen overflow-hidden">
          <TasksPage
            appName="AMS"
            onSignOut={handleSignOut}
            onNavigate={handleNavigate}
            region={region}
            regions={regions}
            onRegionChange={(r) => setRegions([r])}
            onRegionsChange={setRegions}
            fixedRegion={fixedRegion}
          />
        </div>
      ) : currentPage === 'performance' ? (
        <div className="h-screen overflow-hidden">
          <PerformancePage
            appName="AMS"
            onSignOut={handleSignOut}
            onNavigate={handleNavigate}
            region={region}
            regions={regions}
            onRegionChange={(r) => setRegions([r])}
            onRegionsChange={setRegions}
            fixedRegion={fixedRegion}
          />
        </div>
      ) : currentPage === 'design-system' ? (
        <DesignSystemPage
          appName="AMS"
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          region={region}
          regions={regions}
          onRegionChange={(r) => setRegions([r])}
          onRegionsChange={setRegions}
          fixedRegion={fixedRegion}
        />
      ) : currentPage === 'administration' ? (
        <div className="h-screen overflow-hidden">
          <AdministrationPage
            appName="AMS"
            onSignOut={handleSignOut}
            onNavigate={handleNavigate}
            region={region}
            regions={regions}
            onRegionChange={(r) => setRegions([r])}
            onRegionsChange={setRegions}
            fixedRegion={fixedRegion}
          />
        </div>
      ) : (
        <div className="h-screen overflow-hidden">
          <DevicesPage
            appName="AMS"
            onSignOut={handleSignOut}
            onNavigate={handleNavigate}
            mainTab={devicesTab}
            onMainTabChange={setDevicesTab}
            region={region}
            regions={regions}
            onRegionChange={(r) => setRegions([r])}
            onRegionsChange={setRegions}
            fixedRegion={fixedRegion}
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
