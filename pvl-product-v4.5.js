/* Physics Visual Lab · Product pass v4.5.0 */
(() => {
  "use strict";
  const VERSION = "4.5.0";
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
      <div class="pvl45-hero-overlay"><div class="pvl45-hero-topline"><span class="pvl45-hero-badge"><i></i>${esc(c.badge)}</span><span class="pvl45-hero-live">${esc(c.live)}</span></div>
      <div class="pvl45-hero-caption"><div><small>01 · EVOLUTION</small><strong>${esc(c.a)}</strong><span>${esc(c.as)}</span></div><div><small>02 · INTERACTION</small><strong>${esc(c.b)}</strong><span>${esc(c.bs)}</span></div><div><small>03 · READOUT</small><strong>${esc(c.c)}</strong><span>${esc(c.cs)}</span></div></div></div>`;
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
    // grid
    ctx.save();ctx.strokeStyle="rgba(107,181,190,.07)";ctx.lineWidth=1;
    const step=Math.max(34,W/12);for(let x=0;x<W;x+=step)line(ctx,x,0,x,H,"rgba(107,181,190,.065)");for(let y=0;y<H;y+=step)line(ctx,0,y,W,y,"rgba(107,181,190,.065)");ctx.restore();
    const top=H*.18,bottom=H*.76;
    // separators
    line(ctx,W*.36,top*.75,W*.36,bottom,"rgba(130,219,224,.13)");line(ctx,W*.69,top*.75,W*.69,bottom,"rgba(130,219,224,.13)");
    // left Bloch/precession sphere
    const cx=W*.19,cy=H*.46,R=Math.min(W*.15,H*.19),theta=.72,phi=t*.95;
    ctx.save();ctx.translate(cx,cy);
    const glow=ctx.createRadialGradient(0,0,0,0,0,R*1.25);glow.addColorStop(0,"rgba(63,189,200,.10)");glow.addColorStop(1,"rgba(63,189,200,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,R*1.25,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="rgba(130,219,224,.25)";ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,0,R,R*.34,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([5,7]);ctx.beginPath();ctx.ellipse(0,0,R*.47,R,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    arrow(ctx,-R*1.08,0,R*1.08,0,"rgba(130,219,224,.34)",1.2);arrow(ctx,0,R*1.08,0,-R*1.08,"rgba(130,219,224,.50)",1.4);
    // trail
    ctx.strokeStyle="rgba(239,197,116,.42)";ctx.lineWidth=1.8;ctx.beginPath();for(let i=0;i<80;i++){const p=phi-i*.035,px=R*Math.sin(theta)*Math.cos(p),py=-R*Math.cos(theta)+R*.34*Math.sin(theta)*Math.sin(p);if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.stroke();
    const vx=R*Math.sin(theta)*Math.cos(phi),vy=-R*Math.cos(theta)+R*.34*Math.sin(theta)*Math.sin(phi);
    arrow(ctx,0,0,vx,vy,"#efc574",4);ctx.fillStyle="#efc574";ctx.shadowColor="#efc574";ctx.shadowBlur=18;ctx.beginPath();ctx.arc(vx,vy,5.5,0,Math.PI*2);ctx.fill();ctx.restore();
    // center apparatus
    const sx=W*.405,sy=H*.46,magX=W*.515,magW=W*.105,magH=H*.24;
    rounded(ctx,sx-R*.22,sy-R*.23,R*.44,R*.46,8,"rgba(10,28,38,.9)","rgba(130,219,224,.28)");ctx.fillStyle="#82dbe0";ctx.beginPath();ctx.arc(sx,sy,5,0,Math.PI*2);ctx.fill();
    arrow(ctx,sx+R*.25,sy,magX-magW*.55,sy,"rgba(130,219,224,.82)",2);
    // SG magnet gap
    ctx.save();ctx.fillStyle="rgba(12,28,39,.96)";ctx.strokeStyle="rgba(130,219,224,.28)";ctx.lineWidth=1.2;
    ctx.beginPath();ctx.roundRect(magX-magW/2,sy-magH*.68,magW,magH*.52,5);ctx.fill();ctx.stroke();ctx.beginPath();ctx.roundRect(magX-magW/2,sy+magH*.16,magW,magH*.52,5);ctx.fill();ctx.stroke();
    ctx.fillStyle="#a9bbc2";ctx.font=`700 ${Math.max(11,W*.012)}px ui-monospace`;ctx.textAlign="center";ctx.fillText("N",magX,sy-magH*.39);ctx.fillText("S",magX,sy+magH*.47);ctx.restore();
    arrow(ctx,magX-magW*.23,sy+magH*.25,magX-magW*.23,sy-magH*.25,"rgba(239,197,116,.72)",1.5);
    // beams and particles
    const splitX=magX+magW*.52,detX=W*.755,upY=sy-H*.13,dnY=sy+H*.13;
    ctx.save();ctx.strokeStyle="rgba(130,219,224,.78)";ctx.lineWidth=2.1;ctx.beginPath();ctx.moveTo(splitX,sy);ctx.bezierCurveTo(splitX+W*.055,sy,detX-W*.05,upY,detX,upY);ctx.stroke();ctx.beginPath();ctx.moveTo(splitX,sy);ctx.bezierCurveTo(splitX+W*.055,sy,detX-W*.05,dnY,detX,dnY);ctx.stroke();ctx.restore();
    const phase=(t*.42)%1;for(const sign of [-1,1]){const p=(phase+(sign>0?.42:0))%1,q=1-p,bx=(1-q)**3*splitX+3*(1-q)**2*q*(splitX+W*.055)+3*(1-q)*q*q*(detX-W*.05)+q**3*detX;const target=sign<0?upY:dnY;const by=(1-q)**3*sy+3*(1-q)**2*q*sy+3*(1-q)*q*q*target+q**3*target;ctx.fillStyle="#efc574";ctx.shadowColor="#efc574";ctx.shadowBlur=16;ctx.beginPath();ctx.arc(bx,by,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    // right readout card
    const rx=W*.755,rw=W*.195,rh=H*.15;
    function detector(y,label,pulse){rounded(ctx,rx,y,rw,rh,8,"rgba(8,18,27,.78)","rgba(130,219,224,.22)");line(ctx,rx,y,rx,y+rh,"#82dbe0",3);ctx.fillStyle="#b9c9cf";ctx.font=`italic ${Math.max(14,W*.017)}px Georgia`;ctx.fillText(label,rx+18,y+28);ctx.strokeStyle="rgba(130,219,224,.35)";ctx.lineWidth=1.3;ctx.beginPath();const base=y+rh*.73;ctx.moveTo(rx+22,base);for(let i=0;i<7;i++){const xx=rx+22+i*(rw-44)/6,yy=base-(i===pulse?rh*.28:(i===pulse-1?rh*.10:0));ctx.lineTo(xx,yy);}ctx.stroke();const hitX=rx+rw*.72,hitY=y+rh*.56+Math.sin(t*2+pulse)*3;ctx.fillStyle="#efc574";ctx.beginPath();ctx.arc(hitX,hitY,6,0,Math.PI*2);ctx.fill();}
    detector(upY-rh/2,"+ ℏ / 2",Math.floor(t*1.2)%6);detector(dnY-rh/2,"− ℏ / 2",(Math.floor(t*1.2)+3)%6);
    // process arrows
    const py=H*.79;arrow(ctx,W*.27,py,W*.34,py,"rgba(130,219,224,.55)",1.2);arrow(ctx,W*.61,py,W*.68,py,"rgba(130,219,224,.55)",1.2);
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
    const pop=document.createElement("div");pop.className="pvl45-connect-popover";pop.style.left=`${Math.max(12,Math.min(innerWidth-372,innerWidth*.5-180))}px`;pop.style.top=`${Math.max(12,Math.min(innerHeight-300,innerHeight*.36))}px`;
    pop.innerHTML=`<h3>${esc(c.connectTitle)} · ${esc(comp.name||comp.id)}</h3><p>${esc(c.connectHint)}</p><div class="pvl45-connect-grid"><label>${esc(c.terminal1)}<select data-terminal="0">${nodes}</select></label><label>${esc(c.terminal2)}<select data-terminal="1">${nodes}</select></label><label style="grid-column:1/-1">${esc(c.value)}<input data-value value="${esc(comp.value)}"></label></div><div class="pvl45-connect-actions"><button data-cancel>${esc(c.cancel)}</button><button class="primary" data-apply>${esc(c.apply)}</button></div>`;
    document.body.appendChild(pop);pop.querySelector('[data-terminal="0"]').value=comp.nodes[0]??"0";pop.querySelector('[data-terminal="1"]').value=comp.nodes[1]??"0";
    pop.querySelector("[data-cancel]").onclick=()=>pop.remove();pop.querySelector("[data-apply]").onclick=()=>{const s=circuitState(),x=s.components.find(q=>q.id===comp.id);if(x){x.nodes[0]=pop.querySelector('[data-terminal="0"]').value;x.nodes[1]=pop.querySelector('[data-terminal="1"]').value;x.value=pop.querySelector("[data-value]").value||x.value;s.selected=x.id;api.load(s);}pop.remove();setTimeout(refreshWave,120);};
  }
  function installCircuitWorkspace(){
    const stage=document.querySelector(".cw-stage");if(!stage||stage.parentElement?.querySelector(":scope > .pvl45-circuit-shell"))return;
    const c=copy(),shell=document.createElement("section");shell.className="pvl45-circuit-shell";
    shell.innerHTML=`<div class="pvl45-circuit-head"><div class="pvl45-circuit-head-left"><span>ENGINEERING WORKSPACE</span><strong>${esc(c.workbench)}</strong></div><div class="pvl45-circuit-actions"><button data-pvl45-guide>${esc(c.manual)}</button><button data-pvl45-new>${esc(c.newCircuit)}</button><button class="primary" data-pvl45-run>${esc(c.runNow)}</button></div></div>
      <div class="pvl45-build-flow"><div><b>01 · ${esc(c.build)}</b><span>元件 / COMPONENTS</span></div><div><b>02 · ${esc(c.connect)}</b><span>节点 / NETS</span></div><div><b>03 · ${esc(c.probe)}</b><span>V(node), I(device)</span></div><div><b>04 · ${esc(c.run)}</b><span>TRAN · AC · ENERGY</span></div></div>
      <div class="pvl45-toolstrip"><button class="pvl45-tool" data-tool="node"><i>•</i>${esc(c.node)}</button><span class="pvl45-tool-separator"></span><button class="pvl45-tool" data-tool="resistor"><i>R</i>电阻</button><button class="pvl45-tool" data-tool="capacitor"><i>C</i>电容</button><button class="pvl45-tool" data-tool="inductor"><i>L</i>电感</button><button class="pvl45-tool" data-tool="vdc"><i>V</i>直流源</button><button class="pvl45-tool" data-tool="vsin"><i>~</i>正弦源</button><button class="pvl45-tool" data-tool="diode"><i>D</i>二极管</button><button class="pvl45-tool" data-tool="opamp"><i>U</i>运放</button></div>
      <div class="pvl45-presetbar"><span>${esc(c.presets)}</span><button class="pvl45-preset" data-preset="divider">分压器</button><button class="pvl45-preset" data-preset="rc">RC 充放电</button><button class="pvl45-preset" data-preset="rlc">RLC 谐振</button><button class="pvl45-preset" data-preset="rectifier">整流滤波</button><button class="pvl45-preset" data-preset="opamp">运放增益</button></div>
      <div class="pvl45-wave-dock"><div class="pvl45-wave-toolbar"><div class="pvl45-wave-tabs"><button data-wave="transient" class="active">${esc(c.scope)}</button><button data-wave="bode">${esc(c.bode)}</button><button data-wave="energy">${esc(c.energy)}</button></div><div class="pvl45-wave-controls"><label>${esc(c.probeNode)} <select data-pvl45-probe></select></label><span class="pvl45-wave-status">${esc(c.ready)}</span></div></div><div class="pvl45-wave-canvas-wrap"><canvas class="pvl45-wave-canvas"></canvas><div class="pvl45-wave-legend"></div></div></div>`;
    stage.insertAdjacentElement("afterend",shell);
    shell.querySelector("[data-pvl45-run]").onclick=()=>{clickAction('[data-cw-action="run"]');refreshWave(true);};
    shell.querySelector("[data-pvl45-new]").onclick=()=>{clickAction('[data-cw-action="new"]');setTimeout(refreshWave,120);};
    shell.querySelector("[data-pvl45-guide]").onclick=()=>document.querySelector(".pvl-circuit-guide-button")?.click();
    shell.querySelectorAll("[data-tool]").forEach(btn=>btn.onclick=()=>{const type=btn.dataset.tool;if(type==="node")clickAction('[data-cw-action="add-node"]');else addComponentDirect(type);setTimeout(refreshWave,150);});
    shell.querySelectorAll("[data-preset]").forEach(btn=>btn.onclick=()=>{clickAction(`[data-cw-preset="${btn.dataset.preset}"]`);setTimeout(()=>refreshWave(true),180);});
    shell.querySelectorAll("[data-wave]").forEach(btn=>btn.onclick=()=>{waveMode=btn.dataset.wave;shell.querySelectorAll("[data-wave]").forEach(x=>x.classList.toggle("active",x===btn));refreshWave(true);});
    updateProbeSelect();
    makePaletteDraggable();
    refreshWave(true);
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
    cancelAnimationFrame(waveRAF);waveRAF=requestAnimationFrame(()=>{const canvas=document.querySelector(".pvl45-wave-canvas"),wrap=canvas?.parentElement,legend=document.querySelector(".pvl45-wave-legend");if(!canvas||!wrap)return;const r=wrap.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),W=Math.max(1,Math.round(r.width*dpr)),H=Math.max(1,Math.round(r.height*dpr));if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);const w=W/dpr,h=H/dpr;ctx.clearRect(0,0,w,h);ctx.fillStyle="#050a10";ctx.fillRect(0,0,w,h);const pad={l:54,r:24,t:28,b:36};for(let i=0;i<=8;i++)line(ctx,pad.l+(w-pad.l-pad.r)*i/8,pad.t,pad.l+(w-pad.l-pad.r)*i/8,h-pad.b,"rgba(130,219,224,.055)");for(let i=0;i<=5;i++)line(ctx,pad.l,pad.t+(h-pad.t-pad.b)*i/5,w-pad.r,pad.t+(h-pad.t-pad.b)*i/5,"rgba(130,219,224,.055)");const data=waveCache.data;if(!data?.series?.length){ctx.fillStyle="#718791";ctx.font="12px system-ui";ctx.textAlign="center";ctx.fillText(copy().noData,w/2,h/2);if(legend)legend.innerHTML="";return;}const all=data.series.flatMap(s=>s.points).filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));if(!all.length)return;const xs=all.map(p=>p.x),ys=all.map(p=>p.y),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys),yr=Math.max(1e-12,ymax-ymin);line(ctx,pad.l,h-pad.b,w-pad.r,h-pad.b,"rgba(130,219,224,.25)");line(ctx,pad.l,pad.t,pad.l,h-pad.b,"rgba(130,219,224,.25)");const colors={cyan:"#82dbe0",warm:"#efc574",muted:"#80949e"};for(const s of data.series){ctx.strokeStyle=colors[s.color]||colors.cyan;ctx.lineWidth=s.color==="muted"?1.35:2;ctx.setLineDash(s.color==="muted"?[5,5]:[]);ctx.beginPath();s.points.forEach((p,i)=>{const x=pad.l+(p.x-xmin)/Math.max(1e-12,xmax-xmin)*(w-pad.l-pad.r),y=h-pad.b-(p.y-ymin)/yr*(h-pad.t-pad.b);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();}ctx.setLineDash([]);ctx.fillStyle="#6d838e";ctx.font="10px ui-monospace";ctx.textAlign="left";ctx.fillText(`${data.yLabel} · ${ymax.toPrecision(3)}`,pad.l,pad.t-8);ctx.textAlign="right";ctx.fillText(data.xLabel,w-pad.r,h-10);if(legend)legend.innerHTML=data.series.map(s=>`<span class="${s.color==='warm'?'warm':''}"><i style="background:${colors[s.color]||colors.cyan}"></i>${esc(s.name)}</span>`).join("");});
  }

  function pass(){queued=false;installHero();installOscillatorMath();installCircuitWorkspace();updateProbeSelect();makePaletteDraggable();const s=circuitState();if(s&&waveCache.signature!==stateSig(s))refreshWave();}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(pass);}
  function start(){schedule();const mo=new MutationObserver(schedule);mo.observe(document.body,{childList:true,subtree:true});addEventListener("hashchange",schedule);addEventListener("resize",()=>{resizeHero();drawWave();});addEventListener("pvl:languagechange",()=>{document.querySelector(".pvl-home-visual")?.removeAttribute("data-pvl45");schedule();});setInterval(()=>{if(document.querySelector(".cw-stage"))refreshWave();},1200);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
