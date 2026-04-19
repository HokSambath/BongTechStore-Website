import { motion } from 'motion/react';
import { ArrowRight, Zap } from 'lucide-react';

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
            <button className="btn-outline">
              {t('hero.view_offers')}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:flex justify-center items-center"
        >
          <div className="absolute w-[400px] h-[280px] bg-brand-primary/20 blur-[60px] rounded-full" />
          <div className="relative w-[300px] h-[180px] bg-bg-card border-2 border-brand-primary rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-6 gap-4">
            <div className="w-16 h-16 opacity-80 group-hover:scale-110 transition-transform">
              <img src="input_file_0.png" alt="Bong Tech" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="text-[12px] font-mono font-bold text-brand-primary tracking-widest uppercase">{t('hero.hardware')}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
