import React, { useState } from 'react';
import {
  Car,
  Power,
  Navigation,
  CheckCircle2,
  XCircle,
  Phone,
  Shield,
  WifiOff,
  AlertTriangle,
  Wallet,
  TrendingUp,
  FileCheck,
  MapPin,
  Clock,
  Compass,
  DollarSign,
  FileText
} from 'lucide-react';
import { DriverProfile, RideRequest, VerificationDocument, CountryKey } from '../types';
import { INITIAL_USER_DOCS, NAMIBIAN_USER_DOCS, ZAMBIAN_USER_DOCS } from '../data/mockData';
import { COUNTRIES } from '../config';
import { RealtimeTripTimer } from './RealtimeTripTimer';

interface DriverViewProps {
  driver: DriverProfile;
  currentRide: RideRequest | null;
  onAcceptIncomingRide: () => void;
  onRejectIncomingRide: () => void;
  onStartRide: () => void;
  onCompleteRide: () => void;
  onToggleOnline: () => void;
  onOpenOfflineNav: () => void;
  onOpenLogs?: () => void;
  onOpenEarningsReport?: () => void;
  onCallClient?: (name: string, phone: string) => void;
  onTriggerSos: () => void;
  isSosActive: boolean;
  allDrivers?: DriverProfile[];
  onSelectDriver?: (driver: DriverProfile) => void;
  country?: CountryKey;
}

