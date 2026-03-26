import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="py-24 bg-black text-white border-t-[16px] border-pink-600 mt-20 text-left">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div>
            <div className="text-4xl font-black tracking-tighter text-pink-600 italic mb-8 uppercase">BRIGHT SHOP</div>
            <p className="text-gray-400 font-bold leading-relaxed italic">Мерч із характером. Для тих, хто створює свій світ.</p>
          </div>
          <div>
            <h5 className="font-black uppercase text-xs tracking-[0.3em] mb-10 text-pink-600">Навігація</h5>
            <ul className="space-y-4 font-black uppercase text-sm italic tracking-tight">
              <li><Link href="/" className="hover:text-pink-600">Головна</Link></li>
              <li><Link href="/catalog" className="hover:text-pink-600">Каталог</Link></li>
              <li><Link href="/about" className="hover:text-pink-600">Про нас</Link></li>
              <li><Link href="/customizer" className="hover:text-pink-600">Свій дизайн</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-10 border-t border-white/10 text-center text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">
          © 2024 BRIGHT LOOK MERCH GROUP.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
