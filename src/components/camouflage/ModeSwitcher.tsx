import React, { useState } from 'react';
import { Shield, Smartphone, Globe, EyeOff } from 'lucide-react';
import { CamouflageMode } from '../../types/camouflage';

interface ModeSwitcherProps {
  currentMode: CamouflageMode;
  onSelectMode: (mode: CamouflageMode) => void;
  onTriggerPanic: () => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  currentMode,
  onSelectMode,
  onTriggerPanic,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-paper-800 dark:hover:bg-paper-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 transition"
        title="电脑防看 / 谷德设计网伪装切换"
      >
        <Shield className="w-3.5 h-3.5 text-[#0084c8]" />
        <span className="hidden sm:inline">
          {currentMode === 'normal' ? '正常模式' : '🏛️ 谷德设计网'}
        </span>
        <span className="sm:hidden">{currentMode === 'normal' ? '模式' : '谷德'}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-1.5 w-60 rounded-2xl bg-white dark:bg-paper-800 shadow-2xl border border-slate-200 dark:border-slate-700 z-50 p-2 text-xs animate-fade-in">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 mb-1">
              界面显示与防看伪装
            </div>

            {/* 谷德设计网伪装 */}
            <button
              type="button"
              onClick={() => {
                onSelectMode('gooood');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition ${
                currentMode === 'gooood'
                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-paper-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Globe className="w-4 h-4 text-[#0084c8] shrink-0" />
              <div>
                <div className="font-bold text-[#0084c8]">谷德设计网伪装 🏛️</div>
                <div className="text-[10px] text-slate-400 font-normal">融入 gooood.cn 右侧广告展位中</div>
              </div>
            </button>

            {/* 正常模式 */}
            <button
              type="button"
              onClick={() => {
                onSelectMode('normal');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition ${
                currentMode === 'normal'
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-paper-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Smartphone className="w-4 h-4 text-orange-500 shrink-0" />
              <div>
                <div>正常小说写作模式 📱</div>
                <div className="text-[10px] text-slate-400 font-normal">标准清爽双端排版</div>
              </div>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

            {/* 老板键 */}
            <button
              type="button"
              onClick={() => {
                onTriggerPanic();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition font-medium"
            >
              <EyeOff className="w-4 h-4 text-rose-500 shrink-0" />
              <div>
                <div>紧急遮挡键 (ESC)</div>
                <div className="text-[10px] text-rose-400 font-normal">一键全屏建筑作品案卷</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
