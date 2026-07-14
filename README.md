# Physics Visual Lab v4.2.0

无需登录、无需后端，可部署到 GitHub Pages 的交互物理实验室。动画、数值求解与语言切换都在浏览器中离线完成。

## 实验目录

- Stern–Gerlach 专题：拉莫尔进动、基础分束、串联测量
- 基础物理专题：16 个实验
  - 力学与振动：斜抛、斜面、碰撞设计台、受迫阻尼振子、单摆
  - 波动：弦上的驻波与简正模
  - 电路与电磁学：RC 暂态、任意拓扑电路实验台、惠斯通电桥、RLC 交流谐振、法拉第感应
  - 光学：薄透镜、双透镜光学设计台、双缝干涉、衍射光栅、偏振片组

## 电路实验台

电路工作台不是固定的串并联演示。用户可以添加命名节点与元件、修改端点连接和参数，并保存或导入 JSON 网表。

- 20 类元件：R、C、L、导线、开关、灯、熔断器、独立电压/电流源、二极管、LED、NPN、NMOS、VCVS、VCCS、理想运放、电压表和电流表等
- 4 类分析：DC 工作点、DC 扫描、AC 小信号扫频、瞬态分析
- 求解方法：修正节点分析、Newton 迭代、复相量、后向 Euler 积分
- 20 个教材与竞赛型模板：分压、电桥、RC、RLC、半波与全波桥式整流、运放增益与积分器、晶体管偏置、MOSFET 开关、戴维宁–诺顿等效、叠加定理、最大功率传输、二极管限幅、RC 波特响应、有源低通、共射/共源放大器、射极/源极跟随器

器件采用教学级紧凑模型。实际产品、精密器件或安全关键设计应使用制造商 SPICE 模型复核。

## 语言与主题

- 完整语言：中文、English、日本語、한국어、Русский、O‘zbekcha、ไทย、မြန်မာ、ၵႂၢမ်းတႆး
- 自动读取浏览器语言，也可在统一的二级菜单中手动切换；选择会保存在本机
- 夜间与日间主题，可手动切换

## 文件目录

```text
index.html
version.json
README.md
assets/
  styles.css
  larmor.js
  stern-gerlach.js
  app.js
  i18n.js
  ja-content.js
  full-locales.js
  catalog-locales.js
  circuit-workbench.js
```

## 本地预览

建议在项目目录启动任意静态文件服务器：

```bash
python -m http.server 8000
```

随后打开 `http://localhost:8000/`。Python 仅用于本地传送静态文件，不参与动画或计算。

## 部署到 GitHub Pages

把 `index.html`、`version.json`、`README.md` 与整个 `assets/` 文件夹上传到仓库根目录。在仓库 Settings → Pages 中选择从 `main` 分支根目录部署。

页面顶栏、`version.json`、HTML 版本元数据和资源查询参数均标记为 `v4.2.0`，用于识别版本并避免旧缓存。
