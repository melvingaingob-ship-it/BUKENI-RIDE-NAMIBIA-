import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  ShieldCheck,
  AlertCircle,
  Code2,
  Lock,
  Receipt,
  FileCheck2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Globe2
} from 'lucide-react';
import {
  DisputeTicket,
  DriverProfile,
  Logistics3PLShipment,
  RideRequest,
  UserRole,
  CountryKey
} from '../types';
import { INITIAL_DRIVERS } from '../data/mockData';

interface AdminDashboardProps {
  currentRide: RideRequest | null;
  drivers: DriverProfile[];
  userRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenLogs?: () => void;
  onOpenEarningsReport?: () => void;
  onToggleVerifyDriver?: (driverId: string) => void;
  country?: CountryKey;
  onOpenMultiCountryTester?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentRide,
  drivers,
  userRole,
  onSelectRole,
  onOpenLogs,
  onOpenEarningsReport,
  onToggleVerifyDriver,
  country = 'NAMIBIA',
  onOpenMultiCountryTester,
}) => {
  const [adminTab, setAdminTab] = useState<
    'analytics' | 'driver_verification' | 'disputes' | 'safety_sentiment' | 'tax_reporting' | 'logistics_api' | 'rbac'
  >('analytics');

  const [copiedKey, setCopiedKey] = useState(false);
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [driverFilterStatus, setDriverFilterStatus] = useState<'all' | 'verified' | 'unverified'>('all');
  const [countryFilter, setCountryFilter] = useState<'all' | 'NAMIBIA' | 'ZAMBIA'>('all');

  // Sample Disputes State
  const [disputes, setDisputes] = useState<DisputeTicket[]>([
    {
      id: 'DISP-892',
      rideRef: 'BK-410291',
      passengerName: 'Mutale Chilufya',
      driverName: 'Mwamba Musonda',
      issueCategory: 'Fare Discrepancy',
      description: 'Route taken diverted past Church Road traffic flyover causing 2.4 km higher fare.',
      status: 'open',
      priority: 'medium',
      createdAt: '25 mins ago',
      refundAmountZMW: 25,
    },
    {
      id: 'DISP-893',
      rideRef: 'BK-582109',
      passengerName: 'Nchimunya Mweemba',
      driverName: 'Kelvin Tembo',
      issueCategory: 'Route Deviation',
      description: 'Driver picked a longer detour towards Chilenje South during peak hour.',
      status: 'investigating',
      priority: 'low',
      createdAt: '2 hours ago',
    },
    {
      id: 'DISP-890',
      rideRef: 'BK-339102',
      passengerName: 'Bupe Lungu',
      driverName: 'Kondwani Banda',
      issueCategory: 'Lost Item',
      description: 'Left brown leather wallet on rear passenger seat. Contacted driver.',
      status: 'resolved',
      priority: 'high',
      createdAt: 'Yesterday',
      resolution: 'Driver handed wallet to Bukeni Security Desk at East Park Mall.',
    },
  ]);

  // 3PL Logistics API Sandbox State
  const [apiKey, setApiKey] = useState('bk_live_zm_7f8a920b41c0993e');
  const [serviceType, setServiceType] = useState('Express Moto');
  const [pickupAddr, setPickupAddr] = useState('Levy Junction Mall, Lusaka');
  const [dropAddr, setDropAddr] = useState('East Park Mall, Great East Rd');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Resolve Dispute handler
  const handleResolveDispute = (id: string) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'resolved',
              resolution: `Refund of ZMW ${d.refundAmountZMW || 20} credited to passenger MTN MoMo wallet.`,
            }
          : d
      )
    );
  };

  // Test 3PL Logistics Dispatch API
  const handleTest3PLDispatch = async () => {
    setIsApiLoading(true);
    try {
      const res = await fetch('/api/v1/logistics/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          serviceType,
          pickupAddress: pickupAddr,
          deliveryAddress: dropAddr,
          packageDetails: { weightKg: 3.5, fragile: true },
        }),
      });
      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      console.warn('API error:', err);
    } finally {
      setIsApiLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-200">
      {/* Top Bar with Role Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            BukeniRide Operations &amp; Admin Command Center
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono">
              Lusaka Hub v3.4
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time fleet control, dispute management, ZRA tax reporting &amp; 3PL logistics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenMultiCountryTester && (
            <button
              type="button"
              onClick={onOpenMultiCountryTester}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition shadow-sm"
              title="Open Multi-Country Testing Console"
            >
              <Globe2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Multi-Country config.js</span>
            </button>
          )}

          {onOpenLogs && (
            <button
              type="button"
              onClick={onOpenLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Full Ride &amp; Financial Logs (90/10)</span>
            </button>
          )}

          {onOpenEarningsReport && (
            <button
              type="button"
              onClick={onOpenEarningsReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition"
              title="Open Driver Earnings & Payout Report"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Driver Earnings Report</span>
            </button>
          )}

          {/* Role-Based Access Control Switcher */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Acting Role:</span>
            <select
              value={userRole}
              onChange={(e) => onSelectRole(e.target.value as UserRole)}
              className="bg-transparent text-emerald-400 font-bold outline-none cursor-pointer"
            >
              <option value="passenger">Passenger / Rider</option>
              <option value="driver">Driver Partner</option>
              <option value="admin">Fleet Admin (Full Access)</option>
              <option value="safety_officer">Safety &amp; Compliance Officer</option>
              <option value="logistics_partner">3PL Logistics Partner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/70 rounded-xl px-2 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'analytics', label: 'Fleet & Metrics', icon: BarChart3 },
          {
            id: 'driver_verification',
            label: `Driver Profiles & Verification (${drivers.filter((d) => d.isVerified).length}/${drivers.length} Verified)`,
            icon: ShieldCheck,
          },
          { id: 'disputes', label: `Disputes & Tickets (${disputes.filter((d) => d.status !== 'resolved').length})`, icon: AlertCircle },
          { id: 'safety_sentiment', label: 'AI Review & Safety Sentinel', icon: Sparkles },
          { id: 'tax_reporting', label: 'ZRA Tax Compliance (16% VAT)', icon: Receipt },
          { id: 'logistics_api', label: 'Modular 3PL Logistics API', icon: Code2 },
          { id: 'rbac', label: 'RBAC Team Permissions', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition ${
                adminTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FLEET & METRICS */}
      {adminTab === 'analytics' && (
        <div className="space-y-4">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Gross Platform Revenue</span>
              <strong className="text-2xl font-black text-white font-mono">ZMW 148,920</strong>
              <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.2% vs last week
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Fleet in Zambia</span>
              <strong className="text-2xl font-black text-emerald-400 font-mono">842 Drivers</strong>
              <p className="text-[11px] text-slate-400 mt-1">98.4% GPS Signal Latency &lt; 40ms</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Avg Pickup ETA</span>
              <strong className="text-2xl font-black text-cyan-400 font-mono">3.8 mins</strong>
              <p className="text-[11px] text-slate-400 mt-1">Lusaka CBD &amp; East Park</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Passenger Satisfaction</span>
              <strong className="text-2xl font-black text-amber-400 font-mono">4.94 ★</strong>
              <p className="text-[11px] text-slate-400 mt-1">96.8% 5-Star Trips</p>
            </div>
          </div>

          {/* DRIVER VERIFICATION UI SECTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Driver Profiles &amp; Verification Management</h4>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Toggle verified accreditation on driver partner profiles to display the Verified badge in driver &amp; passenger portals
                </p>
              </div>

              {/* Status Counters & Country Filter Bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Country Filter */}
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none font-bold"
                >
                  <option value="all">🌍 All Countries (Namibia &amp; Zambia)</option>
                  <option value="NAMIBIA">🇳🇦 Namibia Fleet</option>
                  <option value="ZAMBIA">🇿🇲 Zambia Fleet</option>
                </select>

                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {drivers.filter((d) => d.isVerified && (countryFilter === 'all' || d.country === countryFilter)).length} Verified
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {drivers.filter((d) => !d.isVerified && (countryFilter === 'all' || d.country === countryFilter)).length} Pending
                </span>
              </div>
            </div>

            {/* Driver Profile Cards with Verification Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {drivers
                .filter((d) => countryFilter === 'all' || d.country === countryFilter)
                .map((d) => (
                <div
                  key={d.id}
                  className={`p-4 rounded-xl border transition ${
                    d.isVerified
                      ? 'bg-slate-950/80 border-emerald-500/40 hover:border-emerald-500/70'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={d.photoUrl}
                          alt={d.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                            d.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-white">{d.name}</strong>
                          <span className="text-xs">{d.country === 'NAMIBIA' ? '🇳🇦' : '🇿🇲'}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                            {d.vehiclePlate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {d.vehicleMake} {d.vehicleModel} ({d.vehicleYear}) • {d.vehicleType}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {d.country === 'NAMIBIA' ? `ID: ${d.nrcNumber}` : `NRC: ${d.nrcNumber}`} • Rating {d.rating} ★ ({d.totalTrips} trips)
                        </p>
                      </div>
                    </div>

                    {/* Verification Status Badge */}
                    <div>
                      {d.isVerified ? (
                        <span
                          id={`badge-status-verified-${d.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black tracking-wide"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span
                          id={`badge-status-pending-${d.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-medium"
                        >
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Verification Toggle Action Row */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400">
                      RTSA Fitness: <span className="font-mono text-slate-300">{d.rtsaFitnessExpiry}</span>
                    </div>

                    <button
                      id={`toggle-driver-verify-${d.id}`}
                      type="button"
                      onClick={() => onToggleVerifyDriver && onToggleVerifyDriver(d.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                        d.isVerified
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black shadow-emerald-500/20'
                      }`}
                      title={d.isVerified ? 'Click to revoke verification status' : 'Click to approve & grant Verified Driver badge'}
                    >
                      {d.isVerified ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Revoke Verified</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify Driver Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Drivers Telematics Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Zambian Driver Fleet Telematics &amp; Accreditation
              </h4>
              <span className="text-xs text-slate-400">
                {drivers.filter((d) => d.isVerified).length} of {drivers.length} Drivers Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2.5">Driver &amp; Photo</th>
                    <th className="px-3 py-2.5">Zambian Plate</th>
                    <th className="px-3 py-2.5">Tier &amp; Vehicle</th>
                    <th className="px-3 py-2.5">Rating</th>
                    <th className="px-3 py-2.5">Verified Status</th>
                    <th className="px-3 py-2.5">Speed / GPS</th>
                    <th className="px-3 py-2.5 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {drivers.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-3 py-2.5 flex items-center gap-2.5">
                        <img src={d.photoUrl} alt={d.name} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <strong className="text-white block">{d.name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{d.phone}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-emerald-400 font-bold">{d.vehiclePlate}</td>
                      <td className="px-3 py-2.5 text-slate-300">
                        {d.vehicleType} ({d.vehicleMake} {d.vehicleModel})
                      </td>
                      <td className="px-3 py-2.5 text-amber-400 font-bold">{d.rating} ★</td>
                      <td className="px-3 py-2.5">
                        {d.isVerified ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-medium border border-amber-500/30 inline-flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-amber-400" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-cyan-400">{d.speedKmh} km/h (±2m)</td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => onToggleVerifyDriver && onToggleVerifyDriver(d.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 ${
                            d.isVerified
                              ? 'bg-slate-800 text-rose-300 hover:bg-rose-500/20'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                          }`}
                        >
                          {d.isVerified ? 'Revoke' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DRIVER PROFILES & VERIFICATION PORTAL */}
      {adminTab === 'driver_verification' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Driver Accreditation &amp; Verification Center</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Administer and toggle official 'Verified' status for BukeniRide driver partners. Verified drivers receive the trusted badge across driver profiles and passenger views.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Drivers</span>
                <strong className="text-sm font-mono text-white">{drivers.length}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Verified</span>
                <strong className="text-sm font-mono text-emerald-300">
                  {drivers.filter((d) => d.isVerified).length}
                </strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">Pending</span>
                <strong className="text-sm font-mono text-amber-300">
                  {drivers.filter((d) => !d.isVerified).length}
                </strong>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={driverSearchQuery}
                onChange={(e) => setDriverSearchQuery(e.target.value)}
                placeholder="Search driver by name, phone, plate, or vehicle..."
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDriverFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  driverFilterStatus === 'all'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({drivers.length})
              </button>
              <button
                type="button"
                onClick={() => setDriverFilterStatus('verified')}
                className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 ${
                  driverFilterStatus === 'verified'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified ({drivers.filter((d) => d.isVerified).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setDriverFilterStatus('unverified')}
                className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 ${
                  driverFilterStatus === 'unverified'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Pending ({drivers.filter((d) => !d.isVerified).length})</span>
              </button>
            </div>
          </div>

          {/* Detailed Driver Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {drivers
              .filter((d) => {
                const q = driverSearchQuery.toLowerCase();
                const matches =
                  d.name.toLowerCase().includes(q) ||
                  d.phone.toLowerCase().includes(q) ||
                  d.vehiclePlate.toLowerCase().includes(q) ||
                  d.vehicleMake.toLowerCase().includes(q) ||
                  d.vehicleModel.toLowerCase().includes(q);
                if (!matches) return false;
                if (countryFilter !== 'all' && d.country !== countryFilter) return false;
                if (driverFilterStatus === 'verified') return d.isVerified;
                if (driverFilterStatus === 'unverified') return !d.isVerified;
                return true;
              })
              .map((d) => (
                <div
                  key={d.id}
                  className={`p-5 rounded-2xl border transition shadow-lg space-y-4 ${
                    d.isVerified
                      ? 'bg-slate-950 border-emerald-500/40 hover:border-emerald-500/70'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={d.photoUrl}
                          alt={d.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-slate-700"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                            d.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{d.name}</h4>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                            {d.vehiclePlate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {d.vehicleMake} {d.vehicleModel} ({d.vehicleYear}) • {d.vehicleColor}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{d.phone}</p>
                      </div>
                    </div>

                    {/* Verification Status Badge */}
                    <div>
                      {d.isVerified ? (
                        <span
                          id={`portal-badge-verified-${d.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-black tracking-wide shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verified Driver</span>
                        </span>
                      ) : (
                        <span
                          id={`portal-badge-unverified-${d.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-medium"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pending Verification</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vetting Credentials Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">NRC Identity No.</span>
                      <strong className="text-slate-300 font-mono">{d.nrcNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Driver's License</span>
                      <strong className="text-slate-300 font-mono">{d.licenseNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">RTSA Fitness Valid Until</span>
                      <strong className="text-emerald-400 font-mono">{d.rtsaFitnessExpiry}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Interpol &amp; Police Check</span>
                      <strong className="text-emerald-400 flex items-center gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" /> Clear / No Record
                      </strong>
                    </div>
                  </div>

                  {/* Toggle Verification Control */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="text-xs text-slate-400">
                      Tier: <strong className="text-white">{d.vehicleType}</strong> • Rating: <strong className="text-amber-400">{d.rating} ★</strong>
                    </div>

                    <button
                      id={`portal-toggle-verify-${d.id}`}
                      type="button"
                      onClick={() => onToggleVerifyDriver && onToggleVerifyDriver(d.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shadow-md ${
                        d.isVerified
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 border-emerald-500 font-black shadow-emerald-500/20'
                      }`}
                      title={d.isVerified ? 'Click to revoke verified badge' : 'Click to approve and toggle Verified badge ON'}
                    >
                      {d.isVerified ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Revoke Verified Status</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Approve &amp; Verify Driver</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: DISPUTES & SUPPORT TICKETS */}
      {adminTab === 'disputes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white">Disputes &amp; Support Resolution Center</h4>
              <p className="text-xs text-slate-400">
                Handle fare adjustments, route deviation refunds, and customer disputes
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">{d.id}</span>
                    <span className="text-slate-500">|</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {d.issueCategory}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">Ride: {d.rideRef}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      d.status === 'resolved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : d.status === 'investigating'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                <p className="text-slate-200">{d.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>
                    Passenger: <strong className="text-white">{d.passengerName}</strong> • Driver:{' '}
                    <strong className="text-white">{d.driverName}</strong>
                  </span>

                  {d.status !== 'resolved' ? (
                    <button
                      type="button"
                      onClick={() => handleResolveDispute(d.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                    >
                      Issue ZMW {d.refundAmountZMW || 20} Refund &amp; Resolve
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-medium">✓ {d.resolution}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AI REVIEW & SAFETY SENTINEL */}
      {adminTab === 'safety_sentiment' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                AI Safety Sentinel Review &amp; Sentiment Analysis
              </h4>
              <p className="text-xs text-slate-400">
                Continuous NLP scanning of feedback to catch reckless driving, harassment, or vehicle issues
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                id: 'rev-1',
                passenger: 'Chipo Banda',
                driver: 'Mwamba Musonda',
                plate: 'BAA 4521 ZM',
                stars: 5,
                text: 'Very smooth ride on Great East Road, driver was courteous and obeyed speed limits.',
                sentiment: 'Positive',
                riskScore: 1,
                action: 'Driver awarded +50 loyalty points for safety compliance.',
              },
              {
                id: 'rev-2',
                passenger: 'David Mwape',
                driver: 'Kelvin Tembo',
                plate: 'BCA 1928 ZM',
                stars: 3,
                text: 'Bike was fast near Arcades roundabout, please tell driver to take roundabouts slower in rainy weather.',
                sentiment: 'Warning',
                riskScore: 6,
                action: 'Safety alert dispatched to driver console. Speed limit limiter triggered on rider profile.',
              },
              {
                id: 'rev-3',
                passenger: 'Grace Zulu',
                driver: 'Natasha Phiri',
                plate: 'ALB 8920 ZM',
                stars: 5,
                text: 'Wonderful Prius, AC was cold and music was nice. Arrived at KKIA airport 10 minutes early.',
                sentiment: 'Positive',
                riskScore: 1,
                action: 'Driver promoted to Comfort Executive tier.',
              },
            ].map((r) => (
              <div key={r.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-white">{r.passenger}</strong>
                    <span className="text-slate-400"> reviewed </span>
                    <strong className="text-emerald-400">{r.driver}</strong>
                    <span className="text-slate-500 font-mono text-[11px]"> ({r.plate})</span>
                  </div>
                  <span className="text-amber-400 font-bold">{r.stars} ★</span>
                </div>

                <p className="text-slate-300 italic">"{r.text}"</p>

                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">
                    AI Analysis: <strong className="text-cyan-400">{r.sentiment}</strong> • Risk Score: {r.riskScore}/10
                  </span>
                  <span className="text-emerald-400 font-semibold">{r.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ZRA TAX COMPLIANCE */}
      {adminTab === 'tax_reporting' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white">Zambia Revenue Authority (ZRA) Tax Portal</h4>
              <p className="text-xs text-slate-400">
                Automated 16% Value Added Tax (VAT) computation &amp; withholding tax ledgers
              </p>
            </div>
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Export ZRA Form 2026</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Month Taxable Gross</span>
              <strong className="text-xl font-black text-white font-mono">ZMW 482,900</strong>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">16% ZRA VAT Remitted</span>
              <strong className="text-xl font-black text-emerald-400 font-mono">ZMW 77,264</strong>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Fiscal Invoice Status</span>
              <strong className="text-xl font-black text-cyan-400 font-mono">100% Signed</strong>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MODULAR 3PL LOGISTICS API */}
      {adminTab === 'logistics_api' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Modular 3PL Logistics API Sandbox
              </h4>
              <p className="text-xs text-slate-400">
                Integrate BukeniRide fleet for third-party courier, freight, and e-commerce deliveries in Zambia
              </p>
            </div>
          </div>

          {/* API Key Box */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Sandbox API Key:</span>
              <code className="px-2.5 py-1 rounded bg-slate-900 text-emerald-400 font-mono font-bold">
                {apiKey}
              </code>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2000);
              }}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition flex items-center gap-1"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>

          {/* Interactive Endpoint Dispatcher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">
                POST /api/v1/logistics/dispatch
              </h5>

              <div>
                <label className="block text-slate-400 mb-1">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none"
                >
                  <option value="Express Moto">Express Moto (Bukeni Boda)</option>
                  <option value="Cargo Van">Cargo Van (Toyota HiAce)</option>
                  <option value="Heavy Freight">Heavy Freight (3-Ton Truck)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Pickup Address</label>
                <input
                  type="text"
                  value={pickupAddr}
                  onChange={(e) => setPickupAddr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={dropAddr}
                  onChange={(e) => setDropAddr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <button
                type="button"
                disabled={isApiLoading}
                onClick={handleTest3PLDispatch}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center justify-center gap-2"
              >
                <span>Trigger Dispatch Request</span>
              </button>
            </div>

            {/* Response Viewer */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                  <span>Server JSON Response</span>
                  <span className="text-emerald-400 font-mono text-[10px]">200 OK</span>
                </h5>
                <pre className="text-[11px] font-mono text-cyan-300 bg-slate-900 p-3 rounded-lg overflow-x-auto max-h-60">
                  {apiResponse
                    ? JSON.stringify(apiResponse, null, 2)
                    : '// Click "Trigger Dispatch Request" to test live endpoint'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RBAC TEAM PERMISSIONS */}
      {adminTab === 'rbac' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white">Role-Based Access Controls (RBAC)</h4>
              <p className="text-xs text-slate-400">
                Internal team permissions matrix for compliance, customer privacy &amp; security
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">Role</th>
                  <th className="px-3 py-2.5">Live Dispatch Access</th>
                  <th className="px-3 py-2.5">Dispute Mediation &amp; Refunds</th>
                  <th className="px-3 py-2.5">NRC &amp; Police Verification</th>
                  <th className="px-3 py-2.5">ZRA Tax Ledger Export</th>
                  <th className="px-3 py-2.5">Logistics API Provisioning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {[
                  {
                    role: 'Super Fleet Admin',
                    dispatch: 'Full',
                    disputes: 'Full ($5,000 max)',
                    docs: 'Approval Authority',
                    tax: 'Read/Write',
                    api: 'Admin',
                  },
                  {
                    role: 'Safety & Compliance Officer',
                    dispatch: 'Audit Only',
                    disputes: 'Mediate Only',
                    docs: 'Interpol / RTSA Verification',
                    tax: 'No Access',
                    api: 'No Access',
                  },
                  {
                    role: 'Customer Support Lead',
                    dispatch: 'View Live Ride',
                    disputes: 'Up to ZMW 250 Refund',
                    docs: 'View Only',
                    tax: 'No Access',
                    api: 'No Access',
                  },
                  {
                    role: '3PL Logistics Partner',
                    dispatch: 'Modular Submissions',
                    disputes: 'Own Shipments',
                    docs: 'No Access',
                    tax: 'Waybill Invoices Only',
                    api: 'Scoped Token',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="px-3 py-2.5 font-bold text-white">{row.role}</td>
                    <td className="px-3 py-2.5 text-emerald-400">{row.dispatch}</td>
                    <td className="px-3 py-2.5 text-cyan-400">{row.disputes}</td>
                    <td className="px-3 py-2.5 text-slate-300">{row.docs}</td>
                    <td className="px-3 py-2.5 text-slate-300">{row.tax}</td>
                    <td className="px-3 py-2.5 text-amber-400">{row.api}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
