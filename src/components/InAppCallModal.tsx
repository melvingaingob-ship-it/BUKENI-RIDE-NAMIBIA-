import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageSquare, Shield, Clock } from 'lucide-react';

interface InAppCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerRole: 'driver' | 'passenger';
  callerName: string;
  recipientName: string;
  recipientPhone: string;
  rideRef?: string;
  onLogCallEvent?: (durationSeconds: number) => void;
}

export const InAppCallModal: React.FC<InAppCallModalProps> = ({
  isOpen,
  onClose,
  callerRole,
  callerName,
  recipientName,
  recipientPhone,
  rideRef,
  onLogCallEvent,
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setCallStatus('ringing');
      setCallSeconds(0);
      setIsMuted(false);
      return;
    }

    // Simulate connection after 2 seconds
    const ringTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 2200);

    return () => clearTimeout(ringTimer);
  }, [isOpen]);

  useEffect(() => {
    if (callStatus !== 'connected') return;

    const interval = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus]);

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    if (onLogCallEvent) {
      onLogCallEvent(callSeconds);
    }
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

        {/* Top security tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-semibold text-emerald-400 border border-slate-700 mb-6">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>Encrypted In-App VoIP Call • {rideRef || 'BukeniRide'}</span>
        </div>

        {/* Profile Avatar Pulse */}
        <div className="relative mb-4">
          {callStatus === 'ringing' && (
            <div className="absolute -inset-3 rounded-full border-2 border-emerald-500/40 animate-ping" />
          )}
          <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-emerald-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-emerald-500/20">
            {recipientName.charAt(0)}
          </div>
        </div>

        {/* Recipient Details */}
        <h3 className="text-xl font-bold text-white tracking-tight">{recipientName}</h3>
        <p className="text-xs text-slate-400 font-mono mt-1">{recipientPhone}</p>
        <span className="text-[11px] font-medium text-emerald-400/90 mt-1">
          {callerRole === 'driver' ? 'Passenger / Client' : 'Assigned Driver Partner'}
        </span>

        {/* Status / Timer */}
        <div className="mt-4 mb-6">
          {callStatus === 'ringing' && (
            <span className="text-xs text-slate-400 animate-pulse font-medium">
              Connecting via Airtel / MTN Zambia gateway...
            </span>
          )}
          {callStatus === 'connected' && (
            <div className="flex items-center gap-1.5 text-base font-mono font-bold text-white bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{formatTimer(callSeconds)}</span>
            </div>
          )}
          {callStatus === 'ended' && (
            <span className="text-xs text-rose-400 font-bold">Call Ended</span>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-5 w-full mb-6">
          {/* Mute Button */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition border ${
              isMuted
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            className="w-16 h-16 rounded-3xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95"
            title="Hang up call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* Speaker Button */}
          <button
            type="button"
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition border ${
              isSpeaker
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isSpeaker ? 'Speaker On' : 'Ear Speaker'}
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Fallback Native Call Option */}
        <div className="w-full pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Need GSM cellular dialer?</span>
          <a
            href={`tel:${recipientPhone}`}
            className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Open Phone App</span>
          </a>
        </div>
      </div>
    </div>
  );
};
