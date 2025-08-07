# 🎬 Video Info MCP

[![npm version](https://badge.fury.io/js/@pickstar-2002%2Fvideo-info-mcp.svg)](https://badge.fury.io/js/@pickstar-2002%2Fvideo-info-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)

> 🚀 基于 MCP (Model Context Protocol) 协议的专业视频信息分析工具，为 AI 助手提供强大的视频文件分析能力

## ✨ 特性

- 🎯 **专业分析**: 基于 FFmpeg 的深度视频信息提取
- 📊 **多维度数据**: 视频流、音频流、码率、质量评估
- 📝 **多格式报告**: 支持 JSON、TEXT、Markdown 格式输出
- 🔧 **MCP 兼容**: 完全符合 Model Context Protocol 规范
- ⚡ **高性能**: 平均响应时间 < 500ms
- 🌐 **跨平台**: 支持 Windows、macOS、Linux
- 🛡️ **类型安全**: 使用 TypeScript 和 Zod 进行严格类型检查

## 📦 安装

### 作为 MCP 服务器使用（推荐）

在您的 AI 助手配置文件中添加：

```json
{
  "mcpServers": {
    "video-info": {
      "command": "npx",
      "args": ["@pickstar-2002/video-info-mcp@latest"],
      "env": {}
    }
  }
}
```

### 全局安装

```bash
npm install -g @pickstar-2002/video-info-mcp@latest
```

## 🚀 快速开始

### Claude Desktop 配置

1. 打开 Claude Desktop 配置文件：
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/claude/claude_desktop_config.json`

2. 添加 MCP 服务器配置：

```json
{
  "mcpServers": {
    "video-info": {
      "command": "npx",
      "args": ["@pickstar-2002/video-info-mcp@latest"],
      "env": {}
    }
  }
}
```

3. 重启 Claude Desktop

### 其他 AI 助手配置

对于支持 MCP 协议的其他 AI 助手，请参考相应的配置文档，使用以下命令：

```bash
npx @pickstar-2002/video-info-mcp@latest
```

## 🛠️ 功能说明

### 可用工具

| 工具名称 | 描述 | 响应时间 |
|---------|------|----------|
| `get_video_info` | 📹 获取视频文件的详细信息 | ~400ms |
| `analyze_streams` | 🔍 分析视频流和音频流参数 | ~300ms |
| `calculate_bitrate` | 📊 计算码率和文件大小分析 | ~300ms |
| `generate_report` | 📝 生成多格式技术报告 | ~280ms |

### 支持的视频格式

- **容器格式**: MP4, MOV, AVI, MKV, WebM, FLV, 3GP, M4V
- **视频编码**: H.264, H.265/HEVC, VP8, VP9, AV1, MPEG-4
- **音频编码**: AAC, MP3, AC-3, DTS, FLAC, Opus, Vorbis

## 📖 使用示例

### 基本用法

在支持 MCP 的 AI 助手中，您可以直接使用自然语言请求：

```
"请分析这个视频文件的信息：/path/to/video.mp4"
"生成这个视频的技术报告，使用 Markdown 格式"
"计算这个视频文件的码率信息"
```

### API 调用示例

```javascript
// get_video_info - 获取基本信息
{
  "name": "get_video_info",
  "arguments": {
    "filePath": "/path/to/video.mp4"
  }
}

// analyze_streams - 流分析
{
  "name": "analyze_streams", 
  "arguments": {
    "filePath": "/path/to/video.mp4",
    "includeMetadata": true
  }
}

// generate_report - 生成报告
{
  "name": "generate_report",
  "arguments": {
    "filePath": "/path/to/video.mp4",
    "format": "markdown"
  }
}
```

## 📊 输出示例

### 视频信息输出

```json
{
  "filename": "sample.mp4",
  "fileSize": "20.43 MB",
  "duration": "289.4",
  "format": "mov,mp4,m4a,3gp,3g2,mj2",
  "videoStreams": [{
    "codec": "h264",
    "resolution": "1920x1080",
    "frameRate": "30/1",
    "bitRate": "423986"
  }],
  "audioStreams": [{
    "codec": "aac",
    "sampleRate": "48000",
    "channels": 2,
    "bitRate": "164221"
  }],
  "technicalReport": {
    "videoQuality": "1080p高清",
    "audioQuality": "标准品质",
    "recommendations": [
      "建议提高视频码率以获得更好的1080p质量",
      "使用H.264编码，兼容性良好"
    ]
  }
}
```

## 🔧 疑难解答

### 常见问题

#### ❌ 连接错误 "Connection closed"

这通常是由于 `npx` 缓存问题导致的。请按以下顺序尝试解决：

**1. 使用 @latest 标签（首选方案）**
```json
{
  "mcpServers": {
    "video-info": {
      "command": "npx",
      "args": ["@pickstar-2002/video-info-mcp@latest"],
      "env": {}
    }
  }
}
```

**2. 锁定到特定版本（备用方案）**
```json
{
  "mcpServers": {
    "video-info": {
      "command": "npx",
      "args": ["@pickstar-2002/video-info-mcp@1.1.0"],
      "env": {}
    }
  }
}
```

**3. 清理 npx 缓存（终极方案）**
```bash
# 清理 npx 缓存
npx clear-npx-cache

# 或者手动删除缓存目录
# Windows: %LOCALAPPDATA%\npm-cache\_npx
# macOS/Linux: ~/.npm/_npx
```

#### ❌ FFmpeg 未找到

确保系统已安装 FFmpeg：

**Windows:**
```bash
# 使用 Chocolatey
choco install ffmpeg

# 使用 Scoop  
scoop install ffmpeg
```

**macOS:**
```bash
# 使用 Homebrew
brew install ffmpeg
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

#### ❌ 权限错误

确保 AI 助手有权限访问视频文件路径，建议使用绝对路径。

#### ❌ 文件格式不支持

检查视频文件是否损坏，或尝试使用其他工具转换为常见格式（如 MP4）。

### 性能优化建议

- 🚀 对于大文件（>1GB），分析可能需要更长时间
- 💾 建议将常用视频文件放在 SSD 上以提高分析速度
- 🔄 避免同时分析多个大文件

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/desktop)
- [FFmpeg 官网](https://ffmpeg.org/)

## 📞 联系方式

如有问题或建议，欢迎联系：

**微信**: pickstar_loveXX

---

⭐ 如果这个项目对您有帮助，请给个 Star！