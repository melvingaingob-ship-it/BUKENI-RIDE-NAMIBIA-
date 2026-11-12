import React, { useState } from 'react';
import {
  FileText,
  Clock,
  User,
  Car,
  MapPin,
  CheckCircle2,
  DollarSign,
  Phone,
  Shield,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  X,
  Calendar,
  Layers,
  Sparkles,
  Download
} from 'lucide-react';
import { AuditActivityLog, RideRequest, UserRole } from '../types';

interface RideLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole?: UserRole;
  logs?: AuditActivityLog[];
  rides?: RideRequest[];
  onOpenCall?: (recipientName: string, recipientPhone: string, role: 'driver' | 'passenger') => void;
  onOpenEarningsReport?: () => void;
}

export const RideLogsModal: React.FC<RideLogsModalProps> = ({
  isOpen,
  onClose,
  activeRole = 'passenger',
  logs = [],
  rides = [],
  onOpenCall,
  onOpenEarningsReport,
}) => {
  const [activeTab, setActiveTab] = useState<'rider_logs' | 'driver_logs' | 'system_audit'>(
    activeRole === 'driver' ? 'driver_logs' : activeRole === 'admin' ? 'system_audit' : 'rider_logs'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  if (!isOpen) return null;

  const safeRides = Array.isArray(rides) ? rides : [];
  const safeLogs = Array.isArray(logs) ? logs : [];

  // Filtered ride list with safe access
  const filteredRides = safeRides.filter((r) => {
    if (!r) return false;
    const bookingRef = r.bookingRef || '';
    const pickupName = r.pickup?.name || '';
    const destName = r.destination?.name || '';
    const passName = r.passengerName || '';
    const driverName = r.driver?.name || '';

    const term = (searchTerm || '').toLowerCase();
    return (
      bookingRef.toLowerCase().includes(term) ||
      pickupName.toLowerCase().includes(term) ||
      destName.toLowerCase().includes(term) ||
      passName.toLowerCase().includes(term) ||
      driverName.toLowerCase().includes(term)
    );
  });

  // Filtered audit logs with safe access
  const filteredLogs = safeLogs.filter((log) => {
    if (!log) return false;
    const term = (searchTerm || '').toLowerCase();
    const action = log.action || '';
    const details = log.details || '';
    const rideRef = log.rideRef || '';
    const actorName = log.actorName || '';

    const matchesSearch =
      action.toLowerCase().includes(term) ||
      details.toLowerCase().includes(term) ||
      rideRef.toLowerCase().includes(term) ||
      actorName.toLowerCase().includes(term);
    const matchesCat = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Total financials summary for 10% platform vs 90% driver
  const totalGrossFare = safeRides.reduce((acc, r) => acc + (r?.fareZMW || 0), 0);
  const totalDriver90 = safeRides.reduce((acc, r) => acc + (r?.driverPayout90ZMW || (r?.fareZMW ? r.fareZMW * 0.9 : 0)), 0);
  const totalPlatform10 = safeRides.reduce((acc, r) => acc + (r?.platformFee10ZMW || (r?.fareZMW ? r.fareZMW * 0.1 : 0)), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Ride Activity &amp; Financial Dispatch Logs</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  10% Platform • 90% Driver Share
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Detailed transaction, route audit, and telematics history for Zambia Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenEarningsReport && (
              <button
                type="button"
                onClick={onOpenEarningsReport}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Earnings Report</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 10% / 90% Financial Banner */}
        <div className="grid grid-cols-3 gap-2 px-5 py-3 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Total Gross Bookings</span>
            <strong className="text-white text-sm sm:text-base font-mono">ZMW {totalGrossFare.toLocaleString()}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
            <span className="text-emerald-400 text-[10px] block uppercase font-bold">Driver Earnings (90% Keeps)</span>
            <strong className="text-emerald-300 text-sm sm:text-base font-mono">ZMW {Math.round(totalDriver90).toLocaleString()}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
            <span className="text-cyan-400 text-[10px] block uppercase font-bold">Bukeni Platform Fee (10%)</span>
            <strong className="text-cyan-300 text-sm sm:text-base font-mono">ZMW {Math.round(totalPlatform10).toLocaleString()}</strong>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-4 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('rider_logs')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'rider_logs'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Riders Log Interface</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('driver_logs')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'driver_logs'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Driver Payout &amp; Trips Log (90%)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system_audit')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'system_audit'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Event &amp; Safety Audit</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by ref, passenger, pickup, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>

          {activeTab === 'system_audit' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">All Audit Categories</option>
              <option value="ride_request">Ride Requests</option>
              <option value="driver_acceptance">Driver Acceptances</option>
              <option value="payment_split">Payment Splits (90/10)</option>
              <option value="call_event">Call Events</option>
              <option value="trip_status">Trip Status Changes</option>
              <option value="arrival">Destination Arrivals</option>
            </select>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* TAB 1: RIDER LOGS */}
          {activeTab === 'rider_logs' && (
            <div className="space-y-3">
              {filteredRides.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No ride logs found matching query.
                </div>
              ) : (
                filteredRides.map((ride) => {
                  const fare = ride.fareZMW || 0;
                  const driverCut = ride.driverPayout90ZMW || Math.round(fare * 0.9);
                  const platformCut = ride.platformFee10ZMW || Math.round(fare * 0.1);

                  return (
                    <div
                      key={ride.id}
                      className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-bold text-xs">
                            {ride.bookingRef}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                            {ride.tier}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              ride.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : ride.status === 'in_trip'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : ride.status === 'driver_assigned'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {(ride.status || 'pending').replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[11px] font-mono">{ride.createdAt}</span>
                      </div>

                      {/* Route Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Pickup Point
                          </span>
                          <p className="font-semibold text-white">{ride.pickup?.name || 'Pickup Point'}</p>
                          <p className="text-slate-400 text-[11px]">{ride.pickup?.address || ''}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500" /> Destination Drop-off
                          </span>
                          <p className="font-semibold text-white">{ride.destination?.name || 'Destination'}</p>
                          <p className="text-slate-400 text-[11px]">{ride.destination?.address || ''}</p>
                        </div>
                      </div>

                      {/* Driver & Payout Breakdown */}
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-emerald-500 flex items-center justify-center font-bold text-white text-xs">
                            {ride.driver?.name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <span className="text-white font-bold block">{ride.driver?.name || 'Assigned Driver'}</span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {ride.driver?.vehiclePlate || 'PARTNER-CAR'} • {ride.driver?.vehicleModel || 'Corolla'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Fare Paid</span>
                            <strong className="text-white font-mono text-sm">ZMW {fare}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-400 block uppercase font-bold">Driver Keeps (90%)</span>
                            <span className="text-emerald-300 font-mono font-bold text-xs">ZMW {driverCut}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-cyan-400 block uppercase font-bold">Platform (10%)</span>
                            <span className="text-cyan-300 font-mono font-bold text-xs">ZMW {platformCut}</span>
                          </div>

                          {ride.driver && onOpenCall && (
                            <button
                              type="button"
                              onClick={() => onOpenCall(ride.driver!.name, ride.driver!.phone, 'passenger')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call Driver</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: DRIVER LOGS */}
          {activeTab === 'driver_logs' && (
            <div className="space-y-3">
              {onOpenEarningsReport && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Want an official itemized PDF/CSV earnings ledger for tax and mobile wallet reconciliation?</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenEarningsReport}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1 shadow-sm shrink-0"
                  >
                    <span>View Driver Statement</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {filteredRides.map((ride) => {
                const fare = ride.fareZMW || 0;
                const driverEarnings = ride.driverPayout90ZMW || Math.round(fare * 0.9);
                const platformDeduction = ride.platformFee10ZMW || Math.round(fare * 0.1);

                return (
                  <div
                    key={ride.id}
                    className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-bold">{ride.bookingRef}</span>
                        <span className="text-slate-400">Passenger: <strong className="text-white">{ride.passengerName}</strong></span>
                        <span className="text-slate-500 font-mono text-[11px]">{ride.passengerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {onOpenCall && (
                          <button
                            type="button"
                            onClick={() => onOpenCall(ride.passengerName, ride.passengerPhone, 'driver')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold border border-emerald-500/30 flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call Client</span>
                          </button>
                        )}
                        <span className="font-mono text-slate-500">{ride.createdAt}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Pickup Location</span>
                        <p className="text-white font-semibold">{ride.pickup?.name || 'Pickup'}</p>
                        <p className="text-slate-400 text-[11px]">{ride.pickup?.address || ''}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Destination Location</span>
                        <p className="text-white font-semibold">{ride.destination?.name || 'Dropoff'}</p>
                        <p className="text-slate-400 text-[11px]">{ride.destination?.address || ''}</p>
                      </div>
                    </div>

                    {/* Driver 90% breakdown card */}
                    <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                          Driver Take-Home Net Earnings (90%)
                        </span>
                        <div className="flex items-baseline gap-2">
                          <strong className="text-emerald-300 font-mono text-lg">ZMW {driverEarnings}</strong>
                          <span className="text-slate-400 text-[11px]">deposited to MTN / Airtel MoMo wallet</span>
                        </div>
                      </div>

                      <div className="text-right text-[11px] font-mono">
                        <span className="text-slate-400 block">Gross Ride Total: ZMW {fare}</span>
                        <span className="text-slate-500 block">10% Bukeni Platform Comm: -ZMW {platformDeduction}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: SYSTEM AUDIT LOGS */}
          {activeTab === 'system_audit' && (
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">No audit entries found.</div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          log.category === 'payment_split'
                            ? 'bg-emerald-400'
                            : log.category === 'driver_acceptance'
                            ? 'bg-cyan-400'
                            : log.category === 'call_event'
                            ? 'bg-purple-400'
                            : log.category === 'arrival'
                            ? 'bg-blue-400'
                            : 'bg-slate-400'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{log.action}</span>
                          {log.rideRef && (
                            <span className="font-mono text-emerald-400 text-[11px]">{log.rideRef}</span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {log.actorRole}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {log.driverPayout90ZMW !== undefined && (
                        <span className="text-emerald-400 font-mono font-bold block text-[11px]">
                          +ZMW {log.driverPayout90ZMW} (90%)
                        </span>
                      )}
                      <span className="text-slate-500 font-mono text-[10px] block">{log.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
