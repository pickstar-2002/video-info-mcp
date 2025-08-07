import { z } from 'zod';

// 视频流信息
export const VideoStreamSchema = z.object({
  index: z.number(),
  codec_name: z.string(),
  codec_long_name: z.string(),
  profile: z.string().optional(),
  codec_type: z.literal('video'),
  width: z.number(),
  height: z.number(),
  coded_width: z.number().optional(),
  coded_height: z.number().optional(),
  closed_captions: z.number().optional(),
  film_grain: z.number().optional(),
  has_b_frames: z.number().optional(),
  sample_aspect_ratio: z.string().optional(),
  display_aspect_ratio: z.string().optional(),
  pix_fmt: z.string(),
  level: z.number().optional(),
  color_range: z.string().optional(),
  color_space: z.string().optional(),
  color_transfer: z.string().optional(),
  color_primaries: z.string().optional(),
  chroma_location: z.string().optional(),
  field_order: z.string().optional(),
  refs: z.number().optional(),
  is_avc: z.string().optional(),
  nal_length_size: z.string().optional(),
  r_frame_rate: z.string(),
  avg_frame_rate: z.string(),
  time_base: z.string(),
  start_pts: z.number().optional(),
  start_time: z.string().optional(),
  duration_ts: z.number().optional(),
  duration: z.string().optional(),
  bit_rate: z.string().optional(),
  max_bit_rate: z.string().optional(),
  bits_per_raw_sample: z.string().optional(),
  nb_frames: z.string().optional(),
  extradata_size: z.number().optional(),
  disposition: z.record(z.number()).optional(),
  tags: z.record(z.string()).optional()
});

// 音频流信息
export const AudioStreamSchema = z.object({
  index: z.number(),
  codec_name: z.string(),
  codec_long_name: z.string(),
  profile: z.string().optional(),
  codec_type: z.literal('audio'),
  sample_fmt: z.string(),
  sample_rate: z.string(),
  channels: z.number(),
  channel_layout: z.string().optional(),
  bits_per_sample: z.number().optional(),
  initial_padding: z.number().optional(),
  r_frame_rate: z.string(),
  avg_frame_rate: z.string(),
  time_base: z.string(),
  start_pts: z.number().optional(),
  start_time: z.string().optional(),
  duration_ts: z.number().optional(),
  duration: z.string().optional(),
  bit_rate: z.string().optional(),
  max_bit_rate: z.string().optional(),
  nb_frames: z.string().optional(),
  extradata_size: z.number().optional(),
  disposition: z.record(z.number()).optional(),
  tags: z.record(z.string()).optional()
});

// 格式信息
export const FormatSchema = z.object({
  filename: z.string(),
  nb_streams: z.number(),
  nb_programs: z.number(),
  format_name: z.string(),
  format_long_name: z.string(),
  start_time: z.string().optional(),
  duration: z.string().optional(),
  size: z.string().optional(),
  bit_rate: z.string().optional(),
  probe_score: z.number().optional(),
  tags: z.record(z.string()).optional()
});

// 完整的视频信息
export const VideoInfoSchema = z.object({
  streams: z.array(z.union([VideoStreamSchema, AudioStreamSchema])),
  format: FormatSchema
});

export type VideoStream = z.infer<typeof VideoStreamSchema>;
export type AudioStream = z.infer<typeof AudioStreamSchema>;
export type Format = z.infer<typeof FormatSchema>;
export type VideoInfo = z.infer<typeof VideoInfoSchema>;

// 处理后的视频信息
export interface ProcessedVideoInfo {
  // 基本信息
  filename: string;
  fileSize: string;
  duration: string;
  durationSeconds: number;
  format: string;
  formatLongName: string;
  
  // 视频流信息
  videoStreams: {
    index: number;
    codec: string;
    codecLongName: string;
    profile?: string;
    resolution: string;
    aspectRatio?: string;
    pixelFormat: string;
    frameRate: string;
    avgFrameRate: string;
    bitRate?: string;
    maxBitRate?: string;
    totalFrames?: string;
    colorSpace?: string;
    colorRange?: string;
  }[];
  
  // 音频流信息
  audioStreams: {
    index: number;
    codec: string;
    codecLongName: string;
    profile?: string;
    sampleRate: string;
    channels: number;
    channelLayout?: string;
    sampleFormat: string;
    bitRate?: string;
    maxBitRate?: string;
  }[];
  
  // 码率分析
  bitrateAnalysis: {
    overallBitRate?: string;
    videoBitRate?: string;
    audioBitRate?: string;
    maxBitRate?: string;
    estimatedSize: string;
  };
  
  // 技术参数报告
  technicalReport: {
    videoQuality: string;
    audioQuality: string;
    compressionRatio?: string;
    recommendations: string[];
  };
}

// 工具参数
export const GetVideoInfoArgsSchema = z.object({
  filePath: z.string().describe('视频文件路径')
});

export const AnalyzeStreamsArgsSchema = z.object({
  filePath: z.string().describe('视频文件路径'),
  includeMetadata: z.boolean().optional().describe('是否包含元数据信息')
});

export const CalculateBitrateArgsSchema = z.object({
  filePath: z.string().describe('视频文件路径'),
  sampleDuration: z.number().optional().describe('采样时长（秒），用于计算峰值码率')
});

export const GenerateReportArgsSchema = z.object({
  filePath: z.string().describe('视频文件路径'),
  format: z.enum(['json', 'text', 'markdown']).optional().describe('报告格式')
});

export type GetVideoInfoArgs = z.infer<typeof GetVideoInfoArgsSchema>;
export type AnalyzeStreamsArgs = z.infer<typeof AnalyzeStreamsArgsSchema>;
export type CalculateBitrateArgs = z.infer<typeof CalculateBitrateArgsSchema>;
export type GenerateReportArgs = z.infer<typeof GenerateReportArgsSchema>;