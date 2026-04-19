import { motion } from 'motion/react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '../constants';

import { useLanguage } from '../contexts/LanguageContext';

export default function BlogSection() {
  const { t } = useLanguage();

  return (
    <div className="glass-card flex flex-col h-full bg-white/[0.02]">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <h2 className="text-sm font-black uppercase tracking-[2px] text-brand-primary">{t('blog.title')}</h2>
        <span className="text-brand-primary">➔</span>
      </div>

      <div className="flex flex-col gap-6">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.id}
            className="group flex flex-col pb-6 border-b border-border last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{post.category}</span>
            </div>
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
            <h3 className="text-sm font-bold mb-1.5 leading-snug group-hover:text-brand-primary transition-colors">
              {post.title}
            </h3>
            <div className="text-[11px] text-text-dim">
              {t('blog.published')} {post.date.includes('April 15') ? `2 ${t('blog.days_ago')}` : (post.date.includes('April 10') ? `5 ${t('blog.days_ago')}` : t('blog.recently'))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
