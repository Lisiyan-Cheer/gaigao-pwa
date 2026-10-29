import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  Clock, 
  Sparkles, 
  Download, 
  Upload, 
  Moon, 
  Sun,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { Chapter } from '../types';
import { computeTextMetrics } from '../utils/wordCount';
import { exportAllData, importData } from '../services/storage';

interface ChapterListProps {
  chapters: Chapter[];
  currentBookName: string;
  onSelectChapter: (chapter: Chapter) => void;
  onNewChapter: () => void;
  onDeleteChapter: (id: string) => void;
  onReload: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  currentBookName,
  onSelectChapter,
  onNewChapter,
  onDeleteChapter,
  onReload,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = chapters.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.chapterNum.includes(searchTerm) ||
      c.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportBackup = async () => {
    try {
      const dataStr = await exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `改稿本备份_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('备份导出失败：' + e);
    }
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const success = await importData(text);
        if (success) {
          alert('数据恢复成功！');
          onReload();
        } else {
          alert('数据恢复失败，文件格式不正确。');
        }
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-paper-900 text-slate-800 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-paper-50/90 dark:bg-paper-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                改稿本
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                《{currentBookName}》
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-paper-800 transition"
              title="切换深浅主题"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleExportBackup}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-paper-800 transition"
              title="备份导出数据"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleImportBackup}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-paper-800 transition"
              title="导入恢复备份"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-4">
        {/* Search & New button */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索章节名、正文或批注..."
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl bg-white dark:bg-paper-800 border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <button
            onClick={onNewChapter}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-medium text-sm shadow-md shadow-orange-500/20 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>新建章节</span>
          </button>
        </div>

        {/* Chapter Cards List */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-semibold">暂无改稿章节</p>
              <p className="text-xs mt-1">点击右上角「新建章节」粘贴原稿即可开工</p>
            </div>
          ) : (
            filtered.map((chapter) => {
              const metrics = computeTextMetrics(chapter.content);
              const annotationCount = chapter.annotations.length;
              const dateStr = new Date(chapter.updatedAt).toLocaleDateString(undefined, {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={chapter.id}
                  onClick={() => onSelectChapter(chapter)}
                  className="group relative p-4 rounded-2xl bg-white dark:bg-paper-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-orange-400 dark:hover:border-orange-500 shadow-sm hover:shadow transition cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Chapter Title */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                        {chapter.title}
                      </h3>

                      {/* Content snippet */}
                      <p className="text-xs font-serif text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {chapter.content.replace(/\n+/g, ' ').slice(0, 100) || '（空白章节）'}
                      </p>

                      {/* Meta Tags */}
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 dark:text-slate-500">
                        <span className="font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                          {metrics.charsNoSpaces.toLocaleString()} 字
                        </span>

                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${
                          annotationCount > 0 
                            ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium'
                            : 'bg-slate-100 dark:bg-paper-900 text-slate-400'
                        }`}>
                          <MessageSquare className="w-3 h-3" />
                          <span>{annotationCount}条批注</span>
                        </span>

                        <span className="flex items-center gap-1 ml-auto text-[11px]">
                          <Clock className="w-3 h-3" />
                          <span>{dateStr}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right side delete / arrow */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`确定删除《${chapter.title}》吗？`)) {
                            onDeleteChapter(chapter.id);
                          }
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-paper-700 rounded-lg transition"
                        title="删除章节"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-orange-500 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
