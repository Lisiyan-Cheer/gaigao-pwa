import { get, set } from 'idb-keyval';
import { Chapter } from '../types';

const STORAGE_KEY_CHAPTERS = 'gaigao_chapters_v1';
const STORAGE_KEY_LAST_BOOK = 'gaigao_last_book_name';

const INITIAL_SAMPLE_CONTENT = `三号焚化车间内，五道粗壮的紫色光柱渐渐敛去。

五个流淌着紫金光华的天骄礼盒，静静悬浮在半空中。

江宇搓了搓手，上前一步，抬手点开了礼盒一的一阶·超凡战兵箱！

啪的一声，箱盖应声弹开！

箱口原本浮现着狙击枪与合金刀的虚影，忽然一阵闪烁模糊！

紧接着，脑海里炸响一道威严的提示音！

【检测到宿主身负唯一道士序列，装备自动置换为道门专属秘宝！】

轰！

一道刺目的紫金雷光从箱中冲天而起！

江宇顺势伸手一握，一柄三尺长、剑身镌刻着古老云雷纹的古朴长剑直接落入掌心。

剑锋轻轻一颤，丝丝缕缕的紫色雷弧便顺着剑刃噼啪炸响，震得空气都在发麻！

【五雷天师剑：一阶道门法剑，破邪增幅百分之三百，自带特效掌心引雷、斩尸诛邪！】

“好家伙，破邪增幅百分之三百？！”

江宇顺手拔剑出鞘，紫雷缠绕剑身，凌厉的雷罡瞬间横扫而出。

林凡抬手一剑，紫僵当场跪下。

众人震惊不已。

江宇看着瑟瑟发抖的紫僵，嘴角露出一抹满意的笑容。这趟城北火葬场，来得真值！`;

const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'sample-010',
    bookName: '全民高武：只有我的商城能充冥币！',
    chapterNum: '010',
    title: '第010章 这特么是顶配战宠？！',
    content: INITIAL_SAMPLE_CONTENT,
    annotations: [
      {
        id: 'ann-1',
        index: 1,
        text: '林凡抬手一剑，紫僵当场跪下。',
        startIndex: INITIAL_SAMPLE_CONTENT.indexOf('林凡抬手一剑，紫僵当场跪下。'),
        endIndex: INITIAL_SAMPLE_CONTENT.indexOf('林凡抬手一剑，紫僵当场跪下。') + '林凡抬手一剑，紫僵当场跪下。'.length,
        comment: '太快了，补一个僵尸反扑的动作再跪。',
        status: 'active',
        createdAt: Date.now() - 3600000,
      },
      {
        id: 'ann-2',
        index: 2,
        text: '众人震惊不已。',
        startIndex: INITIAL_SAMPLE_CONTENT.indexOf('众人震惊不已。'),
        endIndex: INITIAL_SAMPLE_CONTENT.indexOf('众人震惊不已。') + '众人震惊不已。'.length,
        comment: '换成具体人物的具体反应，不要用干巴巴的教案体。',
        status: 'active',
        createdAt: Date.now() - 1800000,
      },
    ],
    updatedAt: Date.now(),
    createdAt: Date.now(),
  },
];

export async function getChapters(): Promise<Chapter[]> {
  try {
    const chapters = await get<Chapter[]>(STORAGE_KEY_CHAPTERS);
    if (chapters && chapters.length > 0) {
      return chapters;
    }
  } catch (err) {
    console.warn('Failed reading from IndexedDB, trying localStorage:', err);
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(STORAGE_KEY_CHAPTERS);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }

  // If completely new, initialize with sample chapter
  await saveAllChapters(INITIAL_CHAPTERS);
  return INITIAL_CHAPTERS;
}

export async function saveAllChapters(chapters: Chapter[]): Promise<void> {
  try {
    await set(STORAGE_KEY_CHAPTERS, chapters);
  } catch (err) {
    console.error('Failed writing to IndexedDB:', err);
  }
  try {
    localStorage.setItem(STORAGE_KEY_CHAPTERS, JSON.stringify(chapters));
  } catch (err) {
    console.warn('Failed writing to localStorage:', err);
  }
}

export async function saveChapter(chapter: Chapter): Promise<void> {
  const chapters = await getChapters();
  const existingIdx = chapters.findIndex((c) => c.id === chapter.id);
  const updatedChapter = { ...chapter, updatedAt: Date.now() };

  let updatedList: Chapter[];
  if (existingIdx >= 0) {
    updatedList = [...chapters];
    updatedList[existingIdx] = updatedChapter;
  } else {
    updatedList = [updatedChapter, ...chapters];
  }

  await saveAllChapters(updatedList);
  if (chapter.bookName) {
    await setLastBookName(chapter.bookName);
  }
}

export async function deleteChapter(id: string): Promise<void> {
  const chapters = await getChapters();
  const filtered = chapters.filter((c) => c.id !== id);
  await saveAllChapters(filtered);
}

export async function getChapter(id: string): Promise<Chapter | undefined> {
  const chapters = await getChapters();
  return chapters.find((c) => c.id === id);
}

export async function getLastBookName(): Promise<string> {
  try {
    const name = await get<string>(STORAGE_KEY_LAST_BOOK);
    if (name) return name;
  } catch {
    // ignore
  }
  return localStorage.getItem(STORAGE_KEY_LAST_BOOK) || '全民高武：只有我的商城能充冥币！';
}

export async function setLastBookName(name: string): Promise<void> {
  try {
    await set(STORAGE_KEY_LAST_BOOK, name);
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY_LAST_BOOK, name);
}

export async function exportAllData(): Promise<string> {
  const chapters = await getChapters();
  const lastBook = await getLastBookName();
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    lastBookName: lastBook,
    chapters,
  }, null, 2);
}

export async function importData(jsonStr: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonStr);
    if (data && Array.isArray(data.chapters)) {
      await saveAllChapters(data.chapters);
      if (data.lastBookName) {
        await setLastBookName(data.lastBookName);
      }
      return true;
    }
  } catch (err) {
    console.error('Failed importing data:', err);
  }
  return false;
}
