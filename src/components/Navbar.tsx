import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BUSINESS_DETAILS } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const navLinks = [
  { name: 'nav.home', path: '/' },
  { name: 'nav.accessories', path: '/product' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

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

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
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
            <button className="p-2 text-zinc-400 hover:text-white transition-colors">
              <Search size={18} />
            </button>
            <a 
              href="https://m.me/620274331175123" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 text-zinc-400 hover:text-white transition-colors relative"
            >
              <ShoppingCart size={18} />
              <span className="absolute top-0 right-0 w-4 h-4 bg-brand-primary text-[10px] flex items-center justify-center rounded-full text-bg-dark font-bold">
                0
              </span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
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
              <div className="flex items-center gap-4 px-3 py-4 border-t border-border mt-2">
                <button className="flex items-center gap-2 text-zinc-400 hover:text-white">
                  <Search size={20} />
                  <span>{t('search.placeholder')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
