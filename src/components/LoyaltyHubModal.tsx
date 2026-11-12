import React from 'react';
import { Award, Zap, Gift, CheckCircle2, ChevronRight, X, Sparkles, Star } from 'lucide-react';
import { LoyaltyAccount } from '../types';

interface LoyaltyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  loyalty: LoyaltyAccount;
  onRedeemVoucher: (voucherId: string) => void;
}

export const LoyaltyHubModal: React.FC<LoyaltyHubModalProps> = ({
  isOpen,
  onClose,
  loyalty,
  onRedeemVoucher,
}) => {
  if (!isOpen) return null;

  const tiers = [
    { name: 'Bronze', minPoints: 0, perk: 'Standard points earning (1 pt / ZMW 1)' },
    { name: 'Silver', minPoints: 500, perk: '5% bonus points + Priority evening dispatch' },
    { name: 'Gold', minPoints: 1500, perk: '10% discount on KKIA Airport rides + zero surge fee' },
    { name: 'Emerald VIP', minPoints: 3000, perk: 'Dedicated 24/7 concierge + Executive Comfort upgrades' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                BukeniPoints &amp; Loyalty Rewards
              </h3>
              <p className="text-xs text-slate-400">Earn points on every trip across Zambia</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-200">
          {/* Main Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Current Balance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">{loyalty.points}</span>
                  <span className="text-sm font-semibold text-emerald-400">Pts</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Member Tier</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {loyalty.tier}
                </span>
              </div>
            </div>

            {/* Progress bar towards next tier */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Progress to Gold Status</span>
                <span>{loyalty.points} / 1500 pts</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (loyalty.points / 1500) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Lifetime Trips</span>
                <strong className="text-white font-mono text-sm">{loyalty.lifetimeRides} rides</strong>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Total Kwacha Saved</span>
                <strong className="text-emerald-400 font-mono text-sm">ZMW {loyalty.totalSavedZMW}</strong>
              </div>
            </div>
          </div>

          {/* Available Redeemable Vouchers */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Redeemable Fare Discount Vouchers</span>
            </h4>

            <div className="space-y-2">
              {loyalty.availableVouchers.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">ZMW {v.discountZMW} OFF</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px]">
                        {v.code}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{v.title}</p>
                  </div>

                  <button
                    type="button"
                    disabled={loyalty.points < v.requiredPoints}
                    onClick={() => onRedeemVoucher(v.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shrink-0"
                  >
                    Use {v.requiredPoints} Pts
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tier breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Bukeni VIP Tier Privileges
            </h4>
            <div className="space-y-1.5">
              {tiers.map((t, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-white">{t.name}</span>
                  <span className="text-[11px] text-slate-400">{t.perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
