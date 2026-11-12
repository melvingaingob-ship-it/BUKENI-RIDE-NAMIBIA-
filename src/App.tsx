import React, { useState, useEffect } from 'react';
import {
  Car,
  Smartphone,
  Shield,
  Award,
  AlertTriangle,
  Receipt,
  MessageSquare,
  Compass,
  WifiOff,
  Maximize2,
  Minimize2,
  Users,
  Settings,
  Bell,
  CheckCircle2,
  Phone,
  FileText,
  Globe2,
  Radio,
  TrendingUp,
  Clock,
  Battery,
  Wifi,
  Signal,
  ArrowRight,
  ExternalLink,
  User
} from 'lucide-react';
import {
  RideRequest,
  DriverProfile,
  LocationPoint,
  RideTier,
  CurrencyCode,
  PaymentMethodType,
  TrustedContact,
  VerificationDocument,
  SafetySmsNotification,
  UserRole,
  LoyaltyAccount,
  AuditActivityLog,
  CountryKey
} from './types';
import {
  NAMIBIAN_LOCATIONS,
  ZAMBIAN_LOCATIONS,
  NAMIBIAN_DRIVERS,
  ZAMBIAN_DRIVERS,
  NAMIBIAN_TRUSTED_CONTACTS,
  ZAMBIAN_TRUSTED_CONTACTS,
  NAMIBIAN_USER_DOCS,
  ZAMBIAN_USER_DOCS,
  CURRENCY_RATES,
  INITIAL_RIDES
} from './data/mockData';
import { COUNTRIES } from './config';
import { InteractiveMap } from './components/InteractiveMap';
import { PassengerView } from './components/PassengerView';
import { DriverView } from './components/DriverView';
import { SmsBookingGateway } from './components/SmsBookingGateway';
import { AdminDashboard } from './components/AdminDashboard';
import { SafetyHubModal } from './components/SafetyHubModal';
import { LoyaltyHubModal } from './components/LoyaltyHubModal';
import { ZraTaxInvoiceModal } from './components/ZraTaxInvoiceModal';
import { OfflineNavModal } from './components/OfflineNavModal';
import { InAppCallModal } from './components/InAppCallModal';
import { RideLogsModal } from './components/RideLogsModal';
import { MultiCountryTesterModal } from './components/MultiCountryTesterModal';
import { DriverEarningsReportModal } from './components/DriverEarningsReportModal';
import { RealtimeTripTimer } from './components/RealtimeTripTimer';
import { AuthModal } from './components/AuthModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UserProfile } from './types';
import { subscribeToAuthState, getUserProfile, updateUserProfileState, signOutUser } from './services/authService';
import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

