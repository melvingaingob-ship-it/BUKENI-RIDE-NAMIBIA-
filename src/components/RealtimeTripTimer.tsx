import React, { useState, useEffect } from 'react';
import {
  Clock,
  Navigation,
  Car,
  DollarSign,
  AlertTriangle,
  Pause,
  Play,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Compass,
  Gauge,
  MapPin,
  Sparkles
} from 'lucide-react';
import { RideRequest, CountryKey } from '../types';

interface RealtimeTripTimerProps {
  ride: RideRequest;
  role: 'driver' | 'passenger' | 'admin';
  country?: CountryKey;
  onCallContact?: () => void;
  onTriggerSos?: () => void;
  onCompleteRide?: () => void;
  compact?: boolean;
}

export const RealtimeTripTimer: React.FC<RealtimeTripTimerProps> = ({
  ride,
  role,
  country = 'NAMIBIA',
  onCallContact,
  onTriggerSos,
  onCompleteRide,
  compact = false,
}) => {
  const isNamibia = country === 'NAMIBIA';
  const currency = isNamibia ? 'NAD' : 'ZMW';

  // Elapsed seconds timer
  const [elapsedSeconds, setElapsedSeconds] = useState(148); // realistic initial offset (2m 28s)
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(44); // km/h
  const [simulatedDistanceKm, setSimulatedDistanceKm] = useState(2.3);
  const [copiedLink, setCopiedLink] = useState(false);

  const totalDistanceKm = ride.distanceKm || 7.5;
  const baseFare = ride.fareZMW ? Math.round(ride.fareZMW * 0.3) : 25;
  const perMinuteRate = isNamibia ? 1.75 : 1.5;
  const perKmRate = isNamibia ? 8.5 : 7.0;

  // Clock tick every 1 second
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        // Dynamically increment simulated distance slightly every 5 seconds
        if (next % 5 === 0) {
          setSimulatedDistanceKm((dist) => +(Math.min(dist + 0.08, totalDistanceKm)).toFixed(2));
          // Vary speed organically between 35 and 62 km/h
          setCurrentSpeed(Math.floor(38 + Math.sin(next / 10) * 16 + (Math.random() * 6 - 3)));
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, totalDistanceKm]);

  // Format MM:SS or HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Live real-time calculated fare
  const elapsedMinutes = elapsedSeconds / 60;
  const calculatedFare = Math.round(
    Math.max(
      ride.fareZMW || 45,
      baseFare + elapsedMinutes * perMinuteRate + simulatedDistanceKm * perKmRate
    )
  );

  const driverTakeHome = Math.round(calculatedFare * 0.9);
  const platformFee = Math.round(calculatedFare * 0.1);

  // Progress percentage
  const progressPercent = Math.min(100, Math.round((simulatedDistanceKm / totalDistanceKm) * 100));

  // Remaining ETA in minutes
  const remainingMinutes = Math.max(1, Math.round(((totalDistanceKm - simulatedDistanceKm) / (currentSpeed || 40)) * 60));

  const handleShareTracking = () => {
    const link = `https://bukeni.${isNamibia ? 'na' : 'zm'}/track/${ride.bookingRef}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (compact) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-3 shadow-xl flex items-center justify-between text-xs text-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold">
            <Clock className="w-4 h-4 animate-spin text-emerald-400" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-sm text-white">{formatTime(elapsedSeconds)}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              ETA: ~{remainingMinutes}m • {currentSpeed} km/h
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-emerald-400 font-bold uppercase block">Live Meter (90/10)</span>
          <strong className="text-white font-mono text-sm">
            {currency} {calculatedFare}
          </strong>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/60 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 text-slate-200">
      {/* Top Banner: Status & Live Beacon */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Car className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                {ride.status === 'in_trip' ? 'Real-Time Trip Meter Active' : 'En Route to Passenger'}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                LIVE GPS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Ref: <strong className="text-emerald-400">{ride.bookingRef}</strong> • Tier: {ride.tier}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={isPaused ? 'Resume trip timer' : 'Pause trip timer'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Paused' : 'Active'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareTracking}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            title="Copy live tracking URL"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Digital Chronometer & Fare Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Timer Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
            <span className="uppercase text-[10px] tracking-wider text-slate-400 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" /> Trip Elapsed
            </span>
            <span className="text-emerald-400 font-mono text-[10px]">Ticking</span>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-white tracking-wider my-1">
            {formatTime(elapsedSeconds)}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Started: {ride.createdAt || 'Just now'}</span>
            <span>{isPaused ? 'Timer Paused' : 'Live Counting'}</span>
          </div>
        </div>

        {/* Live Fare Meter Box */}
        <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-3.5 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
            <span className="uppercase text-[10px] tracking-wider text-emerald-400 font-bold flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Live Dynamic Fare
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              90% Payout
            </span>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-300 my-1">
            {currency} {calculatedFare}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Driver keeps: <strong className="text-emerald-400">{currency} {driverTakeHome}</strong></span>
            <span>Fee: {currency} {platformFee}</span>
          </div>
        </div>

        {/* Telematics / Speed Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
            <span className="uppercase text-[10px] tracking-wider text-cyan-400 font-bold flex items-center gap-1">
              <Gauge className="w-3 h-3" /> Current Velocity
            </span>
            <span className="text-[10px] text-slate-400 font-mono">GPS ±2.1m</span>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-white my-1 flex items-baseline gap-1">
            <span>{currentSpeed}</span>
            <span className="text-xs font-sans text-slate-400 font-bold">km/h</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>ETA to drop-off:</span>
            <strong className="text-cyan-300 font-bold">~{remainingMinutes} minutes</strong>
          </div>
        </div>
      </div>

      {/* Route Distance Progress Bar */}
      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trip Progress</span>
          </div>
          <span className="font-mono text-emerald-400 text-xs font-bold">
            {simulatedDistanceKm} / {totalDistanceKm} km ({progressPercent}%)
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
          <div className="truncate">
            <span className="text-emerald-400 font-bold mr-1">From:</span>
            <span className="text-white">{ride.pickup.name}</span>
          </div>
          <div className="text-right truncate">
            <span className="text-rose-400 font-bold mr-1">To:</span>
            <span className="text-white">{ride.destination.name}</span>
          </div>
        </div>
      </div>

      {/* Safety & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2">
          {onCallContact && (
            <button
              type="button"
              onClick={onCallContact}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1.5 border border-slate-700"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{role === 'driver' ? 'Call Passenger' : 'Call Driver'}</span>
            </button>
          )}

          {onTriggerSos && (
            <button
              type="button"
              onClick={onTriggerSos}
              className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold text-xs transition flex items-center gap-1.5 border border-red-500/40"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Emergency SOS</span>
            </button>
          )}
        </div>

        {role === 'driver' && onCompleteRide && (
          <button
            type="button"
            onClick={onCompleteRide}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20"
          >
            Complete Ride ({currency} {calculatedFare})
          </button>
        )}
      </div>
    </div>
  );
};
