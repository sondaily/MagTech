# MagTech - 常轨磁悬浮技术 (Regular Track Maglev Technology)

**开启交通新纪元 | Opening a New Era of Transportation**

MagTech 致力于开发基于现有铁轨的磁悬浮技术方案，通过被动悬浮与动态控制相结合，实现无需新建轨道、无需外部电力的高效、环保、经济的悬浮运输。

MagTech is dedicated to developing maglev technology solutions based on existing railway tracks. By combining passive levitation with dynamic control, we achieve efficient, eco-friendly, and economical levitation transport without the need for new tracks or external power.

## ✨ 核心特性 (Key Features)

*   **无需新建轨道 (No New Tracks Needed)**: 利用现有铁轨进行改造，大幅降低建设成本。
*   **被动悬浮 (Passive Levitation)**: 基于特殊排列的永磁体，无需外部电力即可实现悬浮。
*   **动态控制 (Dynamic Control)**: 混合磁场主动控制，确保中心对齐，适应轨道微小瑕疵。
*   **交互式模拟 (Interactive Simulation)**: 内置基于 Three.js 的 3D 模拟器，直观展示悬浮原理与实时数据。
*   **现代设计 (Modern Design)**: 采用玻璃拟态 (Glassmorphism) 设计风格，提供沉浸式用户体验。

## 🛠️ 技术栈 (Tech Stack)

*   **HTML5**: 语义化结构。
*   **CSS3**: 响应式布局，CSS 变量，Flexbox/Grid，动画。
*   **JavaScript (ES6+)**: 交互逻辑，模块化开发。
*   **Three.js**: 高性能 3D 图形渲染，用于磁悬浮模拟器。
*   **ModelViewer**: 快速展示 3D 模型。

## 🚀 快速开始 (Quick Start)

1.  **克隆仓库 (Clone the repository)**
    ```bash
    git clone https://github.com/sondaily/MagTech.git
    ```

2.  **进入目录 (Navigate to the directory)**
    ```bash
    cd MagTech
    ```

3.  **运行项目 (Run the project)**
    由于项目包含 ES Modules 和 3D 资源，建议使用本地服务器运行，例如使用 VS Code 的 "Live Server" 插件，或者使用 Python：
    ```bash
    # Python 3
    python -m http.server 8000
    ```

4.  **访问 (Access)**
    打开浏览器访问 `http://localhost:8000`。

## 📂 项目结构 (Project Structure)

```
MagTech/
├── index.html          # 主页
├── style.css           # 样式文件
├── script.js           # 页面交互逻辑
├── maglev-sim.js       # 3D 磁悬浮模拟器逻辑
├── a.html              # 模拟器独立测试页
├── image/              # 图片与 3D 模型资源
│   ├── 轨道组.glb
│   ├── 磁体组.glb
│   └── ...
└── README.md           # 项目说明文档
```

## 🤝 联系我们 (Contact Us)

如果您对我们的技术感兴趣或有业务合作需求，请联系我们：

*   📧 Email: leizehao2022@outlook.com

---

© 2026 MagTech. All rights reserved.
