import React from 'react';
import { X, Sparkles, BookOpen, AlignLeft, Hash, Layers } from 'lucide-react';
import { TextMetrics } from '../types';

interface WordCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: TextMetrics;
  chapterTitle?: string;
}

export const WordCountModal: React.FC<WordCountModalProps> = ({
  isOpen,
  onClose,
  metrics,
  chapterTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white dark:bg-paper-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-paper-50/50 dark:bg-paper-900/40">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">字数统计详情</h3>
              {chapterTitle && (
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                  {chapterTitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Main big metric */}
          <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-800/40 text-center">
            <div className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
              番茄 / 平台官方纯正文字数
            </div>
            <div className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 tracking-tight">
              {metrics.charsNoSpaces.toLocaleString()}
              <span className="text-sm font-normal ml-1">字</span>
            </div>
            <p className="text-xs text-orange-500/80 dark:text-orange-400/70 mt-1">
              字符数（不含空格），精确按码点对齐
            </p>
          </div>

          {/* Grid breakdown (reference VMark) */}
          <div className="grid grid-cols-2 gap-2.5 text-sm">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-paper-900/60 border border-slate-100 dark:border-slate-700/60 flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">中文汉字 (CJK)</div>
                <div className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  {metrics.cjkChars.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-paper-900/60 border border-slate-100 dark:border-slate-700/60 flex items-start gap-2.5">
              <Hash className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">总字符 (含空格)</div>
                <div className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  {metrics.charsWithSpaces.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-paper-900/60 border border-slate-100 dark:border-slate-700/60 flex items-start gap-2.5">
              <AlignLeft className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">自然段落数</div>
                <div className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  {metrics.paragraphs.toLocaleString()} 段
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-paper-900/60 border border-slate-100 dark:border-slate-700/60 flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">平均段落字数</div>
                <div className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  {metrics.avgParagraphChars} 字/段
                </div>
              </div>
            </div>
          </div>

          {/* Quick Pacing tip for mobile novel writers */}
          <div className="text-xs p-2.5 rounded-lg bg-slate-100/70 dark:bg-paper-900/40 text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>💡</span>
            <span>
              {metrics.avgParagraphChars > 60
                ? '提示：当前平均段长偏长，番茄快节奏爽文建议保持 25~45 字一换段。'
                : '节奏极佳：短句短段，呼吸感良好，符合移动端阅读黄金节奏！'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-paper-50 dark:bg-paper-900 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-medium text-sm transition"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
