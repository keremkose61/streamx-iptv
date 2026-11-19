export interface ChannelItem {
  name: string;
  streamUrl: string;
  groupTitle: string;
  tvgId: string | null;
  tvgName: string | null;
  tvgLogo: string | null;
  orderIndex: number;
  rawAttributes: Record<string, string>;
}

export interface ParseWarning {
  line: number;
  message: string;
  rawContent?: string;
}

export interface PlaylistParseResult {
  channels: ChannelItem[];
  groups: string[];
  totalChannels: number;
  warnings: ParseWarning[];
}
