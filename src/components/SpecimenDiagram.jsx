import React from 'react';

export default function SpecimenDiagram({ type }) {
  return (
    <div className="w-full h-44 bg-[#080a0f] border border-zinc-800/90 rounded-xl overflow-hidden relative flex items-center justify-center p-3">
      {/* 工程藍圖微網格背景 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {type === 'nano' && (
        <svg viewBox="0 0 280 140" className="w-full h-full">
          {/* 車道線 */}
          <line x1="0" y1="95" x2="280" y2="95" stroke="#52525b" strokeWidth="2" strokeDasharray="6 6" />
          <text x="14" y="122" fill="#71717a" fontSize="10" fontFamily="monospace">橫向高速直行車流 →</text>
          {/* 奈米待轉格 (極窄 0.8m) */}
          <rect x="95" y="42" width="90" height="22" fill="rgba(239,68,68,0.18)" stroke="#ffffff" strokeWidth="2" />
          <text x="140" y="32" fill="#fca5a5" fontSize="10" textAnchor="middle" fontFamily="monospace">寬度僅 0.8m (奈米格)</text>
          {/* 機車本體 (1.8m 長，頭尾突出白框) */}
          <rect x="128" y="34" width="24" height="46" rx="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
          {/* 突出危險標記 */}
          <circle cx="140" cy="76" r="9" fill="none" stroke="#ef4444" strokeWidth="2" />
          <text x="195" y="79" fill="#ef4444" fontSize="10" fontWeight="bold">← 車尾突出至直行車道</text>
        </svg>
      )}

      {type === 'exposed' && (
        <svg viewBox="0 0 280 140" className="w-full h-full">
          {/* 斑馬線 (未退縮) */}
          {[40, 56, 72, 88, 104, 120].map((y) => (
            <rect key={y} x="45" y={y} width="26" height="8" fill="rgba(255,255,255,0.28)" />
          ))}
          {/* 緊貼斑馬線前方的待撞區 */}
          <rect x="80" y="48" width="32" height="58" fill="rgba(239,68,68,0.2)" stroke="#ffffff" strokeWidth="2" />
          <text x="96" y="38" fill="#fca5a5" fontSize="10" textAnchor="middle">無庇護島「待撞區」</text>
          {/* 切西瓜左轉車軌跡 */}
          <path d="M 250 120 Q 130 115 96 78" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="5 4" />
          <polygon points="96,78 106,82 102,72" fill="#ef4444" />
          <text x="195" y="102" fill="#ef4444" fontSize="10" fontWeight="bold">對向左轉車切西瓜軌跡</text>
        </svg>
      )}

      {type === 'shadow' && (
        <svg viewBox="0 0 280 140" className="w-full h-full">
          {/* 烈日與空蕩蕩的待轉格 */}
          <circle cx="42" cy="32" r="14" fill="#f59e0b" opacity="0.85" />
          <rect x="65" y="65" width="48" height="45" fill="rgba(255,255,255,0.04)" stroke="#ffffff" strokeWidth="2" />
          <text x="89" y="92" fill="#71717a" fontSize="10" textAnchor="middle">50°C 空待轉格</text>
          {/* 電線桿與斜長陰影 */}
          <circle cx="155" cy="30" r="6" fill="#a1a1aa" />
          <polygon points="150,32 160,28 245,115 215,125" fill="rgba(39,39,42,0.9)" stroke="#3f3f46" strokeDasharray="3 3" />
          {/* 躲在陰影裡的4輛機車 */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={170 + i * 15} y={52 + i * 16} width="14" height="7" rx="3" fill="#38bdf8" />
          ))}
          <text x="215" y="42" fill="#38bdf8" fontSize="10" textAnchor="middle">騎士自動排列於電線桿陰影內</text>
        </svg>
      )}

      {type === 'overflow' && (
        <svg viewBox="0 0 280 140" className="w-full h-full">
          {/* 斑馬線 */}
          {[25, 45, 65, 85, 105].map((x) => (
            <rect key={x} x={x} y="98" width="10" height="24" fill="rgba(255,255,255,0.22)" />
          ))}
          {/* 標準待轉格 */}
          <rect x="145" y="42" width="52" height="42" fill="rgba(239,68,68,0.2)" stroke="#ffffff" strokeWidth="2" />
          {/* 塞爆並往外溢流的機車群 */}
          {[
            [152, 48], [172, 48], [152, 62], [172, 62], [152, 74], [172, 74],
            [125, 55], [125, 70], [105, 65], [148, 92], [168, 95], [132, 96], [112, 85]
          ].map(([mx, my], idx) => (
            <rect key={idx} x={mx} y={my} width="14" height="7" rx="2" fill={idx < 6 ? '#38bdf8' : '#ef4444'} />
          ))}
          <text x="145" y="28" fill="#fca5a5" fontSize="10" textAnchor="middle" fontWeight="bold">尖峰溢流：吞噬斑馬線與直行道</text>
        </svg>
      )}

      {type === 'zebra' && (
        <svg viewBox="0 0 280 140" className="w-full h-full">
          {/* 斑馬線 */}
          {[40, 62, 84, 106, 128, 150, 172, 194, 216].map((x) => (
            <rect key={x} x={x} y="55" width="12" height="42" fill="rgba(255,255,255,0.28)" />
          ))}
          {/* 水溝蓋 */}
          <rect x="100" y="34" width="36" height="16" fill="#27272a" stroke="#71717a" strokeWidth="1.5" />
          <line x1="108" y1="34" x2="108" y2="50" stroke="#71717a" />
          <line x1="118" y1="34" x2="118" y2="50" stroke="#71717a" />
          <line x1="128" y1="34" x2="128" y2="50" stroke="#71717a" />
          {/* 直接疊在斑馬線與水溝蓋上的待轉格 */}
          <rect x="88" y="38" width="95" height="48" fill="rgba(245,158,11,0.18)" stroke="#fbbf24" strokeWidth="2.5" />
          <text x="135" y="24" fill="#fcd34d" fontSize="10" textAnchor="middle">待轉格與斑馬線、排水溝蓋三者重疊</text>
          <text x="135" y="116" fill="#a1a1aa" fontSize="10" textAnchor="middle">↑ 行人過馬路與待轉機車正面卡死 ↑</text>
        </svg>
      )}

      {type === 'ghost' && (
        <svg viewBox="0 0 280 140" className="w-full h-full">
          {/* 已拆除的藍牌虛線框 */}
          <circle cx="72" cy="48" r="18" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="72" y="52" fill="#60a5fa" fontSize="9" textAnchor="middle">藍牌已拆</text>
          {/* 地面保留的彈性待轉白框 */}
          <rect x="135" y="45" width="85" height="52" fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" />
          <text x="177" y="68" fill="#6ee7b7" fontSize="11" textAnchor="middle" fontWeight="bold">機慢車待轉區</text>
          <text x="177" y="84" fill="#a1a1aa" fontSize="9" textAnchor="middle">(非強制 · 供弱勢車彈性使用)</text>
          <text x="140" y="122" fill="#d4d4d8" fontSize="10" textAnchor="middle">2023–2026+ 雙軌過渡期地景</text>
        </svg>
      )}
    </div>
  );
}
