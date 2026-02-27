'use client';

import { useMemo, useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup as LeafletPopup, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import type { RegionRow } from './regions-table';
import { REGIONS_DATA } from './regions-table';
import type { DeviceRow } from './devices-data-table';
import { Button } from './ui/button';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

/** Approximate [lat, lng] for each region (matches NORTH_AMERICAN_REGIONS order) */
export const REGION_COORDS: [number, number][] = [
  [47.5, -122],    // Pacific Northwest (Seattle)
  [37.8, -122],    // Northern California (SF Bay)
  [34, -118],      // Southern California (LA)
  [33.4, -112],    // Desert Southwest (Phoenix)
  [39.7, -105],    // Mountain West (Denver)
  [39, -99],       // Great Plains (Kansas)
  [31, -99],       // Texas (Austin)
  [29.7, -95],     // Gulf Coast (Houston)
  [33.7, -84.4],   // Southeast (Atlanta)
  [28, -82],       // Florida (Tampa)
  [41.9, -87.6],   // Midwest (Chicago)
  [42.3, -83],     // Great Lakes (Detroit)
  [40.7, -74],     // Northeast (NYC)
  [42.3, -71],     // New England (Boston)
  [39, -77],       // Mid-Atlantic (DC)
  [43.6, -79.4],   // Eastern Canada (Toronto)
];

const DONUT_COLORS = {
  connected: 'rgb(5 150 105)',
  disconnected: 'rgb(239 68 68)',
  inMaintenance: 'rgb(245 158 11)',
  offline: 'rgb(115 115 115)',
} as const;

function createDonutIcon(region: RegionRow, large = false, hoverable = false): L.DivIcon {
  const { totalDevices, connected, disconnected, inMaintenance, offline } = region;
  const size = large ? 200 : 44;
  const stroke = large ? 24 : 6;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const total = totalDevices || 1;
  const connectedAngle = (connected / total) * 360;
  const disconnectedAngle = (disconnected / total) * 360;
  const inMaintenanceAngle = (inMaintenance / total) * 360;
  const offlineAngle = (offline / total) * 360;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (startAngle: number, endAngle: number) => {
    const start = startAngle - 90;
    const end = endAngle - 90;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const segments: { angle: number; color: string; label: string; count: number }[] = [
    { angle: connectedAngle, color: DONUT_COLORS.connected, label: 'Connected', count: connected },
    { angle: disconnectedAngle, color: DONUT_COLORS.disconnected, label: 'Disconnected', count: disconnected },
    { angle: inMaintenanceAngle, color: DONUT_COLORS.inMaintenance, label: 'In maintenance', count: inMaintenance },
    { angle: offlineAngle, color: DONUT_COLORS.offline, label: 'Offline', count: offline },
  ];

  let angle = 0;
  const paths = segments
    .filter((s) => s.angle > 0)
    .map((s) => {
      const title = `<title>${s.label}: ${s.count}</title>`;
      const hitStroke = large ? 48 : 16;
      const path = `<g>${title}<path d="${arcPath(angle, angle + s.angle)}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-linecap="round" style="cursor:pointer"/><path d="${arcPath(angle, angle + s.angle)}" fill="none" stroke="transparent" stroke-width="${hitStroke}" stroke-linecap="round" style="cursor:pointer"/></g>`;
      angle += s.angle;
      return path;
    })
    .join('');

  const labelHeight = large ? 40 : 0;
  const totalHeight = size + labelHeight;

  const html = `
    <div class="region-pin-shell" style="display:flex;flex-direction:column;align-items:center;gap:0;">
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:white;border:2px solid rgb(229 231 235);box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);display:flex;align-items:center;justify-content:center;position:relative;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="position:absolute;">
          ${paths}
        </svg>
        <span style="position:absolute;font-size:${large ? 36 : 10}px;font-weight:600;color:rgb(23 23 23);">${totalDevices}</span>
      </div>
      ${large ? `<span style="font-size:22px;font-weight:700;color:rgb(15 23 42);text-align:center;margin-top:6px;letter-spacing:0.02em;text-shadow:0 1px 2px rgba(255,255,255,0.9);line-height:1.2;">${region.region}</span>` : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: `region-marker border-none bg-transparent ${hoverable ? 'region-pin-hover' : ''}`,
    iconSize: [size, totalHeight],
    iconAnchor: [size / 2, size / 2],
  });
}

function getRegionCenter(region: string): [number, number] | null {
  const i = NORTH_AMERICAN_REGIONS.indexOf(region as (typeof NORTH_AMERICAN_REGIONS)[number]);
  return i >= 0 ? (REGION_COORDS[i] ?? null) : null;
}

const DEVICE_STATUS_COLORS: Record<string, string> = {
  Connected: 'rgb(5 150 105)',
  Disconnected: 'rgb(239 68 68)',
  'In maintenance': 'rgb(245 158 11)',
  Offline: 'rgb(115 115 115)',
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDevicePosition(device: DeviceRow, spreadScale = 1): [number, number] {
  const center = getRegionCenter(device.region) ?? [39.5, -98];
  const h1 = hashString(`${device.id}-${device.device}`);
  const h2 = hashString(`${device.device}-${device.id}`);
  const angle = ((h1 % 360) * Math.PI) / 180;
  const radius = (0.08 + ((h2 % 70) / 100)) * spreadScale; // scaled spread around region center
  return [
    center[0] + Math.sin(angle) * radius,
    center[1] + Math.cos(angle) * radius,
  ];
}

function createDeviceIcon(device: DeviceRow, large = false): L.DivIcon {
  const color = DEVICE_STATUS_COLORS[device.status] ?? 'rgb(100 116 139)';
  const size = large ? 22 : 10;
  const border = large ? 4 : 2;
  const anchor = size / 2;
  return L.divIcon({
    html: `<div class="device-pin-shell" title="${device.device} (${device.status})" style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:${border}px solid white;box-shadow:0 2px 8px rgb(0 0 0 / 0.45);"></div>`,
    className: 'device-marker device-pin-hover border-none bg-transparent',
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });
}

