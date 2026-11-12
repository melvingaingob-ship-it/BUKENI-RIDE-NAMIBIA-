import React, { useState, useEffect } from 'react';
import {
  Navigation2,
  WifiOff,
  Compass,
  Volume2,
  VolumeX,
  X,
  ChevronRight,
  DownloadCloud,
  CheckCircle2,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { OFFLINE_PACKAGES } from '../data/mockData';
import { OfflineRoutePackage, NavigationStep } from '../types';

interface OfflineNavModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStepIndex?: number;
}

export const OfflineNavModal: React.FC<OfflineNavModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<OfflineRoutePackage>(OFFLINE_PACKAGES[0]);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [simulatedMetersRemaining, setSimulatedMetersRemaining] = useState<number>(450);
  const [simulatedKmh, setSimulatedKmh] = useState<number>(44);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSimulatedMetersRemaining((prev) => {
        if (prev <= 40) {
          // Advance step
          setActiveStepIdx((s) => (s + 1) % selectedPackage.steps.length);
          return 600;
        }
        return prev - 25;
      });

      setSimulatedKmh((prev) => {
        const delta = (Math.random() - 0.5) * 6;
        return Math.max(20, Math.min(60, Math.round(prev + delta)));
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, selectedPackage]);

  if (!isOpen) return null;

  const currentStep: NavigationStep = selectedPackage.steps[activeStepIdx] || selectedPackage.steps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* HUD Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Offline Turn-by-Turn GPS Navigator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                  Offline Buffer Ready
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Zero Cellular Data Required • Cached Vector Map</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title={soundEnabled ? 'Voice Guidance On' : 'Voice Guidance Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Turn Direction Big HUD Card */}
        <div className="p-5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800/80">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10 shrink-0">
              {currentStep.action === 'turn_left' && <ArrowLeft className="w-8 h-8" />}
              {currentStep.action === 'turn_right' && <ArrowRight className="w-8 h-8" />}
              {currentStep.action === 'roundabout' && <RotateCcw className="w-8 h-8" />}
              {currentStep.action === 'straight' && <ArrowUpRight className="w-8 h-8" />}
              {currentStep.action === 'arrive' && <CheckCircle2 className="w-8 h-8" />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">{simulatedMetersRemaining}m</span>
                <span className="text-xs text-emerald-400 uppercase font-bold tracking-wider">
                  {currentStep.roadName}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-100 leading-snug">
                {currentStep.instruction}
              </h4>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Speed: <strong className="text-white font-mono">{simulatedKmh} km/h</strong> • Limit: 60 km/h</span>
              </p>
            </div>
          </div>
        </div>

        {/* Corridor Selection & Step Sequence */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-200">
          {/* Corridor selector pills */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Offline Route Corridors (Cached Locally)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OFFLINE_PACKAGES.map((pkg) => (
                <button
                  key={pkg.routeId}
                  type="button"
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setActiveStepIdx(0);
                    setSimulatedMetersRemaining(450);
                  }}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedPackage.routeId === pkg.routeId
                      ? 'bg-emerald-500/10 border-emerald-500/60 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">
                      {pkg.country === 'NAMIBIA' ? '🇳🇦 ' : '🇿🇲 '}
                      {pkg.corridorName}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {(pkg.dataSizeKb / 1024).toFixed(1)} MB Cached • {pkg.steps.length} Route Waypoints
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Full Turn-by-Turn List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Upcoming Navigation Instructions
            </label>
            <div className="space-y-2">
              {selectedPackage.steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveStepIdx(idx)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    idx === activeStepIdx
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-white shadow-md'
                      : idx < activeStepIdx
                      ? 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-[10px] font-mono font-bold flex items-center justify-center text-slate-300">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold">{step.instruction}</p>
                      <p className="text-[10px] text-slate-400">{step.roadName}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 shrink-0">
                    {step.distanceMeters > 0 ? `${step.distanceMeters}m` : 'Destination'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>GPS Satellite Lock Active (8 Satellites)</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
