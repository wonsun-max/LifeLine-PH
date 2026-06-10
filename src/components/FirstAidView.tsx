import React, { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  Send,
  Loader2,
  HeartPulse,
  ShieldAlert,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Language } from "../data/translations";
import Markdown from "react-markdown";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface Props {
  language: Language;
  t: any;
  emergencyNumber: string;
  onRecommendFacility?: (query: string) => void;
}

interface Message {
  role: "user" | "model";
  text: string;
  quickReplies?: string[];
  status?: string;
  recommendedFacility?: string | null;
}

export default function FirstAidView({ language, t, emergencyNumber, onRecommendFacility }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile(data);
            localStorage.setItem(`profile_${user.uid}`, JSON.stringify(data));
          }
        } catch (error: any) {
          // If offline and not in cache, try local storage fallback
          const cached = localStorage.getItem(`profile_${user.uid}`);
          if (cached) {
            setUserProfile(JSON.parse(cached));
          } else {
            if (error?.code !== 'unavailable') {
              console.error("Error fetching user profile", error);
            }
          }
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Quick keywords that users can click to start
  const defaultKeywords = [
    {
      text: { en: "Burn", ko: "화상", tl: "Paso" },
      icon: "🔥",
      color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    },
    {
      text: { en: "Fever", ko: "고열", tl: "Lagnat" },
      icon: "🌡️",
      color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    },
    {
      text: { en: "Heart Attack", ko: "심장마비", tl: "Atake sa puso" },
      icon: "🫀",
      color:
        "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    },
    {
      text: { en: "Choking", ko: "질식", tl: "Nabulunan" },
      icon: "🗣️",
      color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    },
    {
      text: { en: "Bleeding", ko: "출혈", tl: "Dumudugo" },
      icon: "🩸",
      color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
    },
  ];

  const customKeywords = userProfile?.customCategories?.map((c: string) => ({
    text: { en: c, ko: c, tl: c },
    icon: "⚠️",
    color: "bg-slate-50 text-slate-700 border-slate-200",
  })) || [];

  const quickKeywords = [...customKeywords, ...defaultKeywords];

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    // Pre-load voices
    window.speechSynthesis.getVoices();
    // Cancel speaking when unmounting or switching language
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [language]);

  const toggleSpeech = (text: string) => {
    if (speakingText === text) {
      window.speechSynthesis.cancel();
      setSpeakingText(null);
      return;
    }
    
    window.speechSynthesis.cancel(); // Stop anything currently playing
    
    // Strip markdown chars cleanly for speech
    const plainText = text
      .replace(/[*_#+`~\[\]\(\)]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(plainText);
    
    if (language === "ko") utterance.lang = "ko-KR";
    else if (language === "tl") utterance.lang = "fil-PH"; // Tagalog
    else utterance.lang = "en-US";
    
    const voices = window.speechSynthesis.getVoices();
    const langVoices = voices.filter(v => v.lang.startsWith(utterance.lang.substring(0, 2)));
    
    // Choose the best voice or fallback
    let bestVoice = langVoices.find(v => /Google|Natural|Siri|Premium|Advanced/i.test(v.name));
    if (!bestVoice && langVoices.length > 0) {
      bestVoice = langVoices[0];
    }
    
    if (bestVoice) {
      utterance.voice = bestVoice;
    }
    
    utterance.rate = 0.95; // Slightly slower, more professional reading
    
    utterance.onend = () => {
      setSpeakingText(null);
    };
    
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setSpeakingText(null);
    };
    
    setSpeakingText(text);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setInputText("");

    const userMsg: Message = { role: "user", text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: newHistory.slice(0, -1),
          message: text,
          userProfile: userProfile
        }),
      });

      if (!response.ok) {
        let errMessage = "API Error";
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch(e) {}
        throw new Error(errMessage);
      }

      const data = await response.json();

      setMessages([
        ...newHistory,
        {
          role: "model",
          text: data.text,
          quickReplies: data.quickReplies,
          status: data.status,
          recommendedFacility: data.recommendedFacility,
        },
      ]);
    } catch (error: any) {
      console.error(error);
      const offlineMsg = t.systemOffline.replace("911", emergencyNumber);
      setMessages([
        ...newHistory,
        {
          role: "model",
          text: `${offlineMsg}\n\n(Error Detail: ${error.message})`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isInitialState = messages.length === 0;

  return (
    <div className="flex flex-col w-full h-[600px] md:h-[700px] bg-white rounded-[2rem] border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden relative">
      {/* Premium Header */}
      <div className="bg-slate-950 px-6 py-5 flex items-center justify-between shrink-0 border-b border-slate-900 shadow-md z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <HeartPulse className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <h2 className="text-white font-display font-bold text-xl tracking-tight">{t.aiTriageTitle}</h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest bg-emerald-950 border border-emerald-800/50 text-emerald-400 px-3 py-1.5 rounded-full relative z-10 uppercase shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]"></span>
          {t.aiAssistant}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50/50 relative">
        {isInitialState ? (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center border border-slate-200 shadow-xl shadow-slate-200/50 relative z-10 rotate-3 transition-transform hover:rotate-6 duration-300">
                <ShieldCheck className="w-12 h-12 text-emerald-500 drop-shadow-sm" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight">
                {t.whatsEmergency}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {t.describeSymptoms}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {quickKeywords.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(tag.text[language])}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md font-semibold transition-all active:scale-95 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{tag.icon}</span>
                  <span>{tag.text[language]}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 flex flex-col pt-2 pb-6">
            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl max-w-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-lg shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-sm text-amber-900 font-semibold leading-relaxed pt-1">
                  {t.lifeThreateningWarning}
                </p>
              </div>
            </div>

            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[80%] p-5 rounded-[24px] ${
                    message.role === "user"
                      ? "bg-slate-900 text-white rounded-tr-md shadow-lg shadow-slate-900/10"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-md shadow-md shadow-slate-200/50"
                  }`}
                >
                  {message.role === "model" ? (
                    <div className="markdown-body prose prose-slate prose-sm md:prose-base max-w-none prose-headings:font-display prose-headings:tracking-tight break-words">
                      <Markdown>{message.text}</Markdown>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button 
                          onClick={() => toggleSpeech(message.text)}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 active:scale-95 shrink-0"
                        >
                          {speakingText === message.text ? (
                            <>
                              <VolumeX className="w-4 h-4 text-rose-500" />
                              <span className="text-slate-700">{t.stopReading}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-slate-700">{t.readAloud}</span>
                            </>
                          )}
                        </button>
                        
                        {message.recommendedFacility && (
                          <button 
                            onClick={() => onRecommendFacility?.(message.recommendedFacility!)}
                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors border border-blue-700 active:scale-95 shadow-sm shadow-blue-500/20 shrink-0"
                          >
                            Find nearby {message.recommendedFacility.charAt(0).toUpperCase() + message.recommendedFacility.slice(1).toLowerCase()}
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[15px] font-medium leading-relaxed">
                      {message.text}
                    </p>
                  )}
                </div>

                {message.role === "model" &&
                  message.quickReplies &&
                  message.quickReplies.length > 0 &&
                  !isLoading &&
                  i === messages.length - 1 && (
                    <div className="flex flex-wrap gap-2 mt-4 ml-2 max-w-[80%]">
                      {message.quickReplies.map((reply, idx) => (
                         <button
                          key={idx}
                          onClick={() => sendMessage(reply)}
                          className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 hover:shadow-emerald-200/50"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start animate-in fade-in duration-300">
                <div className="bg-white border border-slate-200 p-5 rounded-[24px] rounded-tl-md shadow-md shadow-slate-200/50 max-w-[80%]">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                    <span className="text-slate-500 font-semibold text-sm">
                      {t.analyzing}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Modern Input Area */}
      <div className="p-4 md:p-6 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10 relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputText);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={t.typeSymptoms}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[20px] py-4 pl-6 pr-16 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 w-11 h-11 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-30 disabled:hover:translate-y-0 disabled:bg-slate-200 disabled:text-slate-500 transition-all active:scale-95"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
