import { describe, it, expect } from 'bun:test';
import { computeTextMetrics, getCircledNumber } from '../wordCount';

describe('wordCount (VMark Reference)', () => {
  it('handles empty text', () => {
    const res = computeTextMetrics('');
    expect(res.charsNoSpaces).toBe(0);
    expect(res.charsWithSpaces).toBe(0);
    expect(res.cjkChars).toBe(0);
    expect(res.words).toBe(0);
    expect(res.paragraphs).toBe(0);
  });

  it('correctly calculates charsNoSpaces according to Tomato / VMark standard', () => {
    // 阳光明媚，微风不燥。 (10 characters)
    const text = '  \u3000阳光明媚，微风不燥。\n\n  林凡抬手一剑！\t';
    const metrics = computeTextMetrics(text);
    // '阳光明媚，微风不燥。' (10) + '林凡抬手一剑！' (7) = 17 chars
    expect(metrics.charsNoSpaces).toBe(17);
    expect(metrics.paragraphs).toBe(2);
  });

  it('correctly counts CJK characters and code points', () => {
    const text = '全民高武：Hello 2026！🚀';
    const metrics = computeTextMetrics(text);
    expect(metrics.cjkChars).toBe(4); // 全民高武
    // Astral emoji 🚀 should count as 1 character in charsWithSpaces
    expect(Array.from('🚀').length).toBe(1);
    expect(metrics.charsNoSpaces).toBe(16); // 全民高武：Hello2026！🚀 (16 chars)
  });

  it('converts circled numbers up to 50', () => {
    expect(getCircledNumber(1)).toBe('①');
    expect(getCircledNumber(2)).toBe('②');
    expect(getCircledNumber(10)).toBe('⑩');
    expect(getCircledNumber(20)).toBe('⑳');
  });
});
