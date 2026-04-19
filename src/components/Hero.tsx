import { motion } from 'motion/react';
import { ArrowRight, Zap } from 'lucide-react';
import { BUSINESS_DETAILS } from '../constants';

import { useLanguage } from '../contexts/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[400px] lg:h-[480px] flex items-center overflow-hidden pt-16 border-b border-border bg-gradient-to-br from-[#12141a] to-[#252a36]">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/5 blur-[128px] rounded-full" />
      </div>

      <div className="section-container grid lg:grid-cols-2 gap-12 items-center relative">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="z-10"
        >
          <div className="inline-block px-3 py-1 bg-brand-primary text-bg-dark text-[10px] font-black uppercase rounded mb-4">
            {t('hero.promo')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1] text-gradient">
            {t('hero.title')}
          </h1>
          <p className="text-lg text-text-dim mb-8 max-w-xl leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="https://m.me/620274331175123" target="_blank" rel="noreferrer" className="btn-primary">
              {t('hero.shop_now')}
            </a>
            <a href="https://t.me/bongtechstore" target="_blank" rel="noreferrer" className="btn-outline">
              {t('hero.view_offers')}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:flex justify-center items-center h-full"
        >
          <div className="absolute w-[450px] h-[300px] bg-brand-primary/10 blur-[80px] rounded-full" />
          <div className="relative w-full h-[320px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.4)] group">
            <img 
              src="https://m.media-amazon.com/images/I/61YRs2JtTjL.jpg" 
              alt="Bong Tech Featured" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-white/10 backdrop-blur-md p-1.5 border border-white/20">
                <img src={BUSINESS_DETAILS.logo} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/50">{t('hero.hardware')}</div>
                <div className="text-sm font-bold text-white uppercase">{BUSINESS_DETAILS.name}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
