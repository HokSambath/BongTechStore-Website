import ProductCard from './ProductCard';
import { Product } from '../types';
import { useAuthOrder } from '../contexts/AuthOrderContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ProductGridProps {
  title: string;
  subtitle?: string;
  category?: Product['category'];
  featuredOnly?: boolean;
  limit?: number;
}

export default function ProductGrid({ title, subtitle, category, featuredOnly, limit }: ProductGridProps) {
  const { t } = useLanguage();
  const { products, loadingProducts } = useAuthOrder();
  
  let filteredProducts = products;
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (featuredOnly) {
    filteredProducts = filteredProducts.filter(p => p.isFeatured);
  }

  if (limit) {
    filteredProducts = filteredProducts.slice(0, limit);
  }

  return (
    <div className="section-container">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1 uppercase tracking-tight">{t(title)}</h2>
          {subtitle && <p className="text-text-dim text-sm max-w-xl">{t(subtitle)}</p>}
        </div>
        <button className="text-brand-primary font-bold text-xs uppercase tracking-widest hover:underline">
          {t('grid.view_all')}
        </button>
      </div>

      {loadingProducts && filteredProducts.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card animate-pulse overflow-hidden !p-0 flex flex-col justify-between h-[450px] border border-white/5 bg-bg-card/30">
              <div>
                <div className="relative aspect-square bg-zinc-900 border-b border-border/50" />
                <div className="p-6 flex flex-col gap-4">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <div className="h-1.5 bg-zinc-800 rounded w-1/2" />
                      <div className="h-2.5 bg-zinc-800/80 rounded w-3/4" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 bg-zinc-800 rounded w-1/2" />
                      <div className="h-2.5 bg-zinc-800/80 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 flex justify-between items-center pb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                </div>
                <div className="h-8 bg-zinc-800 rounded-lg w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-xs font-mono">
          No items found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
