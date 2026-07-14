/* Physics Visual Lab · Interface Overhaul v4.4.0 */
(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const VERSION = "4.4.0";
  let passQueued = false;
  let applyingCircuit = false;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);

  function languageCode() {
    const value = (document.documentElement.lang || "en").toLowerCase();
    return ["zh", "en", "ja", "ko", "ru", "uz", "th", "my", "shn"].find(code => value.startsWith(code)) || "en";
  }

  function homeCopy() {
    const copy = {
      zh: {
        evolution: "连续演化",
        evolutionSub: "拉莫尔进动 · 状态随时间平滑变化",
        apparatus: "投影测量",
        apparatusSub: "Stern–Gerlach 磁场梯度",
        outcomes: "离散读出",
        outcomesSub: "单次事件只落在两个通道之一",
        time: "时间",
        angle: "锥角保持不变",
        beam: "原子束",
        gradient: "∂Bz/∂z",
        detector: "探测屏",
        footerA: "连续：态矢量与相位演化",
        footerB: "测量：沿选定轴投影",
        footerC: "离散：记录 +ℏ/2 或 −ℏ/2"
      },
      en: {
        evolution: "Continuous evolution",
        evolutionSub: "Larmor precession · smooth time evolution",
        apparatus: "Projective measurement",
        apparatusSub: "Stern–Gerlach field gradient",
        outcomes: "Discrete readout",
        outcomesSub: "one event lands in one of two channels",
        time: "time",
        angle: "fixed cone angle",
        beam: "atomic beam",
        gradient: "∂Bz/∂z",
        detector: "detector",
        footerA: "continuous: state and phase evolution",
        footerB: "measurement: projection on an axis",
        footerC: "discrete: record +ℏ/2 or −ℏ/2"
      },
      ja: {
        evolution: "連続時間発展",
        evolutionSub: "ラーモア歳差運動 · 滑らかな状態変化",
        apparatus: "射影測定",
        apparatusSub: "Stern–Gerlach 磁場勾配",
        outcomes: "離散的な読出し",
        outcomesSub: "一回の事象は二つの経路の一方へ",
        time: "時間",
        angle: "円錐角は一定",
        beam: "原子ビーム",
        gradient: "∂Bz/∂z",
        detector: "検出器",
        footerA: "連続：状態と位相の時間発展",
        footerB: "測定：選択軸への射影",
        footerC: "離散：+ℏ/2 または −ℏ/2"
      },
      ko: {
        evolution: "연속 시간 진화",
        evolutionSub: "라모어 세차 · 매끄러운 상태 변화",
        apparatus: "사영 측정",
        apparatusSub: "Stern–Gerlach 자기장 기울기",
        outcomes: "이산 판독",
        outcomesSub: "한 사건은 두 채널 중 하나에 기록",
        time: "시간",
        angle: "원뿔각 일정",
        beam: "원자빔",
        gradient: "∂Bz/∂z",
        detector: "검출기",
        footerA: "연속: 상태와 위상 진화",
        footerB: "측정: 선택 축으로 사영",
        footerC: "이산: +ℏ/2 또는 −ℏ/2"
      }
    };
    return copy[languageCode()] || copy.en;
  }

  function upgradeHomeVisual() {
    const visual = document.querySelector(".pvl-home-visual");
    if (!visual) return;
    const c = homeCopy();
    const signature = `${VERSION}-${languageCode()}`;
    if (visual.dataset.pvlOverhaul === signature) return;

    visual.dataset.pvlOverhaul = signature;
    visual.className = "pvl-home-visual pvl-home-visual-v3";
    visual.removeAttribute("aria-hidden");
    visual.setAttribute("role", "img");
    visual.setAttribute("aria-label", `${c.evolution} → ${c.apparatus} → ${c.outcomes}`);
    visual.innerHTML = `
      <svg class="pvl-hero-physics" viewBox="0 0 960 560" aria-hidden="true">
        <defs>
          <linearGradient id="pvl-v44-beam" x1="0" x2="1"><stop offset="0" stop-color="#93e5e8" stop-opacity=".18"/><stop offset=".4" stop-color="#93e5e8"/><stop offset="1" stop-color="#93e5e8" stop-opacity=".22"/></linearGradient>
          <linearGradient id="pvl-v44-vector" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d7aa5d" stop-opacity=".2"/><stop offset="1" stop-color="#f0c875"/></linearGradient>
          <marker id="pvl-v44-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#93e5e8"/></marker>
          <marker id="pvl-v44-arrow-warm" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#f0c875"/></marker>
          <filter id="pvl-v44-soft"><feGaussianBlur stdDeviation="6"/></filter>
        </defs>

        <g class="pvl-hero-panel pvl-hero-evolution">
          <text class="pvl-hero-index" x="36" y="43">01</text>
          <text class="pvl-hero-title" x="76" y="43">${esc(c.evolution)}</text>
          <text class="pvl-hero-subtitle" x="36" y="68">${esc(c.evolutionSub)}</text>

          <line class="pvl-hero-axis" x1="164" y1="116" x2="164" y2="395" marker-end="url(#pvl-v44-arrow)"/>
          <text class="pvl-hero-axis-label" x="176" y="126">B ẑ</text>
          <ellipse class="pvl-hero-orbit" cx="164" cy="285" rx="112" ry="43"/>
          <path class="pvl-hero-cone" d="M164 348L52 285M164 348L276 285"/>
          <path class="pvl-hero-angle" d="M164 321A38 38 0 0 1 187 316"/>
          <text class="pvl-hero-axis-label" x="189" y="320">θ</text>

          <g opacity=".22" transform="rotate(-58 164 348)"><line class="pvl-hero-ghost-vector" x1="164" y1="348" x2="164" y2="176"/><path class="pvl-hero-ghost-tip" d="M164 164l-8 18h16Z"/></g>
          <g opacity=".34" transform="rotate(-30 164 348)"><line class="pvl-hero-ghost-vector" x1="164" y1="348" x2="164" y2="176"/><path class="pvl-hero-ghost-tip" d="M164 164l-8 18h16Z"/></g>
          <g opacity=".5" transform="rotate(-3 164 348)"><line class="pvl-hero-ghost-vector" x1="164" y1="348" x2="164" y2="176"/><path class="pvl-hero-ghost-tip" d="M164 164l-8 18h16Z"/></g>
          <g class="pvl-hero-live-vector" transform="rotate(26 164 348)"><line x1="164" y1="348" x2="164" y2="162"/><path d="M164 148l-9 20h18Z"/></g>
          <circle class="pvl-hero-orbit-dot" r="7"><animateMotion dur="4.2s" repeatCount="indefinite" path="M52 285A112 43 0 1 0 276 285A112 43 0 1 0 52 285"/></circle>

          <line class="pvl-hero-time" x1="48" y1="430" x2="278" y2="430" marker-end="url(#pvl-v44-arrow)"/>
          <text class="pvl-hero-axis-label" x="48" y="420">φ(t)=ω<tspan baseline-shift="sub" font-size="9">L</tspan>t</text>
          <text class="pvl-hero-axis-label" x="238" y="420">${esc(c.time)}</text>
          <text class="pvl-hero-note" x="48" y="462">|μ| = const · ${esc(c.angle)}</text>
        </g>

        <line class="pvl-hero-divider" x1="330" y1="24" x2="330" y2="486"/>

        <g class="pvl-hero-panel pvl-hero-measurement">
          <text class="pvl-hero-index" x="362" y="43">02</text>
          <text class="pvl-hero-title" x="402" y="43">${esc(c.apparatus)}</text>
          <text class="pvl-hero-subtitle" x="362" y="68">${esc(c.apparatusSub)}</text>

          <rect class="pvl-source-box" x="370" y="222" width="62" height="70" rx="7"/>
          <circle class="pvl-source-dot" cx="401" cy="257" r="6"/>
          <text class="pvl-hero-axis-label" x="370" y="312">${esc(c.beam)}</text>
          <path class="pvl-input-beam" d="M432 257H494" marker-end="url(#pvl-v44-arrow)"/>

          <path class="pvl-magnet north" d="M494 126h112v92h-54v78h-58Z"/>
          <path class="pvl-magnet south" d="M494 388h112v-92h-54v-78h-58Z"/>
          <text class="pvl-magnet-label" x="550" y="174">N</text>
          <text class="pvl-magnet-label" x="550" y="348">S</text>
          <line class="pvl-gradient-arrow" x1="522" y1="330" x2="522" y2="184" marker-end="url(#pvl-v44-arrow-warm)"/>
          <text class="pvl-hero-axis-label" x="532" y="260" transform="rotate(-90 532 260)">${esc(c.gradient)}</text>

          <path class="pvl-split-beam" d="M552 257C614 249 624 190 670 156"/>
          <path class="pvl-split-beam" d="M552 257C614 265 624 324 670 358"/>
          <circle class="pvl-packet warm" cx="648" cy="172" r="7"/>
          <circle class="pvl-packet warm" cx="648" cy="342" r="7"/>
        </g>

        <line class="pvl-hero-divider" x1="690" y1="24" x2="690" y2="486"/>

        <g class="pvl-hero-panel pvl-hero-outcomes">
          <text class="pvl-hero-index" x="722" y="43">03</text>
          <text class="pvl-hero-title" x="762" y="43">${esc(c.outcomes)}</text>
          <text class="pvl-hero-subtitle" x="722" y="68">${esc(c.outcomesSub)}</text>

          <rect class="pvl-detector" x="730" y="126" width="194" height="142" rx="5"/>
          <rect class="pvl-detector" x="730" y="300" width="194" height="142" rx="5"/>
          <line class="pvl-detector-edge" x1="730" y1="126" x2="730" y2="268"/>
          <line class="pvl-detector-edge" x1="730" y1="300" x2="730" y2="442"/>
          <text class="pvl-outcome-label" x="752" y="158">+ℏ/2</text>
          <text class="pvl-outcome-label" x="752" y="332">−ℏ/2</text>
          <circle class="pvl-hit" cx="854" cy="205" r="8"/>
          <circle class="pvl-hit" cx="854" cy="377" r="8"/>
          <path class="pvl-count-line" d="M756 244h28v-24h24v12h24v-38h24v50h36"/>
          <path class="pvl-count-line" d="M756 418h28v-42h24v18h24v-28h24v52h36"/>
          <text class="pvl-hero-axis-label" x="730" y="470">${esc(c.detector)} · N<tspan baseline-shift="sub" font-size="9">+</tspan>, N<tspan baseline-shift="sub" font-size="9">−</tspan></text>
        </g>

        <g class="pvl-hero-process-strip">
          <text x="36" y="530">${esc(c.footerA)}</text>
          <path d="M312 525h28" marker-end="url(#pvl-v44-arrow)"/>
          <text x="364" y="530">${esc(c.footerB)}</text>
          <path d="M655 525h28" marker-end="url(#pvl-v44-arrow)"/>
          <text x="714" y="530">${esc(c.footerC)}</text>
        </g>
      </svg>`;
  }

  function springPath(endX, y = 210, startX = 55, coils = 8, amplitude = 18) {
    const lead = 22;
    const tail = 9;
    const usableEnd = Math.max(startX + 72, endX - tail);
    const zigStart = startX + lead;
    const zigWidth = Math.max(34, usableEnd - zigStart);
    const step = zigWidth / (coils * 2);
    const parts = [`M${startX} ${y}`, `L${zigStart} ${y}`];
    for (let i = 1; i < coils * 2; i += 1) {
      parts.push(`L${(zigStart + step * i).toFixed(2)} ${(y + (i % 2 ? -amplitude : amplitude)).toFixed(2)}`);
    }
    parts.push(`L${usableEnd.toFixed(2)} ${y}`, `L${endX.toFixed(2)} ${y}`);
    return parts.join(" ");
  }

  function fixOscillatorSpring() {
    const svg = document.querySelector(".oscillator-svg");
    if (!svg || svg.dataset.pvlSpringFix === VERSION) return;
    const massRect = svg.querySelector(".oscillator-mass");
    const spring = svg.querySelector(".oscillator-spring");
    const massGroup = massRect?.parentElement;
    const animateX = massRect?.querySelector('animate[attributeName="x"]');
    if (!massRect || !spring || !massGroup || !animateX) return;

    const values = (animateX.getAttribute("values") || "").split(";").map(Number).filter(Number.isFinite);
    if (values.length < 2) return;
    const xMin = Math.min(...values);
    const xMax = Math.max(...values);
    const xCenter = (xMin + xMax) / 2;
    const amplitude = (xMax - xMin) / 2;
    const duration = animateX.getAttribute("dur") || "2s";
    const massWidth = Number(massRect.getAttribute("width")) || 105;
    const massY = Number(massRect.getAttribute("y")) || 165;
    const massHeight = Number(massRect.getAttribute("height")) || 90;

    animateX.remove();
    massRect.setAttribute("x", String(xCenter));
    const motion = document.createElementNS(SVG_NS, "animateTransform");
    motion.setAttribute("attributeName", "transform");
    motion.setAttribute("type", "translate");
    motion.setAttribute("values", `${-amplitude} 0;${amplitude} 0;${-amplitude} 0`);
    motion.setAttribute("dur", duration);
    motion.setAttribute("repeatCount", "indefinite");
    massGroup.insertBefore(motion, massGroup.firstChild);

    spring.setAttribute("d", springPath(xCenter));
    const animateD = document.createElementNS(SVG_NS, "animate");
    animateD.setAttribute("attributeName", "d");
    animateD.setAttribute("values", `${springPath(xMin)};${springPath(xMax)};${springPath(xMin)}`);
    animateD.setAttribute("dur", duration);
    animateD.setAttribute("repeatCount", "indefinite");
    spring.appendChild(animateD);

    const connector = document.createElementNS(SVG_NS, "circle");
    connector.setAttribute("class", "oscillator-connector");
    connector.setAttribute("cx", String(xCenter));
    connector.setAttribute("cy", "210");
    connector.setAttribute("r", "4.5");
    const connectorMotion = document.createElementNS(SVG_NS, "animateTransform");
    connectorMotion.setAttribute("attributeName", "transform");
    connectorMotion.setAttribute("type", "translate");
    connectorMotion.setAttribute("values", `${-amplitude} 0;${amplitude} 0;${-amplitude} 0`);
    connectorMotion.setAttribute("dur", duration);
    connectorMotion.setAttribute("repeatCount", "indefinite");
    connector.appendChild(connectorMotion);
    massGroup.parentElement.insertBefore(connector, massGroup);

    const label = massGroup.querySelector(".oscillator-mass-label");
    if (label) {
      label.setAttribute("x", String(xCenter + massWidth / 2));
      label.setAttribute("y", String(massY + massHeight / 2 + 7));
    }
    svg.dataset.pvlSpringFix = VERSION;
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .replace(/ω0/g, "ω₀")
      .replace(/F0/g, "F₀")
      .replace(/x¨/g, "ẍ")
      .replace(/x˙/g, "ẋ");
  }

  function mathML(markup) {
    return `<math class="pvl-mathml" display="block" xmlns="http://www.w3.org/1998/Math/MathML">${markup}</math>`;
  }

  function replaceKnownFormula(block) {
    if (block.dataset.pvlFormula === VERSION) return;
    const text = normalizeText(block.textContent);
    let markup = "";
    if (/^mẍ\+bẋ\+kx=F₀cos\(?ωt\)?$/i.test(text)) {
      markup = `<mrow><mi>m</mi><mover><mi>x</mi><mo>¨</mo></mover><mo>+</mo><mi>b</mi><mover><mi>x</mi><mo>˙</mo></mover><mo>+</mo><mi>k</mi><mi>x</mi><mo>=</mo><msub><mi>F</mi><mn>0</mn></msub><mi>cos</mi><mo>⁡</mo><mo>(</mo><mi>ω</mi><mi>t</mi><mo>)</mo></mrow>`;
    } else if (/^ω₀=√k\/?m$/.test(text) || (text.startsWith("ω₀=√") && text.includes("k") && text.endsWith("m"))) {
      markup = `<mrow><msub><mi>ω</mi><mn>0</mn></msub><mo>=</mo><msqrt><mfrac><mi>k</mi><mi>m</mi></mfrac></msqrt></mrow>`;
    } else if (/^x\(t\)=Re\[Xe\^?iωt\]$/i.test(text) || (text.startsWith("x(t)=Re[") && text.includes("iωt"))) {
      markup = `<mrow><mi>x</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi mathvariant="normal">Re</mi><mo>[</mo><mi>X</mi><msup><mi>e</mi><mrow><mi>i</mi><mi>ω</mi><mi>t</mi></mrow></msup><mo>]</mo></mrow>`;
    } else if (text.startsWith("A(ω)=") && text.includes("F₀") && text.includes("bω")) {
      markup = `<mrow><mi>A</mi><mo>(</mo><mi>ω</mi><mo>)</mo><mo>=</mo><mfrac><msub><mi>F</mi><mn>0</mn></msub><msqrt><mrow><msup><mrow><mo>(</mo><mi>k</mi><mo>−</mo><mi>m</mi><msup><mi>ω</mi><mn>2</mn></msup><mo>)</mo></mrow><mn>2</mn></msup><mo>+</mo><msup><mrow><mo>(</mo><mi>b</mi><mi>ω</mi><mo>)</mo></mrow><mn>2</mn></msup></mrow></msqrt></mfrac></mrow>`;
    }
    if (markup) block.innerHTML = mathML(markup);
    block.dataset.pvlFormula = VERSION;
  }

  function wrapRadicalBeforeFraction(root) {
    const fractions = [...root.querySelectorAll(".math-frac, .fraction")];
    fractions.forEach(frac => {
      if (frac.closest(".pvl-radical")) return;
      let previous = frac.previousSibling;
      while (previous?.nodeType === Node.TEXT_NODE && !previous.textContent.trim() && previous.previousSibling) previous = previous.previousSibling;
      if (!previous || previous.nodeType !== Node.TEXT_NODE) return;
      const raw = previous.textContent;
      if (!/√\s*$/.test(raw)) return;
      previous.textContent = raw.replace(/√\s*$/, "");
      const radical = document.createElement("span");
      radical.className = "pvl-radical";
      const radicand = document.createElement("span");
      radicand.className = "pvl-radicand";
      frac.parentNode.insertBefore(radical, frac);
      radical.appendChild(radicand);
      radicand.appendChild(frac);
    });
  }

  function upgradeTheoryMath() {
    const blocks = document.querySelectorAll(".theory-equation, .formula-panel, .equation, .theory-note, .theory-warning");
    blocks.forEach(block => {
      replaceKnownFormula(block);
      wrapRadicalBeforeFraction(block);
      block.querySelectorAll(".math-frac, .fraction").forEach(frac => {
        frac.dataset.pvlMath = VERSION;
        const parts = frac.querySelectorAll(":scope > span");
        if (parts.length >= 2 && !frac.getAttribute("aria-label")) {
          frac.setAttribute("aria-label", `${parts[0].textContent} divided by ${parts[1].textContent}`);
        }
      });
    });
  }

  function stateSignature(state) {
    try {
      return JSON.stringify({
        nodes: state.nodes?.map(n => [n.id, n.label]),
        components: state.components?.map(c => [c.id, c.name, c.type, c.nodes, c.value]),
        selected: state.selected,
        probe: state.analysis?.probe,
        reference: state.analysis?.reference
      });
    } catch {
      return String(Date.now());
    }
  }

  function primaryEdges(state) {
    const ids = new Set((state.nodes || []).map(n => String(n.id)));
    return (state.components || []).filter(c => {
      const a = String(c.nodes?.[0] ?? "");
      const b = String(c.nodes?.[1] ?? "");
      return a && b && a !== b && ids.has(a) && ids.has(b);
    });
  }

  function validateCircuit(state) {
    const nodeIds = new Set((state.nodes || []).map(n => String(n.id)));
    const ground = nodeIds.has("0") || (state.nodes || []).some(n => /gnd|ground|参考地|接地/i.test(`${n.id} ${n.label}`));
    const invalid = (state.components || []).filter(c => !(c.nodes || []).every(n => nodeIds.has(String(n))));
    const shorted = (state.components || []).filter(c => String(c.nodes?.[0]) === String(c.nodes?.[1]));
    return {
      ok: ground && invalid.length === 0 && shorted.length === 0,
      ground,
      invalid: invalid.length,
      shorted: shorted.length
    };
  }

  function buildCircuitLayout(state) {
    const nodes = (state.nodes || []).map(n => ({...n, id: String(n.id)}));
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const edges = primaryEdges(state);
    const groundId = nodeMap.has("0") ? "0" : nodes.find(n => /gnd|ground|参考地|接地/i.test(`${n.id} ${n.label}`))?.id;
    const source = (state.components || []).find(c => ["vdc", "vsin", "idc", "isin"].includes(c.type));
    const sourceId = String(source?.nodes?.find(n => String(n) !== groundId) ?? nodes.find(n => n.id !== groundId)?.id ?? "");
    const probeId = String(state.analysis?.probe ?? "");
    const positions = new Map();

    if (nodes.length <= 4 && sourceId && groundId) {
      positions.set(sourceId, {x: 110, y: 100});
      positions.set(groundId, {x: 110, y: 350});
      if (probeId && nodeMap.has(probeId) && probeId !== sourceId && probeId !== groundId) positions.set(probeId, {x: 620, y: 220});
      const rest = nodes.filter(n => !positions.has(n.id));
      rest.forEach((n, i) => positions.set(n.id, {x: 365, y: 145 + i * 145}));
      return {nodes, edges, positions, groundId, sourceId, probeId};
    }

    const adjacency = new Map(nodes.map(n => [n.id, new Set()]));
    edges.forEach(edge => {
      const a = String(edge.nodes[0]);
      const b = String(edge.nodes[1]);
      adjacency.get(a)?.add(b);
      adjacency.get(b)?.add(a);
    });
    const rank = new Map();
    if (sourceId && nodeMap.has(sourceId)) {
      rank.set(sourceId, 0);
      const queue = [sourceId];
      while (queue.length) {
        const current = queue.shift();
        for (const next of adjacency.get(current) || []) {
          if (next === groundId || rank.has(next)) continue;
          rank.set(next, (rank.get(current) || 0) + 1);
          queue.push(next);
        }
      }
    }
    let fallback = Math.max(0, ...rank.values()) + 1;
    nodes.forEach(n => { if (n.id !== groundId && !rank.has(n.id)) rank.set(n.id, fallback++); });
    if (probeId && rank.has(probeId)) rank.set(probeId, Math.max(...rank.values()) + 1);

    const groups = new Map();
    nodes.filter(n => n.id !== groundId).forEach(n => {
      const r = rank.get(n.id) || 0;
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(n);
    });
    const ranks = [...groups.keys()].sort((a, b) => a - b);
    ranks.forEach((r, rankIndex) => {
      const items = groups.get(r).sort((a, b) => String(a.label).localeCompare(String(b.label)));
      const x = 92 + (ranks.length === 1 ? 0 : rankIndex / (ranks.length - 1)) * 540;
      items.forEach((n, i) => {
        const y = items.length === 1 ? 215 : 82 + (i + 0.5) / items.length * 270;
        positions.set(n.id, {x, y});
      });
    });
    if (sourceId && positions.has(sourceId)) positions.set(sourceId, {x: 105, y: 105});
    if (groundId) positions.set(groundId, {x: 105, y: 355});
    if (probeId && positions.has(probeId)) positions.set(probeId, {x: 625, y: 215});
    return {nodes, edges, positions, groundId, sourceId, probeId};
  }

  function symbolBody(type) {
    if (type === "resistor") return `<path class="pvl-symbol-core" d="M-32 0h7l5-10 10 20 10-20 10 20 10-20 5 10h7"/>`;
    if (type === "capacitor") return `<path class="pvl-symbol-core" d="M-32 0h22M-10-15v30M10-15v30M10 0h22"/>`;
    if (type === "inductor") return `<path class="pvl-symbol-core" d="M-32 0h5c0-16 13-16 13 0 0-16 13-16 13 0 0-16 13-16 13 0 0-16 13-16 13 0h7"/>`;
    if (type === "wire") return `<path class="pvl-symbol-core" d="M-32 0h64"/>`;
    if (type === "switch") return `<path class="pvl-symbol-core" d="M-32 0h14M-15 0l30-15M18 0h14"/><circle class="pvl-symbol-core" cx="-16" cy="0" r="2.5"/><circle class="pvl-symbol-core" cx="16" cy="0" r="2.5"/>`;
    if (["vdc", "vsin", "idc", "isin"].includes(type)) {
      const glyph = type === "vsin" || type === "isin" ? "∿" : type === "idc" ? "→" : "±";
      return `<path class="pvl-symbol-core" d="M-32 0h11M21 0h11"/><circle class="pvl-symbol-core" r="21"/><text class="pvl-symbol-glyph" y="5" text-anchor="middle">${glyph}</text>`;
    }
    if (type === "voltmeter" || type === "ammeter") return `<path class="pvl-symbol-core" d="M-32 0h11M21 0h11"/><circle class="pvl-symbol-core" r="21"/><text class="pvl-symbol-glyph" y="5" text-anchor="middle">${type === "voltmeter" ? "V" : "A"}</text>`;
    if (type === "diode" || type === "led") return `<path class="pvl-symbol-core" d="M-32 0h14M-18-12L5 0-18 12ZM6-14v28M6 0h26"/>`;
    if (type === "lamp") return `<path class="pvl-symbol-core" d="M-32 0h11M21 0h11"/><circle class="pvl-symbol-core" r="21"/><path class="pvl-symbol-core" d="M-10-10 10 10M10-10-10 10"/>`;
    if (type === "fuse") return `<path class="pvl-symbol-core" d="M-32 0h11M21 0h11"/><rect class="pvl-symbol-core" x="-21" y="-9" width="42" height="18" rx="3"/>`;
    if (type === "opamp") return `<path class="pvl-symbol-core" d="M-29-23v46L21 0ZM21 0h11"/><text class="pvl-symbol-glyph" x="-18" y="-7" text-anchor="middle">+</text><text class="pvl-symbol-glyph" x="-18" y="15" text-anchor="middle">−</text>`;
    if (type === "vcvs") return `<path class="pvl-symbol-core" d="M-32 0h11M21 0h11M0-23 21 0 0 23-21 0Z"/><text class="pvl-symbol-glyph" y="5" text-anchor="middle">±</text>`;
    if (type === "vccs") return `<path class="pvl-symbol-core" d="M-32 0h11M21 0h11M0-23 21 0 0 23-21 0ZM0 12V-11M-6-4 0-12 6-4"/>`;
    if (type === "npn") return `<path class="pvl-symbol-core" d="M-32 0h17M-15-18v36M-15-8 14-21M-15 8 14 21M5 13 14 21 4 22"/>`;
    if (type === "nmos") return `<path class="pvl-symbol-core" d="M-32 0h13M-15-18v36M-5-18v36M-5-13h20M-5 13h20M15-13v26"/>`;
    return `<path class="pvl-symbol-core" d="M-32 0h9M23 0h9"/><rect class="pvl-symbol-core" x="-23" y="-15" width="46" height="30" rx="4"/>`;
  }

  function routeEdge(a, b, index, count) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const centerOffset = (index - (count - 1) / 2) * 82;
    if (Math.abs(dx) >= 135) {
      const sign = Math.sign(dx) || 1;
      const x1 = a.x + sign * 58;
      const x2 = b.x - sign * 58;
      const laneY = clamp((a.y + b.y) / 2 + centerOffset, 78, 355);
      const d = `M${a.x} ${a.y} L${x1} ${a.y} Q${x1} ${laneY} ${x1} ${laneY} L${x2} ${laneY} Q${x2} ${b.y} ${x2} ${b.y} L${b.x} ${b.y}`;
      return {d, x: (x1 + x2) / 2, y: laneY, angle: dx >= 0 ? 0 : 180};
    }
    const sign = Math.sign(dy) || 1;
    const y1 = a.y + sign * 58;
    const y2 = b.y - sign * 58;
    const laneX = clamp((a.x + b.x) / 2 + centerOffset, 72, 650);
    const d = `M${a.x} ${a.y} L${a.x} ${y1} Q${laneX} ${y1} ${laneX} ${y1} L${laneX} ${y2} Q${b.x} ${y2} ${b.x} ${y2} L${b.x} ${b.y}`;
    return {d, x: laneX, y: (y1 + y2) / 2, angle: dy >= 0 ? 90 : -90};
  }

  function renderCircuitSchematic() {
    if (applyingCircuit) return;
    const workbench = window.PVLCircuitWorkbench;
    const wrap = document.querySelector(".cw-schematic-wrap");
    if (!workbench?.getState || !wrap) return;
    const state = workbench.getState();
    const signature = stateSignature(state);
    if (wrap.dataset.pvlCircuitSignature === signature) return;

    const layout = buildCircuitLayout(state);
    const validation = validateCircuit(state);
    const groups = new Map();
    layout.edges.forEach(edge => {
      const key = [String(edge.nodes[0]), String(edge.nodes[1])].sort().join("::");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(edge);
    });
    groups.forEach(items => items.sort((a, b) => {
      const instrument = type => ["voltmeter", "ammeter"].includes(type) ? 1 : 0;
      return instrument(a.type) - instrument(b.type) || String(a.name).localeCompare(String(b.name));
    }));

    const edgeMarkup = layout.edges.map(edge => {
      const aId = String(edge.nodes[0]);
      const bId = String(edge.nodes[1]);
      const a = layout.positions.get(aId);
      const b = layout.positions.get(bId);
      if (!a || !b) return "";
      const siblings = groups.get([aId, bId].sort().join("::")) || [edge];
      const index = siblings.indexOf(edge);
      const route = routeEdge(a, b, index, siblings.length);
      const selected = state.selected === edge.id || state.selected === edge.name;
      const controls = (edge.nodes || []).slice(2).map((nodeId, i) => {
        const point = layout.positions.get(String(nodeId));
        if (!point) return "";
        const targetX = route.x + (i % 2 ? 19 : -19);
        const targetY = route.y + (i < 2 ? -22 : 22);
        return `<path class="pvl-circuit-control-wire" d="M${point.x} ${point.y} L${targetX} ${targetY}"/>`;
      }).join("");
      return `${controls}
        <path class="pvl-circuit-wire" d="${route.d}"/>
        <g class="pvl-circuit-symbol${selected ? " is-selected" : ""}" data-pvl-circuit-select="${esc(edge.id)}" transform="translate(${route.x} ${route.y}) rotate(${route.angle})">
          <rect class="pvl-symbol-mask" x="-45" y="-30" width="90" height="60" rx="6"/>
          ${symbolBody(edge.type)}
          <g transform="rotate(${-route.angle})">
            <text class="pvl-symbol-name" y="-35" text-anchor="middle">${esc(edge.name || edge.id)}</text>
            <text class="pvl-symbol-value" y="42" text-anchor="middle">${esc(edge.value ?? "")}</text>
          </g>
        </g>`;
    }).join("");

    const nodes = layout.nodes.map(node => {
      const p = layout.positions.get(node.id);
      if (!p) return "";
      const ground = node.id === layout.groundId;
      return `<g class="pvl-circuit-node${ground ? " is-ground" : ""}" transform="translate(${p.x} ${p.y})">
        <circle r="7"/><text y="-16" text-anchor="middle">${esc(node.label || node.id)}</text>
        ${ground ? `<path class="pvl-symbol-core" d="M0 7v10M-15 17h30M-10 23h20M-5 29h10"/>` : ""}
      </g>`;
    }).join("");

    const meta = validation.ok
      ? `NETLIST VERIFIED · ${layout.nodes.length} NODES · ${state.components.length} DEVICES`
      : `CHECK CIRCUIT · ${validation.ground ? "GND OK" : "NO GND"} · ${validation.invalid} INVALID · ${validation.shorted} SHORTED`;

    applyingCircuit = true;
    wrap.dataset.pvlCircuitSignature = signature;
    wrap.innerHTML = state.components?.length ? `
      <svg class="pvl-circuit-schematic" viewBox="0 0 720 430" role="img" aria-label="Circuit schematic">
        <text class="pvl-circuit-meta${validation.ok ? " is-ok" : " is-warning"}" x="24" y="27">${esc(meta)}</text>
        ${edgeMarkup}${nodes}
      </svg>` : `<div class="pvl-circuit-empty">Choose a reference experiment or add components.</div>`;

    wrap.querySelectorAll("[data-pvl-circuit-select]").forEach(element => {
      element.addEventListener("click", () => {
        const id = element.getAttribute("data-pvl-circuit-select");
        const original = [...document.querySelectorAll("[data-cw-select]")].find(item => item.getAttribute("data-cw-select") === id && !wrap.contains(item));
        original?.click();
      });
    });
    applyingCircuit = false;
  }

  function guideCopy() {
    const code = languageCode();
    const text = window.PVLCircuitWorkbench?.__test?.TEXT?.[code] || window.PVLCircuitWorkbench?.__test?.TEXT?.en || {};
    if (code === "zh") return {
      kicker: "WORKBENCH MANUAL",
      title: "电路实验台使用说明",
      intro: "图形只是网表的可视化；真正的连接关系由节点名称决定。建议先从模板开始，再逐步改拓扑。",
      sections: [
        ["快速开始", ["选择一个标准实验模板。", "确认存在 GND/0 参考节点。", "先运行直流工作点，再做交流或瞬态分析。", "一次只修改一个参数。"]],
        ["接线规则", ["电压表并联，电流表串联。", "同名节点电气相连；画得近不代表导通。", "理想电源与理想导线形成闭环时可能导致矩阵奇异。", "弯折线路仅用于避免视觉重叠。"]],
        ["建议顺序", ["分压器 → RC → RLC → 惠斯通电桥 → 二极管 → 运放。", text.limits || "教学模型不能替代厂商 SPICE 模型。"]]
      ]
    };
    return {
      kicker: "WORKBENCH MANUAL",
      title: text.workbench || "Circuit workbench guide",
      intro: text.editHint || "Node names define the electrical circuit; the drawing is only a visualization.",
      sections: [
        ["Quick start", [text.presets || "Choose a reference experiment.", text.ground || "Confirm a ground node.", text.operatingPoint || "Run a DC operating point first.", "Change one parameter at a time."]],
        ["Connection rules", ["Voltmeters go in parallel; ammeters go in series.", "Equal node names are connected.", "Ideal-source loops can make the matrix singular.", "Bent routes are only visual spacing."]],
        ["Recommended path", ["Divider → RC → RLC → Wheatstone → diode → op-amp.", text.limits || "Educational models are idealized."]]
      ]
    };
  }

  function ensureCircuitGuide() {
    const toolbar = document.querySelector(".cw-toolbar");
    if (!toolbar) return;
    const copy = guideCopy();
    let shell = document.querySelector(".pvl-circuit-guide-shell");
    if (!shell) {
      shell = document.createElement("div");
      shell.className = "pvl-circuit-guide-shell";
      document.body.appendChild(shell);
    }
    const signature = `${languageCode()}-${copy.title}`;
    if (shell.dataset.signature !== signature) {
      shell.dataset.signature = signature;
      shell.innerHTML = `<div class="pvl-circuit-guide-backdrop" data-pvl-guide-close></div><aside class="pvl-circuit-guide" role="dialog" aria-modal="true"><header class="pvl-guide-head"><div><small>${esc(copy.kicker)}</small><h2>${esc(copy.title)}</h2></div><button type="button" class="pvl-guide-close" data-pvl-guide-close>×</button></header><p class="pvl-guide-intro">${esc(copy.intro)}</p>${copy.sections.map(([title, items]) => `<section class="pvl-guide-section"><h3>${esc(title)}</h3><ol>${items.filter(Boolean).map(item => `<li>${esc(item)}</li>`).join("")}</ol></section>`).join("")}</aside>`;
      shell.querySelectorAll("[data-pvl-guide-close]").forEach(el => el.addEventListener("click", () => shell.classList.remove("is-open")));
    }
    let button = toolbar.querySelector(".pvl-circuit-guide-button");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "pvl-circuit-guide-button";
      button.addEventListener("click", () => shell.classList.add("is-open"));
      (toolbar.lastElementChild || toolbar).appendChild(button);
    }
    button.textContent = languageCode() === "zh" ? "使用说明" : "Guide";
  }

  function cleanupLegacyHotfix() {
    document.getElementById("pvl-ui-hotfix-style")?.remove();
    document.getElementById("pvl-home-guide")?.remove();
    document.querySelector(".pvl-help-fab")?.remove();
    document.querySelector(".pvl-inline-tip")?.remove();
    document.getElementById("pvl-circuit-help")?.remove();
  }

  function runPass() {
    passQueued = false;
    cleanupLegacyHotfix();
    upgradeHomeVisual();
    fixOscillatorSpring();
    upgradeTheoryMath();
    renderCircuitSchematic();
    ensureCircuitGuide();
  }

  function schedulePass() {
    if (passQueued) return;
    passQueued = true;
    requestAnimationFrame(runPass);
  }

  function start() {
    schedulePass();
    const observer = new MutationObserver(schedulePass);
    observer.observe(document.body, {childList: true, subtree: true});
    window.addEventListener("hashchange", schedulePass);
    window.addEventListener("pvl:languagechange", schedulePass);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") document.querySelector(".pvl-circuit-guide-shell")?.classList.remove("is-open");
    });
    setTimeout(schedulePass, 450);
    setTimeout(schedulePass, 1400);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once: true});
  else start();
})();
