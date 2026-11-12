import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  CreditCard,
  Shield,
  Star,
  Phone,
  Car,
  Clock,
  Sparkles,
  WifiOff,
  AlertTriangle,
  Receipt,
  Award,
  CheckCircle2,
  RefreshCw,
  Send,
  Zap,
  ArrowRight,
  MessageSquare,
  FileText,
  Compass,
  Globe2
} from 'lucide-react';
import {
  LocationPoint,
  RideTier,
  CurrencyCode,
  PaymentMethodType,
  RideRequest,
  DriverProfile,
  TrustedContact,
  SafetySmsNotification,
  CountryKey
} from '../types';
import { ZAMBIAN_LOCATIONS, NAMIBIAN_LOCATIONS, CURRENCY_RATES } from '../data/mockData';
import { COUNTRIES } from '../config';
import { RealtimeTripTimer } from './RealtimeTripTimer';

// Haversine geodesic distance calculation helper
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.2, +(R * c).toFixed(2));
}

interface PassengerViewProps {
  currentRide: RideRequest | null;
  onBookRide: (rideConfig: {
    pickup: LocationPoint;
    destination: LocationPoint;
    tier: RideTier;
    currency: CurrencyCode;
    paymentMethod: PaymentMethodType;
    fareZMW: number;
    distanceKm: number;
  }) => void;
  onCancelRide: () => void;
  onCompleteTripSim: () => void;
  onRateRide: (stars: number, review: string, tags: string[]) => void;
  onOpenSafetyHub: () => void;
  onOpenLoyaltyHub: () => void;
  onOpenTaxInvoice: () => void;
  onOpenOfflineNav: () => void;
  onOpenLogs?: () => void;
  onCallDriver?: (name: string, phone: string) => void;
  onTriggerSos: () => void;
  isSosActive: boolean;
  trustedContacts: TrustedContact[];
  tripProgress?: number;
  country?: CountryKey;
  onSelectCountry?: (country: CountryKey) => void;
}

