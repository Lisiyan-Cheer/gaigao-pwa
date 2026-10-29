import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  MessageSquare, 
  Copy 
} from 'lucide-react';
import { Chapter, Annotation } from '../types';
import { CamouflageMode } from '../types/camouflage';
import { computeTextMetrics, getCircledNumber } from '../utils/wordCount';
import { formatNovelAndRemapAnnotations } from '../utils/novelFormatter';
import { getSelectionCoordinates, SelectionCoords } from '../utils/selectionPosition';
import { WordCountModal } from './WordCountModal';
import { AnnotationSheet } from './AnnotationSheet';
import { AnnotationListSheet } from './AnnotationListSheet';
import { ExportModal } from './ExportModal';
import { ModeSwitcher } from './camouflage/ModeSwitcher';

interface EditorProps {
  chapter: Chapter;
  onSaveChapter: (updated: Chapter) => void;
  onBack: () => void;
  camouflageMode: CamouflageMode;
  onSelectCamouflageMode: (mode: CamouflageMode) => void;
  onTriggerPanic: () => void;
}

export const Editor: React.FC<EditorProps> = ({
  chapter,
  onSaveChapter,
  onBack,
  camouflageMode,
  onSelectCamouflageMode,
  onTriggerPanic,
}) => {
  const [content, setContent] = useState(chapter.content);
  const [title, setTitle] = useState(chapter.title);
  const [annotations, setAnnotations] = useState<Annotation[]>(chapter.annotations || []);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Modals & Sheets
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

  // Selection state with exact screen coordinates
  const [selection, setSelection] = useState<{
    text: string;
    start: number;
    end: number;
    coords: SelectionCoords | null;
  } | null>(null);

  // Active cursor annotation detector with screen coordinates
  const [cursorAnnotation, setCursorAnnotation] = useState<{
    ann: Annotation;
    coords: SelectionCoords | null;
  } | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<number | null>(null);

  const metrics = useMemo(() => computeTextMetrics(content), [content]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Sync scroll between textarea and backdrop
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
    // Update floating positions smoothly on scroll
    updateSelectionState();
  };

  // Auto-save debounced
  const triggerSave = (newContent: string, newAnnotations: Annotation[], newTitle: string) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      onSaveChapter({
        ...chapter,
        title: newTitle,
        content: newContent,
        annotations: newAnnotations,
        updatedAt: Date.now(),
      });
    }, 400);
  };

  // Selection & Cursor detection and coordinate calculation
  const updateSelectionState = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;

    // Detect cursor inside existing annotation (start === end)
    if (start === end) {
      setSelection(null);
      const found = annotations.find(
        (a) => a.status === 'active' && start >= a.startIndex && start <= a.endIndex
      );
      if (found) {
        const coords = getSelectionCoordinates(el, found.startIndex, found.endIndex, 170, 36);
        setCursorAnnotation({ ann: found, coords });
      } else {
        setCursorAnnotation(null);
      }
      return;
    }

    // Text selected!
    const selectedText = el.value.substring(start, end).trim();
    if (selectedText.length > 0) {
      const coords = getSelectionCoordinates(el, start, end, 140, 36);
      setSelection({
        text: selectedText,
        start,
        end,
        coords,
      });
      setCursorAnnotation(null);
    } else {
      setSelection(null);
    }
  }, [annotations]);

  // Listen to selectionchange and visualViewport changes (for iOS keyboard pop-up)
  useEffect(() => {
    const onSelectionChange = () => {
      if (document.activeElement === textareaRef.current) {
        updateSelectionState();
      }
    };

    const onViewportChange = () => {
      updateSelectionState();
    };

    document.addEventListener('selectionchange', onSelectionChange);
    window.addEventListener('resize', onViewportChange);
    window.visualViewport?.addEventListener('resize', onViewportChange);
    window.visualViewport?.addEventListener('scroll', onViewportChange);

    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      window.removeEventListener('resize', onViewportChange);
      window.visualViewport?.removeEventListener('resize', onViewportChange);
      window.visualViewport?.removeEventListener('scroll', onViewportChange);
    };
  }, [updateSelectionState]);

  // Handle typing in textarea
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setContent(nextVal);

    // Re-verify existing annotations against new content
    const updatedAnnotations = annotations.map((ann) => {
      if (ann.status === 'orphaned') return ann;

      // Check if text still at original bounds
      const sub = nextVal.substring(ann.startIndex, ann.endIndex);
      if (sub === ann.text) {
        return ann;
      }

      // Try locating text elsewhere in document
      const idx = nextVal.indexOf(ann.text);
      if (idx !== -1) {
        return {
          ...ann,
          startIndex: idx,
          endIndex: idx + ann.text.length,
          status: 'active' as const,
        };
      }

      // If text completely missing, mark orphaned
      return {
        ...ann,
        status: 'orphaned' as const,
      };
    });

    setAnnotations(updatedAnnotations);
    triggerSave(nextVal, updatedAnnotations, title);
  };

  // One-click formatting (✨ 排版)
  const handleFormatNovel = () => {
    const { formattedContent, updatedAnnotations } = formatNovelAndRemapAnnotations(
      content,
      annotations
    );

    setContent(formattedContent);
    setAnnotations(updatedAnnotations);
    triggerSave(formattedContent, updatedAnnotations, title);
    showToast('✨ 小说排版完成：已自动清除首尾空格、清理多余空行！');
  };

  // Open Annotation Sheet from selection
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
      startIndex: selection.start,
      endIndex: selection.end,
    });
  };

  // Save annotation from sheet
  const handleSaveAnnotation = (comment: string) => {
    if (activeSheetAnn.isExisting && activeSheetAnn.annId) {
      // Update existing
      const nextAnnotations = annotations.map((a) =>
        a.id === activeSheetAnn.annId ? { ...a, comment } : a
      );
      setAnnotations(nextAnnotations);
      triggerSave(content, nextAnnotations, title);
      showToast('✅ 批注意见已更新');
    } else {
      // Create new
      const newAnn: Annotation = {
        id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        index: activeSheetAnn.index,
        text: activeSheetAnn.quotedText,
        startIndex: activeSheetAnn.startIndex ?? 0,
        endIndex: activeSheetAnn.endIndex ?? activeSheetAnn.quotedText.length,
        comment,
        status: 'active',
        createdAt: Date.now(),
      };

      const nextAnnotations = [...annotations, newAnn];
      setAnnotations(nextAnnotations);
      triggerSave(content, nextAnnotations, title);
      showToast(`✅ 已添加批注 ${getCircledNumber(activeSheetAnn.index)}`);
      setSelection(null);
    }
  };

  // Delete annotation
  const handleDeleteAnnotation = (id: string) => {
    const nextAnnotations = annotations.filter((a) => a.id !== id);
    // Renumber
    nextAnnotations.forEach((a, idx) => {
      a.index = idx + 1;
    });
    setAnnotations(nextAnnotations);
    triggerSave(content, nextAnnotations, title);
    showToast('🗑️ 批注已删除');
  };

  // Jump to annotation in textarea
  const handleJumpToAnnotation = (ann: Annotation) => {
    const el = textareaRef.current;
    if (!el || ann.status === 'orphaned') return;

    el.focus();
    el.setSelectionRange(ann.startIndex, ann.endIndex);
    
    // Smooth scroll into view
    const approxLineHeight = 31.45; // 17px * 1.85
    const textBefore = content.substring(0, ann.startIndex);
    const lineCount = textBefore.split('\n').length;
    const targetScroll = Math.max(0, (lineCount - 3) * approxLineHeight);
    
    el.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
    updateSelectionState();
  };

  // Render highlighted segments in the backdrop
  const backdropElements = useMemo(() => {
    if (!content) return null;

    // Filter and sort active annotations
    const active = annotations
      .filter((a) => a.status === 'active' && a.endIndex <= content.length)
      .sort((a, b) => a.startIndex - b.startIndex);

    if (active.length === 0) {
      return <span>{content}</span>;
    }

    const segments: React.ReactNode[] = [];
    let lastPos = 0;

    for (const ann of active) {
      if (ann.startIndex < lastPos) continue; // Skip overlapping ranges safely

      // Text before highlight
      if (ann.startIndex > lastPos) {
        segments.push(
          <span key={`text-${lastPos}`}>{content.substring(lastPos, ann.startIndex)}</span>
        );
      }

      // Highlighted text
      const highlightedText = content.substring(ann.startIndex, ann.endIndex);
      const circleNumber = getCircledNumber(ann.index);

      // ZERO layout-width addition: mark has 0 margin, 0 padding, 0 border.
      // Badge has 0 width and 0 height so it NEVER pushes subsequent text by even 1 pixel!
      segments.push(
        <mark
          key={`mark-${ann.id}`}
          className="annotation-highlight"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.32)',
            color: 'transparent',
            margin: 0,
            padding: 0,
            border: 'none',
            borderBottom: '2px solid #f59e0b',
            position: 'relative',
            borderRadius: 0,
          }}
        >
          {highlightedText}
          <span
            style={{
              position: 'absolute',
              right: 0,
              top: '-0.55em',
              width: 0,
              height: 0,
              overflow: 'visible',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <span
              style={{
                transform: 'translate(50%, 0)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                lineHeight: 1,
                padding: '2px 5px',
                borderRadius: '9999px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {circleNumber}
            </span>
          </span>
        </mark>
      );

      lastPos = ann.endIndex;
    }

    // Remaining text
    if (lastPos < content.length) {
      segments.push(
        <span key={`text-end-${lastPos}`}>{content.substring(lastPos)}</span>
      );
    }

    return segments;
  }, [content, annotations]);

  return (
    <div className="flex flex-col h-screen bg-paper-50 dark:bg-paper-900 text-slate-800 dark:text-slate-100 overflow-hidden font-sans select-none-headers">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-paper-800/95 text-white text-xs px-4 py-2 rounded-full shadow-xl backdrop-blur-md border border-slate-700/60 animate-fade-in flex items-center gap-1.5">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar (Sticky) */}
      <header className="sticky top-0 z-30 bg-paper-50/95 dark:bg-paper-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-paper-800 rounded-xl transition"
            title="返回章节列表"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Editable Title */}
          <div className="min-w-0 flex-1">
            {isEditingTitle ? (
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  setIsEditingTitle(false);
                  triggerSave(content, annotations, title);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingTitle(false);
                    triggerSave(content, annotations, title);
                  }
                }}
                className="w-full text-sm font-bold bg-white dark:bg-paper-800 px-2 py-1 rounded-lg border border-orange-500 focus:outline-none"
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-sm font-bold truncate text-slate-900 dark:text-white cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1"
                title="点击重命名标题"
              >
                <span className="truncate">{title}</span>
              </h2>
            )}
            <p className="text-[10px] text-slate-400 truncate">
              《{chapter.bookName}》
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {/* Mode Switcher (Camouflage / Disguise) */}
          <ModeSwitcher
            currentMode={camouflageMode}
            onSelectMode={onSelectCamouflageMode}
            onTriggerPanic={onTriggerPanic}
          />

          {/* Word Count Pill (Reference VMark) */}
          <button
            type="button"
            onClick={() => setIsWordCountOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-100/70 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-300 transition"
            title="查看精确字数统计详情"
          >
            <span>{metrics.charsNoSpaces.toLocaleString()}</span>
            <span className="text-[10px] opacity-80">字</span>
          </button>

          {/* One-click formatting (✨ 排版) */}
          <button
            type="button"
            onClick={handleFormatNovel}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 dark:bg-paper-800 dark:hover:bg-paper-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700 transition"
            title="小说一键排版（清除首尾空格、清理多余空行，保持双换行与缩进）"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">一键排版</span>
            <span className="sm:hidden">排版</span>
          </button>
        </div>
      </header>

      {/* Editor Main Canvas (Textarea + Shadow Layer with 1:1 Pixel Alignment) */}
      <div className="relative flex-1 w-full max-w-3xl mx-auto overflow-hidden">
        {/* Shadow Highlight Backdrop */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="absolute inset-0 px-5 pt-6 pb-44 overflow-y-auto whitespace-pre-wrap pointer-events-none text-[17px] leading-[1.85] text-transparent select-none box-border"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
            wordBreak: 'break-all',
            overflowWrap: 'break-word',
            letterSpacing: '0px',
            WebkitTextSizeAdjust: '100%',
          }}
        >
          {backdropElements}
        </div>

        {/* Real Transparent Editable Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onSelect={updateSelectionState}
          onScroll={handleScroll}
          placeholder="在此处直接输入或修改正文..."
          spellCheck={false}
          className="relative z-10 w-full h-full px-5 pt-6 pb-44 bg-transparent resize-none focus:outline-none text-[17px] leading-[1.85] text-slate-900 dark:text-slate-100 caret-orange-500 placeholder-slate-400/50 box-border"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
            wordBreak: 'break-all',
            overflowWrap: 'break-word',
            letterSpacing: '0px',
            WebkitTextSizeAdjust: '100%',
          }}
        />
      </div>

      {/* Selection Floating Pill — Pops up directly beside/above the selected text */}
      {selection && selection.coords && (
        <div
          style={{
            position: 'fixed',
            left: `${selection.coords.x}px`,
            top: `${selection.coords.y}px`,
            zIndex: 50,
          }}
          className="animate-fade-in pointer-events-auto"
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={handleAnnotateSelection}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-xs shadow-xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all whitespace-nowrap border border-white/20 ring-2 ring-orange-500/20"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-current" />
            <span>💬 批注所选 ({selection.text.length}字)</span>
          </button>
        </div>
      )}

      {/* Cursor context indicator — Pops up directly beside the active annotation */}
      {cursorAnnotation && cursorAnnotation.coords && (
        <div
          style={{
            position: 'fixed',
            left: `${cursorAnnotation.coords.x}px`,
            top: `${cursorAnnotation.coords.y}px`,
            zIndex: 45,
          }}
          className="animate-fade-in pointer-events-auto"
        >
          <div className="bg-amber-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-white/20 whitespace-nowrap">
            <span>当前光标：批注 {getCircledNumber(cursorAnnotation.ann.index)}</span>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={() => {
                setActiveSheetAnn({
                  isOpen: true,
                  index: cursorAnnotation.ann.index,
                  quotedText: cursorAnnotation.ann.text,
                  comment: cursorAnnotation.ann.comment,
                  isExisting: true,
                  annId: cursorAnnotation.ann.id,
                });
              }}
              className="underline font-bold hover:text-amber-100"
            >
              查看/修改
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar */}
      <footer className="sticky bottom-0 z-30 bg-paper-50/95 dark:bg-paper-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {/* Annotation list button */}
          <button
            type="button"
            onClick={() => setIsListSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-paper-800 dark:hover:bg-paper-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/60 dark:border-slate-700 transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>批注 ({annotations.length})</span>
          </button>

          {/* Generate Instructions button */}
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition"
          >
            <Copy className="w-4 h-4" />
            <span>生成 AI 改稿指令 📋</span>
          </button>
        </div>
      </footer>

      {/* Modals & Bottom Sheets */}
      <WordCountModal
        isOpen={isWordCountOpen}
        onClose={() => setIsWordCountOpen(false)}
        metrics={metrics}
        chapterTitle={title}
      />

      <AnnotationSheet
        isOpen={activeSheetAnn.isOpen}
        onClose={() => setActiveSheetAnn((prev) => ({ ...prev, isOpen: false }))}
        index={activeSheetAnn.index}
        quotedText={activeSheetAnn.quotedText}
        initialComment={activeSheetAnn.comment}
        isExisting={activeSheetAnn.isExisting}
        onSave={handleSaveAnnotation}
        onDelete={
          activeSheetAnn.annId 
            ? () => handleDeleteAnnotation(activeSheetAnn.annId!) 
            : undefined
        }
      />

      <AnnotationListSheet
        isOpen={isListSheetOpen}
        onClose={() => setIsListSheetOpen(false)}
        annotations={annotations}
        onSelectAnnotation={handleJumpToAnnotation}
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
        onDeleteAnnotation={handleDeleteAnnotation}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        chapter={{
          ...chapter,
          title,
          content,
          annotations,
        }}
      />
    </div>
  );
};
