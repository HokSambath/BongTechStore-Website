import React from 'react';
import { useAuthOrder } from '../contexts/AuthOrderContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ClipboardList, Send } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, placeOrder, currentUser } = useAuthOrder();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const priceVal = parseFloat(item.product.price.replace('$', ''));
      return total + (priceVal * item.quantity);
    }, 0);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login?redirect=cart');
      return;
    }
    if (cart.length === 0) return;
    if (!name || !phone || !address) {
      setSubmitError('Please fill in your name, phone, and delivery address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      // We append address during checkout in order fields or custom details
      await placeOrder(name, `${phone} | Address: ${address}`);
      setIsSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-20 min-h-screen section-container flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-lg p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse" />
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <ShoppingBag size={30} />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gradient">Order Placed Successfully!</h2>
          <p className="text-text-dim mb-6">
            Thank you for shopping at Bong Tech Store. Our team will review your order shortly and contact you at <strong className="text-white">{phone}</strong> to confirm delivery in Phnom Penh.
          </p>

          {/* Telegram Immediate Follow-up Action */}
          <div className="mb-8 p-4 bg-[#0088cc]/10 border border-[#0088cc]/25 rounded-xl text-center">
            <p className="text-xs text-[#0088cc] font-black uppercase tracking-wider mb-2">⚡ Speed Up Confirmation</p>
            <p className="text-[11px] text-text-dim mb-4 leading-relaxed">
              Have questions or want to confirm your order immediately? Chat with our staff directly on Telegram now!
            </p>
            <a 
              href="https://t.me/hoksambath"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-[1.02] text-xs uppercase tracking-widest cursor-pointer shadow-md"
            >
              <Send size={14} className="animate-bounce" />
              Chat on Telegram
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/orders')}
              className="btn-primary flex items-center gap-2 justify-center py-2.5 text-xs font-bold uppercase tracking-wide"
            >
              <ClipboardList size={14} />
              View My Orders
            </button>
            <button 
              onClick={() => navigate('/product')}
              className="btn-outline justify-center py-2.5 text-xs font-bold uppercase tracking-wide"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen section-container">
      <h1 className="text-3xl font-black mb-8 text-gradient uppercase tracking-tight flex items-center gap-3">
        <ShoppingBag size={28} className="text-brand-primary" />
        Shopping Cart
      </h1>

      {cart.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-zinc-900 text-text-dim rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
            <ShoppingBag size={24} />
          </div>
          <h2 className="text-xl font-bold mb-2">Your Cart is Empty</h2>
          <p className="text-text-dim mb-6">Explore our curated selection of high-performance controllers and gaming gear to level up your game.</p>
          <button 
            onClick={() => navigate('/product')}
            className="btn-primary"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div 
                key={`${item.product.id}-${item.color}`}
                className="glass-card flex flex-col sm:flex-row items-center gap-4 p-4 justify-between relative overflow-hidden"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 bg-black rounded border border-border p-2 flex items-center justify-center shrink-0">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white hover:text-brand-primary transition-colors pr-4">
                      {item.product.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-dim">
                      <span>Price: <strong className="text-brand-primary">{item.product.price}</strong></span>
                      {item.color && (
                        <span className="flex items-center gap-1">
                          Color: 
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block border border-white/20"
                            style={{ backgroundColor: item.color.toLowerCase() }}
                          />
                          {item.color}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                  <div className="flex items-center bg-bg-card rounded border border-border p-1">
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.color)}
                      className="p-1 hover:text-brand-primary transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-xs font-bold text-white min-w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.color)}
                      className="p-1 hover:text-brand-primary transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-white">
                      ${(parseFloat(item.product.price.replace('$', '')) * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.product.id, item.color)}
                    className="p-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Side Form */}
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary" />
            <h2 className="text-lg font-bold mb-6 border-b border-border pb-3 uppercase tracking-wider text-brand-primary">Order Summary</h2>
            
            <div className="space-y-3 text-sm text-text-dim mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping (Phnom Penh)</span>
                <span className="text-green-400 font-bold">FREE</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-white">
                <span>Total Amount</span>
                <span className="text-brand-primary">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery Details Form */}
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-white mt-6">Delivery Details</h3>
              
              {!currentUser && (
                <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 rounded text-xs text-brand-primary leading-relaxed mb-2">
                  You are browsing as Guest. You must <Link to="/login?redirect=cart" className="underline font-bold">Sign In or Create Account</Link> to submit your order to our staff team.
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1">Customer Name *</label>
                <input 
                  type="text" 
                  required
                  disabled={!currentUser}
                  placeholder="Enter full name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-card border border-border rounded p-2.5 text-xs text-white focus:border-brand-primary outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1">Phone Number *</label>
                <input 
                  type="tel" 
                  required
                  disabled={!currentUser}
                  placeholder="e.g. 0767676887" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-bg-card border border-border rounded p-2.5 text-xs text-white focus:border-brand-primary outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1">Delivery Address *</label>
                <textarea 
                  required
                  disabled={!currentUser}
                  rows={3}
                  placeholder="Street, District, Phnom Penh, Cambodia" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-bg-card border border-border rounded p-2.5 text-xs text-white focus:border-brand-primary outline-none resize-none disabled:opacity-50"
                />
              </div>

              {submitError && (
                <div className="text-xs text-red-400 font-bold bg-red-400/10 border border-red-400/20 rounded p-2.5">
                  {submitError}
                </div>
              )}

              {currentUser ? (
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center gap-2 mt-6 py-3 font-bold uppercase tracking-wider"
                >
                  {isSubmitting ? 'Submitting Order...' : 'Submit to Buy'}
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => navigate('/login?redirect=cart')}
                  className="w-full btn-primary flex items-center justify-center gap-2 mt-6 py-3 font-bold uppercase tracking-wider"
                >
                  Login to Order
                  <ArrowRight size={14} />
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
