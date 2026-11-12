import React, { useState, useEffect } from 'react';
import { Navigation, ShieldAlert, Compass, Layers, Crosshair, Wifi, WifiOff, Car } from 'lucide-react';
import { LocationPoint, DriverProfile, CountryKey } from '../types';

interface InteractiveMapProps {
  pickup: LocationPoint;
  destination: LocationPoint;
  driver?: DriverProfile;
  isTripActive: boolean;
  tripProgress?: number; // 0 to 1
  isSosActive?: boolean;
  isOfflineMode?: boolean;
  onToggleOffline?: () => void;
  heightClass?: string;
  distanceKm?: number;
  country?: CountryKey;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pickup,
  destination,
  driver,
  isTripActive,
  tripProgress = 0,
  isSosActive = false,
  isOfflineMode = false,
  onToggleOffline,
  heightClass = 'h-72 sm:h-96',
  distanceKm = 8.5,
  country = 'NAMIBIA',
}) => {
  const [mapStyle, setMapStyle] = useState<'street' | 'dark' | 'hybrid'>('dark');
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(38);
  const [driverPosOffset, setDriverPosOffset] = useState({ x: 0, y: 0 });

  // Simulate subtle real-time telemetry updates for driver
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedSpeed(prev => {
        const delta = (Math.random() - 0.48) * 4;
        return Math.max(15, Math.min(65, Math.round(prev + delta)));
      });

      setDriverPosOffset(prev => ({
        x: prev.x + (Math.random() - 0.5) * 1.5,
        y: prev.y + (Math.random() - 0.5) * 1.5,
      }));
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const isNamibia = country === 'NAMIBIA';

  // Dynamic bounding box based on active country
  const minLat = isNamibia ? -22.68 : -15.46;
  const maxLat = isNamibia ? -22.45 : -15.32;
  const minLng = isNamibia ? 17.02 : 28.25;
  const maxLng = isNamibia ? 17.50 : 28.46;

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 880 + 60;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 480 + 60;
    return { x: Math.max(40, Math.min(960, x)), y: Math.max(40, Math.min(560, y)) };
  };

  const pickupCoord = project(pickup.lat, pickup.lng);
  const destCoord = project(destination.lat, destination.lng);

  // Driver current calculated position along route or default
  const driverBaseLat = driver?.currentLat || (pickup.lat - 0.005);
  const driverBaseLng = driver?.currentLng || (pickup.lng - 0.006);
  const driverInitial = project(driverBaseLat, driverBaseLng);

  const currentDriverPos = isTripActive
    ? {
        x: pickupCoord.x + (destCoord.x - pickupCoord.x) * tripProgress + driverPosOffset.x,
        y: pickupCoord.y + (destCoord.y - pickupCoord.y) * tripProgress + driverPosOffset.y,
      }
    : {
        x: driverInitial.x + driverPosOffset.x,
        y: driverInitial.y + driverPosOffset.y,
      };

  // Arterial roads based on country
  const roads = isNamibia
    ? [
        // Sam Nujoma Drive (B6 to Airport)
        { name: 'Sam Nujoma Drive / B6 Highway', d: 'M 160 360 Q 340 280 500 240 T 780 160 L 900 120', major: true },
        // Independence Avenue: Windhoek Central Spine
        { name: 'Independence Avenue', d: 'M 140 500 L 160 360 L 175 220', major: true },
        // Robert Mugabe Avenue
        { name: 'Robert Mugabe Avenue', d: 'M 180 440 L 220 320 L 250 200', major: false },
        // Mandume Ndemufayo Ave (UNAM)
        { name: 'Mandume Ndemufayo Ave', d: 'M 120 540 L 140 450 L 160 360', major: false },
        // Chasie Street (Kleine Kuppe)
        { name: 'Chasie St / Kleine Kuppe', d: 'M 220 480 L 320 490 L 420 510', major: false },
        // Hosea Kutako Airport Expressway
        { name: 'Hosea Kutako Airport Link', d: 'M 740 180 L 860 130 L 920 100', major: true },
      ]
    : [
        // Great East Road: CBD to KKIA
        { name: 'Great East Road (T4)', d: 'M 160 380 Q 320 280 480 260 T 780 180 L 880 140', major: true },
        // Cairo Road: Central Spine
        { name: 'Cairo Road (T2)', d: 'M 150 480 L 160 360 L 175 270', major: true },
        // Independence Avenue
        { name: 'Independence Avenue', d: 'M 160 380 Q 280 410 400 420 L 520 440', major: false },
        // Church Road
        { name: 'Church Road', d: 'M 160 380 L 290 350 L 380 340', major: false },
        // Mosi-o-Tunya Rd (Woodlands)
        { name: 'Mosi-o-Tunya Road', d: 'M 380 340 L 410 450 L 430 520', major: false },
        // Airport Expressway
        { name: 'Airport Expressway', d: 'M 720 190 L 840 120 L 870 90', major: true },
        // Kafue Road (Southbound)
        { name: 'Kafue Road (T2 South)', d: 'M 150 480 L 140 570', major: true },
      ];

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl select-none`}>
      {/* Dynamic Background SVG map */}
      <svg
        className="w-full h-full object-cover transition-colors duration-500"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={mapStyle === 'dark' ? '#1e293b' : '#334155'}
              strokeWidth="0.75"
              strokeOpacity="0.4"
            />
          </pattern>
          <radialGradient id="glow-pickup" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-dest" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Base map fill */}
        <rect
          width="1000"
          height="600"
          fill={mapStyle === 'dark' ? '#090d16' : mapStyle === 'street' ? '#0f172a' : '#020617'}
        />
        <rect width="1000" height="600" fill="url(#grid)" />

        {/* Geographic Zones (Greenery / Reserves / Campus) */}
        {isNamibia ? (
          <>
            <path d="M 50 120 Q 140 100 200 160 L 160 260 Z" fill="#064e3b" fillOpacity="0.15" />
            <path d="M 720 400 Q 820 380 920 460 L 840 560 Z" fill="#064e3b" fillOpacity="0.12" />
          </>
        ) : (
          <>
            <path d="M 280 200 Q 360 170 420 220 L 390 310 Z" fill="#064e3b" fillOpacity="0.15" />
            <path d="M 520 340 Q 640 320 710 400 L 630 480 Z" fill="#064e3b" fillOpacity="0.12" />
          </>
        )}

        {/* Arterial Roads Network */}
        {roads.map((road, idx) => (
          <g key={idx}>
            <path
              d={road.d}
              fill="none"
              stroke={mapStyle === 'dark' ? (road.major ? '#334155' : '#1e293b') : road.major ? '#475569' : '#334155'}
              strokeWidth={road.major ? 6 : 3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {road.major && (
              <path
                d={road.d}
                fill="none"
                stroke={mapStyle === 'dark' ? '#475569' : '#64748b'}
                strokeWidth={2}
                strokeDasharray="8 8"
                strokeOpacity="0.6"
              />
            )}
          </g>
        ))}

        {/* Projected Route Line between Pickup and Destination */}
        <line
          x1={pickupCoord.x}
          y1={pickupCoord.y}
          x2={destCoord.x}
          y2={destCoord.y}
          stroke="url(#route-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={isTripActive ? "none" : "6 6"}
          className={isTripActive ? "filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "opacity-80"}
        />

        {/* Pickup Location Marker */}
        <g transform={`translate(${pickupCoord.x}, ${pickupCoord.y})`}>
          <circle r="22" fill="url(#glow-pickup)" />
          <circle r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
          <text y="-14" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="700" fontFamily="sans-serif">
            {pickup.name}
          </text>
        </g>

        {/* Destination Location Marker */}
        <g transform={`translate(${destCoord.x}, ${destCoord.y})`}>
          <circle r="22" fill="url(#glow-dest)" />
          <circle r="7" fill="#f43f5e" stroke="#ffffff" strokeWidth="2.5" />
          <text y="-14" textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="700" fontFamily="sans-serif">
            {destination.name}
          </text>
        </g>

        {/* Live Driver Partner Vehicle Icon */}
        <g
          transform={`translate(${currentDriverPos.x}, ${currentDriverPos.y})`}
          className="transition-transform duration-700 ease-out filter drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
        >
          <circle r="16" fill="#10b981" fillOpacity="0.25" className="animate-ping" />
          <circle r="12" fill="#047857" stroke="#34d399" strokeWidth="2" />
          {/* Car icon path */}
          <path
            d="M -5 -4 L -3 -7 L 3 -7 L 5 -4 L 6 1 L 5 4 L -5 4 L -6 1 Z"
            fill="#ffffff"
          />
          <circle cx="-3" cy="4" r="1.5" fill="#0f172a" />
          <circle cx="3" cy="4" r="1.5" fill="#0f172a" />
          {driver && (
            <text y="24" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="600" fontFamily="monospace">
              {driver.vehiclePlate} ({simulatedSpeed} km/h)
            </text>
          )}
        </g>
      </svg>

      {/* Top Map Overlays: Country Grid & GPS Telemetry */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white font-mono">
            {isNamibia ? 'Windhoek Grid (Khomas 🇳🇦)' : 'Lusaka Grid (Lusaka Hub 🇿🇲)'}
          </span>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2 font-mono">
            GPS: ±2.4m
          </span>
        </div>

        {isOfflineMode && (
          <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Local Vector GPS Active</span>
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        {onToggleOffline && (
          <button
            type="button"
            onClick={onToggleOffline}
            className={`p-2 rounded-xl border backdrop-blur-md transition shadow-lg ${
              isOfflineMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Toggle Offline Navigation Mode"
          >
            {isOfflineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          </button>
        )}

        <button
          type="button"
          onClick={() => setMapStyle(prev => prev === 'dark' ? 'street' : 'dark')}
          className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white transition shadow-lg"
          title="Toggle Street / Dark Layer"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Trip Distance & Reached Destination Live Overlay */}
      {isTripActive && !isSosActive && (
        <div className="absolute bottom-3 inset-x-3 z-20">
          {tripProgress >= 0.95 ? (
            <div className="bg-emerald-600/95 backdrop-blur-md text-white px-4 py-2 rounded-xl flex items-center justify-between border border-emerald-400 shadow-2xl animate-bounce">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">CAR HAS REACHED DESTINATION</p>
                  <p className="text-[11px] text-emerald-100">Vehicle arrived at {destination.name}. Please disembark safely.</p>
                </div>
              </div>
              <span className="text-xs bg-black/30 px-2.5 py-1 rounded font-mono font-bold">0.0 km</span>
            </div>
          ) : (
            <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl flex items-center justify-between border border-slate-700 shadow-xl">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
                <div>
                  <span className="text-xs font-bold text-slate-200">En Route to {destination.name}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Live Telematics Stream • Progress: {Math.round(tripProgress * 100)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black font-mono text-emerald-400">
                  {Math.max(0.1, +(distanceKm * (1 - tripProgress)).toFixed(1))} km away
                </span>
                <span className="text-[10px] text-slate-400 block">Remaining</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Emergency SOS indicator if active */}
      {isSosActive && (
        <div className="absolute bottom-3 inset-x-3 bg-red-600/95 backdrop-blur-md text-white px-4 py-2.5 rounded-xl flex items-center justify-between border border-red-400 shadow-2xl animate-pulse z-20">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">EMERGENCY SOS BROADCAST ACTIVE</p>
              <p className="text-[11px] text-red-100">
                {isNamibia
                  ? 'Live GPS Coordinates & Driver details broadcasted to Namibian Police (10111) & 2 Trusted Numbers.'
                  : 'Live GPS Coordinates & Driver details broadcasted to Zambia Police (991) & 2 Trusted Numbers.'}
              </p>
            </div>
          </div>
          <span className="text-xs bg-black/40 px-2.5 py-1 rounded font-mono font-bold">
            {isNamibia ? '10111/112' : '991/112'}
          </span>
        </div>
      )}
    </div>
  );
};
