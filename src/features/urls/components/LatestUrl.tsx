import { CheckCircle2, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import type { TransformedURL } from '@/shared/types';

interface Props {
  url: TransformedURL;
  isCopied: boolean;
  onCopy: (text: string, id: string) => void;
}

export function LatestUrl({ url, isCopied, onCopy }: Props) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-gh-blue animate-pulse" />
        <h2 className="text-sm font-semibold">Latest transformation</h2>
      </div>
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="gh-card border-gh-blue/30 bg-gh-blue/5 p-4 flex items-center justify-between"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold text-gh-blue uppercase tracking-wider mb-0.5">
            ALIAS: {url.alias}
          </div>
          <div className="text-base font-semibold truncate text-gh-blue decoration-gh-blue/20 underline underline-offset-4">
            {url.transformedUrl}
          </div>
        </div>
        <button
          onClick={() => onCopy(url.transformedUrl, url.id)}
          className="gh-button-secondary py-2 hover:border-gh-blue/30"
        >
          {isCopied ? <CheckCircle2 size={16} className="text-gh-green" /> : <Copy size={16} />}
        </button>
      </motion.div>
    </div>
  );
}
