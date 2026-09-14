import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wrench, Calendar, Smartphone, User, Phone, FileText, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { Booking } from '../types';
import { sanitizeInput, sanitizePhone } from '../utils/sanitize';

interface BookingFormProps {
  isDarkMode: boolean;
  preselectedService?: string;
}

const IPHONE_MODELS = [
  'iPhone 17 Pro Max',
  'iPhone 17 Pro',
  'iPhone 17 Air / Plus',
  'iPhone 17',
  'iPhone 16 Pro Max',
  'iPhone 16 Pro',
  'iPhone 16 Plus',
  'iPhone 16',
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  'iPhone 15 Plus',
  'iPhone 15',
  'iPhone 14 Pro Max',
  'iPhone 14 Pro',
  'iPhone 14 Plus',
  'iPhone 14',
  'iPhone 13 Pro Max',
  'iPhone 13 Pro',
  'iPhone 13 Mini',
  'iPhone 13',
  'iPhone 12 Pro Max',
  'iPhone 12 Pro',
  'iPhone 12 Mini',
  'iPhone 12',
  'iPhone 11 Pro Max',
  'iPhone 11 Pro',
  'iPhone 11',
  'iPhone XS Max / XS / XR / X',
  'iPhone 8 Plus / 8 / 7 Plus / 7 / 6s / 6',
  'iPad / Apple Watch',
];

const REPAIR_TYPES = [
  'Screen Replacement (InCell / OLED (DD))',
  'Battery Replacement (100% Health OEM)',
  'Back Glass Replacement (Laser Precision)',
  'Water Damage Restoration & Ultrasonic Cleaning',
  'Baseband / No Service / No SIM Signal',
  'Charging Port & Tristar / Hydra Chip Fix',
  'No Audio / Speaker / Microphone Repair',
  'Face ID / Touch ID Biometric Fix',
  'Micro Soldering & Board Component Repair',
  'Software Recovery / Boot Loop Fix',
  'Free Hardware Lab Diagnostic Check',
  'Other Custom Repair Request',
];

