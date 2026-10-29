import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Copy, 
  Search, 
  Undo2, 
  Redo2, 
  Share2, 
  Bookmark, 
  Heart, 
  Type,
  Plus
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

interface ArchipositionEditorProps {
  chapter: Chapter;
  allChapters: Chapter[];
  onSelectChapter: (chapter: Chapter) => void;
  onSaveChapter: (updated: Chapter) => void;
  onBack: () => void;
  onSwitchMode: (mode: CamouflageMode) => void;
  onTriggerPanic: () => void;
}

interface TextBlock {
  id: string;
  text: string;
}

const ARCH_PHOTOS = [
  {
    src: 'hero.png',
    caption: '▲ 建筑西立面全景与自然光影 © 存在建筑',
    alt: '普洛斯湾区西部智慧产业园-A16 建筑西立面全景',
  },
  {
    src: 'axonometric.png',
    caption: '▲ 空间生成与立体漫游轴测分析图 © JJP',
    alt: '空间生成与立体漫游轴测分析图',
  },
  {
    src: 'aerial.png',
    caption: '▲ 园区整体规划生成与空间体量推演 © JJP',
    alt: '园区整体规划生成与空间体量推演',
  },
  {
    src: 'interior.png',
    caption: '▲ 中庭通高采光井与多功能共享阶梯 © 存在建筑',
    alt: '中庭通高采光井与多功能共享阶梯',
  },
  {
    src: 'drawing.png',
    caption: '▲ 首层功能分区与公共动线规划平面图 © JJP',
    alt: '首层功能分区与公共动线规划平面图',
  },
  {
    src: 'detail.png',
    caption: '▲ 遮阳表皮双层金属网构造节点大样与安装剖面 © JJP',
    alt: '遮阳表皮双层金属网构造节点大样与安装剖面',
  },
];

// Split content by paragraphs into natural reading blocks
function splitContentIntoBlocks(content: string, paragraphsPerBlock = 3): TextBlock[] {
  const rawParagraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (rawParagraphs.length === 0) {
    return [{ id: 'block-0', text: content }];
  }

  const blocks: TextBlock[] = [];
  let currentGroup: string[] = [];

  for (let i = 0; i < rawParagraphs.length; i++) {
    currentGroup.push(rawParagraphs[i]);
    const currentLen = currentGroup.join('\n\n').length;
    if (currentGroup.length >= paragraphsPerBlock || (currentLen > 450 && currentGroup.length >= 2)) {
      blocks.push({
        id: `block-${blocks.length}`,
        text: currentGroup.join('\n\n'),
      });
      currentGroup = [];
    }
  }

  if (currentGroup.length > 0) {
    blocks.push({
      id: `block-${blocks.length}`,
      text: currentGroup.join('\n\n'),
    });
  }

  return blocks;
}

// Auto-resizing borderless textarea component matching printed typography
const AutoResizeTextarea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  onSelect: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  fontFamily: 'serif' | 'sans';
  placeholder?: string;
}> = ({ value, onChange, onSelect, fontFamily, placeholder }) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    resize();
  }, [value, fontFamily]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      onSelect={onSelect}
      placeholder={placeholder || '在此段落直接输入文字说明或修改...'}
      spellCheck={false}
      rows={Math.max(2, value.split('\n').length)}
      className="w-full bg-transparent border-0 outline-none resize-none p-0 m-0 text-base sm:text-[17px] leading-[2.3] text-[#2c2b28] placeholder-stone-300 selection:bg-amber-200/50 overflow-hidden"
      style={{
        fontFamily:
          fontFamily === 'serif'
            ? '"Source Han Serif SC", "Noto Serif CJK SC", "Songti SC", SimSun, Georgia, serif'
            : '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
        letterSpacing: '0.02em',
      }}
    />
  );
};

