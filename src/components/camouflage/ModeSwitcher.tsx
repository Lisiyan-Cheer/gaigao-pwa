import React, { useState } from 'react';
import { Shield, Smartphone, Globe, Code, FileText, AlertTriangle } from 'lucide-react';
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
        title="电脑防看/伪装模式切换"
      >
        <Shield className="w-3.5 h-3.5 text-sky-500" />
        <span className="hidden sm:inline">
          {currentMode === 'normal' && '正常模式'}
          {currentMode === 'gooood' && '🏛️ 谷德设计网伪装'}
          {currentMode === 'vscode' && '💻 VS Code 程序员'}
          {currentMode === 'confluence' && '📄 企业需求文档'}
        </span>
        <span className="sm:hidden">伪装</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-white dark:bg-paper-800 shadow-2xl border border-slate-200 dark:border-slate-700 z-50 p-2 text-xs animate-fade-in">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 mb-1">
              职场防看 / 页面伪装模式
            </div>

            {/* gooood.cn Mode */}
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
                <div className="flex items-center gap-1 font-bold text-[#0084c8]">
                  <span>谷德设计网伪装 🏛️</span>
                  <span className="text-[10px] bg-sky-100 text-sky-700 px-1 rounded font-normal">推荐</span>
                </div>
                <div className="text-[10px] text-slate-400 font-normal">1:1 融入 gooood.cn 右侧广告展位中</div>
              </div>
            </button>

            {/* Normal Mode */}
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
                <div>正常小说写作模式</div>
                <div className="text-[10px] text-slate-400 font-normal">移动端与标准清爽界面</div>
              </div>
            </button>

            {/* VS Code */}
            <button
              type="button"
              onClick={() => {
                onSelectMode('vscode');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition ${
                currentMode === 'vscode'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-paper-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Code className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <div>VS Code 程序员模式 💻</div>
                <div className="text-[10px] text-slate-400 font-normal">代码行号、工程资源树</div>
              </div>
            </button>

            {/* Confluence */}
            <button
              type="button"
              onClick={() => {
                onSelectMode('confluence');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition ${
                currentMode === 'confluence'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-paper-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <div>企业需求方案模式 📄</div>
                <div className="text-[10px] text-slate-400 font-normal">Atlassian 商务文档风格</div>
              </div>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

            {/* Boss Key */}
            <button
              type="button"
              onClick={() => {
                onTriggerPanic();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition font-medium"
            >
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <div>
                <div>紧急老板键 (ESC)</div>
                <div className="text-[10px] text-rose-400 font-normal">一键全屏假终端编译日志</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