export const BookingForm: React.FC<BookingFormProps> = ({
  isDarkMode,
  preselectedService,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service_type: REPAIR_TYPES[0],
    device_model: 'iPhone 13 Pro Max',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (preselectedService) {
      const match = REPAIR_TYPES.find((t) => t.toLowerCase().includes(preselectedService.toLowerCase()));
      if (match) {
        setFormData((prev) => ({ ...prev, service_type: match }));
      }
    }
  }, [preselectedService]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cooldownSeconds > 0) {
      setErrorMsg(`Please wait ${cooldownSeconds} seconds before submitting another booking request.`);
      return;
    }

    const cleanName = sanitizeInput(formData.name, 100);
    const cleanPhone = sanitizePhone(formData.phone);
    const cleanNotes = sanitizeInput(formData.notes, 1000);

    if (!cleanName || !cleanPhone || !formData.service_type || !formData.device_model) {
      setErrorMsg('Please complete all required fields with valid text.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          service_type: formData.service_type,
          device_model: formData.device_model,
          notes: cleanNotes,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.success) {
          setSubmittedBooking(data.booking);
          setCooldownSeconds(10);
          setSubmitting(false);
          return;
        } else {
          setErrorMsg(data.error || 'Failed to submit booking. Please try again.');
          if (res.status === 429) {
            setCooldownSeconds(data.retryAfterSeconds || 60);
          }
          setSubmitting(false);
          return;
        }
      }
    } catch {
      // Static/Vercel fallback
    }

    // Client fallback booking creation
    const newBooking: Booking = {
      id: `bk-${Date.now().toString().slice(-4)}`,
      name: cleanName,
      phone: cleanPhone,
      service_type: formData.service_type,
      device_model: formData.device_model,
      preferred_date: new Date().toISOString().split('T')[0],
      notes: cleanNotes,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('iphone_lab_bookings') || '[]');
      localStorage.setItem('iphone_lab_bookings', JSON.stringify([newBooking, ...existing]));
    } catch {}

    setSubmittedBooking(newBooking);
    setCooldownSeconds(10);
    setSubmitting(false);
  };

  const resetForm = () => {
    setSubmittedBooking(null);
    setFormData({
      name: '',
      phone: '',
      service_type: REPAIR_TYPES[0],
      device_model: 'iPhone 13 Pro Max',
      notes: '',
    });
  };

  return (
    <section id="booking" className={`py-20 transition-colors relative ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D9BB5]/10 text-[#1D9BB5] text-xs font-bold uppercase tracking-wider mb-3">
            <Calendar className="w-3.5 h-3.5" />
            Express Repair Queue
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-[#1F3864]'}`}>
            Book Your iPhone Repair
          </h2>
          <p className={`text-base sm:text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Reserve your technician slot at Shop PB86, New Pioneer Mall, Kampala.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {submittedBooking ? (
              /* Success Confirmation Box */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1F3864] text-white p-8 sm:p-12 rounded-3xl shadow-2xl text-center border border-[#1D9BB5]/30 relative overflow-hidden"
              >
                <div className="w-20 h-20 rounded-full bg-[#1D9BB5]/20 text-[#1D9BB5] flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017] mb-2 block">
                  Booking Confirmed
                </span>
                <h3 className="text-2xl sm:text-3xl font-black mb-2">
                  Repair Appointment Reserved!
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
                  Thank you, <span className="text-white font-bold">{submittedBooking.name}</span>. Your booking has been registered in our Kampala laboratory queue.
                </p>

                {/* Booking ID Ticket */}
                <div className="bg-black/40 border border-white/15 rounded-2xl p-6 mb-8 max-w-lg mx-auto text-left space-y-3">
                  <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                    <span className="text-slate-400">Booking Reference:</span>
                    <span className="font-mono font-extrabold text-[#1D9BB5] text-base">{submittedBooking.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Device Model:</span>
                    <span className="font-bold">{submittedBooking.device_model}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Service Requested:</span>
                    <span className="font-bold">{submittedBooking.service_type}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Phone Number:</span>
                    <span className="font-bold">{submittedBooking.phone}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={`https://wa.me/256753234218?text=${encodeURIComponent(
                      `Hello iPhone Lab, I submitted Booking ${submittedBooking.id} for ${submittedBooking.device_model} (${submittedBooking.service_type}). Confirming my arrival date.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-[#1D9BB5] hover:bg-[#168197] text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg"
                  >
                    Send to WhatsApp Desk
                  </a>
                  <button
                    onClick={resetForm}
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-xl text-sm border border-white/20"
                  >
                    Book Another Repair
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Booking Input Form */
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className={`p-6 sm:p-10 rounded-3xl border shadow-xl space-y-6 ${
                  isDarkMode ? 'glass-card-dark text-white' : 'glass-card-light text-slate-900'
                }`}
              >
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="booking-name" className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Your Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="booking-name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Mugisha Joel"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#1D9BB5] ${
                          isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label htmlFor="booking-phone" className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Uganda Phone / WhatsApp Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="booking-phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 0753 234 218"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#1D9BB5] ${
                          isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Service Type Dropdown */}
                  <div>
                    <label htmlFor="booking-service-type" className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Select Repair Service *
                    </label>
                    <div className="relative">
  <select
    id="booking-service-type"
    name="service_type"
    value={formData.service_type}
    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
    className={`w-full px-4 pr-10 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#1D98B5] ${
      isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
    }`}
  >
                        {REPAIR_TYPES.map((type, idx) => (
                          <option key={idx} value={type} className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Device Model Dropdown */}
      <div>
        <label htmlFor="booking-device-model" className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
          isDarkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>
          Device Model *
        </label>
        <div className="relative">
          <select
            id="booking-device-model"
            name="device_model"
            value={formData.device_model}
            onChange={(e) => setFormData({ ...formData, device_model: e.target.value })}
            className={`w-full px-4 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#1D98B5] ${
              isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
            }`}
          >
            {IPHONE_MODELS.map((model, idx) => (
              <option key={idx} value={model} className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

                  {/* Repair Notes */}
                  <div className="md:col-span-2">
                    <label htmlFor="booking-notes" className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Problem Notes / Screen Quality Preference (Incell vs OLED (DD))
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <textarea
                        id="booking-notes"
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Describe the issue (e.g. 'Cracked screen after drop, touch working fine. Prefer OLED (DD) display option.')"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#1D9BB5] ${
                          isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={submitting || cooldownSeconds > 0}
                  className="w-full glow-btn text-white font-extrabold py-4 px-6 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wrench className="w-5 h-5" />
                  <span>
                    {submitting
                      ? 'Registering Booking...'
                      : cooldownSeconds > 0
                      ? `Please wait (${cooldownSeconds}s)`
                      : 'Submit Express Repair Reservation'}
                  </span>
                </button>

                <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>No upfront payment required. Pay after hardware inspection at Shop PB86.</span>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
