import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRightLeft, Sliders } from 'lucide-react';

export default function IntersectionSimulator() {
  const canvasRef = useRef(null);
  // 模擬模式：'segregated' (強制車種分流/待轉區未退縮) | 'directional' (現代車向分流/左轉專用道+安全彈性待轉區)
  const [mode, setMode] = useState('segregated');
  // 尖峰車流量倍率：1 (離峰) ~ 3 (尖峰塞爆)
  const [trafficDensity, setTrafficDensity] = useState(2.2);
  // 待轉格尺寸：'nano' (奈米格 4輛滿) | 'standard' (標準格 10輛滿)
  const [boxSize, setBoxSize] = useState('nano');
  const [isRunning, setIsRunning] = useState(true);
  const [stats, setStats] = useState({
    weaveConflicts: 0,
    boxOverflowCount: 0,
    completedLeftTurns: 0,
  });

  // 供 Canvas requestAnimationFrame 讀取的最新狀態 ref
  const simConfigRef = useRef({ mode, trafficDensity, boxSize, isRunning });
  useEffect(() => {
    simConfigRef.current = { mode, trafficDensity, boxSize, isRunning };
  }, [mode, trafficDensity, boxSize, isRunning]);

  // 切換模式時重置統計與車輛
  const resetTriggerRef = useRef(0);
  const handleModeChange = (newMode) => {
    setMode(newMode);
    resetTriggerRef.current += 1;
    setStats({ weaveConflicts: 0, boxOverflowCount: 0, completedLeftTurns: 0 });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // 固定邏輯畫布大小 800 x 560
    const W = 800;
    const H = 560;
    const CX = W / 2;
    const CY = H / 2;
    const ROAD_HALF = 110; // 單向3車道寬度 110px (雙向共 220px)

    let vehicles = [];
    let conflictFlashes = [];
    let phaseTimer = 0; // 0 ~ 360 frames: 0-210 南北向綠燈, 210-360 東西向綠燈
    let localStats = { weaveConflicts: 0, boxOverflowCount: 0, completedLeftTurns: 0 };
    let lastReset = resetTriggerRef.current;

    const spawnVehicle = (cfg) => {
      // 主模擬：由南往北 (下方往上行駛) 的車流，讓讀者聚焦觀察一個方向的所有左轉、直行與右轉行為
      const isScooter = Math.random() < 0.68; // 台灣市區機車佔比高
      const intentRand = Math.random();
      let intent = 'straight';
      if (intentRand < 0.38) intent = 'left';
      else if (intentRand < 0.62) intent = 'right';

      // 車道 X 座標配置 (由南往北，X 介於 CX + 8 到 CX + ROAD_HALF - 8)
      // 內側車道 (Lane 1): CX + 20
      // 中間車道 (Lane 2): CX + 55
      // 外側車道 (Lane 3): CX + 90
      let startX = CX + 55;
      let targetX = startX;

      if (cfg.mode === 'segregated') {
        // 傳統車種分流：內側禁行機車！
        if (isScooter) {
          // 機車只能走中間或外側，若要左轉必須切到最外側進待轉格
          startX = Math.random() < 0.5 ? CX + 62 : CX + 92;
          targetX = intent === 'left' ? CX + 96 : startX;
        } else {
          // 汽車：左轉走內側，直行與右轉走中/外側（為了模擬外側右轉車與待轉機車交織，右轉汽車會從中間切往外側）
          if (intent === 'left') {
            startX = CX + 22;
            targetX = CX + 22;
          } else if (intent === 'right') {
            startX = CX + 55;
            targetX = CX + 92; // 右轉汽車往外側切，與直行進待轉格的機車交織！
          } else {
            startX = Math.random() < 0.5 ? CX + 22 : CX + 55;
            targetX = startX;
          }
        }
      } else {
        // 現代車向分流：左轉靠左（汽機車共用左轉專用道），右轉靠右，直行居中；保留少數彈性待轉機車（15%）
        const useOptionalBox = isScooter && intent === 'left' && Math.random() < 0.15;
        if (intent === 'left' && !useOptionalBox) {
          startX = CX + 22 + (isScooter ? (Math.random() * 12 - 6) : 0);
          targetX = startX;
        } else if (useOptionalBox) {
          startX = CX + 92;
          targetX = CX + 96;
        } else if (intent === 'right') {
          startX = CX + 90;
          targetX = CX + 92;
        } else {
          startX = CX + 56 + (isScooter ? (Math.random() * 14 - 7) : 0);
          targetX = startX;
        }
      }

      vehicles.push({
        id: Math.random(),
        type: isScooter ? 'scooter' : 'car',
        intent,
        x: startX,
        y: H + 30,
        targetX,
        vx: 0,
        vy: -(isScooter ? 2.5 + Math.random() * 0.6 : 2.2 + Math.random() * 0.4),
        state: 'approaching', // approaching | in_box | turning_left | turning_right | exited
        angle: -Math.PI / 2,
        countedConflict: false,
      });
    };

    const render = () => {
      const cfg = simConfigRef.current;
      if (lastReset !== resetTriggerRef.current) {
        vehicles = [];
        conflictFlashes = [];
        localStats = { weaveConflicts: 0, boxOverflowCount: 0, completedLeftTurns: 0 };
        lastReset = resetTriggerRef.current;
      }

      if (cfg.isRunning) {
        phaseTimer = (phaseTimer + 1) % 360;
      }
      const isNSGreen = phaseTimer < 220; // 南北向綠燈 (0~219), 東西向綠燈 (220~359)

      // 產生新車輛
      if (cfg.isRunning && isNSGreen && Math.random() < 0.08 * cfg.trafficDensity) {
        spawnVehicle(cfg);
      }

      // 1. 繪製柏油路背景
      ctx.fillStyle = '#0c0e12';
      ctx.fillRect(0, 0, W, H);

      // 繪製四角人行道與建築街廓
      ctx.fillStyle = '#161922';
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;
      const corners = [
        [0, 0, CX - ROAD_HALF, CY - ROAD_HALF],
        [CX + ROAD_HALF, 0, W - (CX + ROAD_HALF), CY - ROAD_HALF],
        [0, CY + ROAD_HALF, CX - ROAD_HALF, H - (CY + ROAD_HALF)],
        [CX + ROAD_HALF, CY + ROAD_HALF, W - (CX + ROAD_HALF), H - (CY + ROAD_HALF)],
      ];
      corners.forEach(([rx, ry, rw, rh]) => {
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);
      });

      // 2. 繪製斑馬線 (行穿線)：在「車向分流＋人本改善」模式下，斑馬線退縮並增設庇護島！
      const crosswalkOffset = cfg.mode === 'directional' ? 28 : 6;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      // 南側斑馬線
      for (let i = -ROAD_HALF + 12; i < ROAD_HALF - 12; i += 16) {
        ctx.fillRect(CX + i, CY + ROAD_HALF + crosswalkOffset, 8, 22);
        ctx.fillRect(CX + i, CY - ROAD_HALF - crosswalkOffset - 22, 8, 22);
        ctx.fillRect(CX - ROAD_HALF - crosswalkOffset - 22, CY + i, 22, 8);
        ctx.fillRect(CX + ROAD_HALF + crosswalkOffset, CY + i, 22, 8);
      }

      // 3. 繪製車道標線與雙黃線
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      // 雙黃線
      const stopLineOffset = ROAD_HALF + crosswalkOffset + 28;
      // 南側雙黃線
      ctx.beginPath();
      ctx.moveTo(CX - 3, CY + stopLineOffset);
      ctx.lineTo(CX - 3, H);
      ctx.moveTo(CX + 3, CY + stopLineOffset);
      ctx.lineTo(CX + 3, H);
      // 北側雙黃線
      ctx.moveTo(CX - 3, 0);
      ctx.lineTo(CX - 3, CY - stopLineOffset);
      ctx.moveTo(CX + 3, 0);
      ctx.lineTo(CX + 3, CY - stopLineOffset);
      // 西側雙黃線
      ctx.moveTo(0, CY - 3);
      ctx.lineTo(CX - stopLineOffset, CY - 3);
      ctx.moveTo(0, CY + 3);
      ctx.lineTo(CX - stopLineOffset, CY + 3);
      // 東側雙黃線
      ctx.moveTo(CX + stopLineOffset, CY - 3);
      ctx.lineTo(W, CY - 3);
      ctx.moveTo(CX + stopLineOffset, CY + 3);
      ctx.lineTo(W, CY + 3);
      ctx.stroke();

      // 車道分隔白虛線 (南側北上三車道)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.setLineDash([12, 12]);
      [CX + 38, CX + 74, CX - 38, CX - 74].forEach((lx) => {
        ctx.beginPath();
        ctx.moveTo(lx, CY + stopLineOffset);
        ctx.lineTo(lx, H);
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, CY - stopLineOffset);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // 停止線
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(CX + 4, CY + stopLineOffset);
      ctx.lineTo(CX + ROAD_HALF, CY + stopLineOffset);
      ctx.stroke();

      // 4. 模式專屬標線：「禁行機車」vs「左轉專用道＋庇護島」
      if (cfg.mode === 'segregated') {
        // 繪製內側「禁行機車」黃字標線
        ctx.save();
        ctx.fillStyle = 'rgba(234, 179, 8, 0.75)';
        ctx.font = 'bold 12px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ['禁', '行', '機', '車'].forEach((ch, idx) => {
          ctx.fillText(ch, CX + 21, CY + stopLineOffset + 45 + idx * 18);
        });
        ctx.restore();

        // 繪製路口「遵20 兩段式左轉」藍牌圖示
        ctx.fillStyle = '#0057b8';
        ctx.beginPath();
        ctx.arc(CX + ROAD_HALF + 26, CY + ROAD_HALF + 16, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('待轉', CX + ROAD_HALF + 26, CY + ROAD_HALF + 19);
      } else {
        // 現代車向分流：繪製內側「左轉專用道」箭頭與行人庇護島
        ctx.fillStyle = 'rgba(59, 130, 246, 0.22)';
        ctx.fillRect(CX + 5, CY + stopLineOffset, 32, H - (CY + stopLineOffset));

        // 左轉專用箭頭
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(CX + 24, CY + stopLineOffset + 70);
        ctx.lineTo(CX + 24, CY + stopLineOffset + 40);
        ctx.lineTo(CX + 12, CY + stopLineOffset + 40);
        ctx.stroke();

        // 行人庇護島 (保護行穿線與退縮後的空間)
        ctx.fillStyle = '#3f3f46';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.fillRect(CX - 6, CY + ROAD_HALF + 8, 12, 20);
        ctx.strokeRect(CX - 6, CY + ROAD_HALF + 8, 12, 20);
      }

      // 5. 繪製東北角（右前方）的「機車待轉區」白框
      const boxX = CX + ROAD_HALF + 4;
      const boxY = CY - ROAD_HALF + (cfg.mode === 'directional' ? -8 : 14);
      const boxW = cfg.boxSize === 'nano' && cfg.mode === 'segregated' ? 18 : 34;
      const boxH = cfg.boxSize === 'nano' && cfg.mode === 'segregated' ? 38 : 68;
      const maxBoxCapacity = cfg.boxSize === 'nano' && cfg.mode === 'segregated' ? 4 : 11;

      // 5-B. 繪製「路口的隱形炸彈：未退縮待撞區 vs. 退縮庇護島保護」幾何軌跡
      if (cfg.mode === 'segregated') {
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        // 由西往東偏離或南下左轉切西瓜直接掃過未退縮待轉格的致命軌跡
        ctx.moveTo(CX - 30, CY - ROAD_HALF - 40);
        ctx.quadraticCurveTo(CX + 25, CY - ROAD_HALF + 25, boxX + boxW / 2, boxY + boxH / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 10px "Noto Sans TC", sans-serif';
        ctx.fillText('↖ 未退縮無庇護島：暴露於切西瓜撞擊軌跡', boxX + boxW + 8, boxY + 52);
        ctx.restore();
      } else {
        // 東北角增設保護待轉區與行穿線的實體轉角庇護島
        ctx.save();
        ctx.fillStyle = '#3f3f46';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.fillRect(boxX - 8, boxY + boxH + 4, 18, 12);
        ctx.strokeRect(boxX - 8, boxY + boxH + 4, 18, 12);
        ctx.fillStyle = '#6ee7b7';
        ctx.font = 'bold 10px "Noto Sans TC", sans-serif';
        ctx.fillText('✓ 行穿線退縮＋實體庇護島遮蔽保護', boxX + boxW + 8, boxY + 36);
        ctx.restore();
      }

      // 統計目前停在待轉格內的車輛數
      const inBoxVehicles = vehicles.filter((v) => v.state === 'in_box');
      const isOverflowing = inBoxVehicles.length > maxBoxCapacity;

      ctx.strokeStyle = isOverflowing ? '#ef4444' : cfg.mode === 'directional' ? 'rgba(16, 185, 129, 0.8)' : '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.fillStyle = isOverflowing
        ? 'rgba(239, 68, 68, 0.25)'
        : cfg.mode === 'directional'
        ? 'rgba(16, 185, 129, 0.12)'
        : 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(boxX, boxY, boxW, boxH);

      // 待轉格標籤
      ctx.fillStyle = isOverflowing ? '#fca5a5' : '#d4d4d8';
      ctx.font = 'bold 11px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        cfg.mode === 'segregated'
          ? cfg.boxSize === 'nano'
            ? `強制待轉區 (奈米格: ${inBoxVehicles.length}/${maxBoxCapacity}輛)`
            : `強制待轉區 (${inBoxVehicles.length}/${maxBoxCapacity}輛)`
          : `安全退縮彈性待轉格 (${inBoxVehicles.length}輛)`,
        boxX + boxW + 8,
        boxY + 16
      );
      if (isOverflowing) {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('⚠ 溢流堵塞直行車道與斑馬線！', boxX + boxW + 8, boxY + 34);
      }

      // 6. 繪製號誌狀態指示器
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1.5;
      ctx.fillRect(16, 16, 215, 58);
      ctx.strokeRect(16, 16, 215, 58);

      ctx.beginPath();
      ctx.arc(38, 45, 9, 0, Math.PI * 2);
      ctx.fillStyle = isNSGreen ? '#10b981' : '#ef4444';
      ctx.fill();

      ctx.fillStyle = '#f4f4f5';
      ctx.font = 'bold 12px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(isNSGreen ? '南北向：綠燈通行中' : '東西向：待轉車綠燈起步', 56, 40);
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(
        cfg.mode === 'segregated' ? '制度：強制兩段式 (車種分流)' : '制度：左轉靠左 (車向分流)',
        56,
        58
      );

      // 7. 更新與繪製所有車輛
      if (cfg.isRunning) {
        for (let i = vehicles.length - 1; i >= 0; i--) {
          const v = vehicles[i];

          if (v.state === 'approaching') {
            // 紅燈時在停止線前停等
            if (!isNSGreen && v.y > CY + stopLineOffset + 10 && v.y < CY + stopLineOffset + 35) {
              // 停在停止線
            } else {
              v.y += v.vy;
              // 橫向變換車道 (例如：機車切往外側待轉、或汽車切往外側右轉)
              const dx = v.targetX - v.x;
              if (Math.abs(dx) > 0.5 && v.y > CY + ROAD_HALF) {
                v.x += Math.sign(dx) * 0.85;
              }
            }

            // 檢查「強制待轉機車」與「右轉汽車」在路口南側外側車道的死亡交織 (Weaving Conflict)
            if (cfg.mode === 'segregated' && v.type === 'scooter' && v.intent === 'left' && !v.countedConflict) {
              const conflictCar = vehicles.find(
                (other) =>
                  other.type === 'car' &&
                  other.intent === 'right' &&
                  Math.abs(other.y - v.y) < 26 &&
                  Math.abs(other.x - v.x) < 26
              );
              if (conflictCar) {
                v.countedConflict = true;
                localStats.weaveConflicts += 1;
                conflictFlashes.push({ x: (v.x + conflictCar.x) / 2, y: (v.y + conflictCar.y) / 2, life: 38, label: '外側右轉交織衝突!' });
              }
            }

            // 抵達路口中央的行為分流
            if (v.y <= CY + ROAD_HALF - 10) {
              // 是否需要進入待轉格？
              const shouldHookTurn =
                v.type === 'scooter' &&
                v.intent === 'left' &&
                (cfg.mode === 'segregated' || v.targetX > CX + 75);

              if (shouldHookTurn) {
                if (v.y <= boxY + boxH - 10) {
                  v.state = 'in_box';
                  const idx = inBoxVehicles.length;
                  // 排列在待轉格內，若超過容量則往外溢流到直行車道 (boxX 左側) 與斑馬線
                  const col = idx % 2;
                  const row = Math.floor(idx / 2);
                  v.x = boxX + 6 + col * 11 - (idx >= maxBoxCapacity ? (idx - maxBoxCapacity + 1) * 9 : 0);
                  v.y = boxY + 8 + (row % 4) * 13;
                  v.angle = Math.PI; // 車頭轉向西側等待東西向綠燈
                  if (idx >= maxBoxCapacity) {
                    localStats.boxOverflowCount += 1;
                    conflictFlashes.push({ x: v.x, y: v.y, life: 32, label: '待轉格溢流!' });
                  }
                }
              } else if (v.intent === 'left') {
                // 直接左轉 (汽車，或車向分流下的左轉專用道機車)
                if (v.y <= CY - 18) {
                  v.state = 'turning_left';
                  v.angle = Math.PI;
                }
              } else if (v.intent === 'right') {
                if (v.y <= CY + ROAD_HALF - 22) {
                  v.state = 'turning_right';
                  v.angle = 0;
                }
              }
            }
          } else if (v.state === 'in_box') {
            // 等待東西向綠燈 (!isNSGreen) 才起步完成第二段左轉
            if (!isNSGreen) {
              v.state = 'turning_left';
              v.angle = Math.PI;
            }
          } else if (v.state === 'turning_left') {
            v.x -= 2.8;
            if (v.x < -30) {
              localStats.completedLeftTurns += 1;
              vehicles.splice(i, 1);
              continue;
            }
          } else if (v.state === 'turning_right') {
            v.x += 2.6;
            if (v.x > W + 30) {
              vehicles.splice(i, 1);
              continue;
            }
          }

          // 直行駛離畫面北側
          if (v.y < -30) {
            vehicles.splice(i, 1);
            continue;
          }
        }
      }

      // 繪製車輛本體
      vehicles.forEach((v) => {
        ctx.save();
        ctx.translate(v.x, v.y);
        ctx.rotate(v.angle);
        if (v.type === 'car') {
          // 汽車：灰藍色或琥珀色(右轉車)
          ctx.fillStyle = v.intent === 'right' ? '#f59e0b' : '#64748b';
          ctx.fillRect(-13, -7, 26, 14);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-6, -5, 12, 10);
        } else {
          // 機車：左轉機車以亮藍色/青色標示，直行白色
          ctx.fillStyle = v.intent === 'left' ? '#38bdf8' : '#e4e4e7';
          ctx.beginPath();
          ctx.roundRect(-7, -3.5, 14, 7, 3);
          ctx.fill();
        }
        ctx.restore();
      });

      // 8. 繪製衝突閃光警示圈 (Weaving Conflict / Overflow)
      for (let i = conflictFlashes.length - 1; i >= 0; i--) {
        const f = conflictFlashes[i];
        ctx.save();
        ctx.strokeStyle = `rgba(239, 68, 68, ${f.life / 38})`;
        ctx.fillStyle = `rgba(239, 68, 68, ${(f.life / 38) * 0.25})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 22 + (38 - f.life) * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 11px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(f.label, f.x, f.y - 24);
        ctx.restore();

        if (cfg.isRunning) {
          f.life -= 1;
          if (f.life <= 0) conflictFlashes.splice(i, 1);
        }
      }

      // 每 15 frames 同步一次 React UI 數據面板
      if (phaseTimer % 15 === 0) {
        setStats({ ...localStats });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="bg-asphalt-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* 頂部控制列 */}
      <div className="p-5 md:p-6 bg-asphalt-800/80 border-b border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-blue-400 mb-1">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Interactive Traffic Engineering Lab · 路口車流衝突實驗室</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            為什麼「強制待轉」反而製造了外側死亡交織？
          </h3>
        </div>

        {/* 模式一鍵切換按鈕 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleModeChange('segregated')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              mode === 'segregated'
                ? 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-lg shadow-red-950/50'
                : 'bg-zinc-800/70 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>1984 傳統強制待轉（車種分流）</span>
          </button>

          <button
            onClick={() => handleModeChange('directional')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              mode === 'directional'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-950/50'
                : 'bg-zinc-800/70 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>現代改革：車向分流＋安全彈性待轉</span>
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
            title={isRunning ? '暫停模擬' : '繼續模擬'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 主體：左側畫布 + 右側即時工程指標與參數調整 */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 bg-[#0c0e12] relative flex items-center justify-center p-2 md:p-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={560}
            className="w-full h-auto max-h-[540px] rounded-xl border border-zinc-800/80"
          />
          {/* 圖例浮層 */}
          <div className="absolute bottom-5 left-5 bg-zinc-950/90 backdrop-blur border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs space-y-1.5">
            <div className="font-mono text-zinc-400 mb-1">圖例 (由南往北車流)</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-2 rounded-sm bg-sky-400 inline-block"></span>
              <span className="text-zinc-200">準備左轉的機車</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
              <span className="text-zinc-200">準備右轉的汽車（交織來源）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2.5 rounded-sm bg-slate-500 inline-block"></span>
              <span className="text-zinc-400">直行 / 左轉汽車</span>
            </div>
          </div>
        </div>

        {/* 右側控制與數據解讀欄 */}
        <div className="lg:col-span-4 p-5 md:p-6 bg-asphalt-900 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>調整路口壓力參數</span>
            </div>

            {/* 車流量滑桿 */}
            <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">尖峰車流量密度</span>
                <span className="font-mono text-blue-400 font-bold">
                  {trafficDensity < 1.5 ? '離峰順暢' : trafficDensity < 2.4 ? '一般通勤' : '上下班尖峰機車潮'} ({trafficDensity.toFixed(1)}x)
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.2"
                step="0.2"
                value={trafficDensity}
                onChange={(e) => setTrafficDensity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 待轉格尺寸切換 (僅在傳統模式凸顯差異) */}
            {mode === 'segregated' && (
              <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-xl p-4 space-y-2.5">
                <div className="text-xs text-zinc-400">待轉區幾何尺寸設定</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBoxSize('nano')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition ${
                      boxSize === 'nano'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    奈米待轉格 (容量4輛)
                  </button>
                  <button
                    onClick={() => setBoxSize('standard')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition ${
                      boxSize === 'standard'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    大型待轉格 (容量11輛)
                  </button>
                </div>
              </div>
            )}

            {/* 即時衝突計數器 */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/50 flex items-center justify-between">
                <div>
                  <div className="text-xs text-red-300 font-medium">外側「右轉汽車 × 左轉機車」交織衝突</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">因內側禁行機車，迫使左轉機車切往最外側</div>
                </div>
                <div className="text-2xl font-mono font-bold text-red-400">{stats.weaveConflicts}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 flex items-center justify-between">
                <div>
                  <div className="text-xs text-amber-300 font-medium">待轉格溢流（回堵直行道與斑馬線）</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">超出白框容量、暴露於車流撞擊軌跡</div>
                </div>
                <div className="text-2xl font-mono font-bold text-amber-400">{stats.boxOverflowCount}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-900/40 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-300 font-medium">已完成左轉通過路口車輛</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">車向分流免除二次停等紅燈</div>
                </div>
                <div className="text-2xl font-mono font-bold text-emerald-400">{stats.completedLeftTurns}</div>
              </div>
            </div>
          </div>

          {/* 工程師解說卡片 */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs leading-relaxed text-zinc-300 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{mode === 'segregated' ? '正在觀察：1984 車種分流的結構矛盾' : '正在觀察：現代車向分流＋安全彈性待轉'}</span>
            </div>
            {mode === 'segregated' ? (
              <p>
                當內側車道漆上<span className="text-amber-400 font-medium">「禁行機車」</span>，所有想左轉的機車（亮藍點）必須先向右切入最外側車道才能進待轉格，此時正好與準備右轉的汽車（橘色）發生嚴重的<span className="text-red-400 font-medium">「死亡交叉（Weaving Conflict）」</span>。到了紅燈，過小的待轉格又瞬間溢流回堵直行車道。
              </p>
            ) : (
              <p>
                塗銷內側禁行機車並改為<span className="text-blue-400 font-medium">「左轉專用道（左轉靠左、右轉靠右）」</span>後，左轉機車與右轉汽車的動線完全解耦（0 交織衝突）！同時將斑馬線退縮、增設庇護島，並保留<span className="text-emerald-400 font-medium">「非強制的安全彈性待轉格」</span>供少數長者或慢速車安心使用。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
