import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { db } from '../../lib/firebase-admin';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Sparkles, Edit3, QrCode, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';

export async function getServerSideProps(context) {
  const { id } = context.params;
  
  if (!db) {
    return { props: { error: 'Система бази даних не налаштована' } };
  }

  try {
    const qrDoc = await db.collection('qrcodes').doc(id).get();

    if (!qrDoc.exists) {
      return { props: { notFound: true, id } };
    }

    const qrData = qrDoc.data();
    
    let profileData = null;
    if (qrData.status === 'claimed') {
      const profileDoc = await db.collection('profiles').doc(id).get();
      if (profileDoc.exists) {
        profileData = profileDoc.data();
      }
    }

    return {
      props: {
        id,
        status: qrData.status,
        ownerId: qrData.ownerId || null,
        bioText: profileData ? profileData.bioText : 'Привіт! Я власник цієї футболки.',
        ownerName: profileData ? (profileData.ownerName || 'Власник футболки') : 'Власник футболки',
        updatedAt: profileData ? profileData.updatedAt : null,
      }
    };
  } catch (error) {
    console.error('Error fetching QR details:', error);
    return { props: { error: 'Помилка завантаження профілю' } };
  }
}

export default function PublicQRProfile({ id, status, ownerId, bioText, ownerName, updatedAt, notFound, error }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isOwner = currentUser && ownerId && currentUser.uid === ownerId;

  // Not Found State
  if (notFound) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden select-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-600 rounded-full blur-[120px] opacity-25"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-600 rounded-full blur-[120px] opacity-25"></div>
        
        <div className="z-10 text-center max-w-md space-y-6">
          <div className="w-20 h-20 mx-auto bg-red-950/20 border border-red-500/20 text-red-500 rounded-3xl flex items-center justify-center shadow-2xl">
            <QrCode size={40} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">УПС! КОД НЕ ЗНАЙДЕНО</h1>
          <p className="text-zinc-400 leading-relaxed text-sm">
            Цей QR-код ще не зареєстрований у системі BRIGHT SHOP. Перевірте правильність посилання або зверніться до підтримки.
          </p>
          <div className="pt-4">
            <Link href="/" className="inline-block bg-white text-black hover:bg-pink-600 hover:text-white px-8 py-4 rounded-full font-black uppercase tracking-wider transition-all shadow-xl">
              НА ГОЛОВНУ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="text-center max-w-md space-y-4">
          <p className="text-red-500 text-lg font-bold">Помилка: {error}</p>
          <Link href="/" className="inline-block bg-zinc-900 border border-zinc-800 text-white px-6 py-3 rounded-full text-sm font-bold uppercase transition-all">
            Спробувати знову
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{status === 'claimed' ? 'Унікальний профіль | BRIGHT SHOP' : 'Активація мерчу | BRIGHT SHOP'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,700;1,800&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-500 to-pink-850 text-white flex flex-col justify-between p-6 font-sans relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        {/* Glow Effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-white rounded-full blur-[140px] opacity-15 animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-pink-300 rounded-full blur-[140px] opacity-15 animate-pulse" style={{ animationDuration: '8s' }}></div>

        {/* Top Header */}
        <div className="w-full max-w-lg mx-auto flex justify-between items-center z-10 pt-4">
          <Link href="/" className="text-2xl font-black uppercase tracking-tighter italic text-white flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            BRIGHT <span className="text-white">LOOK</span>
          </Link>
          {isOwner && (
            <Link 
              href={`/cabinet?id=${id}`}
              className="bg-white hover:bg-pink-900 text-black hover:text-white font-bold text-xs uppercase px-4 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-md shadow-pink-950/30"
            >
              <Edit3 size={14} /> Редагувати
            </Link>
          )}
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-lg mx-auto flex-grow flex items-center justify-center py-12 z-10">
          
          {status === 'unclaimed' ? (
            /* --- UNCLAIMED STATE --- */
            <div className="w-full bg-pink-950/45 border border-pink-400/20 rounded-[32px] p-8 md:p-10 shadow-2xl text-center space-y-8 backdrop-blur-xl relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black font-black text-xs uppercase px-5 py-2 rounded-full tracking-widest italic animate-bounce shadow-lg">
                НОВА ФУТБОЛКА!
              </div>

              <div className="w-20 h-20 mx-auto bg-white/10 border border-white/20 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-pink-950/15">
                <QrCode size={40} />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">ЦЯ ФУТБОЛКА ЩЕ ВІЛЬНА</h2>
                <p className="text-pink-100/70 text-sm leading-relaxed">
                  Будь-хто, хто сканує цей QR-код, потрапляє сюди. Заявіть права на неї, щоб створити свій унікальний мікро-профіль!
                </p>
              </div>

              <div className="pt-4">
                <Link 
                  href={`/cabinet?claim=${id}`}
                  className="w-full bg-white text-black hover:bg-pink-900 hover:text-white py-5 px-8 font-black uppercase text-lg tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  АКТИВУВАТИ ФУТБОЛКУ <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          ) : (
            /* --- CLAIMED STATE --- */
            <div className="w-full bg-pink-950/45 border border-pink-400/20 rounded-[32px] p-8 md:p-10 shadow-2xl space-y-8 backdrop-blur-xl relative flex flex-col">
              
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 border-b border-pink-500/10 pb-6">
                <div className="w-14 h-14 bg-gradient-to-tr from-pink-500 to-rose-600 border border-pink-400/20 rounded-2xl flex items-center justify-center shadow-md shadow-pink-950/20 font-black italic text-xl uppercase">
                  B
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight text-white flex items-center gap-2 break-all pr-2">
                    {ownerName} <Sparkles className="text-white" size={16} />
                  </h3>
                  <p className="text-xs text-pink-200/50 font-bold uppercase tracking-wider">
                    Оновлено:{' '}
                    {updatedAt ? new Date(updatedAt).toLocaleDateString('uk-UA', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : 'щойно'}
                  </p>
                </div>
              </div>

              {/* Bio Message - The core feature */}
              <div className="flex-grow py-4">
                <div className="bg-pink-900/20 border border-pink-500/10 rounded-2xl p-6 min-h-[140px] flex items-center justify-center text-center">
                  <p className="text-white text-lg font-bold leading-relaxed italic whitespace-pre-line">
                    "{bioText}"
                  </p>
                </div>
              </div>

              {/* Action Buttons if owner */}
              {isOwner && (
                <div className="pt-2 text-center">
                  <span className="text-xs font-bold text-pink-100/70 bg-pink-900/40 px-3 py-1.5 rounded-full border border-pink-500/10">
                    Це ваша публічна сторінка
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Brand Promo */}
        <div className="w-full max-w-lg mx-auto text-center z-10 pb-4 pt-6 border-t border-pink-500/15">
          <p className="text-pink-200/50 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            Зроблено з характером в
            <Link href="/" className="text-white hover:underline inline-flex items-center gap-1 font-black">
              BRIGHT SHOP <ShoppingBag size={12} />
            </Link>
          </p>
        </div>

      </div>
    </>
  );
}
