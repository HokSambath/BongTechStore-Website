import { motion } from 'motion/react';
import React from 'react';
import { Calendar, User, ArrowRight, Video, FileText } from 'lucide-react';
import { useAuthOrder } from '../contexts/AuthOrderContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function BlogSection() {
  const { t } = useLanguage();
  const { blogPosts, loadingBlog } = useAuthOrder();

  return (
    <div className="glass-card flex flex-col h-full bg-white/[0.02]">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <h2 className="text-sm font-black uppercase tracking-[2px] text-brand-primary">{t('blog.title')}</h2>
        <span className="text-brand-primary">➔</span>
      </div>

      <div className="flex flex-col gap-6">
        {loadingBlog ? (
          <div className="text-xs text-text-dim text-center py-6">Loading articles...</div>
        ) : blogPosts.length === 0 ? (
          <div className="text-xs text-text-dim text-center py-6">No blog articles found.</div>
        ) : (
          blogPosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col pb-6 border-b border-border last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/15">{post.category}</span>
                {post.videoUrl && (
                  <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Video size={10} />
                    Video
                  </span>
                )}
              </div>
              
              {post.image && !post.videoUrl && (
                <div className="mb-3 rounded-lg overflow-hidden border border-border/60 aspect-video relative">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                </div>
              )}

              {post.videoUrl && (
                <div className="relative aspect-video mb-3 rounded-lg overflow-hidden border border-border">
                  <iframe
                    src={post.videoUrl}
                    title={post.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <h3 className="text-sm font-bold mb-1.5 leading-snug group-hover:text-brand-primary transition-colors text-white">
                {post.title}
              </h3>
              
              <p className="text-xs text-text-dim mb-2 line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between text-[11px] text-text-dim pt-2 border-t border-white/5">
                <span className="flex items-center gap-1 font-semibold"><User size={10} /> {post.author}</span>
                <span className="font-mono">{post.date}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
