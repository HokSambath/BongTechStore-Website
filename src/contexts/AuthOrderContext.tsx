import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
  color?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'staff' | 'admin';
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    price: string;
    quantity: number;
    color?: string;
  }[];
  totalPrice: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: any; // timestamp or ISO string
  updatedAt: any;
}

interface AuthOrderContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  cart: CartItem[];
  orders: Order[];
  isFirebaseActive: boolean;
  addToCart: (product: Product, quantity?: number, color?: string) => void;
  removeFromCart: (productId: string, color?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  signUpUser: (email: string, name: string, phone: string, password?: string) => Promise<void>;
  signInUser: (email: string, password?: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logOutUser: () => Promise<void>;
  placeOrder: (name: string, phone: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: 'confirmed' | 'cancelled') => Promise<void>;
  loadAllOrdersForAdmin: () => (() => void) | void;
  deleteOrder: (orderId: string) => Promise<void>;
}

const AuthOrderContext = createContext<AuthOrderContextType | undefined>(undefined);

// Helper functions for mapping between camelCase (JS/TS) and snake_case (Postgres/Supabase)
const mapToDbOrder = (order: Order) => ({
  id: order.id,
  customer_id: order.customerId,
  customer_name: order.customerName,
  customer_email: order.customerEmail,
  customer_phone: order.customerPhone,
  items: order.items,
  total_price: order.totalPrice,
  status: order.status,
  created_at: typeof order.createdAt === 'string' ? order.createdAt : new Date(order.createdAt).toISOString(),
  updated_at: typeof order.updatedAt === 'string' ? order.updatedAt : new Date(order.updatedAt).toISOString()
});

const mapFromDbOrder = (dbOrder: any): Order => ({
  id: dbOrder.id,
  customerId: dbOrder.customer_id,
  customerName: dbOrder.customer_name,
  customerEmail: dbOrder.customer_email,
  customerPhone: dbOrder.customer_phone,
  items: dbOrder.items,
  totalPrice: dbOrder.total_price,
  status: dbOrder.status as Order['status'],
  createdAt: dbOrder.created_at,
  updatedAt: dbOrder.updated_at
});

export const AuthOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bongtech_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>([]);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('bongtech_cart', JSON.stringify(cart));
  }, [cart]);

  // Auth synchronization with Supabase
  useEffect(() => {
    let active = true;

    const checkSessionAndSubscribe = async () => {
      // 1. Initial check of Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      
      if (session?.user) {
        const user = session.user;
        const bootstrappedRole = user.email === 'sambathhok.true@gmail.com' ? 'admin' : (user.email === 'developer@bongtech.cc' ? 'staff' : 'customer');
        const profile: UserProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          phone: user.user_metadata?.phone || '',
          role: bootstrappedRole,
          createdAt: user.created_at || new Date().toISOString()
        };
        setCurrentUser(profile);
        localStorage.setItem('bongtech_currentUser', JSON.stringify(profile));
      } else {
        setCurrentUser(null);
        localStorage.removeItem('bongtech_currentUser');
      }
      setLoading(false);

      // 2. Subscribe to Supabase auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!active) return;
        
        if (session?.user) {
          const user = session.user;
          const bootstrappedRole = user.email === 'sambathhok.true@gmail.com' ? 'admin' : (user.email === 'developer@bongtech.cc' ? 'staff' : 'customer');
          const profile: UserProfile = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            phone: user.user_metadata?.phone || '',
            role: bootstrappedRole,
            createdAt: user.created_at || new Date().toISOString()
          };
          setCurrentUser(profile);
          localStorage.setItem('bongtech_currentUser', JSON.stringify(profile));
        } else {
          setCurrentUser(null);
          localStorage.removeItem('bongtech_currentUser');
        }
        setLoading(false);
      });

      return subscription;
    };

    let subPromise = checkSessionAndSubscribe();

    return () => {
      active = false;
      subPromise.then(sub => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
    };
  }, []);

  // Listen to Customer's Personal Orders via Supabase and subscribe to changes in real-time
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    let active = true;

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (active && data) {
          setOrders(data.map(mapFromDbOrder));
        }
      } catch (err) {
        console.error('Error fetching user orders from Supabase:', err);
      }
    };

    fetchOrders();

    const channel = supabase
      .channel(`customer-orders-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${currentUser.id}`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      active = false;
      channel.unsubscribe();
    };
  }, [currentUser]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1, color?: string) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.color === color
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, color }];
    });
  };

  const removeFromCart = (productId: string, color?: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.color === color)));
  };

  const updateCartQuantity = (productId: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.color === color ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // Auth Operations
  const signUpUser = async (email: string, name: string, phone: string, password = 'defaultPassword') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone
        }
      }
    });
    if (error) throw error;
  };

  const signInUser = async (email: string, password = 'defaultPassword') => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };

  const signInGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const logOutUser = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error on Supabase signOut:', err);
    }
    localStorage.removeItem('bongtech_currentUser');
    setCurrentUser(null);
    setOrders([]);
  };

  // Place order
  const placeOrder = async (name: string, phone: string) => {
    if (!currentUser) throw new Error('Must sign in to place order.');
    if (cart.length === 0) throw new Error('Cart is empty.');

    const totalPriceNum = cart.reduce((total, item) => {
      const priceVal = parseFloat(item.product.price.replace('$', ''));
      return total + (priceVal * item.quantity);
    }, 0);

    const orderId = 'order_' + Math.random().toString(36).substr(2, 9);
    
    const newOrder: Order = {
      id: orderId,
      customerId: currentUser.id,
      customerName: name || currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: phone || currentUser.phone || 'N/A',
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        color: item.color
      })),
      totalPrice: `$${totalPriceNum.toFixed(2)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('orders')
        .insert([mapToDbOrder(newOrder)]);

      if (error) throw error;
      clearCart();
    } catch (err) {
      console.error('Error placing order in Supabase:', err);
      throw err;
    }
  };

  // Admin and Staff order action
  const updateOrderStatus = async (orderId: string, status: 'confirmed' | 'cancelled') => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'staff')) {
      throw new Error('Unauthorized status modification.');
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating order status in Supabase:', err);
      throw err;
    }
  };

  // Delete order
  const deleteOrder = async (orderId: string) => {
    if (!currentUser) throw new Error('Must sign in to delete order.');

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting order in Supabase:', err);
      throw err;
    }
  };

  // Real-time Order Monitoring for Admins/Staff
  const loadAllOrdersForAdmin = () => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'staff')) return;

    let active = true;

    const fetchAllOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (active && data) {
          setOrders(data.map(mapFromDbOrder));
        }
      } catch (err) {
        console.error('Error fetching admin orders from Supabase:', err);
      }
    };

    fetchAllOrders();

    const channel = supabase
      .channel('admin-all-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchAllOrders();
        }
      )
      .subscribe();

    return () => {
      active = false;
      channel.unsubscribe();
    };
  };

  return (
    <AuthOrderContext.Provider value={{
      currentUser,
      loading,
      cart,
      orders,
      isFirebaseActive: false,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      signUpUser,
      signInUser,
      signInGoogle,
      logOutUser,
      placeOrder,
      updateOrderStatus,
      loadAllOrdersForAdmin,
      deleteOrder
    }}>
      {children}
    </AuthOrderContext.Provider>
  );
};

export const useAuthOrder = () => {
  const context = useContext(AuthOrderContext);
  if (context === undefined) {
    throw new Error('useAuthOrder must be used within an AuthOrderProvider');
  }
  return context;
};
