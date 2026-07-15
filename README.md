# Physics Visual Lab · v5.0.0

无需账号和后端的交互物理实验室。当前公开部署采用经过完整回归测试的单文件构建，样式、脚本、九语言内容与全部模拟器均内嵌在 `index.html` 中，避免分批上传造成入口与资源版本不一致。

## 当前内容

- 2 个一级专题；
- 19 个交互实验，其中 3 个开放设计台；
- 力学、振动与波、电路与电磁学、几何与波动光学；
- 任意拓扑电路工作台：20 类元件、20 个参考电路、4 种分析模式；
- 9 种完整离线语言；
- 日间与夜间主题、移动端布局与减少动态效果支持。

## 线上文件

```text
index.html                 # v5.0.0 单文件生产构建
version.json               # 发布版本与功能计数
README.md                  # 项目说明
PRIVACY.md                 # 隐私说明
NOTICE.md                  # 版权与内容政策
SECURITY.md                # 安全报告方式
THIRD_PARTY_NOTICES.md     # 第三方软件许可证
```

`index.html` 不依赖仓库中的旧 JavaScript 或 CSS 文件。发布时应整体替换该文件，不要将不同版本的入口、样式和脚本混合上传。

## 数据与隐私

v5.0.0 没有第一方分析脚本、广告 Cookie、账号系统或访问者 IP 数据库。语言、主题与电路草稿只保存在访问者自己的浏览器中。详见 [PRIVACY.md](PRIVACY.md)。

## 权利状态

原创代码、文字、视觉设计、翻译与插图保留全部权利，第三方软件适用其各自许可证。详见 [NOTICE.md](NOTICE.md) 与 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

---

Physics Visual Lab · See equations in motion.
