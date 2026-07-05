import type { TransformedURL } from '@/shared/types';
import apiClient from './apiClient';

export async function fetchUrls(): Promise<TransformedURL[]> {
  const { data } = await apiClient.get<TransformedURL[]>('/urls');
  return Array.isArray(data) ? data : [];
}

export async function createUrl(originalUrl: string): Promise<TransformedURL> {
  const { data } = await apiClient.post<TransformedURL>('/urls', {
    originalUrl,
    transformationType: 'Shorten',
  });
  return data;
}

export async function deleteUrl(id: string): Promise<void> {
  await apiClient.delete(`/urls/${id}`);
}
