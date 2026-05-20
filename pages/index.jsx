import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { getAllProducts } from '../lib/shopify';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        const mappedProducts = data.map(({ node }) => ({
          id: node.id,
          handle: node.handle,
          title: node.title,
          price: parseInt(node.priceRange.minVariantPrice.amount),
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
  }, []);

  return (
    <Layout isHome={true}>
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-black text-white pt-24 md:pt-32">
        <div className="absolute inset-0 z-0 opacity-50">
          <div className="w-full h-full bg-gradient-to-br from-pink-900/40 via-black to-black"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 py-12 text-left">
          <div className="max-w-5xl">
            <h1 className="text-5xl md:text-8xl lg:text-[8rem] xl:text-[9rem] font-black leading-[0.85] tracking-tighter mb-8 uppercase text-white">
              ОДЯГ, ЯКИЙ <br /><span className="text-pink-600 italic outline-text">ГОВОРИТЬ</span> <br />ПРО ТЕБЕ.
            </h1>
            <div className="flex flex-wrap gap-6">
              <Link href="/catalog" className="bg-pink-600 hover:bg-white hover:text-black text-white px-12 py-6 font-black text-2xl uppercase transition-all shadow-[0_0_30_px_rgba(255,0,127,0.4)]">
                КАТАЛОГ 🔥
              </Link>
              <Link href="/customizer" className="bg-white hover:bg-pink-600 hover:text-white text-black px-12 py-6 font-black text-2xl uppercase transition-all border-4 border-black">
                ТВІЙ ДИЗАЙН ✨
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED SECTION */}
      <section className="py-32 bg-white text-black">
        <div className="container mx-auto px-6 text-left">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">НОВИЙ ДРОП.</h2>
              <p className="text-gray-400 font-bold italic tracking-tight">Те, що ти шукала, вже тут.</p>
            </div>
            <Link href="/catalog" className="hidden md:flex items-center gap-2 font-black uppercase text-xs tracking-widest hover:text-pink-600 transition-colors">
              ДИВИТИСЬ УСЕ <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-[1.5rem]" />
              ))
            ) : (
              products.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/product/${p.handle}`} className="group cursor-pointer">
                  <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden flex items-center justify-center rounded-[1.5rem] shadow-lg">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="text-white font-black text-3xl opacity-10 uppercase tracking-tighter italic">Bright</div>
                    )}
                  </div>
                  <div className="mt-8">
                    <h3 className="font-black uppercase text-lg mb-2 line-clamp-1">{p.title}</h3>
                    <div className="text-pink-600 font-black text-xl italic">{p.price} UAH</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}