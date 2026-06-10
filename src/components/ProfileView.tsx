import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, LogOut, Save, ShieldAlert, Loader2 } from "lucide-react";
import { Language, translations } from "../data/translations";
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

interface Props {
  language: Language;
  t: (typeof translations)["en"];
}

interface UserProfile {
  age: string;
  gender: string;
  medicalConditions: string;
  medications: string;
  customCategories: string;
}

export default function ProfileView({ language, t }: Props) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    age: "",
    gender: "",
    medicalConditions: "",
    medications: "",
    customCategories: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showMedicalIdCard, setShowMedicalIdCard] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              age: data.age?.toString() || "",
              gender: data.gender || "",
              medicalConditions: (data.medicalConditions || []).join(", "),
              medications: (data.medications || []).join(", "),
              customCategories: (data.customCategories || []).join(", "),
            });
            localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(data));
          }
        } catch (err: any) {
          const cached = localStorage.getItem(`profile_${currentUser.uid}`);
          if (cached) {
            const data = JSON.parse(cached);
            setProfile({
              age: data.age?.toString() || "",
              gender: data.gender || "",
              medicalConditions: (data.medicalConditions || []).join(", "),
              medications: (data.medications || []).join(", "),
              customCategories: (data.customCategories || []).join(", "),
            });
          } else {
            if (err?.code !== 'unavailable') {
              console.error("Error fetching profile", err);
            }
          }
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    try {
      const docRef = doc(db, "users", user.uid);
      
      const payload = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Unknown",
        age: profile.age ? parseInt(profile.age, 10) : null,
        gender: profile.gender,
        medicalConditions: profile.medicalConditions.split(",").map(c => c.trim()).filter(Boolean),
        medications: profile.medications.split(",").map(c => c.trim()).filter(Boolean),
        customCategories: profile.customCategories.split(",").map(c => c.trim()).filter(Boolean),
        createdAt: serverTimestamp(), // In real app, we typically fetch and resave if exists, but for rules we need it to match existing if it's an update, wait... 
      };

      // Best practice: check if exists first to maintain createdAt
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          await setDoc(docRef, { ...payload, createdAt: data.createdAt, updatedAt: serverTimestamp() }, { merge: true });
        } else {
          await setDoc(docRef, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
      } catch (err: any) {
        if (err?.code === 'unavailable') {
          // Offline, just update local storage and don't crash
        } else {
          throw err;
        }
      }
      
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify(payload));
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-lg mx-auto mt-10">
        <section className="bg-white rounded-3xl p-10 md:p-14 border border-slate-200/60 shadow-xl shadow-slate-200/40 text-center relative overflow-hidden">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900 mb-3">{t.tabProfile}</h2>
          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
            {t.profileDesc}
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
          >
            <User className="w-5 h-5" />
            {t.loginGoogle}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm w-full relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-14 h-14 rounded-2xl shadow-sm" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-md">
                <User className="w-6 h-6" />
              </div>
            )}
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900 leading-none mb-1">
                {user.displayName || "User"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowMedicalIdCard(true)}
              className="text-xs font-bold flex items-center gap-1.5 tracking-widest uppercase text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl transition-colors shadow-md shadow-rose-600/20"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">Medical ID</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-xs font-bold flex items-center gap-1.5 tracking-widest uppercase text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-2 mb-2 text-slate-700">
            <ShieldAlert className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-lg">{t.medicalProfile}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                {t.ageLabel}
              </label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 font-semibold"
                placeholder="Ex. 30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                {t.genderLabel}
              </label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 font-semibold appearance-none"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              {t.conditionsLabel}
            </label>
            <input
              type="text"
              value={profile.medicalConditions}
              onChange={(e) => setProfile({ ...profile, medicalConditions: e.target.value })}
              placeholder={t.conditionsPlaceholder}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              {t.medicationsLabel}
            </label>
            <input
              type="text"
              value={profile.medications}
              onChange={(e) => setProfile({ ...profile, medications: e.target.value })}
              placeholder={t.medicationsPlaceholder}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 font-semibold"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              {t.customKeywordsLabel || "Custom Keywords"}
            </label>
            <input
              type="text"
              value={profile.customCategories}
              onChange={(e) => setProfile({ ...profile, customCategories: e.target.value })}
              placeholder={t.customKeywordsPlaceholder || "e.g., Asthma Attack, Seizures"}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] mt-6 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? t.saving : t.saveProfile}
          </button>
        </form>

        {showToast && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 z-50">
            <Save className="w-4 h-4 text-emerald-400" />
            Profile Saved!
          </div>
        )}
      </section>

      {/* MEDICAL ID CARDS MODAL */}
      {showMedicalIdCard && createPortal(
        <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-rose-600 max-w-sm sm:max-w-md w-full rounded-[2.5rem] shadow-2xl overflow-hidden relative border-[6px] border-rose-500 flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowMedicalIdCard(false)}
              className="absolute top-5 right-5 w-10 h-10 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/30 transition-colors z-20"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="px-6 py-8 sm:px-8 sm:py-10 text-center bg-rose-700 relative shrink-0">
               <ShieldAlert className="w-14 h-14 text-white mb-3 mx-auto drop-shadow-md relative z-10" />
               <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-widest uppercase drop-shadow-md relative z-10">Medical ID</h2>
               <p className="text-rose-200 font-bold tracking-widest text-xs sm:text-sm uppercase mt-1 relative z-10">Priority Emergency Info</p>
            </div>
            
            <div className="bg-white p-6 sm:p-8 flex-1 flex flex-col gap-5 sm:gap-6 overflow-y-auto hide-scrollbar text-left items-stretch">
               <div className="text-center mb-1">
                 <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 uppercase tracking-tight">{user?.displayName || "Unknown Name"}</h3>
                 <p className="text-rose-600 font-bold text-base sm:text-lg mt-1 tracking-wider">
                   {profile.age ? `${profile.age} Y/O` : "AGE N/A"} • {profile.gender ? profile.gender.toUpperCase() : "GENDER N/A"}
                 </p>
               </div>
               
               <div className="bg-rose-50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-rose-100">
                  <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-rose-500 mb-2">Medical Conditions & Allergies</h4>
                  <p className="font-bold text-slate-800 text-base sm:text-lg leading-tight uppercase font-mono">
                    {profile.medicalConditions || "NONE REPORTED"}
                  </p>
               </div>

               <div className="bg-blue-50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-blue-100">
                  <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-blue-500 mb-2">Current Medications</h4>
                  <p className="font-bold text-slate-800 text-base sm:text-lg leading-tight uppercase font-mono">
                    {profile.medications || "NONE REPORTED"}
                  </p>
               </div>
               
               {profile.customCategories && (
                 <div className="bg-amber-50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-amber-100">
                    <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-500 mb-2">Critical Keywords</h4>
                    <p className="font-bold text-slate-800 text-base sm:text-lg leading-tight uppercase font-mono">
                      {profile.customCategories}
                    </p>
                 </div>
               )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
