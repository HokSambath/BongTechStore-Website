import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Product, Note, BlogPost } from '../types';

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
  avatarPath?: string;
  avatarUrl?: string;
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
  receiptPath?: string;
  receiptUrl?: string; // Signed URL
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
  uploadAvatar: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  uploadOrderReceipt: (orderId: string, file: File) => Promise<void>;
  deleteOrderReceipt: (orderId: string, filePath: string) => Promise<void>;
  notes: Note[];
  loadingNotes: boolean;
  loadUserNotes: () => Promise<void>;
  createNote: (title: string, content: string) => Promise<void>;
  updateNote: (id: string, title: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  blogPosts: BlogPost[];
  loadingBlog: boolean;
  loadBlogPosts: () => Promise<void>;
  createBlogPost: (title: string, excerpt: string, category: string, image: string, videoUrl?: string) => Promise<void>;
  updateBlogPost: (id: string, title: string, excerpt: string, category: string, image: string, videoUrl?: string) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  products: Product[];
  loadingProducts: boolean;
  loadProducts: () => Promise<void>;
  createProduct: (name: string, category: Product['category'], price: string, colors: string[], image: string, specs: Record<string, string>, description: string, isNew: boolean, isFeatured: boolean) => Promise<void>;
  updateProduct: (id: string, name: string, category: Product['category'], price: string, colors: string[], image: string, specs: Record<string, string>, description: string, isNew: boolean, isFeatured: boolean) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
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
  updated_at: typeof order.updatedAt === 'string' ? order.updatedAt : new Date(order.updatedAt).toISOString(),
  receipt_path: order.receiptPath || null
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
  updatedAt: dbOrder.updated_at,
  receiptPath: dbOrder.receipt_path || undefined
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
        const dbPath = user.user_metadata?.avatar_path || '';
        let signedUrl = '';
        if (dbPath) {
          try {
            const { data: signedData } = await supabase.storage
              .from('app-files')
              .createSignedUrl(dbPath, 60 * 60 * 24); // 24 hours
            signedUrl = signedData?.signedUrl || '';
          } catch (e) {
            console.error('Error signing avatar path:', e);
          }
        }
        const profile: UserProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          phone: user.user_metadata?.phone || '',
          role: bootstrappedRole,
          createdAt: user.created_at || new Date().toISOString(),
          avatarPath: dbPath,
          avatarUrl: signedUrl
        };
        if (active) {
          setCurrentUser(profile);
          localStorage.setItem('bongtech_currentUser', JSON.stringify(profile));
        }
      } else {
        if (active) {
          setCurrentUser(null);
          localStorage.removeItem('bongtech_currentUser');
        }
      }
      if (active) setLoading(false);

      // 2. Subscribe to Supabase auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!active) return;
        
        if (session?.user) {
          const user = session.user;
          const bootstrappedRole = user.email === 'sambathhok.true@gmail.com' ? 'admin' : (user.email === 'developer@bongtech.cc' ? 'staff' : 'customer');
          const dbPath = user.user_metadata?.avatar_path || '';
          let signedUrl = '';
          if (dbPath) {
            try {
              const { data: signedData } = await supabase.storage
                .from('app-files')
                .createSignedUrl(dbPath, 60 * 60 * 24);
              signedUrl = signedData?.signedUrl || '';
            } catch (e) {
              console.error('Error signing avatar path inside subscription:', e);
            }
          }
          const profile: UserProfile = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            phone: user.user_metadata?.phone || '',
            role: bootstrappedRole,
            createdAt: user.created_at || new Date().toISOString(),
            avatarPath: dbPath,
            avatarUrl: signedUrl
          };
          if (active) {
            setCurrentUser(profile);
            localStorage.setItem('bongtech_currentUser', JSON.stringify(profile));
          }
        } else {
          if (active) {
            setCurrentUser(null);
            localStorage.removeItem('bongtech_currentUser');
          }
        }
        if (active) setLoading(false);
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
          const mappedOrders = await Promise.all(data.map(async (dbOrder) => {
            const orderObj = mapFromDbOrder(dbOrder);
            if (orderObj.receiptPath) {
              try {
                const { data: signedData } = await supabase.storage
                  .from('app-files')
                  .createSignedUrl(orderObj.receiptPath, 60 * 60 * 24);
                orderObj.receiptUrl = signedData?.signedUrl || undefined;
              } catch (err) {
                console.error(`Error signing receipt ${orderObj.receiptPath}:`, err);
              }
            }
            return orderObj;
          }));

          if (active) {
            setOrders(mappedOrders);
          }
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
          const mappedOrders = await Promise.all(data.map(async (dbOrder) => {
            const orderObj = mapFromDbOrder(dbOrder);
            if (orderObj.receiptPath) {
              try {
                const { data: signedData } = await supabase.storage
                  .from('app-files')
                  .createSignedUrl(orderObj.receiptPath, 60 * 60 * 24);
                orderObj.receiptUrl = signedData?.signedUrl || undefined;
              } catch (err) {
                console.error(`Error signing receipt for admin view:`, err);
              }
            }
            return orderObj;
          }));

          if (active) {
            setOrders(mappedOrders);
          }
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

  // Upload or Update Avatar photo in Storage and Auth Metadata
  const uploadAvatar = async (file: File) => {
    if (!currentUser) throw new Error('Must sign in to upload your photo.');

    const uuid = Math.random().toString(36).substr(2, 9);
    const extension = file.name.split('.').pop() || 'png';
    const filePath = `${currentUser.id}/profile/avatar/${uuid}.${extension}`;

    // Delete old avatar if present
    if (currentUser.avatarPath) {
      try {
        await supabase.storage.from('app-files').remove([currentUser.avatarPath]);
      } catch (e) {
        console.warn('Could not remove previous avatar model:', e);
      }
    }

    // Upload to Supabase Storage private bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('app-files')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    // Update the profile configuration in Auth Metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_path: filePath
      }
    });

    if (updateError) throw updateError;

    // Fast status refresh of current profile layout
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const user = session.user;
      const bootstrappedRole = user.email === 'sambathhok.true@gmail.com' ? 'admin' : (user.email === 'developer@bongtech.cc' ? 'staff' : 'customer');
      let signedUrl = '';
      try {
        const { data: signedData } = await supabase.storage
          .from('app-files')
          .createSignedUrl(filePath, 60 * 60 * 24);
        signedUrl = signedData?.signedUrl || '';
      } catch (e) {
        console.error('Error signing uploaded avatar:', e);
      }
      
      const profile: UserProfile = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        phone: user.user_metadata?.phone || '',
        role: bootstrappedRole,
        createdAt: user.created_at || new Date().toISOString(),
        avatarPath: filePath,
        avatarUrl: signedUrl
      };
      
      setCurrentUser(profile);
      localStorage.setItem('bongtech_currentUser', JSON.stringify(profile));
    }
  };

  // Delete Avatar photo
  const deleteAvatar = async () => {
    if (!currentUser) throw new Error('Must sign in to delete.');
    if (!currentUser.avatarPath) return;

    // Remove the file from Storage
    const { error: storageError } = await supabase.storage
      .from('app-files')
      .remove([currentUser.avatarPath]);

    if (storageError) {
      console.warn('Storage avatar removal warning:', storageError);
    }

    // Clear record in metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_path: null
      }
    });

    if (updateError) throw updateError;

    const profile = { ...currentUser };
    delete profile.avatarPath;
    delete profile.avatarUrl;

    setCurrentUser(profile);
    localStorage.setItem('bongtech_currentUser', JSON.stringify(profile));
  };

  // Upload or Update Order Receipt
  const uploadOrderReceipt = async (orderId: string, file: File) => {
    if (!currentUser) throw new Error('Must sign in to attach files.');

    // Look up previous receipt path to delete
    const currentOrder = orders.find(o => o.id === orderId);
    if (currentOrder && currentOrder.receiptPath) {
      try {
        await supabase.storage.from('app-files').remove([currentOrder.receiptPath]);
      } catch (e) {
        console.warn('Could not remove previous receipt model:', e);
      }
    }

    const uuid = Math.random().toString(36).substr(2, 9);
    const extension = file.name.split('.').pop() || 'png';
    const filePath = `${currentUser.id}/orders/${orderId}/${uuid}.${extension}`;

    // Upload to Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('app-files')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    // Update the correct database table (orders) with the file path
    const { error: dbError } = await supabase
      .from('orders')
      .update({ receipt_path: filePath })
      .eq('id', orderId);

    if (dbError) throw dbError;

    // Refresh order state locally or rely on reactive real-time trigger
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, receiptPath: filePath };
      }
      return o;
    }));
  };

  // Delete Order Receipt
  const deleteOrderReceipt = async (orderId: string, filePath: string) => {
    if (!currentUser) throw new Error('Must sign in to delete files.');

    // Remove file from storage
    const { error: storageError } = await supabase.storage
      .from('app-files')
      .remove([filePath]);

    if (storageError) {
      console.warn('Storage receipt removal warning:', storageError);
    }

    // Set Column value to NULL in correct database table (orders)
    const { error: dbError } = await supabase
      .from('orders')
      .update({ receipt_path: null })
      .eq('id', orderId);

    if (dbError) throw dbError;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const orderCopy = { ...o };
        delete orderCopy.receiptPath;
        delete orderCopy.receiptUrl;
        return orderCopy;
      }
      return o;
    }));
  };

  // Notes states and features
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [useLocalStorageFallback, setUseLocalStorageFallback] = useState(false);

  const loadUserNotes = async () => {
    if (!currentUser) {
      setNotes([]);
      return;
    }
    setLoadingNotes(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.warn('Supabase "notes" table does not exist. Using localStorage fallback.');
          setUseLocalStorageFallback(true);
          const cached = localStorage.getItem(`bongtech_notes_${currentUser.id}`);
          if (cached) {
            setNotes(JSON.parse(cached));
          } else {
            setNotes([]);
          }
          return;
        }
        throw error;
      }
      if (data) {
        setNotes(data.map((n: any) => ({
          id: n.id,
          userId: n.user_id,
          title: n.title,
          content: n.content,
          createdAt: n.created_at,
          updatedAt: n.updated_at
        })));
        setUseLocalStorageFallback(false);
      }
    } catch (err: any) {
      console.error('Error loading notes, falling back to localStorage:', err);
      setUseLocalStorageFallback(true);
      const cached = localStorage.getItem(`bongtech_notes_${currentUser.id}`);
      if (cached) {
        setNotes(JSON.parse(cached));
      }
    } finally {
      setLoadingNotes(false);
    }
  };

  const createNote = async (title: string, content: string) => {
    if (!currentUser) throw new Error('You must be signed in to create a note.');

    if (useLocalStorageFallback) {
      if (notes.length >= 3) {
        throw new Error('Free plan limit reached. Upgrade to Pro to create unlimited notes.');
      }
      const newNote: Note = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [newNote, ...notes];
      setNotes(updated);
      localStorage.setItem(`bongtech_notes_${currentUser.id}`, JSON.stringify(updated));
      return;
    }

    // Count how many notes the current user already has (fresh database source of truth)
    const { count, error: countErr } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id);

    if (countErr) {
      console.warn('Error reading count from notes:', countErr);
    }

    // Force strict client-side restriction matching Supabase check RLS/Triggers
    const freshCount = count !== null ? count : notes.length;
    if (freshCount >= 3) {
      throw new Error('Free plan limit reached. Upgrade to Pro to create unlimited notes.');
    }

    // Insert new note
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: currentUser.id,
        title: title.trim(),
        content: content.trim()
      })
      .select()
      .single();

    if (error) {
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Attempted insert but table does not exist. Migrating to local fallback.');
        setUseLocalStorageFallback(true);
        const newNote: Note = {
          id: Math.random().toString(36).substr(2, 9),
          userId: currentUser.id,
          title: title.trim(),
          content: content.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const updated = [newNote, ...notes];
        setNotes(updated);
        localStorage.setItem(`bongtech_notes_${currentUser.id}`, JSON.stringify(updated));
        return;
      }
      throw error;
    }

    if (data) {
      const newNote: Note = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      setNotes(prev => [newNote, ...prev]);
    }
  };

  const updateNote = async (id: string, title: string, content: string) => {
    if (!currentUser) throw new Error('You must be signed in to update a note.');

    if (useLocalStorageFallback) {
      const updated = notes.map(n => n.id === id ? {
        ...n,
        title: title.trim(),
        content: content.trim(),
        updatedAt: new Date().toISOString()
      } : n);
      setNotes(updated);
      localStorage.setItem(`bongtech_notes_${currentUser.id}`, JSON.stringify(updated));
      return;
    }

    const { data, error } = await supabase
      .from('notes')
      .update({
        title: title.trim(),
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', currentUser.id)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setNotes(prev => prev.map(n => n.id === id ? {
        ...n,
        title: data.title,
        content: data.content,
        updatedAt: data.updated_at
      } : n));
    }
  };

  const deleteNote = async (id: string) => {
    if (!currentUser) throw new Error('You must be signed in to delete.');

    if (useLocalStorageFallback) {
      const updated = notes.filter(n => n.id !== id);
      setNotes(updated);
      localStorage.setItem(`bongtech_notes_${currentUser.id}`, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id);

    if (error) throw error;

    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Synchronize user notes when current user shifts
  useEffect(() => {
    if (currentUser) {
      loadUserNotes();
    } else {
      setNotes([]);
    }
  }, [currentUser]);

  // Blog states and core operations
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [useBlogLocalFallback, setUseBlogLocalFallback] = useState(false);

  const loadBlogPosts = async () => {
    setLoadingBlog(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.warn('blog_posts table does not exist. Using localStorage fallback + constants.');
          setUseBlogLocalFallback(true);
          const cached = localStorage.getItem('bongtech_local_blog_posts');
          if (cached) {
            setBlogPosts(JSON.parse(cached));
          } else {
            const { BLOG_POSTS: defaultPosts } = await import('../constants');
            setBlogPosts(defaultPosts);
          }
          return;
        }
        throw error;
      }

      if (data && data.length > 0) {
        setBlogPosts(data.map((b: any) => ({
          id: b.id,
          title: b.title,
          excerpt: b.excerpt,
          date: b.date,
          image: b.image,
          author: b.author,
          category: b.category,
          videoUrl: b.video_url || undefined
        })));
        setUseBlogLocalFallback(false);
      } else {
        const { BLOG_POSTS: defaultPosts } = await import('../constants');
        setBlogPosts(defaultPosts);
        setUseBlogLocalFallback(false);
      }
    } catch (err) {
      console.warn('Failed loading blog posts, falling back to local storage:', err);
      setUseBlogLocalFallback(true);
      const cached = localStorage.getItem('bongtech_local_blog_posts');
      if (cached) {
        setBlogPosts(JSON.parse(cached));
      } else {
        try {
          const { BLOG_POSTS: defaultPosts } = await import('../constants');
          setBlogPosts(defaultPosts);
        } catch {
          setBlogPosts([]);
        }
      }
    } finally {
      setLoadingBlog(false);
    }
  };

  const createBlogPost = async (title: string, excerpt: string, category: string, image: string, videoUrl?: string) => {
    const authorName = currentUser?.name || 'Bong Tech Author';
    
    if (useBlogLocalFallback) {
      const newPost: BlogPost = {
        id: Math.random().toString(36).substr(2, 9),
        title: title.trim(),
        excerpt: excerpt.trim(),
        category: category.trim(),
        image: image.trim(),
        videoUrl: videoUrl?.trim() || undefined,
        author: authorName,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      };
      const updated = [newPost, ...blogPosts];
      setBlogPosts(updated);
      localStorage.setItem('bongtech_local_blog_posts', JSON.stringify(updated));
      return;
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: title.trim(),
        excerpt: excerpt.trim(),
        category: category.trim(),
        image: image.trim(),
        video_url: videoUrl?.trim() || null,
        author: authorName,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      })
      .select()
      .single();

    if (error) {
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Attempted to post blog but table does not exist. Migrating to local fallback.');
        setUseBlogLocalFallback(true);
        const newPost: BlogPost = {
          id: Math.random().toString(36).substr(2, 9),
          title: title.trim(),
          excerpt: excerpt.trim(),
          category: category.trim(),
          image: image.trim(),
          videoUrl: videoUrl?.trim() || undefined,
          author: authorName,
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };
        const updated = [newPost, ...blogPosts];
        setBlogPosts(updated);
        localStorage.setItem('bongtech_local_blog_posts', JSON.stringify(updated));
        return;
      }
      throw error;
    }

    if (data) {
      const newPost: BlogPost = {
        id: data.id,
        title: data.title,
        excerpt: data.excerpt,
        category: data.category,
        image: data.image,
        videoUrl: data.video_url || undefined,
        author: data.author,
        date: data.date
      };
      setBlogPosts(prev => [newPost, ...prev]);
    }
  };

  const updateBlogPost = async (id: string, title: string, excerpt: string, category: string, image: string, videoUrl?: string) => {
    if (useBlogLocalFallback) {
      const updated = blogPosts.map(p => p.id === id ? {
        ...p,
        title: title.trim(),
        excerpt: excerpt.trim(),
        category: category.trim(),
        image: image.trim(),
        videoUrl: videoUrl?.trim() || undefined
      } : p);
      setBlogPosts(updated);
      localStorage.setItem('bongtech_local_blog_posts', JSON.stringify(updated));
      return;
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        title: title.trim(),
        excerpt: excerpt.trim(),
        category: category.trim(),
        image: image.trim(),
        video_url: videoUrl?.trim() || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setBlogPosts(prev => prev.map(p => p.id === id ? {
        ...p,
        title: data.title,
        excerpt: data.excerpt,
        category: data.category,
        image: data.image,
        videoUrl: data.video_url || undefined
      } : p));
    }
  };

  const deleteBlogPost = async (id: string) => {
    if (useBlogLocalFallback) {
      const updated = blogPosts.filter(p => p.id !== id);
      setBlogPosts(updated);
      localStorage.setItem('bongtech_local_blog_posts', JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setBlogPosts(prev => prev.filter(p => p.id !== id));
  };

  // Dynamic Products and operations
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [useProductsLocalFallback, setUseProductsLocalFallback] = useState(false);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.warn('products table does not exist in Supabase yet. Using local fallback.');
          setUseProductsLocalFallback(true);
          const cached = localStorage.getItem('bongtech_local_products');
          if (cached) {
            setProducts(JSON.parse(cached));
          } else {
            const { PRODUCTS: defaultProducts } = await import('../constants');
            setProducts(defaultProducts);
            localStorage.setItem('bongtech_local_products', JSON.stringify(defaultProducts));
          }
          return;
        }
        throw error;
      }

      if (data && data.length > 0) {
        setProducts(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          colors: p.colors || [],
          image: p.image,
          specs: p.specs || {},
          description: p.description || '',
          isNew: p.is_new,
          isFeatured: p.is_featured
        })));
        setUseProductsLocalFallback(false);
      } else {
        const { PRODUCTS: defaultProducts } = await import('../constants');
        setProducts(defaultProducts);
        setUseProductsLocalFallback(false);
      }
    } catch (err) {
      console.warn('Failed loading products, using local fallback:', err);
      setUseProductsLocalFallback(true);
      const cached = localStorage.getItem('bongtech_local_products');
      if (cached) {
        setProducts(JSON.parse(cached));
      } else {
        try {
          const { PRODUCTS: defaultProducts } = await import('../constants');
          setProducts(defaultProducts);
        } catch {
          setProducts([]);
        }
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const createProduct = async (
    name: string, 
    category: Product['category'], 
    price: string, 
    colors: string[], 
    image: string, 
    specs: Record<string, string>, 
    description: string, 
    isNew: boolean, 
    isFeatured: boolean
  ) => {
    if (useProductsLocalFallback) {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        category,
        price: price.startsWith('$') ? price.trim() : `$${price.trim()}`,
        colors,
        image: image.trim(),
        specs,
        description: description.trim(),
        isNew,
        isFeatured
      };
      const updated = [newProduct, ...products];
      setProducts(updated);
      localStorage.setItem('bongtech_local_products', JSON.stringify(updated));
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: name.trim(),
        category,
        price: price.startsWith('$') ? price.trim() : `$${price.trim()}`,
        colors,
        image: image.trim(),
        specs,
        description: description.trim(),
        is_new: isNew,
        is_featured: isFeatured
      })
      .select()
      .single();

    if (error) {
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Attempted to push product but table does not exist. Migrating to local fallback.');
        setUseProductsLocalFallback(true);
        const newProduct: Product = {
          id: Math.random().toString(36).substr(2, 9),
          name: name.trim(),
          category,
          price: price.startsWith('$') ? price.trim() : `$${price.trim()}`,
          colors,
          image: image.trim(),
          specs,
          description: description.trim(),
          isNew,
          isFeatured
        };
        const updated = [newProduct, ...products];
        setProducts(updated);
        localStorage.setItem('bongtech_local_products', JSON.stringify(updated));
        return;
      }
      throw error;
    }

    if (data) {
      const newProduct: Product = {
        id: data.id,
        name: data.name,
        category: data.category,
        price: data.price,
        colors: data.colors || [],
        image: data.image,
        specs: data.specs || {},
        description: data.description || '',
        isNew: data.is_new,
        isFeatured: data.is_featured
      };
      setProducts(prev => [newProduct, ...prev]);
    }
  };

  const updateProduct = async (
    id: string,
    name: string, 
    category: Product['category'], 
    price: string, 
    colors: string[], 
    image: string, 
    specs: Record<string, string>, 
    description: string, 
    isNew: boolean, 
    isFeatured: boolean
  ) => {
    if (useProductsLocalFallback) {
      const updated = products.map(p => p.id === id ? {
        ...p,
        name: name.trim(),
        category,
        price: price.startsWith('$') ? price.trim() : `$${price.trim()}`,
        colors,
        image: image.trim(),
        specs,
        description: description.trim(),
        isNew,
        isFeatured
      } : p);
      setProducts(updated);
      localStorage.setItem('bongtech_local_products', JSON.stringify(updated));
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: name.trim(),
        category,
        price: price.startsWith('$') ? price.trim() : `$${price.trim()}`,
        colors,
        image: image.trim(),
        specs,
        description: description.trim(),
        is_new: isNew,
        is_featured: isFeatured
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setProducts(prev => prev.map(p => p.id === id ? {
        ...p,
        name: data.name,
        category: data.category,
        price: data.price,
        colors: data.colors || [],
        image: data.image,
        specs: data.specs || {},
        description: data.description || '',
        isNew: data.is_new,
        isFeatured: data.is_featured
      } : p));
    }
  };

  const deleteProduct = async (id: string) => {
    if (useProductsLocalFallback) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem('bongtech_local_products', JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Initial load of blog posts and products
  useEffect(() => {
    loadBlogPosts();
    loadProducts();
  }, []);

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
      deleteOrder,
      uploadAvatar,
      deleteAvatar,
      uploadOrderReceipt,
      deleteOrderReceipt,
      notes,
      loadingNotes,
      loadUserNotes,
      createNote,
      updateNote,
      deleteNote,
      blogPosts,
      loadingBlog,
      loadBlogPosts,
      createBlogPost,
      updateBlogPost,
      deleteBlogPost,
      products,
      loadingProducts,
      loadProducts,
      createProduct,
      updateProduct,
      deleteProduct
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
