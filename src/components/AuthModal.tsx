import React, { useState } from 'react';
import {
  X,
  Phone,
  Shield,
  User,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Smartphone,
  Globe2,
  RefreshCw,
  Car,
  KeyRound
} from 'lucide-react';
import { CountryKey, UserRole, UserProfile } from '../types';
import { COUNTRIES, detectMobileNetwork } from '../config';
import { authenticateWithPhone } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCountry: CountryKey;
  onAuthSuccess: (profile: UserProfile) => void;
  currentUser?: UserProfile | null;
  onSignOut?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  activeCountry,
  onAuthSuccess,
  currentUser,
  onSignOut,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryKey>(activeCountry);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [nationalNumber, setNationalNumber] = useState(
    activeCountry === 'NAMIBIA' ? '81 294 8812' : '97 744 1920'
  );
  const [displayName, setDisplayName] = useState(
    activeCountry === 'NAMIBIA' ? 'Elifas Nghikembua' : 'Chileshe Mulenga'
  );
  const [role, setRole] = useState<UserRole>('passenger');
  const [pin, setPin] = useState('1234');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const countryConf = COUNTRIES[selectedCountry];
  const detectedCarrier = detectMobileNetwork(
    `${countryConf.prefix} ${nationalNumber}`,
    selectedCountry
  );

  const handleCountrySwitch = (c: CountryKey) => {
    setSelectedCountry(c);
    setErrorMessage(null);
    if (c === 'NAMIBIA') {
      setNationalNumber('81 294 8812');
      if (!isRegisterMode) setDisplayName('Elifas Nghikembua');
    } else {
      setNationalNumber('97 744 1920');
      if (!isRegisterMode) setDisplayName('Chileshe Mulenga');
    }
  };

  const handleQuickDemo = (c: CountryKey, phone: string, name: string, userRole: UserRole) => {
    setSelectedCountry(c);
    setNationalNumber(phone);
    setDisplayName(name);
    setRole(userRole);
    setPin('1234');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalNumber.trim()) {
      setErrorMessage('Please enter your mobile phone number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const profile = await authenticateWithPhone({
        country: selectedCountry,
        countryCode: countryConf.prefix,
        nationalNumber,
        displayName: displayName.trim(),
        role,
        pin,
      });

      setSuccessMessage(`Authenticated as ${profile.displayName} (${profile.phoneNumber})!`);
      setTimeout(() => {
        onAuthSuccess(profile);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {currentUser ? 'Active Firebase Account' : isRegisterMode ? 'Register Phone Account' : 'Sign In with Mobile'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Firebase Auth
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Persistent sessions across browser reloads &amp; devices
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

        {/* CURRENT USER STATUS CARD (If already signed in) */}
        {currentUser && (
          <div className="p-4 bg-emerald-950/20 border-b border-emerald-800/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-sm">
                {currentUser.displayName?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-sm">{currentUser.displayName}</span>
                  <span className="text-xs">{currentUser.country === 'NAMIBIA' ? '🇳🇦' : '🇿🇲'}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-slate-400 font-mono text-[11px]">{currentUser.phoneNumber}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSignOut) onSignOut();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
            >
              Sign Out
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-200">
          {/* Country Selection Pills */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              1. Select Country Code
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCountrySwitch('NAMIBIA')}
                className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                  selectedCountry === 'NAMIBIA'
                    ? 'bg-cyan-500/15 border-cyan-500/80 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇳🇦</span>
                  <div className="text-left">
                    <strong className="block text-white text-xs">Namibia</strong>
                    <span className="text-[10px] font-mono text-cyan-400">+264 (Windhoek)</span>
                  </div>
                </div>
                {selectedCountry === 'NAMIBIA' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleCountrySwitch('ZAMBIA')}
                className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                  selectedCountry === 'ZAMBIA'
                    ? 'bg-emerald-500/15 border-emerald-500/80 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇿🇲</span>
                  <div className="text-left">
                    <strong className="block text-white text-xs">Zambia</strong>
                    <span className="text-[10px] font-mono text-emerald-400">+260 (Lusaka)</span>
                  </div>
                </div>
                {selectedCountry === 'ZAMBIA' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Mobile Number Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                2. Mobile Phone Number
              </label>
              <span className="text-[10px] font-mono text-emerald-400">
                Carrier: {detectedCarrier}
              </span>
            </div>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden focus-within:border-emerald-500 transition">
              <span className="px-3.5 py-2.5 bg-slate-900 border-r border-slate-800 text-slate-300 font-mono font-bold text-xs select-none">
                {countryConf.prefix}
              </span>
              <input
                type="tel"
                value={nationalNumber}
                onChange={(e) => setNationalNumber(e.target.value)}
                placeholder={selectedCountry === 'NAMIBIA' ? '81 294 8812' : '97 744 1920'}
                className="w-full bg-transparent px-3 py-2.5 text-sm font-mono text-white placeholder-slate-600 outline-none"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Full identifier: <strong className="text-slate-300 font-mono">{countryConf.prefix} {nationalNumber}</strong>
            </p>
          </div>

          {/* Name & Role (Always visible or in register mode) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Display Name
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-white">
                <User className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-transparent outline-none text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-white outline-none cursor-pointer font-bold focus:border-emerald-500"
              >
                <option value="passenger">Passenger / Rider</option>
                <option value="driver">Driver Partner (90% Keeps)</option>
                <option value="admin">Fleet Admin Officer</option>
              </select>
            </div>
          </div>

          {/* 4-Digit Security PIN */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Security PIN / Passcode
              </label>
              <span className="text-[10px] text-slate-500">Default test PIN: 1234</span>
            </div>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-white">
              <KeyRound className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4-digit PIN"
                className="w-full bg-transparent outline-none text-xs text-white font-mono tracking-widest"
              />
            </div>
          </div>

          {/* Error & Success Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to Firebase Auth...</span>
                </>
              ) : (
                <>
                  <span>Sign In &amp; Sync Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Test Profiles for Developers/Testers */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">
              1-Click Demo Testing Credentials:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickDemo('NAMIBIA', '81 294 8812', 'Elifas Nghikembua', 'passenger')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left transition"
              >
                <span className="text-cyan-400 font-bold block">🇳🇦 Namibia Rider</span>
                <span className="text-slate-400 text-[10px] font-mono">+264 81 294 8812</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('NAMIBIA', '81 832 9901', 'Johannes Shivute', 'driver')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left transition"
              >
                <span className="text-cyan-400 font-bold block">🇳🇦 Namibia Driver</span>
                <span className="text-slate-400 text-[10px] font-mono">+264 81 832 9901</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ZAMBIA', '97 744 1920', 'Chileshe Mulenga', 'passenger')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left transition"
              >
                <span className="text-emerald-400 font-bold block">🇿🇲 Zambia Rider</span>
                <span className="text-slate-400 text-[10px] font-mono">+260 97 744 1920</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ZAMBIA', '97 912 3456', 'Mwamba Chilufya', 'driver')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left transition"
              >
                <span className="text-emerald-400 font-bold block">🇿🇲 Zambia Driver</span>
                <span className="text-slate-400 text-[10px] font-mono">+260 97 912 3456</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
