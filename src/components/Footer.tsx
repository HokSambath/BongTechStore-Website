import { Facebook, Send, Phone, MapPin, Globe, Mail } from 'lucide-react';
import { BUSINESS_DETAILS } from '../constants';

import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="h-12 bg-black flex items-center justify-between px-4 sm:px-10 border-t border-border text-[11px] text-text-dim">
      <div className="flex gap-6 overflow-x-auto whitespace-nowrap">
        <span>📍 Phnom Penh, Cambodia</span>
        <span>📞 070 697 169 / 070 555882</span>
        <span>FB: <b className="text-white">bongtechstore</b></span>
      </div>
      <div className="hidden sm:block uppercase tracking-widest font-bold">
        © 2024 BONG TECH STORE • {t('footer.performance')}
      </div>
    </footer>
  );
}