function MapViewUpdater({ region, regions, singleRegionZoom }: { region: string | undefined; regions?: string[]; singleRegionZoom: number }) {
  const map = useMap();
  useEffect(() => {
    // Check if multiple regions are selected
    const isAll = !regions || regions.length === 0 || regions.includes('All');
    const activeRegions = isAll ? [] : regions;
    
    if (activeRegions.length === 1) {
      // Single region selected - zoom to it
      const center = getRegionCenter(activeRegions[0]);
      if (center) {
        map.setView(center, singleRegionZoom, { animate: true });
      }
    } else if (activeRegions.length > 1) {
      // Multiple regions - fit bounds to show all
      const bounds: [number, number][] = activeRegions
        .map((r) => getRegionCenter(r))
        .filter((c): c is [number, number] => c !== null);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
      }
    } else if (region && region !== 'All') {
      // Fallback to single region prop
      const center = getRegionCenter(region);
      if (center) {
        map.setView(center, singleRegionZoom, { animate: true });
      }
    } else {
      // Show all
      map.setView([39.5, -98], 4, { animate: true });
    }
  }, [map, region, regions, singleRegionZoom]);
  return null;
}

function FocusedDeviceUpdater({ focusedDevice }: { focusedDevice?: DeviceRow | null }) {
  const map = useMap();
  useEffect(() => {
    if (!focusedDevice) return;
    const pos = getDevicePosition(focusedDevice);
    map.setView(pos, 10, { animate: true });
  }, [map, focusedDevice]);
  return null;
}

export interface RegionsMapProps {
  region?: string;
  regions?: string[];
  onRegionChange?: (region: string) => void;
  data?: RegionRow[];
  devices?: DeviceRow[];
  focusedDeviceId?: string | null;
  disableRegionClick?: boolean;
  regionTooltipData?: Record<string, { active: number; disconnected: number; critical: number; major: number }>;
  onShowRegionDevices?: (region: string) => void;
  regionInfoOnClick?: boolean;
  regionPinHoverState?: boolean;
  singleRegionZoom?: number;
  onDevicePinClick?: (device: DeviceRow) => void;
  heightClassName?: string;
  devicePinSpreadScale?: number;
}

