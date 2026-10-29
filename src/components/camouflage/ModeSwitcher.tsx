import React, { useState } from 'react';
import { Shield, Code, FileText, Smartphone, AlertTriangle } from 'lucide-react';
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
        title="电脑防看/伪装模式切换 (支持 VS Code/需求文档/老板键)"
      >
        <Shield className="w-3.5 h-3.5 text-blue-500" />
        <span className="hidden sm:inline">
          {currentMode === 'normal' && '正常模式'}
          {currentMode === 'vscode' && '💻 VS Code 伪装'}
          {currentMode === 'confluence' && '📄 需求文档伪装'}
        </span>
        <span className="sm:hidden">伪装</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-1.5 w-60 rounded-2xl bg-white dark:bg-paper-800 shadow-2xl border border-slate-200 dark:border-slate-700 z-50 p-2 text-xs animate-fade-in">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 mb-1">
              电脑端防看 / 职场伪装设置
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectMode('normal');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition ${
                currentMode === 'normal'
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-paper-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Smartphone className="w-4 h-4 text-orange-500" />
              <div>
                <div>正常写作模式</div>
                <div className="text-[10px] text-slate-400 font-normal">标准手机/网页清爽排版</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectMode('vscode');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition ${
                currentMode === 'vscode'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-paper-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Code className="w-4 h-4 text-blue-500" />
              <div>
                <div>VS Code 程序员模式 💻</div>
                <div className="text-[10px] text-slate-400 font-normal">行号、资源树、代码注释伪装</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectMode('confluence');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition ${
                currentMode === 'confluence'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-paper-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <div>
                <div>企业需求文档模式 📄</div>
                <div className="text-[10px] text-slate-400 font-normal">飞书/Confluence 技术架构方案</div>
              </div>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

            <button
              type="button"
              onClick={() => {
                onTriggerPanic();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition font-medium"
            >
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <div>
                <div>紧急老板键 (ESC)</div>
                <div className="text-[10px] text-rose-400 font-normal">一键切入高大上全屏编译终端</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
