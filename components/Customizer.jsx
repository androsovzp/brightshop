import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, Maximize, Move, RotateCw, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProduct } from '../lib/shopify';

const Customizer = ({ onBack }) => {
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState('tshirt');
  const [selectedColor, setSelectedColor] = useState({ name: 'Білий', hex: '#ffffff' });
  const [userImage, setUserImage] = useState(null);
  const [imagePos, setImagePos] = useState({ x: 0.5, y: 0.4, scale: 0.25, rotation: 0 });
  const [shopifyProducts, setShopifyProducts] = useState({});
  const [loading, setLoading] = useState(true);

  const productMappings = {
    tshirt: 'futbolka-oversayz',
    sweatshirt: 'svitshot-oversayz'
  };

  const products = {
    tshirt: {
      name: 'Premium T-Shirt',
      price: 1100,
      image: '/photos/white_tshirt_mockup.png',
      printArea: { top: '30%', left: '35%', width: '30%', height: '40%' }
    },
    sweatshirt: {
      name: 'Oversized Sweatshirt',
      price: 1600,
      image: '/photos/white_tshirt_mockup.png', 
      printArea: { top: '35%', left: '30%', width: '40%', height: '35%' }
    }
  };

  const colors = [
    { name: 'Білий', hex: '#ffffff' },
    { name: 'Чорний', hex: '#1a1a1a' },
    { name: 'Рожевий', hex: '#db2777' },
    { name: 'Червоний', hex: '#ef4444' },
  ];

  useEffect(() => {
    const fetchShopifyData = async () => {
      try {
        const tshirtData = await getProduct(productMappings.tshirt);
        const sweatshirtData = await getProduct(productMappings.sweatshirt);
        setShopifyProducts({
          tshirt: tshirtData,
          sweatshirt: sweatshirtData
        });
      } catch (err) {
        console.error("Error fetching Shopify products for customizer:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopifyData();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = async () => {
    if (!userImage) return;
    
    const shopifyProduct = shopifyProducts[selectedProduct];
    if (!shopifyProduct) return;

    // Find the variant that matches the color name
    // Our Shopify products have variants like "Біла", "Чорна", etc.
    // Customizer colors are "Білий", "Чорний", etc.
    const searchColor = selectedColor.name.substring(0, 4); // "Біли", "Чорн"
    const variant = shopifyProduct.variants.edges.find(edge => 
      edge.node.title.includes(searchColor)
    ) || shopifyProduct.variants.edges[0];

    const attributes = [
      { key: "Колір", value: selectedColor.name },
      { key: "Тип", value: "Кастомний дизайн" },
      { key: "Позиція X", value: String(imagePos.x) },
      { key: "Позиція Y", value: String(imagePos.y) },
      { key: "Масштаб", value: String(imagePos.scale) }
    ];

    await addItem(variant.node.id, 1, attributes);
  };

  const currentProduct = products[selectedProduct];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black pt-32 pb-20">
      <div className="container mx-auto px-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 font-black uppercase text-xs tracking-widest mb-12 hover:text-pink-600 transition-colors"
        >
          <ArrowLeft size={16} /> Назад до каталогу
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="relative aspect-[4/5] bg-[#f0f0f0] rounded-[2rem] overflow-hidden shadow-2xl group flex items-center justify-center border-4 border-black border-dashed">
            <img 
              src={currentProduct.image} 
              alt="Mockup" 
              className="w-full h-full object-cover relative z-0"
            />
            <div 
              className="absolute inset-0 z-10 pointer-events-none mix-blend-multiply transition-colors duration-500"
              style={{ backgroundColor: selectedColor.hex }}
            ></div>
            
            {userImage && (
              <div 
                className="absolute z-20 flex items-center justify-center cursor-move"
                style={{
                  top: `${imagePos.y * 100}%`,
                  left: `${imagePos.x * 100}%`,
                  width: `${imagePos.scale * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${imagePos.rotation}deg)`,
                }}
              >
                <img 
                  src={userImage} 
                  alt="Your Design" 
                  className="w-full h-auto drop-shadow-xl opacity-90"
                />
              </div>
            )}

            {!userImage && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <div className="bg-white/80 backdrop-blur-md px-8 py-4 rounded-full border-2 border-black font-black uppercase text-sm tracking-tighter shadow-lg">
                  Твій дизайн буде тут ✨
                </div>
              </div>
            )}
          </div>

          <div className="space-y-12 text-left">
            <div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                ТВІЙ <span className="text-pink-600 italic">STYLE.</span>
              </h1>
              <p className="text-xl font-bold italic text-gray-400">Створи мерч, який відображає твій вайб.</p>
            </div>

            <div className="space-y-6">
              <h3 className="font-black uppercase text-xs tracking-widest text-gray-400">1. Оберіть основу</h3>
              <div className="flex gap-4">
                {Object.keys(products).map(key => (
                  <button
                    key={key}
                    onClick={() => setSelectedProduct(key)}
                    className={`px-8 py-4 font-black uppercase text-sm tracking-widest transition-all border-4 ${
                      selectedProduct === key ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-100 hover:border-black'
                    }`}
                  >
                    {products[key].name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-black uppercase text-xs tracking-widest text-gray-400">2. Оберіть колір: <span className="text-black">{selectedColor.name}</span></h3>
              <div className="flex gap-4 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    className={`w-12 h-12 rounded-full border-4 transition-all scale-100 hover:scale-110 ${
                      selectedColor.name === color.name ? 'border-pink-600' : 'border-gray-100'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  ></button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-black uppercase text-xs tracking-widest text-gray-400">2. Завантажте дизайн</h3>
              <div className="relative h-48 border-4 border-dashed border-gray-200 rounded-[1.5rem] flex flex-col items-center justify-center transition-colors hover:border-pink-600 group cursor-pointer overflow-hidden">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Upload size={40} className="mb-4 text-gray-300 group-hover:text-pink-600 transition-colors" />
                <span className="font-black uppercase text-xs tracking-widest text-gray-400 group-hover:text-black">Click or Drag Image</span>
              </div>
            </div>

            {userImage && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="font-black uppercase text-xs tracking-widest text-gray-400">3. Налаштуйте вигляд</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                       <Maximize size={14} /> Розмір: {Math.round(imagePos.scale * 100)}%
                    </label>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="0.8" 
                      step="0.01" 
                      value={imagePos.scale}
                      onChange={(e) => setImagePos({...imagePos, scale: parseFloat(e.target.value)})}
                      className="w-full accent-pink-600"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                       <RotateCw size={14} /> Поворот: {imagePos.rotation}°
                    </label>
                    <input 
                      type="range" 
                      min="-180" 
                      max="180" 
                      value={imagePos.rotation}
                      onChange={(e) => setImagePos({...imagePos, rotation: parseInt(e.target.value)})}
                      className="w-full accent-pink-600"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setUserImage(null)}
                    className="flex-1 bg-gray-100 hover:bg-red-500 hover:text-white text-black py-4 font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Видалити
                  </button>
                </div>
              </div>
            )}

            <button 
              disabled={!userImage}
              onClick={handleAddToCart}
              className={`w-full py-6 font-black uppercase text-xl tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.1)] ${
                userImage 
                  ? 'bg-pink-600 text-white hover:bg-black hover:scale-[1.02]' 
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ShoppingBag size={24} /> Додати в кошик
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customizer;
