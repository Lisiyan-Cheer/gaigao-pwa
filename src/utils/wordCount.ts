import { TextMetrics } from '../types';

// CJK character regex (Han ideographs + Japanese kana)
const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu;
// Unicode punctuation & symbols regex
const PUNCT_OR_SYMBOL_RE = /[\p{P}\p{S}]/gu;

/**
 * Computes exact text metrics reference from VMark / Tomato standard
 */
export function computeTextMetrics(text: string): TextMetrics {
  if (!text) {
    return {
      charsNoSpaces: 0,
      charsWithSpaces: 0,
      cjkChars: 0,
      words: 0,
      paragraphs: 0,
      avgParagraphChars: 0,
    };
  }

  // Astral & emoji code point correct counting
  const charsWithSpaces = Array.from(text).length;
  const noSpaces = text.replace(/\s/g, '');
  const charsNoSpaces = Array.from(noSpaces).length;
  
  const cjkMatches = text.match(CJK_RE);
  const cjkChars = cjkMatches ? cjkMatches.length : 0;

  // Words count (separates non-punctuation words + CJK characters)
  const cleanedText = text.replace(PUNCT_OR_SYMBOL_RE, ' ');
  const wordTokens = cleanedText.match(/\S+/g);
  const words = wordTokens ? wordTokens.length : 0;

  const validLines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const paragraphs = validLines.length;
  const avgParagraphChars = paragraphs > 0 ? Math.round(charsNoSpaces / paragraphs) : 0;

  return {
    charsNoSpaces,
    charsWithSpaces,
    cjkChars,
    words,
    paragraphs,
    avgParagraphChars,
  };
}

/**
 * Circle number converter for 1~50
 */
export function getCircledNumber(n: number): string {
  const circledDigits = [
    '⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨',
    '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲',
    '⑳', '㉑', '㉒', '㉓', '㉔', '㉕', '㉖', '㉗', '㉘', '㉙',
    '㉚', '㉛', '㉜', '㉝', '㉞', '㉟', '㊱', '㊲', '㊳', '㊴',
    '㊵', '㊶', '㊷', '㊸', '㊹', '㊺', '㊻', '㊼', '㊽', '㊾', '㊿'
  ];
  return circledDigits[n] || `(${n})`;
}
