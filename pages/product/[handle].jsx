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
  const [activeImage, setActiveImage] = useState(0);

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
      <section className="pt-28 pb-16 bg-white text-black">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="aspect-[4/5] bg-gray-100 relative flex items-center justify-center overflow-hidden rounded-[1.5rem] shadow-lg">
                {product.images.edges.length > 0 ? (
                  <>
                    <img src={product.images.edges[activeImage]?.node.url || product.images.edges[0]?.node.url} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                    <span className="absolute top-4 left-4 bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em]">NEW</span>
                  </>
                ) : (
                  <div className="text-white font-black text-6xl opacity-10 transform -rotate-12 uppercase tracking-tighter italic">Bright</div>
                )}
              </div>
              {product.images.edges.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.edges.map((edge, index) => (
                    <button 
                      key={index} 
                      onClick={() => setActiveImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImage === index ? 'border-pink-600' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={edge.node.url} alt={`${product.title} - thumb ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              <div className="sticky top-28">
                <button 
                  onClick={() => router.back()}
                  className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest mb-6 hover:text-pink-600 transition-colors"
                >
                  <ArrowLeft size={14} /> Назад
                </button>

                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-tight mb-4">
                  {product.title}
                </h1>
                <div className="text-2xl font-black text-pink-600 mb-6 italic">
                  {product.priceRange.minVariantPrice.amount} UAH
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-pink-600 hover:bg-black text-white py-4 font-black text-base uppercase transition-all shadow-[0_10px_20px_rgba(255,0,127,0.2)] mb-6 flex items-center justify-center gap-2 group"
                >
                  ДО КОШИКА <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-gray-500 font-bold italic text-sm leading-relaxed mb-8">"{product.description}"</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
