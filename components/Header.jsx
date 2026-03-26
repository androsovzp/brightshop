import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = ({ scrolled, isHome }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
      scrolled || !isHome ? 'bg-white shadow-2xl' : 'bg-transparent'
    }`}>
      <div className="bg-pink-600 text-white py-2 overflow-hidden whitespace-nowrap relative">
        <div className="animate-marquee inline-block font-black text-[10px] md:text-xs tracking-[0.2em] uppercase text-white">
          <span className="mx-8">⚡️ БЕЗКОШТОВНА ДОСТАВКА ВІД 3000 UAH ⚡️</span>
          <span className="mx-8">💥 НОВИЙ ДРОП ВЖЕ ТУТ 💥</span>
          <span className="mx-8">⚡️ BRIGHT SHOP — ТВОЯ ПРАВИЛА ⚡️</span>
        </div>
      </div>

      <nav className={`transition-all duration-500 ${
        scrolled || !isHome ? 'py-3 text-black' : 'bg-gradient-to-b from-black/60 to-transparent py-6 text-white'
      }`}>
        <div className="container mx-auto px-6 flex justify-between items-center text-current">
          <Link href="/" className={`text-2xl md:text-3xl font-black tracking-tighter italic cursor-pointer transition-colors ${
            scrolled || !isHome ? 'text-pink-600' : 'text-white hover:text-pink-500'
          }`}>
            BRIGHT<span className={scrolled || !isHome ? 'text-black' : 'text-white'}>SHOP</span>
          </Link>
          
          <div className="hidden md:flex space-x-10 font-black uppercase text-xs tracking-[0.2em] text-current">
            <Link href="/" className="hover:text-pink-600 transition-all">Головна</Link>
            <Link href="/catalog" className="hover:text-pink-600 transition-all">Каталог</Link>
            <Link href="/about" className="hover:text-pink-600 transition-colors">Про бренд</Link>
            <Link href="/customizer" className="bg-white text-black px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-pink-600 hover:text-white transition-all">
              Свій дизайн ✨
            </Link>
          </div>

          <div className="flex items-center space-x-6 text-current">
            <button className="p-2 rounded-full relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-current font-black animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center text-white p-6">
          <button className="absolute top-10 right-8 text-white" onClick={() => setIsMenuOpen(false)}>
            <X size={48}/>
          </button>
          <div className="flex flex-col space-y-8 text-3xl font-black uppercase text-center tracking-tighter italic text-white">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>Головна</Link>
            <Link href="/catalog" onClick={() => setIsMenuOpen(false)}>Каталог</Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)}>Про бренд</Link>
            <Link href="/customizer" onClick={() => setIsMenuOpen(false)} className="text-pink-600">Свій дизайн ✨</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
