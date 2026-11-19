import test from 'node:test';
import assert from 'node:assert';
import { EpgParser } from '../dist/index.js';

test('EpgParser parses XMLTV channels and programs correctly', () => {
  const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
<tv generator-info-name="StreamX Test">
  <channel id="trt1.tr">
    <display-name>TRT 1</display-name>
    <icon src="https://example.com/trt1.png"/>
  </channel>
  <programme channel="trt1.tr" start="20261119140000 +0300" stop="20261119153000 +0300">
    <title>Haber Bulteni</title>
    <desc>Gunluk gelismeler ve canli haberler.</desc>
    <category>Haber</category>
  </programme>
  <programme channel="trt1.tr" start="20261119153000 +0300" stop="20261119170000 +0300">
    <title>Dizi Tekrari</title>
    <desc>Sevilen dizinin tekrar bolumu.</desc>
    <category>Dizi</category>
  </programme>
</tv>`;

  const result = EpgParser.parse(sampleXml);
  assert.strictEqual(result.channels.length, 1);
  assert.strictEqual(result.channels[0].id, 'trt1.tr');
  assert.strictEqual(result.channels[0].displayName, 'TRT 1');
  assert.strictEqual(result.channels[0].icon, 'https://example.com/trt1.png');

  assert.strictEqual(result.totalPrograms, 2);
  assert.strictEqual(result.programs[0].title, 'Haber Bulteni');
  assert.strictEqual(result.programs[0].category, 'Haber');
  assert.strictEqual(result.programs[1].title, 'Dizi Tekrari');

  // Test now and next at 14:30
  const testTime = new Date('2026-11-19T11:30:00Z'); // 14:30 +0300
  const { now, next } = EpgParser.getNowAndNext(result.programs, testTime);
  assert.ok(now);
  assert.strictEqual(now.title, 'Haber Bulteni');
  assert.ok(next);
  assert.strictEqual(next.title, 'Dizi Tekrari');
});
