import ProductCard from './ProductCard';
import { PRODUCTS } from '../constants';
import { Product } from '../types';

interface ProductGridProps {
  title: string;
  subtitle?: string;
  category?: Product['category'];
  featuredOnly?: boolean;
  limit?: number;
}

import { useLanguage } from '../contexts/LanguageContext';

export default function ProductGrid({ title, subtitle, category, featuredOnly, limit }: ProductGridProps) {
  const { t } = useLanguage();
  let filteredProducts = PRODUCTS;
  
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
