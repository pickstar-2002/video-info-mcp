# 📹 Video Info MCP

[![npm version](https://badge.fury.io/js/@pickstar-2002%2Fvideo-info-mcp.svg)](https://badge.fury.io/js/@pickstar-2002%2Fvideo-info-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)

🎬 基于 MCP (Model Context Protocol) 协议的专业视频信息提取工具，提供全面的视频文件分析功能。

## ✨ 功能特性

- 🔍 **详细信息提取** - 获取视频时长、分辨率、帧率、编码等完整信息
- 📊 **流分析** - 分别解析视频流和音频流的详细参数
- 📈 **码率计算** - 计算平均码率和峰值码率
- 📋 **报告生成** - 输出标准化的视频技术参数报告，支持 JSON、文本、Markdown 格式
- ⚡ **高性能** - 基于 FFmpeg 的高效视频处理
- 🛡️ **类型安全** - 完整的 TypeScript 支持

## 🚀 快速开始

### 安装

推荐使用 `@latest` 标签获取最新版本：

```bash
npx @pickstar-2002/video-info-mcp@latest
```

或者全局安装：

```bash
npm install -g @pickstar-2002/video-info-mcp@latest
```

### 系统要求

- 📦 Node.js >= 18
- 🎥 FFmpeg (系统需要安装 FFmpeg)

### 安装 FFmpeg

**Windows:**
```bash
# 使用 Chocolatey
choco install ffmpeg

# 或下载预编译版本
# https://ffmpeg.org/download.html#build-windows
```

**macOS:**
```bash
# 使用 Homebrew
brew install ffmpeg
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

## 🔧 配置 MCP 客户端

### Claude Desktop

在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "video-info": {
      "command": "npx",
      "args": ["@pickstar-2002/video-info-mcp@latest"]
    }
  }
}
```

### Cursor

在 `.cursorrules` 或项目配置中添加：

```json
{
  "mcp": {
    "servers": {
      "video-info": {
        "command": "npx",
        "args": ["@pickstar-2002/video-info-mcp@latest"]
      }
    }
  }
}
```

### 其他 MCP 客户端

使用标准的 MCP 协议连接：

```bash
npx @pickstar-2002/video-info-mcp@latest
```

## 🛠️ MCP 工具

### 1. get_video_info

🎯 获取视频文件的基础信息。

**参数:**
- `filePath` (string): 视频文件路径

**示例:**
```json
{
  "filePath": "/path/to/video.mp4"
}
```

### 2. analyze_streams

🔬 分析视频和音频流的详细参数。

**参数:**
- `filePath` (string): 视频文件路径
- `includeMetadata` (boolean, 可选): 是否包含元数据信息，默认 true

**示例:**
```json
{
  "filePath": "/path/to/video.mp4",
  "includeMetadata": true
}
```

### 3. calculate_bitrate

📊 计算视频的码率信息。

**参数:**
- `filePath` (string): 视频文件路径
- `sampleDuration` (number, 可选): 采样时长（秒），用于计算峰值码率

**示例:**
```json
{
  "filePath": "/path/to/video.mp4",
  "sampleDuration": 10
}
```

### 4. generate_report

📋 生成标准化的技术参数报告。

**参数:**
- `filePath` (string): 视频文件路径
- `format` (string, 可选): 报告格式，可选值：`json`、`text`、`markdown`，默认 `json`

**示例:**
```json
{
  "filePath": "/path/to/video.mp4",
  "format": "markdown"
}
```

## 📊 输出示例

### 基础信息
```json
{
  "filename": "sample.mp4",
  "fileSize": "15.23 MB",
  "duration": "120.5",
  "durationSeconds": 120.5,
  "format": "mov,mp4,m4a,3gp,3g2,mj2",
  "formatLongName": "QuickTime / MOV"
}
```

### 视频流信息
```json
{
  "videoStreams": [
    {
      "index": 0,
      "codec": "h264",
      "codecLongName": "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10",
      "resolution": "1920x1080",
      "aspectRatio": "16:9",
      "pixelFormat": "yuv420p",
      "frameRate": "30/1",
      "avgFrameRate": "30/1",
      "bitRate": "2500000"
    }
  ]
}
```

### 音频流信息
```json
{
  "audioStreams": [
    {
      "index": 1,
      "codec": "aac",
      "codecLongName": "AAC (Advanced Audio Coding)",
      "sampleRate": "48000",
      "channels": 2,
      "channelLayout": "stereo",
      "sampleFormat": "fltp",
      "bitRate": "128000"
    }
  ]
}
```

### 码率分析
```json
{
  "bitrateAnalysis": {
    "overallBitRate": "2628000",
    "videoBitRate": "2500000",
    "audioBitRate": "128000",
    "maxBitRate": "3000000",
    "estimatedSize": "39.42 MB"
  }
}
```

### 技术报告
```json
{
  "technicalReport": {
    "videoQuality": "1080p高清",
    "audioQuality": "标准品质",
    "recommendations": [
      "使用H.264编码，兼容性良好"
    ]
  }
}
```

## 🚨 疑难解答 (Troubleshooting)

### 常见问题及解决方案

#### 1. 🔄 Connection closed 错误

这通常是由于 `npx` 缓存问题导致的。请按以下顺序尝试解决：

**a. 首选方案：确认使用 @latest 标签**
```bash
npx @pickstar-2002/video-info-mcp@latest
```

**b. 备用方案：锁定到特定稳定版本**
```bash
npx @pickstar-2002/video-info-mcp@1.0.0
```

**c. 终极方案：清理 npx 缓存**
```bash
# 清理 npx 缓存
npx clear-npx-cache

# 或者手动清理
npm cache clean --force
rm -rf ~/.npm/_npx
```

#### 2. 🎥 FFmpeg not found 错误

确保系统已正确安装 FFmpeg：

```bash
# 检查 FFmpeg 是否安装
ffmpeg -version

# 如果未安装，请参考上面的 FFmpeg 安装指南
```

#### 3. 📁 文件路径问题

- 确保文件路径正确且文件存在
- 使用绝对路径避免相对路径问题
- 检查文件权限

#### 4. 🔧 MCP 配置问题

确保 MCP 客户端配置正确：

```json
{
  "mcpServers": {
    "video-info": {
      "command": "npx",
      "args": ["@pickstar-2002/video-info-mcp@latest"]
    }
  }
}
```

## 🎬 支持的视频格式

支持 FFmpeg 能够处理的所有视频格式，包括但不限于：

- 📹 MP4 (.mp4)
- 🎞️ AVI (.avi)
- 🎬 MOV (.mov)
- 📺 MKV (.mkv)
- 💿 WMV (.wmv)
- ⚡ FLV (.flv)
- 🌐 WEBM (.webm)
- 📱 M4V (.m4v)
- 📞 3GP (.3gp)
- 📡 TS (.ts)

## 🛠️ 开发

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd video-info-mcp

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建项目
npm run build

# 运行构建后的版本
npm start
```

### 项目结构

```
video-info-mcp/
├── src/
│   ├── index.ts          # MCP 服务器主文件
│   ├── video-analyzer.ts # 视频分析核心逻辑
│   └── types.ts          # TypeScript 类型定义
├── dist/                 # 构建输出目录
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 技术栈

- **MCP SDK**: @modelcontextprotocol/sdk - MCP 协议实现
- **FFmpeg**: fluent-ffmpeg - 视频处理和信息提取
- **TypeScript**: 类型安全的开发体验
- **Zod**: 运行时类型验证

## ⚠️ 错误处理

工具会处理以下常见错误：

- ❌ 文件不存在
- 🚫 不支持的视频格式
- ⚙️ FFmpeg 未安装或配置错误
- 🔒 文件权限问题
- 💥 损坏的视频文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📝 更新日志

### v1.0.0
- 🎉 初始版本发布
- ✅ 支持基础视频信息提取
- ✅ 支持流分析
- ✅ 支持码率计算
- ✅ 支持多格式报告生成

## 📞 联系方式

如有问题或建议，欢迎联系：

**微信**: pickstar_loveXX

---

⭐ 如果这个项目对您有帮助，请给个 Star！