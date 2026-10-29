import React from 'react';
import { X, MessageSquare, Trash2, Edit3, ChevronRight, AlertCircle } from 'lucide-react';
import { Annotation } from '../types';
import { getCircledNumber } from '../utils/wordCount';

interface AnnotationListSheetProps {
  isOpen: boolean;
  onClose: () => void;
  annotations: Annotation[];
  onSelectAnnotation: (ann: Annotation) => void;
  onEditAnnotation: (ann: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
}

export const AnnotationListSheet: React.FC<AnnotationListSheetProps> = ({
  isOpen,
  onClose,
  annotations,
  onSelectAnnotation,
  onEditAnnotation,
  onDeleteAnnotation,
}) => {
  if (!isOpen) return null;

  const sortedAnnotations = [...annotations].sort((a, b) => a.index - b.index);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-paper-800 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-700 max-h-[82vh] flex flex-col transform transition-transform animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
              <MessageSquare className="w-4 h-4" />
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              批注清单 ({annotations.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List items */}
        <div className="p-4 overflow-y-auto space-y-3">
          {sortedAnnotations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">当前章节暂无批注</p>
              <p className="text-xs mt-1">在正文中选中文字，即可弹出「💬 批注」按钮</p>
            </div>
          ) : (
            sortedAnnotations.map((ann) => {
              const isOrphaned = ann.status === 'orphaned';
              return (
                <div
                  key={ann.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    isOrphaned
                      ? 'bg-slate-50/70 dark:bg-paper-900/40 border-dashed border-slate-300 dark:border-slate-700 opacity-75'
                      : 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        onSelectAnnotation(ann);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-base text-amber-600 dark:text-amber-400">
                          {getCircledNumber(ann.index)}
                        </span>
                        {isOrphaned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                            原句已在正文中删改
                          </span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                            已锚定正文
                          </span>
                        )}
                      </div>

                      {/* Quoted text */}
                      <p className="text-xs font-serif text-slate-600 dark:text-slate-400 italic line-clamp-2 mb-1.5 pl-1 border-l-2 border-amber-300 dark:border-amber-700">
                        “{ann.text}”
                      </p>

                      {/* Comment */}
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {ann.comment || '（未输入具体意见）'}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAnnotation(ann);
                          onClose();
                        }}
                        className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-paper-700 rounded-lg transition"
                        title="编辑批注"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`确定删除批注 ${getCircledNumber(ann.index)} 吗？`)) {
                            onDeleteAnnotation(ann.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-paper-700 rounded-lg transition"
                        title="删除批注"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight 
                        className="w-4 h-4 text-slate-300 dark:text-slate-600 cursor-pointer"
                        onClick={() => {
                          onSelectAnnotation(ann);
                          onClose();
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700/60 bg-paper-50 dark:bg-paper-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-paper-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-paper-700 transition"
          >
            返回正文编辑
          </button>
        </div>
      </div>
    </div>
  );
};
