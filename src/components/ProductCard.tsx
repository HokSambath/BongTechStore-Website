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
      className="group glass-card overflow-hidden !p-0 flex flex-col justify-between hover:scale-[1.02] duration-300"
    >
      <div>
        <div className="relative aspect-square overflow-hidden bg-black flex items-center justify-center p-8 border-b border-border">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transform group-hover:scale-106 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          
          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <span className="px-2.5 py-1 bg-white text-black text-[10px] font-black uppercase rounded tracking-wider shadow-lg">New</span>
            )}
          </div>
          
          <div className="absolute top-4 right-4">
            <div className="text-white font-black text-base bg-zinc-900/90 border border-white/10 backdrop-blur-md px-3 py-1 rounded-lg">
              {product.price}
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col">
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-zinc-300 transition-colors flex justify-between items-start gap-2 h-12 overflow-hidden line-clamp-2 leading-snug">
            {product.name}
          </h3>
          
          <div className="text-xs text-brand-primary font-semibold mb-4 tracking-wide bg-white/5 py-1 px-2.5 rounded-full w-fit">
            {product.price}
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 mb-2 mt-1">
            {Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">{key}</span>
                <span className="text-xs text-white/90 truncate font-medium mt-0.5">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 mt-auto flex items-center justify-between">
        <div className="flex gap-1.5">
          {product.colors.map((color) => (
            <div 
              key={color} 
              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
              style={{ backgroundColor: color.toLowerCase().includes('white') ? '#fff' : color.toLowerCase() }}
              title={color}
            />
          ))}
        </div>
        <button 
          onClick={handleAddToCart}
          className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all active:scale-95 ${
            added 
              ? 'bg-green-500 text-black' 
              : 'bg-white text-black hover:bg-zinc-200'
          }`}
        >
          <ShoppingCart size={14} />
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
}
