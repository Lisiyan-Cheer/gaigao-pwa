/**
 * Extracts chapter title, chapter number, and body from raw pasted novel text
 */
export function parseChapterContent(rawText: string): {
  chapterNum: string;
  title: string;
  body: string;
} {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      chapterNum: '001',
      title: '第001章 未命名',
      body: '',
    };
  }

  const lines = trimmed.split(/\r?\n/);
  const firstFewLines = lines.slice(0, 5);

  // Common novel chapter title patterns
  // Examples:
  // "第010章 这特么是顶配战宠？！"
  // "# 第010章 这特么是顶配战宠？！"
  // "第10章 这特么是顶配战宠？！"
  // "第十卷 第五章 决战之巅"
  const chapterRegex = /^(?:#+\s*)?(第\s*([0-9一二三四五六七八九十百千万]+)\s*[章节回卷集部篇话][\s_]*(.*))$/;

  for (let i = 0; i < firstFewLines.length; i++) {
    const line = firstFewLines[i].trim();
    const match = line.match(chapterRegex);
    if (match) {
      const fullHeader = match[1].replace(/_/g, ' ').trim();
      const rawNum = match[2].trim();
      let chapterNum = rawNum;
      
      // If pure digits, pad to at least 3 digits if it's 1 or 2 digits
      if (/^\d+$/.test(rawNum)) {
        chapterNum = rawNum.padStart(3, '0');
      }

      // Title can be the full header or cleaned up
      const title = fullHeader;

      // Extract body (optionally starting after the title line if it was at line 0)
      let bodyLines = [...lines];
      if (i === 0) {
        bodyLines = lines.slice(1);
      }
      const body = bodyLines.join('\n').trim();

      return {
        chapterNum,
        title,
        body: body || trimmed,
      };
    }
  }

  // Fallback: take first non-empty line as title if short (< 40 chars)
  const firstLine = lines.find((l) => l.trim().length > 0)?.trim() || '未命名章节';
  if (firstLine.length <= 40) {
    const numMatch = firstLine.match(/(\d+)/);
    const chapterNum = numMatch ? numMatch[1].padStart(3, '0') : '001';
    return {
      chapterNum,
      title: firstLine,
      body: lines.slice(lines.indexOf(firstLine) + 1).join('\n').trim() || trimmed,
    };
  }

  return {
    chapterNum: '001',
    title: '第001章 未命名',
    body: trimmed,
  };
}