export const PassengerView: React.FC<PassengerViewProps> = ({
  currentRide,
  onBookRide,
  onCancelRide,
  onCompleteTripSim,
  onRateRide,
  onOpenSafetyHub,
  onOpenLoyaltyHub,
  onOpenTaxInvoice,
  onOpenOfflineNav,
  onOpenLogs,
  onCallDriver,
  onTriggerSos,
  isSosActive,
  trustedContacts,
  tripProgress = 0,
  country = 'NAMIBIA',
  onSelectCountry,
}) => {
  const isNamibia = country === 'NAMIBIA';
  const activeLocations = isNamibia ? NAMIBIAN_LOCATIONS : ZAMBIAN_LOCATIONS;

  const [selectedPickup, setSelectedPickup] = useState<LocationPoint>(
    isNamibia ? NAMIBIAN_LOCATIONS[0] : ZAMBIAN_LOCATIONS[0]
  );
  const [selectedDest, setSelectedDest] = useState<LocationPoint>(
    isNamibia ? NAMIBIAN_LOCATIONS[2] : ZAMBIAN_LOCATIONS[2]
  );
  const [selectedTier, setSelectedTier] = useState<RideTier>('Bukeni Go');
  const [currency, setCurrency] = useState<CurrencyCode>(isNamibia ? 'NAD' : 'ZMW');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    isNamibia ? 'mtc_money' : 'mtn_momo'
  );

  // Sync state when country changes
  useEffect(() => {
    if (isNamibia) {
      setSelectedPickup(NAMIBIAN_LOCATIONS[0]);
      setSelectedDest(NAMIBIAN_LOCATIONS[2]);
      setCurrency('NAD');
      setPaymentMethod('mtc_money');
    } else {
      setSelectedPickup(ZAMBIAN_LOCATIONS[0]);
      setSelectedDest(ZAMBIAN_LOCATIONS[2]);
      setCurrency('ZMW');
      setPaymentMethod('mtn_momo');
    }
  }, [country, isNamibia]);

  // Countdown Timer & Dynamic ETA for Driver Pickup
  const [countdownSeconds, setCountdownSeconds] = useState<number>(180);
  const [initialCountdownSeconds, setInitialCountdownSeconds] = useState<number>(180);
  const [calculatedDistanceToPickup, setCalculatedDistanceToPickup] = useState<number>(1.5);

  // Rating & Review state
  const [stars, setStars] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>(
    isNamibia
      ? 'Very smooth ride from Maerua Mall on Sam Nujoma drive, driver drove carefully and car was clean.'
      : 'Very smooth ride on Great East Road, driver drove carefully and car was clean.'
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(['Smooth Driving', 'Safe Speed']);
  const [isAnalyzingReview, setIsAnalyzingReview] = useState<boolean>(false);
  const [aiReviewResult, setAiReviewResult] = useState<any>(null);

  // Calculate distance between driver and pickup when driver is assigned
  useEffect(() => {
    if (!currentRide?.driver || (currentRide.status !== 'driver_assigned' && currentRide.status !== 'driver_arriving')) {
      return;
    }
    const distKm = calculateHaversineKm(
      currentRide.driver.currentLat,
      currentRide.driver.currentLng,
      currentRide.pickup.lat,
      currentRide.pickup.lng
    );
    setCalculatedDistanceToPickup(distKm);
    const totalSec = Math.max(25, Math.round(distKm * 135));
    setCountdownSeconds(totalSec);
    setInitialCountdownSeconds(totalSec);
  }, [currentRide?.driver?.id, currentRide?.status, currentRide?.pickup.lat, currentRide?.pickup.lng]);

  // Real-time active countdown timer ticking down every second
  useEffect(() => {
    if (!currentRide || (currentRide.status !== 'driver_assigned' && currentRide.status !== 'driver_arriving')) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRide?.status]);

  // Format countdown mm:ss
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const dynamicDistanceToPickupKm =
    countdownSeconds > 0 && initialCountdownSeconds > 0
      ? Math.max(0.05, +((calculatedDistanceToPickup * countdownSeconds) / initialCountdownSeconds).toFixed(2))
      : 0;

  const dynamicArrivalTimeStr = new Date(Date.now() + countdownSeconds * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const remainingDistanceToDestKm = currentRide
    ? Math.max(0.1, +(currentRide.distanceKm * (1 - tripProgress)).toFixed(1))
    : 0;
  const hasReachedDestination = tripProgress >= 0.95;

  // Calculate realistic distance for booking
  const latDiff = Math.abs(selectedPickup.lat - selectedDest.lat);
  const lngDiff = Math.abs(selectedPickup.lng - selectedDest.lng);
  const approxDistanceKm = Math.max(3.5, Math.round((latDiff + lngDiff) * 85 * 10) / 10);

  // Tier pricing base & rates
  const tierOptions: Array<{
    tier: RideTier;
    name: string;
    subtext: string;
    baseFare: number;
    perKm: number;
    etaMin: number;
    icon: string;
  }> = isNamibia
    ? [
        {
          tier: 'Bukeni Boda',
          name: 'Bukeni Boda',
          subtext: 'Pulsar 150 • Quick commute',
          baseFare: 20,
          perKm: 5.5,
          etaMin: 2,
          icon: '🏍️',
        },
        {
          tier: 'Bukeni Go',
          name: 'Bukeni Go',
          subtext: 'Corolla Quest • Reliable everyday',
          baseFare: 35,
          perKm: 9.5,
          etaMin: 4,
          icon: '🚗',
        },
        {
          tier: 'Bukeni Comfort',
          name: 'Bukeni Comfort',
          subtext: 'Polo Vivo Sedan • AC & Extra Comfort',
          baseFare: 65,
          perKm: 13.5,
          etaMin: 5,
          icon: '✨',
        },
        {
          tier: 'Bukeni Van',
          name: 'Bukeni Van',
          subtext: 'Toyota Quantum • Group transit',
          baseFare: 95,
          perKm: 17.0,
          etaMin: 8,
          icon: '🚐',
        },
      ]
    : [
        {
          tier: 'Bukeni Boda',
          name: 'Bukeni Boda',
          subtext: 'Bajaj Boxer 150 • Quick commute',
          baseFare: 15,
          perKm: 4.5,
          etaMin: 2,
          icon: '🏍️',
        },
        {
          tier: 'Bukeni Go',
          name: 'Bukeni Go',
          subtext: 'Axio / Fit • Affordable everyday',
          baseFare: 30,
          perKm: 8.5,
          etaMin: 4,
          icon: '🚗',
        },
        {
          tier: 'Bukeni Comfort',
          name: 'Bukeni Comfort',
          subtext: 'Prius / Camry • Extra legroom & AC',
          baseFare: 55,
          perKm: 12.0,
          etaMin: 6,
          icon: '✨',
        },
        {
          tier: 'Bukeni Van',
          name: 'Bukeni Van',
          subtext: 'HiAce Commuter • Up to 7 people',
          baseFare: 80,
          perKm: 15.0,
          etaMin: 8,
          icon: '🚐',
        },
      ];

  const currentTierInfo = tierOptions.find((t) => t.tier === selectedTier) || tierOptions[1];
  const calculatedFareLocal = Math.round(currentTierInfo.baseFare + approxDistanceKm * currentTierInfo.perKm);

  // Multi-currency conversion
  const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES[isNamibia ? 'NAD' : 'ZMW'];
  const convertedFare = (calculatedFareLocal * (currency === (isNamibia ? 'NAD' : 'ZMW') ? 1.0 : rateObj.rateToZMW)).toFixed(
    currency === 'USD' || currency === 'EUR' || currency === 'GBP' ? 2 : 0
  );

  const vatRate = isNamibia ? 0.15 : 0.16;
  const vatName = isNamibia ? '15% NAMRA Statutory VAT' : '16% ZRA Statutory VAT';
  const vatAmount = +(calculatedFareLocal * vatRate).toFixed(2);

  const handleBookNow = () => {
    onBookRide({
      pickup: selectedPickup,
      destination: selectedDest,
      tier: selectedTier,
      currency,
      paymentMethod,
      fareZMW: calculatedFareLocal,
      distanceKm: approxDistanceKm,
    });
  };

  const handleAnalyzeAndSubmitReview = async () => {
    setIsAnalyzingReview(true);
    try {
      const res = await fetch('/api/review-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewText,
          stars,
          driverName: currentRide?.driver?.name,
          rideRef: currentRide?.bookingRef,
          country,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiReviewResult(data.analysis);
      }
    } catch (e) {
      console.warn('AI sentiment analysis failed:', e);
    } finally {
      setIsAnalyzingReview(false);
      onRateRide(stars, reviewText, selectedTags);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Banner: Quick Access to Safety Hub, Loyalty Points & Logs */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenSafetyHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Safety Hub ({trustedContacts.length} Contacts Active)</span>
          </button>

          <button
            type="button"
            onClick={onOpenLoyaltyHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition"
          >
            <Award className="w-3.5 h-3.5" />
            <span>BukeniPoints: 720 Pts</span>
          </button>

          {onOpenLogs && (
            <button
              type="button"
              onClick={onOpenLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ride Logs &amp; Payouts (90/10)</span>
            </button>
          )}
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Currency:</span>
          {(['NAD', 'ZMW', 'USD', 'EUR', 'GBP'] as CurrencyCode[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition ${
                currency === c
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* STATE 1: BOOKING SELECTION (IDLE) */}
      {(!currentRide || currentRide.status === 'idle') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
          {/* Pickup & Destination Pickers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>{isNamibia ? '🇳🇦' : '🇿🇲'}</span>
                <span>Ride Route ({isNamibia ? 'Namibia Windhoek Corridors' : 'Zambia Lusaka Corridors'})</span>
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">~{approxDistanceKm} km</span>
            </h3>

            {/* Pickup */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Pickup Location:
              </label>
              <select
                value={selectedPickup.name}
                onChange={(e) => {
                  const loc = activeLocations.find((l) => l.name === e.target.value);
                  if (loc) setSelectedPickup(loc);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 outline-none font-medium"
              >
                {activeLocations.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} — ({loc.area})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Drop-off Destination:
              </label>
              <select
                value={selectedDest.name}
                onChange={(e) => {
                  const loc = activeLocations.find((l) => l.name === e.target.value);
                  if (loc) setSelectedDest(loc);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 outline-none font-medium"
              >
                {activeLocations.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} — ({loc.area})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Tier Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Choose Vehicle Class
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {tierOptions.map((opt) => {
                const fareForThis = Math.round(opt.baseFare + approxDistanceKm * opt.perKm);
                const isSelected = selectedTier === opt.tier;
                return (
                  <button
                    key={opt.tier}
                    type="button"
                    onClick={() => setSelectedTier(opt.tier)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {opt.etaMin}m away
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">{opt.name}</h4>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{opt.subtext}</p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80">
                      <strong className="text-emerald-400 text-xs font-mono">
                        {isNamibia ? 'NAD' : 'ZMW'} {fareForThis}
                      </strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Payment Gateway ({isNamibia ? 'Namibia Mobile Money & Cards' : 'Zambia Mobile Money & Cards'})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {isNamibia ? (
                <>
                  {[
                    { id: 'mtc_money', label: 'MTC Money', icon: '🔵', desc: 'Dial *682#' },
                    { id: 'fnb_ewallet', label: 'FNB eWallet', icon: '🟠', desc: 'Instant PIN' },
                    { id: 'card', label: 'Card (NAD)', icon: '💳', desc: 'Visa / Master' },
                    { id: 'cash', label: 'Cash (NAD)', icon: '💵', desc: 'Pay Driver' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        paymentMethod === m.id
                          ? 'bg-emerald-500/15 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base block mb-0.5">{m.icon}</span>
                      <span className="text-xs font-bold block text-white">{m.label}</span>
                      <span className="text-[9px] text-slate-500 block">{m.desc}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { id: 'mtn_momo', label: 'MTN MoMo', icon: '🟡', desc: 'Dial *303#' },
                    { id: 'airtel_money', label: 'Airtel Money', icon: '🔴', desc: 'Dial *778#' },
                    { id: 'zamtel_kwacha', label: 'Zamtel Kwacha', icon: '🟢', desc: 'Dial *368#' },
                    { id: 'cash', label: 'Cash (ZMW)', icon: '💵', desc: 'Pay Driver' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        paymentMethod === m.id
                          ? 'bg-emerald-500/15 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base block mb-0.5">{m.icon}</span>
                      <span className="text-xs font-bold block text-white">{m.label}</span>
                      <span className="text-[9px] text-slate-500 block">{m.desc}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Fare Summary & 10% Platform / 90% Driver Payment Calculation */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/90 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Total Estimated Fare</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white font-mono">
                    {rateObj.symbol} {convertedFare}
                  </span>
                  {currency !== (isNamibia ? 'NAD' : 'ZMW') && (
                    <span className="text-slate-400 text-[11px] font-mono">({isNamibia ? 'NAD' : 'ZMW'} {calculatedFareLocal})</span>
                  )}
                </div>
                <p className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                  Includes {vatName} ({isNamibia ? 'NAD' : 'ZMW'} {vatAmount})
                </p>
              </div>

              <button
                type="button"
                onClick={handleBookNow}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 flex items-center gap-2"
              >
                <Car className="w-4 h-4" />
                <span>Confirm &amp; Request BukeniRide</span>
              </button>
            </div>

            {/* 10% Platform Fee / 90% Driver Payment Calculation */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                <span className="text-emerald-400 font-bold block uppercase text-[10px]">
                  Driver Keeps (90%)
                </span>
                <span className="text-white font-mono font-bold">
                  {isNamibia ? 'NAD' : 'ZMW'} {Math.round(calculatedFareLocal * 0.9)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-800/40">
                <span className="text-cyan-400 font-bold block uppercase text-[10px]">
                  Bukeni Platform Fee (10%)
                </span>
                <span className="text-white font-mono font-bold">
                  {isNamibia ? 'NAD' : 'ZMW'} {Math.round(calculatedFareLocal * 0.1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: SEARCHING FOR NEARBY DRIVERS */}
      {currentRide?.status === 'searching' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Car className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">
              Dispatching Nearest Driver in {COUNTRIES[country].name}...
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Analyzing telematics along {selectedPickup.name} corridor. Preparing automatic trusted safety SMS for your {trustedContacts.length} registered emergency numbers.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 inline-block text-xs font-mono text-emerald-400">
            Booking Reference: {currentRide.bookingRef}
          </div>

          <div>
            <button
              type="button"
              onClick={onCancelRide}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Cancel Request
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: DRIVER ASSIGNED OR ARRIVING */}
      {currentRide && (currentRide.status === 'driver_assigned' || currentRide.status === 'driver_arriving') && currentRide.driver && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-bold">
                {currentRide.status === 'driver_arriving' ? '🚗 DRIVER AT PICKUP' : '📍 EN ROUTE TO PICKUP'}
              </span>
              <h3 className="text-base font-bold text-white">
                {currentRide.driver.name} is {dynamicDistanceToPickupKm} km away
              </h3>
              <p className="text-xs text-slate-400">
                Arriving around <strong className="text-white font-mono">{dynamicArrivalTimeStr}</strong> • ETA {formatTimer(countdownSeconds)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onCallDriver && (
                <button
                  type="button"
                  onClick={() => onCallDriver(currentRide.driver!.name, currentRide.driver!.phone)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Driver</span>
                </button>
              )}

              <button
                type="button"
                onClick={onTriggerSos}
                className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SOS Alert</span>
              </button>
            </div>
          </div>

          {/* Driver Partner Snapshot */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={currentRide.driver.photoUrl}
                alt={currentRide.driver.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{currentRide.driver.name}</h4>
                  {currentRide.driver.isVerified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {currentRide.driver.vehicleColor} {currentRide.driver.vehicleMake} {currentRide.driver.vehicleModel}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Plate: <strong className="text-emerald-400">{currentRide.driver.vehiclePlate}</strong> • Rating: {currentRide.driver.rating} ★
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">Fixed Fare</span>
              <strong className="text-lg font-black text-white font-mono">
                {currentRide.currency} {currentRide.fareSelectedCurrency}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: IN TRIP ACTIVE */}
      {currentRide?.status === 'in_trip' && (
        <div className="space-y-4">
          <RealtimeTripTimer
            ride={currentRide}
            role="passenger"
            country={country}
            onCallContact={onCallDriver ? () => onCallDriver(currentRide.driver?.name || 'Driver', currentRide.driver?.phone || '+260977123456') : undefined}
            onTriggerSos={onTriggerSos}
          />

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-bold">
                  🟢 TRIP IN PROGRESS
                </span>
                <h3 className="text-base font-bold text-white">
                  Heading to {currentRide.destination.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {remainingDistanceToDestKm} km remaining • Progress: {Math.round(tripProgress * 100)}%
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenOfflineNav}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Turn-by-Turn GPS</span>
                </button>

                <button
                  type="button"
                  onClick={onTriggerSos}
                  className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>SOS Alert</span>
                </button>
              </div>
            </div>

          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-500"
              style={{ width: `${Math.round(tripProgress * 100)}%` }}
            />
          </div>

          {hasReachedDestination && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-300">Destination Reached!</p>
                <p className="text-[11px] text-emerald-200">You have safely arrived at {currentRide.destination.name}.</p>
              </div>
              <button
                type="button"
                onClick={onCompleteTripSim}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                Complete Ride &amp; Rate
              </button>
            </div>
          )}
        </div>
      </div>
    )}

      {/* STATE 5: TRIP COMPLETED & RATING */}
      {currentRide?.status === 'completed' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Trip Completed Safely!</h3>
            <p className="text-xs text-slate-400">
              Receipt reference: {currentRide.bookingRef} • Total paid: {currentRide.currency} {currentRide.fareSelectedCurrency}
            </p>
          </div>

          {/* Rating Stars */}
          <div className="flex justify-center gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setStars(star)}
                className={`text-2xl transition transform hover:scale-110 ${
                  star <= stars ? 'text-amber-400' : 'text-slate-700'
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
              Leave Feedback for Driver ({currentRide.driver?.name})
            </label>
            <textarea
              rows={2}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Quick Safety Tags */}
          <div className="flex flex-wrap gap-1.5">
            {['Smooth Driving', 'Punctual', 'Safe Speed', 'Clean Vehicle', 'Polite', 'Great Route'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSelectedTags((prev) =>
                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                  );
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                  selectedTags.includes(tag)
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={onOpenTaxInvoice}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Tax Invoice ({isNamibia ? 'NAMRA' : 'ZRA'})</span>
            </button>

            <button
              type="button"
              disabled={isAnalyzingReview}
              onClick={handleAnalyzeAndSubmitReview}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
            >
              {isAnalyzingReview ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Submit Rating</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
