'use client';

import React, { useMemo, useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { RegionRow } from './regions-table';
import { REGIONS_DATA } from './regions-table';
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

function createDonutIcon(region: RegionRow, large = false): L.DivIcon {
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
    <div style="display:flex;flex-direction:column;align-items:center;gap:0;">
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
    className: 'region-marker border-none bg-transparent',
    iconSize: [size, totalHeight],
    iconAnchor: [size / 2, size / 2],
  });
}

function getRegionCenter(region: string): [number, number] | null {
  const i = NORTH_AMERICAN_REGIONS.indexOf(region as (typeof NORTH_AMERICAN_REGIONS)[number]);
  return i >= 0 ? (REGION_COORDS[i] ?? null) : null;
}

function MapViewUpdater({ region }: { region: string | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (region && region !== 'All') {
      const center = getRegionCenter(region);
      if (center) {
        map.setView(center, 7, { animate: true });
      }
    } else {
      map.setView([39.5, -98], 4, { animate: true });
    }
  }, [map, region]);
  return null;
}

export interface RegionsMapProps {
  region?: string;
  onRegionChange?: (region: string) => void;
}

export function RegionsMap({ region, onRegionChange }: RegionsMapProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const markers = useMemo(() => {
    const list = REGIONS_DATA.map((r, i) => ({
      region: r,
      pos: REGION_COORDS[i] ?? ([40, -100] as [number, number]),
    }));
    if (region && region !== 'All') {
      return list.filter((m) => m.region.region === region);
    }
    return list;
  }, [region]);

  if (!mounted) {
    return (
      <div className="rounded-lg border bg-card overflow-hidden h-[400px] w-full flex items-center justify-center bg-muted/30">
        <span className="text-muted-foreground text-sm">Loading map…</span>
      </div>
    );
  }

  return (
    <div className="relative z-0 isolate rounded-lg border bg-card overflow-hidden h-[400px] w-full">
      <MapContainer
        center={region && region !== 'All' ? (getRegionCenter(region) ?? [39.5, -98]) : [39.5, -98]}
        zoom={region && region !== 'All' ? 7 : 4}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <MapViewUpdater region={region} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ region: r, pos }) => {
          const isZoomed = !!(region && region !== 'All');
          return (
            <Marker
              key={r.region}
              position={pos}
              icon={createDonutIcon(r, isZoomed)}
              eventHandlers={
                !isZoomed && onRegionChange
                  ? { click: () => onRegionChange(r.region) }
                  : undefined
              }
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
