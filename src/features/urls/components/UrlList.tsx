import { RefreshCcw, Globe } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import type { TransformedURL } from '@/shared/types';
import { UrlListItem } from './UrlListItem';

interface Props {
  urls: TransformedURL[];
  loading: boolean;
  copyStatus: string | null;
  onCopy: (text: string, id: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function UrlList({ urls, loading, copyStatus, onCopy, onDelete, onRefresh }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Activity History</h2>
          <span className="bg-gh-gray-bg border border-gh-gray-border text-[10px] font-bold px-2 py-0.5 rounded-full">
            {urls.length}
          </span>
        </div>
        <button onClick={onRefresh} className="text-gh-gray-text hover:text-gh-blue transition-colors">
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="gh-card overflow-hidden">
        <div className="divide-y divide-gh-gray-border">
          <AnimatePresence mode="popLayout">
            {urls.map((url, idx) => (
              <UrlListItem
                key={url.id}
                url={url}
                index={idx}
                isCopied={copyStatus === url.id}
                onCopy={onCopy}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </div>

        {urls.length === 0 && !loading && (
          <div className="text-center py-16">
            <Globe className="mx-auto text-gh-gray-border mb-3" size={32} />
            <p className="text-gh-gray-text text-sm font-medium">No links transformed yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
