import { Chapter } from '../types';
import { getCircledNumber } from './wordCount';

/**
 * Builds the text with embedded circled numbers ①②③ right behind the annotated sentences.
 */
export function buildAnnotatedContent(chapter: Chapter): string {
  const content = chapter.content;
  const activeAnnotations = chapter.annotations
    .filter((a) => a.status === 'active')
    .sort((a, b) => b.startIndex - a.startIndex); // Insert from back to front to preserve offsets

  let result = content;

  for (const ann of activeAnnotations) {
    const badge = getCircledNumber(ann.index);
    
    // Check if the annotation is still within valid range
    if (ann.endIndex <= result.length && ann.startIndex < ann.endIndex) {
      const actualSub = result.substring(ann.startIndex, ann.endIndex);
      // Double check if it roughly matches or text was found
      if (actualSub === ann.text || actualSub.includes(ann.text) || ann.text.includes(actualSub)) {
        result = result.slice(0, ann.endIndex) + badge + result.slice(ann.endIndex);
        continue;
      }
    }

    // Fallback: search for ann.text in result
    const idx = result.indexOf(ann.text);
    if (idx !== -1) {
      const insertAt = idx + ann.text.length;
      result = result.slice(0, insertAt) + badge + result.slice(insertAt);
    }
  }

  return result;
}

/**
 * Builds the complete structured AI prompt per implementation plan specification
 */
export function generateAIPrompt(chapter: Chapter, customBookName?: string, customChapterNum?: string): string {
  const bookName = (customBookName || chapter.bookName || '全民高武：只有我的商城能充冥币！').trim();
  const chapterNum = (customChapterNum || chapter.chapterNum || '001').trim();

  // Sort annotations by index
  const sortedAnnotations = [...chapter.annotations].sort((a, b) => a.index - b.index);

  // Build 批注清单
  let annotationsListStr = '';
  if (sortedAnnotations.length === 0) {
    annotationsListStr = '（本次改稿无批注，仅以此版正文更新替换）';
  } else {
    annotationsListStr = sortedAnnotations
      .map((ann) => {
        const num = getCircledNumber(ann.index);
        const orphanTag = ann.status === 'orphaned' ? '（原句已在正文中删改）' : '';
        return `${num} 原句：「${ann.text}」${orphanTag}\n   意见：${ann.comment || '无具体意见，请结合上下文精修。'}`;
      })
      .join('\n\n');
  }

  // Build 修改后正文
  const annotatedContent = buildAnnotatedContent(chapter);

  return `请更新《${bookName}》第${chapterNum}章，分两步进行：

【第一步：先出修改方案，不要动文件】
1. 下方【修改后正文】是我亲手改过的版本，最终以它为准，替换项目中现有的第${chapterNum}章。
2. 正文里的 ①②③ 标记紧跟在被批注句子后面，编号与【批注清单】一一对应。
3. 逐条给出修改方案：写出「原句 → 改后句」，再用一句话说明改法。
4. 只改批注涉及的句段，其余内容（包括我改过的地方）保持原样，不要顺手重写。
5. 如果某条批注和我改过的内容实在矛盾，或者必须连带改动批注范围外的句子，单独列出来说明原因，等我决定。

【第二步：等我确认后再改文件】
我回复“通过”（或指出要调整哪几条）后，再用修改后正文替换原章节，落实已通过的批注修改，删除所有 ①②③ 标记，保存文件。

【批注清单】
${annotationsListStr}

【修改后正文】
${annotatedContent}`;
}
