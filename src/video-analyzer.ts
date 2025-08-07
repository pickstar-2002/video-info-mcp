import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { VideoInfo, VideoInfoSchema, ProcessedVideoInfo, VideoStream, AudioStream } from './types';

export class VideoAnalyzer {
  /**
   * 获取视频文件的原始信息
   */
  async getVideoInfo(filePath: string): Promise<VideoInfo> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(new Error(`无法读取视频文件: ${err.message}`));
          return;
        }

        try {
          const validatedData = VideoInfoSchema.parse(metadata);
          resolve(validatedData);
        } catch (parseError) {
          reject(new Error(`视频信息解析失败: ${parseError}`));
        }
      });
    });
  }

  /**
   * 处理和分析视频信息
   */
  async analyzeVideo(filePath: string, includeMetadata: boolean = true): Promise<ProcessedVideoInfo> {
    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const videoInfo = await this.getVideoInfo(filePath);
    const fileStats = await fs.stat(filePath);
    
    // 分离视频流和音频流
    const videoStreams = videoInfo.streams.filter(stream => stream.codec_type === 'video') as VideoStream[];
    const audioStreams = videoInfo.streams.filter(stream => stream.codec_type === 'audio') as AudioStream[];

    // 处理视频流信息
    const processedVideoStreams = videoStreams.map(stream => ({
      index: stream.index,
      codec: stream.codec_name,
      codecLongName: stream.codec_long_name,
      profile: stream.profile,
      resolution: `${stream.width}x${stream.height}`,
      aspectRatio: stream.display_aspect_ratio,
      pixelFormat: stream.pix_fmt,
      frameRate: stream.r_frame_rate,
      avgFrameRate: stream.avg_frame_rate,
      bitRate: stream.bit_rate,
      maxBitRate: stream.max_bit_rate,
      totalFrames: stream.nb_frames,
      colorSpace: stream.color_space,
      colorRange: stream.color_range
    }));

    // 处理音频流信息
    const processedAudioStreams = audioStreams.map(stream => ({
      index: stream.index,
      codec: stream.codec_name,
      codecLongName: stream.codec_long_name,
      profile: stream.profile,
      sampleRate: stream.sample_rate,
      channels: stream.channels,
      channelLayout: stream.channel_layout,
      sampleFormat: stream.sample_fmt,
      bitRate: stream.bit_rate,
      maxBitRate: stream.max_bit_rate
    }));

    // 计算码率分析
    const bitrateAnalysis = this.calculateBitrateAnalysis(videoInfo, fileStats.size);

    // 生成技术报告
    const technicalReport = this.generateTechnicalReport(processedVideoStreams, processedAudioStreams, bitrateAnalysis);

    return {
      filename: path.basename(filePath),
      fileSize: this.formatFileSize(fileStats.size),
      duration: videoInfo.format.duration || '未知',
      durationSeconds: parseFloat(videoInfo.format.duration || '0'),
      format: videoInfo.format.format_name,
      formatLongName: videoInfo.format.format_long_name,
      videoStreams: processedVideoStreams,
      audioStreams: processedAudioStreams,
      bitrateAnalysis,
      technicalReport
    };
  }

  /**
   * 计算码率分析
   */
  private calculateBitrateAnalysis(videoInfo: VideoInfo, fileSize: number) {
    const duration = parseFloat(videoInfo.format.duration || '0');
    const overallBitRate = videoInfo.format.bit_rate;
    
    // 计算视频和音频码率
    const videoStreams = videoInfo.streams.filter(s => s.codec_type === 'video') as VideoStream[];
    const audioStreams = videoInfo.streams.filter(s => s.codec_type === 'audio') as AudioStream[];
    
    const videoBitRate = videoStreams[0]?.bit_rate;
    const audioBitRate = audioStreams[0]?.bit_rate;
    
    // 计算最大码率
    const maxBitRates = videoInfo.streams
      .map(s => s.max_bit_rate ? parseInt(s.max_bit_rate) : 0)
      .filter(rate => rate > 0);
    const maxBitRate = maxBitRates.length > 0 ? Math.max(...maxBitRates).toString() : undefined;

    // 估算文件大小（基于码率）
    let estimatedSize = '未知';
    if (overallBitRate && duration > 0) {
      const estimatedBytes = (parseInt(overallBitRate) * duration) / 8;
      estimatedSize = this.formatFileSize(estimatedBytes);
    }

    return {
      overallBitRate,
      videoBitRate,
      audioBitRate,
      maxBitRate,
      estimatedSize
    };
  }

  /**
   * 生成技术报告
   */
  private generateTechnicalReport(videoStreams: any[], audioStreams: any[], bitrateAnalysis: any) {
    const recommendations: string[] = [];
    
    // 视频质量评估
    let videoQuality = '未知';
    if (videoStreams.length > 0) {
      const firstVideo = videoStreams[0];
      const [width, height] = firstVideo.resolution.split('x').map(Number);
      const bitRate = parseInt(firstVideo.bitRate || '0');
      
      if (height >= 2160) {
        videoQuality = '4K超高清';
      } else if (height >= 1080) {
        videoQuality = '1080p高清';
        if (bitRate < 5000000) {
          recommendations.push('建议提高视频码率以获得更好的1080p质量');
        }
      } else if (height >= 720) {
        videoQuality = '720p高清';
      } else {
        videoQuality = '标清';
        recommendations.push('考虑提升分辨率以获得更好的观看体验');
      }
    }

    // 音频质量评估
    let audioQuality = '未知';
    if (audioStreams.length > 0) {
      const firstAudio = audioStreams[0];
      const sampleRate = parseInt(firstAudio.sampleRate);
      const bitRate = parseInt(firstAudio.bitRate || '0');
      
      if (sampleRate >= 48000 && bitRate >= 320000) {
        audioQuality = '高品质';
      } else if (sampleRate >= 44100 && bitRate >= 128000) {
        audioQuality = '标准品质';
      } else {
        audioQuality = '基础品质';
        recommendations.push('建议提高音频码率和采样率');
      }
    }

    // 编码建议
    if (videoStreams.some(s => s.codec === 'h264')) {
      recommendations.push('使用H.264编码，兼容性良好');
    }
    if (videoStreams.some(s => s.codec === 'hevc' || s.codec === 'h265')) {
      recommendations.push('使用H.265编码，压缩效率更高但兼容性需要考虑');
    }

    return {
      videoQuality,
      audioQuality,
      recommendations
    };
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * 生成不同格式的报告
   */
  async generateReport(filePath: string, format: 'json' | 'text' | 'markdown' = 'json'): Promise<string> {
    const analysis = await this.analyzeVideo(filePath);
    
    switch (format) {
      case 'json':
        return JSON.stringify(analysis, null, 2);
      
      case 'text':
        return this.generateTextReport(analysis);
      
      case 'markdown':
        return this.generateMarkdownReport(analysis);
      
      default:
        return JSON.stringify(analysis, null, 2);
    }
  }

  /**
   * 生成文本格式报告
   */
  private generateTextReport(analysis: ProcessedVideoInfo): string {
    let report = '';
    
    report += `视频信息报告\n`;
    report += `${'='.repeat(50)}\n\n`;
    
    report += `基本信息:\n`;
    report += `  文件名: ${analysis.filename}\n`;
    report += `  文件大小: ${analysis.fileSize}\n`;
    report += `  时长: ${analysis.duration}秒\n`;
    report += `  格式: ${analysis.format} (${analysis.formatLongName})\n\n`;
    
    if (analysis.videoStreams.length > 0) {
      report += `视频流信息:\n`;
      analysis.videoStreams.forEach((stream, index) => {
        report += `  流 ${index + 1}:\n`;
        report += `    编码: ${stream.codec} (${stream.codecLongName})\n`;
        report += `    分辨率: ${stream.resolution}\n`;
        report += `    帧率: ${stream.frameRate}\n`;
        report += `    码率: ${stream.bitRate || '未知'}\n`;
        report += `    像素格式: ${stream.pixelFormat}\n\n`;
      });
    }
    
    if (analysis.audioStreams.length > 0) {
      report += `音频流信息:\n`;
      analysis.audioStreams.forEach((stream, index) => {
        report += `  流 ${index + 1}:\n`;
        report += `    编码: ${stream.codec} (${stream.codecLongName})\n`;
        report += `    采样率: ${stream.sampleRate}Hz\n`;
        report += `    声道数: ${stream.channels}\n`;
        report += `    码率: ${stream.bitRate || '未知'}\n\n`;
      });
    }
    
    report += `码率分析:\n`;
    report += `  总体码率: ${analysis.bitrateAnalysis.overallBitRate || '未知'}\n`;
    report += `  视频码率: ${analysis.bitrateAnalysis.videoBitRate || '未知'}\n`;
    report += `  音频码率: ${analysis.bitrateAnalysis.audioBitRate || '未知'}\n`;
    report += `  峰值码率: ${analysis.bitrateAnalysis.maxBitRate || '未知'}\n\n`;
    
    report += `技术评估:\n`;
    report += `  视频质量: ${analysis.technicalReport.videoQuality}\n`;
    report += `  音频质量: ${analysis.technicalReport.audioQuality}\n`;
    
    if (analysis.technicalReport.recommendations.length > 0) {
      report += `  建议:\n`;
      analysis.technicalReport.recommendations.forEach(rec => {
        report += `    - ${rec}\n`;
      });
    }
    
    return report;
  }

  /**
   * 生成Markdown格式报告
   */
  private generateMarkdownReport(analysis: ProcessedVideoInfo): string {
    let report = '';
    
    report += `# 视频信息报告\n\n`;
    
    report += `## 基本信息\n\n`;
    report += `| 属性 | 值 |\n`;
    report += `|------|----|\n`;
    report += `| 文件名 | ${analysis.filename} |\n`;
    report += `| 文件大小 | ${analysis.fileSize} |\n`;
    report += `| 时长 | ${analysis.duration}秒 |\n`;
    report += `| 格式 | ${analysis.format} (${analysis.formatLongName}) |\n\n`;
    
    if (analysis.videoStreams.length > 0) {
      report += `## 视频流信息\n\n`;
      analysis.videoStreams.forEach((stream, index) => {
        report += `### 视频流 ${index + 1}\n\n`;
        report += `| 属性 | 值 |\n`;
        report += `|------|----|\n`;
        report += `| 编码 | ${stream.codec} (${stream.codecLongName}) |\n`;
        report += `| 分辨率 | ${stream.resolution} |\n`;
        report += `| 帧率 | ${stream.frameRate} |\n`;
        report += `| 码率 | ${stream.bitRate || '未知'} |\n`;
        report += `| 像素格式 | ${stream.pixelFormat} |\n\n`;
      });
    }
    
    if (analysis.audioStreams.length > 0) {
      report += `## 音频流信息\n\n`;
      analysis.audioStreams.forEach((stream, index) => {
        report += `### 音频流 ${index + 1}\n\n`;
        report += `| 属性 | 值 |\n`;
        report += `|------|----|\n`;
        report += `| 编码 | ${stream.codec} (${stream.codecLongName}) |\n`;
        report += `| 采样率 | ${stream.sampleRate}Hz |\n`;
        report += `| 声道数 | ${stream.channels} |\n`;
        report += `| 码率 | ${stream.bitRate || '未知'} |\n\n`;
      });
    }
    
    report += `## 码率分析\n\n`;
    report += `| 类型 | 值 |\n`;
    report += `|------|----|\n`;
    report += `| 总体码率 | ${analysis.bitrateAnalysis.overallBitRate || '未知'} |\n`;
    report += `| 视频码率 | ${analysis.bitrateAnalysis.videoBitRate || '未知'} |\n`;
    report += `| 音频码率 | ${analysis.bitrateAnalysis.audioBitRate || '未知'} |\n`;
    report += `| 峰值码率 | ${analysis.bitrateAnalysis.maxBitRate || '未知'} |\n\n`;
    
    report += `## 技术评估\n\n`;
    report += `- **视频质量**: ${analysis.technicalReport.videoQuality}\n`;
    report += `- **音频质量**: ${analysis.technicalReport.audioQuality}\n\n`;
    
    if (analysis.technicalReport.recommendations.length > 0) {
      report += `### 建议\n\n`;
      analysis.technicalReport.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }
    
    return report;
  }
}