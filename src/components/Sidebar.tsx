import { NavLink } from 'react-router-dom';
import { 
  Home, Package, BookOpen, Info, Facebook, MessageCircle, 
  Youtube, Phone, MapPin, ShoppingCart, ClipboardList, ShieldCheck, Key, User 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BUSINESS_DETAILS } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthOrder } from '../contexts/AuthOrderContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const sidebarLinks = [
  { name: 'nav.home', path: '/', icon: Home },
  { name: 'nav.product', path: '/product', icon: Package },
  { name: 'nav.blog', path: '/blog', icon: BookOpen },
  { name: 'nav.about', path: '/about', icon: Info },
];

const socialLinks = [
  { name: 'Facebook', url: BUSINESS_DETAILS.facebook, icon: Facebook },
  { name: 'Telegram', url: BUSINESS_DETAILS.telegram, icon: MessageCircle },
  { name: 'YouTube', url: 'https://www.youtube.com/@BWinTech', icon: Youtube },
];

export default function Sidebar() {
  const { t } = useLanguage();
  const { cart, currentUser } = useAuthOrder();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-64px)] fixed left-0 top-16 bg-bg-dark border-r border-border overflow-y-auto custom-scrollbar pt-8 pb-10 px-4 justify-between">
      <div>
        {/* Navigation section */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center justify-between px-3 mb-4">
            <h3 className="text-[10px] font-black tracking-[2px] uppercase text-text-dim flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(182,254,0,0.5)]" />
              LIVE STORE
            </h3>
            <span className="text-[9px] font-mono text-brand-primary/60">v4.1.0</span>
          </div>

          {/* Standard Navigation links */}
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all group",
                  isActive 
                    ? "bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary" 
                    : "text-text-dim hover:text-white hover:bg-white/5"
                )
              }
            >
              <link.icon size={16} className={cn("transition-transform group-hover:scale-110")} />
              {t(link.name)}
            </NavLink>
          ))}

          {/* Shopping Cart Sidebar Link */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all group",
                isActive 
                  ? "bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary" 
                  : "text-text-dim hover:text-white hover:bg-white/5"
              )
            }
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={16} className="transition-transform group-hover:scale-110 text-brand-primary" />
              <span>Checkout Cart</span>
            </div>
            {cartCount > 0 && (
              <span className="bg-brand-primary text-bg-dark px-1.5 py-0.5 rounded text-[10px] font-black font-mono shadow-accent">
                {cartCount}
              </span>
            )}
          </NavLink>

          {/* Personal Profile dashboard link for logged-in users */}
          {currentUser && (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all group",
                  isActive 
                    ? "bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary" 
                    : "text-text-dim hover:text-white hover:bg-white/5"
                )
              }
            >
              <User size={16} className="transition-transform group-hover:scale-110 text-brand-primary" />
              <span>My Profile</span>
            </NavLink>
          )}

          {/* Personal order tracker link for logged-in customers */}
          {currentUser && currentUser.role === 'customer' && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all group",
                  isActive 
                    ? "bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary" 
                    : "text-text-dim hover:text-white hover:bg-white/5"
                )
              }
            >
              <ClipboardList size={16} className="transition-transform group-hover:scale-110" />
              <span>My Orders</span>
            </NavLink>
          )}

          {/* Security Order Dashboard route for staff */}
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all group text-brand-primary border border-brand-primary/20",
                  isActive 
                    ? "bg-brand-primary/20 text-white" 
                    : "bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary"
                )
              }
            >
              <ShieldCheck size={16} className="transition-transform group-hover:scale-110" />
              <span>Order Dashboard</span>
            </NavLink>
          )}
        </div>

        {/* Customer Access / Staff portal */}
        {!currentUser && (
          <div className="space-y-4 px-3 mb-6">
            <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-850 text-center">
              <p className="text-[10px] font-black text-white mb-2.5 uppercase tracking-widest text-gradient">New customer?</p>
              <NavLink
                to="/login?signup=true"
                className="btn-primary w-full flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-black uppercase tracking-wider mb-2.5"
              >
                <User size={13} />
                Create Account
              </NavLink>
              <div className="text-[9px] text-text-dim">
                Already registered? <NavLink to="/login" className="text-brand-primary underline hover:text-white transition-colors">Sign In</NavLink>
              </div>
            </div>

            <NavLink 
              to="/admin/signin" 
              className="w-full flex items-center gap-2 justify-center py-2 border border-zinc-800 rounded text-[10px] text-zinc-500 hover:text-brand-primary hover:border-brand-primary font-black uppercase tracking-widest transition-all"
            >
              <Key size={12} />
              Staff Login Portal
            </NavLink>
          </div>
        )}

        {/* Social section */}
        <div className="space-y-1 mb-6">
          <h3 className="text-[10px] font-black tracking-[2px] uppercase text-text-dim px-3 mb-3">Official Channels</h3>
          <div className="grid grid-cols-3 gap-2 px-1">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center h-8 rounded border border-border bg-bg-card hover:bg-brand-primary/20 hover:border-brand-primary transition-all group"
                title={social.name}
              >
                <social.icon size={16} className="text-text-dim group-hover:text-brand-primary" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div>
        {/* Contact info shortcut */}
        <div className="pt-6 border-t border-border space-y-3 px-3">
          <div className="flex items-start gap-3">
            <Phone size={12} className="text-brand-primary mt-1 shrink-0" />
            <div className="text-[10px] font-bold text-text-dim leading-tight">
              {BUSINESS_DETAILS.phone.join(' / ')}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={12} className="text-brand-primary mt-1 shrink-0" />
            <div className="text-[10px] font-bold text-text-dim leading-tight">
              Phnom Penh, Cambodia
            </div>
          </div>
        </div>

        {/* Logo small version at bottom */}
        <div className="mt-6 flex items-center justify-center opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
          <div className="w-5 h-5 rounded overflow-hidden">
            <img src={BUSINESS_DETAILS.logo} alt="Bong Tech" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    </aside>
  );
}
