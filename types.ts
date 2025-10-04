
export interface Track {
  id: string;
  name: string;
  url?: string; // Will be present for local files
  videoId?: string; // Will be present for remote (YouTube) files
  albumArtUrl?: string;
  artist?: string;
  source: 'local' | 'remote';
}