import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Copy, 
  MessageSquare, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  Undo2,
  Redo2
} from 'lucide-react';
import { Chapter, Annotation } from '../../types';
import { CamouflageMode } from '../../types/camouflage';
import { computeTextMetrics } from '../../utils/wordCount';
import { formatNovelAndRemapAnnotations } from '../../utils/novelFormatter';
import { useHistory } from '../../utils/useHistory';
import { WordCountModal } from '../WordCountModal';
import { AnnotationSheet } from '../AnnotationSheet';
import { AnnotationListSheet } from '../AnnotationListSheet';
import { ExportModal } from '../ExportModal';

interface GoooodEditorProps {
  chapter: Chapter;
  allChapters: Chapter[];
  onSelectChapter: (chapter: Chapter) => void;
  onSaveChapter: (updated: Chapter) => void;
  onBack: () => void;
  onSwitchMode: (mode: CamouflageMode) => void;
  onTriggerPanic: () => void;
}

interface GoooodArticle {
  id: string;
  title: string;
  subtitle: string;
  kicker: string;
  category: string;
  img: string;
  date: string;
  location: string;
}

const GOOOOD_ARTICLES: GoooodArticle[] = [
  {
    id: 'art-1',
    title: '校园里的迴转山谷：溧阳六中二期建设工程，江苏 / 东南大学建筑设计研究院ATA工作室',
    subtitle: '老围墙外生长出的“迴转山谷”，连接新旧校园与城市公共界面',
    kicker: '建筑 / 校园营造',
    category: '建筑',
    img: 'https://oss.gooood.cn/uploads/2026/10/00-gooood-interview-Yang-Dingliang%E7%9A%84%E5%89%AF%E6%9C%AC_%E5%89%AF%E6%9C%AC-gsj-472x303.png',
    date: '2026.10.29',
    location: '江苏 · 溧阳',
  },
  {
    id: 'art-2',
    title: '中关村高端医疗器械产业园（二期），北京 / 北京市工业设计研究院有限公司',
    subtitle: '“模数建构”与“园院共构”相生，打造现代研发生态聚落',
    kicker: '建筑 / 产业园区',
    category: '建筑',
    img: 'https://oss.gooood.cn/uploads/2026/10/01-aah-472x303.jpg',
    date: '2026.10.29',
    location: '北京 · 大兴',
  },
  {
    id: 'art-3',
    title: 'BIG主导设计的美国六月节国家博物馆建设迎来重要进展',
    subtitle: '迈向更加公正未来的愿景，折板屋面与公共漫游动线贯通城市',
    kicker: '建筑 / 文化博览',
    category: '建筑',
    img: 'https://oss.gooood.cn/uploads/2026/10/001-ixz-472x303.jpg',
    date: '2026.10.29',
    location: '美国 · 沃斯堡',
  },
  {
    id: 'art-4',
    title: 'PRISMA新嘉中心景观设计，上海 / PLAND博度景观设计',
    subtitle: '在43万平方米商业体脚下铺开柔软地表，消解生硬边界与高差',
    kicker: '景观 / 城市公共空间',
    category: '景观',
    img: 'https://oss.gooood.cn/uploads/2026/10/00-gooood-interview-Yang-Dingliang%E7%9A%84%E5%89%AF%E6%9C%AC_%E5%89%AF%E6%9C%AC-dcc-472x303.png',
    date: '2026.10.29',
    location: '上海 · 嘉定',
  },
  {
    id: 'art-5',
    title: '寿城延绵数字媒体艺术馆，韩国 / 奥雷·舍人事务所',
    subtitle: '从自然景观渐变至数字世界，多维立体的流线编织公共艺术漫游',
    kicker: '建筑 / 艺术空间',
    category: '建筑',
    img: 'https://oss.gooood.cn/uploads/2026/10/00-gooood-interview-Yang-Dingliang%E7%9A%84%E5%89%AF%E6%9C%AC_%E5%89%AF%E6%9C%AC-30m-472x303.png',
    date: '2026.10.29',
    location: '韩国 · 大邱',
  },
  {
    id: 'art-6',
    title: '毕尔巴鄂巴斯克博物馆改造，西班牙 / VAILLO + ARCHITECTS',
    subtitle: '让历史建筑群重获整体性，当代材料与古老夯土砖石的深层对话',
    kicker: '改造 / 历史建筑',
    category: '改造',
    img: 'https://oss.gooood.cn/uploads/2026/10/002-472x303.jpg',
    date: '2026.10.29',
    location: '西班牙 · 毕尔巴鄂',
  },
  {
    id: 'art-7',
    title: '西日の長屋，札幌 / Yoshichika Takagi',
    subtitle: '金色与深海般的暮色，极简木构长屋的自然天光与庭院诗篇',
    kicker: '建筑 / 居住空间',
    category: '建筑',
    img: 'https://oss.gooood.cn/uploads/2026/10/nishihi-nagaya-cover-472x303.jpg',
    date: '2026.10.29',
    location: '日本 · 札幌',
  },
  {
    id: 'art-8',
    title: 'SIMOSE美术馆与旅馆，广岛 / 坂茂建築設計',
    subtitle: '漂浮于濑户内海畔的八个彩色可移动玻璃展厅与纸筒结构',
    kicker: '建筑 / 美术馆',
    category: '建筑',
    img: 'https://oss.gooood.cn/uploads/2026/10/2-y9j-472x303.jpg',
    date: '2026.10.29',
    location: '日本 · 广岛',
  },
  {
    id: 'art-9',
    title: '《Building》公共艺术装置，杭州 / 大星吉子工作室',
    subtitle: '模块化单元的建构游戏，激发市民互动探索与光影捕捉',
    kicker: '艺术 / 空间装置',
    category: '艺术',
    img: 'https://oss.gooood.cn/uploads/2026/10/bdj-cover-472x303.jpg',
    date: '2026.10.28',
    location: '浙江 · 杭州',
  },
  {
    id: 'art-10',
    title: '桐庐十二拱堂，杭州 / SpActrum谱观',
    subtitle: '拱，作为去古典化的“社会雕塑”与乡野社区精神容器',
    kicker: '建筑 / 乡村营造',
    category: '乡村',
    img: 'https://oss.gooood.cn/uploads/2026/10/01-ntz-472x303.jpg',
    date: '2026.10.28',
    location: '浙江 · 桐庐',
  },
  {
    id: 'art-11',
    title: 'KŌNG胶东小馆，北京 / odd设计事务所',
    subtitle: '营造“渔舟灯火”的悠然意境与暖调红砖沉浸体验',
    kicker: '室内 / 餐饮空间',
    category: '室内',
    img: 'https://oss.gooood.cn/uploads/2026/10/00-gooood-interview-Yang-Dingliang%E7%9A%84%E5%89%AF%E6%9C%AC_%E5%89%AF%E6%9C%AC-xvp-472x303.png',
    date: '2026.10.28',
    location: '北京 · 朝阳',
  },
  {
    id: 'art-12',
    title: '赤坂GREEN CROSS，东京 / 日建设计',
    subtitle: '拥有开放型绿色公共中庭与立体连廊的超高层都市综合体',
    kicker: '建筑 / 综合办公',
    category: '建筑',
    img: 'https://oss.gooood.cn/uploads/2026/10/00-gooood-interview-Yang-Dingliang%E7%9A%84%E5%89%AF%E6%9C%AC_%E5%89%AF%E6%9C%AC-jjy-472x303.png',
    date: '2026.10.28',
    location: '日本 · 东京',
  },
  {
    id: 'art-13',
    title: '单农苏州仓街店，苏州 / 亘建筑事务所',
    subtitle: '从衣服与身体的接触出发，探索微水泥与柔光界面的共生',
    kicker: '室内 / 商业零售',
    category: '室内',
    img: 'https://oss.gooood.cn/uploads/2026/10/2-bpj-472x303.jpg',
    date: '2026.10.28',
    location: '江苏 · 苏州',
  },
  {
    id: 'art-14',
    title: '大乐之野 · 松阳 + 小后青山客栈，浙江 / 空间营造建筑事务所',
    subtitle: '夯土、青石与老木梁的再造，唤醒浙南深山古村落的诗意隐居',
    kicker: '建筑 / 民宿酒店',
    category: '乡村',
    img: 'https://oss.gooood.cn/uploads/2026/04/odd-ppt-拷贝.jpg',
    date: '2026.10.28',
    location: '浙江 · 丽水',
  },
];

