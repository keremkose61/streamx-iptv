export interface EpgProgramItem {
  channelId: string;
  title: string;
  description: string | null;
  category: string | null;
  start: Date;
  end: Date;
  startIso: string;
  endIso: string;
}

export interface EpgChannelInfo {
  id: string;
  displayName: string;
  icon: string | null;
}

export interface EpgParseResult {
  channels: EpgChannelInfo[];
  programs: EpgProgramItem[];
  totalPrograms: number;
}
