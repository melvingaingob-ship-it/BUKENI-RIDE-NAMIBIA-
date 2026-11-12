import React, { useState } from 'react';
import {
  X,
  Globe2,
  Smartphone,
  Send,
  CheckCircle2,
  Sparkles,
  Radio,
  Copy,
  Check,
  Code2,
  ShieldCheck,
  Zap,
  RefreshCw,
  MessageSquare,
  Building2,
  Cpu
} from 'lucide-react';
import { COUNTRIES, CountryKey, detectMobileNetwork, LANGUAGE_METADATA } from '../config';

interface MultiCountryTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCountry: CountryKey;
  onSelectCountry: (country: CountryKey) => void;
}

export const MultiCountryTesterModal: React.FC<MultiCountryTesterModalProps> = ({
  isOpen,
  onClose,
  activeCountry,
  onSelectCountry,
}) => {
  const [tab, setTab] = useState<'overview' | 'sms_simulator' | 'nlp_tester' | 'network_validator' | 'config_code'>('overview');

  // SMS Simulator state
  const [smsTestCountry, setSmsTestCountry] = useState<CountryKey>(activeCountry);
  const [smsRecipient, setSmsRecipient] = useState<string>(activeCountry === 'NAMIBIA' ? '+264 81 294 8812' : '+260 97 744 1920');
  const [smsMessage, setSmsMessage] = useState<string>(
    activeCountry === 'NAMIBIA'
      ? '[BUKENIRIDE] Your ride to Maerua Mall is confirmed. Driver Johannes is 3 mins away in Toyota Corolla (N 184-920 W). Shortcode: 45645'
      : '[BUKENIRIDE] Your ride to East Park Mall is confirmed. Driver Mwamba is 3 mins away in Toyota Axio (BAA 4521 ZM). Shortcode: 23445'
  );
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsDispatchResult, setSmsDispatchResult] = useState<any>(null);

  // NLP Tester state
  const [nlpCountry, setNlpCountry] = useState<CountryKey>(activeCountry);
  const [nlpLanguage, setNlpLanguage] = useState<string>(activeCountry === 'NAMIBIA' ? 'en' : 'en');
  const [nlpInputText, setNlpInputText] = useState<string>(
    activeCountry === 'NAMIBIA'
      ? 'RIDE from Maerua Mall to Hosea Kutako Airport comfort'
      : 'RIDE from East Park Mall to KKIA Airport comfort'
  );
  const [isTestingNlp, setIsTestingNlp] = useState(false);
  const [nlpResult, setNlpResult] = useState<any>(null);

  // Network Validator state
  const [validatePhone, setValidatePhone] = useState<string>('+264 81 445 9012');
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!isOpen) return null;

  const currentConf = COUNTRIES[activeCountry];

  // Quick switch country in modal
  const handleCountryChange = (c: CountryKey) => {
    onSelectCountry(c);
    setSmsTestCountry(c);
    setNlpCountry(c);
    if (c === 'NAMIBIA') {
      setSmsRecipient('+264 81 294 8812');
      setSmsMessage('[BUKENIRIDE] Test SMS via Africa\'s Talking Namibia gateway (Shortcode: 45645). Fare NAD 85.00.');
      setNlpInputText('RIDE from Maerua Mall to The Grove Mall');
      setValidatePhone('+264 81 445 9012');
    } else {
      setSmsRecipient('+260 97 744 1920');
      setSmsMessage('[BUKENIRIDE] Test SMS via Africa\'s Talking Zambia gateway (Shortcode: 23445). Fare ZMW 65.00.');
      setNlpInputText('RIDE from East Park Mall to Cairo Road CBD');
      setValidatePhone('+260 97 882 1100');
    }
  };

  // Run SMS dispatch test via API
  const handleSendTestSms = async () => {
    setIsSendingSms(true);
    setSmsDispatchResult(null);
    try {
      const res = await fetch('/api/sms-dispatch-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: smsRecipient,
          messageText: smsMessage,
          country: smsTestCountry,
          network: detectMobileNetwork(smsRecipient, smsTestCountry),
        }),
      });
      const data = await res.json();
      setSmsDispatchResult(data);
    } catch (err: any) {
      setSmsDispatchResult({ error: err.message });
    } finally {
      setIsSendingSms(false);
    }
  };

  // Run NLP interpretation test via API
  const handleTestNlp = async () => {
    setIsTestingNlp(true);
    setNlpResult(null);
    try {
      const res = await fetch('/api/sms-interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smsText: nlpInputText,
          senderPhone: smsRecipient,
          country: nlpCountry,
          language: nlpLanguage,
        }),
      });
      const data = await res.json();
      setNlpResult(data);
    } catch (err: any) {
      setNlpResult({ error: err.message });
    } finally {
      setIsTestingNlp(false);
    }
  };

  const detectedNetwork = detectMobileNetwork(validatePhone, validatePhone.startsWith('+264') ? 'NAMIBIA' : 'ZAMBIA');

  const configString = `// config.js - BUKENIRIDE Multi-country
const COUNTRIES = {
  NAMIBIA: {
    code: 'NA',
    currency: 'NAD',
    prefix: '+264',
    sms_provider: 'africastalking',
    shortcode: '45645', // shared for testing, later your own e.g. 15555
    sender_id: 'BUKENIRIDE',
    networks: ['MTC', 'TN Mobile'],
    sms_cost: 0.35,
    google_maps_region: 'na',
    languages: ['en', 'af']
  },
  ZAMBIA: {
    code: 'ZM',
    currency: 'ZMW',
    prefix: '+260',
    sms_provider: 'africastalking', // same provider, different country flag
    shortcode: '23445', // Zambia shared, later dedicated e.g. 4477
    sender_id: 'BUKENIRIDE',
    networks: ['MTN', 'Airtel', 'Zamtel'],
    sms_cost: 0.35,
    google_maps_region: 'zm',
    languages: ['en', 'bem', 'nya']
  }
};`;

  const copyConfigToClipboard = () => {
    navigator.clipboard.writeText(configString);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">BUKENIRIDE Multi-Country Testing Console</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  config.js Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Test Namibia 🇳🇦 &amp; Zambia 🇿🇲 gateways, Africa&apos;s Talking SMS, shortcodes, and carrier routing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Country Switcher in header */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleCountryChange('NAMIBIA')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCountry === 'NAMIBIA'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇳🇦</span>
                <span>Namibia</span>
              </button>
              <button
                type="button"
                onClick={() => handleCountryChange('ZAMBIA')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCountry === 'ZAMBIA'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇿🇲</span>
                <span>Zambia</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Country Matrix & Switcher', icon: Globe2 },
            { id: 'sms_simulator', label: "Africa's Talking SMS Dispatch", icon: Smartphone },
            { id: 'nlp_tester', label: 'Multi-Lingual SMS Parser', icon: MessageSquare },
            { id: 'network_validator', label: 'Carrier Network Detector', icon: Radio },
            { id: 'config_code', label: 'config.js Definition', icon: Code2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as any)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 whitespace-nowrap transition ${
                  tab === item.id
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW & COUNTRY MATRIX */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Namibia Card */}
                <div
                  className={`p-5 rounded-2xl border transition relative ${
                    activeCountry === 'NAMIBIA'
                      ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xl shadow-cyan-950/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🇳🇦</span>
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          Namibia (Windhoek Hub)
                          {activeCountry === 'NAMIBIA' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500 text-slate-950 font-black">
                              ACTIVE APP CONTEXT
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400">Code: NA • Prefix: +264</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCountryChange('NAMIBIA')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        activeCountry === 'NAMIBIA'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {activeCountry === 'NAMIBIA' ? 'Selected' : 'Switch to Namibia'}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Currency</span>
                      <strong className="text-cyan-400 font-mono text-sm">NAD (N$)</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">SMS Shortcode</span>
                      <strong className="text-white font-mono text-sm">45645 (Testing)</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">SMS Provider</span>
                      <strong className="text-emerald-400 font-mono text-sm">Africa&apos;s Talking</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">SMS Cost</span>
                      <strong className="text-amber-400 font-mono text-sm">0.35 NAD</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Mobile Networks</span>
                      <strong className="text-slate-200 font-mono text-xs">MTC, TN Mobile</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Tax Compliance</span>
                      <strong className="text-slate-200 font-mono text-xs">NAMRA 15% VAT</strong>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Languages: English (en), Afrikaans (af)</span>
                    <span className="font-mono">Maps: na</span>
                  </div>
                </div>

                {/* Zambia Card */}
                <div
                  className={`p-5 rounded-2xl border transition relative ${
                    activeCountry === 'ZAMBIA'
                      ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-950/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🇿🇲</span>
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          Zambia (Lusaka Hub)
                          {activeCountry === 'ZAMBIA' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-black">
                              ACTIVE APP CONTEXT
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400">Code: ZM • Prefix: +260</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCountryChange('ZAMBIA')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        activeCountry === 'ZAMBIA'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {activeCountry === 'ZAMBIA' ? 'Selected' : 'Switch to Zambia'}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Currency</span>
                      <strong className="text-emerald-400 font-mono text-sm">ZMW (K)</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">SMS Shortcode</span>
                      <strong className="text-white font-mono text-sm">23445 (Shared)</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">SMS Provider</span>
                      <strong className="text-emerald-400 font-mono text-sm">Africa&apos;s Talking</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">SMS Cost</span>
                      <strong className="text-amber-400 font-mono text-sm">0.35 ZMW</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Mobile Networks</span>
                      <strong className="text-slate-200 font-mono text-xs">MTN, Airtel, Zamtel</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Tax Compliance</span>
                      <strong className="text-slate-200 font-mono text-xs">ZRA 16% VAT</strong>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Languages: English (en), Bemba (bem), Nyanja (nya)</span>
                    <span className="font-mono">Maps: zm</span>
                  </div>
                </div>
              </div>

              {/* Real-time Status Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Active System Environment: {currentConf.name} ({currentConf.currency})</h4>
                    <p className="text-[11px] text-slate-400">
                      Shortcode {currentConf.shortcode} • Sender ID &quot;{currentConf.sender_id}&quot; • Africa&apos;s Talking Multi-Country Webhook active
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('sms_simulator')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Test SMS Dispatch</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AFRICA'S TALKING SMS DISPATCH TESTER (ZAMBIA ONLY - NAMIBIA TESTING REMOVED) */}
          {tab === 'sms_simulator' && (
            <div className="space-y-5">
              {/* Notice that Namibia testing for SMS is removed */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Namibia SMS Testing Status:</strong> SMS testing for Namibia has been removed per system specification. All automated SMS dispatch testing is focused exclusively on Zambia Africa&apos;s Talking (+260, Shortcode: 23445).
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 font-mono text-[10px] font-bold">
                  NA SMS REMOVED
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Africa&apos;s Talking Zambia SMS Dispatch Sandbox
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Gateway Target:</span>
                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-xs text-emerald-400 rounded-lg font-bold">
                      🇿🇲 Zambia (Shortcode: 23445)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                      Recipient Mobile Number (+260)
                    </label>
                    <input
                      type="text"
                      value={smsRecipient}
                      onChange={(e) => setSmsRecipient(e.target.value)}
                      placeholder="+260 97..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 outline-none"
                    />
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <Radio className="w-3 h-3" />
                      <span>Carrier: {detectMobileNetwork(smsRecipient, 'ZAMBIA')} (Zambia)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                      SMS Provider / Sender Details
                    </label>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs flex justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Sender ID</span>
                        <strong className="text-white font-mono">{COUNTRIES.ZAMBIA.sender_id}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Shortcode</span>
                        <strong className="text-cyan-400 font-mono">{COUNTRIES.ZAMBIA.shortcode}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tariff Cost</span>
                        <strong className="text-amber-400 font-mono">ZMW {COUNTRIES.ZAMBIA.sms_cost}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Message Body (Africa&apos;s Talking Payload)
                  </label>
                  <textarea
                    rows={3}
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-sans focus:border-cyan-500 outline-none"
                  />
                </div>

                {/* Quick Templates */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Presets:</span>
                  {[
                    {
                      label: 'Ride Confirmed',
                      text: `[BUKENIRIDE] Ride ref: BK-${COUNTRIES[smsTestCountry].code}-8192 confirmed! Driver on way. Live map: bukeni.${COUNTRIES[smsTestCountry].google_maps_region}/t/8192`,
                    },
                    {
                      label: 'Driver Arrived',
                      text: `[BUKENIRIDE] Driver has arrived at pickup point in ${COUNTRIES[smsTestCountry].name}. Please meet vehicle.`,
                    },
                    {
                      label: 'SOS Alert',
                      text: `[EMERGENCY-SOS] BukeniRide safety alert: Passenger triggered emergency beacon. Shortcode: ${COUNTRIES[smsTestCountry].shortcode}.`,
                    },
                  ].map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => setSmsMessage(tpl.text)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSendTestSms}
                    disabled={isSendingSms || !smsMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {isSendingSms ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Dispatch Test SMS via Africa&apos;s Talking</span>
                  </button>
                </div>
              </div>

              {/* Results display */}
              {smsDispatchResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Africa&apos;s Talking API Response (HTTP 101 - Sent)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Message ID: {smsDispatchResult.messageId}
                    </span>
                  </div>

                  <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                    {JSON.stringify(smsDispatchResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MULTI-LINGUAL NLP TESTER */}
          {tab === 'nlp_tester' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Multi-Lingual Inbound SMS Parser (Shortcode Engine)
                  </h4>
                  <div className="flex items-center gap-2">
                    <select
                      value={nlpCountry}
                      onChange={(e) => {
                        const c = e.target.value as CountryKey;
                        setNlpCountry(c);
                        setNlpLanguage(COUNTRIES[c].languages[0]);
                      }}
                      className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2 py-1 outline-none font-bold"
                    >
                      <option value="NAMIBIA">Namibia (English / Afrikaans)</option>
                      <option value="ZAMBIA">Zambia (English / Bemba / Nyanja)</option>
                    </select>

                    <select
                      value={nlpLanguage}
                      onChange={(e) => setNlpLanguage(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-xs text-emerald-400 rounded-lg px-2 py-1 outline-none font-bold"
                    >
                      {COUNTRIES[nlpCountry].languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {LANGUAGE_METADATA[lang]?.label || lang.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Simulate Inbound SMS Message to Shortcode {COUNTRIES[nlpCountry].shortcode}
                  </label>
                  <input
                    type="text"
                    value={nlpInputText}
                    onChange={(e) => setNlpInputText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-sans focus:border-emerald-500 outline-none"
                    placeholder="Enter natural booking SMS..."
                  />
                </div>

                {/* Sample Phrases */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Sample Messages:</span>
                  {nlpCountry === 'NAMIBIA' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setNlpLanguage('af');
                          setNlpInputText('Bespreek \'n rit van Maerua Mall na The Grove Mall asseblief');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        [Afrikaans] Maerua na Grove Mall
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNlpLanguage('en');
                          setNlpInputText('RIDE from Hosea Kutako Airport to Independence Ave CBD');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        [English] Airport to CBD
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNlpLanguage('af');
                          setNlpInputText('Comfort taxi van UNAM na Katutura Soweto mark');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        [Afrikaans] UNAM na Katutura
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setNlpLanguage('bem');
                          setNlpInputText('Ndefwaya motoka ukufuma East Park Mall ukuya KKIA Airport');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        [Bemba] East Park ukuya KKIA
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNlpLanguage('nya');
                          setNlpInputText('Ndifuna galimoto kuchoka Cairo Road kuya Arcades Mall');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        [Nyanja] Cairo Rd kuya Arcades
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNlpLanguage('en');
                          setNlpInputText('Book boda from Woodlands Stadium to Manda Hill');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        [English] Woodlands to Manda Hill
                      </button>
                    </>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleTestNlp}
                    disabled={isTestingNlp || !nlpInputText.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {isTestingNlp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    <span>Parse SMS &amp; Generate Reply</span>
                  </button>
                </div>
              </div>

              {nlpResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Parser Extraction &amp; SMS Reply
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      Country: {nlpResult.country} • Currency: {nlpResult.currency}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Pickup</span>
                      <strong className="text-white">{nlpResult.parsed?.pickup}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Destination</span>
                      <strong className="text-white">{nlpResult.parsed?.destination}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Estimated Fare</span>
                      <strong className="text-emerald-400 font-mono">
                        {nlpResult.currency} {nlpResult.fareLocal}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Tax</span>
                      <strong className="text-amber-400 font-mono">{nlpResult.vatLabel}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400 text-[10px] block font-mono uppercase mb-1">
                      Automated Inbound Reply:
                    </span>
                    <p className="text-white font-mono text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      {nlpResult.replySms}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CARRIER NETWORK & PHONE VALIDATOR */}
          {tab === 'network_validator' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Telecom Prefix &amp; Network Carrier Lookup
                </h4>
                <p className="text-xs text-slate-400">
                  Test mobile number detection across southern African telecom ranges (MTC / TN Mobile for Namibia; Airtel / MTN / Zamtel for Zambia).
                </p>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Enter Test Mobile Number (with international prefix)
                  </label>
                  <input
                    type="text"
                    value={validatePhone}
                    onChange={(e) => setValidatePhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                    placeholder="+264 81... or +260 97..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Identified Country</span>
                    <strong className="text-base text-white flex items-center gap-2 mt-1">
                      {validatePhone.startsWith('+264') ? '🇳🇦 Namibia' : validatePhone.startsWith('+260') ? '🇿🇲 Zambia' : 'Unknown / Cross-Border'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Detected Carrier</span>
                    <strong className="text-base text-cyan-400 font-mono mt-1 block">
                      {detectedNetwork}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Shortcode</span>
                    <strong className="text-base text-emerald-400 font-mono mt-1 block">
                      {validatePhone.startsWith('+264') ? '45645' : '23445'}
                    </strong>
                  </div>
                </div>

                {/* Quick Examples */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Quick Test Numbers:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { phone: '+264 81 294 8812', label: '🇳🇦 MTC Namibia (+264 81)' },
                      { phone: '+264 85 410 7731', label: '🇳🇦 TN Mobile Namibia (+264 85)' },
                      { phone: '+260 97 744 1920', label: '🇿🇲 Airtel Zambia (+260 97)' },
                      { phone: '+260 96 812 5590', label: '🇿🇲 MTN Zambia (+260 96)' },
                      { phone: '+260 95 621 0045', label: '🇿🇲 Zamtel (+260 95)' },
                    ].map((item) => (
                      <button
                        key={item.phone}
                        type="button"
                        onClick={() => setValidatePhone(item.phone)}
                        className="text-xs px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONFIG.JS CODE & EXPORT */}
          {tab === 'config_code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">config.js - BUKENIRIDE Multi-country</h4>
                  <p className="text-[11px] text-slate-400">Exact JavaScript configuration specification used across client and server</p>
                </div>
                <button
                  type="button"
                  onClick={copyConfigToClipboard}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedConfig ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                {configString}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>BukeniRide Multi-Country Engine: Namibia &amp; Zambia Ready</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Done Testing
          </button>
        </div>
      </div>
    </div>
  );
};
