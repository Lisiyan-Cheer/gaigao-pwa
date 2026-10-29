import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { Chapter } from '../types';
import { generateAIPrompt } from '../utils/promptGenerator';
import { setLastBookName } from '../services/storage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  chapter,
}) => {
  const [bookName, setBookName] = useState(chapter.bookName || '全民高武：只有我的商城能充冥币！');
  const [chapterNum, setChapterNum] = useState(chapter.chapterNum || '001');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const generatedPrompt = generateAIPrompt(chapter, bookName, chapterNum);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      await setLastBookName(bookName);
      setCopied(true);
      showToast('✅ 指令已成功复制！直接粘贴给 AI 对话框即可。');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed, using textarea fallback:', err);
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = generatedPrompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      showToast('✅ 指令已复制！');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `更新《${bookName}》第${chapterNum}章`,
          text: generatedPrompt,
        });
      } catch (e) {
        console.warn('Share cancelled or failed:', e);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-paper-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast popup */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-md animate-fade-in">
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/60 bg-paper-50 dark:bg-paper-900/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                生成 AI 改稿指令
              </h3>
              <p className="text-xs text-slate-400">
                严格遵循两步法：先看方案无误，确认后再落盘
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Metadata Inputs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                小说书名：
              </label>
              <input
                type="text"
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                placeholder="例如：全民高武：只有我的商城能充冥币！"
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-paper-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                章号：
              </label>
              <input
                type="text"
                value={chapterNum}
                onChange={(e) => setChapterNum(e.target.value)}
                placeholder="010"
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-paper-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-100 font-medium text-center"
              />
            </div>
          </div>

          {/* Quick Info bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-paper-900/60 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              <span>
                包含 <b>{chapter.annotations.length}</b> 条批注
              </span>
            </div>
            <div>
              正文 <b>{Array.from(chapter.content.replace(/\s/g, '')).length}</b> 字
            </div>
          </div>

          {/* Two-step safety reminder */}
          <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
            <div>
              <b>防乱改铁律已植入：</b>AI 将只精修你带 ①② 批注的句子，其余你亲手改过的内容原样封存，先出修改方案对比，待你回复“通过”才触碰文件。
            </div>
          </div>

          {/* Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                指令完整预览：
              </span>
              <span className="text-[11px] text-slate-400">
                可滑动查看完整正文与批注
              </span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono max-h-56 overflow-y-auto whitespace-pre-wrap select-all leading-relaxed border border-slate-800">
              {generatedPrompt}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700/60 bg-paper-50 dark:bg-paper-900 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1 text-sm font-medium"
            title="分享至其他 App"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">分享</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-white animate-bounce" />
                <span>已复制到剪贴板！</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-white" />
                <span>一键复制指令 📋</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
