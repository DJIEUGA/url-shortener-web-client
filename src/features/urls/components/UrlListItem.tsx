import { CheckCircle2, Copy, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { TransformedURL } from '@/shared/types';

interface Props {
  url: TransformedURL;
  index: number;
  isCopied: boolean;
  onCopy: (text: string, id: string) => void;
  onDelete: (id: string) => void;
}

export function UrlListItem({ url, index, isCopied, onCopy, onDelete }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.02 }}
      className="p-4 flex items-center justify-between gap-4 group hover:bg-[#fafbfc] transition-colors duration-200"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-semibold bg-gh-gray-bg border border-gh-gray-border px-1.5 py-0.5 rounded text-gh-gray-text">
            {url.transformationType}
          </span>
          <span className="text-[10px] font-medium text-gh-gray-text">
            {new Date(url.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="font-semibold text-sm truncate text-gh-blue hover:underline cursor-pointer">
          {url.transformedUrl}
        </div>
        <div className="text-xs text-gh-gray-text truncate mt-0.5 font-mono opacity-60 group-hover:opacity-100 transition-opacity">
          {url.originalUrl}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right pr-4 border-r border-gh-gray-border">
          <div className="text-[10px] font-semibold text-gh-gray-text uppercase tracking-tight">Clicks</div>
          <div className="text-sm font-bold leading-none">{url.clicks || 0}</div>
        </div>
        <div className="flex items-center gap-1.5 min-w-[80px] justify-end">
          <button
            onClick={() => onCopy(url.transformedUrl, url.id)}
            className="p-2 text-gh-gray-text hover:text-gh-blue transition-all rounded-md hover:bg-gh-gray-bg"
            title="Copy to clipboard"
          >
            {isCopied ? <CheckCircle2 size={16} className="text-gh-green" /> : <Copy size={16} />}
          </button>
          <button
            onClick={() => onDelete(url.id)}
            className="p-2 text-gh-gray-text hover:text-red-600 transition-all rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete link"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
