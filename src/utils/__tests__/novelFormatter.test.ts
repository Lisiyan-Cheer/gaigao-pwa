import { describe, it, expect } from 'bun:test';
import { formatNovelText, formatNovelAndRemapAnnotations } from '../novelFormatter';
import { Annotation } from '../../types';

describe('novelFormatter (VMark 1:1 Implementation)', () => {
  it('strips leading fullwidth spaces and trailing spaces', () => {
    const input = '\u3000\u3000第一段正文内容。   \n\n   \u3000第二段正文内容。\t\n';
    const formatted = formatNovelText(input);
    expect(formatted).toBe('第一段正文内容。\n\n第二段正文内容。\n');
  });

  it('eliminates redundant blank lines into standard double newlines', () => {
    const input = '第一段。\n\n\n\n\n\n\n第二段。\n\n   \n   \n第三段。';
    const formatted = formatNovelText(input);
    expect(formatted).toBe('第一段。\n\n第二段。\n\n第三段。\n');
  });

  it('preserves code blocks and markdown tables', () => {
    const input = '段落一。\n\n```python\ndef test():\n    return 1\n```\n\n段落二。';
    const formatted = formatNovelText(input);
    expect(formatted).toContain('```python\ndef test():\n    return 1\n```');
  });

  it('intelligently remaps annotations when text shifts during formatting', () => {
    const rawContent = '   \u3000林凡抬手一剑，紫僵当场跪下。   \n\n\n\n   众人震惊不已。  ';
    const annotations: Annotation[] = [
      {
        id: 'ann-1',
        index: 1,
        text: '林凡抬手一剑，紫僵当场跪下。',
        startIndex: rawContent.indexOf('林凡抬手一剑，紫僵当场跪下。'),
        endIndex: rawContent.indexOf('林凡抬手一剑，紫僵当场跪下。') + '林凡抬手一剑，紫僵当场跪下。'.length,
        comment: '补反扑动作',
        status: 'active',
        createdAt: 1000,
      },
      {
        id: 'ann-2',
        index: 2,
        text: '众人震惊不已。',
        startIndex: rawContent.indexOf('众人震惊不已。'),
        endIndex: rawContent.indexOf('众人震惊不已。') + '众人震惊不已。'.length,
        comment: '换具体反应',
        status: 'active',
        createdAt: 2000,
      },
    ];

    const { formattedContent, updatedAnnotations } = formatNovelAndRemapAnnotations(
      rawContent,
      annotations
    );

    expect(formattedContent).toBe('林凡抬手一剑，紫僵当场跪下。\n\n众人震惊不已。\n');
    expect(updatedAnnotations[0].startIndex).toBe(0);
    expect(updatedAnnotations[0].endIndex).toBe('林凡抬手一剑，紫僵当场跪下。'.length);
    expect(updatedAnnotations[0].status).toBe('active');
    expect(updatedAnnotations[1].status).toBe('active');
  });
});
