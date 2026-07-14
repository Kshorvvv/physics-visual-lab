/* Physics Visual Lab · Interface Overhaul v4.3.0 */
(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const VERSION = "4.3.0";
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

  function upgradeHomeVisual() {
    const visual = document.querySelector(".pvl-home-visual");
    const code = languageCode();
    const labels = {
      zh: ["连续动力学", "测量", "离散结果"],
      en: ["Continuous dynamics", "Measurement", "Discrete outcomes"],
      ja: ["連続ダイナミクス", "測定", "離散的結果"],
      ko: ["연속 동역학", "측정", "이산 결과"],
      ru: ["Непрерывная динамика", "Измерение", "Дискретные результаты"],
      uz: ["Uzluksiz dinamika", "O‘lchash", "Diskret natijalar"],
      th: ["พลวัตต่อเนื่อง", "การวัด", "ผลลัพธ์ไม่ต่อเนื่อง"],
      my: ["ဆက်တိုက် ဒိုင်းနမစ်", "တိုင်းတာမှု", "ကွဲပြားရလဒ်"],
      shn: ["CONTINUOUS DYNAMICS", "MEASUREMENT", "DISCRETE OUTCOMES"]
    }[code] || ["Continuous dynamics", "Measurement", "Discrete outcomes"];
    const signature = `${VERSION}-${code}`;
    if (!visual || visual.dataset.pvlOverhaul === signature) return;

    visual.dataset.pvlOverhaul = signature;
    visual.classList.add("pvl-home-visual-v2");
    visual.removeAttribute("aria-hidden");
    visual.setAttribute("role", "img");
    visual.setAttribute("aria-label", labels.join(" → "));
    visual.innerHTML = `
      <div class="pvl-hero-system">
        <section class="pvl-system-column">
          <div class="pvl-system-label">${esc(labels[0])}</div>
          <div class="pvl-field-stage">
            <div class="pvl-field-axis-x"></div>
            <div class="pvl-field-axis-y"></div>
            <div class="pvl-field-orbit"></div>
            <div class="pvl-moment-vector"></div>
          </div>
          <div class="pvl-system-equation">dμ/dt = γ μ × B</div>
        </section>
        <section class="pvl-system-column pvl-measurement-column">
          <div class="pvl-system-label">${esc(labels[1])}</div>
          <div class="pvl-measurement-gate">
            <div class="pvl-measurement-slit"></div>
            <div class="pvl-wave-packet"></div>
          </div>
        </section>
        <section class="pvl-system-column">
          <div class="pvl-system-label">${esc(labels[2])}</div>
          <div class="pvl-channel-stage">
            <div class="pvl-channel plus"><span>+ℏ/2</span><i></i></div>
            <div class="pvl-channel minus"><span>−ℏ/2</span><i></i></div>
          </div>
          <div class="pvl-channel-probability"><span>P₊ = |⟨+|ψ⟩|²</span><span>P₋ = |⟨−|ψ⟩|²</span></div>
        </section>
      </div>`;
  }

  function springPath(endX, y = 210, startX = 55, coils = 8, amplitude = 18) {
    const lead = 22;
    const tail = 10;
    const usableEnd = Math.max(startX + 72, endX - tail);
    const zigStart = startX + lead;
    const zigWidth = Math.max(34, usableEnd - zigStart);
    const step = zigWidth / (coils * 2);
    const parts = [`M${startX} ${y}`, `L${zigStart} ${y}`];
    for (let i = 1; i < coils * 2; i += 1) {
      const x = zigStart + step * i;
      const yy = y + (i % 2 ? -amplitude : amplitude);
      parts.push(`L${x.toFixed(2)} ${yy}`);
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
    const amplitude = Math.max(0, (xMax - xMin) / 2);
    const duration = animateX.getAttribute("dur") || "2s";
    const massWidth = Number(massRect.getAttribute("width")) || 105;
    const massY = Number(massRect.getAttribute("y")) || 165;
    const massHeight = Number(massRect.getAttribute("height")) || 90;

    animateX.remove();
    massRect.setAttribute("x", String(xCenter));

    const existingTransform = massGroup.querySelector('animateTransform[data-pvl-spring-motion]');
    if (!existingTransform) {
      const animateTransform = document.createElementNS(SVG_NS, "animateTransform");
      animateTransform.setAttribute("data-pvl-spring-motion", "true");
      animateTransform.setAttribute("attributeName", "transform");
      animateTransform.setAttribute("type", "translate");
      animateTransform.setAttribute("values", `${-amplitude} 0;${amplitude} 0;${-amplitude} 0`);
      animateTransform.setAttribute("dur", duration);
      animateTransform.setAttribute("repeatCount", "indefinite");
      massGroup.insertBefore(animateTransform, massGroup.firstChild);
    }

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

    // Ensure the label follows the moving mass even if the original x is rounded.
    const label = massGroup.querySelector(".oscillator-mass-label");
    if (label) {
      label.setAttribute("x", String(xCenter + massWidth / 2));
      label.setAttribute("y", String(massY + massHeight / 2 + 7));
    }

    svg.dataset.pvlSpringFix = VERSION;
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
    const nodeIds = new Set((state.nodes || []).map(n => String(n.id)));
    return (state.components || []).filter(component => {
      const a = String(component.nodes?.[0] ?? "");
      const b = String(component.nodes?.[1] ?? "");
      return a && b && a !== b && nodeIds.has(a) && nodeIds.has(b);
    });
  }

  function buildCircuitLayout(state) {
    const nodes = (state.nodes || []).map(n => ({...n, id: String(n.id)}));
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const edges = primaryEdges(state);
    const groundId = nodeMap.has("0") ? "0" : nodes.find(n => /gnd|ground|地/i.test(`${n.id} ${n.label}`))?.id;
    const source = (state.components || []).find(c => ["vdc", "vsin", "idc", "isin"].includes(c.type));
    const sourceId = String(source?.nodes?.[0] ?? nodes.find(n => n.id !== groundId)?.id ?? "");
    const probeId = String(state.analysis?.probe ?? "");

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
        const nextRank = (rank.get(current) || 0) + 1;
        for (const next of adjacency.get(current) || []) {
          if (next === groundId) continue;
          if (!rank.has(next)) {
            rank.set(next, nextRank);
            queue.push(next);
          }
        }
      }
    }

    let fallbackRank = Math.max(0, ...rank.values()) + 1;
    nodes.forEach(node => {
      if (node.id !== groundId && !rank.has(node.id)) rank.set(node.id, fallbackRank++);
    });

    if (probeId && rank.has(probeId)) {
      const maxRank = Math.max(0, ...rank.values());
      rank.set(probeId, maxRank + 1);
    }

    const groups = new Map();
    nodes.filter(n => n.id !== groundId).forEach(node => {
      const r = rank.get(node.id) || 0;
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(node);
    });

    const ranks = [...groups.keys()].sort((a, b) => a - b);
    const rankIndex = new Map(ranks.map((value, index) => [value, index]));
    const positions = new Map();
    const left = 92;
    const right = 650;
    const top = 80;
    const bottom = 340;
    const available = Math.max(1, ranks.length - 1);

    ranks.forEach(r => {
      const items = groups.get(r);
      items.sort((a, b) => {
        const aOut = a.id === probeId ? 1 : 0;
        const bOut = b.id === probeId ? 1 : 0;
        if (aOut !== bOut) return bOut - aOut;
        return String(a.label).localeCompare(String(b.label));
      });
      const x = left + (right - left) * (rankIndex.get(r) / available);
      items.forEach((node, index) => {
        const y = items.length === 1 ? 205 : top + (bottom - top) * ((index + 0.5) / items.length);
        positions.set(node.id, {x, y});
      });
    });

    if (sourceId && positions.has(sourceId)) positions.set(sourceId, {x: 110, y: 112});
    if (groundId) positions.set(groundId, {x: 110, y: 350});
    if (probeId && positions.has(probeId)) positions.set(probeId, {x: 630, y: 205});

    // Gentle collision relaxation for labels and dense ranks.
    for (let iteration = 0; iteration < 24; iteration += 1) {
      const list = [...positions.entries()].filter(([id]) => id !== groundId && id !== sourceId && id !== probeId);
      for (let i = 0; i < list.length; i += 1) {
        for (let j = i + 1; j < list.length; j += 1) {
          const [idA, a] = list[i];
          const [idB, b] = list[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const minDist = 92;
          if (dist < minDist) {
            const push = (minDist - dist) * 0.12;
            const nx = dx / dist;
            const ny = dy / dist;
            positions.set(idA, {x: clamp(a.x - nx * push, 70, 670), y: clamp(a.y - ny * push, 60, 370)});
            positions.set(idB, {x: clamp(b.x + nx * push, 70, 670), y: clamp(b.y + ny * push, 60, 370)});
          }
        }
      }
    }

    return {nodes, nodeMap, edges, positions, groundId, sourceId, probeId};
  }

  function quadraticPoint(a, c, b, t) {
    const s = 1 - t;
    return {
      x: s * s * a.x + 2 * s * t * c.x + t * t * b.x,
      y: s * s * a.y + 2 * s * t * c.y + t * t * b.y
    };
  }

  function symbolBody(type) {
    if (type === "resistor") return `<path class="pvl-symbol-core" d="M-30 0h7l5-10 10 20 10-20 10 20 10-20 5 10h3"/>`;
    if (type === "capacitor") return `<path class="pvl-symbol-core" d="M-30 0h20M-10-14v28M10-14v28M10 0h20"/>`;
    if (type === "inductor") return `<path class="pvl-symbol-core" d="M-30 0h5c0-15 13-15 13 0 0-15 13-15 13 0 0-15 13-15 13 0 0-15 13-15 13 0h4"/>`;
    if (type === "wire") return `<path class="pvl-symbol-core" d="M-31 0h62"/>`;
    if (type === "switch") return `<path class="pvl-symbol-core" d="M-30 0h13M-14 0l29-15M17 0h13"/><circle class="pvl-symbol-core" cx="-15" cy="0" r="2.5"/><circle class="pvl-symbol-core" cx="16" cy="0" r="2.5"/>`;
    if (["vdc", "vsin", "idc", "isin"].includes(type)) {
      const glyph = type === "vsin" || type === "isin" ? "∿" : type === "idc" ? "→" : "±";
      return `<path class="pvl-symbol-core" d="M-30 0h10M20 0h10"/><circle class="pvl-symbol-core" r="20"/><text class="pvl-symbol-text" y="4" text-anchor="middle">${glyph}</text>`;
    }
    if (type === "voltmeter" || type === "ammeter") {
      return `<path class="pvl-symbol-core" d="M-30 0h10M20 0h10"/><circle class="pvl-symbol-core" r="20"/><text class="pvl-symbol-text" y="4" text-anchor="middle">${type === "voltmeter" ? "V" : "A"}</text>`;
    }
    if (type === "diode" || type === "led") return `<path class="pvl-symbol-core" d="M-30 0h13M-17-12L5 0-17 12ZM6-14v28M6 0h24"/>`;
    if (type === "lamp") return `<path class="pvl-symbol-core" d="M-30 0h10M20 0h10"/><circle class="pvl-symbol-core" r="20"/><path class="pvl-symbol-core" d="M-10-10 10 10M10-10-10 10"/>`;
    if (type === "fuse") return `<path class="pvl-symbol-core" d="M-30 0h10M20 0h10"/><rect class="pvl-symbol-core" x="-20" y="-9" width="40" height="18" rx="4"/>`;
    if (type === "opamp") return `<path class="pvl-symbol-core" d="M-28-22v44L20 0ZM20 0h10"/><text class="pvl-symbol-text" x="-18" y="-7" text-anchor="middle">+</text><text class="pvl-symbol-text" x="-18" y="14" text-anchor="middle">−</text>`;
    if (type === "vcvs") return `<path class="pvl-symbol-core" d="M-30 0h10M20 0h10M0-22 20 0 0 22-20 0Z"/><text class="pvl-symbol-text" y="4" text-anchor="middle">±</text>`;
    if (type === "vccs") return `<path class="pvl-symbol-core" d="M-30 0h10M20 0h10M0-22 20 0 0 22-20 0Z M0 11V-10M-6-4 0-11 6-4"/>`;
    if (type === "npn") return `<path class="pvl-symbol-core" d="M-30 0h16M-14-18v36M-14-8 13-20M-14 8 13 20M5 12 13 20 3 21"/>`;
    if (type === "nmos") return `<path class="pvl-symbol-core" d="M-30 0h12M-14-18v36M-5-18v36M-5-13h20M-5 13h20M15-13v26"/>`;
    return `<path class="pvl-symbol-core" d="M-30 0h8M22 0h8"/><rect class="pvl-symbol-core" x="-22" y="-14" width="44" height="28" rx="5"/>`;
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
    const parallelGroups = new Map();
    layout.edges.forEach(edge => {
      const a = String(edge.nodes[0]);
      const b = String(edge.nodes[1]);
      const key = [a, b].sort().join("::");
      if (!parallelGroups.has(key)) parallelGroups.set(key, []);
      parallelGroups.get(key).push(edge);
    });

    const edgeMarkup = layout.edges.map(edge => {
      const aId = String(edge.nodes[0]);
      const bId = String(edge.nodes[1]);
      const a = layout.positions.get(aId);
      const b = layout.positions.get(bId);
      if (!a || !b) return "";
      const groupKey = [aId, bId].sort().join("::");
      const siblings = parallelGroups.get(groupKey) || [edge];
      const index = siblings.findIndex(item => item.id === edge.id);
      const offset = (index - (siblings.length - 1) / 2) * 52;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.hypot(dx, dy) || 1;
      const nx = -dy / length;
      const ny = dx / length;
      const control = {x: (a.x + b.x) / 2 + nx * offset, y: (a.y + b.y) / 2 + ny * offset};
      const mid = quadraticPoint(a, control, b, 0.5);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const selected = state.selected === edge.id || state.selected === edge.name;
      const label = edge.name || edge.id;
      const value = edge.value ?? "";
      const controls = (edge.nodes || []).slice(2).map((nodeId, controlIndex) => {
        const sourcePoint = layout.positions.get(String(nodeId));
        if (!sourcePoint) return "";
        const bendY = mid.y + (controlIndex % 2 ? 34 : -34);
        return `<path class="pvl-circuit-control-wire" d="M${sourcePoint.x} ${sourcePoint.y} Q${(sourcePoint.x + mid.x) / 2} ${bendY} ${mid.x} ${mid.y}"/>`;
      }).join("");
      return `${controls}
        <path class="pvl-circuit-wire" d="M${a.x} ${a.y} Q${control.x} ${control.y} ${b.x} ${b.y}"/>
        <g class="pvl-circuit-symbol${selected ? " is-selected" : ""}" data-pvl-circuit-select="${esc(edge.id)}" transform="translate(${mid.x} ${mid.y}) rotate(${angle})">
          <rect class="pvl-symbol-mask" x="-38" y="-25" width="76" height="50" rx="8"/>
          ${symbolBody(edge.type)}
          <g transform="rotate(${-angle})">
            <text class="pvl-symbol-text" y="-30" text-anchor="middle">${esc(label)}</text>
            <text class="pvl-symbol-value" y="36" text-anchor="middle">${esc(value)}</text>
          </g>
        </g>`;
    }).join("");

    const nodeMarkup = layout.nodes.map(node => {
      const p = layout.positions.get(node.id);
      if (!p) return "";
      const isGround = node.id === layout.groundId;
      return `<g class="pvl-circuit-node${isGround ? " is-ground" : ""}" transform="translate(${p.x} ${p.y})">
        <circle r="7"/>
        <text y="-15" text-anchor="middle">${esc(node.label || node.id)}</text>
        ${isGround ? `<path class="pvl-symbol-core" d="M0 7v10M-14 17h28M-9 23h18M-4 29h8"/>` : ""}
      </g>`;
    }).join("");

    applyingCircuit = true;
    wrap.dataset.pvlCircuitSignature = signature;
    wrap.innerHTML = state.components?.length ? `
      <svg class="pvl-circuit-schematic" viewBox="0 0 720 430" role="img" aria-label="Circuit schematic">
        <text class="pvl-circuit-meta" x="24" y="26">TOPOLOGY-AWARE SCHEMATIC · ${layout.nodes.length} NODES · ${state.components.length} COMPONENTS</text>
        ${edgeMarkup}
        ${nodeMarkup}
      </svg>` : `<div class="pvl-circuit-empty">${esc(workbench.__test?.TEXT?.[languageCode()]?.emptyCircuit || "Choose a reference experiment or add components.")}</div>`;

    wrap.querySelectorAll("[data-pvl-circuit-select]").forEach(element => {
      element.addEventListener("click", () => {
        const id = element.getAttribute("data-pvl-circuit-select");
        const original = [...document.querySelectorAll('[data-cw-select]')].find(item => item.getAttribute("data-cw-select") === id && !wrap.contains(item));
        original?.click();
      });
    });
    applyingCircuit = false;
  }

  function guideCopy() {
    const code = languageCode();
    const text = window.PVLCircuitWorkbench?.__test?.TEXT?.[code] || window.PVLCircuitWorkbench?.__test?.TEXT?.en || {};
    const copies = {
      zh: {
        kicker: "WORKBENCH MANUAL",
        title: "电路实验台使用说明",
        intro: "自由拓扑很强，但不该让第一次使用的人迷路。按下面顺序操作，能把布局问题、接线问题和求解问题分开排查。",
        start: "30 秒快速开始",
        steps: [
          `从“${text.presets || "标准实验模板"}”选择一个简单电路。`,
          `确认存在 ${text.ground || "参考地"} 节点。`,
          `先运行 ${text.operatingPoint || "DC 工作点"}，再做 AC 或瞬态。`,
          "每次只改一个参数，观察结果后再继续。"
        ],
        rules: "连接规则",
        rulesList: [
          "同名节点在电气上相连；画得近不代表已经导通。",
          "电压表并联，电流表串联。",
          "理想电压源、理想导线和短路环混用时，可能造成矩阵奇异。",
          "图中的曲线只负责避让；真正连接关系以节点名称为准。"
        ],
        troubleshoot: "出问题先看这里",
        troubleList: [
          text.noGround || "缺少参考地。",
          text.floatingWarning || "可能存在悬空子电路。",
          text.conflictWarning || "理想源回路可能冲突。",
          text.nonlinearFailed || "非线性工作点没有收敛。"
        ],
        callout: "建议学习顺序：分压器 → RC → RLC → 惠斯通电桥 → 二极管 → 运放。"
      },
      en: {
        kicker: "WORKBENCH MANUAL",
        title: "Circuit workbench guide",
        intro: "Arbitrary topology is powerful, but first-time use should still be guided. Follow this order to separate layout, wiring, and solver problems.",
        start: "30-second start",
        steps: [
          `Begin with a ${text.presets || "reference experiment"}.`,
          `Confirm that a ${text.ground || "ground"} node exists.`,
          `Run ${text.operatingPoint || "DC operating point"} before AC or transient analysis.`,
          "Change one parameter at a time and inspect the result."
        ],
        rules: "Connection rules",
        rulesList: [
          "Equal node names are electrically connected; nearby drawings are not automatically connected.",
          "Voltmeters go in parallel; ammeters go in series.",
          "Ideal-source and ideal-wire loops may produce a singular matrix.",
          "Curved routes are visual spacing only; node names define the circuit."
        ],
        troubleshoot: "Troubleshooting",
        troubleList: [
          text.noGround || "Ground is missing.",
          text.floatingWarning || "Possible floating subcircuit.",
          text.conflictWarning || "Conflicting ideal-source loop.",
          text.nonlinearFailed || "Nonlinear operating point did not converge."
        ],
        callout: "Recommended path: divider → RC → RLC → Wheatstone bridge → diode → op-amp."
      }
    };
    return copies[code] || {
      kicker: "WORKBENCH MANUAL",
      title: text.workbench || "Circuit workbench guide",
      intro: text.editHint || "Use named nodes to build and analyze a circuit.",
      start: text.presets || "Reference experiments",
      steps: [text.presets, text.ground, text.operatingPoint, text.run].filter(Boolean),
      rules: text.topology || "Topology",
      rulesList: [text.seriesParallel, text.unitHelp, text.dcNote, text.acNote].filter(Boolean),
      troubleshoot: text.warnings || "Diagnostics",
      troubleList: [text.noGround, text.floatingWarning, text.conflictWarning, text.nonlinearFailed].filter(Boolean),
      callout: text.limits || "Educational compact models are idealized."
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

    const guideSignature = `${languageCode()}-${JSON.stringify(copy)}`;
    if (shell.dataset.pvlGuideSignature !== guideSignature) {
      shell.dataset.pvlGuideSignature = guideSignature;
      shell.innerHTML = `
        <div class="pvl-circuit-guide-backdrop" data-pvl-guide-close></div>
        <aside class="pvl-circuit-guide" role="dialog" aria-modal="true" aria-label="${esc(copy.title)}">
          <header class="pvl-guide-head">
            <div><small>${esc(copy.kicker)}</small><h2>${esc(copy.title)}</h2></div>
            <button class="pvl-guide-close" type="button" data-pvl-guide-close aria-label="Close">×</button>
          </header>
          <section class="pvl-guide-section"><p>${esc(copy.intro)}</p></section>
          <section class="pvl-guide-section"><h3>${esc(copy.start)}</h3><ol>${copy.steps.map(step => `<li>${esc(step)}</li>`).join("")}</ol></section>
          <section class="pvl-guide-section"><h3>${esc(copy.rules)}</h3><ul>${copy.rulesList.map(step => `<li>${esc(step)}</li>`).join("")}</ul></section>
          <section class="pvl-guide-section"><h3>${esc(copy.troubleshoot)}</h3><ul>${copy.troubleList.map(step => `<li>${esc(step)}</li>`).join("")}</ul><div class="pvl-guide-callout">${esc(copy.callout)}</div></section>
        </aside>`;
      shell.querySelectorAll("[data-pvl-guide-close]").forEach(element => {
        element.addEventListener("click", () => shell.classList.remove("is-open"));
      });
    }

    let button = toolbar.querySelector(".pvl-circuit-guide-button");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "pvl-circuit-guide-button";
      button.addEventListener("click", () => shell.classList.add("is-open"));
      (toolbar.lastElementChild || toolbar).appendChild(button);
    }
    button.textContent = languageCode() === "zh" ? "使用说明" : languageCode() === "ja" ? "使い方" : languageCode() === "ko" ? "사용 안내" : "Guide";
  }

  function normalizeFormulaAccessibility() {
    document.querySelectorAll(".math-frac, .fraction").forEach(frac => {
      if (frac.dataset.pvlMath === VERSION) return;
      frac.dataset.pvlMath = VERSION;
      const parts = frac.querySelectorAll(":scope > span");
      if (parts.length >= 2 && !frac.getAttribute("aria-label")) {
        frac.setAttribute("aria-label", `${parts[0].textContent} divided by ${parts[1].textContent}`);
      }
    });
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
    renderCircuitSchematic();
    ensureCircuitGuide();
    normalizeFormulaAccessibility();
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
    setTimeout(schedulePass, 500);
    setTimeout(schedulePass, 1600);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once: true});
  else start();
})();
