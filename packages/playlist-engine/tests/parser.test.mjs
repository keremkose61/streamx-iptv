import test from 'node:test';
import assert from 'node:assert';
import { PlaylistParser } from '../dist/index.js';

test('PlaylistParser parses standard M3U correctly', () => {
  const sample = `#EXTM3U
#EXTINF:-1 tvg-id="cnn.us" tvg-name="CNN" tvg-logo="https://example.com/cnn.png" group-title="News",CNN HD
https://example.com/stream/cnn.m3u8
#EXTINF:-1 tvg-id="discovery" group-title="Documentary",Discovery Channel
https://example.com/stream/discovery.m3u8
`;

  const result = PlaylistParser.parse(sample);
  assert.strictEqual(result.totalChannels, 2);
  assert.strictEqual(result.channels[0].name, 'CNN HD');
  assert.strictEqual(result.channels[0].tvgId, 'cnn.us');
  assert.strictEqual(result.channels[0].tvgLogo, 'https://example.com/cnn.png');
  assert.strictEqual(result.channels[0].groupTitle, 'News');

  assert.strictEqual(result.channels[1].name, 'Discovery Channel');
  assert.strictEqual(result.channels[1].groupTitle, 'Documentary');
  assert.deepStrictEqual(result.groups, ['Documentary', 'News']);
});

test('PlaylistParser handles #EXTGRP override', () => {
  const sample = `#EXTM3U
#EXTINF:-1 tvg-id="espn",ESPN
#EXTGRP:Sports
https://example.com/stream/espn.m3u8
`;

  const result = PlaylistParser.parse(sample);
  assert.strictEqual(result.totalChannels, 1);
  assert.strictEqual(result.channels[0].name, 'ESPN');
  assert.strictEqual(result.channels[0].groupTitle, 'Sports');
});

test('PlaylistParser handles malformed lines with warnings and continues parsing', () => {
  const malformed = `#EXTM3U
#EXTINF:-1,Invalid URL below
not-a-valid-url
https://example.com/orphan.m3u8
#EXTINF:-1 tvg-id="valid",Valid Channel
https://example.com/valid.m3u8
`;

  const result = PlaylistParser.parse(malformed);
  assert.strictEqual(result.totalChannels, 1);
  assert.strictEqual(result.channels[0].name, 'Valid Channel');
  assert.ok(result.warnings.length > 0);
});
