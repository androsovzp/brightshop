import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, Maximize, Move, RotateCw, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProduct } from '../lib/shopify';

const Customizer = ({ onBack }) => {
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState('tshirt');
  const [selectedColor, setSelectedColor] = useState({ name: 'Білий', hex: '#ffffff' });
  const [userImage, setUserImage] = useState(null);
  const [imagePos, setImagePos] = useState({ x: 0.5, y: 0.45, scale: 0.25, rotation: 0 });
  const [shopifyProducts, setShopifyProducts] = useState({});
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const productMappings = {
    tshirt: 'futbolka-oversayz'
  };

  const colors = [
    { name: 'Білий', hex: '#ffffff', image: '/photos/tshirt-white.webp' },
    { name: 'Чорний', hex: '#1a1a1a', image: '/photos/tshirt-black.webp' },
    { name: 'Рожевий', hex: '#db2777', image: '/photos/tshirt-pink.webp' },
    { name: 'Червоний', hex: '#ef4444', image: '/photos/tshirt-red.webp' },
  ];

  const products = {
    tshirt: {
      name: 'Premium T-Shirt',
      price: 1100,
      image: '/photos/tshirt-white.webp',
      printArea: { top: '22%', left: '33%', width: '34%', height: '44%' }
    }
  };

  useEffect(() => {
    const fetchShopifyData = async () => {
      try {
        const tshirtData = await getProduct(productMappings.tshirt);
        setShopifyProducts({
          tshirt: tshirtData
        });
      } catch (err) {
        console.error("Error fetching Shopify products for customizer:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopifyData();
  }, []);

  // Preload colors for instant switching
  useEffect(() => {
    colors.forEach(color => {
      if (color.image) {
        const img = new Image();
        img.src = color.image;
      }
    });
  }, []);

  // Drag-to-reposition logic (Mouse + Touch)
  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    dragStartPos.current = {
      clientX,
      clientY,
      x: imagePos.x,
      y: imagePos.y
    };
  };

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = (clientX - dragStartPos.current.clientX) / rect.width;
      const deltaY = (clientY - dragStartPos.current.clientY) / rect.height;
      
      let newX = dragStartPos.current.x + deltaX;
      let newY = dragStartPos.current.y + deltaY;
      
      // Constraint to print area bounds to prevent design from going outside completely
      const area = selectedProduct === 'tshirt' ? products.tshirt.printArea : products.sweatshirt.printArea;
      const areaLeft = parseFloat(area.left) / 100;
      const areaTop = parseFloat(area.top) / 100;
      const areaWidth = parseFloat(area.width) / 100;
      const areaHeight = parseFloat(area.height) / 100;
      
      const minX = areaLeft;
      const maxX = areaLeft + areaWidth;
      const minY = areaTop;
      const maxY = areaTop + areaHeight;
      
      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));
      
      setImagePos(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    };

    const handleDragEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, imagePos, selectedProduct]);

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
    const searchColor = selectedColor.name.substring(0, 4); 
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

  const getMockupImage = () => {
    if (selectedProduct === 'tshirt') {
      const activeColor = colors.find(c => c.name === selectedColor.name) || colors[0];
      return activeColor.image;
    }
    return currentProduct.image;
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
    <div className="min-h-screen bg-white text-black pt-20 md:pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest mb-8 hover:text-pink-600 transition-colors"
        >
          <ArrowLeft size={14} /> Назад до каталогу
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Mockup Preview Area */}
          <div 
            ref={containerRef}
            className="lg:sticky lg:top-40 w-full lg:max-h-[75vh] aspect-[4/5] bg-[#f7f7f7] rounded-[2rem] overflow-hidden shadow-2xl group flex items-center justify-center border-2 border-gray-100 relative"
          >
            <img 
              src={getMockupImage()} 
              alt="Mockup" 
              className="w-full h-full object-cover relative z-0 transition-opacity duration-300"
            />
            {selectedProduct !== 'tshirt' && (
              <div 
                className="absolute inset-0 z-10 pointer-events-none mix-blend-multiply transition-colors duration-500"
                style={{ backgroundColor: selectedColor.hex }}
              ></div>
            )}
            
            {/* Visual Print Area Indicator */}
            {userImage && (
              <div 
                className={`absolute border-2 border-dashed transition-all duration-300 pointer-events-none z-10 ${
                  isDragging ? 'border-pink-600 bg-pink-500/5' : 'border-gray-300/40'
                }`}
                style={{
                  top: currentProduct.printArea.top,
                  left: currentProduct.printArea.left,
                  width: currentProduct.printArea.width,
                  height: currentProduct.printArea.height,
                }}
              >
                <span className={`absolute -top-6 left-2 px-2 py-0.5 rounded text-[8px] tracking-wider uppercase font-black transition-colors ${
                  isDragging ? 'bg-pink-600 text-white animate-pulse' : 'bg-black/40 text-white'
                }`}>
                  Область нанесення
                </span>
              </div>
            )}
            
            {userImage && (
              <div 
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                className={`absolute z-20 flex items-center justify-center select-none ${
                  isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-[1.02]'
                } transition-transform duration-150`}
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
                  className="w-full h-auto drop-shadow-xl opacity-95 pointer-events-none"
                />
              </div>
            )}

            {!userImage && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-black/10 font-black uppercase text-[10px] tracking-widest shadow-xl text-black">
                  Твій дизайн буде тут ✨
                </div>
              </div>
            )}
          </div>

          {/* Controls Area */}
          <div className="space-y-10 py-4 overflow-y-auto">
            <div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
                ТВІЙ <span className="text-pink-600 italic">STYLE.</span>
              </h1>
              <p className="text-lg font-bold italic text-gray-400">Створи мерч, який відображає твій вайб.</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400">1. Оберіть колір: <span className="text-black">{selectedColor.name}</span></h3>
              <div className="flex gap-3 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    className={`w-10 h-10 rounded-full border-4 transition-all scale-100 hover:scale-110 ${
                      selectedColor.name === color.name ? 'border-pink-600' : 'border-gray-100'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  ></button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400">2. Завантажте дизайн</h3>
              <div className="relative h-40 border-2 border-dashed border-gray-200 rounded-[1.5rem] flex flex-col items-center justify-center transition-colors hover:border-pink-600 group cursor-pointer overflow-hidden">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Upload size={32} className="mb-3 text-gray-300 group-hover:text-pink-600 transition-colors" />
                <span className="font-black uppercase text-[10px] tracking-widest text-gray-400 group-hover:text-black">Click or Drag Image</span>
              </div>
            </div>

            {userImage && (
              <div className="space-y-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400">3. Налаштуйте вигляд</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="font-black uppercase text-[9px] tracking-[0.2em] flex items-center gap-2 text-gray-500">
                       <Maximize size={12} /> Розмір: {Math.round(imagePos.scale * 100)}%
                    </label>
                    <input 
                      type="range" 
                      min="0.05" 
                      max="0.8" 
                      step="0.01" 
                      value={imagePos.scale}
                      onChange={(e) => setImagePos({...imagePos, scale: parseFloat(e.target.value)})}
                      className="w-full accent-pink-600"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="font-black uppercase text-[9px] tracking-[0.2em] flex items-center gap-2 text-gray-500">
                       <RotateCw size={12} /> Поворот: {imagePos.rotation}°
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
                
                <button 
                  onClick={() => setUserImage(null)}
                  className="w-full bg-gray-50 hover:bg-black hover:text-white text-gray-400 py-3 font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 rounded-full"
                >
                  <Trash2 size={14} /> Видалити дизайн
                </button>
              </div>
            )}

            <button 
              disabled={!userImage}
              onClick={handleAddToCart}
              className={`w-full py-6 font-black uppercase text-lg tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl rounded-full ${
                userImage 
                  ? 'bg-pink-600 text-white hover:bg-black hover:scale-[1.01]' 
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ShoppingBag size={22} /> Додати в кошик
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customizer;
