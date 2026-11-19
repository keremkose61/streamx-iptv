import { EpgChannelInfo, EpgProgramItem, EpgParseResult } from './types.js';

export class EpgParser {
  /**
   * Parse XMLTV date string (e.g. "20261119143000 +0300" or "20261119143000") into Date.
   */
  public static parseXmltvDate(dateStr: string): Date {
    const trimmed = dateStr.trim();
    const parts = trimmed.split(/\s+/);
    const dt = parts[0];
    const tz = parts[1] || '+0000';

    const year = parseInt(dt.substring(0, 4), 10);
    const month = parseInt(dt.substring(4, 6), 10) - 1;
    const day = parseInt(dt.substring(6, 8), 10);
    const hour = parseInt(dt.substring(8, 10), 10);
    const min = parseInt(dt.substring(10, 12), 10);
    const sec = parseInt(dt.substring(12, 14) || '0', 10);

    const tzSign = tz.startsWith('-') ? -1 : 1;
    const tzHours = parseInt(tz.substring(1, 3) || '0', 10);
    const tzMins = parseInt(tz.substring(3, 5) || '0', 10);
    const totalTzOffsetMinutes = tzSign * (tzHours * 60 + tzMins);

    const utcMillis = Date.UTC(year, month, day, hour, min, sec) - totalTzOffsetMinutes * 60 * 1000;
    return new Date(utcMillis);
  }

  /**
   * Parse XMLTV XML content into structured channels and programs.
   */
  public static parse(xmlContent: string): EpgParseResult {
    const channels: EpgChannelInfo[] = [];
    const programs: EpgProgramItem[] = [];

    // Parse <channel id="...">
    const channelRegex = /<channel\s+id="([^"]+)"[\s\S]*?<\/channel>/gi;
    let chMatch;
    while ((chMatch = channelRegex.exec(xmlContent)) !== null) {
      const chBlock = chMatch[0];
      const id = chMatch[1];

      const nameMatch = /<display-name[^>]*>([^<]+)<\/display-name>/i.exec(chBlock);
      const iconMatch = /<icon\s+src="([^"]+)"/i.exec(chBlock);

      channels.push({
        id,
        displayName: nameMatch ? nameMatch[1].trim() : id,
        icon: iconMatch ? iconMatch[1] : null,
      });
    }

    // Parse <programme channel="..." start="..." stop="...">
    const progRegex = /<programme\s+([^>]+)>([\s\S]*?)<\/programme>/gi;
    let prMatch;
    while ((prMatch = progRegex.exec(xmlContent)) !== null) {
      const attrStr = prMatch[1];
      const bodyStr = prMatch[2];

      const chIdMatch = /channel="([^"]+)"/i.exec(attrStr);
      const startMatch = /start="([^"]+)"/i.exec(attrStr);
      const stopMatch = /stop="([^"]+)"/i.exec(attrStr);

      if (!chIdMatch || !startMatch || !stopMatch) {
        continue;
      }

      const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(bodyStr);
      const descMatch = /<desc[^>]*>([^<]+)<\/desc>/i.exec(bodyStr);
      const catMatch = /<category[^>]*>([^<]+)<\/category>/i.exec(bodyStr);

      const startDate = this.parseXmltvDate(startMatch[1]);
      const endDate = this.parseXmltvDate(stopMatch[1]);

      programs.push({
        channelId: chIdMatch[1],
        title: titleMatch ? titleMatch[1].trim() : 'Program',
        description: descMatch ? descMatch[1].trim() : null,
        category: catMatch ? catMatch[1].trim() : null,
        start: startDate,
        end: endDate,
        startIso: startDate.toISOString(),
        endIso: endDate.toISOString(),
      });
    }

    return {
      channels,
      programs,
      totalPrograms: programs.length,
    };
  }

  /**
   * Find current program and next program for a channel at a given time.
   */
  public static getNowAndNext(programs: EpgProgramItem[], now: Date = new Date()): { now: EpgProgramItem | null; next: EpgProgramItem | null } {
    const nowTime = now.getTime();
    let current: EpgProgramItem | null = null;
    let next: EpgProgramItem | null = null;

    for (const prog of programs) {
      const st = prog.start.getTime();
      const et = prog.end.getTime();

      if (nowTime >= st && nowTime < et) {
        current = prog;
      } else if (st >= nowTime && (!next || st < next.start.getTime())) {
        next = prog;
      }
    }

    return { now: current, next };
  }
}
