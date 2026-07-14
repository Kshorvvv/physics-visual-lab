/* Stern–Gerlach simulations · Physics Visual Lab v4.2.0 */
(() => {
  "use strict";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const radians = degrees => degrees * Math.PI / 180;
  const probabilityPlus = (stateAngle, analyzerAngle) => Math.cos(radians(stateAngle - analyzerAngle) / 2) ** 2;
  const mathFraction = (numerator, denominator, extraClass = "") => `<span class='math-frac${extraClass ? ` ${extraClass}` : ""}'><span>${numerator}</span><span>${denominator}</span></span>`;
  const hash = value => {
    const x = Math.sin(value * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  let language = "zh";
  let mode = "split";
  let frame = 0;
  let canvas;
  let context;
  let root;
  let directoryRoot;
  let bootObserver = null;

  const state = {
    split: { source: "unpolarized", analyzer: 0, gradient: 1.5, flux: 60, classical: false },
    sequence: { middle: 90, branch: 1, final: 0 }
  };

  const sourceAngles = { z: 0, x: 90, minusZ: 180 };
  const SUPPORTED_LANGUAGES = ["zh", "en", "ko", "uz", "ru", "my", "shn", "th", "ja"];
  const SG_CANVAS_COPY = {
    silverOven:{zh:"银原子炉",en:"SILVER OVEN",ko:"은 원자 오븐",uz:"KUMUSH ATOM PECHI",ru:"ПЕЧЬ С СЕРЕБРОМ",my:"ငွေအက်တမ် မီးဖို",shn:"SILVER OVEN",th:"เตาอะตอมเงิน",ja:"銀原子炉"},
    collimator:{zh:"准直狭缝",en:"COLLIMATOR",ko:"콜리메이터",uz:"KOLLIMATOR",ru:"КОЛЛИМАТОР",my:"ကော်လီမေတာ",shn:"COLLIMATOR",th:"คอลลิเมเตอร์",ja:"コリメータ"},
    detector:{zh:"探测屏",en:"DETECTOR",ko:"검출기",uz:"DETEKTOR",ru:"ДЕТЕКТОР",my:"ထောက်လှမ်းမျက်နှာပြင်",shn:"DETECTOR",th:"ฉากตรวจจับ",ja:"検出器"},
    classicalContinuum:{zh:"经典连续预测",en:"CLASSICAL CONTINUUM",ko:"고전적 연속 예측",uz:"KLASSIK UZLUKSIZ TAQSIMOT",ru:"КЛАССИЧЕСКИЙ КОНТИНУУМ",my:"ဂန္ထဝင် ဆက်တိုက်ခန့်မှန်းချက်",shn:"CLASSICAL CONTINUUM",th:"การทำนายแบบต่อเนื่องคลาสสิก",ja:"古典的連続分布"},
    unpolarized:{zh:"未偏振束",en:"UNPOLARIZED",ko:"무편극 빔",uz:"QUTBLANMAGAN",ru:"НЕПОЛЯРИЗОВАННЫЙ ПУЧОК",my:"မပိုလာရိုက်ဇ် လှိုင်းတန်း",shn:"UNPOLARIZED",th:"ลำอะตอมไม่โพลาไรซ์",ja:"無偏極ビーム"},
    prepare:{zh:"制备 +z",en:"PREPARE +z",ko:"+z 준비",uz:"+z HOLATNI TAYYORLASH",ru:"ПОДГОТОВКА +z",my:"+z အခြေအနေ ပြင်ဆင်",shn:"PREPARE +z",th:"เตรียมสถานะ +z",ja:"+zを準備"},
    select:{zh:"选择支路",en:"SELECT BRANCH",ko:"경로 선택",uz:"TARMOQNI TANLASH",ru:"ВЫБОР ВЕТВИ",my:"လမ်းကြောင်း ရွေး",shn:"SELECT BRANCH",th:"เลือกแขนง",ja:"分岐を選択"},
    measure:{zh:"测量 β",en:"MEASURE β",ko:"β 측정",uz:"β NI O‘LCHASH",ru:"ИЗМЕРЕНИЕ β",my:"β ကို တိုင်းတာ",shn:"MEASURE β",th:"วัด β",ja:"βを測定"}
  };
  Object.assign(SG_CANVAS_COPY.silverOven,{shn:"မေႃႈ silver atom"});
  Object.assign(SG_CANVAS_COPY.collimator,{shn:"ၶိူင်ႈၸတ်း beam"});
  Object.assign(SG_CANVAS_COPY.detector,{shn:"ၶိူင်ႈတႅၵ်ႈ"});
  Object.assign(SG_CANVAS_COPY.classicalContinuum,{shn:"ၵၢၼ်ၽႄ classical သိုပ်ႇၵၼ်"});
  Object.assign(SG_CANVAS_COPY.unpolarized,{shn:"beam ဢမ်ႇ polarized"});
  Object.assign(SG_CANVAS_COPY.prepare,{shn:"တင်ႈ +z"});
  Object.assign(SG_CANVAS_COPY.select,{shn:"လိူၵ်ႈ branch"});
  Object.assign(SG_CANVAS_COPY.measure,{shn:"တႅၵ်ႈ β"});
  const canvasText = key => SG_CANVAS_COPY[key]?.[language] || SG_CANVAS_COPY[key]?.en || key;

  function markup() {
    return `
      <section class="sg-lab" id="stern-gerlach" aria-labelledby="sg-lab-title">
        <div class="sg-section-head">
          <div class="sg-section-copy">
            <span class="sg-section-label">QUANTUM MEASUREMENT · 02–03</span>
            <h2 id="sg-lab-title" data-zh="Stern–Gerlach 实验室" data-en="Stern–Gerlach Laboratory">Stern–Gerlach 实验室</h2>
            <p data-zh="从一束银原子到离散的两条轨迹，再到串联分析器：把“自旋测量”从一句结论拆成可以操作、预测和检验的过程。" data-en="Follow a beam of silver atoms from discrete splitting to sequential analyzers, turning spin measurement into a process you can operate, predict, and test.">从一束银原子到离散的两条轨迹，再到串联分析器：把“自旋测量”从一句结论拆成可以操作、预测和检验的过程。</p>
          </div>
          <div class="sg-mode-tabs" role="tablist" data-aria-zh="实验模式" data-aria-en="Experiment modes" aria-label="实验模式">
            <button type="button" class="active" role="tab" aria-selected="true" data-sg-mode="split"><span>02</span><b data-zh="基础分束" data-en="Beam splitting">基础分束</b></button>
            <button type="button" role="tab" aria-selected="false" data-sg-mode="sequence"><span>03</span><b data-zh="串联测量" data-en="Sequential measurement">串联测量</b></button>
          </div>
        </div>

        <div class="sg-workbench">
          <div class="sg-visual-panel">
            <div class="sg-canvas-grid" aria-hidden="true"></div>
            <canvas class="sg-canvas" data-aria-zh="Stern–Gerlach 实验动画" data-aria-en="Stern–Gerlach experiment animation" aria-label="Stern–Gerlach 实验动画"></canvas>
            <div class="sg-visual-hud" aria-live="polite">
              <strong id="sg-hud-mode">QUANTUM SPLITTING</strong>
              <span id="sg-hud-line-one">P(+α) = 0.500</span>
              <span id="sg-hud-line-two">P(−α) = 0.500</span>
            </div>
            <div class="sg-legend">
              <span data-zh="亮度表示到达概率" data-en="Brightness represents arrival probability">亮度表示到达概率</span>
              <span data-zh="粒子动画采用教学时间标度" data-en="Particle motion uses a teaching time scale">粒子动画采用教学时间标度</span>
            </div>
          </div>

          <aside class="sg-control-panel">
            <div class="sg-panel" data-sg-panel="split">
              <div class="sg-control-title"><small>EXPERIMENT 02</small><h3 data-zh="基础分束控制" data-en="Beam-Splitting Controls">基础分束控制</h3></div>
              <fieldset class="sg-fieldset">
                <legend data-zh="入射自旋态" data-en="Incident spin state">入射自旋态</legend>
                <div class="sg-chip-grid" role="group" data-aria-zh="入射自旋态" data-aria-en="Incident spin state" aria-label="入射自旋态">
                  <button type="button" class="active" data-source="unpolarized" data-zh="未偏振" data-en="Unpolarized">未偏振</button>
                  <button type="button" data-source="z">+z</button>
                  <button type="button" data-source="x">+x</button>
                  <button type="button" data-source="minusZ">−z</button>
                </div>
              </fieldset>
              <div class="sg-range">
                <div class="sg-range-head"><label for="sg-analyzer" data-zh="分析器方向 α" data-en="Analyzer direction α">分析器方向 α</label><output id="sg-analyzer-output">0°</output></div>
                <input id="sg-analyzer" type="range" min="0" max="180" step="1" value="0" data-state="analyzer">
              </div>
              <div class="sg-range">
                <div class="sg-range-head"><label for="sg-gradient" data-zh="磁场梯度 ∂ₙB" data-en="Field gradient ∂ₙB">磁场梯度 ∂ₙB</label><output id="sg-gradient-output">1.50×</output></div>
                <input id="sg-gradient" type="range" min="0.5" max="2.5" step="0.05" value="1.5" data-state="gradient">
              </div>
              <div class="sg-range">
                <div class="sg-range-head"><label for="sg-flux" data-zh="原子流强度" data-en="Atomic-beam flux">原子流强度</label><output id="sg-flux-output">60 s⁻¹</output></div>
                <input id="sg-flux" type="range" min="20" max="120" step="5" value="60" data-state="flux">
              </div>
              <div class="sg-toggle-row"><span data-zh="叠加经典连续分布" data-en="Overlay the classical continuum">叠加经典连续分布</span><button type="button" class="sg-toggle" role="switch" aria-checked="false" data-toggle-classical data-aria-zh="经典连续分布" data-aria-en="Classical continuum" aria-label="经典连续分布"></button></div>
              <div class="sg-result-grid">
                <div class="sg-result-card plus"><span data-zh="上支路 +α" data-en="Upper branch +α">上支路 +α</span><strong id="sg-plus-result">50.0% · 30 s⁻¹</strong></div>
                <div class="sg-result-card minus"><span data-zh="下支路 −α" data-en="Lower branch −α">下支路 −α</span><strong id="sg-minus-result">50.0% · 30 s⁻¹</strong></div>
              </div>
              <p class="sg-formula-note">P(+α) = cos²(${mathFraction("θ − α","2","compact")})</p>
            </div>

            <div class="sg-panel" data-sg-panel="sequence" hidden>
              <div class="sg-control-title"><small>EXPERIMENT 03</small><h3 data-zh="串联分析器控制" data-en="Sequential-Analyzer Controls">串联分析器控制</h3></div>
              <div class="sg-preset-grid">
                <button type="button" data-preset="zz">z → z</button>
                <button type="button" data-preset="zxz">z → x(+) → z</button>
                <button type="button" data-preset="z45x">z → 45°(+) → x</button>
                <button type="button" data-preset="zminusxz">z → x(−) → z</button>
              </div>
              <div class="sg-range">
                <div class="sg-range-head"><label for="sg-middle" data-zh="中间分析器方向 α" data-en="Middle-analyzer axis α">中间分析器方向 α</label><output id="sg-middle-output">90°</output></div>
                <input id="sg-middle" type="range" min="0" max="180" step="1" value="90" data-state="middle">
              </div>
              <div class="sg-branch-row"><span data-zh="保留中间支路" data-en="Keep middle branch">保留中间支路</span><div class="sg-branch-buttons" role="group" data-aria-zh="保留支路" data-aria-en="Selected branch" aria-label="保留支路"><button type="button" class="active" data-branch="1">+α</button><button type="button" data-branch="-1">−α</button></div></div>
              <div class="sg-range">
                <div class="sg-range-head"><label for="sg-final" data-zh="末端分析器方向 β" data-en="Final-analyzer axis β">末端分析器方向 β</label><output id="sg-final-output">0°</output></div>
                <input id="sg-final" type="range" min="0" max="180" step="1" value="0" data-state="final">
              </div>
              <div class="sg-sequence-readout">
                <div><span data-zh="第一台 SGz 制备 +z" data-en="First SGz prepares +z">第一台 SGz 制备 +z</span><strong data-zh="50.0 个（每 100 个入射）" data-en="50.0 of 100 incident">50.0 个（每 100 个入射）</strong></div>
                <div><span data-zh="通过所选中间支路" data-en="Through selected middle branch">通过所选中间支路</span><strong id="sg-middle-count">25.0 个（每 100 个入射）</strong></div>
                <div><span data-zh="末端探测器" data-en="Final detector">末端探测器</span><strong id="sg-final-count">+β 12.5 · −β 12.5</strong></div>
              </div>
              <p class="sg-formula-note" data-zh="选择一条支路，就是制备一个新的本征态。" data-en="Selecting one branch prepares a new eigenstate.">选择一条支路，就是制备一个新的本征态。</p>
            </div>
          </aside>
        </div>

        <div class="sg-concept-strip">
          <article class="sg-concept-card"><span>FIELD GRADIENT</span><strong data-zh="梯度决定分开多远" data-en="The gradient sets the separation">梯度决定分开多远</strong><p data-zh="改变 ∂ₙB 会改变受力与屏上间距，但不会把两个量子结果变成连续分布。" data-en="Changing ∂ₙB changes force and spot separation, but it never turns two quantum outcomes into a continuum.">改变 ∂ₙB 会改变受力与屏上间距，但不会把两个量子结果变成连续分布。</p></article>
          <article class="sg-concept-card"><span>MEASUREMENT AXIS</span><strong data-zh="方向决定概率" data-en="The axis sets the probabilities">方向决定概率</strong><p data-html-zh="对纯态，概率依赖半角公式 cos²(${mathFraction("θ−α","2","compact")})，这正是 Bloch 球几何的入口。" data-html-en="For a pure state, probabilities follow the half-angle rule cos²(${mathFraction("θ−α","2","compact")}), the geometric doorway to the Bloch sphere.">对纯态，概率依赖半角公式 cos²(${mathFraction("θ−α","2","compact")})，这正是 Bloch 球几何的入口。</p></article>
          <article class="sg-concept-card"><span>STATE PREPARATION</span><strong data-zh="测量也会制备状态" data-en="Measurement also prepares a state">测量也会制备状态</strong><p data-zh="挡掉一条支路并保留另一条，下一台分析器接收到的已不再是原来的入射态。" data-en="Blocking one branch and keeping the other means the next analyzer no longer receives the original incident state.">挡掉一条支路并保留另一条，下一台分析器接收到的已不再是原来的入射态。</p></article>
        </div>
      </section>`;
  }

  function directoryMarkup() {
    return `<section class="experiment-directory" id="experiments" aria-labelledby="directory-title">
      <div class="directory-head"><div class="directory-copy"><span class="directory-label">PHYSICS VISUAL LAB · COLLECTIONS</span><h2 id="directory-title" data-zh="专题实验目录" data-en="Experiment Collections">专题实验目录</h2><p data-zh="先进入一个完整物理问题，再沿着它拆出的子实验逐层推进。每个专题都有背景、装置、核心方程和明确的学习路线。" data-en="Begin with one complete physical problem, then move through the sub-labs extracted from it. Every collection includes context, apparatus, core equations, and a guided learning path.">先进入一个完整物理问题，再沿着它拆出的子实验逐层推进。每个专题都有背景、装置、核心方程和明确的学习路线。</p></div><div class="directory-stat"><div><strong>02</strong><span data-zh="开放专题" data-en="LIVE COLLECTION">开放专题</span></div><div><strong>15</strong><span data-zh="子实验" data-en="SUB-LABS">子实验</span></div></div></div>
      <div class="directory-toolbar collection-toolbar"><span data-zh="一级目录：选择专题" data-en="LEVEL 1 · CHOOSE A COLLECTION">一级目录：选择专题</span><span class="directory-path" data-zh="专题 → 子实验 → 导览与推导" data-en="COLLECTION → SUB-LAB → GUIDE & DERIVATION">专题 → 子实验 → 导览与推导</span></div>
      <div class="collection-directory-grid">
        <a class="directory-card collection-card collection-card-featured" data-category="electromagnetism quantum" href="#collection/stern-gerlach">
          <div class="directory-card-top"><span class="directory-code">COLLECTION 01 · QUANTUM FOUNDATIONS</span><span class="directory-status live" data-zh="已开放" data-en="AVAILABLE">已开放</span></div>
          <span class="directory-category">ELECTROMAGNETISM · QUANTUM</span>
          <h3 data-zh="Stern–Gerlach 专题实验" data-en="The Stern–Gerlach Collection">Stern–Gerlach 专题实验</h3>
          <p data-zh="从均匀磁场中的磁矩进动，到非均匀磁场中的空间分束，再到串联测量：系统理解自旋如何演化、被测量并重新制备。" data-en="Move from magnetic-moment precession in a uniform field to spatial splitting in a gradient and then sequential measurement—one systematic route through spin evolution, readout, and preparation.">从均匀磁场中的磁矩进动，到非均匀磁场中的空间分束，再到串联测量：系统理解自旋如何演化、被测量并重新制备。</p>
          <div class="collection-module-list"><span><b>01</b><i data-zh="拉莫尔进动" data-en="Larmor precession">拉莫尔进动</i></span><span><b>02</b><i data-zh="基础分束" data-en="Beam splitting">基础分束</i></span><span><b>03</b><i data-zh="串联测量" data-en="Sequential measurement">串联测量</i></span></div>
          <div class="directory-card-foot"><span data-zh="3 个子实验 · 约 30 分钟" data-en="3 sub-labs · about 30 min">3 个子实验 · 约 30 分钟</span><span data-zh="进入专题 ↗" data-en="Open collection ↗">进入专题 ↗</span></div>
        </a>
        <a class="directory-card collection-card collection-card-featured foundation-directory-card" data-category="mechanics electromagnetism waves" href="#collection/foundations">
          <div class="directory-card-top"><span class="directory-code">COLLECTION 02 · FOUNDATION PHYSICS</span><span class="directory-status live" data-fcopy="available">已开放</span></div>
          <span class="directory-category">MECHANICS · CIRCUITS · OPTICS</span>
          <h3 data-fcopy="foundationCollectionTitle">基础物理实验台</h3>
          <p data-fcopy="foundationCollectionSummary">从位移、速度和受力开始，继续到电荷的暂态响应与薄透镜成像；所有参数都可以由你改变，并即时核对预测。</p>
          <div class="collection-module-list foundation-module-list"><span><b>01–05</b><i data-fcopy="mechanicsDomain">力学与振动</i></span><span><b>07–09</b><i data-fcopy="electricityDomain">电路与电磁学</i></span><span><b>06 · 10–12</b><i data-fcopy="opticsDomain">波与光学</i></span><span><b>03 · 08</b><i data-fcopy="studio">自由工作台</i></span></div>
          <div class="directory-card-foot"><span data-fcopy="foundationCollectionFoot">16 个子实验 · 3 个开放工作台</span><span data-fcopy="openCollection">进入专题 ↗</span></div>
        </a>
        <article class="directory-card collection-card planned" data-category="quantum">
          <div class="directory-card-top"><span class="directory-code">COLLECTION 03 · QUANTUM CONTROL</span><span class="directory-status" data-zh="规划中" data-en="PLANNED">规划中</span></div><span class="directory-category">QUANTUM DYNAMICS</span><h3 data-zh="两能级系统与量子控制" data-en="Two-Level Systems & Quantum Control">两能级系统与量子控制</h3><p data-zh="用 Bloch 球、Rabi 振荡与 Ramsey 干涉，把态的几何、驱动和相位读出连成一条路线。" data-en="Connect state geometry, driven dynamics, and phase readout through the Bloch sphere, Rabi oscillations, and Ramsey interference.">用 Bloch 球、Rabi 振荡与 Ramsey 干涉，把态的几何、驱动和相位读出连成一条路线。</p><div class="directory-tags"><span>Bloch sphere</span><span>Rabi</span><span>Ramsey</span></div><div class="directory-card-foot"><span data-zh="未来专题" data-en="FUTURE COLLECTION">未来专题</span><span data-zh="开发路线" data-en="Roadmap">开发路线</span></div>
        </article>
        <article class="directory-card collection-card planned" data-category="waves">
          <div class="directory-card-top"><span class="directory-code">COLLECTION 04 · INTERFERENCE</span><span class="directory-status" data-zh="规划中" data-en="PLANNED">规划中</span></div><span class="directory-category">WAVES · QUANTUM</span><h3 data-zh="单粒子干涉与路径振幅" data-en="Single-Particle Interference & Path Amplitudes">单粒子干涉与路径振幅</h3><p data-zh="从逐粒子双缝累积出发，继续到 which-path 信息与量子擦除，观察概率振幅如何组合。" data-en="Start with single-particle double-slit buildup, then move to which-path information and quantum erasure to see how amplitudes combine.">从逐粒子双缝累积出发，继续到 which-path 信息与量子擦除，观察概率振幅如何组合。</p><div class="directory-tags"><span data-zh="双缝" data-en="Double slit">双缝</span><span>Which path</span><span data-zh="量子擦除" data-en="Quantum eraser">量子擦除</span></div><div class="directory-card-foot"><span data-zh="未来专题" data-en="FUTURE COLLECTION">未来专题</span><span data-zh="开发路线" data-en="Roadmap">开发路线</span></div>
        </article>
      </div>
    </section>`;
  }

  function applyLanguage(nextLanguage) {
    language = SUPPORTED_LANGUAGES.includes(nextLanguage) ? nextLanguage : "en";
    if (!root) return;
    [root, directoryRoot].filter(Boolean).forEach(scope => {
      scope.querySelectorAll("[data-zh][data-en]").forEach(element => {
        const value = language === "zh" ? element.dataset.zh : (element.dataset[language] || element.dataset.en);
        if (value != null && element.textContent !== value) element.textContent = value;
      });
      scope.querySelectorAll("[data-html-zh][data-html-en]").forEach(element => {
        const suffix = language[0].toUpperCase() + language.slice(1);
        const value = language === "zh" ? element.dataset.htmlZh : (element.dataset[`html${suffix}`] || element.dataset.htmlEn);
        if (value != null && element.innerHTML !== value) element.innerHTML = value;
      });
      scope.querySelectorAll("[data-aria-zh][data-aria-en]").forEach(element => {
        const suffix = language[0].toUpperCase() + language.slice(1);
        const value = language === "zh" ? element.dataset.ariaZh : (element.dataset[`aria${suffix}`] || element.dataset.ariaEn);
        if (value && element.getAttribute("aria-label") !== value) element.setAttribute("aria-label", value);
      });
    });
    updateReadouts();
  }

  function setRangeFill(input) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const value = Number(input.value);
    input.style.setProperty("--fill", `${(value - min) / (max - min) * 100}%`);
  }

  function splitProbabilities() {
    if (state.split.source === "unpolarized") return [0.5, 0.5];
    const plus = probabilityPlus(sourceAngles[state.split.source], state.split.analyzer);
    return [plus, 1 - plus];
  }

  function sequenceProbabilities() {
    const plusMiddle = probabilityPlus(0, state.sequence.middle);
    const selectedMiddle = state.sequence.branch === 1 ? plusMiddle : 1 - plusMiddle;
    const preparedAngle = state.sequence.branch === 1 ? state.sequence.middle : state.sequence.middle + 180;
    const plusFinal = probabilityPlus(preparedAngle, state.sequence.final);
    const transmitted = 0.5 * selectedMiddle;
    return { plusMiddle, selectedMiddle, plusFinal, transmitted, plusCount: 100 * transmitted * plusFinal, minusCount: 100 * transmitted * (1 - plusFinal) };
  }

  function updateReadouts() {
    const [plus, minus] = splitProbabilities();
    root.querySelector("#sg-analyzer-output").textContent = `${state.split.analyzer}°`;
    root.querySelector("#sg-gradient-output").textContent = `${state.split.gradient.toFixed(2)}×`;
    root.querySelector("#sg-flux-output").textContent = `${state.split.flux} s⁻¹`;
    root.querySelector("#sg-plus-result").textContent = `${(plus * 100).toFixed(1)}% · ${Math.round(plus * state.split.flux)} s⁻¹`;
    root.querySelector("#sg-minus-result").textContent = `${(minus * 100).toFixed(1)}% · ${Math.round(minus * state.split.flux)} s⁻¹`;

    const sequence = sequenceProbabilities();
    root.querySelector("#sg-middle-output").textContent = `${state.sequence.middle}°`;
    root.querySelector("#sg-final-output").textContent = `${state.sequence.final}°`;
    const middleCount = (sequence.transmitted * 100).toFixed(1);
    const countCopy={zh:`${middleCount} 个（每 100 个入射）`,ja:`入射100個中 ${middleCount}`,ko:`입사 100개 중 ${middleCount}`,ru:`${middleCount} из 100 падающих`,uz:`100 ta tushuvchidan ${middleCount}`,my:`ဝင်လာသည့် 100 ခုအနက် ${middleCount}`,th:`${middleCount} จากอนุภาคตกกระทบ 100`,shn:`ၼႂ်း 100 ဢၼ်ၶဝ်ႈ မီး ${middleCount}`,en:`${middleCount} of 100 incident`};
    root.querySelector("#sg-middle-count").textContent = countCopy[language] || countCopy.en;
    root.querySelector("#sg-final-count").textContent = `+β ${sequence.plusCount.toFixed(1)} · −β ${sequence.minusCount.toFixed(1)}`;

    const hudCopy={zh:["量子分束","串联分析"],en:["QUANTUM SPLITTING","SEQUENTIAL ANALYSIS"],ja:["量子ビーム分離","連続分析"],ko:["양자 빔 분리","연속 분석"],ru:["КВАНТОВОЕ РАСЩЕПЛЕНИЕ","ПОСЛЕДОВАТЕЛЬНЫЙ АНАЛИЗ"],uz:["KVANT AJRALISH","KETMA-KET TAHLIL"],my:["ကွမ်တမ် beam ခွဲမှု","အစဉ်လိုက် ခွဲခြမ်းမှု"],th:["การแยกลำควอนตัม","การวิเคราะห์ต่อเนื่อง"],shn:["ၵၢၼ်ၽႄ quantum","ၵၢၼ်ၼပ်ႉသိုပ်ႇၵၼ်"]}[language]||["QUANTUM SPLITTING","SEQUENTIAL ANALYSIS"];
    if (mode === "split") {
      root.querySelector("#sg-hud-mode").textContent = hudCopy[0];
      root.querySelector("#sg-hud-line-one").textContent = `P(+α) = ${plus.toFixed(3)}`;
      root.querySelector("#sg-hud-line-two").textContent = `P(−α) = ${minus.toFixed(3)}`;
    } else {
      root.querySelector("#sg-hud-mode").textContent = hudCopy[1];
      root.querySelector("#sg-hud-line-one").textContent = `T(selected) = ${(sequence.transmitted * 100).toFixed(1)}%`;
      root.querySelector("#sg-hud-line-two").textContent = `P(+β | selected) = ${sequence.plusFinal.toFixed(3)}`;
    }
  }

  function setMode(nextMode) {
    mode = nextMode === "sequence" ? "sequence" : "split";
    root.querySelectorAll("[data-sg-mode]").forEach(button => {
      const active = button.dataset.sgMode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    root.querySelectorAll("[data-sg-panel]").forEach(panel => { panel.hidden = panel.dataset.sgPanel !== mode; });
    updateReadouts();
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();ctx.moveTo(x + r, y);ctx.arcTo(x + width, y, x + width, y + height, r);ctx.arcTo(x + width, y + height, x, y + height, r);ctx.arcTo(x, y + height, x, y, r);ctx.arcTo(x, y, x + width, y, r);ctx.closePath();
  }

  function drawLabel(text, x, y, color = "#7991a3", size = 10, align = "center") {
    context.save();context.fillStyle = color;context.font = `500 ${size}px Inter, system-ui, sans-serif`;context.textAlign = align;context.fillText(text, x, y);context.restore();
  }

  function drawBeam(points, color, width, alpha = 1, dashed = false) {
    context.save();context.strokeStyle = color;context.globalAlpha = alpha;context.lineWidth = width;context.lineCap = "round";if (dashed) context.setLineDash([5, 7]);context.beginPath();points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));context.stroke();context.restore();
  }

  function drawBlocker(x, y) {
    context.save();context.strokeStyle = "#d95b67";context.lineWidth = 2;context.beginPath();context.moveTo(x - 6, y - 6);context.lineTo(x + 6, y + 6);context.moveTo(x + 6, y - 6);context.lineTo(x - 6, y + 6);context.stroke();context.restore();
  }

  function drawBackground(width, height) {
    context.clearRect(0, 0, width, height);
    const glow = context.createRadialGradient(width * 0.52, height * 0.5, 20, width * 0.52, height * 0.5, Math.max(width, height) * 0.7);
    glow.addColorStop(0, "rgba(22,108,150,.10)");glow.addColorStop(0.55, "rgba(8,27,47,.025)");glow.addColorStop(1, "rgba(3,8,16,0)");context.fillStyle = glow;context.fillRect(0, 0, width, height);
  }

  function drawSource(x, y) {
    context.save();roundedRect(context, x - 28, y - 36, 56, 72, 8);context.fillStyle = "#0b1d2c";context.fill();context.strokeStyle = "#31516a";context.stroke();context.fillStyle = "#f6b95b";context.shadowColor = "#f6b95b";context.shadowBlur = 14;context.beginPath();context.arc(x, y, 7, 0, Math.PI * 2);context.fill();context.restore();
  }

  function drawAnalyzer(x, y, label, angle = 0) {
    context.save();roundedRect(context, x - 39, y - 80, 78, 56, 8);context.fillStyle = "#0b2233";context.fill();context.strokeStyle = "#2b6685";context.stroke();roundedRect(context, x - 39, y + 24, 78, 56, 8);context.fillStyle = "#12202d";context.fill();context.stroke();context.strokeStyle = "#43d9ff";context.lineWidth = 1.4;const a = radians(angle);context.beginPath();context.moveTo(x - Math.sin(a) * 21, y + Math.cos(a) * 21);context.lineTo(x + Math.sin(a) * 21, y - Math.cos(a) * 21);context.stroke();context.fillStyle = "#43d9ff";context.beginPath();context.arc(x + Math.sin(a) * 21, y - Math.cos(a) * 21, 3, 0, Math.PI * 2);context.fill();context.restore();drawLabel(label, x, y + 103, "#7f98aa", 10);
  }

  function drawScreen(x, y, height) {
    context.save();roundedRect(context, x - 8, y - height / 2, 16, height, 6);context.fillStyle = "#b9e9ff14";context.fill();context.strokeStyle = "#5da9ce70";context.stroke();context.restore();
  }

  function particle(x, y, color, alpha = 1, radius = 2.2) {
    context.save();context.globalAlpha = alpha;context.fillStyle = color;context.shadowColor = color;context.shadowBlur = 8;context.beginPath();context.arc(x, y, radius, 0, Math.PI * 2);context.fill();context.restore();
  }

  function splitY(x, branch, positions, separation) {
    const { source, magnetStart, magnetEnd, screen, center } = positions;
    if (x <= magnetStart) return center;
    if (x <= magnetEnd) { const u = (x - magnetStart) / (magnetEnd - magnetStart); return center - branch * separation * 0.24 * u * u; }
    const u = (x - magnetEnd) / (screen - magnetEnd);return center - branch * separation * (0.24 + 0.76 * u);
  }

  function drawSplit(width, height, time) {
    const positions = { source: width * 0.09, slit: width * 0.22, magnetStart: width * 0.38, magnetEnd: width * 0.58, screen: width * 0.88, center: height * 0.52 };
    const separation = clamp(height * 0.105 * state.split.gradient, 34, height * 0.29);
    const [plus, minus] = splitProbabilities();
    drawSource(positions.source, positions.center);drawLabel(canvasText("silverOven"), positions.source, positions.center + 64);
    context.save();roundedRect(context, positions.slit - 10, positions.center - 66, 20, 132, 5);context.fillStyle = "#0a1b29";context.fill();context.strokeStyle = "#36546a";context.stroke();context.fillStyle = "#030812";context.fillRect(positions.slit - 11, positions.center - 4, 22, 8);context.restore();drawLabel(canvasText("collimator"), positions.slit, positions.center + 88);
    const analyzerX = (positions.magnetStart + positions.magnetEnd) / 2;drawAnalyzer(analyzerX, positions.center, `SGα · ${state.split.analyzer}°`, state.split.analyzer);
    drawScreen(positions.screen, positions.center, Math.min(height * 0.72, 390));drawLabel(canvasText("detector"), positions.screen, positions.center + Math.min(height * 0.39, 210));
    const path = branch => Array.from({ length: 42 }, (_, index) => { const x = positions.source + (positions.screen - positions.source) * index / 41;return { x, y: splitY(x, branch, positions, separation) }; });
    drawBeam(path(1), "#43d9ff", 0.8 + plus * 4.5, 0.06 + plus * 0.9);drawBeam(path(-1), "#f6b95b", 0.8 + minus * 4.5, 0.06 + minus * 0.9);
    if (state.split.classical) { const gradient = context.createLinearGradient(0, positions.center - separation * 1.18, 0, positions.center + separation * 1.18);gradient.addColorStop(0, "rgba(211,126,255,0)");gradient.addColorStop(.5, "rgba(211,126,255,.18)");gradient.addColorStop(1, "rgba(211,126,255,0)");context.fillStyle = gradient;context.fillRect(positions.screen - 19, positions.center - separation * 1.18, 10, separation * 2.36);drawLabel(canvasText("classicalContinuum"), positions.screen - 25, positions.center - separation * 1.26, "#c884ea", 8, "right"); }
    [[1, plus, "#43d9ff", "+α"],[-1, minus, "#f6b95b", "−α"]].forEach(([branch, probability, color, label]) => { const y = positions.center - branch * separation;const spot = context.createRadialGradient(positions.screen, y, 1, positions.screen, y, 25);spot.addColorStop(0, `${color}${Math.round((0.04 + probability * 0.96) * 255).toString(16).padStart(2,"0")}`);spot.addColorStop(1, `${color}00`);context.fillStyle = spot;context.beginPath();context.arc(positions.screen, y, 25, 0, Math.PI * 2);context.fill();drawLabel(`${label} · ${(probability * 100).toFixed(0)}%`, positions.screen - 18, y + 4, color, 9, "right"); });
    const particleCount = Math.round(state.split.flux / 3);
    const travel = time * 0.00011 * (0.55 + state.split.flux / 80);
    for (let index = 0; index < particleCount; index++) { const absolute = travel + index / particleCount;const cycle = Math.floor(absolute);const phase = absolute - cycle;const branch = hash(index + cycle * 97) < plus ? 1 : -1;const x = positions.source + phase * (positions.screen - positions.source);const y = splitY(x, branch, positions, separation);particle(x, y, branch === 1 ? "#83e7ff" : "#ffd18a", 0.45 + phase * 0.55, 1.7 + phase * 0.8); }
  }

  function interpolatePath(nodes, phase) {
    const segmentFloat = phase * (nodes.length - 1);const segment = Math.min(nodes.length - 2, Math.floor(segmentFloat));const u = segmentFloat - segment;const smooth = u * u * (3 - 2 * u);return { x: nodes[segment].x + (nodes[segment + 1].x - nodes[segment].x) * smooth, y: nodes[segment].y + (nodes[segment + 1].y - nodes[segment].y) * smooth };
  }

  function drawSequence(width, height, time) {
    const y = height * 0.52;const x0 = width * 0.06,x1 = width * 0.24,x2 = width * 0.49,x3 = width * 0.72,x4 = width * 0.91;const branch = state.sequence.branch;const sequence = sequenceProbabilities();const y1 = y - height * 0.075;const y1Blocked = y + height * 0.075;const y2 = y1 - branch * height * 0.095;const y2Blocked = y1 + branch * height * 0.095;const yPlus = y2 - height * 0.1;const yMinus = y2 + height * 0.1;
    drawSource(x0, y);drawLabel(canvasText("unpolarized"), x0, y + 63);
    drawAnalyzer(x1, y, "SGz", 0);drawAnalyzer(x2, y1, `SGα · ${state.sequence.middle}°`, state.sequence.middle);drawAnalyzer(x3, y2, `SGβ · ${state.sequence.final}°`, state.sequence.final);drawScreen(x4, y2, Math.min(height * .48, 300));
    drawBeam([{x:x0+28,y},{x:x1-40,y}],"#9eb7c7",2,0.65);drawBeam([{x:x1+39,y:y-10},{x:x1+82,y:y1},{x:x2-40,y:y1}],"#43d9ff",3.4,0.9);drawBeam([{x:x1+39,y:y+10},{x:x1+82,y:y1Blocked}],"#f6b95b",1.2,0.28,true);drawBlocker(x1+91,y1Blocked);
    drawBeam([{x:x2+39,y:y1-8*branch},{x:x2+82,y:y2},{x:x3-40,y:y2}],branch===1?"#43d9ff":"#f6b95b",0.8+sequence.selectedMiddle*4.2,0.06+sequence.selectedMiddle*.9);drawBeam([{x:x2+39,y:y1+8*branch},{x:x2+80,y:y2Blocked}],branch===1?"#f6b95b":"#43d9ff",1.1,0.24,true);drawBlocker(x2+90,y2Blocked);
    drawBeam([{x:x3+39,y:y2-7},{x:x3+82,y:yPlus},{x:x4,y:yPlus}],"#43d9ff",0.8+sequence.plusFinal*4,0.06+sequence.plusFinal*.9);drawBeam([{x:x3+39,y:y2+7},{x:x3+82,y:yMinus},{x:x4,y:yMinus}],"#f6b95b",0.8+(1-sequence.plusFinal)*4,0.06+(1-sequence.plusFinal)*.9);
    drawLabel("−z",x1+72,y1Blocked+20,"#8b6670",8);drawLabel(branch===1?"−α":"+α",x2+82,y2Blocked+20,"#8b6670",8);drawLabel(`+β · ${(sequence.plusFinal*100).toFixed(0)}%`,x4-14,yPlus+4,"#43d9ff",9,"right");drawLabel(`−β · ${((1-sequence.plusFinal)*100).toFixed(0)}%`,x4-14,yMinus+4,"#f6b95b",9,"right");
    const selectedColor = branch === 1 ? "#83e7ff" : "#ffd18a";const count = sequence.transmitted < 1e-5 ? 0 : Math.max(4,Math.round(7+sequence.transmitted*42));const travel=time*.00016;for(let index=0;index<count;index++){const absolute=travel+index/count;const cycle=Math.floor(absolute);const phase=absolute-cycle;const finalPlus=hash(index+cycle*71)<sequence.plusFinal;const nodes=[{x:x0+28,y},{x:x1-40,y},{x:x1+82,y:y1},{x:x2-40,y:y1},{x:x2+82,y:y2},{x:x3-40,y:y2},{x:x3+82,y:finalPlus?yPlus:yMinus},{x:x4,y:finalPlus?yPlus:yMinus}];const point=interpolatePath(nodes,phase);particle(point.x,point.y,phase<.72?selectedColor:(finalPlus?"#83e7ff":"#ffd18a"),.45+phase*.55,2);}
    drawLabel(canvasText("prepare"),x1,y+height*.19,"#5f7f92",8);drawLabel(canvasText("select"),x2,y+height*.19,"#5f7f92",8);drawLabel(canvasText("measure"),x3,y+height*.19,"#5f7f92",8);
  }

  function render(time = 0) {
    if (!canvas || !context) return;const rect=canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);const width=Math.max(1,Math.round(rect.width*dpr));const height=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}context.setTransform(dpr,0,0,dpr,0,0);drawBackground(rect.width,rect.height);if(mode==="split")drawSplit(rect.width,rect.height,time);else drawSequence(rect.width,rect.height,time);frame=requestAnimationFrame(render);
  }

  function bindControls(directory) {
    root.querySelectorAll("[data-sg-mode]").forEach(button => button.addEventListener("click",()=>{const nextMode=button.dataset.sgMode;setMode(nextMode);const nextHash=nextMode==="sequence"?"#experiment/sg-sequence":"#experiment/sg-split";if(location.hash!==nextHash)location.hash=nextHash;}));
    root.querySelectorAll("[data-source]").forEach(button => button.addEventListener("click",()=>{state.split.source=button.dataset.source;root.querySelectorAll("[data-source]").forEach(item=>item.classList.toggle("active",item===button));updateReadouts();}));
    root.querySelectorAll("input[data-state]").forEach(input=>{setRangeFill(input);input.addEventListener("input",()=>{const key=input.dataset.state;const target=key==="middle"||key==="final"?state.sequence:state.split;target[key]=Number(input.value);setRangeFill(input);updateReadouts();});});
    root.querySelector("[data-toggle-classical]").addEventListener("click",event=>{state.split.classical=!state.split.classical;event.currentTarget.setAttribute("aria-checked",String(state.split.classical));});
    root.querySelectorAll("[data-branch]").forEach(button=>button.addEventListener("click",()=>{state.sequence.branch=Number(button.dataset.branch);root.querySelectorAll("[data-branch]").forEach(item=>item.classList.toggle("active",item===button));updateReadouts();}));
    const presets={zz:{middle:0,branch:1,final:0},zxz:{middle:90,branch:1,final:0},z45x:{middle:45,branch:1,final:90},zminusxz:{middle:90,branch:-1,final:0}};
    root.querySelectorAll("[data-preset]").forEach(button=>button.addEventListener("click",()=>{Object.assign(state.sequence,presets[button.dataset.preset]);root.querySelector("#sg-middle").value=state.sequence.middle;root.querySelector("#sg-final").value=state.sequence.final;root.querySelectorAll("[data-branch]").forEach(item=>item.classList.toggle("active",Number(item.dataset.branch)===state.sequence.branch));setRangeFill(root.querySelector("#sg-middle"));setRangeFill(root.querySelector("#sg-final"));updateReadouts();}));
    directory.querySelectorAll("[data-filter]").forEach(button=>button.addEventListener("click",()=>{const filter=button.dataset.filter;directory.querySelectorAll("[data-filter]").forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));});directory.querySelectorAll(".directory-card").forEach(card=>{card.toggleAttribute("hidden",filter!=="all"&&!card.dataset.category.split(" ").includes(filter));});}));
    directory.querySelectorAll("[data-open-sg]").forEach(link=>link.addEventListener("click",()=>setMode(link.dataset.openSg)));
  }

  function start() {
    const legacy = document.querySelector(".module-catalog");const labPage=document.querySelector(".lab-page");
    if(!legacy||!labPage){if(!bootObserver){const host=document.querySelector("#root")||document.body;bootObserver=new MutationObserver(()=>{if(document.querySelector(".module-catalog")&&document.querySelector(".lab-page")){bootObserver.disconnect();bootObserver=null;start();}});bootObserver.observe(host,{childList:true,subtree:true});}return;}
    if(document.querySelector(".sg-lab"))return;
    bootObserver?.disconnect();bootObserver=null;legacy.classList.add("legacy-catalog-hidden");legacy.id="legacy-experiments";legacy.setAttribute("aria-hidden","true");
    const holder=document.createElement("div");holder.innerHTML=markup().trim();root=holder.firstElementChild;labPage.insertBefore(root,legacy);
    const directoryHolder=document.createElement("div");directoryHolder.innerHTML=directoryMarkup().trim();directoryRoot=directoryHolder.firstElementChild;labPage.insertBefore(directoryRoot,legacy);
    canvas=root.querySelector(".sg-canvas");context=canvas.getContext("2d");bindControls(directoryRoot);const initialLanguage=SUPPORTED_LANGUAGES.find(code=>document.documentElement.lang.toLowerCase().startsWith(code))||"en";applyLanguage(initialLanguage);updateReadouts();window.addEventListener("pvl:languagechange",event=>applyLanguage(event.detail?.language));window.addEventListener("hashchange",()=>{if(location.hash==="#sg-sequence")setMode("sequence");});if(location.hash==="#sg-sequence")setMode("sequence");frame=requestAnimationFrame(render);
    window.SternGerlachLab={setMode,get mode(){return mode;},state};
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
