import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { Chapter, Annotation } from '../../types';
import { computeTextMetrics } from '../../utils/wordCount';
import { formatNovelAndRemapAnnotations } from '../../utils/novelFormatter';
import { WordCountModal } from '../WordCountModal';
import { AnnotationSheet } from '../AnnotationSheet';
import { AnnotationListSheet } from '../AnnotationListSheet';
import { ExportModal } from '../ExportModal';

interface ConfluenceEditorProps {
  chapter: Chapter;
  onSaveChapter: (updated: Chapter) => void;
  onBack: () => void;
  onSwitchMode: (mode: 'normal' | 'vscode' | 'confluence') => void;
  onTriggerPanic: () => void;
}

export const ConfluenceEditor: React.FC<ConfluenceEditorProps> = ({
  chapter,
  onSaveChapter,
  onBack,
  onSwitchMode,
  onTriggerPanic,
}) => {
  const [content, setContent] = useState(chapter.content);
  const [annotations, setAnnotations] = useState<Annotation[]>(chapter.annotations || []);
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
    showToast('✨ 文档段落规范化排版完成');
  };

  return (
    <div className="flex flex-col h-screen bg-[#f4f5f7] text-[#172b4d] font-sans select-none overflow-hidden text-sm">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#091e42] text-white text-xs px-4 py-2 rounded-lg shadow-xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confluence Top Navigation */}
      <header className="h-12 bg-[#0052cc] text-white px-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded transition" title="返回项目目录">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <BookOpen className="w-4 h-4" />
            <span>Atlassian Confluence · 内部需求与架构文档库</span>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs text-white/90 gap-2 w-72">
          <Search className="w-3.5 h-3.5" />
          <span>搜索空间、技术方案、PRD...</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => onSwitchMode('normal')} className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded">
            正常小说模式
          </button>
          <button onClick={onTriggerPanic} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 rounded font-semibold">
            🚨 老板键 (ESC)
          </button>
        </div>
      </header>

      {/* Main Document Body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-[#dfe1e6] p-8 space-y-4 min-h-full flex flex-col">
          {/* Breadcrumbs */}
          <div className="text-xs text-[#6b778c] flex items-center gap-1.5 pb-2 border-b border-[#ebecf0]">
            <span>空间</span>
            <span>/</span>
            <span>基础架构部</span>
            <span>/</span>
            <span>技术方案规范</span>
            <span>/</span>
            <span className="text-[#172b4d] font-semibold">PRD-2026-CH{chapter.chapterNum || '010'}</span>
          </div>

          {/* Doc Title */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#172b4d]">
                【技术方案】第{chapter.chapterNum || '010'}号数据管道与高可用状态机流转设计说明
              </h1>
              <div className="flex items-center gap-3 mt-2 text-xs text-[#6b778c]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>状态: 评审中 (In Review)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>最后更新: 刚刚</span>
                </span>
                <span 
                  className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded cursor-pointer hover:underline"
                  onClick={() => setIsWordCountOpen(true)}
                >
                  文档规模: {metrics.charsNoSpaces.toLocaleString()} 字
                </span>
              </div>
            </div>

            {/* Top Action Pills */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleFormat}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dfe1e6] hover:bg-slate-50 text-xs font-medium text-[#42526e]"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>规范排版</span>
              </button>
              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#0052cc] hover:bg-[#0747a6] text-white text-xs font-semibold shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>导出方案评审 (生成指令)</span>
              </button>
            </div>
          </div>

          {/* Document Content Textarea */}
          <div className="flex-1 relative pt-2">
            <textarea
              value={content}
              onChange={handleContentChange}
              onSelect={handleSelect}
              placeholder="在此编写技术规范方案与正文..."
              className="w-full h-full min-h-[500px] p-4 rounded-lg bg-[#fafbfc] border border-[#ebecf0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-[#172b4d] font-sans text-[15px] leading-relaxed resize-none"
            />

            {/* Selection floating pill */}
            {selection && (
              <div className="absolute bottom-6 right-6 z-40 animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    const nextIndex = annotations.length > 0 ? Math.max(...annotations.map((a) => a.index)) + 1 : 1;
                    setActiveSheetAnn({
                      isOpen: true,
                      index: nextIndex,
                      quotedText: selection.text,
                      comment: '',
                      isExisting: false,
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0052cc] text-white text-xs font-medium shadow-lg hover:bg-[#0747a6] active:scale-95 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>添加方案评审意见 ({selection.text.length}字)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <WordCountModal isOpen={isWordCountOpen} onClose={() => setIsWordCountOpen(false)} metrics={metrics} chapterTitle={chapter.title} />
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
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} chapter={{ ...chapter, content, annotations }} />
    </div>
  );
};
