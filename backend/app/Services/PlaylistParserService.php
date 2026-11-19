<?php

namespace App\Services;

class PlaylistParserService
{
    /**
     * Parse M3U / M3U8 string content and return structured channels and groups.
     *
     * @param string $content
     * @return array{channels: array, groups: array, total: int, warnings: array}
     */
    public function parse(string $content): array
    {
        $lines = preg_split('/\r?\n/', $content);
        $channels = [];
        $groups = [];
        $warnings = [];

        $currentItem = null;
        $orderIndex = 0;

        foreach ($lines as $index => $rawLine) {
            $lineNum = $index + 1;
            $line = trim($rawLine);

            if ($line === '' || str_starts_with($line, '#EXTM3U')) {
                continue;
            }

            if (str_starts_with($line, '#EXTINF:')) {
                $currentItem = $this->parseExtInf($line, $lineNum);
                continue;
            }

            if (str_starts_with($line, '#EXTGRP:') && $currentItem) {
                $grp = trim(substr($line, 8));
                if ($grp !== '') {
                    $currentItem['group_title'] = $grp;
                }
                continue;
            }

            if (str_starts_with($line, '#')) {
                continue;
            }

            // Stream URL line
            if (str_starts_with($line, 'http://') || str_starts_with($line, 'https://') || str_starts_with($line, 'rtmp://')) {
                if ($currentItem && !empty($currentItem['name'])) {
                    $group = $currentItem['group_title'] ?? 'Genel';
                    $groups[$group] = ($groups[$group] ?? 0) + 1;

                    $channels[] = [
                        'name' => $currentItem['name'],
                        'group_title' => $group,
                        'stream_url' => $line,
                        'logo_url' => $currentItem['logo_url'] ?? null,
                        'epg_channel_id' => $currentItem['epg_channel_id'] ?? null,
                        'order_index' => $orderIndex++,
                        'is_active' => true,
                    ];
                    $currentItem = null;
                } else {
                    $warnings[] = [
                        'line' => $lineNum,
                        'message' => 'Stream URL found without preceding #EXTINF directive.',
                    ];
                }
            } else {
                if ($currentItem) {
                    $warnings[] = [
                        'line' => $lineNum,
                        'message' => "Expected stream URL, but found: {$line}",
                    ];
                    $currentItem = null;
                }
            }
        }

        return [
            'channels' => $channels,
            'groups' => array_keys($groups),
            'total' => count($channels),
            'warnings' => $warnings,
        ];
    }

    /**
     * Parse #EXTINF header line
     */
    private function parseExtInf(string $line, int $lineNum): array
    {
        $commaPos = strrpos($line, ',');
        $name = '';
        $attrStr = '';

        if ($commaPos !== false) {
            $name = trim(substr($line, $commaPos + 1));
            $attrStr = trim(substr($line, 8, $commaPos - 8));
        } else {
            $attrStr = trim(substr($line, 8));
            $name = "Kanal {$lineNum}";
        }

        $attributes = [];
        if (preg_match_all('/([a-zA-Z0-9_-]+)="([^"]*)"/', $attrStr, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $attributes[strtolower($match[1])] = $match[2];
            }
        }

        return [
            'name' => $name ?: "Kanal {$lineNum}",
            'group_title' => $attributes['group-title'] ?? 'Genel',
            'logo_url' => $attributes['tvg-logo'] ?? null,
            'epg_channel_id' => $attributes['tvg-id'] ?? null,
        ];
    }
}
