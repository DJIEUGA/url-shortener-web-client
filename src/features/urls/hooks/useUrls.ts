import { useState, useEffect, useCallback } from 'react';
import type { TransformedURL } from '@/shared/types';
import { fetchUrls, createUrl, deleteUrl } from '../api/urls.api';

export function useUrls() {
  const [urls, setUrls] = useState<TransformedURL[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransforming, setIsTransforming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUrls(await fetchUrls());
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (err as Error)?.message ?? 'Failed to load URLs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const transform = useCallback(async (originalUrl: string) => {
    setIsTransforming(true);
    setError(null);
    try {
      await createUrl(originalUrl);
      await refresh();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (err as Error)?.message ?? 'Failed to shorten URL');
    } finally {
      setIsTransforming(false);
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    if (!confirm('Permanently remove this entry?')) return;
    setError(null);
    try {
      await deleteUrl(id);
      setUrls(prev => prev.filter(u => u.id !== id));
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (err as Error)?.message ?? 'Failed to delete URL');
    }
  }, []);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  }, []);

  return { urls, loading, isTransforming, error, copyStatus, refresh, transform, remove, copyToClipboard };
}
