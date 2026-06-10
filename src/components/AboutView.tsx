import { Heart, Stethoscope, AlertTriangle, ShieldCheck, HeartPulse } from "lucide-react";

export default function AboutView({ t }: { t: any }) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200/60 shadow-xl shadow-slate-200/20 relative overflow-hidden isolate">
        
        {/* Background Decorative Blur */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10 pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6 shadow-inner border border-rose-100">
            <Heart className="w-10 h-10 fill-rose-500/20" />
          </div>
          <h2 className="font-display font-black text-3xl md:text-4xl text-slate-900 tracking-tight mb-4">
            {t.aboutTitle || "My Story & Mission"}
          </h2>
          <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed">
            {t.aboutSubtitle || "The language of rescue, reachable anywhere: LifeLinePH"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Step 1 */}
          <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 relative shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg leading-tight text-slate-800">{t.aboutStep1Title}</h3>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              {t.aboutStep1Desc}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 relative shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg leading-tight text-slate-800">{t.aboutStep2Title}</h3>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              {t.aboutStep2Desc}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 relative shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg leading-tight text-slate-800">{t.aboutStep3Title}</h3>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              {t.aboutStep3Desc}
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 relative shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg leading-tight text-slate-800">{t.aboutStep4Title}</h3>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              {t.aboutStep4Desc}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-center relative overflow-hidden border border-slate-800">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <Heart className="w-12 h-12 fill-rose-500 text-rose-500 mx-auto mb-5 relative z-10" />
          <h3 className="font-display font-black text-2xl md:text-3xl text-white mb-3 relative z-10">{t.aboutTitle}</h3>
          
          <div className="mt-8 pt-6 border-t border-slate-800/60 relative z-10">
            <p className="text-sm font-bold tracking-widest text-slate-400">
              {t.aboutDeveloper}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
