export interface PlaybackError {
  error: string;
  code: 'GEO_BLOCKED' | 'CONCURRENT_LIMIT_REACHED' | 'PLAN_UPGRADE_REQUIRED' | 'NO_SUBSCRIPTION';
  limit?: number;
  current?: number;
  oldest_device?: string;
  required_scope?: string;
  current_plan?: string;
  available_plans?: string[];
}

export interface PlaybackSession {
  manifest_url: string;
  content_id: string;
  title: string;
  device_id: string;
  session_info: {
    concurrent_streams: number;
    limit: number;
  };
}
