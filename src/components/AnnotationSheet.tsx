import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Trash2, Check, Tag } from 'lucide-react';
import { getCircledNumber } from '../utils/wordCount';

interface AnnotationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  index: number;
  quotedText: string;
  initialComment?: string;
  isExisting?: boolean;
  onSave: (comment: string) => void;
  onDelete?: () => void;
}

const QUICK_TAGS = [
  '太快了，补个反扑动作',
  '换具体人物的具体反应',
  '台词拆短，垫微动作',
  '消灭教案体，去AI味',
  '砍掉多余定语修饰',
  '情绪铺垫不够，再拉扯一下',
  '这里节奏略平，加点爽感反馈',
];

export const AnnotationSheet: React.FC<AnnotationSheetProps> = ({
  isOpen,
  onClose,
  index,
  quotedText,
  initialComment = '',
  isExisting = false,
  onSave,
  onDelete,
}) => {
  const [comment, setComment] = useState(initialComment);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setComment(initialComment);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen, initialComment]);

  if (!isOpen) return null;

  const handleTagClick = (tag: string) => {
    if (!comment.trim()) {
      setComment(tag);
    } else {
      setComment((prev) => `${prev}；${tag}`);
    }
  };

  const handleSave = () => {
    onSave(comment.trim());
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-paper-800 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-700 max-h-[88vh] flex flex-col transform transition-transform animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-base">
              {getCircledNumber(index)}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {isExisting ? '编辑批注意见' : '添加选区批注'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isExisting && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('确定删除该批注吗？')) {
                    onDelete();
                    onClose();
                  }
                }}
                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                title="删除批注"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quoted Sentence Preview */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40">
            <div className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>被选中的原句：</span>
            </div>
            <p className="text-sm font-serif leading-relaxed text-slate-800 dark:text-slate-200 italic line-clamp-3">
              “{quotedText}”
            </p>
          </div>

          {/* Quick tags */}
          <div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1 font-medium">
              <Tag className="w-3 h-3" />
              <span>快捷点注短语（点击填入）：</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="px-2.5 py-1 text-xs rounded-full bg-slate-100 dark:bg-paper-900 hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-900/40 dark:hover:text-orange-300 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              你的修改意见 / AI 精修要求：
            </label>
            <textarea
              ref={textareaRef}
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="例如：太快了，补一个僵尸反扑的动作再跪；台词拆短点..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-paper-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700/60 bg-paper-50 dark:bg-paper-900 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition"
          >
            <Check className="w-4 h-4" />
            <span>保存批注</span>
          </button>
        </div>
      </div>
    </div>
  );
};