export const GoooodEditor: React.FC<GoooodEditorProps> = ({
  chapter,
  allChapters,
  onSelectChapter,
  onSaveChapter,
  onBack,
  onSwitchMode,
  onTriggerPanic,
}) => {
  const [content, setContent] = useState(chapter.content);
  const [annotations, setAnnotations] = useState<Annotation[]>(chapter.annotations || []);
  const [sidebarWidth, setSidebarWidth] = useState<'normal' | 'wide' | 'ultra'>('wide');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const displayedArticles = useMemo(() => {
    if (selectedCategory === '全部') return GOOOOD_ARTICLES;
    const filtered = GOOOOD_ARTICLES.filter(
      (a) => a.category === selectedCategory || a.kicker.includes(selectedCategory)
    );
    return filtered.length > 0 ? filtered : GOOOOD_ARTICLES;
  }, [selectedCategory]);

  // History Stack (返回 / 前进)
  const { pushSnapshot, undo, redo, canUndo, canRedo } = useHistory(
    chapter.content,
    chapter.annotations || []
  );

  useEffect(() => {
    setContent(chapter.content);
    setAnnotations(chapter.annotations || []);
  }, [chapter.id]);

  // Modals
  const [isWordCountOpen, setIsWordCountOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isListSheetOpen, setIsListSheetOpen] = useState(false);
  const [activeSheetAnn, setActiveSheetAnn] = useState<{
    isOpen: boolean;
    index: number;
    quotedText: string;
    comment: string;
    isExisting: boolean;
    annId?: string;
  }>({
    isOpen: false,
    index: 1,
    quotedText: '',
    comment: '',
    isExisting: false,
  });

  const [selection, setSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const metrics = useMemo(() => computeTextMetrics(content), [content]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUndo = useCallback(() => {
    const prev = undo();
    if (prev) {
      setContent(prev.content);
      setAnnotations(prev.annotations);
      onSaveChapter({
        ...chapter,
        content: prev.content,
        annotations: prev.annotations,
        updatedAt: Date.now(),
      });
      showToast('↶ 已返回 (撤销上一操作)');
    }
  }, [undo, chapter, onSaveChapter]);

  const handleRedo = useCallback(() => {
    const next = redo();
    if (next) {
      setContent(next.content);
      setAnnotations(next.annotations);
      onSaveChapter({
        ...chapter,
        content: next.content,
        annotations: next.annotations,
        updatedAt: Date.now(),
      });
      showToast('↷ 已前进 (恢复重做)');
    }
  }, [redo, chapter, onSaveChapter]);

  // Global Keyboard Shortcuts (Cmd+Z / Cmd+Shift+Z / Ctrl+Y / ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onTriggerPanic();
        return;
      }

      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isModifier = isMac ? e.metaKey : e.ctrlKey;

      if (isModifier && !e.altKey) {
        if (e.key.toLowerCase() === 'z') {
          if (e.shiftKey) {
            e.preventDefault();
            handleRedo();
          } else {
            e.preventDefault();
            handleUndo();
          }
        } else if (e.key.toLowerCase() === 'y' && !isMac) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, onTriggerPanic]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setContent(nextVal);
    pushSnapshot(nextVal, annotations);
    onSaveChapter({
      ...chapter,
      content: nextVal,
      annotations,
      updatedAt: Date.now(),
    });
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) {
      const sub = el.value.substring(start, end).trim();
      if (sub.length > 0) {
        setSelection({ text: sub, start, end });
        return;
      }
    }
    setSelection(null);
  };

  const handleFormat = () => {
    const { formattedContent, updatedAnnotations } = formatNovelAndRemapAnnotations(content, annotations);
    setContent(formattedContent);
    setAnnotations(updatedAnnotations);
    pushSnapshot(formattedContent, updatedAnnotations, true);
    onSaveChapter({ ...chapter, content: formattedContent, annotations: updatedAnnotations, updatedAt: Date.now() });
    showToast('✨ 文本排版已优化（规范首尾空格与空行）');
  };

  const handleAnnotate = () => {
    if (!selection) return;
    const nextIndex = annotations.length > 0 ? Math.max(...annotations.map((a) => a.index)) + 1 : 1;
    setActiveSheetAnn({
      isOpen: true,
      index: nextIndex,
      quotedText: selection.text,
      comment: '',
      isExisting: false,
    });
  };

  const sidebarWidthClass = {
    normal: 'w-[340px]',
    wide: 'w-[420px]',
    ultra: 'w-[520px]',
  }[sidebarWidth];

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#333333] font-sans select-none flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0084c8] text-white text-xs px-4 py-2 rounded-full shadow-xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. gooood.cn Header Top Bar (1:1 Exact Match)                  */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e7edf2] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1360px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Left Navigation */}
          <div className="flex items-center gap-7">
            {/* gooood Logo */}
            <div 
              onClick={onBack}
              className="text-[#0084c8] font-bold text-[34px] tracking-[-1.5px] cursor-pointer leading-none flex items-center select-none"
              title="谷德设计网 gooood"
            >
              gooood
            </div>

            {/* Nav Menu */}
            <nav className="hidden lg:flex items-center gap-5 text-[14px] text-[#333333] font-normal">
              <span className="text-[#0084c8] font-semibold cursor-pointer">首页</span>
              <span className="flex items-center gap-0.5 hover:text-[#0084c8] cursor-pointer">
                专辑 <ChevronDown className="w-3 h-3 text-[#999]" />
              </span>
              <span className="flex items-center gap-0.5 hover:text-[#0084c8] cursor-pointer">
                分类 <ChevronDown className="w-3 h-3 text-[#999]" />
              </span>
              <span className="hover:text-[#0084c8] cursor-pointer">关于谷德</span>
              <span className="hover:text-[#0084c8] cursor-pointer">投稿与推广</span>
              <span className="flex items-center gap-0.5 hover:text-[#0084c8] cursor-pointer">
                工作/招聘 <ChevronDown className="w-3 h-3 text-[#999]" />
              </span>
              <span className="flex items-center gap-0.5 hover:text-[#0084c8] cursor-pointer">
                其他服务 <ChevronDown className="w-3 h-3 text-[#999]" />
              </span>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4 text-xs text-[#666666]">
            <span className="cursor-pointer hover:text-[#0084c8]">En</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f4f7fa] rounded-full border border-[#e1e8ed] text-xs text-[#888]">
              <Search className="w-3.5 h-3.5 text-[#999]" />
              <span className="hidden sm:inline">搜索项目、招聘、事务所</span>
            </div>
            <span className="cursor-pointer hover:text-[#0084c8] hidden sm:inline">会员/登录</span>

            {/* Camouflage & Mode Switcher Tools */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#e7edf2]">
              <button
                type="button"
                onClick={() => onSwitchMode('normal')}
                className="px-2 py-1 rounded bg-[#f0f4f8] hover:bg-[#e1eaf2] text-[#0084c8] font-medium text-xs transition"
                title="切换回普通小说写作模式"
              >
                退出伪装
              </button>
              <button
                type="button"
                onClick={() => onSwitchMode('archiposition')}
                className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs border border-stone-300 transition hidden sm:inline"
                title="切换为有方建筑项目正文模式（夹在项目正文图文中）"
              >
                🏛️ 有方正文版
              </button>
              <button
                type="button"
                onClick={onTriggerPanic}
                className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium text-xs border border-rose-200 transition"
                title="紧急老板键：一键遮罩为客栈案例 (快捷键 ESC)"
              >
                🚨 老板键 (ESC)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. Main Page Body (Left gooood Articles + Right Ad Slot Novel) */}
      {/* ============================================================== */}
      <main className="max-w-[1360px] mx-auto px-4 py-5 flex-1 w-full flex flex-col lg:flex-row gap-6">
        
        {/* ------------------------------------------------------------ */}
        {/* Left Column: Authentic gooood Architectural Content           */}
        {/* ------------------------------------------------------------ */}
        <section className="flex-1 min-w-0 space-y-6">
          {/* Top Banner (找人才 找工作 来谷德招聘) */}
          <div className="relative rounded-lg overflow-hidden border border-[#d2dee8] bg-[#f8fbfd] p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#0084c8] text-white">
                谷德推荐专题
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#112233] leading-tight">
                空间叙事与城市肌理重塑 · 2026 建筑青年领军人物研讨
              </h2>
              <p className="text-xs sm:text-sm text-[#667788] max-w-xl">
                汇聚国内外一线建筑设计机构与学术先锋，剖析在地化建造、存量改造与自然共生之实践路径。
              </p>
            </div>
            <div className="hidden sm:block w-36 h-24 rounded bg-gradient-to-tr from-sky-100 to-blue-200 border border-sky-300/40 p-2 text-center text-xs text-[#006cad] font-semibold flex-col justify-center items-center">
              <div className="text-2xl mb-1">🏛️</div>
              <span>谷德招聘与专栏</span>
            </div>
          </div>

          {/* Blue Section: 文章项目推广 */}
          <div className="bg-[#19436d] text-white rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-3 py-1.5 rounded font-bold text-sm">
                文章项目推广
              </div>
              <div className="text-xs text-white/80">
                中英双语与全网深度发布 · 建筑 / 景观 / 室内 / 艺术推广
              </div>
            </div>
            <div className="text-xs text-sky-200 flex items-center gap-4">
              <span>万社设计咨询</span>
              <span>小大建筑设计事务所</span>
              <span>CAA建筑事务所</span>
            </div>
          </div>

          {/* Latest Works Strip */}
          <div className="border border-[#e7edf2] bg-white rounded-lg p-3 text-xs flex items-center justify-between text-[#555]">
            <div className="flex items-center gap-2 font-bold text-[#333]">
              <span>最新工作</span>
              <span className="text-[#0084c8] font-normal cursor-pointer">+提交新工作</span>
            </div>
            <div className="hidden md:flex items-center gap-5 text-[#666] truncate max-w-xl">
              <span className="hover:text-[#0084c8] cursor-pointer">(北京) CAA建筑事务所 · 主创建筑师</span>
              <span className="hover:text-[#0084c8] cursor-pointer">(杭州) Common Wonder · 室内设计师</span>
              <span className="hover:text-[#0084c8] cursor-pointer">(深圳) MENG ARCHITECTS · 助理建筑师</span>
            </div>
            <span className="text-[#0084c8] cursor-pointer shrink-0">所有工作 →</span>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-between border-b border-[#e7edf2] pb-2 text-xs">
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar font-medium text-[#556677]">
              {['全部', '建筑', '景观', '室内', '改造', '乡村', '艺术'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`pb-1 transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'text-[#0084c8] font-bold border-b-2 border-[#0084c8]'
                      : 'hover:text-[#0084c8]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-[#8899aa] shrink-0 hidden sm:block">
              共 1,842 个精选建成项目
            </div>
          </div>

          {/* Architecture Articles Grid (Rich & Fully Populated) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {displayedArticles.map((art) => (
              <article 
                key={art.id}
                className="border border-[#e7edf2] bg-white rounded-lg overflow-hidden hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-slate-100 relative overflow-hidden group">
                    <img 
                      src={art.img} 
                      alt={art.title} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/65 text-white text-[10px] font-medium backdrop-blur-sm">
                      {art.kicker}
                    </div>
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <h3 className="font-bold text-sm text-[#222] hover:text-[#0084c8] cursor-pointer line-clamp-1 leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#777] line-clamp-2 leading-relaxed">
                      {art.subtitle}
                    </p>
                  </div>
                </div>
                <div className="px-3.5 pb-3 text-[11px] text-[#999] pt-1.5 border-t border-[#f0f3f6] flex justify-between items-center">
                  <span>{art.location}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#bbb]">{art.date}</span>
                    <span className="hover:text-[#0084c8] cursor-pointer">收藏</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1.5 pt-4 pb-6 text-xs font-medium text-[#556677]">
            <span className="px-2.5 py-1 rounded border border-[#dce5ed] bg-white text-[#bbb] cursor-not-allowed">«</span>
            <span className="px-3 py-1 rounded bg-[#0084c8] text-white font-bold">1</span>
            <span className="px-3 py-1 rounded border border-[#dce5ed] bg-white hover:bg-[#f0f6fa] hover:text-[#0084c8] cursor-pointer">2</span>
            <span className="px-3 py-1 rounded border border-[#dce5ed] bg-white hover:bg-[#f0f6fa] hover:text-[#0084c8] cursor-pointer">3</span>
            <span className="px-2 py-1 text-[#aaa]">...</span>
            <span className="px-3 py-1 rounded border border-[#dce5ed] bg-white hover:bg-[#f0f6fa] hover:text-[#0084c8] cursor-pointer">48</span>
            <span className="px-2.5 py-1 rounded border border-[#dce5ed] bg-white hover:bg-[#f0f6fa] hover:text-[#0084c8] cursor-pointer">»</span>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* Right Column: gooood Sidebar + THE NOVEL EDITOR (IN AD SLOT)  */}
        {/* ------------------------------------------------------------ */}
        <aside className={`${sidebarWidthClass} transition-all duration-300 shrink-0 space-y-4`}>
          
          {/* Box 1: 最新专辑 (Top Sidebar Widget) */}
          <div className="bg-white border border-[#e7edf2] rounded-lg p-3 text-xs">
            <div className="flex items-center justify-between font-bold text-[#222] pb-2 border-b border-[#f0f3f6] mb-2.5">
              <span>最新专辑</span>
              <span className="text-[#0084c8] font-normal cursor-pointer text-[11px]">全部 →</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 hover:text-[#0084c8] cursor-pointer">
                <div className="w-12 h-8 rounded bg-sky-100 shrink-0 overflow-hidden text-[9px] flex items-center justify-center text-sky-700 font-bold">
                  GCC
                </div>
                <span className="truncate">日常出口没报到：GCC 版本超总结</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#0084c8] cursor-pointer">
                <div className="w-12 h-8 rounded bg-amber-100 shrink-0 overflow-hidden text-[9px] flex items-center justify-center text-amber-700 font-bold">
                  CITY
                </div>
                <span className="truncate">每个人 × 北京城市图书馆论述</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* THE MASTER CAMOUFLAGE EDITOR (伪装在右边广告推广展位中)    */}
          {/* ======================================================== */}
          <div className="bg-white border-2 border-[#0084c8]/30 rounded-xl shadow-md overflow-hidden flex flex-col transition-all">
            {/* Disguised Card Header */}
            <div className="bg-[#f2f8fc] border-b border-[#d8e8f4] px-3.5 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="px-1.5 py-0.5 rounded bg-[#0084c8] text-white text-[10px] font-bold shrink-0">
                  AD 推广
                </span>
                <span className="font-bold text-xs text-[#075d93] truncate">
                  谷德设计手记 · 空间设计说明草案
                </span>
              </div>

              {/* Adjust Width Pill */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    if (sidebarWidth === 'normal') setSidebarWidth('wide');
                    else if (sidebarWidth === 'wide') setSidebarWidth('ultra');
                    else setSidebarWidth('normal');
                  }}
                  className="p-1 text-[#6688aa] hover:text-[#0084c8] rounded"
                  title="调节右侧边栏编辑宽度 (紧凑 340px / 舒适 420px / 宽屏 520px)"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Subtle Chapter Selector & Toolbar */}
            <div className="px-3 py-1.5 bg-[#fafcfd] border-b border-[#eef4f8] flex items-center justify-between text-xs text-[#555]">
              {/* Chapter Dropdown */}
              <select
                value={chapter.id}
                onChange={(e) => {
                  const target = allChapters.find((c) => c.id === e.target.value);
                  if (target) onSelectChapter(target);
                }}
                className="bg-transparent font-medium text-[#333] hover:text-[#0084c8] focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                {allChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.chapterNum || '001'} - {ch.title.replace(/第.*?[章_]/, '').slice(0, 12)}
                  </option>
                ))}
              </select>

              {/* Functional Pills */}
              <div className="flex items-center gap-1.5">
                {/* Undo / Redo (返回 / 前进) */}
                <div className="flex items-center gap-0.5 bg-[#edf4f9] p-0.5 rounded border border-[#d8e6f0]">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent text-[#446688] transition"
                    title="返回 (撤销上一操作 Cmd+Z)"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent text-[#446688] transition"
                    title="前进 (恢复重做 Cmd+Shift+Z)"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Word Count (Disguised) */}
                <button
                  type="button"
                  onClick={() => setIsWordCountOpen(true)}
                  className="px-2 py-0.5 rounded bg-[#e8f2f8] text-[#006cad] font-semibold text-[11px] hover:bg-[#d8eaf4] transition"
                  title="点击查看精确字数分析"
                >
                  {metrics.charsNoSpaces.toLocaleString()} 字
                </button>

                {/* Format Button */}
                <button
                  type="button"
                  onClick={handleFormat}
                  className="p-1 text-[#666] hover:text-[#0084c8] rounded hover:bg-[#edf4f9] transition"
                  title="小说一键排版（清除首尾空格、压缩空行）"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </button>

                {/* Generate AI Prompt */}
                <button
                  type="button"
                  onClick={() => setIsExportOpen(true)}
                  className="px-2 py-0.5 rounded bg-[#0084c8] hover:bg-[#0074b0] text-white font-medium text-[11px] shadow-sm flex items-center gap-1 transition"
                  title="生成 AI 改稿指令（严格两步法）"
                >
                  <Copy className="w-3 h-3" />
                  <span>导出指令</span>
                </button>
              </div>
            </div>

            {/* Editor Textarea with gooood Typography */}
            <div className="relative p-3 bg-white">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onSelect={handleSelect}
                placeholder="在此直接输入或修改正文（完全融入谷德右侧设计手记展位中）..."
                spellCheck={false}
                rows={18}
                className="w-full text-xs sm:text-sm font-sans leading-[1.8] text-[#222222] bg-transparent resize-y focus:outline-none placeholder-slate-300 selection:bg-[#0084c8]/20"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
                }}
              />

              {/* Floating Annotation pill right on top of selected text */}
              {selection && (
                <div className="absolute bottom-4 right-4 z-40 animate-fade-in">
                  <button
                    type="button"
                    onClick={handleAnnotate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0084c8] text-white font-semibold text-xs shadow-xl hover:bg-[#0074b0] active:scale-95 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>💬 批注所选 ({selection.text.length}字)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="px-3 py-1.5 bg-[#f8fafc] border-t border-[#edf2f6] text-[11px] text-[#8899aa] flex items-center justify-between">
              <span 
                className="cursor-pointer hover:text-[#0084c8] flex items-center gap-1"
                onClick={() => setIsListSheetOpen(true)}
              >
                <MessageSquare className="w-3 h-3 text-amber-500" />
                <span>待办批注 ({annotations.length})</span>
              </span>
              <span>谷德推广专栏 · 已自动实时存盘</span>
            </div>
          </div>

          {/* Box 3: 7 天最热 (Authentic gooood Widget) */}
          <div className="bg-white border border-[#e7edf2] rounded-lg p-3.5 text-xs space-y-2">
            <div className="font-bold text-[#222] pb-1.5 border-b border-[#f0f3f6]">
              7 天最热
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 hover:text-[#0084c8] cursor-pointer">
                <span className="font-bold text-[#0084c8] text-sm">01</span>
                <span className="line-clamp-1 leading-snug">大乐之野 · 松阳 + 小后青山民宿客栈店，浙江 / 空间建筑</span>
              </div>
              <div className="flex items-start gap-2 hover:text-[#0084c8] cursor-pointer">
                <span className="font-bold text-[#0084c8] text-sm">02</span>
                <span className="line-clamp-1 leading-snug">北京1733商业空间提升 / 拾集建筑</span>
              </div>
              <div className="flex items-start gap-2 hover:text-[#0084c8] cursor-pointer">
                <span className="font-bold text-[#0084c8] text-sm">03</span>
                <span className="line-clamp-1 leading-snug">旧厂新序——时装工厂店立面改造，浙江桐乡 / 森上建筑</span>
              </div>
              <div className="flex items-start gap-2 hover:text-[#0084c8] cursor-pointer">
                <span className="font-bold text-[#777] text-sm">04</span>
                <span className="line-clamp-1 leading-snug">沧月茶空间，杭州 / 赋夕视觉工作室</span>
              </div>
              <div className="flex items-start gap-2 hover:text-[#0084c8] cursor-pointer">
                <span className="font-bold text-[#777] text-sm">05</span>
                <span className="line-clamp-1 leading-snug">深圳南山万象城二期 / IFG伊洛莱茨建筑设计</span>
              </div>
            </div>
          </div>

          {/* Box 4: 最新工作 购买招聘 */}
          <div className="bg-white border border-[#e7edf2] rounded-lg p-3 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-[#222] pb-1 border-b border-[#f0f3f6]">
              <span>最新工作</span>
              <span className="text-[#0084c8] font-normal cursor-pointer text-[11px]">购买招聘 →</span>
            </div>
            <div className="p-2.5 rounded bg-[#f7f9fb] border border-[#e8edf2] space-y-1">
              <div className="font-bold text-[#333] truncate">(北京) CAA建筑事务所</div>
              <div className="text-[11px] text-[#777] truncate">资深室内设计师 / 媒体专员</div>
            </div>
            <div className="p-2.5 rounded bg-[#f7f9fb] border border-[#e8edf2] space-y-1">
              <div className="font-bold text-[#333] truncate">(上海) PLPL | Philip Liao & Partners</div>
              <div className="text-[11px] text-[#777] truncate">建筑主创 / 方案助理</div>
            </div>
          </div>
        </aside>
      </main>

      {/* 4. gooood.cn Authentic Footer */}
      <footer className="mt-12 border-t border-[#e1e9ef] bg-white py-8 text-xs text-[#778899]">
        <div className="max-w-[1360px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="text-[#0084c8] font-bold text-2xl tracking-tighter">gooood</span>
            <span className="hidden sm:inline text-xs text-[#8899aa]">
              关于谷德 | 投稿与推广 | 购买招聘 | 法律声明 | 隐私政策 | 联系我们
            </span>
          </div>
          <div className="text-center md:text-right text-[11px] text-[#99aabb]">
            <div>Copyright © 2010-2026 gooood.cn 谷德设计网 All Rights Reserved.</div>
            <div>京ICP备12015099号-1 · 建筑·景观·室内·艺术·设计媒体</div>
          </div>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* 3. Modals & Sheets (Functional Guarantee)                      */}
      {/* ============================================================== */}
      <WordCountModal
        isOpen={isWordCountOpen}
        onClose={() => setIsWordCountOpen(false)}
        metrics={metrics}
        chapterTitle={chapter.title}
      />

      <AnnotationSheet
        isOpen={activeSheetAnn.isOpen}
        onClose={() => setActiveSheetAnn((prev) => ({ ...prev, isOpen: false }))}
        index={activeSheetAnn.index}
        quotedText={activeSheetAnn.quotedText}
        initialComment={activeSheetAnn.comment}
        isExisting={activeSheetAnn.isExisting}
        onSave={(comment) => {
          const newAnn: Annotation = {
            id: `ann-${Date.now()}`,
            index: activeSheetAnn.index,
            text: activeSheetAnn.quotedText,
            startIndex: selection?.start || 0,
            endIndex: selection?.end || activeSheetAnn.quotedText.length,
            comment,
            status: 'active',
            createdAt: Date.now(),
          };
          const next = [...annotations, newAnn];
          setAnnotations(next);
          pushSnapshot(content, next, true);
          onSaveChapter({ ...chapter, content, annotations: next, updatedAt: Date.now() });
          setSelection(null);
        }}
      />

      <AnnotationListSheet
        isOpen={isListSheetOpen}
        onClose={() => setIsListSheetOpen(false)}
        annotations={annotations}
        onSelectAnnotation={() => {}}
        onEditAnnotation={() => {}}
        onDeleteAnnotation={(id) => {
          const next = annotations.filter((a) => a.id !== id);
          setAnnotations(next);
          pushSnapshot(content, next, true);
          onSaveChapter({ ...chapter, content, annotations: next, updatedAt: Date.now() });
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        chapter={{ ...chapter, content, annotations }}
      />
    </div>
  );
};
