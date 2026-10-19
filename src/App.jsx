import React, { useState, useMemo } from 'react';
import {
  Archive,
  Clock,
  Compass,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Share2,
  FileText,
  Sparkles,
  ChevronRight,
  Layers,
  History,
  HelpCircle,
  Copy,
  Check,
  Award,
  Send
} from 'lucide-react';
import {
  HISTORY_TIMELINE,
  CITY_STATS,
  ARCHIVE_SPECIMENS,
  QUIZ_QUESTIONS
} from './data/archiveData';
import IntersectionSimulator from './components/IntersectionSimulator';
import SpecimenDiagram from './components/SpecimenDiagram';

export default function App() {
  // --- 第一章：全台待轉區數量科學推估器狀態 ---
  const [coveragePercent, setCoveragePercent] = useState(68); // 號誌路口設有待轉區比例 (%)
  const [boxesPerIntersection, setBoxesPerIntersection] = useState(3.0); // 平均每個路口幾個方向有待轉格

  const totalIntersections = 39551; // 六都 28,051 + 其他縣市與省道約 11,500
  const estimatedBoxes = useMemo(() => {
    return Math.round(totalIntersections * (coveragePercent / 100) * boxesPerIntersection);
  }, [coveragePercent, boxesPerIntersection]);

  // 換算趣味指標：平均一格 4.5 平方公尺，台北大巨蛋球場草皮面積約 13,000 平方公尺
  const totalAreaSqm = Math.round(estimatedBoxes * 4.5);
  const taipeiDomes = (totalAreaSqm / 13000).toFixed(1);

  // --- 第四章：3秒路口體感規則測驗狀態 ---
  const [quizAnswers, setQuizAnswers] = useState({});
  const handleSelectQuiz = (qid, optionId) => {
    setQuizAnswers((prev) => ({ ...prev, [qid]: optionId }));
  };

  // --- 第五章：個人待轉歷史足跡計算機狀態 ---
  const [ridingYears, setRidingYears] = useState(10);
  const [dailyHookTurns, setDailyHookTurns] = useState(4);
  const [avgWaitSeconds, setAvgWaitSeconds] = useState(50);

  const personalFootprint = useMemo(() => {
    const totalTurns = ridingYears * 330 * dailyHookTurns;
    const totalHours = Math.round((totalTurns * avgWaitSeconds) / 3600);
    const totalDays = (totalHours / 24).toFixed(1);
    const roundIslandTrips = (totalHours / 24).toFixed(1); // 騎機車環島一圈約24小時純騎乘時間
    return { totalTurns, totalHours, totalDays, roundIslandTrips };
  }, [ridingYears, dailyHookTurns, avgWaitSeconds]);

  // --- 第五章：集體記憶牆與 1999 市政建議書產生器 ---
  const [memories, setMemories] = useState([
    {
      id: 1,
      author: '台北大橋通勤族 · 騎齡 14 年',
      location: '台北市 民權西路 / 延平北路口',
      stance: '支持車向分流＋保留安全彈性待轉',
      content: '每天早上從三重下台北橋，看著上百台機車像俄羅斯方塊一樣塞進那個小小的白框，溢流到連直行車都過不去。希望未來我們的下一代不用再在路口中央淋雨等第二次紅燈。',
      year: '2026.10'
    },
    {
      id: 2,
      author: '台南返鄉青年 · 騎齡 8 年',
      location: '台南市 中西區民生路',
      stance: '支持車向分流＋保留安全彈性待轉',
      content: '台南開放單向兩車道直接左轉後，一開始長輩很擔心，但同時保留地上待轉格給阿公阿嬤用，現在年輕人提前打方向燈靠左轉、慢車靠右待轉，外側再也沒有跟右轉車鬼切擦撞了！',
      year: '2026.10'
    },
    {
      id: 3,
      author: '交通工程系學生 · 騎齡 4 年',
      location: '台中市 台灣大道沿線',
      stance: '記錄即將消失的台灣街頭記憶',
      content: '外國朋友來台灣玩，最驚訝的就是為什麼大太陽下有十幾台機車不並排停在白框裡，而是排成一列躲在電線桿的影子裡。這絕對是世界交通史上最獨特的亞熱帶地景。',
      year: '2026.10'
    }
  ]);

  const [newAuthor, setNewAuthor] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newContent, setNewContent] = useState('');
  const [copiedType, setCopiedType] = useState(null);

  // 1999 路口改善建議書產生器狀態
  const [petitionCity, setPetitionCity] = useState('台北市');
  const [petitionRoad, setPetitionRoad] = useState('忠孝東路與敦化南路口');
  const [petitionIssue, setPetitionIssue] = useState('待轉格未退縮且無庇護島（暴露於撞擊軌跡）、尖峰時段嚴重溢流堵塞直行車道');

  const petitionText = `【市政交通工程改善建議書：建請檢討「${petitionCity}${petitionRoad}」之車向分流配置與待轉區幾何安全】

主旨：反映「${petitionCity}${petitionRoad}」現行機慢車左轉動線與待轉區幾何設計衍生交織風險，建請貴局依交通工程學理進行「車向分流」與「人本安全退縮」改善。

說明：
一、查旨揭路口目前觀察到以下具體交通工程問題：「${petitionIssue}」。
二、依據近年交通部「因地制宜檢討兩段式左轉」原則及各直轄市試辦經驗，強制內側禁行機車與兩段式左轉，常迫使左轉機車於接近路口時向外側變換車道，與同向準備右轉之汽車產生嚴重動線交織（Weaving Conflict）；且尖峰時段待轉格容量不足溢流時，更直接阻礙斑馬線行人通行並回堵直行車道。
三、具體改善建議如下：
  1. 【推動車向分流】：評估塗銷該路段內側車道「禁行機車」標線或增設機慢車左轉專用道，讓具備直接左轉能力之用路人依「左轉靠左、右轉靠右」原則順暢分流。
  2. 【保留安全彈性待轉區】：考量年長者、慢速車及習慣兩段式左轉用路人之需求，建議拆除強制遵20藍牌改為非強制之「彈性待轉」，並配合行人穿越道（斑馬線）退縮與行人庇護島設置，將待轉格移至受庇護島保護之安全淨空區，徹底消除「待撞」風險。`;

  const handleAddMemory = (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setMemories((prev) => [
      {
        id: Date.now(),
        author: newAuthor.trim() || '匿名台灣用路人',
        location: newLocation.trim() || '台灣某個十字路口',
        stance: '支持車向分流＋保留安全彈性待轉',
        content: newContent.trim(),
        year: '2026.10'
      },
      ...prev
    ]);
    setNewAuthor('');
    setNewLocation('');
    setNewContent('');
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* 頂部導覽列 (Digital Archive Header) */}
      <header className="sticky top-0 z-50 bg-[#07080a]/85 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-signblue-500 border-2 border-white flex items-center justify-center font-bold text-[11px] tracking-tighter shadow-md shadow-blue-900/50">
              待轉
            </div>
            <div>
              <div className="text-xs font-mono text-zinc-400 tracking-wider uppercase">
                TAIWAN HOOK-TURN ARCHIVE · 1969–2026
              </div>
              <div className="text-sm font-bold text-white tracking-tight">
                白框裡的台灣史：機車待轉區數位紀事
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#chapter-scale" className="hover:text-white transition">01. 全台數量揭秘</a>
            <a href="#chapter-history" className="hover:text-white transition">02. 半世紀演進史</a>
            <a href="#chapter-specimens" className="hover:text-white transition">03. 地景標本館</a>
            <a href="#chapter-simulator" className="hover:text-white transition">04. 車流衝突實驗室</a>
            <a href="#chapter-quiz" className="hover:text-white transition">05. 街景認知測驗</a>
            <a href="#chapter-legacy" className="px-3 py-1.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30 transition">
              06. 留下你的歷史座標
            </a>
          </nav>
        </div>
      </header>

      {/* HERO 序幕：白框裡的台灣史 */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-grid-pattern pt-16 pb-24 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700/80 text-xs font-mono text-blue-400 mb-6">
            <Archive className="w-3.5 h-3.5" />
            <span>SPECIAL REPORT & DIGITAL MONUMENT · 當代交通文化遺產專題</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.12] mb-8">
            這塊白框曾經統治台灣路口四十年。<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300">
              但連政府都不知道，全台到底畫了幾個。
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 max-w-3xl leading-relaxed font-light mb-10">
            從 1984 年台北市忠孝東路的第一批「棋盤格」開始，全台灣 1,400 萬名機車騎士學會了一種全世界罕見的身體記憶：要左轉，請先靠右。四十多年過去，這塊長寬不過數公尺的白色方框，塑造了獨特的台灣街頭文化，卻也衍生出無數「待撞區」與外側交織悲劇。當台灣正逐步走向「車向分流」的歷史轉捩點，我們建立這座數位博物館，記錄這段或許未來將在地球上消失的獨特歷史。
          </p>

          {/* 核心四大數據摘要卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            <div className="bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-xl p-5">
              <div className="text-xs font-mono text-zinc-400 uppercase">OFFICIAL NATIONAL COUNT</div>
              <div className="text-3xl font-mono font-bold text-red-400 mt-2">0 份官方統計</div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                政府資料開放平臺與交通部至今無全國統一之「待轉區總數」清冊，權責分散於各縣市與鄉鎮公所。
              </p>
            </div>

            <div className="bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-xl p-5">
              <div className="text-xs font-mono text-zinc-400 uppercase">ESTIMATED HOOK-TURN BOXES</div>
              <div className="text-3xl font-mono font-bold text-sky-400 mt-2">~80,600 格</div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                以全台約 3.95 萬處號誌化路口推估，地面上存在近 8 至 9.5 萬個實體白色待轉方框。
              </p>
            </div>

            <div className="bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-xl p-5">
              <div className="text-xs font-mono text-zinc-400 uppercase">COLLECTIVE TIME WAITED</div>
              <div className="text-3xl font-mono font-bold text-amber-400 mt-2">1.8 億小時/年</div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                全台 1,400 萬輛機車若每日僅因待轉多等一次 45 秒紅燈，全台灣每年在白框內耗費逾 2 萬年光陰。
              </p>
            </div>

            <div className="bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-xl p-5">
              <div className="text-xs font-mono text-zinc-400 uppercase">HISTORICAL ERA</div>
              <div className="text-3xl font-mono font-bold text-emerald-400 mt-2">1984 – 2026+</div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                走過 42 年強制車種分流高峰，台南、雙北、台中、高雄已啟動「車向分流＋安全彈性待轉」轉型。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 第一章：全台灣到底有多少個待轉區？（科學推估模型與各縣市數據） */}
      <section id="chapter-scale" className="py-20 md:py-28 border-b border-zinc-800/80 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-2">
            CHAPTER 01 · THE MISSING CENSUS
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            研究第一個真相：遍布全台卻「沒有戶籍」的 8 萬個白框
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            當我們試圖查詢「全台灣共有多少個機車待轉區」時，發現了一個驚人的治理黑洞：<strong>中央與地方政府從未完整統計過全台灣地面上有幾個待轉格</strong>。各縣市交通局只統計「紅綠燈號誌路口數」與近年「取消強制兩段式左轉的路口數」。為了還原全貌，我們透過六都與公路局的號誌化路口基數，建立這套互動推估模型：
          </p>
        </div>

        {/* 互動推估模型面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-asphalt-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-12">
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-400" />
              <span>全台待轉區總量科學推估模型（可自由調整參數）</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-300">1. 全台號誌化路口總數（六都 28,051 處 ＋ 16縣市與省道約 11,500 處）</span>
                  <span className="font-mono font-bold text-white">39,551 處路口</span>
                </div>
                <div className="text-xs text-zinc-500">資料來源：六都交通局公開統計報表與交通部公路局養護路段匯整</div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-300">2. 設有待轉區之號誌路口覆蓋率</span>
                  <span className="font-mono font-bold text-blue-400">{coveragePercent}%（約 {Math.round(totalIntersections * coveragePercent / 100).toLocaleString()} 個路口）</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="85"
                  value={coveragePercent}
                  onChange={(e) => setCoveragePercent(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                  <span>保守估計 (45%)</span>
                  <span>實務常見落點 (65%–75%)</span>
                  <span>高密度估計 (85%)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-300">3. 每個路口平均劃設待轉格數（十字路口 3~4 格、T字路口 1~2 格）</span>
                  <span className="font-mono font-bold text-blue-400">平均 {boxesPerIntersection.toFixed(1)} 格 / 路口</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="3.8"
                  step="0.1"
                  value={boxesPerIntersection}
                  onChange={(e) => setBoxesPerIntersection(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                  <span>多T字路口 (2.0格)</span>
                  <span>全國平均約 2.8–3.2 格</span>
                  <span>全十字路口 (3.8格)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 推估結果大字卡 */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-950/40 via-zinc-900 to-zinc-950 border border-blue-500/30 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-blue-400">
                REAL-TIME ESTIMATION RESULT
              </div>
              <div className="text-sm text-zinc-400 mt-1">推估全台灣地面上的實體待轉白框總數：</div>
              <div className="text-5xl sm:text-6xl font-mono font-black text-white my-4 tracking-tight">
                {estimatedBoxes.toLocaleString()}
                <span className="text-xl font-normal text-zinc-400 ml-2">格</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                若加上無號誌巷弄與閃光號誌路口，全台待轉格數量極可能逼近 <strong>9萬至10萬格</strong>。
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-800 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">白框總佔地柏油面積：</span>
                <span className="font-mono text-zinc-200 font-semibold">約 {totalAreaSqm.toLocaleString()} 平方公尺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">空間尺度換算：</span>
                <span className="font-mono text-amber-400 font-semibold">相當於 {taipeiDomes} 座台北大巨蛋球場</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">白漆標線總長度：</span>
                <span className="font-mono text-emerald-400 font-semibold">約 {Math.round(estimatedBoxes * 9.5 / 1000).toLocaleString()} 公里（可繞台灣半圈）</span>
              </div>
            </div>
          </div>
        </div>

        {/* 六都號誌路口與「取消強制兩段式左轉」試辦前後事故率變化對照表 */}
        <div className="bg-asphalt-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 bg-zinc-900/90 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase">EMPIRICAL EVIDENCE · 科學實證數據</div>
              <h4 className="text-base font-bold text-white mt-0.5">
                打破「直接左轉很危險」的迷思：各縣市試辦解禁後之路口事故率變化
              </h4>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
              車向分流＋保留彈性待轉格實績
            </span>
          </div>
          <div className="divide-y divide-zinc-800/80">
            {CITY_STATS.map((item) => {
              const cityBoxes = Math.round(item.intersections * item.coverageRate * item.avgBoxes);
              return (
                <div key={item.city} className="p-5 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center hover:bg-zinc-900/40 transition">
                  <div className="lg:col-span-4 space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white text-base">{item.city}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        號誌路口 {item.intersections.toLocaleString()} 處
                      </span>
                    </div>
                    <div className="text-xs font-mono text-sky-400">
                      推估現存待轉白框：約 {cityBoxes.toLocaleString()} 格
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      改革規模：{item.trialRoadCount}
                    </div>
                  </div>

                  <div className="lg:col-span-3 flex items-center gap-3 bg-emerald-950/25 border border-emerald-800/40 rounded-xl px-4 py-3">
                    <div>
                      <div className="text-[11px] text-zinc-400">試辦路段路口事故率變化</div>
                      <div className="text-2xl font-mono font-black text-emerald-400">
                        {item.accidentChange}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 text-xs text-zinc-300 leading-relaxed">
                    {item.accidentDetail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 第二章：1969–2026 半世紀歷史演進時間軸 */}
      <section id="chapter-history" className="py-20 md:py-28 border-b border-zinc-800/80 bg-[#090b10]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-2">
              CHAPTER 02 · CHRONICLE OF THE WHITE BOX (1969–2026)
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
              為什麼全世界的機車都直接左轉，只有台灣走進了白框？
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              許多人以為「機車兩段式左轉」是自古以來的自然法則。事實上，它是 1960 年代末至 1980 年代台灣在面對「汽車快速增加、機車密度暴漲」時，為了讓內側汽車開得更快、更順暢，而一步步透過行政命令築起的制度高牆。
            </p>
          </div>

          <div className="relative border-l-2 border-zinc-800 ml-4 md:ml-8 space-y-12">
            {HISTORY_TIMELINE.map((node, idx) => (
              <div key={node.year} className="relative pl-8 md:pl-12 group">
                {/* 時間軸圓點 */}
                <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-zinc-950 border-2 border-blue-500 group-hover:scale-125 group-hover:bg-blue-500 transition" />

                <div className="bg-asphalt-900 border border-zinc-800/90 group-hover:border-zinc-700 rounded-2xl p-6 transition shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-mono font-black text-blue-400">{node.year}</span>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {node.badge} · {node.era}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {node.location}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{node.title}</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4">{node.description}</p>

                  <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="text-amber-300/90 font-medium">歷史影響：{node.impact}</span>
                    <span className="font-mono text-zinc-400 shrink-0">{node.stat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 第三章：數位標本館：台灣獨有的 6 種待轉區文化與工程地景 */}
      <section id="chapter-specimens" className="py-20 md:py-28 border-b border-zinc-800/80 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">
            CHAPTER 03 · MUSEUM OF HOOK-TURN SPECIMENS
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            數位標本館：即將走入歷史的 6 種台灣待轉奇觀與集體記憶
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            如果有一天，全世界的道路都不再有待轉區，後代子孫該如何理解 20 世紀末至 21 世紀初台灣騎士的日常？我們將最具代表性的 6 種待轉區工程地景與亞熱帶街頭文化，以工程圖鑑形式永久典藏：
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARCHIVE_SPECIMENS.map((spec) => (
            <div
              key={spec.id}
              className="bg-asphalt-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-3">
                  <span className="text-blue-400 font-bold">{spec.id}</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{spec.category}</span>
                </div>

                <SpecimenDiagram type={spec.diagramType} />

                <h3 className="text-lg font-bold text-white mt-4 mb-1">{spec.name}</h3>
                <div className="text-xs font-mono text-zinc-400 mb-3">
                  尺寸特徵：{spec.dimensions}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                  {spec.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                <div className="text-[11px] font-mono text-amber-400">
                  危險評估：{spec.riskLevel}
                </div>
                <blockquote className="text-xs italic text-zinc-400 bg-zinc-950/80 p-3 rounded-lg border-l-2 border-blue-500">
                  {spec.curatorNote}
                </blockquote>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 第四章：互動車流模擬實驗室（車種分流 vs. 車向分流） */}
      <section id="chapter-simulator" className="py-20 md:py-28 border-b border-zinc-800/80 bg-[#090b10]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-10">
            <div className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-2">
              CHAPTER 04 · TRAFFIC CONFLICT SIMULATOR
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
              眼見為憑：為什麼「靠右待轉」不像直覺想的那麼安全？
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              許多長輩與汽車駕駛常問：「機車待在右邊格子裡等紅燈，不是比較安全嗎？」<br />
              那是因為我們忽略了<strong>「進格子之前」與「格子塞滿之後」</strong>發生的事。請點擊下方模擬器切換兩種制度，親自觀察<strong>「外側右轉汽車 × 待轉機車的死亡交織」</strong>如何發生，以及<strong>「車向分流＋安全退縮彈性待轉」</strong>如何同時保護汽車、機車與行人：
            </p>
          </div>

          <IntersectionSimulator />
        </div>
      </section>

      {/* 第五章：3秒路口體感規則測驗 */}
      <section id="chapter-quiz" className="py-20 md:py-28 border-b border-zinc-800/80 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-2">
            CHAPTER 05 · THE SPLIT-SECOND DILEMMA
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            時速 50 公里的認知超載：這 3 個路口，你到底該不該待轉？
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            在「因地制宜」卻缺乏全國統一標示的過渡期，台灣騎士接近每個陌生路口時，只有不到 3 秒鐘可以同時完成：注意前車急煞、閃避路邊違停與公車、低頭看內側有沒有漆「禁行機車」、抬頭在樹叢與招牌中找有沒有「藍色待轉牌」。來測測看你是否真的懂台灣現行的左轉法規：
          </p>
        </div>

        <div className="space-y-6">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const selected = quizAnswers[q.id];
            const isCorrect = selected === q.correctAnswer;
            return (
              <div key={q.id} className="bg-asphalt-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-800 text-blue-400 font-bold">
                    TEST CASE 0{idx + 1} · {q.location}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded ${q.innerProhibited ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-800 text-zinc-400'}`}>
                      內側禁行機車：{q.innerProhibited ? '有' : '無'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${q.hasBlueSign ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-400'}`}>
                      遵20藍牌：{q.hasBlueSign ? '有掛牌' : '無藍牌'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-300">
                      地面白框：有畫格
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-5 leading-snug">{q.question}</h3>

                <div className="space-y-3">
                  {q.options.map((opt) => {
                    const isThisSelected = selected === opt.id;
                    let btnStyle = 'bg-zinc-900 border-zinc-700/80 text-zinc-200 hover:border-blue-500/60';
                    if (selected) {
                      if (opt.id === q.correctAnswer) {
                        btnStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200';
                      } else if (isThisSelected) {
                        btnStyle = 'bg-red-950/50 border-red-500 text-red-200';
                      } else {
                        btnStyle = 'bg-zinc-900/40 border-zinc-800 text-zinc-500';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectQuiz(q.id, opt.id)}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition flex items-center justify-between gap-4 ${btnStyle}`}
                      >
                        <span>{opt.label}</span>
                        {selected && opt.id === q.correctAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selected && (
                  <div className={`mt-5 p-4 rounded-xl border text-xs leading-relaxed ${
                    isCorrect ? 'bg-emerald-950/20 border-emerald-800/60 text-zinc-200' : 'bg-amber-950/20 border-amber-800/60 text-zinc-200'
                  }`}>
                    <div className="font-bold mb-1 text-sm text-white">
                      {isCorrect ? '✓ 判斷正確！但路上多數人仍在猶豫' : '✗ 掉入法規陷阱！這正是擦撞與罰單的來源'}
                    </div>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 第六章：結尾與參與 — 個人待轉歷史足跡計算機、記憶牆、1999建議書 */}
      <section id="chapter-legacy" className="py-20 md:py-28 bg-gradient-to-b from-[#090b10] to-[#050608]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-20">
          {/* 6-1. 給下一個世代的交通備忘錄 (三大改革共識) */}
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">
              CHAPTER 06 · THE FUTURE BEYOND THE BOX
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
              給下一個世代的交通備忘錄：從「強制待轉」走向「安全共融」
            </h2>
            <p className="text-zinc-300 max-w-3xl leading-relaxed mb-8">
              記錄待轉區的歷史，不是為了製造汽機車對立，而是為了讓每一個用路人——無論是趕時間的通勤騎士、開車接送孩子的父母、還是騎車買菜的長輩——都能平安回家。現代交通工程已經給出了跨越同溫層的三大解方：
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-asphalt-900 border border-zinc-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-mono font-bold mb-4">
                  01
                </div>
                <h3 className="text-lg font-bold text-white mb-2">車向分流：左轉靠左、右轉靠右</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  塗銷不合理的內側「禁行機車」，在多車道路口設置汽機車共用的「左轉專用道」與左轉保護時相，徹底消除左轉機車切往外側與右轉汽車發生的死亡交織。
                </p>
              </div>

              <div className="bg-asphalt-900 border border-zinc-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-bold mb-4">
                  02
                </div>
                <h3 className="text-lg font-bold text-white mb-2">保留「非強制」的安全彈性待轉</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  拆除強制的「遵20」藍牌，但保留地面安全的待轉區。讓車速較慢、年長者或不習慣切入內側的用路人依然保有兩段式左轉的選擇權，兼顧效率與弱勢保護。
                </p>
              </div>

              <div className="bg-asphalt-900 border border-zinc-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono font-bold mb-4">
                  03
                </div>
                <h3 className="text-lg font-bold text-white mb-2">行穿線退縮＋行人庇護島</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  全面淘汰緊貼車道邊緣的「奈米待轉格」與「待撞區」。將斑馬線退縮並增設實體庇護島，讓彈性待轉格隱身於庇護島後方的安全淨空區，人車不再爭道。
                </p>
              </div>
            </div>
          </div>

          {/* 6-2. 時間的標本：個人待轉歷史足跡計算機與見證卡 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-asphalt-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase">
                <Clock className="w-4 h-4" />
                <span>PERSONAL HISTORICAL FOOTPRINT · 時間的標本</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                算出你這輩子在「待轉白框」裡留下了多少青春
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                每一個待轉格都是時間的容器。輸入你的騎車年資與日常左轉習慣，生成屬於你的《台灣待轉世代歷史見證卡》：
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-300">你的機車騎乘年資</span>
                    <span className="font-mono font-bold text-blue-400">{ridingYears} 年</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={ridingYears}
                    onChange={(e) => setRidingYears(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-300">平均每日經過幾個待轉路口</span>
                    <span className="font-mono font-bold text-blue-400">每天 {dailyHookTurns} 次</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={dailyHookTurns}
                    onChange={(e) => setDailyHookTurns(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-300">每次待轉平均多等的紅燈秒數</span>
                    <span className="font-mono font-bold text-blue-400">{avgWaitSeconds} 秒</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="5"
                    value={avgWaitSeconds}
                    onChange={(e) => setAvgWaitSeconds(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 歷史見證證書卡片 */}
            <div className="lg:col-span-6 bg-gradient-to-br from-[#0f172a] via-[#090d16] to-[#07080a] border-2 border-blue-500/40 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-mono tracking-wider text-zinc-300 uppercase">
                    CERTIFICATE OF TAIWAN HOOK-TURN ERA
                  </span>
                </div>
                <span className="text-xs font-mono text-blue-400">#1984-2026</span>
              </div>

              <div className="my-6 space-y-4">
                <div className="text-xs text-zinc-400">
                  在騎乘機車的 <strong className="text-white">{ridingYears} 年</strong>歲月裡，你總共走進待轉區白框：
                </div>
                <div className="text-4xl sm:text-5xl font-mono font-black text-white">
                  {personalFootprint.totalTurns.toLocaleString()} <span className="text-lg font-normal text-zinc-400">次</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
                    <div className="text-[11px] text-zinc-400">累計在白框內等待紅燈</div>
                    <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                      {personalFootprint.totalHours.toLocaleString()} 小時
                    </div>
                    <div className="text-[11px] text-zinc-500">約合不眠不休 {personalFootprint.totalDays} 天</div>
                  </div>
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
                    <div className="text-[11px] text-zinc-400">這些時間若用來騎車前進</div>
                    <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                      環島 {personalFootprint.roundIslandTrips} 圈
                    </div>
                    <div className="text-[11px] text-zinc-500">以每圈 24 小時騎乘換算</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] text-zinc-400">
                  「我見證過全台灣擁有 8 萬個待轉格的年代。」
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `【白框裡的台灣史：我的待轉世代足跡】騎車 ${ridingYears} 年來，我在台灣的待轉格裡停等了 ${personalFootprint.totalTurns.toLocaleString()} 次、共計 ${personalFootprint.totalHours} 小時（相當於機車環島 ${personalFootprint.roundIslandTrips} 圈）！一起認識全台 8 萬個待轉區的歷史與車向分流改革：`,
                      'footprint'
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  {copiedType === 'footprint' ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'footprint' ? '已複製分享文案！' : '複製我的見證數據分享'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6-3. 最後的待轉區記憶牆 ＋ 1999 市政改善建議書產生器 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 左欄：記憶牆 */}
            <div className="lg:col-span-7 bg-asphalt-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  為這段歷史留下座標：最後的待轉區記憶牆
                </h3>
                <p className="text-xs text-zinc-400 mb-6">
                  記錄下你印象最深刻的一個待轉區路口（無論是夏日躲太陽的幽默記憶、還是曾經歷過的驚險瞬間），讓這座檔案館成為台灣人的共同記憶：
                </p>

                <form onSubmit={handleAddMemory} className="space-y-3 mb-8 bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="你的稱呼與騎齡（例：台中通勤族 · 騎齡6年）"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="路口座標（例：新北市重新路與正義北路口）"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="寫下你在這個待轉格的記憶，或對未來台灣道路的期許..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>封存至數位歷史牆</span>
                    </button>
                  </div>
                </form>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {memories.map((m) => (
                    <div key={m.id} className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800/90 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-zinc-200">{m.author}</span>
                        <span className="font-mono text-blue-400 text-[11px] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {m.location}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{m.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右欄：1999 路口工程改善建議書產生器 */}
            <div className="lg:col-span-5 bg-asphalt-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase">
                  <FileText className="w-4 h-4" />
                  <span>CIVIC ACTION GENERATOR · 公民行動工具</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  一鍵生成 1999 交通局路口改善建議書
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  如果你家附近仍有危險的「奈米待轉區」或「未退縮待撞區」，請輸入路口名稱，系統將自動帶入現代交通工程學理（車向分流＋庇護島退縮＋彈性待轉），生成專業理性的市政建議文案：
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">所在縣市</label>
                    <input
                      type="text"
                      value={petitionCity}
                      onChange={(e) => setPetitionCity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">問題路口名稱</label>
                    <input
                      type="text"
                      value={petitionRoad}
                      onChange={(e) => setPetitionRoad(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">具體工程缺失描述</label>
                    <input
                      type="text"
                      value={petitionIssue}
                      onChange={(e) => setPetitionIssue(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-[11px] text-zinc-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {petitionText}
                </div>
              </div>

              <button
                onClick={() => handleCopy(petitionText, 'petition')}
                className="mt-5 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                {copiedType === 'petition' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedType === 'petition' ? '已複製建議書全文！可貼至縣市 1999 信箱' : '一鍵複製專業市政陳情建議書'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 頁尾 Footer */}
      <footer className="border-t border-zinc-900 bg-[#050608] py-12 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <div className="font-mono text-zinc-400">
            TAIWAN HOOK-TURN DIGITAL ARCHIVE · 白框裡的台灣史：機車待轉區數位紀事 (1969–2026)
          </div>
          <p>
            資料來源：交通部統計查詢網、六都交通局號誌化路口公開統計、道路交通安全規則第 99 條歷史沿革。
          </p>
        </div>
      </footer>
    </div>
  );
}
