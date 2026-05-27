import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  db, 
  auth, 
  isFirebaseConfigured, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
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
  loadAllOrdersForAdmin: () => void;
}

const AuthOrderContext = createContext<AuthOrderContextType | undefined>(undefined);

export const AuthOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bongtech_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('bongtech_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('bongtech_cart', JSON.stringify(cart));
  }, [cart]);

  // Auth synchronization
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
        // Clear stale local storage user if no Supabase session is present
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
          // Clears state if session has expired, is null, or user has signed out
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

  // Listen to Customer's Personal Orders (if Firestore is active)
  useEffect(() => {
    if (isFirebaseConfigured && db && currentUser) {
      if (currentUser.role === 'customer') {
        const orderPath = 'orders';
        const q = query(
          collection(db, orderPath), 
          where('customerId', '==', currentUser.id),
          orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const freshOrders: Order[] = [];
          snapshot.forEach((docSnap) => {
            freshOrders.push(docSnap.data() as Order);
          });
          setOrders(freshOrders);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, orderPath);
        });
        return unsubscribe;
      }
    } else if (currentUser) {
      // Offline fallback: load only user's items from local orders
      const savedOrders = localStorage.getItem('bongtech_orders');
      if (savedOrders) {
        const parsed: Order[] = JSON.parse(savedOrders);
        const userOrders = parsed.filter(o => o.customerId === currentUser.id);
        setOrders(userOrders);
      }
    }
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
    const bootstrappedRole = email === 'sambathhok.true@gmail.com' ? 'admin' : 'customer';
    
    if (isFirebaseConfigured && auth && db) {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const userProfile: UserProfile = {
          id: res.user.uid,
          email,
          name,
          phone,
          role: bootstrappedRole,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', res.user.uid), userProfile);
        setCurrentUser(userProfile);
      } catch (err) {
        console.error('Firebase Signup Error:', err);
        throw err;
      }
    } else {
      // Local Database Registration
      const localUsers = JSON.parse(localStorage.getItem('bongtech_users') || '[]');
      if (localUsers.find((u: any) => u.email === email)) {
        throw new Error('Email already registered locally.');
      }
      
      const newId = 'local_' + Math.random().toString(36).substr(2, 9);
      const userProfile: UserProfile = {
        id: newId,
        email,
        name,
        phone,
        role: bootstrappedRole,
        createdAt: new Date().toISOString()
      };
      
      localUsers.push({ ...userProfile, password });
      localStorage.setItem('bongtech_users', JSON.stringify(localUsers));
      localStorage.setItem('bongtech_currentUser', JSON.stringify(userProfile));
      setCurrentUser(userProfile);
    }
  };

  const signInUser = async (email: string, password = 'defaultPassword') => {
    if (isFirebaseConfigured && auth && db) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const userSnap = await getDoc(doc(db, 'users', res.user.uid));
        if (userSnap.exists()) {
          setCurrentUser(userSnap.data() as UserProfile);
        }
      } catch (err) {
        console.error('Firebase SignIn Error:', err);
        throw err;
      }
    } else {
      // Local Database Authentication
      const localUsers = JSON.parse(localStorage.getItem('bongtech_users') || '[]');
      const foundUser = localUsers.find((u: any) => u.email === email && u.password === password);
      
      if (!foundUser) {
        // Build an automated fallback for sandbox users to register automatically
        const bootstrappedRole = email === 'sambathhok.true@gmail.com' ? 'admin' : 'customer';
        const defaultProfile: UserProfile = {
          id: 'local_' + Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          phone: '',
          role: bootstrappedRole,
          createdAt: new Date().toISOString()
        };
        localUsers.push({ ...defaultProfile, password });
        localStorage.setItem('bongtech_users', JSON.stringify(localUsers));
        localStorage.setItem('bongtech_currentUser', JSON.stringify(defaultProfile));
        setCurrentUser(defaultProfile);
        return;
      }
      
      const { password: _, ...profile } = foundUser;
      localStorage.setItem('bongtech_currentUser', JSON.stringify(profile));
      setCurrentUser(profile as UserProfile);
    }
  };

  const signInGoogle = async () => {
    if (isFirebaseConfigured && auth && db) {
      try {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        const userDocRef = doc(db, 'users', res.user.uid);
        const userSnap = await getDoc(userDocRef);
        
        let profile: UserProfile;
        if (userSnap.exists()) {
          profile = userSnap.data() as UserProfile;
        } else {
          const bootstrappedRole = res.user.email === 'sambathhok.true@gmail.com' ? 'admin' : 'customer';
          profile = {
            id: res.user.uid,
            email: res.user.email || '',
            name: res.user.displayName || 'Google User',
            phone: '',
            role: bootstrappedRole,
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, profile);
        }
        setCurrentUser(profile);
      } catch (err) {
        console.error('Google Auth Error:', err);
        throw err;
      }
    } else {
      // Local Mock Google Login
      const mockEmail = 'google_user@bongtech.cc';
      await signInUser(mockEmail);
    }
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
      createdAt: isFirebaseConfigured ? new Date() : new Date().toISOString(),
      updatedAt: isFirebaseConfigured ? new Date() : new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      const path = 'orders';
      try {
        await setDoc(doc(db, path, orderId), {
          ...newOrder,
          createdAt: new Date(), // Firebase rules enforce strict timestamps
          updatedAt: new Date()
        });
        clearCart();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      // Local offline database
      const savedOrders = JSON.parse(localStorage.getItem('bongtech_orders') || '[]');
      savedOrders.unshift(newOrder);
      localStorage.setItem('bongtech_orders', JSON.stringify(savedOrders));
      
      setOrders(prev => [newOrder, ...prev]);
      clearCart();
    }
  };

  // Admin and Staff order action
  const updateOrderStatus = async (orderId: string, status: 'confirmed' | 'cancelled') => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'staff')) {
      throw new Error('Unauthorized status modification.');
    }

    if (isFirebaseConfigured && db) {
      const path = 'orders';
      try {
        const orderRef = doc(db, path, orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const currentOrder = orderSnap.data() as Order;
          await setDoc(orderRef, {
            ...currentOrder,
            status,
            updatedAt: new Date()
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      // Local Database status update
      const savedOrders = JSON.parse(localStorage.getItem('bongtech_orders') || '[]');
      const updated = savedOrders.map((o: Order) => 
        o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
      );
      localStorage.setItem('bongtech_orders', JSON.stringify(updated));
      
      // Sync local dashboard state instantly
      setOrders(updated);
    }
  };

  // Real-time Order Monitoring for Admins/Staff
  const loadAllOrdersForAdmin = () => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'staff')) return;

    if (isFirebaseConfigured && db) {
      const path = 'orders';
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const freshOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          freshOrders.push(docSnap.data() as Order);
        });
        setOrders(freshOrders);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
      return unsubscribe;
    } else {
      // Offline fallback: load everything from localstorage
      const savedOrders = localStorage.getItem('bongtech_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    }
  };

  return (
    <AuthOrderContext.Provider value={{
      currentUser,
      loading,
      cart,
      orders,
      isFirebaseActive: isFirebaseConfigured,
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
      loadAllOrdersForAdmin
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
