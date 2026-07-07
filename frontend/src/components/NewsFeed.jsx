import React from 'react';
import GlassCard from './GlassCard';
import { Newspaper } from 'lucide-react';

const NewsFeed = ({ news = [], loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="animate-pulse bg-slate-900 border border-slate-800 rounded-3xl p-6 h-32 flex gap-4">
            <div className="w-24 h-20 bg-slate-800 rounded-2xl"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              <div className="h-3 bg-slate-800 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <GlassCard className="text-center py-10" hover={false}>
        <Newspaper className="w-10 h-10 mx-auto text-slate-600 mb-3" />
        <p className="text-slate-400 text-sm font-medium">No recent news available for this ticker.</p>
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
          <GlassCard className="flex flex-col sm:flex-row gap-5 p-5 glass-card-hover" hover={true}>
            {/* News Image */}
            {item.image && (
              <div className="w-full sm:w-28 h-36 sm:h-20 shrink-0 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/50">
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
                <div className="flex items-center space-x-2 text-xxs font-bold text-slate-500 uppercase tracking-widest">
                  <span className="text-indigo-400">{item.source}</span>
                  <span>•</span>
                  <span>{new Date(item.datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 mt-1.5 leading-snug group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {item.headline}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-medium">
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
