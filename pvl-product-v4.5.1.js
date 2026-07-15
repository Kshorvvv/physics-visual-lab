/* Physics Visual Lab · Product pass v4.5.0 */
(() => {
  "use strict";
  const VERSION = "4.5.1";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  let queued = false;
  let heroRAF = 0;
  let heroCanvas = null;
  let heroStart = performance.now();
  let waveMode = "transient";
  let waveCache = {signature:"",mode:"",data:null,error:""};
  let waveRAF = 0;
  let dragType = "";

  function lang(){
    const v=(document.documentElement.lang||"zh").toLowerCase();
    return v.startsWith("zh")?"zh":v.startsWith("ja")?"ja":v.startsWith("ko")?"ko":"en";
  }
  function copy(){
    const c={
      zh:{badge:"量子动力学 · 测量链",live:"LIVE PHYSICS",a:"连续演化",as:"相位与方向随时间平滑变化",b:"相互作用",bs:"磁场梯度把内部态映射为空间轨迹",c:"离散读出",cs:"单次事件落入 +ℏ/2 或 −ℏ/2",workbench:"可搭建 · 可测量 · 可解释",build:"搭建",connect:"接线",probe:"放置探针",run:"运行与读图",scope:"示波器",bode:"Bode",energy:"储能",probeNode:"探测节点",runNow:"运行",presets:"快速实验",manual:"说明",component:"添加元件",node:"添加节点",newCircuit:"新建",connectTitle:"连接元件",connectHint:"选择元件两端节点与参数。相同节点名表示电气连接。",cancel:"取消",apply:"应用",value:"参数",terminal1:"端点 1",terminal2:"端点 2",ready:"就绪",simulating:"求解中",noData:"暂无可绘制数据"},
      en:{badge:"QUANTUM DYNAMICS · MEASUREMENT CHAIN",live:"LIVE PHYSICS",a:"Continuous evolution",as:"phase and direction evolve smoothly",b:"Interaction",bs:"a field gradient maps internal state to a path",c:"Discrete readout",cs:"one event lands in +ℏ/2 or −ℏ/2",workbench:"BUILD · PROBE · EXPLAIN",build:"Build",connect:"Connect",probe:"Place probe",run:"Run & inspect",scope:"Scope",bode:"Bode",energy:"Energy",probeNode:"Probe node",runNow:"Run",presets:"Quick labs",manual:"Guide",component:"Add component",node:"Add node",newCircuit:"New",connectTitle:"Connect component",connectHint:"Choose both terminal nodes and the component value.",cancel:"Cancel",apply:"Apply",value:"Value",terminal1:"Terminal 1",terminal2:"Terminal 2",ready:"Ready",simulating:"Solving",noData:"No plottable data"}
    };return c[lang()]||c.en;
  }

  /* ---------- premium animated hero ---------- */
  function installHero(){
    const host=document.querySelector(".pvl-home-visual");
    if(!host||host.dataset.pvl45===VERSION)return;
    host.dataset.pvl45=VERSION;
    host.className="pvl-home-visual pvl45-hero";
    host.removeAttribute("aria-hidden");
    const c=copy();
    host.innerHTML=`<canvas aria-label="${esc(c.a)} → ${esc(c.b)} → ${esc(c.c)}"></canvas>
      <div class="pvl45-hero-overlay">
        <div class="pvl45-hero-topline"><span class="pvl45-hero-badge"><i></i>${esc(c.badge)}</span><span class="pvl45-hero-live">${esc(c.live)}</span></div>
        <div class="pvl45-hero-caption" aria-hidden="true">
          <div><small>01</small><span><b>EVOLUTION</b><strong>${esc(c.a)}</strong><em>${esc(c.as)}</em></span></div>
          <div><small>02</small><span><b>INTERACTION</b><strong>${esc(c.b)}</strong><em>${esc(c.bs)}</em></span></div>
          <div><small>03</small><span><b>READOUT</b><strong>${esc(c.c)}</strong><em>${esc(c.cs)}</em></span></div>
        </div>
      </div>`;
    heroCanvas=host.querySelector("canvas");
    heroStart=performance.now();
    resizeHero();
    if(!heroRAF)heroRAF=requestAnimationFrame(drawHero);
  }
  function resizeHero(){
    if(!heroCanvas)return;
    const r=heroCanvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
    const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));
    if(heroCanvas.width!==w||heroCanvas.height!==h){heroCanvas.width=w;heroCanvas.height=h;}
  }
  function line(ctx,x1,y1,x2,y2,color,width=1,dash=[]){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
  function rounded(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
  function arrow(ctx,x1,y1,x2,y2,color,width=2){line(ctx,x1,y1,x2,y2,color,width);const a=Math.atan2(y2-y1,x2-x1),s=7;ctx.save();ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-s*Math.cos(a-.55),y2-s*Math.sin(a-.55));ctx.lineTo(x2-s*Math.cos(a+.55),y2-s*Math.sin(a+.55));ctx.closePath();ctx.fill();ctx.restore();}
  function drawHero(now){
    if(!heroCanvas||!heroCanvas.isConnected){heroRAF=0;return;}
    resizeHero();
    const ctx=heroCanvas.getContext("2d"),dpr=Math.min(2,window.devicePixelRatio||1),W=heroCanvas.width/dpr,H=heroCanvas.height/dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const t=(now-heroStart)/1000;
    const compact=W<560;
    const artTop=H*(compact?.15:.12),artBottom=H*(compact?.72:.76),artH=artBottom-artTop;
    // calm instrument grid
    const step=Math.max(30,W/12);for(let x=0;x<W;x+=step)line(ctx,x,0,x,H,"rgba(107,181,190,.055)");for(let y=0;y<H;y+=step)line(ctx,0,y,W,y,"rgba(107,181,190,.055)");
    line(ctx,W*.355,artTop,W*.355,artBottom,"rgba(130,219,224,.12)");line(ctx,W*.69,artTop,W*.69,artBottom,"rgba(130,219,224,.12)");
    // 01: continuous unit-vector precession. Tip remains on a fixed cone.
    const cx=W*.19,cy=artTop+artH*.48,R=Math.min(W*.145,artH*.34),theta=.73,phi=t*.92,tilt=.30;
    ctx.save();ctx.translate(cx,cy);
    const glow=ctx.createRadialGradient(0,0,0,0,0,R*1.25);glow.addColorStop(0,"rgba(63,189,200,.09)");glow.addColorStop(1,"rgba(63,189,200,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,R*1.25,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="rgba(130,219,224,.25)";ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,0,R,R*tilt,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([5,7]);ctx.beginPath();ctx.ellipse(0,0,R*.47,R,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    arrow(ctx,-R*1.08,0,R*1.08,0,"rgba(130,219,224,.30)",1.1);arrow(ctx,0,R*1.08,0,-R*1.08,"rgba(130,219,224,.52)",1.35);
    // fixed cone circle: projected horizontal ellipse centred at z = R cos(theta)
    const coneY=-R*Math.cos(theta),coneRX=R*Math.sin(theta),coneRY=coneRX*tilt;
    ctx.strokeStyle="rgba(239,197,116,.30)";ctx.lineWidth=1.7;ctx.beginPath();ctx.ellipse(0,coneY,coneRX,coneRY,0,0,Math.PI*2);ctx.stroke();
    const vx=coneRX*Math.cos(phi),vy=coneY+coneRY*Math.sin(phi);
    arrow(ctx,0,0,vx,vy,"#efc574",4);ctx.fillStyle="#efc574";ctx.shadowColor="#efc574";ctx.shadowBlur=17;ctx.beginPath();ctx.arc(vx,vy,5.2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle="rgba(157,182,190,.72)";ctx.font=`600 ${Math.max(9,W*.009)}px ui-monospace`;ctx.textAlign="left";ctx.fillText("B ∥ z",8,-R*1.02);ctx.restore();
    // 02: source and Stern–Gerlach interaction region
    const sx=W*.405,sy=artTop+artH*.49,magX=W*.535,magW=W*.105,magH=artH*.42;
    rounded(ctx,sx-R*.20,sy-R*.20,R*.40,R*.40,8,"rgba(10,28,38,.92)","rgba(130,219,224,.28)");ctx.fillStyle="#82dbe0";ctx.beginPath();ctx.arc(sx,sy,5,0,Math.PI*2);ctx.fill();
    arrow(ctx,sx+R*.23,sy,magX-magW*.58,sy,"rgba(130,219,224,.82)",2);
    ctx.save();ctx.fillStyle="rgba(12,28,39,.96)";ctx.strokeStyle="rgba(130,219,224,.28)";ctx.lineWidth=1.2;
    ctx.beginPath();ctx.roundRect(magX-magW/2,sy-magH*.62,magW,magH*.45,5);ctx.fill();ctx.stroke();ctx.beginPath();ctx.roundRect(magX-magW/2,sy+magH*.17,magW,magH*.45,5);ctx.fill();ctx.stroke();
    ctx.fillStyle="#a9bbc2";ctx.font=`700 ${Math.max(10,W*.011)}px ui-monospace`;ctx.textAlign="center";ctx.fillText("N",magX,sy-magH*.37);ctx.fillText("S",magX,sy+magH*.44);ctx.restore();
    // Magnetic field in the gap points N -> S (downward); gradient is indicated separately.
    arrow(ctx,magX-magW*.23,sy-magH*.20,magX-magW*.23,sy+magH*.22,"rgba(239,197,116,.78)",1.5);
    ctx.save();ctx.translate(magX+magW*.30,sy);ctx.rotate(-Math.PI/2);ctx.fillStyle="rgba(141,164,173,.72)";ctx.font=`600 ${Math.max(8,W*.008)}px ui-monospace`;ctx.textAlign="center";ctx.fillText("∂Bz / ∂z ≠ 0",0,0);ctx.restore();
    // split trajectories and animated individual arrivals
    const splitX=magX+magW*.52,detX=W*.758,upY=sy-artH*.23,dnY=sy+artH*.23;
    ctx.save();ctx.strokeStyle="rgba(130,219,224,.78)";ctx.lineWidth=2.05;ctx.beginPath();ctx.moveTo(splitX,sy);ctx.bezierCurveTo(splitX+W*.045,sy,detX-W*.05,upY,detX,upY);ctx.stroke();ctx.beginPath();ctx.moveTo(splitX,sy);ctx.bezierCurveTo(splitX+W*.045,sy,detX-W*.05,dnY,detX,dnY);ctx.stroke();ctx.restore();
    const phase=(t*.38)%1;for(const sign of [-1,1]){const q=(phase+(sign>0?.48:0))%1,bx=(1-q)**3*splitX+3*(1-q)**2*q*(splitX+W*.045)+3*(1-q)*q*q*(detX-W*.05)+q**3*detX;const target=sign<0?upY:dnY;const by=(1-q)**3*sy+3*(1-q)**2*q*sy+3*(1-q)*q*q*target+q**3*target;ctx.fillStyle="#efc574";ctx.shadowColor="#efc574";ctx.shadowBlur=15;ctx.beginPath();ctx.arc(bx,by,4.8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    // 03: detector channels. A single hit is shown; the trace accumulates in time.
    const rx=W*.758,rw=W*.19,rh=artH*.27;
    function detector(y,label,phaseShift){
      rounded(ctx,rx,y,rw,rh,8,"rgba(8,18,27,.80)","rgba(130,219,224,.22)");line(ctx,rx,y,rx,y+rh,"#82dbe0",3);
      ctx.fillStyle="#b9c9cf";ctx.font=`italic ${Math.max(13,W*.015)}px Georgia`;ctx.textAlign="left";ctx.fillText(label,rx+16,y+25);
      const base=y+rh*.72,segments=7,pulse=(Math.floor(t*1.1+phaseShift)%segments+segments)%segments;ctx.strokeStyle="rgba(130,219,224,.36)";ctx.lineWidth=1.25;ctx.beginPath();ctx.moveTo(rx+18,base);for(let i=0;i<segments;i++){const xx=rx+18+i*(rw-36)/(segments-1),yy=base-(i===pulse?rh*.27:(i===pulse-1?rh*.09:0));ctx.lineTo(xx,yy);}ctx.stroke();
      const hitX=rx+rw*.73,hitY=y+rh*.56;ctx.fillStyle="#efc574";ctx.shadowColor="#efc574";ctx.shadowBlur=12;ctx.beginPath();ctx.arc(hitX,hitY,5.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    }
    detector(upY-rh/2,"+ ℏ / 2",0);detector(dnY-rh/2,"− ℏ / 2",3);
    heroRAF=requestAnimationFrame(drawHero);
  }

  /* ---------- deterministic SVG mathematics ---------- */
  function formulaSvg(kind){
    const common=`class="pvl45-math-svg" role="img" preserveAspectRatio="xMidYMid meet"`;
    if(kind==="motion")return `<svg ${common} viewBox="0 0 760 118" aria-label="m x double dot plus b x dot plus k x equals F naught cosine omega t"><text x="380" y="76" text-anchor="middle" font-size="48">mẍ + bẋ + kx = F₀ cos(ωt)</text></svg>`;
    if(kind==="omega0")return `<svg ${common} viewBox="0 0 650 150" aria-label="omega naught equals square root of k over m"><text x="85" y="97" font-size="58">ω₀ =</text><path class="stroke" d="M235 79 L253 99 L278 35 L520 35"/><text x="398" y="69" text-anchor="middle" font-size="46">k</text><line class="stroke fracline" x1="345" y1="79" x2="451" y2="79"/><text x="398" y="128" text-anchor="middle" font-size="46">m</text></svg>`;
    if(kind==="trial")return `<svg ${common} viewBox="0 0 760 125" aria-label="x of t equals real part of X e to i omega t"><text x="380" y="82" text-anchor="middle" font-size="48">x(t) = Re[ X e</text><text x="552" y="52" font-size="29">iωt</text><text x="608" y="82" font-size="48">]</text></svg>`;
    if(kind==="complex")return `<svg ${common} viewBox="0 0 820 160" aria-label="X equals F naught divided by k minus m omega squared plus i b omega"><text x="92" y="98" font-size="55">X =</text><text x="455" y="55" text-anchor="middle" font-size="45">F₀</text><line class="stroke fracline" x1="250" y1="70" x2="680" y2="70"/><text x="465" y="128" text-anchor="middle" font-size="43">k − mω² + ibω</text></svg>`;
    if(kind==="amplitude")return `<svg ${common} viewBox="0 0 900 190" aria-label="A of omega equals F naught divided by square root of open parenthesis k minus m omega squared close parenthesis squared plus open parenthesis b omega close parenthesis squared"><text x="70" y="116" font-size="51">A(ω) =</text><text x="540" y="48" text-anchor="middle" font-size="42">F₀</text><line class="stroke fracline" x1="300" y1="63" x2="780" y2="63"/><path class="stroke" d="M326 125 L344 143 L368 88 L780 88"/><text x="580" y="137" text-anchor="middle" font-size="38">(k − mω²)² + (bω)²</text></svg>`;
    if(kind==="phase")return `<svg ${common} viewBox="0 0 820 126" aria-label="delta of omega equals atan2 of b omega comma k minus m omega squared"><text x="410" y="82" text-anchor="middle" font-size="47">δ(ω) = atan2(bω, k − mω²)</text></svg>`;
    if(kind==="resonance")return `<svg ${common} viewBox="0 0 940 180" aria-label="omega r equals square root of omega naught squared minus b squared over two m squared"><text x="62" y="112" font-size="56">ωᵣ =</text><path class="stroke" d="M230 96 L249 116 L276 39 L850 39"/><text x="335" y="102" font-size="48">ω₀² −</text><text x="650" y="75" text-anchor="middle" font-size="42">b²</text><line class="stroke fracline" x1="590" y1="88" x2="710" y2="88"/><text x="650" y="138" text-anchor="middle" font-size="42">2m²</text></svg>`;
    return "";
  }
  function installOscillatorMath(){
    const title=(document.querySelector("#pvl-dialog-title")?.textContent||"").replace(/\s+/g,"");
    if(!/受迫阻尼振子|DrivenDampedOscillator|強制減衰振動子/.test(title))return;
    const steps=[...document.querySelectorAll(".pvl-dialog-content .theory-step")];
    if(!steps.length)return;
    const kinds=[["motion","omega0"],["trial","complex"],["amplitude","phase"],["resonance"]];
    steps.forEach((step,i)=>{
      const blocks=[...step.querySelectorAll(".theory-equation")];
      blocks.forEach((block,j)=>{const kind=kinds[i]?.[j];if(kind&&block.dataset.pvl45Math!==kind){block.innerHTML=formulaSvg(kind);block.dataset.pvl45Math=kind;}});
    });
    // fallback matches for any shuffled translations
    document.querySelectorAll(".pvl-dialog-content .theory-equation").forEach(block=>{
      if(block.dataset.pvl45Math)return;const s=(block.textContent||"").replace(/\s+/g,"");let kind="";
      if(/atan2/.test(s))kind="phase";else if(/ω[rᵣ].*[√]/.test(s)||(/共振/.test(block.parentElement?.textContent||"")&&/ω/.test(s)))kind="resonance";else if(/^x\(t\)=Re/.test(s))kind="trial";else if(/^X=/.test(s))kind="complex";else if(/^A\(ω\)=/.test(s))kind="amplitude";else if(/ω[0₀]=√/.test(s))kind="omega0";else if(/m.*[ẍx].*b.*[ẋx].*kx/.test(s))kind="motion";
      if(kind){block.innerHTML=formulaSvg(kind);block.dataset.pvl45Math=kind;}
    });
  }

  /* ---------- circuit workspace ---------- */
  function circuitAPI(){return window.PVLCircuitWorkbench;}
  function circuitState(){try{return circuitAPI()?.getState?.()||null;}catch{return null;}}
  function stateSig(s){try{return JSON.stringify([s.nodes,s.components,s.analysis]);}catch{return "";}}
  function clickAction(selector){const el=document.querySelector(selector);el?.click();return !!el;}
  function nextComponentName(state,type){const T=circuitAPI()?.__test?.TYPES?.[type],prefix=T?.prefix||"X",used=new Set((state.components||[]).map(c=>c.name||c.id));let i=1;while(used.has(`${prefix}${i}`))i++;return `${prefix}${i}`;}
  function addComponentDirect(type){
    const api=circuitAPI(),state=circuitState(),T=api?.__test?.TYPES?.[type];if(!api||!state||!T)return;
    const ids=(state.nodes||[]).map(n=>String(n.id));if(!ids.length)return;
    const name=nextComponentName(state,type),terminals=T.terminals||2,nodes=Array.from({length:terminals},(_,i)=>ids[Math.min(i,ids.length-1)]||"0");if(nodes.length>1&&nodes[0]===nodes[1])nodes[1]=ids.find(x=>x!==nodes[0])||"0";
    state.components.push({id:name,name,type,nodes,value:T.value??"1k",...Object.fromEntries(["frequency","offset","phase","state","rating","n","beta","vth","lambda","saturation"].filter(k=>T[k]!=null).map(k=>[k,T[k]]))});state.selected=name;api.load(state);setTimeout(()=>openConnectWizard(name),80);
  }
  function openConnectWizard(id){
    document.querySelector(".pvl45-connect-popover")?.remove();const api=circuitAPI(),state=circuitState(),comp=state?.components?.find(c=>c.id===id||c.name===id);if(!api||!state||!comp)return;
    const c=copy(),nodes=(state.nodes||[]).map(n=>`<option value="${esc(n.id)}">${esc(n.label||n.id)} · ${esc(n.id)}</option>`).join("");
    const terminalFields=(comp.nodes||[]).map((nodeId,i)=>`<label>${esc(c.terminal1.replace("1",String(i+1)))}<select data-terminal="${i}">${nodes}</select></label>`).join("");
    const pop=document.createElement("div");pop.className="pvl45-connect-popover";pop.style.left=`${Math.max(12,Math.min(innerWidth-372,innerWidth*.5-180))}px`;pop.style.top=`${Math.max(12,Math.min(innerHeight-420,innerHeight*.28))}px`;
    pop.innerHTML=`<h3>${esc(c.connectTitle)} · ${esc(comp.name||comp.id)}</h3><p>${esc(c.connectHint)}</p><div class="pvl45-connect-grid">${terminalFields}<label class="pvl45-value-field">${esc(c.value)}<input data-value value="${esc(comp.value)}"></label></div><div class="pvl45-connect-actions"><button data-cancel>${esc(c.cancel)}</button><button class="primary" data-apply>${esc(c.apply)}</button></div>`;
    document.body.appendChild(pop);(comp.nodes||[]).forEach((nodeId,i)=>{const el=pop.querySelector(`[data-terminal="${i}"]`);if(el)el.value=nodeId??"0";});
    pop.querySelector("[data-cancel]").onclick=()=>pop.remove();pop.querySelector("[data-apply]").onclick=()=>{const s=circuitState(),x=s.components.find(q=>q.id===comp.id);if(x){(x.nodes||[]).forEach((_,i)=>{const el=pop.querySelector(`[data-terminal="${i}"]`);if(el)x.nodes[i]=el.value;});x.value=pop.querySelector("[data-value]").value||x.value;s.selected=x.id;api.load(s);}pop.remove();setTimeout(()=>refreshWave(true),120);};
  }

  function installCircuitWorkspace(){
    const stage=document.querySelector(".cw-stage");if(!stage||stage.parentElement?.querySelector(":scope > .pvl45-circuit-shell"))return;
    // A rebuilt stage must never inherit a stale tab from the previous route/render.
    waveMode="transient";waveCache={signature:"",mode:"",data:null,error:""};
    const c=copy(),shell=document.createElement("section");shell.className="pvl45-circuit-shell";
    shell.innerHTML=`<div class="pvl45-circuit-head"><div class="pvl45-circuit-head-left"><span>ENGINEERING WORKSPACE</span><strong>${esc(c.workbench)}</strong></div><div class="pvl45-circuit-actions"><button data-pvl45-guide>${esc(c.manual)}</button><button data-pvl45-new>${esc(c.newCircuit)}</button><button class="primary" data-pvl45-run>${esc(c.runNow)}</button></div></div>
      <div class="pvl45-build-flow"><div><b>01 · ${esc(c.build)}</b><span>元件 / COMPONENTS</span></div><div><b>02 · ${esc(c.connect)}</b><span>节点 / NETS</span></div><div><b>03 · ${esc(c.probe)}</b><span>选择 V(node)</span></div><div><b>04 · ${esc(c.run)}</b><span>TRAN · AC · ENERGY</span></div></div>
      <div class="pvl45-toolstrip"><button class="pvl45-tool" data-tool="node"><i>•</i>${esc(c.node)}</button><button class="pvl45-tool" data-tool="resistor"><i>R</i>电阻</button><button class="pvl45-tool" data-tool="capacitor"><i>C</i>电容</button><button class="pvl45-tool" data-tool="inductor"><i>L</i>电感</button><button class="pvl45-tool" data-tool="vdc"><i>V</i>直流源</button><button class="pvl45-tool" data-tool="vsin"><i>~</i>正弦源</button><button class="pvl45-tool" data-tool="diode"><i>D</i>二极管</button><button class="pvl45-tool" data-tool="opamp"><i>U</i>运放</button></div>
      <div class="pvl45-presetbar"><span>${esc(c.presets)}</span><button class="pvl45-preset" data-preset="divider">分压器</button><button class="pvl45-preset" data-preset="rc">RC 充放电</button><button class="pvl45-preset" data-preset="rlc">RLC 谐振</button><button class="pvl45-preset" data-preset="rectifier">整流滤波</button><button class="pvl45-preset" data-preset="opamp">运放增益</button></div>
      <div class="pvl45-wave-dock"><div class="pvl45-wave-toolbar"><div class="pvl45-wave-tabs"><button data-wave="transient" class="active">${esc(c.scope)}</button><button data-wave="bode">${esc(c.bode)}</button><button data-wave="energy">${esc(c.energy)}</button></div><div class="pvl45-wave-controls"><label>${esc(c.probeNode)} <select data-pvl45-probe></select></label><span class="pvl45-wave-status">${esc(c.ready)}</span></div></div><div class="pvl45-wave-legend" aria-live="polite"></div><div class="pvl45-wave-canvas-wrap"><canvas class="pvl45-wave-canvas"></canvas></div></div>`;
    stage.insertAdjacentElement("afterend",shell);
    shell.querySelector("[data-pvl45-run]").onclick=()=>{clickAction('[data-cw-action="run"]');refreshWave(true);};
    shell.querySelector("[data-pvl45-new]").onclick=()=>{clickAction('[data-cw-action="new"]');setTimeout(()=>refreshWave(true),120);};
    shell.querySelector("[data-pvl45-guide]").onclick=()=>document.querySelector(".pvl-circuit-guide-button")?.click();
    shell.querySelectorAll("[data-tool]").forEach(btn=>btn.onclick=()=>{const type=btn.dataset.tool;if(type==="node")clickAction('[data-cw-action="add-node"]');else addComponentDirect(type);setTimeout(()=>refreshWave(true),150);});
    shell.querySelectorAll("[data-preset]").forEach(btn=>btn.onclick=()=>{shell.querySelectorAll("[data-preset]").forEach(x=>x.classList.toggle("active",x===btn));clickAction(`[data-cw-preset="${btn.dataset.preset}"]`);setTimeout(()=>refreshWave(true),180);});
    shell.querySelectorAll("[data-wave]").forEach(btn=>btn.onclick=()=>{waveMode=btn.dataset.wave;shell.querySelectorAll("[data-wave]").forEach(x=>x.classList.toggle("active",x===btn));refreshWave(true);});
    updateProbeSelect();makePaletteDraggable();refreshWave(true);
  }

  function updateProbeSelect(){
    const select=document.querySelector("[data-pvl45-probe]"),state=circuitState();if(!select||!state)return;const sig=JSON.stringify([state.nodes,state.analysis?.probe]);if(select.dataset.sig===sig)return;select.dataset.sig=sig;select.innerHTML=(state.nodes||[]).map(n=>`<option value="${esc(n.id)}">${esc(n.label||n.id)}</option>`).join("");select.value=state.analysis?.probe||state.nodes?.find(n=>String(n.id)!=="0")?.id||"0";select.onchange=()=>{const s=circuitState();s.analysis.probe=select.value;circuitAPI().load(s);refreshWave(true);};
  }
  function makePaletteDraggable(){
    document.querySelectorAll("[data-cw-add]").forEach(el=>{if(el.dataset.pvl45Drag)return;el.dataset.pvl45Drag="1";el.draggable=true;el.addEventListener("dragstart",e=>{dragType=el.dataset.cwAdd||"";e.dataTransfer?.setData("text/plain",dragType);});});
    const wrap=document.querySelector(".cw-schematic-wrap");if(!wrap||wrap.dataset.pvl45Drop)return;wrap.dataset.pvl45Drop="1";wrap.addEventListener("dragover",e=>{e.preventDefault();wrap.classList.add("pvl45-drop-active")});wrap.addEventListener("dragleave",()=>wrap.classList.remove("pvl45-drop-active"));wrap.addEventListener("drop",e=>{e.preventDefault();wrap.classList.remove("pvl45-drop-active");const type=e.dataTransfer?.getData("text/plain")||dragType;if(type)addComponentDirect(type);dragType="";});
  }
  function complexParts(z){if(typeof z==="number")return [z,0];return [Number(z?.re)||0,Number(z?.im)||0];}
  function probeComplex(result,state){const [ar,ai]=complexParts(result.nodeVoltages?.[state.analysis.probe]);const [br,bi]=complexParts(result.nodeVoltages?.[state.analysis.reference||"0"]);return [ar-br,ai-bi];}
  function computeWave(){
    const api=circuitAPI()?.__test,state=circuitState();if(!api||!state)throw new Error("solver unavailable");
    if(waveMode==="transient"){const a={...state.analysis,mode:"transient",duration:state.analysis.duration||"20m",dt:state.analysis.dt||"50u"};const r=api.simulateTransient(state,a);return {series:[{name:`V(${a.probe})`,points:r.series,color:"cyan"}],xLabel:"t",yLabel:"V"};}
    if(waveMode==="bode"){const bias=api.solveDC(state),pts=[],phase=[];for(let i=0;i<140;i++){const f=10*Math.pow(5*i/139),r=api.solveACAt(state,f,bias),[re,im]=probeComplex(r,state),mag=20*Math.log10(Math.max(1e-12,Math.hypot(re,im)));pts.push({x:Math.log10(f),y:mag});phase.push({x:Math.log10(f),y:Math.atan2(im,re)*180/Math.PI});}return {series:[{name:"Magnitude / dB",points:pts,color:"cyan"},{name:"Phase / °",points:phase,color:"warm",axis:"right"}],xLabel:"log₁₀ f",yLabel:"dB / °"};}
    const parse=api.parseEngineering,duration=Math.max(1e-6,parse(state.analysis.duration,.02)),steps=260,dt=duration/steps,cap=[],ind=[],total=[];let previous={voltages:{},currents:{}};
    for(let i=0;i<=steps;i++){const time=i*dt,last=api.solveDC(state,{mode:"transient",time,dt,previous});let ec=0,el=0;for(const comp of state.components){if(comp.type==="capacitor"){const C=parse(comp.value,0),v=(last.nodeVoltages[comp.nodes[0]]||0)-(last.nodeVoltages[comp.nodes[1]]||0);ec+=.5*C*v*v;}if(comp.type==="inductor"){const L=parse(comp.value,0),cur=last.currents[comp.id]||0;el+=.5*L*cur*cur;}}cap.push({x:time,y:ec});ind.push({x:time,y:el});total.push({x:time,y:ec+el});previous={voltages:Object.fromEntries(state.components.filter(c=>c.type==="capacitor").map(c=>[c.id,(last.nodeVoltages[c.nodes[0]]||0)-(last.nodeVoltages[c.nodes[1]]||0)])),currents:Object.fromEntries(state.components.filter(c=>c.type==="inductor").map(c=>[c.id,last.currents[c.id]||0]))};}
    return {series:[{name:"E_C",points:cap,color:"cyan"},{name:"E_L",points:ind,color:"warm"},{name:"E_total",points:total,color:"muted"}],xLabel:"t",yLabel:"J"};
  }
  function refreshWave(force=false){
    const canvas=document.querySelector(".pvl45-wave-canvas"),status=document.querySelector(".pvl45-wave-status"),state=circuitState();if(!canvas||!state)return;updateProbeSelect();const sig=stateSig(state);if(!force&&waveCache.signature===sig&&waveCache.mode===waveMode){drawWave();return;}if(status)status.textContent=copy().simulating;
    setTimeout(()=>{try{waveCache={signature:sig,mode:waveMode,data:computeWave(),error:""};if(status)status.textContent=`${waveMode.toUpperCase()} · ${waveCache.data.series.reduce((n,s)=>n+s.points.length,0)} pts`;}catch(err){waveCache={signature:sig,mode:waveMode,data:null,error:String(err?.message||err)};if(status)status.textContent=`ERROR · ${waveCache.error}`;}drawWave();},20);
  }
  function drawWave(){
    cancelAnimationFrame(waveRAF);waveRAF=requestAnimationFrame(()=>{
      const canvas=document.querySelector(".pvl45-wave-canvas"),wrap=canvas?.parentElement,legend=document.querySelector(".pvl45-wave-legend");if(!canvas||!wrap)return;
      const r=wrap.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),W=Math.max(1,Math.round(r.width*dpr)),H=Math.max(1,Math.round(r.height*dpr));if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
      const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);const w=W/dpr,h=H/dpr;ctx.clearRect(0,0,w,h);ctx.fillStyle="#050a10";ctx.fillRect(0,0,w,h);
      const pad={l:58,r:waveMode==="bode"?54:24,t:24,b:38};for(let i=0;i<=8;i++)line(ctx,pad.l+(w-pad.l-pad.r)*i/8,pad.t,pad.l+(w-pad.l-pad.r)*i/8,h-pad.b,"rgba(130,219,224,.055)");for(let i=0;i<=5;i++)line(ctx,pad.l,pad.t+(h-pad.t-pad.b)*i/5,w-pad.r,pad.t+(h-pad.t-pad.b)*i/5,"rgba(130,219,224,.055)");
      const data=waveCache.data;if(!data?.series?.length){ctx.fillStyle="#718791";ctx.font="12px system-ui";ctx.textAlign="center";ctx.fillText(copy().noData,w/2,h/2);if(legend)legend.innerHTML="";return;}
      const valid=s=>s.points.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)),leftSeries=data.series.filter(s=>s.axis!=="right"),rightSeries=data.series.filter(s=>s.axis==="right"),allX=data.series.flatMap(valid).map(p=>p.x);if(!allX.length)return;
      const xmin=Math.min(...allX),xmax=Math.max(...allX),range=(series)=>{const ys=series.flatMap(valid).map(p=>p.y);if(!ys.length)return {min:-1,max:1,span:2};let min=Math.min(...ys),max=Math.max(...ys);if(Math.abs(max-min)<1e-12){const d=Math.max(1e-9,Math.abs(max)*.08||1);min-=d;max+=d;}const margin=(max-min)*.08;return {min:min-margin,max:max+margin,span:(max-min)+2*margin};},L=range(leftSeries),R=range(rightSeries);
      line(ctx,pad.l,h-pad.b,w-pad.r,h-pad.b,"rgba(130,219,224,.25)");line(ctx,pad.l,pad.t,pad.l,h-pad.b,"rgba(130,219,224,.25)");if(rightSeries.length)line(ctx,w-pad.r,pad.t,w-pad.r,h-pad.b,"rgba(239,197,116,.23)");
      const colors={cyan:"#82dbe0",warm:"#efc574",muted:"#80949e"};for(const s of data.series){const scale=s.axis==="right"?R:L;ctx.strokeStyle=colors[s.color]||colors.cyan;ctx.lineWidth=s.color==="muted"?1.35:2;ctx.setLineDash(s.color==="muted"?[5,5]:[]);ctx.beginPath();valid(s).forEach((p,i)=>{const x=pad.l+(p.x-xmin)/Math.max(1e-12,xmax-xmin)*(w-pad.l-pad.r),y=h-pad.b-(p.y-scale.min)/scale.span*(h-pad.t-pad.b);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();}ctx.setLineDash([]);
      ctx.font="10px ui-monospace";ctx.fillStyle="#6d838e";ctx.textAlign="left";ctx.fillText(`${L.max.toPrecision(3)}`,8,pad.t+4);ctx.fillText(`${L.min.toPrecision(3)}`,8,h-pad.b);if(rightSeries.length){ctx.fillStyle="#a98c57";ctx.textAlign="right";ctx.fillText(`${R.max.toPrecision(3)}°`,w-7,pad.t+4);ctx.fillText(`${R.min.toPrecision(3)}°`,w-7,h-pad.b);}ctx.fillStyle="#6d838e";ctx.textAlign="right";ctx.fillText(data.xLabel,w-pad.r,h-12);
      if(legend)legend.innerHTML=data.series.map(s=>`<span><i style="background:${colors[s.color]||colors.cyan}"></i><b>${esc(s.name)}</b></span>`).join("");
    });
  }


  function pass(){queued=false;installHero();installOscillatorMath();installCircuitWorkspace();updateProbeSelect();makePaletteDraggable();const s=circuitState();if(s&&waveCache.signature!==stateSig(s))refreshWave();}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(pass);}
  function start(){schedule();const mo=new MutationObserver(schedule);mo.observe(document.body,{childList:true,subtree:true});addEventListener("hashchange",schedule);addEventListener("resize",()=>{resizeHero();drawWave();});addEventListener("pvl:languagechange",()=>{document.querySelector(".pvl-home-visual")?.removeAttribute("data-pvl45");schedule();});setInterval(()=>{if(document.querySelector(".cw-stage"))refreshWave();},1200);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
