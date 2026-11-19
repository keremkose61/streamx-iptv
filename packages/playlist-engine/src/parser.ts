import { ChannelItem, ParseWarning, PlaylistParseResult } from './types.js';

export class PlaylistParser {
  /**
   * Parse full M3U / M3U8 string content with error resilience.
   */
  public static parse(content: string): PlaylistParseResult {
    const lines = content.split(/\r?\n/);
    const channels: ChannelItem[] = [];
    const groupSet = new Set<string>();
    const warnings: ParseWarning[] = [];

    let currentItem: Partial<ChannelItem> | null = null;
    let orderIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const line = lines[i].trim();

      if (!line) {
        continue;
      }

      // Header check
      if (line.startsWith('#EXTM3U')) {
        continue;
      }

      // EXTINF line
      if (line.startsWith('#EXTINF:')) {
        try {
          currentItem = this.parseExtInf(line, lineNum);
        } catch (e: any) {
          warnings.push({
            line: lineNum,
            message: `EXTINF parsing failed: ${e.message}`,
            rawContent: line,
          });
          currentItem = null;
        }
        continue;
      }

      // Category override from #EXTGRP:
      if (line.startsWith('#EXTGRP:') && currentItem) {
        const grp = line.substring(8).trim();
        if (grp) {
          currentItem.groupTitle = grp;
        }
        continue;
      }

      // Ignore other comments or metadata directives
      if (line.startsWith('#')) {
        continue;
      }

      // Stream URL line
      if (line.startsWith('http://') || line.startsWith('https://') || line.startsWith('rtmp://')) {
        if (currentItem && currentItem.name) {
          const finalGroup = currentItem.groupTitle || 'Genel';
          groupSet.add(finalGroup);

          channels.push({
            name: currentItem.name,
            streamUrl: line,
            groupTitle: finalGroup,
            tvgId: currentItem.tvgId || null,
            tvgName: currentItem.tvgName || null,
            tvgLogo: currentItem.tvgLogo || null,
            orderIndex: orderIndex++,
            rawAttributes: currentItem.rawAttributes || {},
          });
          currentItem = null;
        } else {
          // Stream URL without valid preceding #EXTINF
          warnings.push({
            line: lineNum,
            message: 'Stream URL found without preceding #EXTINF directive.',
            rawContent: line,
          });
        }
      } else {
        // Unexpected non-directive, non-URL line
        if (currentItem) {
          warnings.push({
            line: lineNum,
            message: `Expected stream URL after #EXTINF, but found invalid content: "${line}"`,
            rawContent: line,
          });
          currentItem = null;
        }
      }
    }

    return {
      channels,
      groups: Array.from(groupSet).sort(),
      totalChannels: channels.length,
      warnings,
    };
  }

  /**
   * Parse #EXTINF directive and extract attributes + channel name.
   */
  private static parseExtInf(line: string, lineNum: number): Partial<ChannelItem> {
    const commaIndex = line.lastIndexOf(',');
    let name = '';
    let attrString = '';

    if (commaIndex !== -1) {
      name = line.substring(commaIndex + 1).trim();
      attrString = line.substring(8, commaIndex).trim();
    } else {
      attrString = line.substring(8).trim();
      name = `Kanal ${lineNum}`;
    }

    const rawAttributes: Record<string, string> = {};
    const attrRegex = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
    let match;

    while ((match = attrRegex.exec(attrString)) !== null) {
      const key = match[1].toLowerCase();
      const val = match[2];
      rawAttributes[key] = val;
    }

    return {
      name: name || `Kanal ${lineNum}`,
      tvgId: rawAttributes['tvg-id'] || null,
      tvgName: rawAttributes['tvg-name'] || null,
      tvgLogo: rawAttributes['tvg-logo'] || null,
      groupTitle: rawAttributes['group-title'] || 'Genel',
      rawAttributes,
    };
  }
}
