import React, { useState } from 'react';
import {
  Shield,
  Phone,
  UserCheck,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  Send,
  X,
  FileText,
  Camera,
  ExternalLink,
  Info
} from 'lucide-react';
import { TrustedContact, VerificationDocument, SafetySmsNotification, DriverProfile } from '../types';

interface SafetyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  trustedContacts: TrustedContact[];
  onUpdateTrustedContacts: (contacts: TrustedContact[]) => void;
  documents: VerificationDocument[];
  onUploadDocument: (doc: VerificationDocument) => void;
  smsHistory: SafetySmsNotification[];
  onTriggerSos: () => void;
  isSosActive: boolean;
  currentDriver?: DriverProfile;
}

export const SafetyHubModal: React.FC<SafetyHubModalProps> = ({
  isOpen,
  onClose,
  trustedContacts,
  onUpdateTrustedContacts,
  documents,
  onUploadDocument,
  smsHistory,
  onTriggerSos,
  isSosActive,
  currentDriver,
}) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'verification' | 'sos' | 'sms_logs'>('contacts');
  const [contactsState, setContactsState] = useState<TrustedContact[]>(trustedContacts);
  const [newDocType, setNewDocType] = useState<VerificationDocument['type']>('nrc');
  const [newDocNumber, setNewDocNumber] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  if (!isOpen) return null;

  const handleContactChange = (index: number, field: keyof TrustedContact, value: any) => {
    const updated = [...contactsState];
    updated[index] = { ...updated[index], [field]: value };
    setContactsState(updated);
  };

  const handleSaveContacts = () => {
    onUpdateTrustedContacts(contactsState);
    setSaveMessage('2 Trusted Emergency Contacts Saved Successfully! Automatic SMS alerts are enabled.');
    setTimeout(() => setSaveMessage(''), 4000);
  };

  const handleSimulateDocUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocNumber) return;

    const titles: Record<string, string> = {
      nrc: 'Zambian National Registration Card (NRC)',
      drivers_license: 'RTSA Driver License (Zambia)',
      rtsa_fitness: 'RTSA Road Fitness Certificate',
      interpol_clearance: 'Zambia Police Interpol Clearance',
    };

    const newDoc: VerificationDocument = {
      id: 'doc-' + Date.now(),
      type: newDocType,
      title: newDocTitle || titles[newDocType],
      documentNumber: newDocNumber,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: newDocType === 'nrc' ? 'Permanent' : '2028-12-31',
      status: 'verified', // Auto verified in prototype with audit trail
      fileName: selectedFileName || `${newDocType.toUpperCase()}_Verified_${newDocNumber.slice(-4)}.pdf`,
    };

    onUploadDocument(newDoc);
    setNewDocNumber('');
    setNewDocTitle('');
    setSelectedFileName('');
    setSaveMessage('Document uploaded and background check logged successfully!');
    setTimeout(() => setSaveMessage(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                BukeniRide Safety & Security Hub
              </h2>
              <p className="text-xs text-slate-400">
                Zambian Identity Verification, Dual Trusted Alerts & 24/7 SOS
              </p>
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'contacts'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>2 Trusted Numbers (Required)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'verification'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Identity & Background Checks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sms_logs')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'sms_logs'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Safety SMS Logs ({smsHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sos')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'sos'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-red-400/80 hover:text-red-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Emergency SOS Panic</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-200">
          {saveMessage && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveMessage}</span>
            </div>
          )}

          {/* TAB 1: 2 TRUSTED CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Mandatory Safety Protocol:</strong> All BukeniRide clients must register <strong>2 trusted Zambian phone numbers</strong>. Whenever your ride is accepted by a driver, our automated gateway sends an instant SMS with driver name, registration plate, vehicle model, and real-time live GPS tracking link.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactsState.map((contact, idx) => (
                  <div key={contact.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        Trusted Contact #{idx + 1}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {idx === 0 ? 'Primary' : 'Secondary'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-emerald-500 outline-none"
                        placeholder="e.g. Chileshe Mulenga"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Zambian Phone Number</label>
                      <input
                        type="text"
                        value={contact.phoneNumber}
                        onChange={(e) => handleContactChange(idx, 'phoneNumber', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-emerald-500 outline-none font-mono"
                        placeholder="+260 97X XXX XXX"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Relationship</label>
                      <input
                        type="text"
                        value={contact.relationship}
                        onChange={(e) => handleContactChange(idx, 'relationship', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-emerald-500 outline-none"
                        placeholder="e.g. Spouse, Parent, Sister"
                      />
                    </div>

                    <div className="space-y-2 pt-1 border-t border-slate-800/80">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contact.receiveSmsOnTripStart}
                          onChange={(e) => handleContactChange(idx, 'receiveSmsOnTripStart', e.target.checked)}
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <span>SMS Driver Details on Ride Start</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contact.receiveSmsOnSos}
                          onChange={(e) => handleContactChange(idx, 'receiveSmsOnSos', e.target.checked)}
                          className="rounded border-slate-700 text-red-500 focus:ring-0"
                        />
                        <span>Instant SOS Panic Broadcast Alert</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveContacts}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Trusted Contacts</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITY VERIFICATION & BACKGROUND CHECKS */}
          {activeTab === 'verification' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Chipo Banda (Passenger & Client)</h4>
                    <p className="text-xs text-slate-400 font-mono">NRC No: 319402/10/1 | Tier: Emerald VIP</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ID Verified</span>
                </div>
              </div>

              {/* Upload New Document Form */}
              <form onSubmit={handleSimulateDocUpload} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Upload & Update Verification Documents</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Document Category</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-emerald-500 outline-none"
                    >
                      <option value="nrc">Zambian NRC (National Registration Card)</option>
                      <option value="drivers_license">RTSA Driver's License</option>
                      <option value="interpol_clearance">Police Interpol Clearance</option>
                      <option value="rtsa_fitness">RTSA Road Fitness Certificate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Document / Serial Number</label>
                    <input
                      type="text"
                      value={newDocNumber}
                      onChange={(e) => setNewDocNumber(e.target.value)}
                      placeholder="e.g. 284910/11/1 or DL-ZM-4491"
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-emerald-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center hover:border-emerald-500/50 transition cursor-pointer bg-slate-900/40">
                  <input
                    type="file"
                    id="doc-upload-input"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <label htmlFor="doc-upload-input" className="cursor-pointer block">
                    <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-300 font-medium">
                      {selectedFileName ? (
                        <span className="text-emerald-400 font-bold">{selectedFileName}</span>
                      ) : (
                        'Click to upload photo or scanned document (PNG, JPG, PDF)'
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Max file size: 10MB. Enforced with end-to-end encryption.</p>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Submit for Compliance Verification</span>
                  </button>
                </div>
              </form>

              {/* Existing Documents List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Verified Documents & Background Check Logs
                </h4>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                        <FileText className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{doc.title}</p>
                        <p className="text-slate-400 font-mono text-[11px]">
                          Ref: {doc.documentNumber} • Expiry: {doc.expiryDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-[11px] border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SAFETY SMS LOGS */}
          {activeTab === 'sms_logs' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300">
                <p className="font-semibold text-white mb-1">Automated Trusted Safety SMS Engine</p>
                <p className="text-slate-400">
                  Logs of automated SMS dispatches sent to your 2 registered emergency numbers upon ride confirmation, containing driver photo, plate number, and web tracking URL.
                </p>
              </div>

              {smsHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <Send className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
                  <p>No safety SMS messages dispatched yet.</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Book a ride to trigger automatic SMS delivery to both contacts.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {smsHistory.map((sms) => (
                    <div key={sms.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-emerald-400" />
                          To: {sms.recipientName} ({sms.recipientPhone})
                        </span>
                        <span className="text-[11px] text-slate-500">{sms.timestamp}</span>
                      </div>
                      <div className="p-2.5 bg-slate-900/80 rounded-lg text-xs font-mono text-slate-200 border border-slate-800/80">
                        {sms.messageText}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Driver: <strong className="text-white">{sms.driverName}</strong> ({sms.driverPlate})</span>
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Delivered via Zamtel/Airtel/MTN SMS Gateway
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EMERGENCY SOS PANIC */}
          {activeTab === 'sos' && (
            <div className="space-y-5 py-2 text-center">
              <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/60 flex items-center justify-center mx-auto text-red-500 shadow-xl shadow-red-500/30">
                <AlertTriangle className="w-10 h-10 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  BukeniRide 24/7 Rapid Emergency SOS
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Activating SOS immediately broadcasts your real-time GPS telemetry, driver information, and vehicle plate to the <strong>Zambia Police Service (991)</strong>, Bukeni Security Dispatch, and your <strong>2 registered trusted contacts</strong>.
                </p>
              </div>

              <div className="p-4 bg-red-950/30 border border-red-800/40 rounded-xl text-left text-xs space-y-2 max-w-lg mx-auto">
                <p className="font-bold text-red-300 uppercase tracking-wide">Automatic Emergency Response Chain:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>Instant SMS with live GPS tracking link to <strong>2 Registered Trusted Contacts</strong></li>
                  <li>Direct alert packet dispatched to <strong>Zambia Police Control (991)</strong></li>
                  <li>Bukeni Operations Security center initiates silent audio check & vehicle tracking</li>
                  <li>Vehicle horn/hazard lights pulse sequence trigger available for driver assistance</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onTriggerSos}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-xl ${
                    isSosActive
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 animate-pulse'
                  }`}
                >
                  {isSosActive ? 'De-escalate / Cancel SOS Broadcast' : 'TRIGGER SOS PANIC NOW (991)'}
                </button>

                <a
                  href="tel:991"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Direct Call Zambia Police (991)</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Security Engine: 256-bit TLS • ZRA & RTSA Registered</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
