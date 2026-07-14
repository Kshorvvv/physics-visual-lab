/* Language detection and complete offline translation · Physics Visual Lab v4.2.0 */
(() => {
  "use strict";

  const STORAGE_KEY = "physics-visual-lab-language";
  const SUPPORTED = ["zh", "en", "ko", "uz", "ru", "my", "shn", "th", "ja"];
  const LANGUAGE_TAGS = { zh:"zh-CN", en:"en", ko:"ko", uz:"uz", ru:"ru", my:"my", shn:"shn", th:"th", ja:"ja" };
  const translations = [
    ["物理可视化实验室", "Physics Visual Lab"],
    ["物理可视化实验室首页", "Physics Visual Lab home"],
    ["物理可视化实验室 · 01", "Physics Visual Lab · 01"],
    ["电磁学", "Electromagnetism"],
    ["实验目录", "Experiments"],
    ["实时模拟", "Live simulation"],
    ["已暂停", "Paused"],
    ["拉莫尔进动", "Larmor Precession"],
    ["磁矩在恒定磁场中不会直接“倒向”磁场，而是以固定夹角绕磁场方向进动。 改变参数，亲眼看见方向、频率与锥角如何响应。", "A magnetic moment in a constant magnetic field does not simply tip toward the field. Instead, it precesses around the field direction at a fixed angle. Adjust the parameters to see how direction, frequency, and cone angle respond."],
    ["拉莫尔进动核心方程", "Core equations of Larmor precession"],
    ["拉莫尔进动交互实验台", "Interactive Larmor precession laboratory"],
    ["视角控制", "View controls"],
    ["透视", "Perspective"],
    ["沿 +B 俯视", "View along +B"],
    ["拉莫尔进动三维动画。拖动画布旋转视角，拖动磁矩箭头改变初始夹角，滚轮缩放。", "Three-dimensional Larmor precession animation. Drag the canvas to orbit, drag the magnetic-moment arrow to change the initial angle, and use the wheel to zoom."],
    ["拖动空白处旋转", "Drag empty space to orbit"],
    ["拖动 μ 改变 θ₀", "Drag μ to change θ₀"],
    ["滚轮缩放", "Scroll to zoom"],
    ["实验控制", "Experiment Controls"],
    ["磁场强度", "Magnetic field strength"],
    ["磁场强度 B", "Magnetic field strength B"],
    ["旋磁比", "Gyromagnetic ratio"],
    ["旋磁比 γ", "Gyromagnetic ratio γ"],
    ["初始夹角", "Initial angle"],
    ["初始夹角 θ₀", "Initial angle θ₀"],
    ["磁场方向", "Magnetic-field direction"],
    ["暂停", "Pause"],
    ["继续", "Resume"],
    ["暂停动画", "Pause animation"],
    ["继续动画", "Resume animation"],
    ["复位", "Reset"],
    ["单步", "Step"],
    ["观察方向", "Viewing direction"],
    ["没有进动：角频率为零", "No precession: the angular frequency is zero"],
    ["进动周期", "Precession period"],
    ["归一化力矩", "Normalized torque"],
    ["动画采用便于观察的教学时间标度；ω", "The animation uses a teaching time scale chosen for clarity; ω"],
    ["与周期读数保持真实量纲关系。", "and the period readout retain their true dimensional relationship."],
    ["三个十秒钟实验", "Three Ten-Second Experiments"],
    ["不要先背结论。按下按钮，预测画面会怎样变，再用动画检查。", "Do not memorize the conclusion first. Press a button, predict what will change, then check your prediction against the animation."],
    ["反转 γ 的符号", "Reverse the sign of γ"],
    ["锥角不变，进动方向立刻反转。", "The cone angle stays fixed while the precession direction reverses instantly."],
    ["把 B 加倍", "Double B"],
    ["加倍，物理周期缩短为一半。", "doubles, so the physical period is halved."],
    ["让 μ 接近 B", "Bring μ close to B"],
    ["轨道半径收缩，因为力矩 ∝ sin θ。", "The orbit radius shrinks because the torque is proportional to sin θ."],
    ["运行实验 ↗", "Run experiment ↗"],
    ["它为什么不是直接倒向磁场？", "Why Does It Not Simply Align with the Field?"],
    ["关键在于磁场力矩始终垂直于磁矩。它改变磁矩的方向，却不改变磁矩的大小； 在理想均匀静磁场中，磁矩与磁场的夹角也因此保持不变。", "The key is that the magnetic torque is always perpendicular to the magnetic moment. It changes the moment's direction, not its magnitude; in an ideal uniform static field, the angle between the moment and the field therefore remains constant."],
    ["拉莫尔进动三步推导", "Three-step derivation of Larmor precession"],
    ["磁场提供力矩", "The field exerts a torque"],
    ["角动量随力矩变化", "Torque changes angular momentum"],
    ["利用 μ = γJ", "Use μ = γJ"],
    ["物理，在运动中变得可见", "Physics Becomes Visible in Motion"],
    ["拉莫尔进动只是第一项。这里会逐步收纳电磁学、量子力学与经典动力学中的动态结构。", "Larmor precession is only the beginning. This collection will grow to include dynamic structures from electromagnetism, quantum mechanics, and classical dynamics."],
    ["磁矩、旋磁比与恒定磁场", "Magnetic moment, gyromagnetic ratio, and a constant field"],
    ["正在实验", "Active experiment"],
    ["Bloch 球与自旋", "Bloch Sphere and Spin"],
    ["量子态在球面上的几何图像", "A geometric picture of quantum states on the sphere"],
    ["即将加入", "Coming soon"],
    ["耦合振子与简正模", "Coupled Oscillators and Normal Modes"],
    ["从拍频走向集体激发", "From beats to collective excitation"],
    ["看见方程如何运动。", "See equations in motion."],
    ["静止", "stationary"],
    ["逆时针", "counterclockwise"],
    ["顺时针", "clockwise"]
  ];

  const extraInterfaceTranslations = {
    ko: [
      ["Physics Visual Lab","물리 시각화 실험실"],["Home","홈"],["Collections","컬렉션"],["Experiment Collections","실험 컬렉션"],["LIVE COLLECTION","공개 컬렉션"],["LIVE COLLECTIONS","공개 컬렉션"],["SUB-LABS","하위 실험"],["INTERACTIVE SUB-LABS","상호작용 하위 실험"],["LEVEL 1 · CHOOSE A COLLECTION","1단계 · 컬렉션 선택"],["COLLECTION → SUB-LAB → GUIDE & DERIVATION","컬렉션 → 하위 실험 → 안내와 유도"],["AVAILABLE","이용 가능"],["The Stern–Gerlach Collection","Stern–Gerlach 컬렉션"],["Larmor precession","라모어 세차"],["Beam splitting","빔 분리"],["Sequential measurement","연속 측정"],["3 sub-labs · about 30 min","하위 실험 3개 · 약 30분"],["Open collection ↗","컬렉션 열기 ↗"],["PLANNED","예정"],["Two-Level Systems & Quantum Control","2준위계와 양자 제어"],["FUTURE COLLECTION","향후 컬렉션"],["Roadmap","로드맵"],["Single-Particle Interference & Path Amplitudes","단일 입자 간섭과 경로 진폭"],["Double slit","이중 슬릿"],["Quantum eraser","양자 지우개"],["START HERE","먼저 읽기"],["Lab guide","실험 안내"],["STEP BY STEP","단계별"],["Derivation","유도"],["Turn equations into","방정식을"],["motion you can touch","만질 수 있는 운동으로"],["Browse collections ↘","컬렉션 둘러보기 ↘"],["AUTO LANGUAGE","자동 언어 인식"],["Choose a collection, then a sub-lab","컬렉션을 고른 뒤 하위 실험으로"],["History, measurement, three sub-labs","역사, 측정, 하위 실험 3개"],["Projectile and inclined-plane dynamics","포물선 운동과 경사면 동역학"],["Physics Visual Lab · Independent open website","물리 시각화 실험실 · 독립 공개 웹사이트"],["See equations in motion.","움직이는 방정식을 보세요."]
    ],
    uz: [
      ["Physics Visual Lab","Fizika vizual laboratoriyasi"],["Home","Bosh sahifa"],["Collections","To‘plamlar"],["Experiment Collections","Tajriba to‘plamlari"],["LIVE COLLECTION","OCHIQ TO‘PLAM"],["LIVE COLLECTIONS","OCHIQ TO‘PLAMLAR"],["SUB-LABS","KICHIK TAJRIBALAR"],["INTERACTIVE SUB-LABS","INTERAKTIV TAJRIBALAR"],["LEVEL 1 · CHOOSE A COLLECTION","1-DARAJA · TO‘PLAMNI TANLANG"],["COLLECTION → SUB-LAB → GUIDE & DERIVATION","TO‘PLAM → TAJRIBA → QO‘LLANMA VA KELTIRISH"],["AVAILABLE","MAVJUD"],["The Stern–Gerlach Collection","Stern–Gerlach to‘plami"],["Larmor precession","Larmor pretsessiyasi"],["Beam splitting","Dastani ajratish"],["Sequential measurement","Ketma-ket o‘lchash"],["3 sub-labs · about 30 min","3 tajriba · taxminan 30 daqiqa"],["Open collection ↗","To‘plamni ochish ↗"],["PLANNED","REJADA"],["Two-Level Systems & Quantum Control","Ikki sathli tizimlar va kvant boshqaruvi"],["FUTURE COLLECTION","KELAJAK TO‘PLAMI"],["Roadmap","Reja"],["Single-Particle Interference & Path Amplitudes","Bitta zarra interferensiyasi va yo‘l amplitudalari"],["Double slit","Ikki tirqish"],["Quantum eraser","Kvant o‘chirgich"],["START HERE","AVVAL O‘QING"],["Lab guide","Tajriba qo‘llanmasi"],["STEP BY STEP","BOSQICHMA-BOSQICH"],["Derivation","Keltirib chiqarish"],["Turn equations into","Tenglamalarni"],["motion you can touch","boshqariladigan harakatga aylantiring"],["Browse collections ↘","To‘plamlarni ko‘rish ↘"],["AUTO LANGUAGE","TILNI AVTOMATIK ANIQLASH"],["Choose a collection, then a sub-lab","To‘plamni, so‘ng tajribani tanlang"],["History, measurement, three sub-labs","Tarix, o‘lchash va uchta tajriba"],["Projectile and inclined-plane dynamics","Qiya otilish va qiya tekislik dinamikasi"],["Physics Visual Lab · Independent open website","Fizika vizual laboratoriyasi · ochiq mustaqil sayt"],["See equations in motion.","Tenglamalarning harakatini ko‘ring."]
    ],
    ru: [
      ["Physics Visual Lab","Лаборатория визуальной физики"],["Home","Главная"],["Collections","Разделы"],["Experiment Collections","Разделы экспериментов"],["LIVE COLLECTION","ОТКРЫТЫЙ РАЗДЕЛ"],["LIVE COLLECTIONS","ОТКРЫТЫЕ РАЗДЕЛЫ"],["SUB-LABS","ЛАБОРАТОРИИ"],["INTERACTIVE SUB-LABS","ИНТЕРАКТИВНЫЕ ЛАБОРАТОРИИ"],["LEVEL 1 · CHOOSE A COLLECTION","УРОВЕНЬ 1 · ВЫБЕРИТЕ РАЗДЕЛ"],["COLLECTION → SUB-LAB → GUIDE & DERIVATION","РАЗДЕЛ → ЛАБОРАТОРИЯ → РУКОВОДСТВО И ВЫВОД"],["AVAILABLE","ДОСТУПНО"],["The Stern–Gerlach Collection","Раздел Штерна — Герлаха"],["Larmor precession","Ларморова прецессия"],["Beam splitting","Расщепление пучка"],["Sequential measurement","Последовательное измерение"],["3 sub-labs · about 30 min","3 лаборатории · около 30 мин"],["Open collection ↗","Открыть раздел ↗"],["PLANNED","В ПЛАНЕ"],["Two-Level Systems & Quantum Control","Двухуровневые системы и квантовое управление"],["FUTURE COLLECTION","БУДУЩИЙ РАЗДЕЛ"],["Roadmap","План"],["Single-Particle Interference & Path Amplitudes","Интерференция одной частицы и амплитуды путей"],["Double slit","Две щели"],["Quantum eraser","Квантовый ластик"],["START HERE","НАЧАТЬ ЗДЕСЬ"],["Lab guide","Руководство"],["STEP BY STEP","ПОШАГОВО"],["Derivation","Вывод"],["Turn equations into","Превратите уравнения"],["motion you can touch","в движение, которым можно управлять"],["Browse collections ↘","Смотреть разделы ↘"],["AUTO LANGUAGE","АВТООПРЕДЕЛЕНИЕ ЯЗЫКА"],["Choose a collection, then a sub-lab","Выберите раздел, затем лабораторию"],["History, measurement, three sub-labs","История, измерение и три лаборатории"],["Projectile and inclined-plane dynamics","Движение снаряда и динамика на наклонной плоскости"],["Physics Visual Lab · Independent open website","Лаборатория визуальной физики · открытый независимый сайт"],["See equations in motion.","Увидьте уравнения в движении."]
    ],
    my: [
      ["Physics Visual Lab","ရူပဗေဒ ပုံဖော်စမ်းသပ်ခန်း"],["Home","ပင်မ"],["Collections","အစုများ"],["Experiment Collections","စမ်းသပ်အစုများ"],["LIVE COLLECTION","ဖွင့်ထားသောအစု"],["LIVE COLLECTIONS","ဖွင့်ထားသောအစုများ"],["SUB-LABS","စမ်းသပ်ခန်းငယ်များ"],["INTERACTIVE SUB-LABS","အပြန်အလှန် စမ်းသပ်ခန်းများ"],["LEVEL 1 · CHOOSE A COLLECTION","အဆင့် ၁ · အစုရွေးပါ"],["COLLECTION → SUB-LAB → GUIDE & DERIVATION","အစု → စမ်းသပ်ခန်း → လမ်းညွှန်နှင့်တွက်ချက်မှု"],["AVAILABLE","အသုံးပြုနိုင်သည်"],["The Stern–Gerlach Collection","Stern–Gerlach အစု"],["Larmor precession","လာမော် အလှည့်ရွေ့လျားမှု"],["Beam splitting","အလင်းတန်းခွဲခြင်း"],["Sequential measurement","အစဉ်လိုက်တိုင်းတာမှု"],["3 sub-labs · about 30 min","စမ်းသပ်ခန်း ၃ ခု · ၃၀ မိနစ်ခန့်"],["Open collection ↗","အစုဖွင့်ရန် ↗"],["PLANNED","စီစဉ်ထားသည်"],["Two-Level Systems & Quantum Control","အဆင့်နှစ်ခုစနစ်နှင့် ကွမ်တမ်ထိန်းချုပ်မှု"],["FUTURE COLLECTION","နောင်လာမည့်အစု"],["Roadmap","လမ်းပြမြေပုံ"],["Single-Particle Interference & Path Amplitudes","အမှုန်တစ်ခု ကြားဝင်မှုနှင့် လမ်းကြောင်းအမ်ပလီကျု"],["Double slit","အပေါက်နှစ်ခု"],["Quantum eraser","ကွမ်တမ်ဖျက်ကိရိယာ"],["START HERE","ဤနေရာမှစပါ"],["Lab guide","စမ်းသပ်လမ်းညွှန်"],["STEP BY STEP","အဆင့်လိုက်"],["Derivation","တွက်ချက်ပြခြင်း"],["Turn equations into","ညီမျှခြင်းများကို"],["motion you can touch","ထိန်းချုပ်နိုင်သော ရွေ့လျားမှုဖြစ်စေပါ"],["Browse collections ↘","အစုများကြည့်ရန် ↘"],["AUTO LANGUAGE","ဘာသာစကား အလိုအလျောက်သိခြင်း"],["Choose a collection, then a sub-lab","အစုတစ်ခုရွေးပြီး စမ်းသပ်ခန်းသို့ဝင်ပါ"],["History, measurement, three sub-labs","သမိုင်း၊ တိုင်းတာမှုနှင့် စမ်းသပ်ခန်း ၃ ခု"],["Projectile and inclined-plane dynamics","ပစ်လွှတ်နှင့် စောင်းမျက်နှာပြင် ဒိုင်းနမစ်"],["Physics Visual Lab · Independent open website","ရူပဗေဒ ပုံဖော်စမ်းသပ်ခန်း · လွတ်လပ်သောဝဘ်ဆိုက်"],["See equations in motion.","ညီမျှခြင်းများ ရွေ့လျားပုံကို ကြည့်ပါ။"]
    ]
  };
  extraInterfaceTranslations.th=[["Physics Visual Lab","ห้องปฏิบัติการฟิสิกส์เชิงภาพ"],["Home","หน้าหลัก"],["Collections","ชุดการทดลอง"],["Experiment Collections","ชุดการทดลอง"],["LIVE COLLECTION","ชุดที่เปิด"],["LIVE COLLECTIONS","ชุดที่เปิด"],["SUB-LABS","การทดลองย่อย"],["INTERACTIVE SUB-LABS","การทดลองแบบโต้ตอบ"],["AVAILABLE","พร้อมใช้งาน"],["START HERE","เริ่มที่นี่"],["Lab guide","คู่มือทดลอง"],["STEP BY STEP","ทีละขั้น"],["Derivation","การหา"],["Browse collections ↘","ดูชุดการทดลอง ↘"],["AUTO LANGUAGE","ตรวจหาภาษาอัตโนมัติ"],["Open collection ↗","เปิดชุดการทดลอง ↗"],["See equations in motion.","มองเห็นสมการเคลื่อนไหว"]];
  extraInterfaceTranslations.ja=[["Physics Visual Lab","物理可視化ラボ"],["Home","ホーム"],["Collections","コレクション"],["Experiment Collections","実験コレクション"],["LIVE COLLECTION","公開コレクション"],["LIVE COLLECTIONS","公開コレクション"],["SUB-LABS","サブラボ"],["INTERACTIVE SUB-LABS","インタラクティブ実験"],["AVAILABLE","公開中"],["START HERE","最初に読む"],["Lab guide","実験ガイド"],["STEP BY STEP","段階的に"],["Derivation","導出"],["Browse collections ↘","コレクションを見る ↘"],["AUTO LANGUAGE","言語自動判定"],["Open collection ↗","コレクションを開く ↗"],["See equations in motion.","方程式の運動を見よう。"]];
  if (Array.isArray(window.PVL_JA_INTERFACE)) extraInterfaceTranslations.ja.push(...window.PVL_JA_INTERFACE);
  extraInterfaceTranslations.shn=[["Physics Visual Lab","Physics Visual Lab · ၵႂၢမ်းတႆး"],["Home","Home"],["Collections","Collections"],["AUTO LANGUAGE","AUTO LANGUAGE · SHN"]];
  if (window.PVL_FULL_INTERFACE) {
    for (const [code, pairs] of Object.entries(window.PVL_FULL_INTERFACE)) {
      if (!extraInterfaceTranslations[code]) extraInterfaceTranslations[code] = [];
      if (Array.isArray(pairs)) extraInterfaceTranslations[code].push(...pairs);
    }
  }
  if (window.PVL_CATALOG_INTERFACE) {
    for (const [code, pairs] of Object.entries(window.PVL_CATALOG_INTERFACE)) {
      if (!extraInterfaceTranslations[code]) extraInterfaceTranslations[code] = [];
      if (Array.isArray(pairs)) extraInterfaceTranslations[code].push(...pairs);
    }
  }

  // Build every language map from shared phrase groups. Each map accepts the
  // Chinese, English, and every localized variant as input, so switching
  // ja → zh or ru → ko is deterministic instead of translating the already
  // translated page in one direction only.
  const phraseGroups = new Map(translations.map(([zh, en]) => [en, { zh, en }]));
  const foldedEnglish = new Map([...phraseGroups.keys()].map(english => [english.toLocaleLowerCase("en"), english]));
  for (const [code, pairs] of Object.entries(extraInterfaceTranslations)) {
    for (const [english, localized] of pairs) {
      const canonical = foldedEnglish.get(english.toLocaleLowerCase("en")) || english;
      const group = phraseGroups.get(canonical) || { en: english };
      group[code] = localized;
      phraseGroups.set(canonical, group);
      foldedEnglish.set(english.toLocaleLowerCase("en"), canonical);
    }
  }
  const maps = Object.fromEntries(SUPPORTED.map(code => {
    const map = new Map();
    for (const group of phraseGroups.values()) {
      const target = code === "zh" ? (group.zh || group.en) : (group[code] || group.en);
      for (const variant of Object.values(group)) if (variant) map.set(variant, target);
    }
    return [code, map];
  }));

  let currentLanguage = "zh";
  let switcher = null;
  let observer = null;
  let menuEventsBound = false;
  const LANGUAGE_INFO = [
    ["zh","中文","ZH","full"],["en","English","EN","full"],["ja","日本語","JA","full"],
    ["ko","한국어","KO","full"],["ru","Русский","RU","full"],["uz","O‘zbekcha","UZ","full"],
    ["my","မြန်မာ","MY","full"],["shn","ၵႂၢမ်းတႆး","SHN","full"],["th","ไทย","TH","full"]
  ];

  function readStoredLanguage() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }

  function storeLanguage(language) {
    try { localStorage.setItem(STORAGE_KEY, language); } catch { /* Storage may be unavailable. */ }
  }

  function detectLanguage() {
    const requested = new URLSearchParams(location.search).get("lang")?.toLowerCase();
    const normalize = value => SUPPORTED.find(code => value === code || value?.startsWith(`${code}-`));
    if (normalize(requested)) return normalize(requested);
    const stored = readStoredLanguage();
    if (normalize(stored)) return normalize(stored);
    const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const browserLanguage of browserLanguages) { const detected=normalize((browserLanguage||"").toLowerCase());if(detected)return detected; }
    return "en";
  }

  const directionPrefixes = {
    zh:"沿 +B 看向原点：",
    en:"Viewed along +B toward the origin: ",
    ja:"+B 方向から原点を見る：",
    ko:"+B 방향에서 원점을 볼 때: ",
    ru:"Вид вдоль +B к началу координат: ",
    uz:"+B bo‘ylab koordinata boshiga qaralganda: ",
    th:"เมื่อมองตาม +B ไปยังจุดกำเนิด: ",
    my:"+B အတိုင်း မူလမှတ်သို့ ကြည့်လျှင်: ",
    shn:"တူၺ်းၸွမ်း +B ၸူး origin: "
  };

  function translateCore(core, target) {
    const exact = maps[target].get(core);
    if (exact) return exact;

    // The Larmor direction readout is assembled at runtime. Recover its
    // canonical direction from any supported language, then rebuild it in
    // the requested language. This also makes ja -> zh and ru -> ko switches
    // deterministic instead of leaving a prefix or direction behind.
    for (const [source, prefix] of Object.entries(directionPrefixes)) {
      if (!core.startsWith(prefix)) continue;
      const sourceDirection = core.slice(prefix.length);
      for (const canonical of ["stationary", "counterclockwise", "clockwise"]) {
        const localizedSource = maps[source].get(canonical) || canonical;
        if (sourceDirection === localizedSource) {
          const localizedTarget = maps[target].get(canonical) || canonical;
          return `${directionPrefixes[target]}${localizedTarget}`;
        }
      }
    }
    return core;
  }

  function translateValue(value, target) {
    if (!value || !value.trim()) return value;
    const leading = value.match(/^\s*/)?.[0] || "";
    const trailing = value.match(/\s*$/)?.[0] || "";
    const core = value.slice(leading.length, value.length - trailing.length || undefined);
    const translated = translateCore(core, target);
    return translated === core ? value : `${leading}${translated}${trailing}`;
  }

  function isInsideSwitcher(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return Boolean(element?.closest?.(".language-switcher"));
  }

  function translateTextNode(node) {
    if (isInsideSwitcher(node)) return;
    const translated = translateValue(node.nodeValue, currentLanguage);
    if (translated !== node.nodeValue) node.nodeValue = translated;
  }

  function translateAttributes(element) {
    if (isInsideSwitcher(element)) return;
    for (const attribute of ["aria-label", "title", "placeholder"]) {
      if (!element.hasAttribute(attribute)) continue;
      const current = element.getAttribute(attribute);
      const translated = translateValue(current, currentLanguage);
      if (translated !== current) element.setAttribute(attribute, translated);
    }
  }

  function translateSubtree(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      translateTextNode(node);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || isInsideSwitcher(node)) return;
    translateAttributes(node);
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let current;
    while ((current = walker.nextNode())) {
      if (current.nodeType === Node.TEXT_NODE) translateTextNode(current);
      else translateAttributes(current);
    }
  }

  function updateDocumentMetadata(language) {
    document.documentElement.lang = LANGUAGE_TAGS[language] || "en";
    const metadata=window.PVL_DOCUMENT_META?.[language]||window.PVL_DOCUMENT_META?.en;
    document.title = metadata?.title || (language === "zh" ? "物理可视化实验室｜互动实验" : "Physics Visual Lab | Interactive Experiments");
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = metadata?.description || (language === "zh" ? "通过十九个交互实验与三座自由设计工作台，探索力学、振动、电路、光学以及 Stern–Gerlach 量子测量。" : "Explore mechanics, oscillations, circuits, optics, and Stern–Gerlach quantum measurement through nineteen interactive labs and three open-ended studios.");
    }
  }

  function updateSwitcher() {
    if (!switcher) return;
    const selectorLabel = {zh:"语言选择",en:"Language selector",ko:"언어 선택",uz:"Tilni tanlash",ru:"Выбор языка",my:"ဘာသာစကား ရွေးချယ်မှု",shn:"ၽႃႇသႃႇ",th:"เลือกภาษา",ja:"言語を選択"}[currentLanguage]||"Language selector";
    const menuCopy={zh:["语言","界面语言","自动识别 · 可手动切换"],en:["LANGUAGE","INTERFACE LANGUAGE","AUTO-DETECTED · MANUAL OVERRIDE"],ja:["言語","表示言語","自動判定 · 手動で変更可能"],ko:["언어","인터페이스 언어","자동 감지 · 수동 변경"],ru:["ЯЗЫК","ЯЗЫК ИНТЕРФЕЙСА","АВТО · РУЧНОЙ ВЫБОР"],uz:["TIL","INTERFEYS TILI","AVTO · QO‘LDA TANLASH"],my:["ဘာသာစကား","မျက်နှာပြင်ဘာသာစကား","အလိုအလျောက် · ကိုယ်တိုင်ရွေး"],shn:["ၽႃႇသႃႇ","ၽႃႇသႃႇၼႃႈၸေႃး","ႁူႉႁင်းၵူၺ်း · လိူၵ်ႈႁင်းၵူၺ်း"],th:["ภาษา","ภาษาของอินเทอร์เฟซ","อัตโนมัติ · เลือกเอง"]}[currentLanguage]||["LANGUAGE","INTERFACE LANGUAGE","AUTO-DETECTED · MANUAL OVERRIDE"];
    const footerCopy={zh:["完整","完整离线界面与理论","种完整语言"],en:["FULL","complete offline interface & theory","complete locales"],ja:["完全","オフラインの画面と理論を完全収録","言語を完全収録"],ko:["전체","오프라인 인터페이스와 이론 완역","개 언어 완역"],ru:["ПОЛНАЯ","полный офлайн-интерфейс и теория","полных локализаций"],uz:["TO‘LIQ","oflayn interfeys va nazariya to‘liq","ta to‘liq til"],my:["အပြည့်","အော့ဖ်လိုင်း မျက်နှာပြင်နှင့် သီအိုရီ အပြည့်","ဘာသာစကား အပြည့်"],shn:["တဵမ်","ၼႃႈၸေႃးလႄႈတီႇဢူဝ်ႇရီႇ ဢၼ်ဢမ်ႇလူဝ်ႇၸႂ်ႉဢိၼ်ႇထိူဝ်ႇၼႅတ်ႉ တဵမ်ထူၼ်ႈ","ၽႃႇသႃႇတဵမ်ထူၼ်ႈ"],th:["สมบูรณ์","อินเทอร์เฟซและทฤษฎีออฟไลน์ฉบับสมบูรณ์","ภาษาฉบับสมบูรณ์"]}[currentLanguage]||["FULL","complete offline interface & theory","complete locales"];
    if (switcher.getAttribute("aria-label") !== selectorLabel) switcher.setAttribute("aria-label", selectorLabel);
    const current=LANGUAGE_INFO.find(([code])=>code===currentLanguage)||LANGUAGE_INFO[1];
    const trigger=switcher.querySelector(".language-trigger");
    if(trigger){trigger.setAttribute("aria-label",selectorLabel);const name=trigger.querySelector("[data-language-current]"),code=trigger.querySelector("[data-language-code]"),label=trigger.querySelector(".language-trigger-copy small");if(name)name.textContent=current[1];if(code)code.textContent=current[2];if(label)label.textContent=menuCopy[0];}const popHeader=switcher.querySelector(".language-popover>header");if(popHeader){popHeader.querySelector("span").textContent=menuCopy[1];popHeader.querySelector("small").textContent=menuCopy[2];}
    switcher.querySelectorAll("[data-language-option]").forEach(button=>{const active=button.dataset.languageOption===currentLanguage;button.classList.toggle("active",active);button.setAttribute("aria-selected",String(active));const status=button.querySelector("small");if(status)status.textContent=footerCopy[0];});
    const footer=switcher.querySelector(".language-popover>footer");if(footer){const lines=footer.querySelectorAll("span");if(lines[0])lines[0].innerHTML=`<b>${footerCopy[0]}</b> ${footerCopy[1]}`;if(lines[1])lines[1].innerHTML=`<b>9</b> ${footerCopy[2]}`;}
    const select=switcher.querySelector("select");if(select){select.setAttribute("aria-label",selectorLabel);try{select.value=currentLanguage;}catch{}for(const option of select.options){const active=option.value===currentLanguage;if(option.hasAttribute("selected")!==active)option.toggleAttribute("selected",active);}}
  }

  function ensureSwitcher() {
    const host = document.querySelector(".pvl-app-header .header-meta") || document.querySelector(".header-meta");
    if (!host) return null;
    if (switcher?.isConnected) {
      if (switcher.parentElement !== host) host.appendChild(switcher);
      return switcher;
    }
    switcher = document.createElement("div");
    switcher.className = "language-switcher";
    const menuItems=LANGUAGE_INFO.map(([code,name,short,status])=>`<button type="button" role="option" aria-selected="false" data-language-option="${code}"><span class="language-option-code">${short}</span><span class="language-option-name">${name}</span><small>${status.toUpperCase()}</small><i aria-hidden="true">✓</i></button>`).join("");
    const nativeOptions=LANGUAGE_INFO.map(([code,name])=>`<option value="${code}">${name}</option>`).join("");
    switcher.innerHTML = `<button class="language-trigger" type="button" aria-haspopup="listbox" aria-expanded="false"><span class="language-glyph" aria-hidden="true">文</span><span class="language-trigger-copy"><small>LANGUAGE</small><strong data-language-current>中文</strong></span><span class="language-trigger-code" data-language-code>ZH</span><span class="language-chevron" aria-hidden="true">⌄</span></button><div class="language-popover" role="listbox" hidden><header><span>INTERFACE LANGUAGE</span><small>AUTO-DETECTED · MANUAL OVERRIDE</small></header><div class="language-options">${menuItems}</div><footer><span><b>FULL</b> complete offline interface &amp; theory</span><span><b>9</b> complete locales</span></footer></div><select class="language-native-select" tabindex="-1" aria-hidden="true">${nativeOptions}</select>`;
    const trigger=switcher.querySelector(".language-trigger"),popover=switcher.querySelector(".language-popover");
    const closeMenu=()=>{popover.hidden=true;trigger.setAttribute("aria-expanded","false");switcher.classList.remove("is-open");};
    trigger.addEventListener("click",()=>{const opening=popover.hidden;popover.hidden=!opening;trigger.setAttribute("aria-expanded",String(opening));switcher.classList.toggle("is-open",opening);});
    switcher.querySelectorAll("[data-language-option]").forEach(button=>button.addEventListener("click",()=>{setLanguage(button.dataset.languageOption,true);closeMenu();trigger.focus();}));
    switcher.querySelector("select").addEventListener("change", event => setLanguage(event.target.value, true));
    if(!menuEventsBound){menuEventsBound=true;document.addEventListener("click",event=>{if(switcher?.isConnected&&!switcher.contains(event.target)){const pop=switcher.querySelector(".language-popover"),btn=switcher.querySelector(".language-trigger");if(pop&&!pop.hidden){pop.hidden=true;btn?.setAttribute("aria-expanded","false");switcher.classList.remove("is-open");}}});document.addEventListener("keydown",event=>{if(event.key==="Escape"&&switcher?.classList.contains("is-open")){switcher.querySelector(".language-popover").hidden=true;switcher.querySelector(".language-trigger")?.setAttribute("aria-expanded","false");switcher.classList.remove("is-open");switcher.querySelector(".language-trigger")?.focus();}});}
    host.appendChild(switcher);
    updateSwitcher();
    return switcher;
  }

  function setLanguage(language, remember = false) {
    if (!SUPPORTED.includes(language)) return;
    currentLanguage = language;
    if (remember) storeLanguage(language);
    updateDocumentMetadata(language);
    ensureSwitcher();
    updateSwitcher();
    window.dispatchEvent(new CustomEvent("pvl:languagechange", { detail: { language } }));
    translateSubtree(document.body);
  }

  function start() {
    currentLanguage = detectLanguage();
    ensureSwitcher();
    setLanguage(currentLanguage, false);
    if (!document.body) return;
    observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (isInsideSwitcher(mutation.target)) continue;
        if (mutation.type === "characterData") translateTextNode(mutation.target);
        if (mutation.type === "attributes") translateAttributes(mutation.target);
        for (const node of mutation.addedNodes || []) translateSubtree(node);
      }
      // A newly rendered application header may require the switcher to be
      // created or moved. Never rewrite an already connected switcher from
      // inside this observer: those writes generate more observed mutations
      // and can otherwise starve the browser's main thread.
      if (!switcher?.isConnected) ensureSwitcher();
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-label", "title", "placeholder"]
    });
    window.PhysicsVisualLabLanguage = {
      get language() { return currentLanguage; },
      set: language => setLanguage(language, true),
      detect: detectLanguage
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
