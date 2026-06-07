import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { 
  QrCode, Sparkles, Smartphone, ChevronRight, ShoppingBag, 
  ArrowRight, ShieldCheck, Cpu, RefreshCw, MessageCircle 
} from 'lucide-react';

export default function DigitalMerchAbout() {
  const [simName, setSimName] = useState('Твій Нікнейм');
  const [simBio, setSimBio] = useState('Привіт! Це демонстрація того, як будь-хто зможе побачити твій кастомний статус, просто відсканувавши QR-код на твоїй футболці.');

  return (
    <Layout title="Цифровий мерч BRIGHT LOOK | BRIGHT SHOP">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,700;1,800&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-500 to-pink-850 text-white pt-28 pb-16 px-4 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-white rounded-full blur-[160px] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-300 rounded-full blur-[160px] opacity-15 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          
          {/* HERO SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8">
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-pink-100">
                <Sparkles size={12} /> НОВА ЕРА УТИЛІТАРНОГО МЕРЧУ
              </span>
              <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter italic leading-none">
                ЦЕ НЕ ПРОСТО <span className="text-pink-200">ОДЯГ.</span> <br />
                ЦЕ ТВОЯ <span className="text-white">МЕДІА-ПЛАТФОРМА.</span>
              </h1>
              <p className="text-pink-100/80 text-base sm:text-lg font-bold leading-relaxed max-w-xl">
                Зустрічай **BRIGHT LOOK** — лінійку інтерактивного мерчу з динамічними профілями. 
                Один раз купуєш футболку, а її контент змінюєш щодня через власний кабінет.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/catalog" 
                  className="bg-white text-black hover:bg-pink-900 hover:text-white px-8 py-4.5 rounded-2xl font-black uppercase text-sm tracking-wider transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} /> ПЕРЕЙТИ ДО КАТАЛОГУ
                </Link>
                <Link 
                  href="/cabinet" 
                  className="border border-white/20 hover:bg-white/10 text-white px-8 py-4.5 rounded-2xl font-black uppercase text-sm tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  УВІЙТИ В КАБІНЕТ <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              {/* Beautiful Visual Card */}
              <div className="w-[300px] h-[400px] bg-pink-950/40 border border-pink-400/20 rounded-[40px] shadow-2xl p-6 relative overflow-hidden backdrop-blur-xl flex flex-col justify-between">
                <div className="absolute top-[-20%] right-[-20%] w-[180px] h-[180px] bg-white rounded-full blur-[60px] opacity-10"></div>
                
                <div className="flex justify-between items-center border-b border-pink-500/10 pb-3">
                  <span className="font-black italic text-xs tracking-wider">BRIGHT LOOK</span>
                  <QrCode className="text-pink-300" size={18} />
                </div>

                <div className="space-y-4 my-auto py-6">
                  <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-pink-950/25">
                    <QrCode size={36} />
                  </div>
                  <h3 className="text-lg font-black uppercase italic tracking-tighter text-center">UUID АКТИВАЦІЯ</h3>
                  <p className="text-center text-xs text-pink-200/70 leading-relaxed font-bold">
                    Кожна футболка оснащена унікальним, стійким до прання QR-кодом на фірмовій бірці.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-pink-200/50 uppercase tracking-widest font-bold">
                    Status: Fully Connected ⚡️
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* HOW IT WORKS SECTION */}
          <div className="space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic">ЯК ЦЕ ПРАЦЮЄ?</h2>
              <p className="text-pink-200/70 text-xs sm:text-sm uppercase tracking-wider font-bold">4 простих кроки до запуску твого цифрового мерчу</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { 
                  icon: <ShoppingBag size={24} />, 
                  step: '01', 
                  title: 'ЗАМОВ ФУТБОЛКУ', 
                  desc: 'Обери улюблену річ з принтованим кодом у нашому каталозі.' 
                },
                { 
                  icon: <QrCode size={24} />, 
                  step: '02', 
                  title: 'ВІДСКАНУЙ QR', 
                  desc: 'Просто наведи камеру свого телефона на код, щоб відкрити посилання.' 
                },
                { 
                  icon: <Cpu size={24} />, 
                  step: '03', 
                  title: 'АКТИВУЙ В КАБІНЕТІ', 
                  desc: 'Зареєструй акаунт в один клік і закріпи річ за своїм профілем.' 
                },
                { 
                  icon: <RefreshCw size={24} />, 
                  step: '04', 
                  title: 'КАСТОМІЗУЙ STATUS', 
                  desc: 'Пиши думки, міняй нікнейми, ділися лінками. Все оновлюється миттєво!' 
                }
              ].map((item, index) => (
                <div key={index} className="bg-pink-950/40 border border-pink-500/20 p-6 rounded-3xl relative backdrop-blur-xl shadow-xl space-y-4 hover:scale-[1.02] transition-transform duration-300">
                  <span className="absolute top-4 right-6 text-4xl font-black italic text-pink-300/10 select-none">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-md">
                    {item.icon}
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-tight text-white">{item.title}</h4>
                  <p className="text-xs text-pink-200/70 leading-relaxed font-bold">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* INTERACTIVE SIMULATOR */}
          <div className="bg-pink-950/40 border border-pink-500/20 rounded-[32px] p-8 sm:p-12 shadow-xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic">
                СПРОБУЙ СИМУЛЯТОР
              </h2>
              <p className="text-pink-200/80 text-sm font-bold leading-relaxed">
                Спробуй ввести своє ім'я та статус нижче, щоб побачити, як виглядатиме твоя сторінка в реальному часі на екрані телефона.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-pink-200 font-bold">Ваше ім'я або Нікнейм</label>
                  <input
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    maxLength={50}
                    className="w-full px-4 py-3.5 bg-pink-950/40 border border-pink-500/20 rounded-xl focus:border-white focus:outline-none text-white font-bold text-sm transition-all"
                    placeholder="Напиши своє ім'я..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-pink-200 font-bold">Ваш маніфест / Думка</label>
                  <textarea
                    value={simBio}
                    onChange={(e) => setSimBio(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3.5 bg-pink-950/40 border border-pink-500/20 rounded-xl focus:border-white focus:outline-none text-white font-bold text-sm leading-relaxed transition-all resize-none"
                    placeholder="Що ти хочеш сказати сьогодні?"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              {/* Phone Mockup */}
              <div className="w-[260px] h-[520px] bg-pink-950 border-[6px] border-pink-900/80 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-between p-4 select-none">
                
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-pink-900/80 rounded-b-2xl z-20"></div>
                
                {/* Phone screen glows */}
                <div className="absolute top-[-20%] right-[-20%] w-[150px] h-[150px] bg-pink-500 rounded-full blur-[60px] opacity-15 pointer-events-none"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[150px] h-[150px] bg-rose-500 rounded-full blur-[60px] opacity-15 pointer-events-none"></div>

                <div className="flex justify-between items-center z-10 pt-2 border-b border-pink-900/30 pb-2">
                  <span className="text-[10px] font-black tracking-tighter italic text-white/95">BRIGHT LOOK</span>
                  <span className="text-[8px] font-bold bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-full">
                    Live Preview
                  </span>
                </div>

                <div className="flex-grow flex items-center justify-center py-6 z-10">
                  <div className="w-full bg-pink-900/20 border border-pink-500/10 rounded-2xl p-4 flex flex-col space-y-4 backdrop-blur-md">
                    <div className="flex items-center gap-2 border-b border-pink-500/10 pb-3">
                      <div className="w-8 h-8 bg-gradient-to-tr from-pink-600 to-rose-600 rounded-lg flex items-center justify-center font-black italic text-xs uppercase">
                        B
                      </div>
                      <div>
                        <p className="font-black text-xs text-white break-all">{simName || 'Власник футболки'}</p>
                        <p className="text-[7px] text-pink-200/50 font-bold uppercase tracking-wider mt-0.5">Щойно оновлено</p>
                      </div>
                    </div>
                    <div className="bg-pink-950/60 border border-pink-500/10 p-3 rounded-xl min-h-[90px] flex items-center justify-center text-center">
                      <p className="text-zinc-200 text-xs italic font-bold leading-normal whitespace-pre-line line-clamp-6">
                        "{simBio || 'Твій кастомний текст тут...'}"
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

          {/* ADVANTAGES & FEATURES SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 text-left">
              <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
                <ShieldCheck size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm uppercase tracking-tight text-white">Безпека даних</h4>
                <p className="text-xs text-pink-200/70 leading-relaxed font-bold">Усі дані надійно захищені та управляються лише власником футболки через Firebase Auth.</p>
              </div>
            </div>
            
            <div className="flex gap-4 text-left">
              <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
                <RefreshCw size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm uppercase tracking-tight text-white">Миттєве оновлення</h4>
                <p className="text-xs text-pink-200/70 leading-relaxed font-bold">Зміна статусу в кабінеті оновлює публічну сторінку за мілісекунди без перезавантаження.</p>
              </div>
            </div>

            <div className="flex gap-4 text-left">
              <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
                <MessageCircle size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm uppercase tracking-tight text-white">Твоя унікальність</h4>
                <p className="text-xs text-pink-200/70 leading-relaxed font-bold">Вказуй посилання на соцмережі, контакти, ділися ідеями або створюй інтерактивні квести.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
