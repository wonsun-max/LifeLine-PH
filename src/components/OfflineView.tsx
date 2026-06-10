import React from "react";
import { createPortal } from "react-dom";
import { Book, Droplets, Flame, Skull, Activity, ShieldPlus } from "lucide-react";
import { Language, translations } from "../data/translations";

interface Props {
  language: Language;
  t: (typeof translations)["en"];
}

export default function OfflineView({ language, t }: Props) {
  const guides = [
    {
      id: 'cpr',
      title: t.guideCPR,
      desc: t.guideCPRDesc,
      icon: Activity,
      color: "bg-rose-500",
      lightColor: "bg-rose-50",
      textColor: "text-rose-500",
    },
    {
      id: 'bleeding',
      title: t.guideBleeding,
      desc: t.guideBleedingDesc,
      icon: Droplets,
      color: "bg-red-600",
      lightColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      id: 'choking',
      title: t.guideChoking,
      desc: t.guideChokingDesc,
      icon: Skull,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-500",
    },
    {
      id: 'burn',
      title: t.guideBurn,
      desc: t.guideBurnDesc,
      icon: Flame,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      textColor: "text-orange-500",
    },
    {
      id: 'fracture',
      title: t.guideFracture,
      desc: t.guideFractureDesc,
      icon: ShieldPlus,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-500",
    },
  ];

  const [openGuide, setOpenGuide] = React.useState<string | null>(null);

  const activeGuide = guides.find(g => g.id === openGuide);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div className="bg-slate-900 rounded-[2rem] p-8 text-center shadow-lg w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
          <Book className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">{t.offlineTitle}</h2>
        <p className="text-slate-400 font-medium text-sm max-w-sm mx-auto">{t.offlineDesc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {guides.map((guide) => (
          <button
            key={guide.id}
            onClick={() => setOpenGuide(guide.id)}
            className="group bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden p-6 hover:shadow-lg hover:border-slate-300 transition-all text-left flex flex-col gap-4 active:scale-[0.98]"
          >
            <div className={`w-14 h-14 ${guide.lightColor} ${guide.textColor} rounded-2xl flex items-center justify-center shrink-0`}>
              <guide.icon className="w-7 h-7 inline" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 mb-1 group-hover:text-rose-600 transition-colors">{guide.title}</h3>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tap to View Protocol &rarr;</p>
            </div>
          </button>
        ))}
      </div>

      {activeGuide && createPortal(
        <div className="fixed inset-0 z-[150] bg-slate-900/95 backdrop-blur-md flex flex-col p-4 md:p-8 animate-in fade-in duration-300">
           <div className="max-w-2xl w-full mx-auto flex flex-col h-full bg-slate-50 overflow-hidden rounded-[2rem] shadow-2xl">
              <div className={`p-6 md:p-8 ${activeGuide.color} text-white relative shrink-0 flex items-center justify-between`}>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <activeGuide.icon className="w-6 h-6 text-white" />
                   </div>
                   <h2 className="font-display font-black text-2xl md:text-3xl">{activeGuide.title}</h2>
                 </div>
                 <button 
                  onClick={() => setOpenGuide(null)}
                  className="w-12 h-12 bg-black/20 hover:bg-black/30 text-white rounded-full flex items-center justify-center transition-colors"
                 >
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 hide-scrollbar bg-slate-50">
                <div className="space-y-6">
                  {activeGuide.desc.split('\n').map((step, i) => {
                     const isImportant = step.toLowerCase().includes('call') || step.toLowerCase().includes('emergency') || step.toLowerCase().includes('cpr');
                     return (
                        <div key={i} className={`p-6 rounded-2xl flex gap-5 md:gap-6 ${isImportant ? 'bg-rose-50 border-2 border-rose-100' : 'bg-white border sm shadow-sm border-slate-100'}`}>
                           <div className={`w-10 h-10 shrink-0 font-display font-black text-xl rounded-xl flex items-center justify-center ${isImportant ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              {i + 1}
                           </div>
                           <p className={`font-semibold md:text-lg leading-relaxed pt-1 ${isImportant ? 'text-rose-900' : 'text-slate-700'}`}>
                              {step.replace(/^\d+\.\s*/, '')}
                           </p>
                        </div>
                     );
                  })}
                </div>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
}
