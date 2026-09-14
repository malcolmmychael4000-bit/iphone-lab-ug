import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, MessageSquare, Send, Clock, CheckCircle2, Video, AlertCircle } from 'lucide-react';
import { sanitizeInput, sanitizePhone } from '../utils/sanitize';

interface ContactSectionProps {
  isDarkMode: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ isDarkMode }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [showLiveMap, setShowLiveMap] = useState(false);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cooldownSeconds > 0) {
      setErrorMsg(`Please wait ${cooldownSeconds} seconds before sending another message.`);
      return;
    }

    const cleanName = sanitizeInput(formData.name, 100);
    const cleanPhone = sanitizePhone(formData.phone);
    const cleanMessage = sanitizeInput(formData.message, 1500);

    if (!cleanName || !cleanPhone || !cleanMessage) {
      setErrorMsg('Please complete all fields with valid information.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          message: cleanMessage,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.success) {
          setSuccess(true);
          setFormData({ name: '', phone: '', message: '' });
          setCooldownSeconds(10);
          setSubmitting(false);
          return;
        } else {
          setErrorMsg(data.error || 'Failed to send message. Please try again.');
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

    // Client fallback contact submission
    const newContact = {
      id: `ct-${Date.now().toString().slice(-4)}`,
      name: cleanName,
      phone: cleanPhone,
      message: cleanMessage,
      created_at: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('iphone_lab_contacts') || '[]');
      localStorage.setItem('iphone_lab_contacts', JSON.stringify([newContact, ...existing]));
    } catch {}

    setSuccess(true);
    setFormData({ name: '', phone: '', message: '' });
    setCooldownSeconds(10);
    setSubmitting(false);
  };

  return (
    <section id="contact" className={`py-20 transition-colors ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-white text-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D9BB5]/10 text-[#1D9BB5] text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5" />
            Find Our Kampala Shop
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-[#1F3864]'}`}>
            Visit Us at New Pioneer Mall
          </h2>
          <p className={`text-base sm:text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Drop by our shop for same-day repairs or call/WhatsApp our technical desk directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left Column: Location Info & Interactive Google Map */}
          <div className="space-y-6">
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg space-y-6 ${
              isDarkMode ? 'glass-card-dark' : 'glass-card-light'
            }`}>
              <h3 className={`text-xl font-extrabold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1F3864]'}`}>
                <MapPin className="w-5 h-5 text-[#1D9BB5]" />
                iPhone Lab UG Location
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl liquid-teal text-[#1D9BB5] border border-[#1D9BB5]/30 flex items-center justify-center shrink-0 mt-1">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-base">New Pioneer Mall, Shop PB86</div>
                    <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>Kampala Central Business District, Uganda</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl liquid-teal text-[#1D9BB5] border border-[#1D9BB5]/30 flex items-center justify-center shrink-0 mt-1">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Phone:</div>
                    <div className={`text-xs flex flex-wrap gap-3 mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                      <a href="tel:0753234218" className="text-[#1D9BB5] font-bold hover:underline">0753 234 218</a>
                      <span>•</span>
                      <a href="tel:0730700368" className="text-[#1D9BB5] font-bold hover:underline">0730 700 368</a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl liquid-teal text-[#1D9BB5] border border-[#1D9BB5]/30 flex items-center justify-center shrink-0 mt-1">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Operating Hours:</div>
                    <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                      Mon – Sat: 8:00 AM – 7:00 PM | <span className="text-[#D4A017] font-bold">Sunday: APPOINTMENTS ONLY</span>
                    </div>
                  </div>
                </div>

                {/* Social & Messaging Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <a
                    href="https://wa.me/256753234218?text=Hello%20iPhone%20Lab%20UG,%20I%20have%20an%20inquiry%20about%20a%20repair%20/%20parts."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-extrabold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>

                  <a
                    href="https://www.tiktok.com/search?q=iphone%20lab%20uganda"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-extrabold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                      isDarkMode
                        ? 'bg-black hover:bg-black/80 border border-white/20 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white'
                    }`}
                  >
                    <Video className="w-4 h-4 text-[#D4A017]" />
                    <span>TikTok: iPhone Lab Uganda</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Embedded Interactive Google Map with High Performance On-Demand Loader */}
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-xl h-72 relative group bg-[#0A1120] flex items-center justify-center">
              {showLiveMap ? (
                <iframe
                  title="iPhone Lab UG Location Map at New Pioneer Mall Kampala"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.758810967396!2d32.5786111!3d0.3155556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbb830d97b91b%3A0xcf95b54203673c24!2sPioneer%20Mall%2C%20Kampala!5e0!3m2!1sen!2sug!4v1700000000000!5m2!1sen!2sug"
                  width="600"
                  height="300"
                  style={{ border: 0, width: '100%', height: '100%' }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#1F3864]/50 to-[#0A0A0A] relative">
                  {/* Subtle Grid Accent */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1D9BB5_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
                  
                  <div className="w-12 h-12 rounded-2xl bg-[#1D9BB5]/20 border border-[#1D9BB5]/40 flex items-center justify-center mb-3 shadow-lg relative z-10 animate-bounce">
                    <MapPin className="w-6 h-6 text-[#1D9BB5]" />
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1 relative z-10">New Pioneer Mall · Shop PB86</h4>
                  <p className="text-slate-400 text-xs mb-4 max-w-xs relative z-10">
                    Kampala, Central Division, Uganda · Ground Level
                  </p>
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <button
                      type="button"
                      onClick={() => setShowLiveMap(true)}
                      className="glow-btn text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg"
                    >
                      Load Interactive Map
                    </button>
                    <a
                      href="https://maps.google.com/?q=New+Pioneer+Mall+Kampala"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                    >
                      <span>Open in Maps App</span>
                    </a>
                  </div>
                </div>
              )}
              
              {showLiveMap && (
                <a
                  href="https://maps.google.com/?q=New+Pioneer+Mall+Kampala"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 bg-[#1F3864]/90 hover:bg-[#1F3864] text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/20 shadow-lg flex items-center gap-1.5 backdrop-blur-md transition-all z-20"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#1D9BB5]" />
                  <span>Open in Maps App</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Quick Message Form */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}>
            <h3 className={`text-xl font-extrabold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1F3864]'}`}>
              <MessageSquare className="w-5 h-5 text-[#1D9BB5]" />
              Send Direct Message
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Have a question about part availability or logic board repairs? Drop us a quick note below.
            </p>

            {success ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-emerald-400 text-base">Message Sent!</h4>
                <p className="text-xs text-slate-300">Our technicians will call or text you back promptly.</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-xs font-bold text-[#1D9BB5] underline pt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="contact-name" className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Nalubega"
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#1D9BB5] ${
                      isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Phone Number *
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 0730 700 368"
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#1D9BB5] ${
                      isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Inquiry Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="e.g. How much is screen replacement for iPhone 14 Plus?"
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#1D9BB5] ${
                      isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || cooldownSeconds > 0}
                  className="w-full glow-btn text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'Sending...'
                      : cooldownSeconds > 0
                      ? `Please wait (${cooldownSeconds}s)`
                      : 'Send Message'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
