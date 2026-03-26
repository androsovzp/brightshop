import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  ShoppingCart, Menu, X, ArrowRight, Heart, Instagram, Facebook, 
  ChevronLeft, ChevronRight, Star, ShieldCheck, Truck, RefreshCw,
  Plus, Minus, Info, ChevronDown, Zap, Sparkles, Smile, Filter, SlidersHorizontal, Trash2, ExternalLink
} from 'lucide-react';

import { getAllProducts } from '../lib/shopify';
import Customizer from '../components/Customizer';
import { useCart } from '../context/CartContext';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isCartOpen, setIsCartOpen, cart, addItem, removeItem, cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Fetch products
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        const mappedProducts = data.map(({ node }) => ({
          id: node.id,
          handle: node.handle,
          category: node.productType?.toLowerCase() || 'all',
          title: node.title,
          price: parseInt(node.priceRange.minVariantPrice.amount),
          tag: "NEW", 
          colorClass: "bg-gray-100", 
          colors: node.variants.edges.map(v => v.node.title),
          variants: node.variants.edges.map(v => ({ id: v.node.id, title: v.node.title })),
          description: node.description,
          image: node.images.edges[0]?.node.url || null
        }));
        setProducts(mappedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = filterCategory === 'all' 
    ? products 
    : products.filter(p => p.category === filterCategory);

  const navigateToProduct = (product) => {
    setSelectedProduct(product);
    setSelectedSize(product.colors[0]); // Using titles as variants for now
    setSelectedColor(product.colors[0]);
    setQuantity(1);
    setCurrentPage('product');
    window.scrollTo(0, 0);
  };

  const navigateToCatalog = () => {
    setCurrentPage('catalog');
    window.scrollTo(0, 0);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  const navigateToAbout = () => {
    setCurrentPage('about');
    window.scrollTo(0, 0);
  };

  const navigateToCustomizer = () => {
    setCurrentPage('customizer');
    window.scrollTo(0, 0);
  };

  const handleAddToCart = async () => {
    // Find matching variant
    const variantId = selectedProduct.variants[0].id; // Simple logic: pick first variant for now
    await addItem(variantId, quantity);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin text-pink-600"><Sparkles size={64} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-pink-500 selection:text-white">
      <Head>
        <title>BRIGHT SHOP | Мерч із характером</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      {/* HEADER */}
      <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
        scrolled || currentPage !== 'home' ? 'bg-white shadow-2xl' : 'bg-transparent'
      }`}>
        <div className="bg-pink-600 text-white py-2 overflow-hidden whitespace-nowrap relative">
          <div className="animate-marquee inline-block font-black text-[10px] md:text-xs tracking-[0.2em] uppercase">
            <span className="mx-8">⚡️ БЕЗКОШТОВНА ДОСТАВКА ВІД 3000 UAH ⚡️</span>
            <span className="mx-8">💥 НОВИЙ ДРОП ВЖЕ ТУТ 💥</span>
            <span className="mx-8">⚡️ BRIGHT SHOP — ТВОЯ ПРАВИЛА ⚡️</span>
          </div>
        </div>

        <nav className={`transition-all duration-500 ${
          scrolled || currentPage !== 'home' ? 'py-3 text-black' : 'bg-gradient-to-b from-black/60 to-transparent py-6 text-white'
        }`}>
          <div className="container mx-auto px-6 flex justify-between items-center">
            <div className={`text-2xl md:text-3xl font-black tracking-tighter italic cursor-pointer transition-colors ${
              scrolled || currentPage !== 'home' ? 'text-pink-600' : 'text-white hover:text-pink-500'
            }`} onClick={navigateToHome}>
              BRIGHT<span className={scrolled || currentPage !== 'home' ? 'text-black' : 'text-white'}>SHOP</span>
            </div>
            
            <div className="hidden md:flex space-x-10 font-black uppercase text-xs tracking-[0.2em]">
              <button onClick={navigateToHome} className="hover:text-pink-600 transition-all">Головна</button>
              <button onClick={navigateToCatalog} className="hover:text-pink-600 transition-all">Каталог</button>
                <button onClick={navigateToAbout} className="hover:text-pink-600 transition-colors">Про бренд</button>
                <button onClick={navigateToCustomizer} className="bg-white text-black px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-pink-600 hover:text-white transition-all">Свій дизайн ✨</button>
              </div>

            <div className="flex items-center space-x-6">
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
      </header>

      {/* Main Content */}
      <main>
        {currentPage === 'home' && (
          <>
            <section className="relative min-h-screen flex items-center overflow-hidden bg-black text-white pt-24 md:pt-32">
              <div className="absolute inset-0 z-0 opacity-50">
                <div className="w-full h-full bg-gradient-to-br from-pink-900/40 via-black to-black"></div>
              </div>
              <div className="container mx-auto px-6 relative z-10 py-12">
                <div className="max-w-5xl text-left">
                  <h1 className="text-5xl md:text-8xl lg:text-[8rem] xl:text-[9rem] font-black leading-[0.85] tracking-tighter mb-8 uppercase text-white">
                    БУДЬ <br /><span className="text-pink-600 italic outline-text">BRIGHT.</span> <br />БО ТИ <br />ТАК РІШИЛА.
                  </h1>
                  <div className="flex flex-wrap gap-6 text-white">
                    <button className="bg-pink-600 hover:bg-white hover:text-black text-white px-12 py-6 font-black text-2xl uppercase transition-all shadow-[0_0_30_px_rgba(255,0,127,0.4)]" onClick={navigateToCatalog}>
                      КАТАЛОГ 🔥
                    </button>
                    <button className="bg-white hover:bg-pink-600 hover:text-white text-black px-12 py-6 font-black text-2xl uppercase transition-all border-4 border-black" onClick={navigateToCustomizer}>
                      ТВІЙ ДИЗАЙН ✨
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Section */}
            <section className="py-32 bg-white">
              <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-16">
                  <div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-left">НОВИЙ ДРОП.</h2>
                    <p className="text-gray-400 font-bold italic tracking-tight text-left">Те, що ти шукала, вже тут.</p>
                  </div>
                  <button onClick={navigateToCatalog} className="hidden md:flex items-center gap-2 font-black uppercase text-xs tracking-widest hover:text-pink-600 transition-colors">
                    ДИВИТИСЬ УСЕ <ArrowRight size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {products.slice(0, 3).map((p) => (
                    <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p)}>
                      <div className={`aspect-[4/5] ${p.colorClass} relative overflow-hidden flex items-center justify-center rounded-[1.5rem] shadow-lg`}>
                        {p.image ? (
                          <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="text-white font-black text-3xl opacity-10 uppercase tracking-tighter italic">Bright</div>
                        )}
                      </div>
                      <div className="mt-8 text-left">
                        <h3 className="font-black uppercase text-lg mb-2 line-clamp-1">{p.title}</h3>
                        <div className="text-pink-600 font-black text-xl italic">{p.price} UAH</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {currentPage === 'customizer' && (
          <Customizer 
            onBack={navigateToCatalog} 
          />
        )}

        {currentPage === 'catalog' && (
          <section className="pt-48 pb-32 bg-white min-h-screen">
            <div className="container mx-auto px-6">
              <div className="mb-20">
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6">
                  УСЕ <span className="text-pink-600">ОДРАЗУ.</span>
                </h1>
                <p className="text-xl font-bold italic text-gray-400 tracking-tight">Тут немає випадкових речей. Тільки те, що має характер.</p>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 border-b-4 border-black pb-8">
                <div className="flex flex-wrap gap-4">
                  {[
                    { id: 'all', label: 'Усе' },
                    { id: 'футболка', label: 'Одяг' },
                    { id: 'шопер', label: 'Шопери' },
                    { id: 'носки', label: 'Носки' }
                  ].map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`px-6 py-2 font-black uppercase text-xs tracking-widest transition-all ${
                        filterCategory === cat.id ? 'bg-pink-600 text-white' : 'bg-gray-100 hover:bg-black hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p)}>
                    <div className={`aspect-[4/5] ${p.colorClass} relative overflow-hidden flex items-center justify-center rounded-[1.5rem] shadow-lg group-hover:shadow-2xl transition-all duration-500`}>
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="text-white font-black text-3xl opacity-10 group-hover:scale-110 transition-transform tracking-tighter uppercase">Bright</div>
                      )}
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <span className="absolute top-4 left-4 bg-white text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {p.tag}
                      </span>
                    </div>
                    <div className="mt-6 space-y-2">
                      <h3 className="font-black uppercase text-lg group-hover:text-pink-600 transition-colors tracking-tight line-clamp-1">{p.title}</h3>
                      <div className="flex justify-between items-center text-left">
                        <span className="text-pink-600 font-black text-xl italic tracking-tighter">{p.price} UAH</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {currentPage === 'product' && selectedProduct && (
          <section className="pt-48 pb-32 bg-white">
            <div className="container mx-auto px-6 text-left">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-7">
                  <div className={`aspect-[4/5] bg-gray-100 relative flex items-center justify-center overflow-hidden rounded-[2rem] shadow-2xl`}>
                     {selectedProduct.image ? (
                       <img src={selectedProduct.image} alt={selectedProduct.title} className="absolute inset-0 w-full h-full object-cover" />
                     ) : (
                       <div className="text-white font-black text-8xl opacity-10 transform -rotate-12 uppercase tracking-tighter italic">Bright</div>
                     )}
                     <span className="absolute top-8 left-8 bg-black text-white px-6 py-2 text-xs font-black uppercase tracking-[0.2em]">{selectedProduct.tag}</span>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="sticky top-48">
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
                      {selectedProduct.title}
                    </h1>
                    <div className="text-4xl font-black text-pink-600 mb-12 italic">{selectedProduct.price} UAH</div>
                    
                    <button 
                      onClick={handleAddToCart}
                      className="w-full bg-pink-600 hover:bg-black text-white py-8 font-black text-2xl uppercase transition-all shadow-[0_20px_40px_rgba(255,0,127,0.3)] mb-12 flex items-center justify-center gap-4 group"
                    >
                      ДО КОШИКА <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </button>
                    
                    <p className="text-gray-500 font-bold italic text-lg leading-relaxed mb-8">"{selectedProduct.description}"</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col animate-slide-left">
            <div className="p-8 border-b-8 border-pink-600 flex justify-between items-center text-left">
              <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">ТВІЙ КОШИК</h2>
              <button className="hover:text-pink-600 transition-colors" onClick={() => setIsCartOpen(false)}><X size={40}/></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 space-y-6">
              {cart?.lines?.edges?.length > 0 ? (
                cart.lines.edges.map(({ node }) => (
                  <div key={node.id} className="flex gap-6 border-b border-gray-100 pb-6 items-center text-left">
                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={node.merchandise.product.images.edges[0]?.node.url} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-black uppercase text-sm line-clamp-1">{node.merchandise.product.title}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{node.merchandise.title}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="font-black text-pink-600">x{node.quantity}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-black">{node.merchandise.price.amount} UAH</span>
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
                  <span className="text-4xl font-black italic tracking-tighter">
                    {cart.lines.edges.reduce((acc, curr) => acc + (parseFloat(curr.node.merchandise.price.amount) * curr.node.quantity), 0)} UAH
                  </span>
                </div>
                <a 
                  href={cart.checkoutUrl}
                  className="w-full bg-black hover:bg-pink-600 text-white py-6 font-black uppercase text-xl tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  ОФОРМИТИ <ExternalLink size={24} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-24 bg-black text-white border-t-[16px] border-pink-600 mt-20 text-left">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div>
              <div className="text-4xl font-black tracking-tighter text-pink-600 italic mb-8 uppercase">BRIGHT SHOP</div>
              <p className="text-gray-400 font-bold leading-relaxed italic">Мерч із характером. Для тих, хто створює свій світ.</p>
            </div>
          </div>
          <div className="pt-10 border-t border-white/10 text-center text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">
            © 2024 BRIGHT LOOK MERCH GROUP.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;