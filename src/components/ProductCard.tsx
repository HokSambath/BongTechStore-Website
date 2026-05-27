import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useAuthOrder } from '../contexts/AuthOrderContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useAuthOrder();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1, product.colors[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group glass-card overflow-hidden !p-0 flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-[16/10] overflow-hidden bg-black flex items-center justify-center p-6 border-b border-border">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          
          {/* Floating Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="px-2 py-0.5 bg-brand-primary text-bg-dark text-[10px] font-black uppercase rounded shadow-accent">New</span>
            )}
          </div>
          
          <div className="absolute top-3 right-3">
            <div className="text-brand-primary font-bold text-sm bg-bg-dark/60 backdrop-blur-sm px-2 rounded">{product.price}</div>
          </div>
        </div>

        <div className="p-5 flex flex-col">
          <h3 className="text-sm font-bold mb-4 group-hover:text-brand-primary transition-colors flex justify-between items-start gap-2 h-10 overflow-hidden line-clamp-2">
            {product.name}
          </h3>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
            {Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">{key}</span>
                <span className="text-[11px] text-text-dim truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 mt-auto flex items-center justify-between">
        <div className="flex gap-1.5">
          {product.colors.map((color) => (
            <div 
              key={color} 
              className="w-3 h-3 rounded-full border border-white/10"
              style={{ backgroundColor: color.toLowerCase().includes('white') ? '#fff' : color.toLowerCase() }}
              title={color}
            />
          ))}
        </div>
        <button 
          onClick={handleAddToCart}
          className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded transition-all ${
            added 
              ? 'bg-green-500 text-black' 
              : 'bg-brand-primary text-bg-dark hover:bg-white hover:text-black shadow-accent'
          }`}
        >
          <ShoppingCart size={14} />
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
}
