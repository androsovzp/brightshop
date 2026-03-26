import React, { createContext, useContext, useState, useEffect } from 'react';
import { createCart, addToCart, removeFromCart } from '../lib/shopify';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const initCart = async () => {
      const savedCartId = localStorage.getItem('shopify_cart_id');
      if (savedCartId) {
        // In a real app, we would fetch the cart here to validate it
        // For now, we'll just store the ID and create a new one if it fails later
        setCart({ id: savedCartId });
      } else {
        const newCart = await createCart();
        localStorage.setItem('shopify_cart_id', newCart.id);
        setCart(newCart);
      }
    };
    initCart();
  }, []);

  const addItem = async (variantId, quantity = 1, attributes = []) => {
    if (!cart) return;
    
    const lines = [{
      merchandiseId: variantId,
      quantity,
      attributes
    }];

    const updatedCart = await addToCart(cart.id, lines);
    setCart(updatedCart);
    setIsCartOpen(true);
  };

  const removeItem = async (lineId) => {
    if (!cart) return;
    const updatedCart = await removeFromCart(cart.id, [lineId]);
    setCart(updatedCart);
  };

  const cartCount = cart?.lines?.edges?.reduce((acc, curr) => acc + curr.node.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ 
      cart, 
      addItem, 
      removeItem, 
      cartCount, 
      isCartOpen, 
      setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
