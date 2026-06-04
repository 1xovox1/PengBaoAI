# 鹏宝AI - 智能对话平台

一个集成了多个AI模型和Agent智能体的企业级智能对话平台，专为运营人员设计。

## 功能特性

### 核心功能

1. **智能对话入口 (Model Hub)**
   - 多模型切换（国内模型、国外模型、鹏宝专属模型）
   - 流式输出支持
   - 一键"三星化"开关
   - Prompt模板库
   - 多模型对比模式
   - 文件中心（支持PDF/Excel/Word上传和分析）

2. **Agent智能体超市 (Agent Marketplace)**
   - 按业务组分类展示
   - 按能力维度筛选
   - Agent卡片式展示
   - 搜索和收藏功能

3. **数据记录与控制台 (Admin Console)**
   - Token统计和费用预估
   - 活跃度趋势分析
   - 关键词云展示
   - 对话日志管理
   - 反馈追踪

4. **我的收藏**
   - 收藏常用Agent
   - 快速访问

5. **系统设置**
   - API密钥管理
   - 权限管理
   - 系统配置

## 技术栈

- **框架**: Vue 3
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **路由**: Vue Router
- **状态管理**: Pinia
- **样式**: SCSS

## 项目结构

```
鹏宝AI第二版/
├── src/
│   ├── components/          # 公共组件
│   │   ├── AgentCard.vue
│   │   ├── FileCenter.vue
│   │   └── PromptTemplates.vue
│   ├── layouts/             # 布局组件
│   │   └── MainLayout.vue
│   ├── router/              # 路由配置
│   │   └── index.js
│   ├── styles/              # 样式文件
│   │   └── main.scss
│   ├── views/               # 页面组件
│   │   ├── ChatView.vue
│   │   ├── AgentMarketplace.vue
│   │   ├── AdminConsole.vue
│   │   ├── FavoritesView.vue
│   │   └── SettingsView.vue
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 安装和运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 设计说明

### 主题色

- **主色调**: 三星蓝 (#1428A0)
- **辅助色**: 浅蓝 (#1E40E6)
- **背景色**: 白色和浅灰 (#F9FAFB)

### 布局结构

- **左侧导航栏**: 260px宽度，可折叠
- **主内容区**: 自适应宽度
- **右侧辅助栏**: 320px宽度（可选显示）

## 功能说明

### 智能对话

- 支持多个AI模型切换
- 三星化模式：通过RAG和SFT确保输出符合品牌调性
- 对比模式：同时调用两个模型进行结果对比
- Prompt模板库：提供常用模板快速使用
- 文件上传：支持多种格式文件分析和处理

### Agent超市

- 横向分类：按业务组（电商运营组、视觉设计组等）
- 纵向分类：按能力维度（文案生成、数据拆解等）
- 搜索和筛选功能
- 收藏功能

### 数据控制台

- 实时数据统计
- 图表展示（可集成ECharts）
- 关键词云分析
- 对话日志管理
- 反馈数据追踪

## 后续开发建议

1. **集成真实API**
   - 连接OpenAI、Claude、Kimi等API
   - 实现流式输出
   - 错误处理和重试机制

2. **图表库集成**
   - 集成ECharts或Chart.js
   - 实现数据可视化

3. **Markdown渲染**
   - 集成markdown-it
   - 代码高亮（highlight.js）
   - 公式渲染（KaTeX）

4. **文件处理**
   - 集成文件解析库
   - 实现知识库功能
   - 文件预览功能

5. **状态管理**
   - 使用Pinia管理全局状态
   - 对话历史持久化
   - 用户偏好设置

6. **性能优化**
   - 虚拟滚动（长列表）
   - 懒加载
   - 代码分割

## 许可证

MIT

