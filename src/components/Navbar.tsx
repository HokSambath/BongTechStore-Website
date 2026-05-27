import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, UserPlus, LogOut, ShieldCheck, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BUSINESS_DETAILS } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuthOrder } from '../contexts/AuthOrderContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navLinks = [
  { name: 'nav.home', path: '/' },
  { name: 'nav.product', path: '/product' },
  { name: 'nav.blog', path: '/blog' },
  { name: 'nav.about', path: '/about' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { cart, currentUser, logOutUser } = useAuthOrder();
  const navigate = useNavigate();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogOut = async () => {
    await logOutUser();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-bg-dark/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-bg-card flex items-center justify-center overflow-hidden border border-border shadow-accent transition-transform hover:scale-110">
                <img 
                  src={BUSINESS_DETAILS.logo} 
                  alt="Bong Tech Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-display font-bold text-lg tracking-wider uppercase whitespace-nowrap">
                Bong Tech Store
              </span>
            </NavLink>
          </div>

          {/* Desktop Nav - Hidden on very large screens where sidebar is active */}
          <div className="hidden md:flex lg:hidden items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "text-[13px] font-bold uppercase tracking-[1px] transition-colors hover:text-brand-primary",
                    isActive ? "text-brand-primary" : "text-text-dim"
                  )
                }
              >
                {t(link.name)}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center bg-bg-card rounded-lg border border-border p-1">
              <button 
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-2 py-1 text-[10px] font-bold rounded transition-all",
                  language === 'en' ? "bg-brand-primary text-bg-dark" : "text-text-dim hover:text-white"
                )}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('km')}
                className={cn(
                  "px-2 py-1 text-[10px] font-bold rounded transition-all",
                  language === 'km' ? "bg-brand-primary text-bg-dark" : "text-text-dim hover:text-white"
                )}
              >
                KM
              </button>
            </div>

            {/* Shopping Cart Link */}
            <NavLink 
              to="/cart" 
              className={({ isActive }) => cn(
                "p-2 hover:text-white transition-colors relative",
                isActive ? "text-brand-primary" : "text-zinc-400"
              )}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-brand-primary text-[10px] flex items-center justify-center rounded-full text-bg-dark font-black shadow-[0_0_8px_rgba(182,254,0,0.4)]">
                  {cartCount}
                </span>
              )}
            </NavLink>

            {/* Dynamic Profile/Sign-In Actions */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                {currentUser.role === 'customer' ? (
                  <NavLink 
                    to="/orders" 
                    className={({ isActive }) => cn(
                      "p-2 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider",
                      isActive ? "text-brand-primary" : "text-zinc-400"
                    )}
                    title="My Orders"
                  >
                    <ClipboardList size={16} />
                    <span className="hidden xl:inline">Orders</span>
                  </NavLink>
                ) : (
                  <NavLink 
                    to="/admin" 
                    className={({ isActive }) => cn(
                      "p-2 text-brand-primary hover:text-white transition-colors flex items-center gap-1.5 text-xs font-black uppercase tracking-wider",
                      isActive ? "text-white" : ""
                    )}
                    title="Admin Dashboard"
                  >
                    <ShieldCheck size={16} />
                    <span className="hidden xl:inline">Admin</span>
                  </NavLink>
                )}

                <NavLink 
                  to="/profile"
                  className={({ isActive }) => cn(
                    "flex items-center gap-1.5 p-1.5 rounded-lg border border-transparent hover:border-zinc-800 hover:bg-zinc-900/50 transition-all",
                    isActive ? "border-brand-primary/20 bg-brand-primary/5 text-brand-primary" : "text-zinc-400 hover:text-white"
                  )}
                  title="My Profile Dashboard"
                >
                  <User size={15} />
                  <div className="text-left hidden sm:block">
                    <div className="text-[10px] font-black leading-none">{currentUser.name}</div>
                    <span className="text-[8px] uppercase tracking-widest text-text-dim block mt-0.5">{currentUser.role}</span>
                  </div>
                </NavLink>

                <button 
                  onClick={handleLogOut}
                  className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink 
                  to="/login"
                  className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  Sign In
                </NavLink>
                <NavLink 
                  to="/login?signup=true"
                  className="btn-primary flex items-center gap-1.5 py-1.5 px-3 text-[11px] font-black uppercase tracking-wider"
                >
                  <UserPlus size={13} />
                  Create Account
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <div className="flex items-center bg-bg-card rounded-lg border border-border p-1">
              <button 
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-2 py-1 text-[10px] font-bold rounded transition-all",
                  language === 'en' ? "bg-brand-primary text-bg-dark" : "text-text-dim"
                )}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('km')}
                className={cn(
                  "px-2 py-1 text-[10px] font-bold rounded transition-all",
                  language === 'km' ? "bg-brand-primary text-bg-dark" : "text-text-dim"
                )}
              >
                KM
              </button>
            </div>

            {/* Shopping Cart Link */}
            <NavLink 
              to="/cart" 
              className="p-2 text-zinc-400 relative"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-brand-primary text-[10px] flex items-center justify-center rounded-full text-bg-dark font-black">
                  {cartCount}
                </span>
              )}
            </NavLink>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-card border-b border-border shadow-2xl"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                      isActive ? "bg-zinc-900 text-brand-primary" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    )
                  }
                >
                  {t(link.name)}
                </NavLink>
              ))}

              {/* Dynamic Profiles inside Mobile Menu */}
              {currentUser ? (
                <>
                  <NavLink
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-brand-primary font-bold transition-colors"
                  >
                    My Profile ({currentUser.name})
                  </NavLink>
                  {currentUser.role === 'customer' ? (
                    <NavLink
                      to="/orders"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      My Purchase Orders
                    </NavLink>
                  ) : (
                    <NavLink
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-brand-primary font-bold transition-colors"
                    >
                      Security Admin Dashboard
                    </NavLink>
                  )}
                  <button
                    onClick={handleLogOut}
                    className="w-full text-left block px-3 py-2 text-red-400 font-bold"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="py-2 px-3 space-y-2 border-t border-border mt-2">
                  <NavLink
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-zinc-400 hover:text-white font-bold text-sm transition-colors uppercase tracking-wider"
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/login?signup=true"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-brand-primary font-black text-sm transition-colors uppercase tracking-wider"
                  >
                    <UserPlus size={14} />
                    Create Account
                  </NavLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
