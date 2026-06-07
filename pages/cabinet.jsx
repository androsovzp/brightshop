import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdToken,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  QrCode, LogOut, Loader2, Sparkles, Copy, Check, ExternalLink, 
  Smartphone, User, Lock, Mail, Plus, AlertCircle 
} from 'lucide-react';

export default function Cabinet() {
  const router = useRouter();
  const { claim, id: queryId } = router.query;

  // Authentication State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Dashboard Data State
  const [merchList, setMerchList] = useState([]);
  const [loadingMerch, setLoadingMerch] = useState(false);
  const [selectedMerch, setSelectedMerch] = useState(null);
  
  // Editor State
  const [bioText, setBioText] = useState('');
  const [ownerName, setOwnerName] = useState('Власник футболки');
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState('');
  const [editorSuccess, setEditorSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Manual Claim Input State
  const [manualClaimId, setManualClaimId] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');

  // 1. Auth Change Listener
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        fetchUserMerch(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Handle Claim Redirect after Log In
  useEffect(() => {
    if (user && claim) {
      handleClaimCode(claim);
      // Clean query params
      router.replace('/cabinet', undefined, { shallow: true });
    }
  }, [user, claim]);

  // Fetch all user QR codes
  const fetchUserMerch = async (currentUser) => {
    setLoadingMerch(true);
    try {
      const token = await getIdToken(currentUser);
      const res = await fetch('/api/qr/user-list', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMerchList(data.merch || []);
        
        // Auto select a item
        if (data.merch && data.merch.length > 0) {
          // If queryId is provided, select it, otherwise select first item
          const initialSelection = queryId 
            ? data.merch.find(m => m.id === queryId) || data.merch[0]
            : data.merch[0];
          setSelectedMerch(initialSelection);
          setBioText(initialSelection.bioText || '');
          setOwnerName(initialSelection.ownerName || 'Власник футболки');
        }
      }
    } catch (err) {
      console.error('Error fetching user merch:', err);
    } finally {
      setLoadingMerch(false);
    }
  };

  // Claim process
  const handleClaimCode = async (codeToClaim) => {
    if (!user) return;
    setClaiming(true);
    setClaimError('');
    try {
      const token = await getIdToken(user);
      const res = await fetch('/api/qr/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: codeToClaim })
      });

      if (res.ok) {
        setAuthSuccessMsg('Футболку успішно активовано та додано до кабінету!');
        setManualClaimId('');
        await fetchUserMerch(user);
      } else {
        const data = await res.json();
        setClaimError(data.error || 'Не вдалося активувати код. Можливо, він вже активований.');
      }
    } catch (err) {
      setClaimError('Помилка зв\'язку при активації');
    } finally {
      setClaiming(false);
    }
  };

  // Auth actions
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    if (!email || !password) return;
    if (!auth) {
      setAuthError('Сервіс авторизації недоступний. Перевірте налаштування Firebase.');
      return;
    }

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      let msg = 'Помилка авторизації';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Неправильний email або пароль';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Цей email вже використовується';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Пароль має бути не менше 6 символів';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Некоректний формат email';
      }
      setAuthError(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthSuccessMsg('');
    if (!auth) {
      setAuthError('Сервіс авторизації недоступний. Перевірте налаштування Firebase.');
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google sign in error:', err);
      let msg = 'Не вдалося увійти через Google';
      if (err.code === 'auth/popup-blocked') {
        msg = 'Браузер заблокував спливаюче вікно. Дозвольте спливаючі вікна для цього сайту.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Вікно авторизації було закрите користувачем.';
      }
      setAuthError(msg);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setMerchList([]);
      setSelectedMerch(null);
      setBioText('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Save changes
  const handleSaveBio = async () => {
    if (!user || !selectedMerch) return;
    setSaving(true);
    setEditorError('');
    setEditorSuccess(false);

    try {
      const token = await getIdToken(user);
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: selectedMerch.id, bioText, ownerName })
      });

      if (res.ok) {
        setEditorSuccess(true);
        // Update local list
        setMerchList(prev => prev.map(m => m.id === selectedMerch.id ? { ...m, bioText, ownerName } : m));
        setSelectedMerch(prev => ({ ...prev, bioText, ownerName }));
        setTimeout(() => setEditorSuccess(false), 3000);
      } else {
        const data = await res.json();
        setEditorError(data.error || 'Не вдалося зберегти зміни');
      }
    } catch (err) {
      setEditorError('Помилка з\'єднання з сервером');
    } finally {
      setSaving(false);
    }
  };

  const copyProfileLink = (id) => {
    const link = `${window.location.origin}/p/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (authLoading) {
    return (
      <Layout title="Особистий кабінет | BRIGHT SHOP">
        <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-500 to-pink-850 text-white flex items-center justify-center pt-24">
          <div className="text-center space-y-4">
            <Loader2 className="animate-spin text-white mx-auto" size={40} />
            <p className="text-pink-100 font-bold uppercase tracking-widest text-xs">Завантаження кабінету...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // --- UNAUTHENTICATED: LOGIN / REGISTRATION ---
  if (!user) {
    return (
      <Layout title={isRegisterMode ? "Реєстрація | BRIGHT SHOP" : "Вхід | BRIGHT SHOP"}>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,700;1,800&display=swap" rel="stylesheet" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-500 to-pink-850 text-white flex items-center justify-center px-4 pt-32 pb-16 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          
          {/* Neon Glow */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-white rounded-full blur-[140px] opacity-15"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300 rounded-full blur-[140px] opacity-15"></div>

          <div className="w-full max-w-md bg-pink-950/40 border border-pink-400/20 p-8 rounded-[32px] shadow-2xl relative z-10 backdrop-blur-xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-white/10 border border-white/20 text-white rounded-2xl flex items-center justify-center mb-4">
                <User size={28} />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic">
                {isRegisterMode ? 'СТВОРИТИ АКАУНТ' : 'МІНІ-КАБІНЕТ'}
              </h1>
              <p className="text-xs text-pink-200/70 font-bold uppercase tracking-wider mt-1 text-center">
                {isRegisterMode ? 'Зареєструйтесь для активації QR-коду' : 'Керуйте своєю публічною сторінкою'}
              </p>
            </div>

            {/* Success notification from claim redirects */}
            {claim && (
              <div className="mb-6 p-4 bg-pink-950/60 border border-pink-500/20 rounded-2xl flex items-start gap-3">
                <Sparkles className="text-white shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-pink-100 font-bold leading-relaxed">
                  Увійдіть або зареєструйтесь, щоб автоматично закріпити футболку з QR-кодом за вашим профілем.
                </p>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-4.5 text-pink-200/50" size={18} />
                <input
                  type="email"
                  placeholder="Введіть email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-pink-950/40 border border-pink-500/20 rounded-2xl focus:border-white focus:outline-none text-white font-bold text-sm transition-all placeholder-pink-200/30"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-4.5 text-pink-200/50" size={18} />
                <input
                  type="password"
                  placeholder="Пароль (мін. 6 символів)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-pink-950/40 border border-pink-500/20 rounded-2xl focus:border-white focus:outline-none text-white font-bold text-sm transition-all placeholder-pink-200/30"
                  required
                />
              </div>

              {authError && (
                <div className="p-4 bg-red-950/30 border border-red-900/40 text-red-300 text-xs font-bold rounded-2xl text-center">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-white text-black hover:bg-pink-900 hover:text-white py-4.5 font-black uppercase text-base tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center cursor-pointer"
              >
                {isRegisterMode ? 'ЗАРЕЄСТРУВАТИСЯ' : 'УВІЙТИ'}
              </button>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-pink-500/20"></div>
                <span className="mx-4 text-xs font-bold text-pink-200/60 uppercase">або</span>
                <div className="flex-grow border-t border-pink-500/20"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-pink-950/40 hover:bg-pink-900/60 text-white py-4 border border-pink-500/20 font-black uppercase text-sm tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                УВІЙТИ З GOOGLE
              </button>
            </form>

            <div className="mt-8 text-center border-t border-pink-500/20 pt-6">
              <button
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setAuthError('');
                }}
                className="text-sm font-bold text-pink-200 hover:text-white transition-colors cursor-pointer"
              >
                {isRegisterMode ? 'Вже маєте акаунт? Увійти' : 'Немає акаунту? Зареєструватися'}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // --- AUTHENTICATED: DASHBOARD ---
  return (
    <Layout title="Особистий кабінет | BRIGHT SHOP">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,700;1,800&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-500 to-pink-850 text-white pt-32 pb-16 px-4 md:px-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Block */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-pink-500/20 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                ОСОБИСТИЙ КАБІНЕТ
              </h1>
              <p className="text-pink-200/70 text-sm mt-1">
                Ви увійшли як: <span className="text-white font-bold">{user.email}</span>
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="border border-white/20 hover:border-red-400/30 hover:bg-red-950/15 text-pink-100 hover:text-red-400 px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs transition-all flex items-center gap-2 cursor-pointer self-start md:self-center"
            >
              <LogOut size={16} /> Вийти з акаунту
            </button>
          </div>

          {/* Success messages */}
          {authSuccessMsg && (
            <div className="p-4 bg-green-950/40 border border-green-900/40 rounded-2xl text-green-300 font-bold text-sm text-center flex items-center justify-center gap-2">
              <Check size={18} /> {authSuccessMsg}
            </div>
          )}

          {/* Dashboard Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: User Merch / Claims (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Claim New QR card */}
              <div className="bg-pink-950/40 border border-pink-500/20 p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl">
                <h3 className="font-black uppercase tracking-tighter italic text-sm flex items-center gap-2">
                  <Plus className="text-white" size={18} /> Активація нової футболки
                </h3>
                <p className="text-xs text-pink-200/70">
                  Введіть унікальний UUID код, вказаний на бірці або під QR-кодом вашої футболки.
                </p>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Введіть UUID"
                    value={manualClaimId}
                    onChange={(e) => setManualClaimId(e.target.value)}
                    className="w-full px-4 py-3 bg-pink-950/40 border border-pink-500/20 rounded-xl focus:border-white focus:outline-none text-white font-mono text-xs placeholder-pink-200/30"
                  />
                  {claimError && (
                    <p className="text-red-300 text-xs font-bold leading-relaxed">{claimError}</p>
                  )}
                  <button
                    onClick={() => handleClaimCode(manualClaimId)}
                    disabled={claiming || !manualClaimId}
                    className="w-full bg-pink-900/60 hover:bg-white hover:text-black text-white py-3 font-black uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-pink-500/20"
                  >
                    {claiming ? <Loader2 className="animate-spin" size={14} /> : 'АКТИВУВАТИ'}
                  </button>
                </div>
              </div>

              {/* My Clothes List */}
              <div className="bg-pink-950/40 border border-pink-500/20 rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-pink-500/20">
                  <h3 className="font-black uppercase tracking-tighter italic text-sm">Твій цифровий мерч</h3>
                </div>

                {loadingMerch ? (
                  <div className="py-12 text-center text-pink-200/60">
                    <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Отримання списку...</span>
                  </div>
                ) : merchList.length === 0 ? (
                  <div className="p-8 text-center text-pink-200/50 space-y-4">
                    <QrCode size={36} className="mx-auto text-pink-300/20" />
                    <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">
                      У вас ще немає активованих виробів.<br />
                      Скористайтеся формою вище або відскануйте QR.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-pink-500/10 max-h-[300px] overflow-y-auto">
                    {merchList.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMerch(m);
                          setBioText(m.bioText || '');
                          setOwnerName(m.ownerName || 'Власник футболки');
                        }}
                        className={`w-full p-5 text-left transition-colors flex items-center justify-between group ${
                          selectedMerch?.id === m.id ? 'bg-pink-600/30' : 'hover:bg-pink-900/20'
                        }`}
                      >
                        <div>
                          <p className="font-black text-sm text-white flex items-center gap-1.5 uppercase">
                            Premium T-Shirt
                            {selectedMerch?.id === m.id && (
                              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            )}
                          </p>
                          <p className="text-[10px] text-pink-200/50 font-mono mt-0.5">ID: {m.id.substring(0, 8)}...</p>
                        </div>
                        <span className="text-xs text-pink-200/70 font-bold group-hover:text-white transition-colors uppercase">
                          Редагувати
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Selected Shirt Editor & Preview (8 cols) */}
            <div className="lg:col-span-8">
              {!selectedMerch ? (
                <div className="bg-pink-950/40 border border-pink-500/20 rounded-[32px] py-32 text-center text-pink-200/50 font-bold uppercase tracking-widest text-sm backdrop-blur-xl">
                  Оберіть або активуйте футболку зі списку
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* TEXT EDITOR FORM (7 cols) */}
                  <div className="md:col-span-7 bg-pink-950/40 border border-pink-500/20 p-8 rounded-[32px] shadow-xl space-y-6 backdrop-blur-xl">
                    <div>
                      <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">
                          Налаштування тексту
                        </h2>
                        <span className="text-[10px] font-mono text-pink-200/70 bg-pink-900/30 px-2.5 py-1 rounded border border-pink-500/10">
                          ID: {selectedMerch.id.substring(0,8)}...
                        </span>
                      </div>
                      <p className="text-xs text-pink-200/50 mt-1">Цей текст побачить кожен, хто сканує ваш QR-код.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-pink-200/70">
                        <span>Ваше ім'я / Нікнейм</span>
                        <span className={ownerName.length > 50 ? 'text-red-300' : 'text-pink-300'}>
                          {ownerName.length} / 50
                        </span>
                      </div>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => {
                          setOwnerName(e.target.value);
                          setEditorError('');
                        }}
                        placeholder="Введіть ваше ім'я або нікнейм"
                        maxLength={50}
                        className="w-full px-5 py-4 bg-pink-950/40 border border-pink-500/20 rounded-2xl focus:border-white focus:outline-none text-white font-bold text-sm transition-all placeholder-pink-200/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-pink-200/70">
                        <span>Ваш маніфест / статус</span>
                        <span className={bioText.length > 500 ? 'text-red-300' : 'text-pink-300'}>
                          {bioText.length} / 500
                        </span>
                      </div>
                      <textarea
                        value={bioText}
                        onChange={(e) => {
                          setBioText(e.target.value);
                          setEditorError('');
                        }}
                        placeholder="Напишіть щось про себе, свій бренд, залиште контакти або свій настрій дня..."
                        maxLength={500}
                        rows={6}
                        className="w-full px-5 py-4 bg-pink-950/40 border border-pink-500/20 rounded-2xl focus:border-white focus:outline-none text-white font-bold leading-relaxed text-sm transition-all resize-none placeholder-pink-200/30"
                      />
                    </div>

                    {editorError && (
                      <p className="text-red-300 text-xs font-bold bg-red-950/30 border border-red-900/40 p-4 rounded-2xl text-center">
                        {editorError}
                      </p>
                    )}

                    {editorSuccess && (
                      <p className="text-green-300 text-xs font-bold bg-green-950/30 border border-green-900/40 p-4 rounded-2xl text-center flex items-center justify-center gap-1.5">
                        <Check size={14} /> Зміни збережено та опубліковано!
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleSaveBio}
                        disabled={saving || bioText.length > 500}
                        className="flex-grow bg-white text-black hover:bg-pink-900 hover:text-white disabled:bg-pink-950/40 disabled:text-pink-300/40 py-4 font-black uppercase text-sm tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : 'Зберегти зміни'}
                      </button>

                      <button
                        onClick={() => copyProfileLink(selectedMerch.id)}
                        className="border border-pink-500/20 hover:bg-pink-900/20 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {copiedLink ? (
                          <>
                            <Check size={16} className="text-green-300" /> СКОПІЙОВАНО
                          </>
                        ) : (
                          <>
                            <Copy size={16} /> СКОПІЮВАТИ ЛІНК
                          </>
                        )}
                      </button>
                    </div>

                    <div className="border-t border-pink-500/15 pt-6">
                      <a 
                        href={`/p/${selectedMerch.id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-white hover:underline inline-flex items-center gap-1 font-bold uppercase tracking-wider"
                      >
                        Переглянути публічну сторінку в новій вкладці <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {/* PREVIEW CONTAINER (5 cols) */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    <p className="text-xs font-bold text-pink-200/50 uppercase tracking-widest mb-3 flex items-center gap-1">
                      <Smartphone size={14} /> Live Прев'ю сторінки
                    </p>
                    
                    {/* Mock phone preview container */}
                    <div className="w-[260px] h-[520px] bg-pink-950 border-[6px] border-pink-900/80 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-between p-4 scale-95 origin-top select-none">
                      
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-pink-900/80 rounded-b-2xl z-20"></div>
                      
                      {/* Live page details inside mock frame */}
                      <div className="absolute top-[-20%] right-[-20%] w-[150px] h-[150px] bg-pink-500 rounded-full blur-[60px] opacity-15 pointer-events-none"></div>
                      <div className="absolute bottom-[-20%] left-[-20%] w-[150px] h-[150px] bg-rose-500 rounded-full blur-[60px] opacity-15 pointer-events-none"></div>

                      <div className="flex justify-between items-center z-10 pt-2 border-b border-pink-900/30 pb-2">
                        <span className="text-[10px] font-black tracking-tighter italic text-white/95">BRIGHT LOOK</span>
                        <span className="text-[8px] font-bold bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-full">
                          Live
                        </span>
                      </div>

                      <div className="flex-grow flex items-center justify-center py-6 z-10">
                        <div className="w-full bg-pink-900/20 border border-pink-500/10 rounded-2xl p-4 flex flex-col space-y-4 backdrop-blur-md">
                          <div className="flex items-center gap-2 border-b border-pink-500/10 pb-3">
                            <div className="w-8 h-8 bg-gradient-to-tr from-pink-600 to-rose-600 rounded-lg flex items-center justify-center font-black italic text-xs uppercase">
                              B
                            </div>
                            <div>
                              <p className="font-black text-xs text-white break-all">{ownerName || 'Власник футболки'}</p>
                              <p className="text-[7px] text-pink-200/50 font-bold uppercase tracking-wider mt-0.5">Щойно оновлено</p>
                            </div>
                          </div>
                          <div className="bg-pink-950/60 border border-pink-500/10 p-3 rounded-xl min-h-[90px] flex items-center justify-center text-center">
                            <p className="text-zinc-200 text-xs italic font-bold leading-normal whitespace-pre-line line-clamp-6">
                              "{bioText || 'Ваш маніфест тут...'}"
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center z-10 pb-2">
                        <p className="text-[7px] text-pink-300/40 font-bold uppercase tracking-widest">
                          Powered by BRIGHT SHOP
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}