export default function App() {
  // Multi-Country Active State (Namibia or Zambia)
  const [activeCountry, setActiveCountry] = useState<CountryKey>('NAMIBIA');
  const [isMultiCountryModalOpen, setIsMultiCountryModalOpen] = useState(false);

  // Firebase Authentication & User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Navigation Mode: Passenger App, Driver Partner, SMS Gateway, or Admin Center
  const [activeMode, setActiveMode] = useState<'passenger' | 'driver' | 'sms' | 'admin'>('passenger');
  const [actingRole, setActingRole] = useState<UserRole>('passenger');

  // Listen to Firebase Auth state across sessions
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
            setActiveCountry(profile.country);
            if (profile.role === 'admin') {
              setActiveMode('admin');
              setActingRole('admin');
            } else if (profile.role === 'driver') {
              setActiveMode('driver');
              setActingRole('driver');
            } else {
              setActiveMode('passenger');
              setActingRole('passenger');
            }
            if (profile.loyaltyPoints !== undefined) {
              setLoyalty((prev) => ({ ...prev, points: profile.loyaltyPoints }));
            }
          }
        } catch (e) {
          console.warn('[Firebase Auth] Session restore notice:', e);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Phone Testing & Device Simulation Mode (Desktop / iPhone 16 Pro / Android Pixel 9)
  const [deviceMode, setDeviceMode] = useState<'responsive' | 'iphone' | 'android'>('responsive');

  // Core State
  const [drivers, setDrivers] = useState<DriverProfile[]>([...NAMIBIAN_DRIVERS, ...ZAMBIAN_DRIVERS]);
  const [activeDriver, setActiveDriver] = useState<DriverProfile>(NAMIBIAN_DRIVERS[0]);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>(NAMIBIAN_TRUSTED_CONTACTS);
  const [userDocs, setUserDocs] = useState<VerificationDocument[]>(NAMIBIAN_USER_DOCS);
  const [smsLogs, setSmsLogs] = useState<SafetySmsNotification[]>([]);
  const [isSosActive, setIsSosActive] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Ride & Telematics State
  const [allRidesList, setAllRidesList] = useState<RideRequest[]>(INITIAL_RIDES);
  const [currentRide, setCurrentRide] = useState<RideRequest | null>(null);
  const [tripProgress, setTripProgress] = useState<number>(0);

  // Modal Open States
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [isTaxInvoiceOpen, setIsTaxInvoiceOpen] = useState(false);
  const [isOfflineNavOpen, setIsOfflineNavOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isEarningsModalOpen, setIsEarningsModalOpen] = useState(false);

  // In-App Calling Modal State
  const [callModalData, setCallModalData] = useState<{
    isOpen: boolean;
    callerName: string;
    callerRole: 'driver' | 'passenger';
    recipientName: string;
    recipientPhone: string;
  } | null>(null);

  // Loyalty Program State
  const [loyalty, setLoyalty] = useState<LoyaltyAccount>({
    points: 720,
    tier: 'Silver',
    lifetimeRides: 46,
    totalSavedZMW: 320,
    availableVouchers: [
      { id: 'v-1', title: 'Maerua / East Park CBD Voucher', discountZMW: 30, requiredPoints: 200, code: 'CBD30' },
      { id: 'v-2', title: 'Airport Express Voucher', discountZMW: 60, requiredPoints: 450, code: 'AIRPORT60' },
      { id: 'v-3', title: 'Free Bukeni Comfort Upgrade', discountZMW: 85, requiredPoints: 600, code: 'COMFORTVIP' },
    ],
  });

  // Switch country handler
  const handleSelectCountry = (country: CountryKey) => {
    setActiveCountry(country);
    if (country === 'NAMIBIA') {
      setActiveDriver(NAMIBIAN_DRIVERS[0]);
      setTrustedContacts(NAMIBIAN_TRUSTED_CONTACTS);
      setUserDocs(NAMIBIAN_USER_DOCS);
    } else {
      setActiveDriver(ZAMBIAN_DRIVERS[0]);
      setTrustedContacts(ZAMBIAN_TRUSTED_CONTACTS);
      setUserDocs(ZAMBIAN_USER_DOCS);
    }
    if (currentUser?.uid) {
      updateUserProfileState(currentUser.uid, { country });
    }
  };

  // Sync ride to Firestore safely
  const syncRideToFirestore = async (ride: RideRequest) => {
    try {
      const docRef = doc(db, 'rides', ride.id);
      await setDoc(docRef, { ...ride, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      // Local fallback in memory
    }
  };

  // Real-time trip simulator progression
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentRide && currentRide.status === 'in_trip') {
      interval = setInterval(() => {
        setTripProgress((prev) => {
          if (prev >= 1) {
            clearInterval(interval);
            return 1;
          }
          const next = prev + 0.05;
          return next > 1 ? 1 : next;
        });
      }, 3000);
    } else {
      setTripProgress(0);
    }
    return () => clearInterval(interval);
  }, [currentRide?.status]);

  // Handle passenger booking
  const handleBookRide = (rideConfig: {
    pickup: LocationPoint;
    destination: LocationPoint;
    tier: RideTier;
    currency: CurrencyCode;
    paymentMethod: PaymentMethodType;
    fareZMW: number;
    distanceKm: number;
  }) => {
    const isNam = activeCountry === 'NAMIBIA';
    const fareZMW = rideConfig.fareZMW;
    const driverCut = Math.round(fareZMW * 0.9);
    const platformCut = Math.round(fareZMW * 0.1);

    const newRide: RideRequest = {
      id: `ride-${Date.now()}`,
      bookingRef: `BK-${COUNTRIES[activeCountry].code}-${Math.floor(100000 + Math.random() * 900000)}`,
      passengerName: isNam ? 'Elifas Nghikembua' : 'Chileshe Mulenga',
      passengerPhone: isNam ? '+264 81 928 3192' : '+260 97 123 4567',
      pickup: rideConfig.pickup,
      destination: rideConfig.destination,
      tier: rideConfig.tier,
      fareZMW,
      fareSelectedCurrency: fareZMW,
      currency: rideConfig.currency,
      paymentMethod: rideConfig.paymentMethod,
      paymentStatus: 'pending',
      status: 'driver_assigned',
      driver: activeDriver,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distanceKm: rideConfig.distanceKm,
      durationMinutes: 14,
      driverPayout90ZMW: driverCut,
      platformFee10ZMW: platformCut,
      zraVat16ZMW: Math.round(fareZMW * (isNam ? 0.15 : 0.16)),
      netFareZMW: Math.round(fareZMW * (isNam ? 0.85 : 0.84)),
      safetySmsDispatched: [],
      safetyCheckStatus: 'verified',
      country: activeCountry,
    };

    setCurrentRide(newRide);
    setAllRidesList((prev) => [newRide, ...prev]);
    syncRideToFirestore(newRide);
  };

  // Helper distance
  function calculateDistance(p1: LocationPoint, p2: LocationPoint) {
    const dLat = p2.lat - p1.lat;
    const dLng = p2.lng - p1.lng;
    return Math.max(3.5, Math.sqrt(dLat * dLat + dLng * dLng) * 111);
  }

  // Handle book from SMS gateway (specifically configured for Zambia Africa's Talking)
  const handleBookFromSms = (bookingData: {
    pickupName: string;
    destName: string;
    tier: RideTier;
    fareZMW: number;
    bookingRef: string;
    currency?: string;
  }) => {
    const locations = activeCountry === 'NAMIBIA' ? NAMIBIAN_LOCATIONS : ZAMBIAN_LOCATIONS;
    const pickup = locations.find((l) => l.name.toLowerCase().includes(bookingData.pickupName.toLowerCase())) || locations[0];
    const destination = locations.find((l) => l.name.toLowerCase().includes(bookingData.destName.toLowerCase())) || locations[1];

    const driverCut = Math.round(bookingData.fareZMW * 0.9);
    const platformCut = Math.round(bookingData.fareZMW * 0.1);

    const newRide: RideRequest = {
      id: `ride-sms-${Date.now()}`,
      bookingRef: bookingData.bookingRef,
      passengerName: 'SMS Feature Phone Rider',
      passengerPhone: activeCountry === 'NAMIBIA' ? '+264 81 294 8812' : '+260 97 744 1920',
      pickup,
      destination,
      tier: bookingData.tier,
      fareZMW: bookingData.fareZMW,
      fareSelectedCurrency: bookingData.fareZMW,
      currency: activeCountry === 'NAMIBIA' ? 'NAD' : 'ZMW',
      paymentMethod: activeCountry === 'NAMIBIA' ? 'mtc_money' : 'mtn_momo',
      paymentStatus: 'pending',
      status: 'driver_assigned',
      driver: activeDriver,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distanceKm: +(calculateDistance(pickup, destination)).toFixed(1),
      durationMinutes: 12,
      driverPayout90ZMW: driverCut,
      platformFee10ZMW: platformCut,
      zraVat16ZMW: Math.round(bookingData.fareZMW * (activeCountry === 'NAMIBIA' ? 0.15 : 0.16)),
      netFareZMW: Math.round(bookingData.fareZMW * (activeCountry === 'NAMIBIA' ? 0.85 : 0.84)),
      safetySmsDispatched: [],
      safetyCheckStatus: 'verified',
      country: activeCountry,
    };

    setCurrentRide(newRide);
    setAllRidesList((prev) => [newRide, ...prev]);
    setActiveMode('passenger');
    syncRideToFirestore(newRide);
  };

  // Ride lifecycle handlers
  const handleCancelRide = () => {
    if (currentRide) {
      const updated: RideRequest = { ...currentRide, status: 'cancelled' };
      setCurrentRide(null);
      setAllRidesList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      syncRideToFirestore(updated);
    }
  };

  const handleCompleteTripSim = () => {
    if (currentRide) {
      const updated: RideRequest = { ...currentRide, status: 'completed' };
      setCurrentRide(updated);
      setAllRidesList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      syncRideToFirestore(updated);

      // Award loyalty points
      setLoyalty((prev) => ({
        ...prev,
        points: prev.points + 25,
        lifetimeRides: prev.lifetimeRides + 1,
      }));

      if (currentUser?.uid) {
        updateUserProfileState(currentUser.uid, {
          loyaltyPoints: loyalty.points + 25,
        });
      }
    }
  };

  const handleRateRide = (stars: number, reviewText: string) => {
    if (currentRide) {
      setCurrentRide(null);
    }
  };

  // Call handling
  const handleCallDriver = (name: string, phone: string) => {
    setCallModalData({
      isOpen: true,
      callerName: activeCountry === 'NAMIBIA' ? 'Elifas Nghikembua' : 'Chileshe Mulenga',
      callerRole: 'passenger',
      recipientName: name,
      recipientPhone: phone,
    });
  };

  const handleCallPassenger = (name: string, phone: string) => {
    setCallModalData({
      isOpen: true,
      callerName: activeDriver.name,
      callerRole: 'driver',
      recipientName: name,
      recipientPhone: phone,
    });
  };

  // SOS Emergency trigger
  const handleTriggerSos = () => {
    setIsSosActive((prev) => !prev);
    if (!isSosActive) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const policeDesc = activeCountry === 'NAMIBIA' ? 'Namibian Police (10111)' : 'Zambia Police (991)';
      const sosAlerts: SafetySmsNotification[] = trustedContacts.map((c, idx) => ({
        id: `sos-${Date.now()}-${idx}`,
        timestamp: timeStr,
        recipientPhone: c.phoneNumber,
        recipientName: c.name,
        messageText: `[BUKENIRIDE SOS ALERT] EMERGENCY SOS triggered by ${currentRide?.passengerName || 'Client'}. Immediate location: ${currentRide?.pickup.name || 'Corridor Hub'}. ${policeDesc} notified. Shortcode: ${COUNTRIES[activeCountry].shortcode}. Tracking: https://bukeni.${COUNTRIES[activeCountry].google_maps_region}/sos/${currentRide?.bookingRef || 'URGENT'}`,
        driverName: currentRide?.driver?.name || 'Assigned Driver',
        driverPlate: currentRide?.driver?.vehiclePlate || 'PARTNER-CAR',
        liveTrackingUrl: `https://bukeni.${COUNTRIES[activeCountry].google_maps_region}/sos`,
        deliveryStatus: 'delivered',
        country: activeCountry,
        shortcode: COUNTRIES[activeCountry].shortcode,
      }));

      setSmsLogs((prev) => [...sosAlerts, ...prev]);
    }
  };

  // Toggle Driver Verified Status (Admin feature)
  const handleToggleVerifyDriver = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          const nextVerified = !d.isVerified;
          const updated = { ...d, isVerified: nextVerified };
          if (activeDriver.id === driverId) {
            setActiveDriver(updated);
          }
          if (currentRide?.driver?.id === driverId) {
            setCurrentRide((r) => (r ? { ...r, driver: updated } : null));
          }
          return updated;
        }
        return d;
      })
    );
  };

  // Redeem voucher
  const handleRedeemVoucher = (voucherId: string) => {
    const voucher = loyalty.availableVouchers.find((v) => v.id === voucherId);
    if (voucher && loyalty.points >= voucher.requiredPoints) {
      setLoyalty((prev) => ({
        ...prev,
        points: prev.points - voucher.requiredPoints,
        totalSavedZMW: prev.totalSavedZMW + voucher.discountZMW,
      }));
      alert(`Voucher ${voucher.code} applied! ${COUNTRIES[activeCountry].currency} ${voucher.discountZMW} will be discounted on your next ride.`);
    }
  };

  const currentCountryConf = COUNTRIES[activeCountry];
  const activeLocations = activeCountry === 'NAMIBIA' ? NAMIBIAN_LOCATIONS : ZAMBIAN_LOCATIONS;

  // Render the core app content (used inside responsive layout or inside mobile simulator chassis)
  const renderAppContent = (isInsidePhoneFrame = false) => (
    <div className={`space-y-4 sm:space-y-6 ${isInsidePhoneFrame ? 'text-xs' : ''}`}>
      {/* Live Trip Status / Real-time Trip Timer Floating Banner */}
      {currentRide && (currentRide.status === 'in_trip' || currentRide.status === 'driver_assigned') && (
        <div className="animate-in fade-in slide-in-from-top duration-300">
          <RealtimeTripTimer
            ride={currentRide}
            role={activeMode === 'driver' ? 'driver' : 'passenger'}
            country={activeCountry}
            onCallContact={
              activeMode === 'driver'
                ? () => handleCallPassenger(currentRide.passengerName, currentRide.passengerPhone)
                : () => handleCallDriver(currentRide.driver?.name || 'Driver', currentRide.driver?.phone || '+260977123456')
            }
            onTriggerSos={handleTriggerSos}
            onCompleteRide={handleCompleteTripSim}
            compact={isInsidePhoneFrame}
          />
        </div>
      )}

      {/* Interactive Live Map Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>
              {activeCountry === 'NAMIBIA' ? 'Windhoek Telematics 🇳🇦' : 'Lusaka Telematics 🇿🇲'}
            </span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {activeCountry === 'NAMIBIA' ? 'Lat: -22.56 • Lng: 17.08' : 'Lat: -15.39 • Lng: 28.32'}
          </span>
        </div>

        <InteractiveMap
          pickup={currentRide?.pickup || activeLocations[0]}
          destination={currentRide?.destination || activeLocations[1]}
          driver={currentRide?.driver || activeDriver}
          isTripActive={currentRide?.status === 'in_trip'}
          tripProgress={tripProgress}
          isSosActive={isSosActive}
          isOfflineMode={isOfflineMode}
          onToggleOffline={() => setIsOfflineMode(!isOfflineMode)}
          heightClass={isInsidePhoneFrame ? 'h-56' : 'h-72 sm:h-96'}
          distanceKm={currentRide?.distanceKm || 8.5}
          country={activeCountry}
        />
      </div>

      {/* Active View Module */}
      <div className="transition-all duration-300">
        {activeMode === 'passenger' && (
          <PassengerView
            currentRide={currentRide}
            tripProgress={tripProgress}
            onBookRide={handleBookRide}
            onCancelRide={handleCancelRide}
            onCompleteTripSim={handleCompleteTripSim}
            onRateRide={handleRateRide}
            onOpenSafetyHub={() => setIsSafetyModalOpen(true)}
            onOpenLoyaltyHub={() => setIsLoyaltyModalOpen(true)}
            onOpenTaxInvoice={() => setIsTaxInvoiceOpen(true)}
            onOpenOfflineNav={() => setIsOfflineNavOpen(true)}
            onOpenLogs={() => setIsLogsModalOpen(true)}
            onCallDriver={handleCallDriver}
            onTriggerSos={handleTriggerSos}
            isSosActive={isSosActive}
            trustedContacts={trustedContacts}
            country={activeCountry}
            onSelectCountry={handleSelectCountry}
          />
        )}

        {activeMode === 'driver' && (
          <DriverView
            driver={activeDriver}
            currentRide={currentRide}
            allDrivers={drivers}
            onSelectDriver={(d) => setActiveDriver(d)}
            onAcceptIncomingRide={() => {
              if (currentRide) {
                const updated: RideRequest = { ...currentRide, status: 'driver_assigned', driver: activeDriver };
                setCurrentRide(updated);
                syncRideToFirestore(updated);
              }
            }}
            onRejectIncomingRide={handleCancelRide}
            onStartRide={() => {
              if (currentRide) {
                const updated: RideRequest = {
                  ...currentRide,
                  status: 'in_trip',
                  startedAt: new Date().toLocaleTimeString(),
                };
                setCurrentRide(updated);
                syncRideToFirestore(updated);
              }
            }}
            onCompleteRide={handleCompleteTripSim}
            onToggleOnline={() => {
              setActiveDriver((prev) => ({ ...prev, isOnline: !prev.isOnline }));
            }}
            onOpenOfflineNav={() => setIsOfflineNavOpen(true)}
            onOpenLogs={() => setIsLogsModalOpen(true)}
            onOpenEarningsReport={() => setIsEarningsModalOpen(true)}
            onCallClient={handleCallPassenger}
            onTriggerSos={handleTriggerSos}
            isSosActive={isSosActive}
            country={activeCountry}
          />
        )}

        {activeMode === 'sms' && (
          <SmsBookingGateway
            onBookRideFromSms={handleBookFromSms}
            trustedContacts={trustedContacts}
          />
        )}

        {activeMode === 'admin' && (
          <AdminDashboard
            currentRide={currentRide}
            drivers={drivers}
            userRole={actingRole}
            onSelectRole={(r) => setActingRole(r)}
            onOpenLogs={() => setIsLogsModalOpen(true)}
            onOpenEarningsReport={() => setIsEarningsModalOpen(true)}
            onToggleVerifyDriver={handleToggleVerifyDriver}
            country={activeCountry}
            onOpenMultiCountryTester={() => setIsMultiCountryModalOpen(true)}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand Identity & Country Switcher */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  BukeniRide <span className="text-emerald-400">{currentCountryConf.name}</span>
                </h1>

                {/* Country Switcher Pills */}
                <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleSelectCountry('NAMIBIA')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      activeCountry === 'NAMIBIA'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Switch to Namibia (Windhoek)"
                  >
                    <span>🇳🇦</span>
                    <span>Namibia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectCountry('ZAMBIA')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      activeCountry === 'ZAMBIA'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Switch to Zambia (Lusaka)"
                  >
                    <span>🇿🇲</span>
                    <span>Zambia</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 hidden sm:flex items-center gap-2">
                <span>Shortcode: <strong className="text-white font-mono">{currentCountryConf.shortcode}</strong></span>
                <span>•</span>
                <span>Currency: <strong className="text-cyan-400 font-mono">{currentCountryConf.currency}</strong></span>
                <span>•</span>
                <span>Provider: <strong className="text-slate-300">Africa&apos;s Talking</strong></span>
              </p>
            </div>
          </div>

          {/* Desktop Mode Switcher Buttons */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveMode('passenger');
                setActingRole('passenger');
              }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeMode === 'passenger'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Passenger</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('driver');
                setActingRole('driver');
              }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeMode === 'driver'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Driver Partner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('sms')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeMode === 'sms'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SMS Gateway ({currentCountryConf.shortcode})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('admin');
                setActingRole('admin');
              }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeMode === 'admin'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </button>
          </div>

          {/* Quick Header Actions: Driver Earnings, Device Simulator Frame, Auth & SOS */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Firebase Auth Account Button */}
            {currentUser ? (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-emerald-500/50 hover:border-emerald-400 text-xs transition shadow-sm"
                title="View Firebase Auth Profile & Session"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-[11px]">
                  {currentUser.displayName?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1 leading-tight">
                    <span className="font-bold text-white max-w-[110px] truncate">{currentUser.displayName}</span>
                    <span className="text-[10px]">{currentUser.country === 'NAMIBIA' ? '🇳🇦' : '🇿🇲'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono block leading-tight">{currentUser.phoneNumber}</span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-md shadow-emerald-500/20"
                title="Sign In with Mobile Phone Number & Country Code"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Driver Earnings Report 1-Tap Trigger */}
            <button
              type="button"
              onClick={() => setIsEarningsModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              title="Open Driver Partner Earnings Report (90/10)"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Earnings (90%)</span>
              <span className="sm:hidden">90%</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLogsModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-bold text-xs transition flex items-center gap-1.5 shadow-md"
              title="View Unified Ride & 90/10 Financial Settlement Logs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logs</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMultiCountryModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-purple-950/20"
              title="Open Multi-Country Testing Console"
            >
              <Globe2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden lg:inline">config.js Tester</span>
            </button>

            {/* Emergency SOS Panic */}
            <button
              type="button"
              onClick={handleTriggerSos}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-md ${
                isSosActive
                  ? 'bg-amber-600 text-white'
                  : 'bg-red-600/90 hover:bg-red-600 text-white shadow-red-600/30'
              }`}
              title="Emergency SOS Panic"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSosActive ? 'SOS Active' : activeCountry === 'NAMIBIA' ? 'SOS (10111)' : 'SOS (991)'}</span>
              <span className="sm:hidden">SOS</span>
            </button>

            {/* Device Mode Switcher for Phone Testing (Responsive vs iPhone vs Android) */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeviceMode('responsive')}
                className={`p-1.5 rounded-lg transition ${
                  deviceMode === 'responsive' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Responsive Fullscreen View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('iphone')}
                className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  deviceMode === 'iphone' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Simulate iPhone 16 Pro (iOS view with Dynamic Island & Home Bar)"
              >
                <span>iPhone</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('android')}
                className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  deviceMode === 'android' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Simulate Android Pixel 9 (Material Design view with Punch Hole & Gesture Bar)"
              >
                <span>Android</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-20 md:pb-6">
        {/* CASE 1: iPHONE SIMULATOR FRAME */}
        {deviceMode === 'iphone' && (
          <div className="py-4 flex justify-center animate-in zoom-in-95 duration-200">
            <div className="w-[393px] min-h-[820px] bg-slate-950 border-[10px] border-slate-800 rounded-[52px] shadow-2xl overflow-hidden relative flex flex-col ring-1 ring-slate-700/50">
              {/* iPhone Dynamic Island */}
              <div className="pt-3 px-6 pb-2 bg-slate-950 flex items-center justify-between text-[11px] text-white font-semibold select-none border-b border-slate-900">
                <span className="font-mono">9:41</span>
                {/* Dynamic Island Pill */}
                <div className="w-24 h-5 bg-black rounded-full border border-slate-800 flex items-center justify-center gap-2 px-2 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-slate-800" />
                  <span className="w-2 h-2 rounded-full bg-cyan-500/60 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <div className="w-4 h-2.5 border border-slate-300 rounded-sm p-0.5 flex items-center">
                    <div className="w-full h-full bg-emerald-400 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* iPhone Content Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-4 bg-slate-950">
                {renderAppContent(true)}
              </div>

              {/* iPhone Bottom Home Indicator Bar */}
              <div className="py-2 bg-slate-950/90 backdrop-blur-md border-t border-slate-900 flex justify-center">
                <div className="w-32 h-1 bg-slate-400/50 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* CASE 2: ANDROID SIMULATOR FRAME */}
        {deviceMode === 'android' && (
          <div className="py-4 flex justify-center animate-in zoom-in-95 duration-200">
            <div className="w-[412px] min-h-[820px] bg-slate-950 border-[10px] border-slate-800 rounded-[44px] shadow-2xl overflow-hidden relative flex flex-col ring-1 ring-slate-700/50">
              {/* Android Status Bar with Punch-hole camera */}
              <div className="pt-2 px-5 pb-2 bg-slate-950 flex items-center justify-between text-[11px] text-white font-medium select-none border-b border-slate-900">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="font-mono">10:00</span>
                  <span className="text-[10px] text-emerald-400 font-bold">5G</span>
                </div>
                {/* Punch-hole Camera */}
                <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-800 shadow-inner" />
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Wifi className="w-3 h-3" />
                  <span className="text-[10px] font-mono">98%</span>
                  <Battery className="w-3 h-3 text-emerald-400" />
                </div>
              </div>

              {/* Android Content Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-4 bg-slate-950">
                {renderAppContent(true)}
              </div>

              {/* Android Gesture Navigation Bar */}
              <div className="py-2.5 bg-slate-950/90 backdrop-blur-md border-t border-slate-900 flex justify-center">
                <div className="w-20 h-1 bg-slate-400/40 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* CASE 3: RESPONSIVE WEB VIEW (FULL SCREEN / DESKTOP / REAL MOBILE PHONE) */}
        {deviceMode === 'responsive' && renderAppContent(false)}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on mobile screens or when using phone interface) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex items-center justify-around text-[11px] font-bold md:hidden pb-safe">
        <button
          type="button"
          onClick={() => {
            setActiveMode('passenger');
            setActingRole('passenger');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeMode === 'passenger' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span>Rides</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMode('driver');
            setActingRole('driver');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeMode === 'driver' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Car className="w-5 h-5" />
          <span>Driver</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('sms')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeMode === 'sms' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>SMS Gateway</span>
        </button>

        <button
          type="button"
          onClick={() => setIsEarningsModalOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-emerald-300 hover:text-emerald-200 transition"
        >
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>Earnings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMode('admin');
            setActingRole('admin');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeMode === 'admin' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Admin</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            currentUser ? 'text-emerald-400 bg-emerald-500/10' : 'text-cyan-400 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span>{currentUser ? 'Account' : 'Sign In'}</span>
        </button>
      </nav>

      {/* ALL APPLICATION MODALS WRAPPED IN ERROR BOUNDARIES TO GUARANTEE ZERO CRASHES */}

      {/* Driver Partner Earnings Statement & Report Modal */}
      <ErrorBoundary fallbackTitle="Driver Earnings Statement Temporarily Unavailable">
        <DriverEarningsReportModal
          isOpen={isEarningsModalOpen}
          onClose={() => setIsEarningsModalOpen(false)}
          driver={activeDriver}
          rides={allRidesList}
          currency={currentCountryConf.currency}
        />
      </ErrorBoundary>

      {/* Unified Ride & 90/10 Financial Settlement Logs Modal */}
      <ErrorBoundary fallbackTitle="Ride Activity & Financial Dispatch Logs">
        <RideLogsModal
          isOpen={isLogsModalOpen}
          onClose={() => setIsLogsModalOpen(false)}
          rides={allRidesList}
          onOpenEarningsReport={() => setIsEarningsModalOpen(true)}
        />
      </ErrorBoundary>

      {/* Multi-Country Tester & config.js Engine Modal */}
      <ErrorBoundary fallbackTitle="Multi-Country Testing Console">
        <MultiCountryTesterModal
          isOpen={isMultiCountryModalOpen}
          onClose={() => setIsMultiCountryModalOpen(false)}
          activeCountry={activeCountry}
          onSelectCountry={handleSelectCountry}
        />
      </ErrorBoundary>

      {/* Safety Hub Modal */}
      <ErrorBoundary fallbackTitle="Safety & Emergency Hub">
        <SafetyHubModal
          isOpen={isSafetyModalOpen}
          onClose={() => setIsSafetyModalOpen(false)}
          trustedContacts={trustedContacts}
          onUpdateTrustedContacts={(contacts) => setTrustedContacts(contacts)}
          documents={userDocs}
          onUploadDocument={(doc) => setUserDocs((prev) => [...prev, doc])}
          smsHistory={smsLogs}
          onTriggerSos={handleTriggerSos}
          isSosActive={isSosActive}
          currentDriver={currentRide?.driver}
        />
      </ErrorBoundary>

      {/* Loyalty Hub Modal */}
      <ErrorBoundary fallbackTitle="Loyalty Hub">
        <LoyaltyHubModal
          isOpen={isLoyaltyModalOpen}
          onClose={() => setIsLoyaltyModalOpen(false)}
          loyalty={loyalty}
          onRedeemVoucher={handleRedeemVoucher}
        />
      </ErrorBoundary>

      {/* Tax Invoice Modal */}
      {currentRide && (
        <ErrorBoundary fallbackTitle="Tax Invoice">
          <ZraTaxInvoiceModal
            isOpen={isTaxInvoiceOpen}
            onClose={() => setIsTaxInvoiceOpen(false)}
            ride={currentRide}
          />
        </ErrorBoundary>
      )}

      {/* Offline Turn-by-Turn Map Modal */}
      <ErrorBoundary fallbackTitle="Offline Turn-by-Turn Navigation">
        <OfflineNavModal
          isOpen={isOfflineNavOpen}
          onClose={() => setIsOfflineNavOpen(false)}
        />
      </ErrorBoundary>

      {/* In-App Direct Calling Modal */}
      {callModalData && (
        <ErrorBoundary fallbackTitle="In-App Voice Dispatch">
          <InAppCallModal
            isOpen={callModalData.isOpen}
            onClose={() => setCallModalData(null)}
            callerName={callModalData.callerName}
            callerRole={callModalData.callerRole}
            recipientName={callModalData.recipientName}
            recipientPhone={callModalData.recipientPhone}
          />
        </ErrorBoundary>
      )}

      {/* Firebase Authentication & User Profile Modal */}
      <ErrorBoundary fallbackTitle="Firebase Authentication & Phone Login">
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          activeCountry={activeCountry}
          currentUser={currentUser}
          onAuthSuccess={(profile) => {
            setCurrentUser(profile);
            setActiveCountry(profile.country);
            if (profile.role === 'admin') {
              setActiveMode('admin');
              setActingRole('admin');
            } else if (profile.role === 'driver') {
              setActiveMode('driver');
              setActingRole('driver');
            } else {
              setActiveMode('passenger');
              setActingRole('passenger');
            }
          }}
          onSignOut={async () => {
            await signOutUser();
            setCurrentUser(null);
            setIsAuthModalOpen(false);
          }}
        />
      </ErrorBoundary>
    </div>
  );
}
