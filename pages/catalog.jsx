import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import Layout from '../components/Layout';
import { getAllProducts } from '../lib/shopify';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
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

  const filteredProducts = filterCategory === 'all' 
    ? products 
    : products.filter(p => p.category === filterCategory);

  if (loading) {
    return (
      <Layout title="Завантаження... | BRIGHT SHOP">
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Каталог | BRIGHT SHOP">
      <section className="pt-48 pb-32 bg-white min-h-screen">
        <div className="container mx-auto px-6">
          <div className="mb-20 text-left">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 text-black">
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
                    filterCategory === cat.id ? 'bg-pink-600 text-white' : 'bg-gray-100 hover:bg-black hover:text-white text-black'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map((p) => (
              <Link key={p.id} href={`/product/${p.handle}`} className="group cursor-pointer">
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
                <div className="mt-6 space-y-2 text-left">
                  <h3 className="font-black uppercase text-lg group-hover:text-pink-600 transition-colors tracking-tight line-clamp-1 text-black">{p.title}</h3>
                  <div className="flex justify-between items-center text-left">
                    <span className="text-pink-600 font-black text-xl italic tracking-tighter">{p.price} UAH</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
