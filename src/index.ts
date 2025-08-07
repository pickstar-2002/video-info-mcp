#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { VideoAnalyzer } from './video-analyzer';
import {
  GetVideoInfoArgsSchema,
  AnalyzeStreamsArgsSchema,
  CalculateBitrateArgsSchema,
  GenerateReportArgsSchema,
} from './types';

class VideoInfoMCPServer {
  private server: Server;
  private videoAnalyzer: VideoAnalyzer;

  constructor() {
    this.server = new Server(
      {
        name: 'video-info-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.videoAnalyzer = new VideoAnalyzer();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_video_info',
            description: '获取视频文件的详细信息，包括时长、分辨率、帧率、编码等完整信息',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: '视频文件路径',
                },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'analyze_streams',
            description: '分别解析视频流和音频流的详细参数，提供流级别的深度分析',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: '视频文件路径',
                },
                includeMetadata: {
                  type: 'boolean',
                  description: '是否包含元数据信息',
                  default: true,
                },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'calculate_bitrate',
            description: '计算视频的平均码率和峰值码率，提供详细的码率分析',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: '视频文件路径',
                },
                sampleDuration: {
                  type: 'number',
                  description: '采样时长（秒），用于计算峰值码率',
                  default: 10,
                },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'generate_report',
            description: '输出标准化的视频技术参数报告，支持多种格式输出',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: '视频文件路径',
                },
                format: {
                  type: 'string',
                  enum: ['json', 'text', 'markdown'],
                  description: '报告格式',
                  default: 'json',
                },
              },
              required: ['filePath'],
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_video_info':
            return await this.handleGetVideoInfo(args);
          case 'analyze_streams':
            return await this.handleAnalyzeStreams(args);
          case 'calculate_bitrate':
            return await this.handleCalculateBitrate(args);
          case 'generate_report':
            return await this.handleGenerateReport(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `未知工具: ${name}`
            );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new McpError(
          ErrorCode.InternalError,
          `工具执行失败: ${errorMessage}`
        );
      }
    });
  }

  private async handleGetVideoInfo(args: unknown) {
    const { filePath } = GetVideoInfoArgsSchema.parse(args);
    
    try {
      const videoInfo = await this.videoAnalyzer.getVideoInfo(filePath);
      
      return {
        content: [
          {
            type: 'text',
            text: `视频文件信息获取成功:\n\n${JSON.stringify(videoInfo, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`获取视频信息失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleAnalyzeStreams(args: unknown) {
    const { filePath, includeMetadata = true } = AnalyzeStreamsArgsSchema.parse(args);
    
    try {
      const analysis = await this.videoAnalyzer.analyzeVideo(filePath, includeMetadata);
      
      let result = `视频流分析结果:\n\n`;
      result += `文件: ${analysis.filename}\n`;
      result += `时长: ${analysis.duration}秒\n`;
      result += `格式: ${analysis.format}\n\n`;
      
      if (analysis.videoStreams.length > 0) {
        result += `视频流 (${analysis.videoStreams.length}个):\n`;
        analysis.videoStreams.forEach((stream, index) => {
          result += `  流 ${index + 1}: ${stream.codec} ${stream.resolution} ${stream.frameRate}fps\n`;
          result += `    码率: ${stream.bitRate || '未知'}\n`;
          result += `    像素格式: ${stream.pixelFormat}\n`;
        });
        result += '\n';
      }
      
      if (analysis.audioStreams.length > 0) {
        result += `音频流 (${analysis.audioStreams.length}个):\n`;
        analysis.audioStreams.forEach((stream, index) => {
          result += `  流 ${index + 1}: ${stream.codec} ${stream.sampleRate}Hz ${stream.channels}声道\n`;
          result += `    码率: ${stream.bitRate || '未知'}\n`;
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      throw new Error(`流分析失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleCalculateBitrate(args: unknown) {
    const { filePath } = CalculateBitrateArgsSchema.parse(args);
    
    try {
      const analysis = await this.videoAnalyzer.analyzeVideo(filePath);
      const bitrate = analysis.bitrateAnalysis;
      
      let result = `码率分析结果:\n\n`;
      result += `文件: ${analysis.filename}\n`;
      result += `文件大小: ${analysis.fileSize}\n`;
      result += `时长: ${analysis.duration}秒\n\n`;
      
      result += `码率信息:\n`;
      result += `  总体码率: ${bitrate.overallBitRate || '未知'} bps\n`;
      result += `  视频码率: ${bitrate.videoBitRate || '未知'} bps\n`;
      result += `  音频码率: ${bitrate.audioBitRate || '未知'} bps\n`;
      result += `  峰值码率: ${bitrate.maxBitRate || '未知'} bps\n`;
      result += `  估算大小: ${bitrate.estimatedSize}\n`;
      
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      throw new Error(`码率计算失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleGenerateReport(args: unknown) {
    const { filePath, format = 'json' } = GenerateReportArgsSchema.parse(args);
    
    try {
      const report = await this.videoAnalyzer.generateReport(filePath, format);
      
      return {
        content: [
          {
            type: 'text',
            text: `视频技术参数报告 (${format.toUpperCase()}格式):\n\n${report}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`报告生成失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Video Info MCP Server 已启动');
  }
}

// 启动服务器
const server = new VideoInfoMCPServer();
server.run().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});