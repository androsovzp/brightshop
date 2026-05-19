import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { getProduct } from '../../lib/shopify';
import { useCart } from '../../context/CartContext';

export default function ProductDetails() {
  const router = useRouter();
  const { handle } = router.query;
  const { addItem } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!handle) return;
    
    const fetchProduct = async () => {
      try {
        const data = await getProduct(handle);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [handle]);

  const handleAddToCart = async () => {
    if (!product) return;
    const variantId = product.variants.edges[0].node.id;
    await addItem(variantId, quantity);
  };

  if (loading) {
    return (
      <Layout title="Завантаження...">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-pink-600" size={48} />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout title="Товар не знайдено">
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 text-black">
          <h1 className="text-4xl font-black uppercase mb-4">Упс! Товар не знайдено.</h1>
          <button onClick={() => router.push('/catalog')} className="text-pink-600 font-black uppercase tracking-widest hover:underline">
            Назад до каталогу
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${product.title} | BRIGHT SHOP`}>
      <section className="pt-48 pb-32 bg-white text-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 text-left">
            <div className="lg:col-span-7 flex flex-col gap-8">
              {product.images.edges.length > 0 ? (
                product.images.edges.map((edge, index) => (
                  <div key={index} className="aspect-[4/5] bg-gray-100 relative flex items-center justify-center overflow-hidden rounded-[2rem] shadow-2xl">
                    <img src={edge.node.url} alt={`${product.title} - ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                    {index === 0 && <span className="absolute top-8 left-8 bg-black text-white px-6 py-2 text-xs font-black uppercase tracking-[0.2em]">NEW</span>}
                  </div>
                ))
              ) : (
                <div className="aspect-[4/5] bg-gray-100 relative flex items-center justify-center overflow-hidden rounded-[2rem] shadow-2xl">
                  <div className="text-white font-black text-8xl opacity-10 transform -rotate-12 uppercase tracking-tighter italic">Bright</div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-48">
                <button 
                  onClick={() => router.back()}
                  className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest mb-12 hover:text-pink-600 transition-colors"
                >
                  <ArrowLeft size={14} /> Назад
                </button>

                <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
                  {product.title}
                </h1>
                <div className="text-4xl font-black text-pink-600 mb-12 italic">
                  {product.priceRange.minVariantPrice.amount} UAH
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-pink-600 hover:bg-black text-white py-8 font-black text-2xl uppercase transition-all shadow-[0_20px_40px_rgba(255,0,127,0.3)] mb-12 flex items-center justify-center gap-4 group"
                >
                  ДО КОШИКА <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>
                
                <p className="text-gray-500 font-bold italic text-lg leading-relaxed mb-8">"{product.description}"</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
