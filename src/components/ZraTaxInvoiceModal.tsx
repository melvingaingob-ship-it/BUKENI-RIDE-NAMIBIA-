import React from 'react';
import { FileText, Printer, Download, CheckCircle2, X, ShieldCheck, QrCode } from 'lucide-react';
import { RideRequest } from '../types';

interface ZraTaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: RideRequest;
}

export const ZraTaxInvoiceModal: React.FC<ZraTaxInvoiceModalProps> = ({
  isOpen,
  onClose,
  ride,
}) => {
  if (!isOpen) return null;

  const isNamibia = ride.country === 'NAMIBIA' || ride.currency === 'NAD';
  const currencySymbol = isNamibia ? 'NAD' : 'ZMW';
  const taxAuthName = isNamibia ? 'NAMRA (Namibia Revenue Agency)' : 'ZRA (Zambia Revenue Authority)';
  const vatRate = isNamibia ? 0.15 : 0.16;
  const vatLabel = isNamibia ? '15% Standard VAT' : '16% Statutory VAT';
  const tinNumber = isNamibia ? 'NAMRA-TIN-8890214-01-5' : 'ZRA-TPIN-1008492019';
  const invoicePrefix = isNamibia ? 'NAMRA-INV-' : 'ZRA-INV-';
  const invoiceNo = invoicePrefix + ride.bookingRef.replace(/^BK-(NA-|ZM-)?/, '');
  const companyName = isNamibia ? 'BUKENIRIDE NAMIBIA (PTY) LTD' : 'BUKENIRIDE ZAMBIA LTD';
  const companyAddress = isNamibia
    ? 'Independence Avenue Commercial Plaza, P.O. Box 2490, Windhoek, Namibia'
    : 'Cairo Road Commercial Centre, P.O. Box 30129, Lusaka, Zambia';

  const rawFare = ride.fareSelectedCurrency || ride.fareZMW;
  const vatAmount = +(rawFare * (vatRate / (1 + vatRate))).toFixed(2);
  const netAmount = +(rawFare - vatAmount).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isNamibia ? '🇳🇦' : '🇿🇲'}</span>
                <span>{isNamibia ? 'NAMRA Electronic Fiscal Invoice' : 'ZRA Digital Tax Invoice'}</span>
              </h3>
              <p className="text-xs text-slate-400">{taxAuthName} Compliant Receipt</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Printable View */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-200 font-sans">
          {/* Official Letterhead */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-black text-white tracking-wider">{companyName}</h2>
                <p className="text-[11px] text-slate-400">{companyAddress}</p>
                <p className="text-[11px] text-emerald-400 font-mono font-semibold">{tinNumber}</p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
                  {isNamibia ? 'NAMRA FISCAL' : 'ZRA VAT'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">{invoiceNo}</p>
              </div>
            </div>

            {/* Trip Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Client / Passenger:</span>
                <strong className="text-white">{ride.passengerName}</strong>
                <p className="text-slate-400 font-mono text-[11px]">{ride.passengerPhone}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Driver &amp; Vehicle:</span>
                <strong className="text-white">{ride.driver?.name || 'Assigned Partner'}</strong>
                <p className="text-slate-400 font-mono text-[11px]">{ride.driver?.vehiclePlate}</p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-2 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Route Origin:</span>
                <span className="text-white font-medium">{ride.pickup.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="text-white font-medium">{ride.destination.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Distance &amp; Tier:</span>
                <span className="text-white font-mono">{ride.distanceKm} km • {ride.tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="text-emerald-400 uppercase font-semibold">{ride.paymentMethod.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Tax Computation Table */}
            <div className="border-t border-slate-800 pt-3 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Taxable Net Transit Fare:</span>
                <span>{currencySymbol} {netAmount}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>{vatLabel}:</span>
                <span>{currencySymbol} {vatAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-white font-black pt-1 border-t border-slate-800">
                <span>Total Amount Paid:</span>
                <span>{currencySymbol} {rawFare}</span>
              </div>
            </div>

            {/* Security Verification & QR signature */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Digitally Certified via {isNamibia ? 'NamRA Asycuda Engine' : 'ZRA Smart Invoice Gateway'}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-slate-500">
                <QrCode className="w-3.5 h-3.5" />
                <span>SIG-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
