import type { URLStats } from '@/shared/types';

interface Props {
  stats: URLStats;
}

export function StatsGrid({ stats }: Props) {
  return (
    <section className="grid grid-cols-2 gap-4 mb-8">
      <div className="gh-card p-4 flex flex-col items-center justify-center text-center">
        <div className="text-[10px] font-bold text-gh-gray-text uppercase tracking-widest mb-1">Total Links</div>
        <div className="text-2xl font-black text-slate-900 leading-none">{stats.totalUrls}</div>
      </div>
      <div className="gh-card p-4 flex flex-col items-center justify-center text-center">
        <div className="text-[10px] font-bold text-gh-gray-text uppercase tracking-widest mb-1">Global Clicks</div>
        <div className="text-2xl font-black text-gh-blue leading-none">{stats.totalClicks.toLocaleString()}</div>
      </div>
    </section>
  );
}
