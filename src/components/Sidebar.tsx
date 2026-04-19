import { NavLink } from 'react-router-dom';
import { Home, Package, BookOpen, Info, Facebook, MessageCircle, Youtube, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BUSINESS_DETAILS } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-64px)] fixed left-0 top-16 bg-bg-dark border-r border-border overflow-y-auto custom-scrollbar pt-8 pb-10 px-4">
      {/* Navigation section */}
      <div className="space-y-1 mb-10">
        <div className="flex items-center justify-between px-3 mb-4">
          <h3 className="text-[10px] font-black tracking-[2px] uppercase text-text-dim flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(182,254,0,0.5)]" />
            LIVE STORE
          </h3>
          <span className="text-[9px] font-mono text-brand-primary/60">v4.1.0</span>
        </div>
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all group",
                isActive 
                  ? "bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary" 
                  : "text-text-dim hover:text-white hover:bg-white/5"
              )
            }
          >
            <link.icon size={18} className={cn("transition-transform group-hover:scale-110")} />
            {t(link.name)}
          </NavLink>
        ))}
      </div>

      {/* Social section */}
      <div className="space-y-1 mb-10">
        <h3 className="text-[10px] font-black tracking-[2px] uppercase text-text-dim px-3 mb-4">Official Channels</h3>
        <div className="grid grid-cols-3 gap-2 px-1">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center h-10 rounded border border-border bg-bg-card hover:bg-brand-primary/20 hover:border-brand-primary transition-all group"
              title={social.name}
            >
              <social.icon size={18} className="text-text-dim group-hover:text-brand-primary" />
            </a>
          ))}
        </div>
      </div>

      {/* Contact info shortcut */}
      <div className="mt-auto pt-6 border-t border-border space-y-4 px-3">
        <div className="flex items-start gap-3">
          <Phone size={14} className="text-brand-primary mt-1 shrink-0" />
          <div className="text-[11px] font-bold text-text-dim leading-tight">
            {BUSINESS_DETAILS.phone.join(' / ')}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin size={14} className="text-brand-primary mt-1 shrink-0" />
          <div className="text-[11px] font-bold text-text-dim leading-tight">
            Phnom Penh, Cambodia
          </div>
        </div>
      </div>

      {/* Logo small version at bottom */}
      <div className="mt-10 flex items-center justify-center opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
        <div className="w-6 h-6 rounded overflow-hidden">
          <img src={BUSINESS_DETAILS.logo} alt="Bong Tech" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </div>
    </aside>
  );
}
