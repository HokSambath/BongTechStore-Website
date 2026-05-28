import React, { useEffect, useState } from 'react';
import { useAuthOrder, Order } from '../contexts/AuthOrderContext';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, CheckCircle, XCircle, Clock, 
  DollarSign, TrendingUp, AlertCircle, ShoppingCart, LogOut,
  Plus, Edit3, Trash2, Globe, FileText, Sparkles, BookOpen, Video, Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabaseClient';

export default function AdminPage() {
  const { 
    orders, 
    currentUser, 
    updateOrderStatus, 
    loadAllOrdersForAdmin, 
    logOutUser,
    blogPosts,
    loadingBlog,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    products,
    loadingProducts,
    createProduct,
    updateProduct,
    deleteProduct
  } = useAuthOrder();
  
  const navigate = useNavigate();
  
  // High-level navigation
  const [activePortalTab, setActivePortalTab] = useState<'orders' | 'products' | 'blog'>('orders');
  
  // Orders states
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Product editor states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState<string>('Accessories');
  const [productPrice, setProductPrice] = useState('');
  const [productColors, setProductColors] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productSpecsStr, setProductSpecsStr] = useState('');
  const [productIsNew, setProductIsNew] = useState(false);
  const [productIsFeatured, setProductIsFeatured] = useState(false);
  const [productSuccess, setProductSuccess] = useState('');
  const [productError, setProductError] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Blog editor states
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCategory, setBlogCategory] = useState('Reviews');
  const [blogImage, setBlogImage] = useState('');
  const [blogVideoUrl, setBlogVideoUrl] = useState('');
  const [blogError, setBlogError] = useState('');
  const [blogSuccess, setBlogSuccess] = useState('');
  const [submittingBlog, setSubmittingBlog] = useState(false);
  const [blogFormActiveTab, setBlogFormActiveTab] = useState<'write' | 'preview'>('write');

  // Lock Admin access to staff & admin only
  useEffect(() => {
    let active = true;

    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;

      if (!session) {
        navigate('/admin/signin');
        return;
      }

      if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'staff') {
        navigate('/');
        return;
      }
    };

    checkAuthAndRedirect();

    let unsubscribe: any;
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff')) {
      unsubscribe = loadAllOrdersForAdmin();
    }

    return () => {
      active = false;
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser, navigate]);

  const handleUpdateStatus = async (orderId: string, status: 'confirmed' | 'cancelled') => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, status);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(o => o.status === filter);
  };

  // Stats calculation
  const stats = orders.reduce((acc, o) => {
    acc.totalCount += 1;
    if (o.status === 'pending') acc.pendingCount += 1;
    if (o.status === 'confirmed') {
      acc.confirmedCount += 1;
      const val = parseFloat(o.totalPrice.replace('$', ''));
      acc.earnings += isNaN(val) ? 0 : val;
    }
    return acc;
  }, { totalCount: 0, pendingCount: 0, confirmedCount: 0, earnings: 0 });

  // Blog submission
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogExcerpt.trim() || !blogCategory.trim()) {
      setBlogError('Please fill in title, excerpt, and category.');
      return;
    }

    setSubmittingBlog(true);
    setBlogError('');
    setBlogSuccess('');

    try {
      const parsedImage = blogImage.trim() || 'https://picsum.photos/seed/gaming-blog/80/40';
      const parsedVideo = blogVideoUrl.trim() || undefined;

      if (editingPostId) {
        await updateBlogPost(editingPostId, blogTitle, blogExcerpt, blogCategory, parsedImage, parsedVideo, blogContent || undefined);
        setBlogSuccess('Article updated on the live website!');
      } else {
        await createBlogPost(blogTitle, blogExcerpt, blogCategory, parsedImage, parsedVideo, blogContent || undefined);
        setBlogSuccess('Article published to the Bong Tech Store blog!');
      }

      // Reset
      setBlogTitle('');
      setBlogExcerpt('');
      setBlogContent('');
      setBlogImage('');
      setBlogVideoUrl('');
      setBlogCategory('Reviews');
      setEditingPostId(null);
    } catch (err: any) {
      setBlogError(err.message || 'Error occurred during posting.');
    } finally {
      setSubmittingBlog(false);
    }
  };

  const handleEditBlogClick = (post: any) => {
    setEditingPostId(post.id);
    setBlogTitle(post.title);
    setBlogExcerpt(post.excerpt);
    setBlogContent(post.content || '');
    setBlogCategory(post.category);
    setBlogImage(post.image || '');
    setBlogVideoUrl(post.videoUrl || '');
    setBlogError('');
    setBlogSuccess('');

    const el = document.getElementById('blog-editor-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteBlog = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    setBlogError('');
    setBlogSuccess('');
    try {
      await deleteBlogPost(postId);
      setBlogSuccess('Article deleted successfully.');
    } catch (err: any) {
      setBlogError(err.message || 'Failed to delete blog post.');
    }
  };

  // Product submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !productPrice.trim() || !productDescription.trim()) {
      setProductError('Please fill in product name, price, and description.');
      return;
    }

    setSubmittingProduct(true);
    setProductError('');
    setProductSuccess('');

    try {
      const colorsArr = productColors.split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);
      
      const colors = colorsArr.length > 0 ? colorsArr : ['Black', 'White'];

      // Parse specs from lines
      const specsObj: Record<string, string> = {};
      productSpecsStr.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join(':').trim();
          if (key && val) {
            specsObj[key] = val;
          }
        }
      });

      const parsedImage = productImage.trim() || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600';

      if (editingProductId) {
        await updateProduct(
          editingProductId, 
          productName, 
          productCategory, 
          productPrice, 
          colors, 
          parsedImage, 
          specsObj, 
          productDescription, 
          productIsNew, 
          productIsFeatured
        );
        setProductSuccess('Product listings updated successfully!');
      } else {
        await createProduct(
          productName, 
          productCategory, 
          productPrice, 
          colors, 
          parsedImage, 
          specsObj, 
          productDescription, 
          productIsNew, 
          productIsFeatured
        );
        setProductSuccess('New product published to active catalog!');
      }

      // Reset
      setProductName('');
      setProductPrice('');
      setProductColors('');
      setProductImage('');
      setProductDescription('');
      setProductSpecsStr('');
      setProductIsNew(false);
      setProductIsFeatured(false);
      setEditingProductId(null);
    } catch (err: any) {
      setProductError(err.message || 'Error occurred handling products action.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleEditProductClick = (prod: any) => {
    setEditingProductId(prod.id);
    setProductName(prod.name);
    setProductCategory(prod.category);
    setProductPrice(prod.price);
    setProductColors(prod.colors?.join(', ') || '');
    setProductImage(prod.image || '');
    setProductDescription(prod.description || '');
    
    // Map specs record back to string lines
    const specLines = Object.entries(prod.specs || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    setProductSpecsStr(specLines);

    setProductIsNew(!!prod.isNew);
    setProductIsFeatured(!!prod.isFeatured);
    setProductError('');
    setProductSuccess('');

    const el = document.getElementById('product-editor-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setProductError('');
    setProductSuccess('');
    try {
      await deleteProduct(id);
      setProductSuccess('Product removed from active catalog.');
    } catch (err: any) {
      setProductError(err.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen section-container">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gradient uppercase tracking-tight flex items-center gap-3">
            <ClipboardList size={30} className="text-brand-primary" />
            Bong Tech Admin Board
          </h1>
          <p className="text-xs text-text-dim mt-1">
            Logged in as: <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.role.toUpperCase()})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              await logOutUser();
              navigate('/');
            }}
            className="flex items-center gap-1.5 text-xs font-black uppercase text-red-400 hover:text-red-500 hover:bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded transition-all"
          >
            <LogOut size={14} />
            Sign Out Portal
          </button>
        </div>
      </div>

      {/* Main Switcher Navigation Tabs */}
      <div className="flex gap-4 border-b border-border/80 mb-8">
        <button
          onClick={() => setActivePortalTab('orders')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activePortalTab === 'orders' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-dim hover:text-white'}`}
        >
          <ShoppingCart size={15} />
          Customer Orders ({stats.totalCount})
        </button>
        <button
          onClick={() => setActivePortalTab('products')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activePortalTab === 'products' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-dim hover:text-white'}`}
        >
          <Plus size={15} />
          Store Catalog ({products.length})
        </button>
        <button
          onClick={() => setActivePortalTab('blog')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activePortalTab === 'blog' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-dim hover:text-white'}`}
        >
          <BookOpen size={15} />
          Store Blog Manager ({blogPosts.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activePortalTab === 'orders' ? (
          <motion.div
            key="orders-portal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Grid Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-4 relative overflow-hidden">
                <div className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-between">
                  Confirmed Revenue <TrendingUp size={14} className="text-green-400" />
                </div>
                <div className="text-2xl font-black text-brand-primary">${stats.earnings.toFixed(2)}</div>
              </div>

              <div className="glass-card p-4 relative overflow-hidden">
                <div className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-between">
                  Active Orders <ShoppingCart size={14} className="text-yellow-400" />
                </div>
                <div className="text-2xl font-black text-white">{stats.totalCount}</div>
              </div>

              <div className="glass-card p-4 relative overflow-hidden">
                <div className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-between">
                  Pending Checks <Clock size={14} className="text-yellow-400" />
                </div>
                <div className="text-2xl font-black text-yellow-400">{stats.pendingCount}</div>
              </div>

              <div className="glass-card p-4 relative overflow-hidden">
                <div className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-between">
                  Confirmed Deliveries <CheckCircle size={14} className="text-green-400" />
                </div>
                <div className="text-2xl font-black text-green-400">{stats.confirmedCount}</div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-border mb-6">
              {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${filter === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-dim'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Table & List */}
            {getFilteredOrders().length === 0 ? (
              <div className="glass-card p-12 text-center">
                <AlertCircle size={32} className="text-text-dim mx-auto mb-2" />
                <h2 className="text-sm font-bold text-white">No orders matching "{filter}"</h2>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredOrders().map((order) => {
                  const dateStr = typeof order.createdAt === 'object' && order.createdAt?.toDate 
                    ? order.createdAt.toDate().toLocaleString() 
                    : new Date(order.createdAt).toLocaleString();

                  return (
                    <motion.div 
                      layout
                      key={order.id}
                      className="glass-card p-5 flex flex-col md:flex-row justify-between relative overflow-hidden gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-[10px] font-black text-zinc-500 font-mono">ID: {order.id.slice(0, 8).toUpperCase()}...</span>
                          <span className="text-xs font-black text-white">{order.customerName}</span>
                          <span className="text-xs text-text-dim font-mono">{order.customerPhone}</span>
                        </div>

                        {/* Order items info banner */}
                        <div className="pl-4 border-l border-zinc-800 space-y-1 my-3">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-xs text-zinc-400">
                              <strong className="text-brand-primary">{it.quantity}x</strong> {it.productName} 
                              {it.color && <span className="text-[10px] text-zinc-500 ml-1">({it.color})</span>}
                            </div>
                          ))}
                        </div>

                        <div className="text-[10px] text-zinc-500">
                          Received: {dateStr}
                        </div>

                        {order.receiptUrl ? (
                          <div className="mt-3 flex items-center gap-1.5 bg-brand-primary/5 hover:bg-brand-primary/10 border border-brand-primary/20 px-3 py-1.5 rounded-md w-fit transition-colors">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Proof:</span>
                            <a 
                              id={`admin-view-receipt-${order.id}`}
                              href={order.receiptUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-xs text-brand-primary hover:underline font-black flex items-center gap-1"
                            >
                              View Receipt Image ➔
                            </a>
                          </div>
                        ) : (
                          <div className="mt-3 text-[10px] text-zinc-500 italic pb-0.5">
                            No customer receipt attached.
                          </div>
                        )}
                      </div>

                      <div className="flex md:flex-col items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-border gap-4">
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-text-dim uppercase tracking-wider font-bold">Total price</div>
                          <div className="text-base font-black text-brand-primary">{order.totalPrice}</div>
                        </div>

                        <div className="flex gap-2">
                          {order.status === 'pending' ? (
                            <>
                              <button
                                disabled={updatingId === order.id}
                                onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-black font-black text-[10px] uppercase rounded flex items-center gap-1 transition-all"
                              >
                                <CheckCircle size={12} />
                                Confirm
                              </button>
                              <button
                                disabled={updatingId === order.id}
                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase rounded flex items-center gap-1 transition-all"
                              >
                                <XCircle size={12} />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded border ${order.status === 'confirmed' ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'text-red-400 border-red-500/20 bg-red-500/5'}`}>
                              {order.status === 'confirmed' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                              {order.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : activePortalTab === 'products' ? (
          <motion.div
            key="products-portal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-10"
          >
            {/* Top Hand: Product Creator/Editor Form (Full Width Layout) */}
            <div id="product-editor-anchor" className="bg-zinc-900/60 p-8 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary" stroke-width="2" />
              
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <Sparkles size={16} className="text-brand-primary animate-pulse" />
                {editingProductId ? 'Edit Tech Product Listing' : 'Publish New Tech Product'}
              </h3>

              {productSuccess && (
                <div className="text-xs text-green-400 border border-green-500/20 bg-green-500/10 rounded p-3 mb-6 font-bold font-black">
                  {productSuccess}
                </div>
              )}

              {productError && (
                <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 rounded p-3 mb-6 font-bold font-black">
                  {productError}
                </div>
              )}

              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Column 1: Core Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Product Title</label>
                      <input 
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                        placeholder="e.g. Bong Custom Ryzen 9 Ultimate Gaming Rig"
                        className="input-field placeholder:text-zinc-650"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1 flex justify-between">
                        <span>Store Category</span>
                        <span className="text-[8px] font-bold text-brand-primary lowercase">or type text directly</span>
                      </label>
                      <input 
                        type="text"
                        value={productCategory}
                        required
                        onChange={(e) => setProductCategory(e.target.value)}
                        placeholder="e.g. Custom Rig, VR Setup, Mechanical Keyboard"
                        className="input-field placeholder:text-zinc-650"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['Device', 'Gaming PC', 'Accessories', 'Smartphone', 'Product'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setProductCategory(preset)}
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border transition-all ${
                              productCategory === preset 
                                ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                                : 'bg-zinc-950 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Retail Price (USD)</label>
                        <input 
                          type="text"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          required
                          placeholder="e.g. $1,299.99"
                          className="input-field placeholder:text-zinc-650 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Available Colors</label>
                        <input 
                          type="text"
                          value={productColors}
                          onChange={(e) => setProductColors(e.target.value)}
                          placeholder="e.g. Black, Silver, White"
                          className="input-field placeholder:text-zinc-650"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Media, Features & Specifications */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Banner Image URL</label>
                      <input 
                        type="url"
                        value={productImage}
                        onChange={(e) => setProductImage(e.target.value)}
                        placeholder="e.g. https://images.unsplash.com/photo-xxx"
                        className="input-field placeholder:text-zinc-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
                        <span>Performance Specs</span>
                        <span className="text-[8px] font-bold text-brand-primary lowercase">key:value per line</span>
                      </label>
                      <textarea 
                        value={productSpecsStr}
                        onChange={(e) => setProductSpecsStr(e.target.value)}
                        placeholder="GPU: Nvidia RTX 4080 Super&#10;CPU: AMD Ryzen 9 7900X&#10;RAM: 32GB DDR5 Kingston Fury&#10;Storage: 2TB Samsung 990 Pro NVMe"
                        rows={3}
                        className="input-field placeholder:text-zinc-600 font-mono text-[11px] leading-relaxed resize-y h-[92px]"
                      />
                    </div>

                    <div className="flex gap-4 p-2.5 bg-zinc-950/40 rounded-lg border border-white/5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={productIsNew}
                          onChange={(e) => setProductIsNew(e.target.checked)}
                          className="rounded border-zinc-700 text-brand-primary focus:ring-brand-primary bg-zinc-950 h-3.5 w-3.5"
                        />
                        <span className="text-[10px] font-black uppercase text-zinc-400">Mark "New"</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={productIsFeatured}
                          onChange={(e) => setProductIsFeatured(e.target.checked)}
                          className="rounded border-zinc-700 text-brand-primary focus:ring-brand-primary bg-zinc-950 h-3.5 w-3.5"
                        />
                        <span className="text-[10px] font-black uppercase text-zinc-400 font-black">Featured Slider</span>
                      </label>
                    </div>
                  </div>

                  {/* Column 3: Detailed Description & Actions */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Product Description</label>
                      <textarea 
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        required
                        placeholder="Write detailed specifications, notes or warranty info..."
                        className="input-field placeholder:text-zinc-600 min-h-[142px] resize-y"
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="submit"
                        disabled={submittingProduct}
                        className="btn-primary flex-1 py-2.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse"
                      >
                        {submittingProduct ? 'Syncing...' : (editingProductId ? 'Update Product' : 'Add Product')}
                      </button>

                      {editingProductId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(null);
                            setProductName('');
                            setProductPrice('');
                            setProductColors('');
                            setProductImage('');
                            setProductDescription('');
                            setProductSpecsStr('');
                            setProductIsNew(false);
                            setProductIsFeatured(false);
                          }}
                          className="px-3 bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700 font-bold uppercase tracking-widest text-[10px] rounded-lg"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Bottom Hand: Interactive Store Catalog Registry */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-black">
                  <Plus size={15} className="text-brand-primary animate-pulse" />
                  Live Store Catalog Listings ({products.length})
                </h3>
              </div>

              {loadingProducts ? (
                <div className="text-xs text-text-dim text-center py-10">Refreshing active catalog list...</div>
              ) : products.length === 0 ? (
                <div className="text-xs text-text-dim text-center py-10 font-bold">No products found in the database. Add some using the compose panel!</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((prod) => (
                    <div 
                      key={prod.id}
                      className="bg-zinc-950/60 border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-white/10 transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black uppercase text-brand-primary bg-brand-primary/10 border border-brand-primary/15 px-2 py-0.5 rounded truncate max-w-[130px]">
                            {prod.category}
                          </span>
                          <span className="text-xs font-black text-white">{prod.price}</span>
                        </div>
                        <div className="flex gap-3 mb-3">
                          <img 
                            src={prod.image} 
                            alt={prod.name} 
                            className="w-12 h-12 object-contain bg-black rounded border border-white/5 p-1 shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-brand-primary transition-colors">{prod.name}</h4>
                            <p className="text-[11px] text-text-dim line-clamp-2 leading-relaxed mt-0.5">{prod.description}</p>
                          </div>
                        </div>

                        {/* Listed specs chips */}
                        <div className="space-y-1 mb-4 border-t border-white/5 pt-2">
                          {Object.entries(prod.specs || {}).slice(0, 3).map(([k, v]) => (
                            <div key={k} className="flex text-[10px] justify-between">
                              <span className="text-zinc-500 font-mono">{k}:</span>
                              <span className="text-zinc-300 font-mono truncate max-w-[140px]">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto font-bold uppercase text-[10px]">
                        <div className="flex gap-1.5">
                          {prod.colors?.map((color: string) => (
                            <div 
                              key={color} 
                              className="w-2.5 h-2.5 rounded-full border border-white/15"
                              style={{ backgroundColor: color.toLowerCase().includes('white') ? '#fff' : color.toLowerCase() }}
                              title={color}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditProductClick(prod)}
                            className="text-[10px] uppercase font-bold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <Edit3 size={11} />
                            Edit
                          </button>
                          <span className="text-zinc-800">|</span>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="text-[10px] uppercase font-bold text-red-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 size={11} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="blog-portal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-10"
          >
            {/* Top Hand: Article Creator/Editor Form (Full Width Layout) */}
            <div id="blog-editor-anchor" className="bg-zinc-900/60 p-8 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-base font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-brand-primary animate-pulse" />
                    {editingPostId ? 'Edit Blog Article' : 'Compose Blog Article'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Publish fully structured tech guides, hardware reviews, and announcements directly to the home screen.</p>
                </div>
                
                {/* Mode Selector Tabs */}
                <div className="flex border border-white/5 bg-zinc-950 p-1 rounded-lg shrink-0">
                  <button 
                    type="button"
                    onClick={() => setBlogFormActiveTab('write')}
                    className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      blogFormActiveTab === 'write' 
                        ? 'bg-brand-primary/10 border border-brand-primary/20 text-brand-primary' 
                        : 'border border-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    <BookOpen size={13} />
                    Write Content
                  </button>
                  <button 
                    type="button"
                    onClick={() => setBlogFormActiveTab('preview')}
                    className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      blogFormActiveTab === 'preview' 
                        ? 'bg-brand-primary/10 border border-brand-primary/20 text-brand-primary' 
                        : 'border border-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Globe size={13} />
                    Live Reader Preview
                  </button>
                </div>
              </div>

              {blogSuccess && (
                <div className="text-xs text-green-400 border border-green-500/20 bg-green-500/10 rounded-lg p-3 mb-6 font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping inline-block" />
                  {blogSuccess}
                </div>
              )}

              {blogError && (
                <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 rounded-lg p-3 mb-6 font-bold">
                  {blogError}
                </div>
              )}

              <form onSubmit={handleBlogSubmit} className="space-y-6">
                {blogFormActiveTab === 'write' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Panel: Crucial Metadata & Media Parameters (lg:col-span-5) */}
                    <div className="lg:col-span-5 space-y-6 bg-zinc-950/40 p-6 rounded-xl border border-white/5">
                      <div className="border-b border-white/5 pb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">1. Metadata & Assets</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Article Title</label>
                        <input 
                          type="text"
                          value={blogTitle}
                          onChange={(e) => setBlogTitle(e.target.value)}
                          required
                          placeholder="e.g. Hands on with the IINE Ananke 2 in Phnom Penh"
                          className="input-field placeholder:text-zinc-600 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2 flex justify-between">
                          <span>Category Header</span>
                          <span className="text-[8px] font-bold text-brand-primary lowercase">or type text directly</span>
                        </label>
                        <input 
                          type="text"
                          value={blogCategory}
                          required
                          onChange={(e) => setBlogCategory(e.target.value)}
                          placeholder="e.g. Reviews, Tutorials, Tech Guides"
                          className="input-field placeholder:text-zinc-600 font-mono text-xs"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {['Reviews', 'YouTube', 'Guides', 'Announcements'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setBlogCategory(preset)}
                              className={`text-[9px] font-black uppercase px-2.5 py-1 rounded border transition-all ${
                                blogCategory === preset 
                                  ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                                  : 'bg-zinc-950 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Cover Image URL</label>
                        <input 
                          type="url"
                          value={blogImage}
                          onChange={(e) => setBlogImage(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/photo-xxx (leaves blank for random)"
                          className="input-field placeholder:text-zinc-600 text-xs"
                        />
                        {blogImage && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-white/5 aspect-video relative max-h-36">
                            <img 
                              src={blogImage} 
                              alt="Cover preview" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/800/400';
                              }}
                            />
                            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-mono text-zinc-400">
                              Active Preview
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Embedded YouTube Video Link (Optional)</label>
                        <input 
                          type="url"
                          value={blogVideoUrl}
                          onChange={(e) => setBlogVideoUrl(e.target.value)}
                          placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                          className="input-field placeholder:text-zinc-650 text-xs font-mono"
                        />
                        <span className="text-[8px] text-zinc-500 mt-1 block">Ensure the URL uses the /embed/ format (e.g., https://www.youtube.com/embed/...)</span>
                      </div>
                    </div>

                    {/* Right Panel: Spacious Rich Excerpt and the Huge Main Body (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">2. Core Contents Editor</span>
                        
                        {/* Live statistics widget */}
                        <div className="flex gap-4 text-[9px] font-mono text-zinc-400">
                          <span>Words: <strong className="text-white">{blogContent.split(/\s+/).filter(Boolean).length}</strong></span>
                          <span>Reading time: <strong className="text-white">{Math.max(1, Math.ceil(blogContent.split(/\s+/).filter(Boolean).length / 180))} min</strong></span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Catchy Excerpt Summary (Quick Read Card)</label>
                        <textarea 
                          value={blogExcerpt}
                          onChange={(e) => setBlogExcerpt(e.target.value)}
                          required
                          rows={2}
                          placeholder="An eye-catching 1-2 sentence hook styled on the front cards to draw gaming enthusiast clicks dynamic..."
                          className="input-field placeholder:text-zinc-650 resize-y text-sm font-medium"
                        />
                      </div>

                      <div className="flex flex-col flex-1 h-full min-h-[300px]">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Main Formatted Body Content</label>
                          <span className="text-[8px] font-mono text-zinc-500 uppercase">Hit "Enter" between paragraphs. Supports clean formatting.</span>
                        </div>
                        <textarea 
                          value={blogContent}
                          onChange={(e) => setBlogContent(e.target.value)}
                          placeholder="Compose your high-quality full review article here...&#10;&#10;Introduce the hardware device or tech updates. Tell your readers what you love, build quality, gaming performances, and prices in local stores.&#10;&#10;Use plain text paragraphs. Each line break forms a beautifully padded paragraph element on readers' mobile and screens!"
                          className="input-field placeholder:text-zinc-650 flex-1 min-h-[290px] resize-y font-normal leading-relaxed text-sm bg-zinc-950/60 p-5 rounded-xl text-zinc-100"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Interactive Previsualization Stage (Reader View Interface) */
                  <div className="border border-white/5 rounded-2xl bg-zinc-950/80 p-8 space-y-6 max-h-[600px] overflow-y-auto custom-scroll">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-1 rounded text-brand-primary">
                          {blogCategory || 'Technology'}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">May 28, 2026</span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-3">
                        <span>By Bong Tech Editor</span>
                        <span>•</span>
                        <span>{Math.max(1, Math.ceil((blogContent || '').split(/\s+/).filter(Boolean).length / 180))} min read</span>
                      </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                      {blogTitle || 'Untitled Blog Post'}
                    </h1>

                    <p className="text-base text-zinc-300 italic border-l-2 border-brand-primary pl-4 py-1 leading-relaxed">
                      {blogExcerpt || 'No summary hook provided yet.'}
                    </p>

                    {/* Preview Cover image */}
                    {(blogImage || !blogVideoUrl) && (
                      <div className="rounded-xl overflow-hidden shadow-2xl relative w-full aspect-video md:max-h-80 border border-white/5">
                        <img 
                          src={blogImage || 'https://picsum.photos/seed/preview-seed/800/400'} 
                          alt="Cover Article" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* YouTube Embedded Section */}
                    {blogVideoUrl && (
                      <div className="rounded-xl overflow-hidden aspect-video border border-white/5 bg-black">
                        <iframe 
                          src={blogVideoUrl} 
                          title="YouTube review embed video" 
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* Split content display */}
                    <div className="space-y-4 pt-4 border-t border-white/5 text-zinc-300 text-sm leading-relaxed max-w-none">
                      {blogContent ? (
                        blogContent.split('\n').map((p, index) => p.trim() && (
                          <p key={index} className="text-zinc-300 leading-relaxed font-normal">
                            {p}
                          </p>
                        ))
                      ) : (
                        <p className="text-zinc-500 italic">No body content defined yet. Return to "Write Content" tab to begin composing dynamic paragraphs.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Form Action Controls Trigger row */}
                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <div className="text-[10px] font-mono text-zinc-500">
                    {editingPostId ? (
                      <span>Editing internal ID: <code className="text-brand-primary">{editingPostId}</code></span>
                    ) : (
                      <span>Ready for live propagation</span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {editingPostId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPostId(null);
                          setBlogTitle('');
                          setBlogExcerpt('');
                          setBlogContent('');
                          setBlogCategory('Reviews');
                          setBlogImage('');
                          setBlogVideoUrl('');
                          setBlogFormActiveTab('write');
                        }}
                        className="px-4 py-2 bg-zinc-800 text-zinc-200 border border-white/5 hover:bg-zinc-700/80 font-bold uppercase tracking-widest text-[10px] rounded-lg transition-colors"
                      >
                        Cancel Editing
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={submittingBlog}
                      className="btn-primary py-2.5 px-6 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                      {submittingBlog ? (
                        <span>Syncing Feed...</span>
                      ) : (
                        <>
                          <Sparkles size={14} className="text-black" />
                          <span>{editingPostId ? 'Update live feed' : 'Publish to live feed'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Bottom Hand: Interactive Articles Registry List */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <FileText size={15} className="text-brand-primary" />
                  Live Article Listings ({blogPosts.length})
                </h3>
              </div>

              {loadingBlog ? (
                <div className="text-xs text-text-dim text-center py-10">Syncing live articles library...</div>
              ) : blogPosts.length === 0 ? (
                <div className="text-xs text-text-dim text-center py-10 font-bold">No articles found. Add some using the compose panel!</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {blogPosts.map((post) => (
                    <div 
                      key={post.id}
                      className="bg-zinc-950/60 border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-white/10 transition-all group lg:min-h-[220px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black uppercase text-brand-primary bg-brand-primary/10 border border-brand-primary/15 px-2 py-0.5 rounded truncate max-w-[130px]">
                            {post.category}
                          </span>
                          <span className="text-[10px] font-mono text-text-dim">{post.date}</span>
                        </div>
                        <h4 className="font-bold text-sm text-white line-clamp-2 mb-1.5 group-hover:text-brand-primary transition-colors">{post.title}</h4>
                        <p className="text-xs text-text-dim line-clamp-3 leading-relaxed mb-4">{post.excerpt}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                        <span className="text-[10px] font-semibold text-text-dim truncate max-w-[100px]">By: {post.author}</span>
                        <div className="flex items-center gap-3 font-bold uppercase text-[10px]">
                          <button
                            onClick={() => handleEditBlogClick(post)}
                            className="text-[10px] uppercase font-bold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <Edit3 size={11} />
                            Edit
                          </button>
                          <span className="text-zinc-800">|</span>
                          <button
                            onClick={() => handleDeleteBlog(post.id)}
                            className="text-[10px] uppercase font-bold text-red-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 size={11} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
