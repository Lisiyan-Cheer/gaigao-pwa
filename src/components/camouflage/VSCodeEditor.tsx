import React, { useState, useMemo } from 'react';
import { 
  Files, 
  Search, 
  GitBranch, 
  Play, 
  Boxes, 
  Settings, 
  Sparkles, 
  Copy, 
  FileCode, 
  ChevronRight, 
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Chapter, Annotation } from '../../types';
import { computeTextMetrics, getCircledNumber } from '../../utils/wordCount';
import { formatNovelAndRemapAnnotations } from '../../utils/novelFormatter';
import { WordCountModal } from '../WordCountModal';
import { AnnotationSheet } from '../AnnotationSheet';
import { AnnotationListSheet } from '../AnnotationListSheet';
import { ExportModal } from '../ExportModal';

interface VSCodeEditorProps {
  chapter: Chapter;
  allChapters: Chapter[];
  onSelectChapter: (chapter: Chapter) => void;
  onSaveChapter: (updated: Chapter) => void;
  onBack: () => void;
  onSwitchMode: (mode: 'normal' | 'vscode' | 'confluence') => void;
  onTriggerPanic: () => void;
}

export const VSCodeEditor: React.FC<VSCodeEditorProps> = ({
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  const [selection, setSelection] = useState<{
    text: string;
    start: number;
    end: number;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const metrics = useMemo(() => computeTextMetrics(content), [content]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const lines = useMemo(() => content.split('\n'), [content]);

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
    const { formattedContent, updatedAnnotations } = formatNovelAndRemapAnnotations(
      content,
      annotations
    );
    setContent(formattedContent);
    setAnnotations(updatedAnnotations);
    onSaveChapter({
      ...chapter,
      content: formattedContent,
      annotations: updatedAnnotations,
      updatedAt: Date.now(),
    });
    showToast('✨ Code clean & format completed (Prettier)');
  };

  const handleAnnotateSelection = () => {
    if (!selection) return;
    const nextIndex = annotations.length > 0 
      ? Math.max(...annotations.map((a) => a.index)) + 1 
      : 1;

    setActiveSheetAnn({
      isOpen: true,
      index: nextIndex,
      quotedText: selection.text,
      comment: '',
      isExisting: false,
    });
  };

  const handleSaveAnnotation = (comment: string) => {
    if (activeSheetAnn.isExisting && activeSheetAnn.annId) {
      const nextAnnotations = annotations.map((a) =>
        a.id === activeSheetAnn.annId ? { ...a, comment } : a
      );
      setAnnotations(nextAnnotations);
      onSaveChapter({ ...chapter, content, annotations: nextAnnotations, updatedAt: Date.now() });
      showToast('✅ Code review item updated');
    } else if (selection) {
      const newAnn: Annotation = {
        id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        index: activeSheetAnn.index,
        text: activeSheetAnn.quotedText,
        startIndex: selection.start,
        endIndex: selection.end,
        comment,
        status: 'active',
        createdAt: Date.now(),
      };
      const nextAnnotations = [...annotations, newAnn];
      setAnnotations(nextAnnotations);
      onSaveChapter({ ...chapter, content, annotations: nextAnnotations, updatedAt: Date.now() });
      showToast(`✅ Code review item ${getCircledNumber(activeSheetAnn.index)} added`);
      setSelection(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono select-none overflow-hidden text-xs sm:text-sm">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#252526] text-white border border-[#454545] text-xs px-4 py-2 rounded shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VS Code Window Titlebar */}
      <div className="h-8 bg-[#323233] border-b border-[#252526] flex items-center justify-between px-3 shrink-0 text-[#cccccc] text-xs">
        {/* Mac traffic lights */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" onClick={onBack} title="关闭并返回章节列表" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" title="最小化" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" title="最大化" />
          <span className="ml-3 opacity-70">
            src/services/ch_{chapter.chapterNum || '010'}_pipeline.ts — enterprise-core
          </span>
        </div>

        {/* Center search bar */}
        <div className="hidden md:flex items-center gap-2 bg-[#252526] px-6 py-1 rounded border border-[#3c3c3c] text-[11px] text-[#858585] w-96 justify-center">
          <Search className="w-3 h-3" />
          <span>Search files, commands, symbols (Cmd + P)</span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSwitchMode('normal')}
            className="px-2 py-0.5 rounded hover:bg-[#3c3c3c] text-[11px] text-[#9cdcfe]"
            title="退出伪装，回到正常小说界面"
          >
            切换正常模式
          </button>
          <button
            onClick={onTriggerPanic}
            className="px-2 py-0.5 rounded bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-[11px] border border-rose-800/40"
            title="紧急老板键：一键切入全屏终端编译屏 (快捷键 ESC)"
          >
            🚨 老板键 (ESC)
          </button>
        </div>
      </div>

      {/* Main VS Code Work Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar (Far Left) */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 justify-between border-r border-[#252526] shrink-0">
          <div className="space-y-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-white border-l-2 border-[#007acc] hover:opacity-100" 
              title="Explorer"
            >
              <Files className="w-5 h-5" />
            </button>
            <button className="p-2 text-[#858585] hover:text-white" title="Search">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-[#858585] hover:text-white relative" title="Source Control">
              <GitBranch className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#007acc]" />
            </button>
            <button className="p-2 text-[#858585] hover:text-white" title="Run and Debug">
              <Play className="w-5 h-5" />
            </button>
            <button className="p-2 text-[#858585] hover:text-white" title="Extensions">
              <Boxes className="w-5 h-5" />
            </button>
          </div>
          <div>
            <button className="p-2 text-[#858585] hover:text-white" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Explorer Sidebar */}
        {isSidebarOpen && (
          <div className="w-64 bg-[#252526] border-r border-[#1e1e1e] flex flex-col shrink-0 text-[#cccccc] text-xs">
            <div className="p-2 font-bold tracking-wider text-[11px] uppercase text-[#bbbbbb] flex items-center justify-between">
              <span>EXPLORER: PROJECT-CORE</span>
            </div>

            <div className="flex-1 overflow-y-auto px-1 py-1 space-y-0.5 font-sans">
              <div className="flex items-center gap-1 px-1 py-0.5 text-[#bbbbbb] font-semibold text-[11px]">
                <ChevronDown className="w-3.5 h-3.5" />
                <span>SRC / SERVICES (CHAPTERS)</span>
              </div>

              <div className="pl-4 space-y-0.5">
                {allChapters.map((ch) => {
                  const isActive = ch.id === chapter.id;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => onSelectChapter(ch)}
                      className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                        isActive
                          ? 'bg-[#37373d] text-white font-medium'
                          : 'hover:bg-[#2a2d2e] text-[#969696]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <FileCode className="w-3.5 h-3.5 text-[#519aba] shrink-0" />
                        <span className="truncate">
                          ch_{ch.chapterNum || '001'}_{ch.title.replace(/第.*?[章_]/, '').slice(0, 10)}.ts
                        </span>
                      </div>
                      {ch.annotations.length > 0 && (
                        <span className="text-[10px] bg-[#007acc] text-white px-1.5 rounded-full shrink-0">
                          {ch.annotations.length}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 px-1 py-1 mt-3 text-[#bbbbbb] font-semibold text-[11px]">
                <ChevronRight className="w-3.5 h-3.5" />
                <span>CONFIG</span>
              </div>
              <div className="pl-6 text-[#858585] space-y-1 text-xs">
                <div>📄 tsconfig.json</div>
                <div>📄 package.json</div>
                <div>📄 .env.production</div>
              </div>
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
          {/* Tab Bar */}
          <div className="h-9 bg-[#252526] flex items-center px-1 border-b border-[#1e1e1e] shrink-0 overflow-x-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] border-t border-[#007acc] text-white text-xs rounded-t">
              <FileCode className="w-3.5 h-3.5 text-[#519aba]" />
              <span className="font-medium">ch_{chapter.chapterNum || '010'}_pipeline.ts</span>
              <span className="w-2 h-2 rounded-full bg-slate-400 opacity-60 ml-1" />
            </div>

            <div className="ml-auto flex items-center gap-2 pr-2 text-xs">
              <button
                onClick={handleFormat}
                className="flex items-center gap-1 px-2 py-1 bg-[#2d2d2d] hover:bg-[#3c3c3c] rounded text-[#cccccc]"
                title="Format Code / 排版"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Format</span>
              </button>
              <button
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded font-medium"
                title="Git Commit & PR Refactor (生成 AI 指令)"
              >
                <Copy className="w-3 h-3" />
                <span>Generate PR (生成指令)</span>
              </button>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="h-6 bg-[#1e1e1e] px-4 flex items-center gap-1 text-[11px] text-[#858585] border-b border-[#252526]">
            <span>src</span>
            <span>&gt;</span>
            <span>services</span>
            <span>&gt;</span>
            <span className="text-[#cccccc]">ch_{chapter.chapterNum || '010'}_pipeline.ts</span>
            <span>&gt;</span>
            <span className="text-[#9cdcfe]">{chapter.title}</span>
          </div>

          {/* Code Canvas */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Line Numbers Column */}
            <div className="w-12 py-4 select-none text-right pr-3 font-mono text-xs text-[#858585] opacity-50 bg-[#1e1e1e] border-r border-[#252526] shrink-0 overflow-hidden leading-[1.7]">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable Textarea with VS Code Dark Theme */}
            <div className="flex-1 relative overflow-hidden">
              <textarea
                value={content}
                onChange={handleContentChange}
                onSelect={handleSelect}
                placeholder="// Enter module logic or novel content here..."
                spellCheck={false}
                className="w-full h-full p-4 bg-transparent resize-none focus:outline-none font-mono text-[14px] leading-[1.7] text-[#ce9178] caret-[#569cd6] selection:bg-[#264f78]"
                style={{
                  fontFamily: 'Menlo, Monaco, "Courier New", Consolas, "PingFang SC", monospace',
                }}
              />

              {/* Selection floating Code Review pill */}
              {selection && (
                <div className="absolute bottom-16 right-8 z-40 animate-fade-in">
                  <button
                    type="button"
                    onClick={handleAnnotateSelection}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0e639c] hover:bg-[#1177bb] text-white font-mono text-xs shadow-xl border border-[#454545] active:scale-95 transition"
                  >
                    <span>💬 Add Code Review Comment ({selection.text.length} chars)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* VS Code Bottom Status Bar */}
          <div className="h-6 bg-[#007acc] text-white px-3 flex items-center justify-between text-[11px] shrink-0 font-sans">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                <span>main*</span>
              </span>
              <span className="flex items-center gap-1 cursor-pointer" onClick={() => setIsListSheetOpen(true)}>
                <AlertCircle className="w-3 h-3" />
                <span>{annotations.length} Reviews (批注)</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span 
                className="cursor-pointer hover:underline"
                onClick={() => setIsWordCountOpen(true)}
                title="点击查看字数与代码统计"
              >
                Tokens (字数): <b>{metrics.charsNoSpaces.toLocaleString()}</b>
              </span>
              <span>Lines: {metrics.paragraphs}</span>
              <span>Spaces: 2</span>
              <span>UTF-8</span>
              <span>TypeScript 5.6</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
        onSave={handleSaveAnnotation}
      />

      <AnnotationListSheet
        isOpen={isListSheetOpen}
        onClose={() => setIsListSheetOpen(false)}
        annotations={annotations}
        onSelectAnnotation={() => {}}
        onEditAnnotation={(ann) => {
          setActiveSheetAnn({
            isOpen: true,
            index: ann.index,
            quotedText: ann.text,
            comment: ann.comment,
            isExisting: true,
            annId: ann.id,
          });
        }}
        onDeleteAnnotation={(id) => {
          const next = annotations.filter((a) => a.id !== id);
          next.forEach((a, i) => (a.index = i + 1));
          setAnnotations(next);
          onSaveChapter({ ...chapter, content, annotations: next, updatedAt: Date.now() });
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        chapter={{
          ...chapter,
          content,
          annotations,
        }}
      />
    </div>
  );
};
