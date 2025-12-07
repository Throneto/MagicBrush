# 🎨 MagicBrush (魔刷)

MagicBrush 是一个基于 AI 的智能图文生成平台，旨在为小红书等社交媒体创作者提供高效的内容生产工具。它结合了先进的大语言模型（Gemini/OpenAI）和图像生成模型（Imagen/DALL-E），能够一键生成吸引人的文案和配图。

## ✨ 核心功能

- **智能文案生成**：输入主题，自动生成符合小红书风格的标题、正文和标签。
- **AI 绘图**：根据文案内容自动生成高质量配图，支持多种风格。
- **多模型支持**：无缝集成 Google Gemini, Imagen 4, Vertex AI 以及 OpenAI 等多种 AI 模型。
- **所见即所得**：提供可视化的编辑界面，支持文案和图片的实时预览与修改。
- **历史记录管理**：自动保存生成历史，方便回溯和二次编辑。

## 🛠️ 技术栈

### 前端 (Frontend)
- **Framework**: [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **UI/Styling**: CSS3, Responsive Design

### 后端 (Backend)
- **Framework**: [Flask](https://flask.palletsprojects.com/)
- **Language**: Python 3.10+
- **API**: RESTful API
- **Manager**: `uv` (Fast Python package installer and resolver)

### AI 服务集成
- **LLM**: Google Gemini Pro, OpenAI GPT
- **Image Generation**: Google Imagen 4 (via Vertex AI), DALL-E 3

## 🚀 快速开始

### 环境要求
- **Node.js**: v18+ (推荐使用 LTS 版本)
- **Python**: 3.10+
- **uv**: Python 包管理工具 (`curl -LsSf https://astral.sh/uv/install.sh | sh`)

### 1. 克隆项目
```bash
git clone https://github.com/Throneto/MagicBrush.git
cd MagicBrush
```

### 2. 配置说明

#### 认证配置 (Required for Google Services)
将你的 Google Cloud Service Account Key 文件放置在项目根目录，并命名为 `gcp-key.json`。
> ⚠️ **注意**: `gcp-key.json` 包含敏感信息，已被 `.gitignore` 忽略，请勿提交到版本控制系统。

#### AI 服务商配置
项目提供了示例配置文件，请复制并修改：

**1. 图片生成配置**
```bash
cp image_providers.yaml.example image_providers.yaml
```
编辑 `image_providers.yaml`，选择激活的 provider (如 `imagen4` 或 `gemini`) 并填写相应的 API Key 或 Project ID。

**2. 文本生成配置**
```bash
cp text_providers.yaml.example text_providers.yaml
```
编辑 `text_providers.yaml`，配置文本生成模型参数。

### 3. 启动服务
项目提供了一键启动脚本 `start.sh`，可同时启动前后端服务。

```bash
# 赋予执行权限
chmod +x start.sh

# 启动所有服务 (后端端口 12398, 前端端口 5173)
./start.sh
```

**其他启动选项：**
- 仅启动后端：`./start.sh --backend-only`
- 仅启动前端：`./start.sh --frontend-only`
- 检查服务状态：`./start.sh --check-only`

访问浏览器：http://localhost:5173

## 📦 部署说明

### Docker 部署 (推荐)
提供了 `Docker-Compose` 配置，可快速在服务器上部署。

1. **构建并启动容器**
```bash
docker-compose up -d --build
```
2. **查看日志**
```bash
docker-compose logs -f
```
3. **停止服务**
```bash
docker-compose down
```

### 目录挂载
默认配置下，`docker-compose.yml` 会挂载以下目录以持久化数据：
- `./history`: 生成记录和图片
- `./output`: 导出文件
- `./image_providers.yaml` (可选): 挂载配置文件以覆盖镜像内默认配置

## 📂 目录结构

```
MagicBrush/
├── backend/                # Flask 后端代码
│   ├── app.py             # 应用入口
│   ├── routes/            # API 路由
│   ├── generators/        # AI 生成逻辑封装
│   └── ...
├── frontend/               # Vue 3 前端代码
│   ├── src/               # 源代码
│   ├── index.html         # 入口 HTML
│   └── ...
├── docker/                 # Docker 相关配置
├── history/                # 本地生成历史 (Git忽略)
├── gcp-key.json            # GCP 密钥 (Git忽略)
├── start.sh                # 启动脚本
├── image_providers.yaml    # 图片服务配置
├── text_providers.yaml     # 文本服务配置
└── requirements.txt        # Python 依赖
```

## 🤝 贡献指南
欢迎提交 Issue 和 Pull Request！

## 📄 许可证
[MIT License](LICENSE)
