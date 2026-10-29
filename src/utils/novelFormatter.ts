import { Annotation } from '../types';

/**
 * Novel Auto-Formatter (1:1 VMark Specification)
 * 
 * 1. Strips accidental leading spaces (ASCII spaces, tabs, fullwidth ideographic spaces \u3000).
 *    Paragraph indent is handled visually via CSS (text-indent: 2em).
 * 2. Strips trailing whitespace from every paragraph.
 * 3. Eliminates accidental blank/empty lines, standardizing into clean paragraphs separated by \n\n.
 * 4. Preserves markdown structures (fenced code blocks, tables, headings).
 */
export function formatNovelText(markdown: string): string {
  if (!markdown) return "";

  const lines = markdown.split(/\r?\n/);
  const resultBlocks: string[] = [];
  let inCodeBlock = false;
  let currentCodeBlockLines: string[] = [];
  let currentTableLines: string[] = [];

  const flushTable = () => {
    if (currentTableLines.length > 0) {
      resultBlocks.push(currentTableLines.join("\n"));
      currentTableLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    // Fenced code block handling
    if (rawLine.trim().startsWith("```")) {
      flushTable();
      if (!inCodeBlock) {
        inCodeBlock = true;
        currentCodeBlockLines = [rawLine];
      } else {
        inCodeBlock = false;
        currentCodeBlockLines.push(rawLine);
        resultBlocks.push(currentCodeBlockLines.join("\n"));
        currentCodeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      currentCodeBlockLines.push(rawLine);
      continue;
    }

    // Strip leading and trailing whitespace including CJK ideographic spaces (\u3000)
    const trimmed = rawLine.replace(/^[\s\u3000]+/, "").replace(/[\s\u3000]+$/, "");

    // Drop empty and whitespace-only lines
    if (trimmed === "") {
      flushTable();
      continue;
    }

    // Markdown tables: keep contiguous table rows joined by single newline
    if (trimmed.startsWith("|")) {
      currentTableLines.push(trimmed);
      continue;
    }

    flushTable();
    resultBlocks.push(trimmed);
  }

  flushTable();
  if (currentCodeBlockLines.length > 0) {
    resultBlocks.push(currentCodeBlockLines.join("\n"));
  }

  if (resultBlocks.length === 0) {
    return "";
  }

  return resultBlocks.join("\n\n") + "\n";
}

/**
 * Formats novel text and intelligently re-anchors existing annotations
 */
export function formatNovelAndRemapAnnotations(
  content: string,
  annotations: Annotation[]
): { formattedContent: string; updatedAnnotations: Annotation[] } {
  const formattedContent = formatNovelText(content);

  const updatedAnnotations: Annotation[] = annotations.map((ann) => {
    const targetText = ann.text;
    const trimmedTarget = targetText.trim();

    // 1. Exact match in formatted content
    let foundIndex = formattedContent.indexOf(targetText);

    // 2. Trimmed match
    if (foundIndex === -1 && trimmedTarget.length > 0) {
      foundIndex = formattedContent.indexOf(trimmedTarget);
      if (foundIndex !== -1) {
        return {
          ...ann,
          text: trimmedTarget,
          startIndex: foundIndex,
          endIndex: foundIndex + trimmedTarget.length,
          status: 'active' as const,
        };
      }
    }

    if (foundIndex !== -1) {
      return {
        ...ann,
        startIndex: foundIndex,
        endIndex: foundIndex + targetText.length,
        status: 'active' as const,
      };
    }

    // 3. Normalized whitespace search
    const normTarget = targetText.replace(/[\s\u3000]+/g, '');
    let matchedStart = -1;
    let matchedEnd = -1;

    // Scan formatted lines for match
    for (let i = 0; i < formattedContent.length; i++) {
      if (formattedContent[i].trim() === '') continue;
      // Check substring ignoring internal whitespace
      let sub = '';
      let j = i;
      while (j < formattedContent.length && sub.length < normTarget.length) {
        if (!/[\s\u3000]/.test(formattedContent[j])) {
          sub += formattedContent[j];
        }
        j++;
      }
      if (sub === normTarget) {
        matchedStart = i;
        matchedEnd = j;
        break;
      }
    }

    if (matchedStart !== -1) {
      const newMatchedText = formattedContent.substring(matchedStart, matchedEnd);
      return {
        ...ann,
        text: newMatchedText,
        startIndex: matchedStart,
        endIndex: matchedEnd,
        status: 'active' as const,
      };
    }

    // 4. Marked as orphaned if completely missing from the text
    return {
      ...ann,
      status: 'orphaned' as const,
    };
  });

  // Re-sort active annotations by appearance and renumber 1, 2, 3...
  const active = updatedAnnotations
    .filter((a) => a.status === 'active')
    .sort((a, b) => a.startIndex - b.startIndex);

  const orphaned = updatedAnnotations.filter((a) => a.status === 'orphaned');

  let curIndex = 1;
  active.forEach((a) => {
    a.index = curIndex++;
  });
  orphaned.forEach((a) => {
    a.index = curIndex++;
  });

  return {
    formattedContent,
    updatedAnnotations: [...active, ...orphaned],
  };
}
