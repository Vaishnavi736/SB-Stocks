import React from 'react';
import GlassCard from './GlassCard';
import { Newspaper } from 'lucide-react';

const NewsFeed = ({ news = [], loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-surface-raised border border-border-subtle rounded-3xl p-6 h-32 flex gap-4">
            <div className="w-24 h-20 animate-shimmer rounded-2xl"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 animate-shimmer rounded w-3/4"></div>
              <div className="h-3 animate-shimmer rounded w-1/2"></div>
              <div className="h-3 animate-shimmer rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <GlassCard className="text-center py-10" hover={false}>
        <Newspaper className="w-10 h-10 mx-auto text-text-muted mb-3" />
        <p className="text-text-secondary text-sm font-medium">No recent news available for this ticker.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((item) => (
        <a 
          key={item.id} 
          href={item.url === '#' ? undefined : item.url} 
          target={item.url === '#' ? undefined : '_blank'} 
          rel="noopener noreferrer"
          className="block group"
        >
          <GlassCard className="flex flex-col sm:flex-row gap-5 p-5" hover={true}>
            {/* News Image */}
            {item.image && (
              <div className="w-full sm:w-28 h-36 sm:h-20 shrink-0 rounded-2xl overflow-hidden bg-surface-sunken border border-border-subtle">
                <img
                  src={item.image}
                  alt={item.headline}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* News Text */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xxs font-bold text-text-muted uppercase tracking-widest">
                  <span className="text-brand-500">{item.source}</span>
                  <span>•</span>
                  <span>{new Date(item.datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                <h4 className="text-sm font-bold text-text-primary mt-1.5 leading-snug group-hover:text-brand-500 transition-colors line-clamp-2">
                  {item.headline}
                </h4>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2 font-medium">
                  {item.summary}
                </p>
              </div>
            </div>
          </GlassCard>
        </a>
      ))}
    </div>
  );
};

export default NewsFeed;
