import React, { useState } from 'react';
import { RefreshCcw, ArrowRight, Globe, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/shared/lib/cn';

interface Props {
  onSubmit: (url: string) => Promise<void>;
  isSubmitting: boolean;
}

function isValidUrl(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

export function UrlForm({ onSubmit, isSubmitting }: Props) {
  const [inputUrl, setInputUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputUrl(val);
    setUrlError(val && !isValidUrl(val) ? 'Please enter a valid URL (e.g., https://google.com)' : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl || urlError) return;
    await onSubmit(inputUrl);
    setInputUrl('');
  };

  const disabled = isSubmitting || !!urlError || !inputUrl;

  return (
    <section className="mb-12">
      <div className="gh-card p-6">
        <h2 className="text-sm font-semibold mb-3">Create new link transformation</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Original URL</label>
            <div className="relative">
              <input
                type="url"
                placeholder="Enter a long URL to shorten"
                className={cn(
                  'w-full gh-input py-2.5 pr-10',
                  urlError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gh-gray-border'
                )}
                value={inputUrl}
                onChange={handleUrlChange}
                required
              />
              <Globe
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
                  urlError ? 'text-red-400' : 'text-slate-300'
                )}
                size={16}
              />
            </div>
            {urlError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-red-500 mt-1.5"
              >
                <AlertCircle size={12} />
                <span className="text-[10px] font-bold uppercase tracking-tight">{urlError}</span>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={disabled}
              className={cn(
                'gh-button-primary flex items-center justify-center gap-2 min-w-[140px] transition-all',
                disabled && 'opacity-60 cursor-not-allowed bg-slate-300 hover:bg-slate-300 text-slate-500 border-transparent shadow-none'
              )}
            >
              {isSubmitting
                ? <RefreshCcw className="animate-spin size-4" />
                : <>Shorten URL <ArrowRight size={14} /></>
              }
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
