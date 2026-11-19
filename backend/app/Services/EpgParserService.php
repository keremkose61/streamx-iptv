<?php

namespace App\Services;

use DateTime;
use DateTimeZone;
use Exception;

class EpgParserService
{
    /**
     * Parse XMLTV date string like "20261119140000 +0300" into standard Y-m-d H:i:s.
     */
    public function parseDate(string $rawDate): string
    {
        $rawDate = trim($rawDate);
        $parts = preg_split('/\s+/', $rawDate);
        $dt = $parts[0] ?? '';
        $tz = $parts[1] ?? '+0000';

        $year = substr($dt, 0, 4);
        $month = substr($dt, 4, 2);
        $day = substr($dt, 6, 2);
        $hour = substr($dt, 8, 2) ?: '00';
        $min = substr($dt, 10, 2) ?: '00';
        $sec = substr($dt, 12, 2) ?: '00';

        $formatted = "{$year}-{$month}-{$day} {$hour}:{$min}:{$sec}";

        try {
            $tzObj = new DateTimeZone($tz);
            $d = new DateTime($formatted, $tzObj);
            $d->setTimezone(new DateTimeZone('UTC'));
            return $d->format('Y-m-d H:i:s');
        } catch (Exception) {
            return date('Y-m-d H:i:s');
        }
    }

    /**
     * Parse XMLTV XML content into channels and programs.
     *
     * @param string $xmlContent
     * @return array{channels: array, programs: array, total: int}
     */
    public function parse(string $xmlContent): array
    {
        $programs = [];
        $channels = [];

        // Parse channels
        if (preg_match_all('/<channel\s+id="([^"]+)"[\s\S]*?<\/channel>/i', $xmlContent, $chBlocks, PREG_SET_ORDER)) {
            foreach ($chBlocks as $block) {
                $id = $block[1];
                $name = $id;
                $icon = null;

                if (preg_match('/<display-name[^>]*>([^<]+)<\/display-name>/i', $block[0], $nameMatch)) {
                    $name = trim($nameMatch[1]);
                }
                if (preg_match('/<icon\s+src="([^"]+)"/i', $block[0], $iconMatch)) {
                    $icon = trim($iconMatch[1]);
                }

                $channels[$id] = [
                    'id' => $id,
                    'name' => $name,
                    'icon' => $icon,
                ];
            }
        }

        // Parse programmes
        $progPattern = '/<programme\s+([^>]+)>([\s\S]*?)<\/programme>/i';
        if (preg_match_all($progPattern, $xmlContent, $prBlocks, PREG_SET_ORDER)) {
            foreach ($prBlocks as $block) {
                $attrs = $block[1];
                $body = $block[2];

                if (!preg_match('/channel="([^"]+)"/i', $attrs, $chMatch) ||
                    !preg_match('/start="([^"]+)"/i', $attrs, $startMatch) ||
                    !preg_match('/stop="([^"]+)"/i', $attrs, $stopMatch)) {
                    continue;
                }

                $title = 'Program';
                $desc = null;

                if (preg_match('/<title[^>]*>([^<]+)<\/title>/i', $body, $titleMatch)) {
                    $title = trim($titleMatch[1]);
                }
                if (preg_match('/<desc[^>]*>([^<]+)<\/desc>/i', $body, $descMatch)) {
                    $desc = trim($descMatch[1]);
                }

                $programs[] = [
                    'channel_id_ref' => substr($chMatch[1], 0, 191),
                    'title' => substr($title, 0, 255),
                    'description' => $desc,
                    'start_time' => $this->parseDate($startMatch[1]),
                    'end_time' => $this->parseDate($stopMatch[1]),
                ];
            }
        }

        return [
            'channels' => array_values($channels),
            'programs' => $programs,
            'total' => count($programs),
        ];
    }
}
