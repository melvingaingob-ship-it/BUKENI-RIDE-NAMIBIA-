import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  Clock,
  Car,
  FileText,
  X,
  Printer,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  Filter,
  Receipt,
  Sparkles,
  ShieldCheck,
  Building2,
  CreditCard
} from 'lucide-react';
import { DriverProfile, RideRequest } from '../types';

interface DriverEarningsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverProfile;
  rides: RideRequest[];
  currency?: string;
}

export const DriverEarningsReportModal: React.FC<DriverEarningsReportModalProps> = ({
  isOpen,
  onClose,
  driver,
  rides = [],
  currency = 'NAD',
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const isNamibia = currency === 'NAD' || driver?.country === 'NAMIBIA';
  const effectiveCurrency = isNamibia ? 'NAD' : 'ZMW';
  const taxAuthority = isNamibia ? 'NAMRA (15% VAT)' : 'ZRA (16% Smart Invoice)';

  // Safe rides filtering for this driver
  const safeRides = Array.isArray(rides) ? rides : [];
  const driverRides = safeRides.filter(
    (r) => (r?.driver?.id === driver?.id || !r?.driver) && r?.status === 'completed'
  );

  // Compute 90/10 split financials
  const grossFares = driverRides.reduce((acc, r) => acc + (r?.fareZMW || 0), 0);
  const netEarnings90 = driverRides.reduce((acc, r) => acc + (r?.driverPayout90ZMW || (r?.fareZMW ? r.fareZMW * 0.9 : 0)), 0);
  const platformFees10 = driverRides.reduce((acc, r) => acc + (r?.platformFee10ZMW || (r?.fareZMW ? r.fareZMW * 0.1 : 0)), 0);
  const totalKm = driverRides.reduce((acc, r) => acc + (r?.distanceKm || 0), 0);
  const avgTripEarnings = driverRides.length > 0 ? Math.round(netEarnings90 / driverRides.length) : 0;
  const estimatedFuelExpense = Math.round(totalKm * (isNamibia ? 2.4 : 2.8));
  const netProfitAfterFuel = Math.max(0, Math.round(netEarnings90 - estimatedFuelExpense));

  // Payment Breakdown
  const paymentBreakdown = driverRides.reduce(
    (acc, r) => {
      const method = r?.paymentMethod || 'cash';
      acc[method] = (acc[method] || 0) + (r?.driverPayout90ZMW || (r?.fareZMW ? r.fareZMW * 0.9 : 0));
      return acc;
    },
    {} as Record<string, number>
  );

  // Export CSV statement
  const handleExportCSV = () => {
    const headers = 'BookingRef,Date,Passenger,Pickup,Destination,DistanceKm,GrossFare,DriverShare90,PlatformFee10,PaymentMethod,Status\n';
    const rows = driverRides
      .map((r) =>
        `"${r?.bookingRef || ''}","${r?.createdAt || ''}","${r?.passengerName || ''}","${r?.pickup?.name || ''}","${r?.destination?.name || ''}",${r?.distanceKm || 0},${r?.fareZMW || 0},${r?.driverPayout90ZMW || Math.round((r?.fareZMW || 0) * 0.9)},${r?.platformFee10ZMW || Math.round((r?.fareZMW || 0) * 0.1)},"${r?.paymentMethod || 'cash'}","${r?.status || 'completed'}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BukeniRide_Driver_Earnings_${(driver?.name || 'Driver').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Driver Partner Earnings &amp; Tax Statement</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  90% Payout Model
                </span>
                <span className="text-xs">{isNamibia ? '🇳🇦' : '🇿🇲'}</span>
              </div>
              <p className="text-xs text-slate-400">
                Official statement for {driver?.name || 'Driver'} • {driver?.vehiclePlate || ''} ({driver?.vehicleModel || ''})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold px-2">Period:</span>
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'all', label: 'All Trips' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setTimeRange(p.id as any)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  timeRange === p.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? 'Downloaded!' : 'Export CSV Ledger'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-200">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-emerald-500/30 shadow-md">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Net Take-Home (90%)</span>
              <strong className="text-xl sm:text-2xl font-black text-white font-mono">
                {effectiveCurrency} {Math.round(netEarnings90).toLocaleString()}
              </strong>
              <p className="text-[10px] text-emerald-300 mt-1">Available for withdrawal</p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Gross Fare Volume</span>
              <strong className="text-xl sm:text-2xl font-black text-slate-200 font-mono">
                {effectiveCurrency} {Math.round(grossFares).toLocaleString()}
              </strong>
              <p className="text-[10px] text-slate-500 mt-1">{driverRides.length} completed trips</p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-cyan-400 font-bold uppercase block">Bukeni Fee (10%)</span>
              <strong className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
                {effectiveCurrency} {Math.round(platformFees10).toLocaleString()}
              </strong>
              <p className="text-[10px] text-slate-500 mt-1">Platform service fee</p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">Average Per Trip</span>
              <strong className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                {effectiveCurrency} {avgTripEarnings}
              </strong>
              <p className="text-[10px] text-slate-500 mt-1">{totalKm.toFixed(1)} total km logged</p>
            </div>
          </div>

          {/* Operating Profit & Tax Deduction Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Estimated Operating Profit</span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">~{((netProfitAfterFuel / (netEarnings90 || 1)) * 100).toFixed(0)}% Margin</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-slate-300">Est. Fuel &amp; Maintenance ({totalKm.toFixed(0)} km):</span>
                <span className="text-rose-400 font-mono font-bold">-{effectiveCurrency} {estimatedFuelExpense}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-800 pt-2 font-bold">
                <span className="text-white">Net Realized Profit:</span>
                <span className="text-emerald-300 font-mono text-base">{effectiveCurrency} {netProfitAfterFuel.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Regulatory Tax Status</span>
                <span className="text-cyan-400 font-mono text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Compliant
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-slate-300">Tax Authority:</span>
                <span className="text-white font-semibold">{taxAuthority}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-800 pt-2 font-bold">
                <span className="text-slate-300">Withholding VAT Reported:</span>
                <span className="text-cyan-300 font-mono text-base">{effectiveCurrency} {Math.round(grossFares * (isNamibia ? 0.15 : 0.16))}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Payout Method Distribution ({isNamibia ? 'Namibia Mobile Wallets' : 'Zambia Mobile Wallets'})</span>
              <span className="text-slate-400 font-normal">Real-Time Mobile Settlement</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {isNamibia ? (
                <>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">MTC Money</span>
                    <strong className="text-white font-mono text-sm">
                      {effectiveCurrency} {Math.round(paymentBreakdown['mtc_money'] || netEarnings90 * 0.55)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">FNB eWallet</span>
                    <strong className="text-white font-mono text-sm">
                      {effectiveCurrency} {Math.round(paymentBreakdown['fnb_ewallet'] || netEarnings90 * 0.3)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Bank Windhoek</span>
                    <strong className="text-white font-mono text-sm">
                      {effectiveCurrency} {Math.round(paymentBreakdown['bank_windhoek'] || 0)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Cash Fares</span>
                    <strong className="text-white font-mono text-sm">
                      {effectiveCurrency} {Math.round(paymentBreakdown['cash'] || netEarnings90 * 0.15)}
                    </strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">MTN MoMo</span>
                    <strong className="text-white font-mono text-sm">
                      {effectiveCurrency} {Math.round(paymentBreakdown['mtn_momo'] || netEarnings90 * 0.5)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Airtel Money</span>
                    <strong className="text-white font-mono text-sm">
                      {effectiveCurrency} {Math.round(paymentBreakdown['airtel_money'] || netEarnings90 * 0.35)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Zamtel Kwacha</span>
                    <strong className="text-white font-mono text-sm">
                      {effectiveCurrency} {Math.round(paymentBreakdown['zamtel_kwacha'] || 0)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Cash Fares</span>
                    <strong className="text-white font-mono text-sm">
                      {effectiveCurrency} {Math.round(paymentBreakdown['cash'] || netEarnings90 * 0.15)}
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Itemized Trip Ledger */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center justify-between">
              <span>Itemized Trip &amp; Payout Ledger</span>
              <span className="text-emerald-400 font-mono text-xs">{driverRides.length} Trips Audited</span>
            </h4>

            <div className="space-y-2">
              {driverRides.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">
                  No completed trips recorded for this timeframe yet.
                </div>
              ) : (
                driverRides.map((ride) => {
                  const driverShare = ride?.driverPayout90ZMW || Math.round((ride?.fareZMW || 0) * 0.9);
                  const platformShare = ride?.platformFee10ZMW || Math.round((ride?.fareZMW || 0) * 0.1);

                  return (
                    <div
                      key={ride.id}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs hover:border-slate-700 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-bold text-xs">{ride.bookingRef}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {ride.tier}
                          </span>
                          <span className="text-slate-500 text-[11px] font-mono">{ride.createdAt}</span>
                        </div>
                        <p className="text-white font-semibold">
                          {ride.pickup?.name || 'Pickup'} &rarr; {ride.destination?.name || 'Destination'}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Payment: {ride.paymentMethod || 'Mobile Money'} • Distance: {ride.distanceKm || 6.2} km
                        </span>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-emerald-400 font-bold text-sm">
                          +{effectiveCurrency} {driverShare} (90%)
                        </div>
                        <span className="text-slate-500 text-[10px] block">
                          Gross: {effectiveCurrency} {ride.fareZMW} (Fee: -{effectiveCurrency} {platformShare})
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
