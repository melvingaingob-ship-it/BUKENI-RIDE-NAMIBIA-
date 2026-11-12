import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  Car,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  PhoneCall,
  RefreshCw,
  Zap,
  Radio
} from 'lucide-react';
import { LocationPoint, RideTier, TrustedContact } from '../types';
import { COUNTRIES, detectMobileNetwork } from '../config';

interface SmsBookingGatewayProps {
  onBookRideFromSms: (bookingData: {
    pickupName: string;
    destName: string;
    tier: RideTier;
    fareZMW: number;
    bookingRef: string;
    currency?: string;
  }) => void;
  trustedContacts: TrustedContact[];
}

interface SmsChatBubble {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: string;
  metadata?: {
    bookingRef?: string;
    pickup?: string;
    destination?: string;
    tier?: string;
    fareZMW?: number;
    currency?: string;
    confidence?: number;
    shortcode?: string;
  };
}

export const SmsBookingGateway: React.FC<SmsBookingGatewayProps> = ({
  onBookRideFromSms,
  trustedContacts,
}) => {
  const zambiaConf = COUNTRIES.ZAMBIA;

  const [phoneNumber, setPhoneNumber] = useState('+260 97 744 1920');
  const [inputSms, setInputSms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<SmsChatBubble[]>([
    {
      id: 'sms-welcome-zm',
      sender: 'system',
      text: `Welcome to BukeniRide Zambia SMS Dispatch Gateway powered by Africa's Talking (Shortcode: ${zambiaConf.shortcode}). Text us in English, Bemba, or Nyanja to book an instant ride in Lusaka!`,
      timestamp: 'System Ready',
    },
  ]);

  const quickSamples = [
    'RIDE East Park Mall to KKIA Airport comfort',
    'Ndefwaya motoka ukufuma East Park Mall ukuya KKIA',
    'Ndifuna galimoto kuchoka Cairo Road kuya Arcades Mall',
    'Book Boda from Cairo Road to Arcades Mall',
  ];

  const handleSendSms = async (textToSend?: string) => {
    const text = textToSend || inputSms;
    if (!text.trim() || isLoading) return;

    const userMsgId = 'usr-' + Date.now();
    const newMsg: SmsChatBubble = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputSms('');
    setIsLoading(true);

    try {
      // Call server NLP API strictly for Zambia SMS
      const res = await fetch('/api/sms-interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smsText: text,
          senderPhone: phoneNumber,
          country: 'ZAMBIA',
        }),
      });

      const data = await res.json();

      if (data.success) {
        const sysMsg: SmsChatBubble = {
          id: 'sys-' + Date.now(),
          sender: 'system',
          text: data.replySms,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          metadata: {
            bookingRef: data.bookingRef,
            pickup: data.parsed.pickup,
            destination: data.parsed.destination,
            tier: data.parsed.rideTier,
            fareZMW: data.fareLocal || data.fareZMW,
            currency: 'ZMW',
            confidence: data.parsed.confidence,
            shortcode: data.shortcode || zambiaConf.shortcode,
          },
        };
        setMessages((prev) => [...prev, sysMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: 'sys-err-' + Date.now(),
            sender: 'system',
            text: `[${zambiaConf.sender_id}] We couldn't parse your SMS. Please format as: "RIDE [Pickup] to [Destination]". Shortcode: ${zambiaConf.shortcode}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'sys-net-err-' + Date.now(),
          sender: 'system',
          text: `[${zambiaConf.sender_id}] Network error connecting to Africa's Talking Zambia SMS Gateway. Please retry.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const detectedCarrier = detectMobileNetwork(phoneNumber, 'ZAMBIA');

  return (
    <div className="space-y-4 font-sans text-slate-200">
      {/* Africa's Talking Gateway Banner for Zambia */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Africa&apos;s Talking Zambia SMS Dispatch Gateway
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Shortcode: {zambiaConf.shortcode}
              </span>
              <span className="text-xs">🇿🇲</span>
            </div>
            <p className="text-xs text-slate-400">
              Zero-data automated dispatch for Zambian riders on standard 2G/USSD feature phones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
            Networks: MTN • Airtel • Zamtel
          </span>
        </div>
      </div>

      {/* Simulated Device Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Phone Config & Carrier Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zambia Telecom Diagnostics</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Territory</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <span>🇿🇲</span>
                  <span>Zambia (Lusaka Hub)</span>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">SMS Gateway Provider</span>
                <span className="font-bold text-emerald-400 font-mono">Africa&apos;s Talking</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Dedicated Shortcode</span>
                <strong className="text-white font-mono">{zambiaConf.shortcode}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Sender ID</span>
                <strong className="text-cyan-400 font-mono">{zambiaConf.sender_id}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Standard Tariff</span>
                <strong className="text-amber-400 font-mono">ZMW {zambiaConf.sms_cost}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Supported Carriers</span>
                <span className="font-bold text-slate-300 font-mono text-[11px]">MTN, Airtel, Zamtel</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
              Simulated Zambian Sender Mobile (+260)
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 outline-none"
            />
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Carrier: <strong className="text-emerald-400">{detectedCarrier}</strong></span>
              <span>Region: <strong className="text-slate-200">Lusaka Province</strong></span>
            </div>
          </div>

          {/* Quick Natural SMS Prompts */}
          <div>
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Sample Zambian SMS Messages:
            </h5>
            <div className="space-y-1.5">
              {quickSamples.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendSms(sample)}
                  className="w-full text-left p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-[11px] text-slate-300 hover:text-white transition flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{sample}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Chat / Feature-Phone Screen Simulator */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white font-mono">
                Shortcode {zambiaConf.shortcode} • {zambiaConf.sender_id}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Africa&apos;s Talking Zambia
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* If metadata booking confirmed, show Quick Book button */}
                  {msg.metadata && msg.metadata.bookingRef && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[10px] text-emerald-400 font-mono font-bold">
                        Ref: {msg.metadata.bookingRef} • ZMW {msg.metadata.fareZMW}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (msg.metadata) {
                            onBookRideFromSms({
                              pickupName: msg.metadata.pickup || '',
                              destName: msg.metadata.destination || '',
                              tier: (msg.metadata.tier as RideTier) || 'Bukeni Go',
                              fareZMW: msg.metadata.fareZMW || 75,
                              bookingRef: msg.metadata.bookingRef || 'BK-SMS',
                              currency: 'ZMW',
                            });
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition"
                      >
                        <Car className="w-3 h-3" />
                        <span>Launch Ride In App</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Africa&apos;s Talking NLP Engine is interpreting text for Zambia...</span>
              </div>
            )}
          </div>

          {/* SMS Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendSms();
            }}
            className="mt-3 pt-3 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={inputSms}
              onChange={(e) => setInputSms(e.target.value)}
              placeholder="Text e.g. RIDE East Park Mall to KKIA Airport..."
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputSms.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Send SMS</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
