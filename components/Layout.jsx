import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { X, Trash2, Smile, ExternalLink } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { useCart } from '../context/CartContext';

const Layout = ({ children, title = "BRIGHT SHOP | Мерч із характером", isHome = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const { isCartOpen, setIsCartOpen, cart, removeItem } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-pink-500 selection:text-white">
      <Head>
        <title>{title}</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header scrolled={scrolled} isHome={isHome} />

      <main>{children}</main>

      <Footer />

      {/* Cart Drawer - Global */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col animate-slide-left">
            <div className="p-8 border-b-8 border-pink-600 flex justify-between items-center text-left">
              <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-black">ТВІЙ КОШИК</h2>
              <button className="hover:text-pink-600 transition-colors text-black" onClick={() => setIsCartOpen(false)}><X size={40}/></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 space-y-6">
              {cart?.lines?.edges?.length > 0 ? (
                cart.lines.edges.map(({ node }) => (
                  <div key={node.id} className="flex gap-6 border-b border-gray-100 pb-6 items-center text-left">
                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={node.merchandise.product.images.edges[0]?.node.url} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-black uppercase text-sm line-clamp-1 text-black">{node.merchandise.product.title}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{node.merchandise.title}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="font-black text-pink-600">x{node.quantity}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-black">{node.merchandise.price.amount} UAH</span>
                          <button onClick={() => removeItem(node.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                  <Smile size={80} className="text-gray-100" />
                  <p className="font-black uppercase italic text-gray-400">Кошик поки порожній! 🔥</p>
                </div>
              )}
            </div>

            {cart?.lines?.edges?.length > 0 && (
              <div className="p-8 bg-gray-50 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="font-black uppercase text-xs tracking-[0.2em] text-gray-400">Разом</span>
                  <span className="text-4xl font-black italic tracking-tighter text-black">
                    {cart.lines.edges.reduce((acc, curr) => acc + (parseFloat(curr.node.merchandise.price.amount) * curr.node.quantity), 0)} UAH
                  </span>
                </div>
                <a 
                  href={cart.checkoutUrl}
                  className="w-full bg-black hover:bg-pink-600 text-white py-6 font-black uppercase text-xl tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl rounded-full"
                >
                  ОФОРМИТИ <ExternalLink size={24} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