export const DriverView: React.FC<DriverViewProps> = ({
  driver,
  currentRide,
  onAcceptIncomingRide,
  onRejectIncomingRide,
  onStartRide,
  onCompleteRide,
  onToggleOnline,
  onOpenOfflineNav,
  onOpenLogs,
  onOpenEarningsReport,
  onCallClient,
  onTriggerSos,
  isSosActive,
  allDrivers,
  onSelectDriver,
  country = 'NAMIBIA',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'console' | 'earnings' | 'documents'>('console');
  const isNamibia = country === 'NAMIBIA' || driver.country === 'NAMIBIA';
  const currencySymbol = isNamibia ? 'NAD' : 'ZMW';

  const userDocs = isNamibia ? NAMIBIAN_USER_DOCS : ZAMBIAN_USER_DOCS;

  return (
    <div className="space-y-4 font-sans">
      {/* Driver Status & Telematics Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500">
              <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover" />
            </div>
            <div
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                driver.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-white">{driver.name}</h3>

              {/* Verified Driver Badge */}
              {driver.isVerified ? (
                <span
                  id="driver-profile-verified-badge"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[11px] font-black tracking-wide shadow-sm"
                  title={isNamibia ? 'Official NATIS & Bukeni Verified Driver Partner' : 'Official RTSA & Bukeni Verified Driver Partner'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Driver</span>
                </span>
              ) : (
                <span
                  id="driver-profile-unverified-badge"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-medium"
                  title="Verification in progress by Bukeni Admin"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verification Pending</span>
                </span>
              )}

              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                {driver.vehiclePlate}
              </span>

              <span className="text-[10px] font-mono text-slate-400">
                {isNamibia ? '🇳🇦 Windhoek' : '🇿🇲 Lusaka'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {driver.vehicleMake} {driver.vehicleModel} • Rating {driver.rating} ★ • {driver.vehicleType}
            </p>
          </div>
        </div>

        {/* Switch Driver (testing helper) & Online / Offline Switch */}
        <div className="flex items-center gap-2">
          {allDrivers && onSelectDriver && allDrivers.length > 1 && (
            <select
              value={driver.id}
              onChange={(e) => {
                const found = allDrivers.find((d) => d.id === e.target.value);
                if (found) onSelectDriver(found);
              }}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-emerald-500"
              title="Select driver profile to preview"
            >
              {allDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.country === 'NAMIBIA' ? '🇳🇦' : '🇿🇲'} • {d.isVerified ? '✓ Verified' : '⏳ Pending'})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={onToggleOnline}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
              driver.isOnline
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{driver.isOnline ? 'ONLINE & DISPATCHABLE' : 'GO ONLINE'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 rounded-xl px-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('console')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeSubTab === 'console'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Dispatch Console
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('earnings')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeSubTab === 'earnings'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Wallet &amp; Tax Deductions
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('documents')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeSubTab === 'documents'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {isNamibia ? 'NATIS Fitness & Identity' : 'RTSA Fitness & Identity'}
        </button>
      </div>

      {/* TAB 1: CONSOLE */}
      {activeSubTab === 'console' && (
        <div className="space-y-4">
          {/* Incoming Dispatch Request Card */}
          {currentRide && (currentRide.status === 'searching' || currentRide.status === 'driver_assigned') && (
            <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    {currentRide.status === 'searching' ? 'New Incoming Ride Request!' : 'Trip Assigned to You'}
                  </h4>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  {currentRide.tier}
                </span>
              </div>

              {/* Ride Route Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Pickup Location</span>
                  <strong className="text-white text-sm block">{currentRide.pickup.name}</strong>
                  <p className="text-[11px] text-slate-400">{currentRide.pickup.address}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Drop-off Destination</span>
                  <strong className="text-white text-sm block">{currentRide.destination.name}</strong>
                  <p className="text-[11px] text-slate-400">{currentRide.destination.address}</p>
                </div>
              </div>

              {/* Financial Split: 90% Driver / 10% Platform */}
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-emerald-400 font-bold block uppercase text-[10px]">
                    Net Driver Payout (90%)
                  </span>
                  <strong className="text-xl font-black text-white font-mono">
                    {currencySymbol} {currentRide.driverPayout90ZMW || Math.round(currentRide.fareZMW * 0.9)}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Passenger Fare</span>
                  <span className="text-white font-mono font-bold">
                    {currencySymbol} {currentRide.fareZMW}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Bukeni 10% Fee: {currencySymbol} {currentRide.platformFee10ZMW || Math.round(currentRide.fareZMW * 0.1)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {currentRide.status === 'searching' && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onRejectIncomingRide}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                  >
                    Decline Request
                  </button>
                  <button
                    type="button"
                    onClick={onAcceptIncomingRide}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25"
                  >
                    Accept Trip (90% Payout)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Ride Control Panel with Real-Time Trip Timer */}
          {currentRide && (currentRide.status === 'driver_assigned' || currentRide.status === 'driver_arriving' || currentRide.status === 'in_trip') && (
            <div className="space-y-4">
              <RealtimeTripTimer
                ride={currentRide}
                role="driver"
                country={country}
                onCallContact={onCallClient ? () => onCallClient(currentRide.passengerName, currentRide.passengerPhone) : undefined}
                onTriggerSos={onTriggerSos}
                onCompleteRide={onCompleteRide}
              />

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenOfflineNav}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                      <span>Offline Turn-by-Turn Map</span>
                    </button>
                    {onOpenEarningsReport && (
                      <button
                        type="button"
                        onClick={onOpenEarningsReport}
                        className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Driver Earnings Report</span>
                      </button>
                    )}
                  </div>

                  {currentRide.status !== 'in_trip' ? (
                    <button
                      type="button"
                      onClick={onStartRide}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20"
                    >
                      Passenger Boarded &rarr; Start Trip
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onCompleteRide}
                      className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20"
                    >
                      Complete Ride &amp; Collect {currencySymbol} {currentRide.fareZMW}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Idle driver state */}
          {(!currentRide || currentRide.status === 'idle') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Compass className="w-7 h-7 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <h4 className="text-base font-bold text-white">
                {driver.isOnline
                  ? `Active on ${isNamibia ? 'Namibian' : 'Zambian'} Road Network`
                  : 'You are currently Offline'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {driver.isOnline
                  ? `Your GPS coordinates are streaming to the dispatch engine in ${isNamibia ? 'Windhoek' : 'Lusaka'}. Ready to receive automated trip dispatches.`
                  : 'Toggle the switch above to go Online and start receiving high-paying trip dispatches.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EARNINGS & TAX DEDUCTIONS */}
      {activeSubTab === 'earnings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Bukeni Driver Wallet</span>
              <h3 className="text-2xl font-black text-white font-mono">
                {currencySymbol} {driver.walletBalanceZMW.toLocaleString()}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onOpenEarningsReport && (
                <button
                  type="button"
                  onClick={onOpenEarningsReport}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Driver Earnings Report</span>
                </button>
              )}
              {onOpenLogs && (
                <button
                  type="button"
                  onClick={onOpenLogs}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold text-xs transition flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ride Logs (90/10)</span>
                </button>
              )}
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                {isNamibia ? 'Withdraw to MTC Money / FNB' : 'Withdraw to MTN / Airtel MoMo'}
              </button>
            </div>
          </div>

          {/* 90/10 Payment Calculation Policy Highlight */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-emerald-300 block text-xs">
                BukeniRide 90/10 Driver Partner Model
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Drivers retain <strong className="text-emerald-400">90% of every ride fare</strong> instantly credited to wallet. BukeniRide retains a minimal <strong>10% platform commission</strong> for dispatch infrastructure &amp; 24/7 emergency dispatch.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Driver: 90%
              </span>
              <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                Platform: 10%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeSubTab === 'documents' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white">
                {isNamibia ? 'NATIS Driving Permit & Police Clearance' : 'RTSA Fitness & Identity Verification'}
              </h4>
              <p className="text-xs text-slate-400">
                Regulatory safety compliance with {isNamibia ? 'Namibia Traffic Information System (NATIS)' : 'Road Transport and Safety Agency (RTSA)'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userDocs.map((doc) => (
              <div key={doc.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-white">{doc.title}</strong>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                  <p>Document No: {doc.documentNumber}</p>
                  <p>Expiry: {doc.expiryDate}</p>
                  <p className="text-slate-500">File: {doc.fileName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
