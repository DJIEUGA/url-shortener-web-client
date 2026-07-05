import { Link2, AlertCircle } from 'lucide-react';
import { useUrls } from '@/features/urls/hooks/useUrls';
import { StatsGrid } from '@/features/urls/components/StatsGrid';
import { UrlForm } from '@/features/urls/components/UrlForm';
import { LatestUrl } from '@/features/urls/components/LatestUrl';
import { UrlList } from '@/features/urls/components/UrlList';

export default function App() {
  const { urls, loading, isTransforming, error, copyStatus, refresh, transform, remove, copyToClipboard } = useUrls();

  const stats = {
    totalUrls: urls.length,
    totalClicks: urls.reduce((acc, u) => acc + (u.clicks || 0), 0),
    recentGrowth: '+24%',
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans py-12 px-4 selection:bg-gh-blue selection:text-white">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-gh-gray-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-white rounded-md flex items-center justify-center">
              <Link2 size={18} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Url shorty</h1>
          </div>
          <p className="text-xs text-gh-gray-text font-medium bg-gh-gray-bg px-2 py-1 border border-gh-gray-border rounded-full">
            version 1.0
          </p>
        </header>

        {error && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <StatsGrid stats={stats} />

        <UrlForm onSubmit={transform} isSubmitting={isTransforming} />

        {urls.length > 0 && (
          <LatestUrl
            url={urls[0]}
            isCopied={copyStatus === urls[0].id}
            onCopy={copyToClipboard}
          />
        )}

        <UrlList
          urls={urls}
          loading={loading}
          copyStatus={copyStatus}
          onCopy={copyToClipboard}
          onDelete={remove}
          onRefresh={refresh}
        />

        <footer className="mt-16 pt-8 border-t border-gh-gray-border text-center" />
      </div>
    </div>
  );
}
