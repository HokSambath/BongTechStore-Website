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
        <div className="text-center py-12 text-zinc-500 text-xs font-mono">
          Loading premium catalog...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-xs font-mono">
          No items found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
