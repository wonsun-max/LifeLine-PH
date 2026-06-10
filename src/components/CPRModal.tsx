import React, { useState, useEffect, useRef } from "react";
import { HeartPulse, X, Volume2, Activity, Wind } from "lucide-react";
import { Language, translations } from "../data/translations";

interface Props {
  onClose: () => void;
  language: Language;
  t: (typeof translations)["en"];
}

export default function CPRModal({ onClose, language, t }: Props) {
  const [isOn, setIsOn] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'intro' | 'compressions' | 'breathe'>('idle');
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const runningRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  // Initialize Audio Context on mount
  useEffect(() => {
    // Requires user interaction, so we init on first start
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playBeep = () => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtxRef.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);
    
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.3);
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const registerTimeout = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const speakAndWait = (text: string, lang: string, extraDelay: number, callback?: () => void) => {
    if (!runningRef.current) return;
    window.speechSynthesis.cancel();
    
    let callbackFired = false;
    const fireCallback = () => {
      if (!callbackFired && runningRef.current && callback) {
        callbackFired = true;
        callback();
      }
    };

    try {
      const plainText = text
        .replace(/[*_#+`~\[\]\(\)]/g, '')
        .replace(/\n+/g, '. ')
        .trim();
        
      const utterance = new SpeechSynthesisUtterance(plainText);
      if (lang === "ko") utterance.lang = "ko-KR";
      else if (lang === "tl") utterance.lang = "fil-PH";
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
      
      utterance.rate = 0.95; // Slower, clearer instruction
      
      utterance.onend = () => {
        registerTimeout(fireCallback, extraDelay);
      };
      
      utterance.onerror = () => {
        registerTimeout(fireCallback, extraDelay);
      };
      
      // Safety net fallback in case onend never fires (sometimes happens on Android)
      registerTimeout(fireCallback, 8000 + extraDelay); 

      window.speechSynthesis.speak(utterance);
    } catch(e) {
      console.error(e);
      registerTimeout(fireCallback, extraDelay);
    }
  };

  const startCompressionsCycle = () => {
    if (!runningRef.current) return;
    setPhase('compressions');
    setCount(0);
    
    let currentBeat = 0;
    const totalBeats = 30;
    const beatInterval = 600; // 100 BPM
    
    const playNextBeat = () => {
      if (!runningRef.current) return;
      currentBeat++;
      setCount(currentBeat);
      playBeep();
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
      setPulse(true);
      registerTimeout(() => setPulse(false), 200);

      if (currentBeat < totalBeats) {
        registerTimeout(playNextBeat, beatInterval);
      } else {
        registerTimeout(() => {
          if (!runningRef.current) return;
          setPhase('breathe');
          // Wait 5 seconds after speech for the 2 breaths
          speakAndWait(t.cprBreathe || "Give 2 rescue breaths", language, 5000, () => {
            if (runningRef.current) {
               // Notify to resume compressions
               speakAndWait(t.cprResume || "Resume compressions!", language, 500, () => {
                  if (runningRef.current) startCompressionsCycle();
               });
            }
          });
        }, beatInterval);
      }
    };
    
    playNextBeat();
  };

  const toggleCPR = () => {
    if (isOn) {
      // STOP
      runningRef.current = false;
      setIsOn(false);
      setPhase('idle');
      setPulse(false);
      setCount(0);
      window.speechSynthesis.cancel();
      clearAllTimeouts();
    } else {
      // START
      initAudio();
      runningRef.current = true;
      setIsOn(true);
      setPhase('intro');
      
      // Slight pause after intro
      speakAndWait(t.cprIntro || "We will do this together. 30 compressions, then 2 breaths.", language, 1000, () => {
        if (runningRef.current) startCompressionsCycle();
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      runningRef.current = false;
      clearAllTimeouts();
      window.speechSynthesis.cancel();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-[2rem] shadow-2xl overflow-hidden relative">
        <button 
          onClick={() => {
            runningRef.current = false;
            clearAllTimeouts();
            window.speechSynthesis.cancel();
            onClose();
          }}
          className="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`p-10 pb-12 flex flex-col items-center justify-center text-center transition-colors duration-500 
          ${phase === 'compressions' ? (pulse ? 'bg-rose-100' : 'bg-rose-50') : 
            phase === 'breathe' ? 'bg-blue-50' : 
            phase === 'intro' ? 'bg-amber-50' : 'bg-slate-50'}`}>
          
          <div className="h-10 flex items-center justify-center w-full mb-6 relative">
             <div className={`transition-all duration-300 absolute ${phase !== 'idle' ? 'opacity-100 -translate-y-0' : 'opacity-0 translate-y-4'}`}>
               <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow-sm
                  ${phase === 'compressions' ? 'bg-rose-600 text-white' : 
                    phase === 'breathe' ? 'bg-blue-500 text-white' : 
                    'bg-amber-500 text-white'}`}>
                  {phase === 'intro' && "Preparation"}
                  {phase === 'compressions' && "Compressions (30x)"}
                  {phase === 'breathe' && "Rescue Breaths (2x)"}
               </span>
             </div>
          </div>

          <div className="relative mb-8 h-32 w-32">
            {phase === 'compressions' && (
              <>
                <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-20" style={{ animationDuration: '600ms' }}></div>
                <div className="absolute -inset-4 bg-rose-400 rounded-full animate-pulse opacity-10" style={{ animationDuration: '600ms' }}></div>
                <div className={`absolute inset-0 rounded-full flex items-center justify-center z-10 transition-all duration-150 bg-rose-600 shadow-xl shadow-rose-600/30 ${pulse ? 'scale-110' : 'scale-100'}`}>
                  <span className="text-white font-display font-black text-5xl tabular-nums">{count}</span>
                </div>
              </>
            )}
            
            {phase === 'breathe' && (
               <div className="absolute inset-0 rounded-full flex items-center justify-center z-10 bg-blue-500 shadow-xl shadow-blue-500/30 animate-pulse" style={{ animationDuration: '2s' }}>
                  <Wind className="w-14 h-14 text-white" />
               </div>
            )}

            {phase === 'intro' && (
               <div className="absolute inset-0 rounded-full flex items-center justify-center z-10 bg-amber-500 shadow-xl shadow-amber-500/30 animate-pulse">
                  <Activity className="w-14 h-14 text-white" />
               </div>
            )}

            {phase === 'idle' && (
              <div className="absolute inset-0 rounded-full flex items-center justify-center z-10 bg-slate-800 transition-all duration-300">
                <HeartPulse className="w-16 h-16 text-slate-300" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-display font-black text-slate-900 mb-3 min-h-[4rem] flex items-center justify-center">
            {phase === 'idle' ? t.guideCPR :
             phase === 'intro' ? t.cprIntro :
             phase === 'compressions' ? t.cprInstructions :
             phase === 'breathe' ? t.cprBreathe : ""}
          </h2>
          
          <p className="text-slate-500 font-bold text-sm mb-8 leading-snug min-h-[3.5rem] flex items-center justify-center max-w-[280px]">
             {phase === 'idle' ? t.cprInstructions : 
              phase === 'breathe' ? "Blow into the mouth twice until the chest rises." :
              phase === 'intro' ? "Listen to the instructions..." :
              "Follow the rhythm and push hard."}
          </p>

          <button
            onClick={toggleCPR}
            className={`w-full py-5 rounded-2xl font-bold text-xl uppercase tracking-widest transition-all ${
              isOn 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/30'
            }`}
          >
            {isOn ? t.stopCpr : t.cprButton}
          </button>
          
          {!isOn && (
            <p className="flex items-center gap-2 mt-5 text-sm font-semibold text-slate-400">
              <Volume2 className="w-4 h-4" /> Turn up your device volume
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
