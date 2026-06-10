import React, { useState, useEffect } from "react";
import { AlertTriangle, User, Phone, Save, MapPin, Loader2 } from "lucide-react";
import { Language, translations } from "../data/translations";

interface Props {
  language: Language;
  t: (typeof translations)["en"];
  emergencyNumber: string;
}

interface EmergencyContact {
  name: string;
  phone: string;
}

export default function SOSView({ language, t, emergencyNumber }: Props) {
  const [contact, setContact] = useState<EmergencyContact>({ name: "", phone: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lifeline_emergency_contact");
    if (saved) {
      setContact(JSON.parse(saved));
    } else {
      setIsEditing(true);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("lifeline_emergency_contact", JSON.stringify(contact));
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSOS = () => {
    if (!contact.phone) {
      alert(t.sosNoContactWarning);
      setIsEditing(true);
      return;
    }

    setIsLocating(true);
    
    // Attempt to get location to append it
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          let mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
          setIsLocating(false);
          sendSMS(mapsLink);
        },
        (error) => {
          console.error("Location error", error);
          setIsLocating(false);
          sendSMS("");
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
      sendSMS("");
    }
  };

  const sendSMS = (locationLink: string) => {
    const defaultMsg = t.sosDefaultMessage;
    const body = encodeURIComponent(`${defaultMsg}\n${locationLink}`);
    // Native intent for iOS/Android SMS
    // iOS uses sms:number&body=... Android uses sms:number?body=...
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? "&" : "?";
    window.location.href = `sms:${contact.phone}${separator}body=${body}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* MASSIVE SOS BUTTON */}
      <section className="bg-white rounded-3xl p-8 md:p-14 border border-rose-100 shadow-xl shadow-rose-900/5 flex flex-col items-center justify-center gap-8 w-full text-center relative overflow-hidden">
        {/* Animated background rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-tr from-rose-100 to-rose-50 rounded-full animate-ping opacity-60" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-50/50 rounded-full animate-pulse opacity-50" style={{ animationDuration: '2s' }}></div>
        
        <button
          onClick={handleSOS}
          disabled={isLocating}
          className="relative z-10 w-56 h-56 md:w-64 md:h-64 bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 active:scale-95 text-white rounded-[64px] flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(225,29,72,0.4)] transition-all duration-300 ring-8 ring-rose-50"
        >
          <div className="absolute inset-0 rounded-[64px] rounded-tl-[100px] rounded-br-[100px] bg-white opacity-10 blur-xl"></div>
          {isLocating ? (
            <Loader2 className="w-16 h-16 animate-spin text-white/90" />
          ) : (
            <AlertTriangle className="w-20 h-20 mb-3 text-white drop-shadow-md" />
          )}
          <span className="text-3xl md:text-4xl font-display font-black tracking-widest uppercase drop-shadow-md">
            {t.sosButton}
          </span>
        </button>
        <div className="relative z-10 flex gap-4 w-full max-w-sm mx-auto mt-4">
           <a 
             href={`tel:${emergencyNumber}`} 
             className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
           >
             <Phone className="w-4 h-4" />
             Call {emergencyNumber}
           </a>
           <button 
             onClick={handleSOS}
             disabled={isLocating}
             className="flex-1 bg-white hover:bg-rose-50 text-rose-600 border-2 border-rose-100 font-bold text-sm uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
           >
             <MapPin className="w-4 h-4" />
             Text SOS
           </button>
        </div>
        <div className="relative z-10 space-y-2">
          <p className="text-slate-500 font-medium text-sm md:text-base max-w-sm mx-auto leading-relaxed">
            {t.sosHelpText}
          </p>
        </div>
      </section>

      {/* EMERGENCY CONTACT SETTINGS */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm w-full relative group hover:border-slate-300/80 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900 leading-none mb-1">
                {t.sosContactTitle}
              </h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Primary Responder</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-slate-900 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                {t.sosNameLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 font-semibold text-lg"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                {t.sosPhoneLabel}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  placeholder="+63 900 000 0000"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 font-semibold text-lg font-mono"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] mt-6 flex justify-center items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {t.sosSave}
            </button>
          </form>
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center justify-between group-hover:bg-slate-100/50 transition-colors">
            <div className="space-y-1">
              <p className="text-2xl font-display font-bold text-slate-900">{contact.name || "None"}</p>
              <p className="text-slate-600 font-semibold font-mono tracking-tight text-lg">{contact.phone || "---"}</p>
            </div>
            <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* TOAST */}
        {showToast && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <Save className="w-4 h-4 text-emerald-400" />
            {t.sosSavedToast}
          </div>
        )}
      </section>
    </div>
  );
}
