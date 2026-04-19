import { BrowserRouter as Router, Routes, Route, useLocation, NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import BlogSection from './components/BlogSection';
import Footer from './components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './contexts/LanguageContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Marquee() {
  return (
    <div className="bg-brand-primary py-3 overflow-hidden border-y border-white/10">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 mx-4">
            <span className="text-sm font-bold uppercase tracking-tighter text-black">🔥 Summer Deals in Phnom Penh</span>
            <span className="text-sm font-bold uppercase tracking-tighter text-black">⭐ New IINE Controllers In Stock</span>
            <span className="text-sm font-bold uppercase tracking-tighter text-black">🚚 Free Delivery in Phnom Penh</span>
            <span className="text-sm font-bold uppercase tracking-tighter text-black">💻 Build Your Dream PC Today</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero />
      <Marquee />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-10 py-10 grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-8">
        <div className="lg:col-span-2 flex flex-col gap-12">
          <ProductGrid 
            title="grid.featured" 
            subtitle="grid.featured_sub"
            featuredOnly
          />
          <ProductGrid 
            title="grid.accessories" 
            subtitle="grid.accessories_sub"
            category="Product"
          />
        </div>
        
        <aside className="lg:sticky lg:top-24 h-fit">
          <BlogSection />
        </aside>
      </main>

      {/* Contact Highlights */}
      <section className="section-container border-t border-border mt-10">
        <div className="glass-card flex flex-col items-center text-center py-16 px-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary shadow-accent" />
          <h2 className="text-4xl font-bold mb-6 text-gradient">{t('cta.title')}</h2>
          <p className="text-text-dim max-w-2xl mb-10 text-lg">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://m.me/620274331175123" target="_blank" rel="noreferrer" className="btn-primary">
              {t('cta.visit')}
            </a>
            <a href="https://t.me/bongtechstore" target="_blank" rel="noreferrer" className="btn-outline">
              {t('cta.telegram')}
            </a>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function CategoryPage({ title, category, subtitle }: { title: string, category: any, subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 min-h-screen"
    >
      <ProductGrid 
        title={title}
        category={category}
        subtitle={subtitle}
      />
    </motion.div>
  );
}

import { LanguageProvider } from './contexts/LanguageContext';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <SpeedInsights />
        <ScrollToTop />
        <div className="min-h-screen flex flex-col Selection:bg-brand-primary Selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product" element={<CategoryPage title="nav.accessories" subtitle="grid.accessories_sub" category="Product" />} />
                <Route path="/blog" element={<div className="pt-32"><BlogSection /></div>} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}
