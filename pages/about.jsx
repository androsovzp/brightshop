import React from 'react';
import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout title="Про бренд | BRIGHT SHOP">
      <section className="pt-48 pb-20 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-pink-600/10 skew-x-12 translate-x-20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl text-left">
            <h1 className="text-6xl md:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase mb-12 italic">
              МИ НЕ <br />ПРОСТО <br /> <span className="text-pink-600 outline-text">ОДЯГ.</span>
            </h1>
            <p className="text-2xl md:text-5xl font-black leading-tight tracking-tight text-white border-l-8 border-pink-600 pl-8 italic mb-20">
              BRIGHT SHOP — це маніфест для тих, хто не боїться бути занадто яскравою.
            </p>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white text-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="text-left space-y-8">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                ФІЛОСОФІЯ <span className="text-pink-600 italic">BRIGHT.</span>
              </h2>
              <div className="space-y-6 text-xl font-bold italic text-gray-500 tracking-tight leading-relaxed">
                <p>Тут немає місця нудьзі та сірим правилам. Ми створили цей бренд для дівчат, які самі вирішують, яким буде їхній день.</p>
                <p>Кожна річ у нашому каталозі — це не просто тканина. Це інструмент твого самовираження. Це твій характер, вишитий на світшоті або надрукований на футболці.</p>
              </div>
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div>
                  <div className="text-4xl font-black text-pink-600 mb-2">100%</div>
                  <div className="font-black uppercase text-[10px] tracking-widest text-black">Твій характер</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-pink-600 mb-2">∞</div>
                  <div className="font-black uppercase text-[10px] tracking-widest text-black">Твій дизайн</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] bg-pink-600 rounded-[3rem] overflow-hidden rotate-3 shadow-2xl relative z-10 flex items-center justify-center">
                 <div className="text-white font-black text-6xl uppercase tracking-tighter italic opacity-30 transform -rotate-12">CHARACTER</div>
              </div>
              <div className="absolute inset-0 bg-black rounded-[3rem] -rotate-3 z-0"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-gray-50 text-black overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-none">
              ЧОМУ <span className="text-pink-600 italic">САМЕ МИ?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "ЯКІСТЬ PREM", text: "Ми не економимо на тканинах. Тільки преміальна бавовна, яка витримає всі твої вечірки." },
              { title: "ТВІЙ ДИЗАЙН", text: "Наш конструктор дозволяє тобі бути дизайнером. Твій принт — твої правила." },
              { title: "ШВИДКИЙ ВАЙБ", text: "Доставка, що встигає за твоїм ритмом життя. Без зайвих очікувань." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-12 rounded-[2rem] shadow-xl border-b-8 border-pink-600 text-left hover:-translate-y-4 transition-transform duration-500">
                <h3 className="font-black uppercase text-2xl mb-6 tracking-tighter">{item.title}</h3>
                <p className="font-bold italic text-gray-400 leading-relaxed text-lg">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-40 bg-pink-600 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter leading-none mb-12">
            ГОТОВА БУТИ <br /><span className="italic outline-text-white">BRIGHT?</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/catalog" className="bg-black text-white px-12 py-6 font-black text-2xl uppercase hover:bg-white hover:text-pink-600 transition-all shadow-2xl">
              У КАТАЛОГ 🔥
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

