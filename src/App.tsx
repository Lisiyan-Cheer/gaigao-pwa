import React, { useState, useEffect } from 'react';
import { Chapter } from './types';
import { 
  getChapters, 
  saveChapter, 
  deleteChapter, 
  getLastBookName, 
  setLastBookName 
} from './services/storage';
import { ChapterList } from './components/ChapterList';
import { Editor } from './components/Editor';
import { NewChapterModal } from './components/NewChapterModal';

export const App: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentBookName, setCurrentBookName] = useState('全民高武：只有我的商城能充冥币！');
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('gaigao_theme') === 'dark' ||
      (!localStorage.getItem('gaigao_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isLoading, setIsLoading] = useState(true);

  // Apply dark mode class to root html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gaigao_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gaigao_theme', 'light');
    }
  }, [isDarkMode]);

  // Load chapters & book name on start
  const loadData = async () => {
    try {
      const loadedChapters = await getChapters();
      const lastBook = await getLastBookName();
      setChapters(loadedChapters);
      if (lastBook) setCurrentBookName(lastBook);
      
      // If we only have 1 chapter and it's the demo, or if URL specifies, we can stay on list
    } catch (err) {
      console.error('Failed loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveChapter = async (updated: Chapter) => {
    await saveChapter(updated);
    setChapters((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleDeleteChapter = async (id: string) => {
    await deleteChapter(id);
    setChapters((prev) => prev.filter((c) => c.id !== id));
    if (activeChapterId === id) {
      setActiveChapterId(null);
    }
  };

  const handleChapterCreated = async (newChapter: Chapter) => {
    await saveChapter(newChapter);
    await setLastBookName(newChapter.bookName);
    setCurrentBookName(newChapter.bookName);
    setChapters((prev) => [newChapter, ...prev]);
    setActiveChapterId(newChapter.id);
  };

  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-paper-50 dark:bg-paper-900 text-slate-500">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm font-medium">正在准备改稿本...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-paper-900 transition-colors">
      {activeChapter ? (
        <Editor
          chapter={activeChapter}
          onSaveChapter={handleSaveChapter}
          onBack={() => setActiveChapterId(null)}
        />
      ) : (
        <ChapterList
          chapters={chapters}
          currentBookName={currentBookName}
          onSelectChapter={(c) => setActiveChapterId(c.id)}
          onNewChapter={() => setIsNewModalOpen(true)}
          onDeleteChapter={handleDeleteChapter}
          onReload={loadData}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        />
      )}

      {/* New Chapter Modal */}
      <NewChapterModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        defaultBookName={currentBookName}
        onChapterCreated={handleChapterCreated}
      />
    </div>
  );
};
