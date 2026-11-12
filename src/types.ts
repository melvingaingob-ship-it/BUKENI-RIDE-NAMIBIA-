import type { CountryKey } from './config';
export type { CountryKey };

export type UserRole = 'passenger' | 'driver' | 'admin' | 'safety_officer' | 'logistics_partner';

export interface UserProfile {
  uid: string;
  phoneNumber: string; // Full international phone number: +264812345678 or +260971234567
  nationalNumber: string; // Phone without country code
  country: CountryKey; // 'NAMIBIA' | 'ZAMBIA'
  countryCode: string; // '+264' | '+260'
  displayName: string;
  role: UserRole;
  walletBalance: number;
  loyaltyPoints: number;
  createdAt: string;
  lastLoginAt: string;
}

export type CurrencyCode = 'NAD' | 'ZMW' | 'USD' | 'EUR' | 'GBP';

export type PaymentMethodType =
  | 'mtc_money'
  | 'fnb_ewallet'
  | 'mtn_momo'
  | 'airtel_money'
  | 'zamtel_kwacha'
  | 'card'
  | 'cash';

export type RideTier = 'Bukeni Boda' | 'Bukeni Go' | 'Bukeni Comfort' | 'Bukeni Van';

export type RideStatus =
  | 'idle'
  | 'searching'
  | 'driver_assigned'
  | 'driver_arriving'
  | 'in_trip'
  | 'completed'
  | 'cancelled';

export interface LocationPoint {
  name: string;
  address: string;
  lat: number;
  lng: number;
  area: string;
  country?: CountryKey;
}

export interface VerificationDocument {
  id: string;
  type: 'nrc' | 'drivers_license' | 'rtsa_fitness' | 'interpol_clearance' | 'national_id' | 'natis_license' | 'police_conduct';
  title: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'verified' | 'pending' | 'rejected' | 'expired';
  fileUrl?: string;
  fileName?: string;
  rejectionReason?: string;
  country?: CountryKey;
}

export interface TrustedContact {
  id: string;
  name: string;
  phoneNumber: string; // e.g. +264 81X XXX XXX or +260 97X XXX XXX
  relationship: string;
  receiveSmsOnTripStart: boolean;
  receiveSmsOnSos: boolean;
  country?: CountryKey;
}

export interface DriverProfile {
  id: string;
  name: string;
  photoUrl: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string; // Namibian plate e.g. N 12345 W or Zambian e.g. BAA 4521 ZM
  vehicleColor: string;
  vehicleType: RideTier;
  rating: number;
  totalTrips: number;
  acceptanceRate: number;
  nrcNumber: string;
  licenseNumber: string;
  rtsaFitnessExpiry: string;
  interpolCheckClear: boolean;
  isOnline: boolean;
  currentLat: number;
  currentLng: number;
  heading: number;
  speedKmh: number;
  walletBalanceZMW: number;
  walletBalance?: number;
  isVerified?: boolean;
  country?: CountryKey;
}

export interface SafetySmsNotification {
  id: string;
  timestamp: string;
  recipientPhone: string;
  recipientName: string;
  messageText: string;
  driverName: string;
  driverPlate: string;
  liveTrackingUrl: string;
  deliveryStatus: 'delivered' | 'pending' | 'failed';
  network?: string;
  shortcode?: string;
  cost?: number;
  country?: CountryKey;
}

export interface RideRequest {
  id: string;
  bookingRef: string;
  pickup: LocationPoint;
  destination: LocationPoint;
  tier: RideTier;
  status: RideStatus;
  driver?: DriverProfile;
  passengerName: string;
  passengerPhone: string;
  distanceKm: number;
  durationMinutes: number;
  fareZMW: number;
  platformFee10ZMW: number; // 10% BukeniRide platform fee
  driverPayout90ZMW: number; // 90% kept by driver partner
  fareSelectedCurrency: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'pending' | 'escrowed' | 'settled';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  zraVat16ZMW: number;
  netFareZMW: number;
  safetySmsDispatched: SafetySmsNotification[];
  rating?: number;
  review?: string;
  reviewSentiment?: 'Positive' | 'Neutral' | 'Warning' | 'Critical';
  safetyTags?: string[];
  offlineModeUsed?: boolean;
  country?: CountryKey;
  vatRate?: number;
  vatName?: string;
  safetyCheckStatus?: string;
}

export interface AuditActivityLog {
  id: string;
  timestamp: string;
  category: 'ride_request' | 'driver_acceptance' | 'trip_status' | 'call_event' | 'payment_split' | 'arrival' | 'safety';
  rideRef?: string;
  actorRole: 'passenger' | 'driver' | 'admin' | 'system';
  actorName: string;
  action: string;
  details: string;
  pickupName?: string;
  destName?: string;
  fareZMW?: number;
  driverPayout90ZMW?: number;
  platformFee10ZMW?: number;
  country?: CountryKey;
}

export interface DisputeTicket {
  id: string;
  rideRef: string;
  passengerName: string;
  driverName: string;
  issueCategory: 'Fare Discrepancy' | 'Unsafe Driving' | 'Route Deviation' | 'Lost Item' | 'Payment Issue';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  resolution?: string;
  refundAmountZMW?: number;
  country?: CountryKey;
}

export interface NavigationStep {
  instruction: string;
  distanceMeters: number;
  roadName: string;
  action: 'straight' | 'turn_left' | 'turn_right' | 'roundabout' | 'arrive';
}

export interface OfflineRoutePackage {
  routeId: string;
  corridorName: string;
  cachedTimestamp: string;
  dataSizeKb: number;
  isDownloaded: boolean;
  steps: NavigationStep[];
  country?: CountryKey;
}

export interface LoyaltyAccount {
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  lifetimeRides: number;
  totalSavedZMW: number;
  availableVouchers: {
    id: string;
    title: string;
    discountZMW: number;
    requiredPoints: number;
    code: string;
  }[];
}

export interface Logistics3PLShipment {
  id: string;
  trackingNumber: string;
  senderName: string;
  recipientName: string;
  pickupLocation: string;
  deliveryLocation: string;
  serviceType: string;
  weightKg: number;
  status: 'pending' | 'in_transit' | 'delivered';
  feeZMW: number;
  estimatedArrival: string;
}
