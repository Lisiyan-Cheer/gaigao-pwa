import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  MessageSquare, 
  Search, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Chapter, Annotation } from '../../types';
import { computeTextMetrics } from '../../utils/wordCount';
import { formatNovelAndRemapAnnotations } from '../../utils/novelFormatter';
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
  onSwitchMode: (mode: 'normal' | 'gooood' | 'vscode' | 'confluence') => void;
  onTriggerPanic: () => void;
}

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

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setContent(nextVal);
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
                onClick={onTriggerPanic}
                className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium text-xs border border-rose-200 transition"
                title="紧急老板键：一键黑屏编译终端 (快捷键 ESC)"
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

          {/* Architecture Articles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Card 1 */}
            <article className="border border-[#e7edf2] bg-white rounded-lg overflow-hidden hover:shadow-md transition">
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                <img 
                  src="https://oss.gooood.cn/uploads/2026/10/00-gooood-interview-Yang-Dingliang%E7%9A%84%E5%89%AF%E6%9C%AC_%E5%89%AF%E6%9C%AC-gsj-472x303.png" 
                  alt="CAA建筑事务所" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback visual if offline
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                  建筑设计 / 专访
                </div>
              </div>
              <div className="p-3.5 space-y-1.5">
                <h3 className="font-bold text-sm text-[#222] hover:text-[#0084c8] cursor-pointer line-clamp-1">
                  大乐之野 · 松阳 + 小后青山客栈改造 / 空间营造
                </h3>
                <p className="text-xs text-[#777] line-clamp-2 leading-relaxed">
                  隐匿于浙南深山古村落，以就地取材的夯土与老木材，重构现代旅人的乡野精神避风港。
                </p>
                <div className="text-[11px] text-[#999] pt-1 border-t border-[#f0f3f6] flex justify-between">
                  <span>浙江 · 松阳</span>
                  <span>2026-10-28</span>
                </div>
              </div>
            </article>

            {/* Card 2 */}
            <article className="border border-[#e7edf2] bg-white rounded-lg overflow-hidden hover:shadow-md transition">
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                <img 
                  src="https://oss.gooood.cn/uploads/2026/04/odd-ppt-拷贝.jpg" 
                  alt="商业空间" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                  商业空间 / 改造
                </div>
              </div>
              <div className="p-3.5 space-y-1.5">
                <h3 className="font-bold text-sm text-[#222] hover:text-[#0084c8] cursor-pointer line-clamp-1">
                  北京1733商业空间提升 / 拾集建筑
                </h3>
                <p className="text-xs text-[#777] line-clamp-2 leading-relaxed">
                  打破传统地下商业沉闷格局，将天光、微地形与退台花园引入公共漫游走廊。
                </p>
                <div className="text-[11px] text-[#999] pt-1 border-t border-[#f0f3f6] flex justify-between">
                  <span>北京 · 海淀</span>
                  <span>2026-10-27</span>
                </div>
              </div>
            </article>
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
