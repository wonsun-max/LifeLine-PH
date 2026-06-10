import { useState } from "react";
import {
  HeartPulse,
  Map as MapIcon,
  BookOpen,
  Stethoscope,
  AlertTriangle,
  User,
  Info
} from "lucide-react";
import { translations, Language } from "./data/translations";
import FirstAidView from "./components/FirstAidView";
import FacilitiesView from "./components/FacilitiesView";
import SOSView from "./components/SOSView";
import ProfileView from "./components/ProfileView";
import OfflineView from "./components/OfflineView";
import CPRModal from "./components/CPRModal";
import AboutView from "./components/AboutView";
import { APIProvider } from "@vis.gl/react-google-maps";

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

export default function App() {
  const [language, setLanguage] = useState<Language>("ko");
  const [activeTab, setActiveTab] = useState<"firstAid" | "facilities" | "sos" | "profile" | "offline" | "about">(
    "firstAid",
  );
  const [showCPR, setShowCPR] = useState(false);
  const [facilitySearchQuery, setFacilitySearchQuery] = useState("");

  const t = translations[language];
  const emergencyNumber = language === "ko" ? "119" : "911";

  if (!hasValidKey) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 520 }}>
          <h2>Google Maps API Key Required</h2>
          <p>
            <strong>Step 1:</strong>{" "}
            <a
              href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get an API Key
            </a>
          </p>
          <p>
            <strong>Step 2:</strong> Add your key as a secret in AI Studio:
          </p>
          <ul style={{ textAlign: "left", lineHeight: "1.8" }}>
            <li>
              Open <strong>Settings</strong> (⚙️ gear icon,{" "}
              <strong>top-right corner</strong>)
            </li>
            <li>
              Select <strong>Secrets</strong>
            </li>
            <li>
              Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name,
              press <strong>Enter</strong>
            </li>
            <li>
              Paste your API key as the value, press <strong>Enter</strong>
            </li>
          </ul>
          <p>The app rebuilds automatically after you add the secret.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-rose-200 selection:text-white">
        {/* Stunning Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center w-full">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden bg-white shadow-sm border border-slate-100">
                <img src="https://image.pollinations.ai/prompt/minimalist-medical-heart-cross-lifeline-logo-red-flat-vector-app-icon-white-background?width=200&height=200&nologo=true" alt="LifeLinePH Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl tracking-tight leading-none text-slate-900">
                  LifeLine<span className="text-rose-600">PH</span>
                </h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  MK CareBot & Hub
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setActiveTab('sos')}
                className="bg-rose-100 text-rose-700 flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm hover:bg-rose-200 transition-colors border border-rose-200"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">SOS</span>
              </button>
              <button
                onClick={() => setShowCPR(true)}
                className="bg-rose-600 text-white hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-colors animate-pulse whitespace-nowrap"
              >
                <HeartPulse className="w-4 h-4" />
                {t.cprButton}
              </button>

              <div className="flex bg-slate-100/80 p-1 rounded-xl shadow-inner border border-slate-200/50 shrink-0">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs transition-all ${language === "en" ? "font-bold bg-white shadow-sm text-slate-900" : "font-semibold text-slate-500 hover:text-slate-800"}`}
                >
                  ENG
                </button>
                <button
                  onClick={() => setLanguage("ko")}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs transition-all ${language === "ko" ? "font-bold bg-white shadow-sm text-slate-900" : "font-semibold text-slate-500 hover:text-slate-800"}`}
                >
                  KOR
                </button>
                <button
                  onClick={() => setLanguage("tl")}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs transition-all ${language === "tl" ? "font-bold bg-white shadow-sm text-slate-900" : "font-semibold text-slate-500 hover:text-slate-800"}`}
                >
                  TAG
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Global Floating CPR button for Mobile */}
        <button
          onClick={() => setShowCPR(true)}
          className="sm:hidden fixed bottom-6 right-6 z-[60] w-16 h-16 bg-rose-600 text-white rounded-full shadow-2xl flex items-center justify-center shadow-rose-600/40 animate-pulse border-4 border-white"
        >
          <HeartPulse className="w-8 h-8" />
        </button>

        {showCPR && <CPRModal language={language} t={t} onClose={() => setShowCPR(false)} />}

        {/* Navigation Tabs - Modern segmented control */}
        <div className="max-w-5xl mx-auto px-4 mt-8 w-full flex-shrink-0 hide-scrollbar overflow-x-auto pb-2">
          <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200/60 w-max min-w-full mx-auto gap-1 relative z-10">
            <button
              onClick={() => setActiveTab("firstAid")}
              className={`min-w-[90px] px-4 flex justify-center items-center gap-2 py-3.5 rounded-xl text-sm transition-all ${activeTab === "firstAid" ? "font-bold bg-slate-900 text-white shadow-md ring-1 ring-slate-900/10" : "font-semibold text-slate-500 hover:text-slate-800 hover:bg-white"}`}
            >
              <HeartPulse className={`w-5 h-5 shrink-0 ${activeTab === "firstAid" ? "text-emerald-400" : ""}`} />
              <span className="font-display text-[15px] whitespace-nowrap">{t.tabFirstAid}</span>
            </button>
            <button
              onClick={() => setActiveTab("offline")}
              className={`min-w-[90px] px-4 flex justify-center items-center gap-2 py-3.5 rounded-xl text-sm transition-all ${activeTab === "offline" ? "font-bold bg-slate-900 text-white shadow-md ring-1 ring-slate-900/10" : "font-semibold text-slate-500 hover:text-slate-800 hover:bg-white"}`}
            >
              <BookOpen className={`w-5 h-5 shrink-0 ${activeTab === "offline" ? "text-purple-400" : ""}`} />
              <span className="font-display text-[15px] whitespace-nowrap">{t.tabOffline}</span>
            </button>
            <button
              onClick={() => setActiveTab("facilities")}
              className={`min-w-[90px] px-4 flex justify-center items-center gap-2 py-3.5 rounded-xl text-sm transition-all ${activeTab === "facilities" ? "font-bold bg-slate-900 text-white shadow-md ring-1 ring-slate-900/10" : "font-semibold text-slate-500 hover:text-slate-800 hover:bg-white"}`}
            >
              <MapIcon className={`w-5 h-5 shrink-0 ${activeTab === "facilities" ? "text-blue-400" : ""}`} />
              <span className="font-display text-[15px] whitespace-nowrap">{t.tabFacilities}</span>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`min-w-[90px] px-4 flex justify-center items-center gap-2 py-3.5 rounded-xl text-sm transition-all ${activeTab === "profile" ? "font-bold bg-slate-900 text-white shadow-md ring-1 ring-slate-900/10" : "font-semibold text-slate-500 hover:text-slate-800 hover:bg-white"}`}
            >
              <User className={`w-5 h-5 shrink-0 ${activeTab === "profile" ? "text-amber-400" : ""}`} />
              <span className="font-display text-[15px] whitespace-nowrap">{t.tabProfile}</span>
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`min-w-[90px] px-4 flex justify-center items-center gap-2 py-3.5 rounded-xl text-sm transition-all ${activeTab === "about" ? "font-bold bg-slate-900 text-white shadow-md ring-1 ring-slate-900/10" : "font-semibold text-slate-500 hover:text-slate-800 hover:bg-white"}`}
            >
              <Info className={`w-5 h-5 shrink-0 ${activeTab === "about" ? "text-rose-400" : ""}`} />
              <span className="font-display text-[15px] whitespace-nowrap">{(t as any).tabAbout || 'About Us'}</span>
            </button>
            <button
              onClick={() => setActiveTab("sos")}
              className={`min-w-[90px] px-4 flex justify-center items-center gap-2 py-3.5 rounded-xl text-sm transition-all ${activeTab === "sos" ? "font-bold bg-rose-600 text-white shadow-md ring-1 ring-rose-500/50" : "font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50"}`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="font-display text-[15px] whitespace-nowrap">{t.tabSOS}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto w-full flex-1 flex flex-col p-4 md:px-8 py-8 gap-8 relative z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 h-full w-full flex-1">
            {activeTab === "firstAid" ? (
              <FirstAidView 
                language={language} 
                t={t} 
                emergencyNumber={emergencyNumber}
                onRecommendFacility={(query) => {
                  setFacilitySearchQuery(query);
                  setActiveTab("facilities");
                }}
              />
            ) : activeTab === "facilities" ? (
              <FacilitiesView 
                language={language} 
                t={t} 
                initialTypeFilter={facilitySearchQuery} 
              />
            ) : activeTab === "offline" ? (
              <OfflineView language={language} t={t} />
            ) : activeTab === "profile" ? (
              <ProfileView language={language} t={t} />
            ) : activeTab === "about" ? (
              <AboutView t={t} />
            ) : (
              <SOSView language={language} t={t} emergencyNumber={emergencyNumber} />
            )}
          </div>
        </main>

        {/* Polished Footer */}
        <footer className="bg-slate-950 text-slate-400 py-6 px-4 md:px-8 text-[11px] flex flex-col sm:flex-row justify-between items-center uppercase tracking-widest font-bold gap-3 mt-auto relative z-10 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>Optimal Status</span>
          </div>
          <span className="text-center font-mono opacity-80">
            &copy; 2026 LifeLinePH // Wonsun Park
          </span>
          <span className="opacity-80">Manila, PH</span>
        </footer>
      </div>
    </APIProvider>
  );
}
