import React, { useState } from 'react';
import { X, PlusCircle, Sparkles, Clipboard, Check } from 'lucide-react';
import { Chapter } from '../types';
import { parseChapterContent } from '../utils/chapterParser';
import { formatNovelText } from '../utils/novelFormatter';

interface NewChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBookName: string;
  onChapterCreated: (chapter: Chapter) => void;
}

export const NewChapterModal: React.FC<NewChapterModalProps> = ({
  isOpen,
  onClose,
  defaultBookName,
  onChapterCreated,
}) => {
  const [bookName, setBookName] = useState(defaultBookName);
  const [rawText, setRawText] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [title, setTitle] = useState('');
  const [autoFormat, setAutoFormat] = useState(true);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setRawText(text);
    if (!title || title.startsWith('第') || title === '未命名章节') {
      const parsed = parseChapterContent(text);
      if (parsed.chapterNum) setChapterNum(parsed.chapterNum);
      if (parsed.title) setTitle(parsed.title);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        handleTextChange(clip);
      }
    } catch (e) {
      console.warn('Clipboard read error:', e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    let contentToSave = rawText;
    if (autoFormat) {
      contentToSave = formatNovelText(rawText);
    }

    const finalTitle = title.trim() || `第${chapterNum || '001'}章`;
    const newChapter: Chapter = {
      id: `chapter-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      bookName: bookName.trim() || '我的小说',
      chapterNum: chapterNum.trim() || '001',
      title: finalTitle,
      content: contentToSave,
      annotations: [],
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    onChapterCreated(newChapter);
    onClose();
  };

  const wordCount = Array.from(rawText.replace(/\s/g, '')).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-paper-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/60 bg-paper-50 dark:bg-paper-900/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-orange-500 text-white">
              <PlusCircle className="w-4 h-4" />
            </span>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              新建改稿章节
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Book name */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              所属小说：
            </label>
            <input
              type="text"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="例如：全民高武：只有我的商城能充冥币！"
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-paper-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Chapter title & number */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                章节标题：
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：第010章 这特么是顶配战宠？！"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-paper-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-100"
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
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-paper-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-100 text-center"
              />
            </div>
          </div>

          {/* Paste Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                粘贴正文内容：
              </label>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>从剪贴板粘贴</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="直接将电脑或番茄里的原稿粘贴在此处，系统将自动提取章号与标题..."
              className="w-full p-3.5 text-sm rounded-2xl bg-slate-50 dark:bg-paper-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-100 leading-relaxed font-serif"
            />
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoFormat}
                onChange={(e) => setAutoFormat(e.target.checked)}
                className="rounded text-orange-500 focus:ring-orange-400 w-4 h-4"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                导入时自动一键规范排版（清首尾空格与多余空行）
              </span>
            </label>
            <div>
              已检测字数：<b>{wordCount}</b> 字
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!rawText.trim()}
              className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition"
            >
              <Check className="w-4 h-4" />
              <span>导入并开始改稿</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