export function RegionsMap({
  region,
  regions,
  onRegionChange,
  data,
  devices,
  focusedDeviceId,
  disableRegionClick = false,
  regionTooltipData,
  onShowRegionDevices,
  regionInfoOnClick = false,
  regionPinHoverState = false,
  singleRegionZoom = 7,
  onDevicePinClick,
  heightClassName = 'h-[400px]',
  devicePinSpreadScale = 1,
}: RegionsMapProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAll = !regions || regions.length === 0 || regions.includes('All');
  const activeRegions = isAll ? [] : regions;
  const isSingleRegionSelected = activeRegions.length === 1 || (!!region && region !== 'All' && activeRegions.length === 0);

  const markers = useMemo(() => {
    const sourceData = data ?? REGIONS_DATA;
    const list = sourceData.map((r) => ({
      region: r,
      pos: getRegionCenter(r.region) ?? ([40, -100] as [number, number]),
    }));
    
    // Check if multiple regions are selected
    const isAll = !regions || regions.length === 0 || regions.includes('All');
    
    if (!isAll && regions && regions.length > 0) {
      return list.filter((m) => regions.includes(m.region.region));
    }
    
    // Fallback to single region prop
    if (region && region !== 'All') {
      return list.filter((m) => m.region.region === region);
    }
    return list;
  }, [region, regions, data]);

  const deviceMarkers = useMemo(() => {
    if (!devices || !isSingleRegionSelected) return [];
    return devices
      .filter((d) => {
        if (activeRegions.length === 1) return d.region === activeRegions[0];
        if (region && region !== 'All') return d.region === region;
        return true;
      })
      .map((d) => ({
        key: d.id,
        pos: getDevicePosition(d, devicePinSpreadScale),
        device: d,
      }));
  }, [devices, isSingleRegionSelected, activeRegions, region, devicePinSpreadScale]);

  const focusedDevice = useMemo(
    () => devices?.find((d) => d.id === focusedDeviceId) ?? null,
    [devices, focusedDeviceId],
  );
  const focusedDeviceMarker = useMemo(
    () => (focusedDevice ? { key: focusedDevice.id, pos: getDevicePosition(focusedDevice, devicePinSpreadScale), device: focusedDevice } : null),
    [focusedDevice, devicePinSpreadScale],
  );

  if (!mounted) {
    return (
      <div className={`rounded-lg border bg-card overflow-hidden w-full flex items-center justify-center bg-muted/30 ${heightClassName}`}>
        <span className="text-muted-foreground text-sm">Loading map…</span>
      </div>
    );
  }

  // Determine initial center and zoom based on regions
  const initialCenter = activeRegions.length === 1 
    ? (getRegionCenter(activeRegions[0]) ?? [39.5, -98]) 
    : (region && region !== 'All' ? (getRegionCenter(region) ?? [39.5, -98]) : [39.5, -98]);
  const initialZoom = activeRegions.length === 1 ? singleRegionZoom : (region && region !== 'All' ? singleRegionZoom : 4);
  const tileUrl = isSingleRegionSelected
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = isSingleRegionSelected
    ? '&copy; OpenStreetMap contributors &copy; CARTO'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <div className={`relative z-0 isolate rounded-lg border bg-card overflow-hidden w-full ${heightClassName}`}>
      <MapContainer
        center={initialCenter as [number, number]}
        zoom={initialZoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <MapViewUpdater region={region} regions={regions} singleRegionZoom={singleRegionZoom} />
        <FocusedDeviceUpdater focusedDevice={focusedDevice} />
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
        />
        {focusedDeviceMarker ? (
          <Marker
            key={focusedDeviceMarker.key}
            position={focusedDeviceMarker.pos}
            icon={createDeviceIcon(focusedDeviceMarker.device, true)}
            eventHandlers={onDevicePinClick ? { click: () => onDevicePinClick(focusedDeviceMarker.device) } : undefined}
          >
            <LeafletTooltip direction="top" offset={[0, -10]} opacity={1} sticky interactive>
              <div className="min-w-[200px] text-xs text-slate-900 space-y-1">
                <div className="font-semibold">{focusedDeviceMarker.device.device}</div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-700">Name</span>
                  <span className="font-medium">{focusedDeviceMarker.device.device}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-700">Type</span>
                  <span className="font-medium">{focusedDeviceMarker.device.type}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-700">Status</span>
                  <span className="font-medium">{focusedDeviceMarker.device.status}</span>
                </div>
                <div className="pt-1 border-t border-slate-200">
                  <div className="text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Alarms</div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-700">Critical</span>
                    <span className="font-semibold tabular-nums">
                      {focusedDeviceMarker.device.alarmType === 'Critical' ? focusedDeviceMarker.device.alarms : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-700">Major</span>
                    <span className="font-semibold tabular-nums">
                      {focusedDeviceMarker.device.alarmType === 'Major' ? focusedDeviceMarker.device.alarms : 0}
                    </span>
                  </div>
                </div>
              </div>
            </LeafletTooltip>
          </Marker>
        ) : isSingleRegionSelected ? (
          deviceMarkers.map(({ key, pos, device }) => (
            <Marker
              key={key}
              position={pos}
              icon={createDeviceIcon(device)}
              eventHandlers={onDevicePinClick ? { click: () => onDevicePinClick(device) } : undefined}
            >
              <LeafletTooltip direction="top" offset={[0, -8]} opacity={1} sticky interactive>
                <div className="min-w-[200px] text-xs text-slate-900 space-y-1">
                  <div className="font-semibold">{device.device}</div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-700">Name</span>
                    <span className="font-medium">{device.device}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-700">Type</span>
                    <span className="font-medium">{device.type}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-700">Status</span>
                    <span className="font-medium">{device.status}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <div className="text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Alarms</div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-700">Critical</span>
                      <span className="font-semibold tabular-nums">{device.alarmType === 'Critical' ? device.alarms : 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-700">Major</span>
                      <span className="font-semibold tabular-nums">{device.alarmType === 'Major' ? device.alarms : 0}</span>
                    </div>
                  </div>
                </div>
              </LeafletTooltip>
            </Marker>
          ))
        ) : (
          markers.map(({ region: r, pos }) => {
            const isZoomed = isSingleRegionSelected;
            const regionInfoContent = (
              <div className="min-w-[210px] text-xs text-slate-900">
                <div className="font-semibold text-slate-900 mb-2">{r.region}</div>
                <div className="space-y-2">
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <div className="text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Device status</div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-800">Active</span>
                      <span className="font-semibold tabular-nums text-slate-900">{regionTooltipData?.[r.region]?.active ?? r.connected}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-800">Disconnected</span>
                      <span className="font-semibold tabular-nums text-slate-900">{regionTooltipData?.[r.region]?.disconnected ?? r.disconnected}</span>
                    </div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <div className="text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Alarms</div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-800">Critical</span>
                      <span className="font-semibold tabular-nums text-slate-900">{regionTooltipData?.[r.region]?.critical ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-800">Major</span>
                      <span className="font-semibold tabular-nums text-slate-900">{regionTooltipData?.[r.region]?.major ?? 0}</span>
                    </div>
                  </div>
                  {onShowRegionDevices && (
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onShowRegionDevices(r.region);
                      }}
                    >
                      Show devices
                    </Button>
                  )}
                </div>
              </div>
            );
            return (
              <Marker
                key={r.region}
                position={pos}
                icon={createDonutIcon(r, isZoomed, regionPinHoverState)}
                eventHandlers={
                  !isZoomed && onRegionChange && !disableRegionClick
                    ? { click: () => onRegionChange(r.region) }
                    : undefined
                }
              >
                {regionInfoOnClick ? (
                  <LeafletPopup closeButton>
                    {regionInfoContent}
                  </LeafletPopup>
                ) : (
                  <LeafletTooltip direction="top" offset={[0, -8]} opacity={1} sticky>
                    {regionInfoContent}
                  </LeafletTooltip>
                )}
              </Marker>
            );
          })
        )}
      </MapContainer>
      <style>{`
        .leaflet-marker-icon.region-pin-hover .region-pin-shell {
          transition: transform 140ms ease, filter 140ms ease;
        }
        .leaflet-marker-icon.region-pin-hover:hover .region-pin-shell {
          transform: scale(1.08);
          filter: brightness(1.03) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.28));
        }
        .leaflet-marker-icon.device-pin-hover .device-pin-shell {
          transition: transform 120ms ease, filter 120ms ease;
        }
        .leaflet-marker-icon.device-pin-hover:hover .device-pin-shell {
          transform: scale(1.22);
          filter: brightness(1.06) drop-shadow(0 5px 12px rgba(0, 0, 0, 0.35));
        }
      `}</style>
    </div>
  );
}