export const ArchipositionEditor: React.FC<ArchipositionEditorProps> = ({
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
  const [blocks, setBlocks] = useState<TextBlock[]>(() => splitContentIntoBlocks(chapter.content));
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');

  // History Stack (返回 / 前进)
  const { pushSnapshot, undo, redo, canUndo, canRedo } = useHistory(
    chapter.content,
    chapter.annotations || []
  );

  // Re-chunk whenever active chapter changes
  useEffect(() => {
    setContent(chapter.content);
    setAnnotations(chapter.annotations || []);
    setBlocks(splitContentIntoBlocks(chapter.content));
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
    startIndex?: number;
    endIndex?: number;
  }>({
    isOpen: false,
    index: 1,
    quotedText: '',
    comment: '',
    isExisting: false,
  });

  const [selection, setSelection] = useState<{
    text: string;
    blockIndex: number;
    globalStart: number;
    globalEnd: number;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const metrics = useMemo(() => computeTextMetrics(content), [content]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Undo
  const handleUndo = useCallback(() => {
    const prev = undo();
    if (prev) {
      setContent(prev.content);
      setAnnotations(prev.annotations);
      setBlocks(splitContentIntoBlocks(prev.content));
      onSaveChapter({
        ...chapter,
        content: prev.content,
        annotations: prev.annotations,
        updatedAt: Date.now(),
      });
      showToast('↶ 已返回 (撤销上一操作)');
    }
  }, [undo, chapter, onSaveChapter]);

  // Redo
  const handleRedo = useCallback(() => {
    const next = redo();
    if (next) {
      setContent(next.content);
      setAnnotations(next.annotations);
      setBlocks(splitContentIntoBlocks(next.content));
      onSaveChapter({
        ...chapter,
        content: next.content,
        annotations: next.annotations,
        updatedAt: Date.now(),
      });
      showToast('↷ 已前进 (恢复重做)');
    }
  }, [redo, chapter, onSaveChapter]);

  // Global Keyboard Shortcuts
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

  // Update a single block's text while preserving stable IDs and cursor focus
  const handleBlockChange = (blockId: string, newText: string) => {
    const nextBlocks = blocks.map((b) => (b.id === blockId ? { ...b, text: newText } : b));
    setBlocks(nextBlocks);

    const nextFullContent = nextBlocks.map((b) => b.text).join('\n\n');
    setContent(nextFullContent);
    pushSnapshot(nextFullContent, annotations);
    onSaveChapter({
      ...chapter,
      content: nextFullContent,
      annotations,
      updatedAt: Date.now(),
    });
  };

  // Track selection inside a specific block and map to global indices
  const handleBlockSelect = (blockIndex: number, e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) {
      const sub = el.value.substring(start, end).trim();
      if (sub.length > 0) {
        // Calculate global offset
        let globalOffset = 0;
        for (let i = 0; i < blockIndex; i++) {
          globalOffset += blocks[i].text.length + 2; // + 2 for '\n\n'
        }
        setSelection({
          text: sub,
          blockIndex,
          globalStart: globalOffset + start,
          globalEnd: globalOffset + end,
        });
        return;
      }
    }
    setSelection(null);
  };

  // Format novel text and re-chunk
  const handleFormat = () => {
    const { formattedContent, updatedAnnotations } = formatNovelAndRemapAnnotations(content, annotations);
    setContent(formattedContent);
    setAnnotations(updatedAnnotations);
    setBlocks(splitContentIntoBlocks(formattedContent));
    pushSnapshot(formattedContent, updatedAnnotations, true);
    onSaveChapter({
      ...chapter,
      content: formattedContent,
      annotations: updatedAnnotations,
      updatedAt: Date.now(),
    });
    showToast('✨ 图文排版整理完成（规范空行与段落）');
  };

  // Open Annotation Sheet from selection
  const handleAnnotate = () => {
    if (!selection) return;
    const nextIndex = annotations.length > 0 ? Math.max(...annotations.map((a) => a.index)) + 1 : 1;
    setActiveSheetAnn({
      isOpen: true,
      index: nextIndex,
      quotedText: selection.text,
      comment: '',
      isExisting: false,
      startIndex: selection.globalStart,
      endIndex: selection.globalEnd,
    });
  };

  // Insert a new section below block
  const handleInsertSection = (afterIndex: number) => {
    const newBlock: TextBlock = {
      id: `block-${Date.now()}`,
      text: '',
    };
    const nextBlocks = [...blocks];
    nextBlocks.splice(afterIndex + 1, 0, newBlock);
    setBlocks(nextBlocks);
    showToast('📷 已插入新图片与说明分段');
  };

  const baseUrl = './';

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#222222] font-sans select-none flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] text-white text-xs px-4 py-2 rounded-full shadow-2xl animate-fade-in flex items-center gap-2 border border-stone-700">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. Archiposition Top Navbar (1:1 Exact Match)                  */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#e5e1dc] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1060px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            {/* Archiposition Red Mark & Text Logo */}
            <div 
              onClick={onBack}
              className="flex items-center gap-2 cursor-pointer select-none group"
              title="有方空间 archiposition.com"
            >
              <div className="w-6 h-6 bg-[#d9231f] flex items-center justify-center text-white font-serif font-black text-xs rounded-sm shadow-sm group-hover:opacity-90">
                方
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-[#1a1a1a]">
                有方
              </span>
              <span className="hidden sm:inline font-sans text-[11px] text-[#999] tracking-wider uppercase pl-1 border-l border-stone-200">
                Archiposition
              </span>
            </div>

            {/* Menu */}
            <nav className="hidden md:flex items-center gap-6 text-[14px] text-[#333333] font-normal">
              <span className="text-[#d9231f] font-semibold cursor-pointer">项目</span>
              <span className="hover:text-[#d9231f] cursor-pointer">资讯</span>
              <span className="hover:text-[#d9231f] cursor-pointer">研究</span>
              <span className="hover:text-[#d9231f] cursor-pointer">旅行</span>
              <span className="hover:text-[#d9231f] cursor-pointer">招聘</span>
              <span className="hover:text-[#d9231f] cursor-pointer">关于有方</span>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 text-xs text-[#666666]">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#f4f2ee] rounded-full text-xs text-[#888] border border-[#e8e4de]">
              <Search className="w-3.5 h-3.5 text-[#999]" />
              <span>搜索建筑项目、学者、竞赛</span>
            </div>

            {/* Camouflage & Emergency Switchers */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#e5e1dc]">
              <button
                type="button"
                onClick={() => onSwitchMode('normal')}
                className="px-2.5 py-1 rounded bg-[#eeebe5] hover:bg-[#e4e0d8] text-[#444] font-medium text-xs transition"
                title="切换回普通小说写作模式"
              >
                退出伪装
              </button>
              <button
                type="button"
                onClick={() => onSwitchMode('gooood')}
                className="px-2.5 py-1 rounded bg-[#e8f2f8] hover:bg-[#d8eaf4] text-[#0084c8] font-medium text-xs transition hidden sm:inline"
                title="切换为谷德设计网模式"
              >
                谷德版
              </button>
              <button
                type="button"
                onClick={onTriggerPanic}
                className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium text-xs border border-rose-200 transition"
                title="紧急老板键：一键遮罩为客栈案例 (快捷键 ESC)"
              >
                🚨 老板键 (ESC)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. Main Article Body Container (Seamless Text & Photo Flow)    */}
      {/* ============================================================== */}
      <main className="max-w-[820px] mx-auto px-4 py-8 flex-1 w-full space-y-7">
        
        {/* Breadcrumb */}
        <div className="text-xs text-[#888888] flex items-center gap-2">
          <span>首页</span>
          <span>/</span>
          <span>项目</span>
          <span>/</span>
          <span>工业与产业园区</span>
          <span>/</span>
          <span className="text-[#333] font-medium">普洛斯湾区西部智慧产业园-A16</span>
        </div>

        {/* Project Article Title & Minimalist Editorial Utility Bar */}
        <div className="space-y-4 pb-4 border-b border-[#e8e4de]">
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#111111] leading-tight font-serif tracking-tight">
            JJP新作：织两片纱网，普洛斯湾区西部智慧产业园-A16
          </h1>
          <p className="text-sm sm:text-base text-[#666666] leading-relaxed">
            在保障高效运转的同时，回应劳动者的日常使用需求并为互动联结创造条件。
          </p>

          {/* Minimalist Editorial Utility Strip (悄悄把改稿工具融入文章信息条中) */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#666666] border-t border-[#f0ede6]">
            {/* Left: Chapter Selector & History Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#999]">空间叙事推演草案：</span>
              {/* Discreet Chapter Selector Dropdown */}
              <select
                value={chapter.id}
                onChange={(e) => {
                  const target = allChapters.find((c) => c.id === e.target.value);
                  if (target) onSelectChapter(target);
                }}
                className="bg-transparent font-medium text-[#111] hover:text-[#d9231f] focus:outline-none cursor-pointer max-w-[180px] truncate underline decoration-stone-300 underline-offset-4"
                title="切换章节"
              >
                {allChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.chapterNum || '001'} - {ch.title.replace(/第.*?[章_]/, '').slice(0, 14)}
                  </option>
                ))}
              </select>

              {/* Undo / Redo (返回 / 前进) */}
              <div className="flex items-center gap-0.5 ml-2 pl-2 border-l border-stone-200">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="p-1 rounded hover:bg-stone-200 disabled:opacity-25 disabled:hover:bg-transparent text-stone-700 transition"
                  title="返回 (撤销 Cmd+Z)"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="p-1 rounded hover:bg-stone-200 disabled:opacity-25 disabled:hover:bg-transparent text-stone-700 transition"
                  title="前进 (恢复重做 Cmd+Shift+Z)"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Word Count (Disguised as article metrics) */}
              <button
                type="button"
                onClick={() => setIsWordCountOpen(true)}
                className="ml-2 hover:text-[#d9231f] text-stone-600 transition"
                title="点击查看字数统计详情"
              >
                {metrics.charsNoSpaces.toLocaleString()} 字
              </button>

              {/* Format Button */}
              <button
                type="button"
                onClick={handleFormat}
                className="p-1 text-stone-500 hover:text-amber-600 rounded transition"
                title="整理排版（规范空行与首行缩进）"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>

              {/* Export AI Prompt */}
              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="p-1 text-stone-500 hover:text-[#d9231f] rounded flex items-center gap-1 transition"
                title="生成 AI 改稿指令（两步法）"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">导出指令</span>
              </button>

              {/* Font Serif / Sans */}
              <button
                type="button"
                onClick={() => setFontFamily((prev) => (prev === 'serif' ? 'sans' : 'serif'))}
                className="p-1 text-stone-500 hover:text-stone-900 rounded transition"
                title={`切换排印字体（当前：${fontFamily === 'serif' ? '宋体' : '黑体'}）`}
              >
                <Type className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right: Social Actions */}
            <div className="flex items-center gap-3 text-xs text-[#888]">
              <span className="flex items-center gap-1 cursor-pointer hover:text-[#d9231f]">
                <Heart className="w-3.5 h-3.5" /> 842
              </span>
              <span className="flex items-center gap-1 cursor-pointer hover:text-[#d9231f]">
                <Bookmark className="w-3.5 h-3.5" /> 收藏
              </span>
              <span className="flex items-center gap-1 cursor-pointer hover:text-[#d9231f]">
                <Share2 className="w-3.5 h-3.5" /> 分享
              </span>
            </div>
          </div>
        </div>

        {/* Project Information Box (典型建筑媒体信息块) */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#f5f2eb] border border-[#e8e3d8] text-xs sm:text-sm text-[#444444] space-y-2 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 font-sans">
            <div><strong className="text-[#222]">设计单位：</strong>上海潘冀建筑设计事务所有限公司 JJP</div>
            <div><strong className="text-[#222]">主持建筑师：</strong>潘冀、苏重威</div>
            <div><strong className="text-[#222]">项目地点：</strong>广东省肇庆市鼎湖区永顺路1号</div>
            <div><strong className="text-[#222]">建筑面积：</strong>7,545 平方米</div>
            <div><strong className="text-[#222]">建设时间：</strong>2026.06</div>
            <div><strong className="text-[#222]">建筑摄影：</strong>存在建筑</div>
          </div>
          <div className="pt-2 border-t border-[#dfd9cd] text-[11px] text-[#888] italic">
            * 本文图纸与文字说明由设计单位 JJP 授权发布。
          </div>
        </div>

        {/* Lead Editorial Paragraph */}
        <div className="prose prose-stone max-w-none text-base leading-[2.2] text-[#333333] space-y-4 font-serif">
          <p className="indent-8">
            在现代工业物流领域，空间通常围绕“高周转与效率”展开组织，仓储、分拣、运输与调度环环相扣，建筑的衡量标准长期停留在流线最短化与坪效最大化。然而，随着全球现代产业竞争从基础产能向人才、研发、人文关怀与社群链接拓展，工业与产业园区建筑逐渐展现出更深远的社会属性。
          </p>
          <p className="indent-8">
            当日常场域汇聚数以千计的年轻工程师与一线作业人员时，如何在严密的高效运作之外，为劳动者的驻足、休整与非正式交流提供有尊严的空间界面，成为本次空间叙事推演的核心母题。
          </p>
        </div>

        {/* ============================================================== */}
        {/* 3. SEAMLESS INTERLEAVED STREAM: PHOTOS + TEXT CHUNKS            */}
        {/* ============================================================== */}
        <div className="space-y-10 pt-2">
          {blocks.map((block, idx) => {
            const photo = ARCH_PHOTOS[idx % ARCH_PHOTOS.length];

            return (
              <div key={block.id} className="space-y-6">
                {/* Architectural Photo & Drawing (Interleaved) */}
                <figure className="space-y-2">
                  <div className="rounded-lg overflow-hidden border border-[#e5e1dc] bg-stone-100 shadow-sm">
                    <img 
                      src={`${baseUrl}arch/${photo.src}`} 
                      alt={photo.alt}
                      loading="lazy"
                      className="w-full h-auto object-cover max-h-[560px]"
                    />
                  </div>
                  <figcaption className="text-xs text-[#888888] text-center font-serif">
                    {photo.caption}
                  </figcaption>
                </figure>

                {/* Subtitle for the section (融入空间推演叙事) */}
                <div className="flex items-center justify-between text-xs text-[#777] border-b border-stone-200/60 pb-1.5 font-serif">
                  <span className="font-bold text-stone-800 tracking-wide">
                    空间叙事场景推演与设计说明（片段 0{idx + 1}）
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInsertSection(idx)}
                    className="text-[11px] text-[#888] hover:text-[#d9231f] flex items-center gap-0.5 transition"
                    title="在此处下方插入新图纸与分段"
                  >
                    <Plus className="w-3 h-3" />
                    <span>插入图纸分隔</span>
                  </button>
                </div>

                {/* Seamless Text Section (Zero border, zero frame, pure article text) */}
                <div className="relative">
                  <AutoResizeTextarea
                    value={block.text}
                    onChange={(newVal) => handleBlockChange(block.id, newVal)}
                    onSelect={(e) => handleBlockSelect(idx, e)}
                    fontFamily={fontFamily}
                    placeholder={`在此直接输入或编辑第 ${idx + 1} 节设计说明...`}
                  />

                  {/* Floating Annotation pill on selection */}
                  {selection && selection.blockIndex === idx && (
                    <div className="sticky bottom-6 flex justify-end z-30 animate-fade-in pointer-events-auto">
                      <button
                        type="button"
                        onClick={handleAnnotate}
                        className="px-3.5 py-1.5 rounded-full bg-[#d9231f] text-white text-xs font-semibold shadow-xl hover:bg-[#c21f1b] transition flex items-center gap-1.5 border border-white"
                      >
                        <span>✍️ 批注选句 ({selection.text.length}字)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Project Credits Footer Box */}
        <div className="mt-14 p-6 rounded-lg bg-[#f5f2eb] border border-[#e5dfd2] text-xs text-[#555] space-y-3 leading-relaxed font-sans">
          <div className="font-bold text-sm text-[#222] border-b border-stone-300 pb-2">
            完整项目档案 · Credits
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div><strong>项目名称：</strong>普洛斯湾区西部智慧产业园-A16</div>
            <div><strong>主创单位：</strong>上海潘冀建筑设计事务所有限公司</div>
            <div><strong>结构设计：</strong>华东建筑设计研究院有限公司</div>
            <div><strong>机电顾问：</strong>科进顾问（亚洲）有限公司</div>
            <div><strong>幕墙顾问：</strong>旭密林幕墙顾问有限公司</div>
            <div><strong>灯光设计：</strong>大观照明设计（北京）有限公司</div>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* 4. Archiposition Authentic Footer                              */}
      {/* ============================================================== */}
      <footer className="mt-16 border-t border-[#e5e1dc] bg-white py-10 text-xs text-[#777]">
        <div className="max-w-[1060px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-5 h-5 bg-[#d9231f] flex items-center justify-center text-white font-serif font-black text-[10px] rounded-sm">
              方
            </div>
            <span className="font-serif font-bold text-lg text-[#222]">有方空间</span>
            <span className="text-[#999] hidden sm:inline">
              archiposition.com · 专注高品质建筑文化传播与学术策划
            </span>
          </div>
          <div className="text-center md:text-right text-[11px] text-[#999] space-y-1">
            <div>关于有方 | 投稿指南 | 广告与赞助 | 招聘信息 | 版权申明</div>
            <div>Copyright © 2013-2026 有方空间 archiposition.com All Rights Reserved. 粤ICP备13028249号</div>
          </div>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* 5. Modals & Sheets (Functional Guarantee)                      */}
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
            startIndex: activeSheetAnn.startIndex || 0,
            endIndex: activeSheetAnn.endIndex || activeSheetAnn.quotedText.length,
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
