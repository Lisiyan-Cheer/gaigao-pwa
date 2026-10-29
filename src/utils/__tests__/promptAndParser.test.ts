import { describe, it, expect } from 'bun:test';
import { parseChapterContent } from '../chapterParser';
import { generateAIPrompt, buildAnnotatedContent } from '../promptGenerator';
import { Chapter } from '../../types';

describe('chapterParser', () => {
  it('correctly parses standard chapter titles and body', () => {
    const raw = `第010章 这特么是顶配战宠？！
三号焚化车间内，五道粗壮的紫色光柱渐渐敛去。
五个流淌着紫金光华的天骄礼盒，静静悬浮在半空中。`;

    const parsed = parseChapterContent(raw);
    expect(parsed.chapterNum).toBe('010');
    expect(parsed.title).toBe('第010章 这特么是顶配战宠？！');
    expect(parsed.body).toContain('三号焚化车间内');
  });

  it('correctly pads single digit chapter numbers', () => {
    const raw = `# 第3章_一瓶风油精干跪紫僵！\n正文内容开始`;
    const parsed = parseChapterContent(raw);
    expect(parsed.chapterNum).toBe('003');
    expect(parsed.title).toBe('第3章 一瓶风油精干跪紫僵！');
  });
});

describe('promptGenerator (Two-step Specification)', () => {
  const sampleChapter: Chapter = {
    id: 'test-1',
    bookName: '全民高武：只有我的商城能充冥币！',
    chapterNum: '010',
    title: '第010章 这特么是顶配战宠？！',
    content: '林凡抬手一剑，紫僵当场跪下。\n众人震惊不已。',
    annotations: [
      {
        id: 'ann-1',
        index: 1,
        text: '林凡抬手一剑，紫僵当场跪下。',
        startIndex: 0,
        endIndex: '林凡抬手一剑，紫僵当场跪下。'.length,
        comment: '太快了，补一个僵尸反扑的动作再跪。',
        status: 'active',
        createdAt: 1000,
      },
      {
        id: 'ann-2',
        index: 2,
        text: '众人震惊不已。',
        startIndex: '林凡抬手一剑，紫僵当场跪下。\n'.length,
        endIndex: '林凡抬手一剑，紫僵当场跪下。\n'.length + '众人震惊不已。'.length,
        comment: '换成具体人物的具体反应。',
        status: 'active',
        createdAt: 2000,
      },
    ],
    updatedAt: 1000,
    createdAt: 1000,
  };

  it('embeds circled numbers right behind annotated sentences in body', () => {
    const annotated = buildAnnotatedContent(sampleChapter);
    expect(annotated).toBe('林凡抬手一剑，紫僵当场跪下。①\n众人震惊不已。②');
  });

  it('generates the complete two-step prompt with correct sections', () => {
    const prompt = generateAIPrompt(sampleChapter);
    
    // Core requirements from plan
    expect(prompt).toContain('请更新《全民高武：只有我的商城能充冥币！》第010章，分两步进行：');
    expect(prompt).toContain('【第一步：先出修改方案，不要动文件】');
    expect(prompt).toContain('【第二步：等我确认后再改文件】');
    expect(prompt).toContain('【批注清单】');
    expect(prompt).toContain('① 原句：「林凡抬手一剑，紫僵当场跪下。」');
    expect(prompt).toContain('意见：太快了，补一个僵尸反扑的动作再跪。');
    expect(prompt).toContain('② 原句：「众人震惊不已。」');
    expect(prompt).toContain('意见：换成具体人物的具体反应。');
    expect(prompt).toContain('【修改后正文】');
    expect(prompt).toContain('林凡抬手一剑，紫僵当场跪下。①');
    expect(prompt).toContain('众人震惊不已。②');
  });
});
