import React from 'react';
import { ArrowLeft, Share2, Heart, Bookmark } from 'lucide-react';

interface BossPanicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BossPanicModal: React.FC<BossPanicModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-white text-[#333333] font-sans flex flex-col select-none overflow-y-auto cursor-default animate-fade-in"
      onClick={onClose}
    >
      {/* Top Navbar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-[#e7edf2] px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-[#0084c8] hover:underline font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回工作区 (ESC)</span>
          </button>
          <span className="text-[#0084c8] font-bold text-xl tracking-tight">gooood</span>
          <span className="text-xs text-[#777] hidden sm:inline">
            首页 / 建筑设计 / 乡野营造 / 大乐之野 · 松阳青山客栈
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#666]">
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#0084c8]">
            <Heart className="w-3.5 h-3.5" /> 2,418
          </span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#0084c8]">
            <Bookmark className="w-3.5 h-3.5" /> 收藏
          </span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#0084c8]">
            <Share2 className="w-3.5 h-3.5" /> 分享
          </span>
        </div>
      </div>

      {/* Architectural Article Page Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <span className="px-2 py-0.5 rounded bg-[#f0f6fa] text-[#0084c8] text-xs font-semibold">
            建筑 / 乡村改造 / 酒店民宿
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#112233] mt-2 leading-tight">
            大乐之野 · 松阳青山客栈，浙江 / 空间营造建筑事务所
          </h1>
          <p className="text-xs text-[#8899aa] mt-1.5">
            发布日期：2026-10-28 · 评论：42 · 阅读量：38,190 · 标签：夯土墙 老木柱 庭院天光
          </p>
        </div>

        {/* Hero Architectural Image */}
        <div className="rounded-xl overflow-hidden shadow-sm border border-[#e7edf2] bg-slate-100 aspect-video relative">
          <img 
            src="https://oss.gooood.cn/uploads/2026/10/00-gooood-interview-Yang-Dingliang%E7%9A%84%E5%89%AF%E6%9C%AC_%E5%89%AF%E6%9C%AC-gsj-472x303.png" 
            alt="大乐之野"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Project Facts Table */}
        <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e7edf2] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-[#888]">项目地点</div>
            <div className="font-semibold text-[#222]">浙江省丽水市松阳县</div>
          </div>
          <div>
            <div className="text-[#888]">主创建筑师</div>
            <div className="font-semibold text-[#222]">空间营造设计团队</div>
          </div>
          <div>
            <div className="text-[#888]">建筑面积</div>
            <div className="font-semibold text-[#222]">1,850 平方米</div>
          </div>
          <div>
            <div className="text-[#888]">建成时间</div>
            <div className="font-semibold text-[#222]">2026 年秋</div>
          </div>
        </div>

        {/* Article Concept Text */}
        <div className="space-y-4 text-sm leading-[1.85] text-[#333333] font-serif">
          <p>
            基地位于浙南山区典型梯田古村落中，面朝连绵苍山与千亩茶园。原有建筑为传统浙南双斜坡瓦顶夯土木构民居，由于年久失修，部分屋面出现漏水与梁柱倾斜。
          </p>
          <p>
            设计策略并未采取全然推倒重建的激进手法，而是采取“针灸式微介入”原则：保留原始建筑具有岁月质感的老石砌地基与部分夯土外墙，植入现代钢木复合结构以提高空间跨度与采光通透度。
          </p>
          <p>
            在空间序列组织上，入口经由一段低矮深邃的毛石砌筑步道，转折推门后顿见豁然开朗的双层挑空中庭，天光透过屋脊天窗倾泻而下，使得自然与时间的流转成为室内最核心的质感所在。
          </p>
        </div>

        <div className="text-center pt-8 pb-12 border-t border-[#e7edf2] text-xs text-[#888]">
          点击任意区域或按 ESC 即可关闭遮挡，返回正文创作
        </div>
      </div>
    </div>
  );
};
