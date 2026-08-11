import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ restaurant: null, items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ restaurant: null, items: [], totalAmount: 0 });
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await API.get('/cart');
      if (res.data.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (restaurantId, menuItemId, quantity = 1) => {
    try {
      const res = await API.post('/cart/add', { restaurantId, menuItemId, quantity });
      if (res.data.success) {
        setCart(res.data.data);
        setIsCartOpen(true);
      }
      return res.data;
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  };

  const updateQuantity = async (menuItemId, quantity) => {
    try {
      const res = await API.put('/cart/quantity', { menuItemId, quantity });
      if (res.data.success) {
        setCart(res.data.data);
      }
      return res.data;
    } catch (err) {
      console.error('Error updating quantity:', err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await API.delete('/cart/clear');
      setCart({ restaurant: null, items: [], totalAmount: 0 });
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const itemCount = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isCartOpen,
        setIsCartOpen,
        itemCount,
        addToCart,
        updateQuantity,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
