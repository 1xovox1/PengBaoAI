# 鹏宝AI：连接模型 API 与服务器部署说明

本文说明如何把当前前端**接上各模型 API**，并**部署到服务器**使用。

---

## 一、整体架构

```
用户浏览器 → 前端（Vue） → 你的后端代理（Node） → 各厂商 API 或 Dify（你的 Agent）
```

- **前端**：只请求你自己的后端 `/api/chat`，不直接带 API Key。
- **后端**：根据 `model` 把请求转发到对应厂商，密钥写在**服务器**的 `server/.env` 里，不暴露给浏览器。

这样既安全，又便于以后加文心、鹏宝专属模型等。

---

## 二、本地开发：连接各模型 API

### 1. 安装并启动后端

```bash
cd server
cp .env.example .env
# 用记事本编辑 .env，填入你在各平台申请的 API Key（见下文）
npm install
npm run dev
```

后端默认跑在 **http://localhost:3001**，提供 `POST /api/chat`。

### 2. 申请并配置 API Key

在 `server/.env` 里配置（只配置你要用的即可）：

| 模型 | 环境变量 | 获取地址 |
|------|----------|----------|
| GPT-4 | `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| Kimi | `MOONSHOT_API_KEY` | https://platform.moonshot.ai/ |
| Claude | `ANTHROPIC_API_KEY` | https://console.anthropic.com/ |
| DeepSeek | `DEEPSEEK_API_KEY` | https://platform.deepseek.com/ |

示例：

```env
PORT=3001
OPENAI_API_KEY=sk-xxx
MOONSHOT_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
DEEPSEEK_API_KEY=sk-xxx
```

### 3. 启动前端

在项目根目录：

```bash
npm run dev
```

前端会在 3000 端口打开，Vite 已配置**开发代理**：所有 `/api` 请求会转发到 `http://localhost:3001`，无需改前端代码。

在「智能对话」里选择 **GPT-4 / Kimi / Claude 3 / DeepSeek** 即可与真实模型对话；未接好的模型（如文心、鹏宝专属）仍为模拟回复，后续可在 `server/routes/chat.js` 里扩展。

### 4. 使用 Dify Agent（推荐：无需单独配置各模型 API）

如果你在 **Dify** 上已经创建了 Agent，只需配置 Dify 的地址和该应用的 API Key，**不需要**再填 OpenAI / Kimi 等密钥（模型在 Dify 里配好即可）。

**需要你提供的信息：**

| 信息 | 说明 | 在哪里找 |
|------|------|----------|
| **Dify API 地址** | 你用的 Dify 的 base URL，不要带路径 | **Dify 云**：`https://api.dify.ai`<br>**自建**：你的域名，如 `https://dify.你的域名.com`（不要加 `/v1`） |
| **Dify API Key** | 要接入的那个 Agent 应用的 API 密钥 | 打开该应用 → 左侧「API 访问」→ 复制「API Key」 |

在 `server/.env` 里添加（或修改）：

```env
DIFY_BASE_URL=https://api.dify.ai
DIFY_API_KEY=app-xxxxxxxxxxxx
```

保存后重启后端（`cd server` 再运行 `npm run dev`）。前端在「智能对话」里选择 **「Dify Agent」** 即可与你在 Dify 上的 Agent 对话，且支持多轮同一会话。

---

## 三、部署到服务器

思路：**前端**打包成静态资源用 Nginx（或对象存储）提供；**后端**用 Node 跑在同一台或另一台机器，用 Nginx 把 `/api` 反代到后端。这样用户访问同一个域名即可。

### 1. 构建前端

```bash
npm run build
```

生成目录：`dist/`，里面是静态文件。

### 2. 部署后端

在服务器上：

```bash
cd server
cp .env.example .env
# 编辑 .env 填入生产环境的 API Key
npm install --production
npm start
```

建议用 **pm2** 保活与重启：

```bash
npm install -g pm2
pm2 start index.js --name pengbao-api
pm2 save
pm2 startup
```

后端监听端口需与下面 Nginx 里 `proxy_pass` 一致（例如 3001）。

### 3. Nginx 配置（前端 + 后端同域）

假设域名 `yourdomain.com`，前端静态在 `/var/www/pengbao-ai/dist`，后端跑在本机 3001：

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/pengbao-ai/dist;
    index index.html;

    # 前端 SPA：所有非文件请求回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 接口转发到 Node 后端
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

这样：

- `https://yourdomain.com/` → 前端页面  
- `https://yourdomain.com/api/chat` → 后端 → 各模型 API  

前端无需配置 `VITE_API_BASE_URL`（请求同域 `/api` 即可）。

### 4. 若前端与后端不同域

例如前端在 `https://app.yourdomain.com`，后端在 `https://api.yourdomain.com`：

1. 后端 Nginx 或云服务放行 `https://api.yourdomain.com`，并配置 CORS（当前 `server/index.js` 已用 `cors({ origin: true })`，可按需收紧）。
2. 前端构建时指定后端地址：

   ```bash
   # Windows PowerShell
   $env:VITE_API_BASE_URL="https://api.yourdomain.com"; npm run build
   ```

   构建出的 `dist` 里的请求会发往 `https://api.yourdomain.com/api/chat`。

---

## 四、小结

| 步骤 | 说明 |
|------|------|
| 接 API | 在 `server/.env` 配置各厂商 Key，前端选对应模型即可调用 |
| 开发 | 前端 `npm run dev`，后端 `cd server && npm run dev`，代理已配好 |
| 部署 | 前端 `npm run build` 部署静态；后端用 Node + pm2；Nginx 反代 `/api` 到后端 |
| 安全 | API Key 只放在服务器 `server/.env`，不要提交到 Git |

如需加**文心一言**或**鹏宝专属模型**，在 `server/routes/chat.js` 里按现有写法增加分支即可；前端只需在「选择模型」里已有选项对应好 `model` id。
