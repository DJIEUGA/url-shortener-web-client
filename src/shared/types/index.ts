export interface TransformedURL {
  id: string;
  originalUrl: string;
  transformedUrl: string;
  alias: string;
  transformationType: 'Shorten';
  clicks: number;
  createdAt: string;
  status: 'Active' | 'Archived';
}

export interface URLStats {
  totalUrls: number;
  totalClicks: number;
  recentGrowth: string;
}

export interface Url{
    id: string;
    originalUrl: string;
    shortCode: string;
    createdAt: string;
    clickCount: number;
    onClick: () => void;
    onDelete: () => void;
}



