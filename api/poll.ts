/**
 * GET /api/poll
 * 读取当前投票配置（Vercel Blob）
 * 若不存在：返回 { success:false, error:'NO_CONFIG' }
 */
import { readJson, CONFIG_FILENAME } from '../src/utils/blobHelpers'
import type { PollConfig, ApiResponse } from '../src/types/poll'

export default async function handler(_: any, res: any) {
  try {
    const config = await readJson<PollConfig>(CONFIG_FILENAME)
    if (!config) {
      res.status(200).json({ success: false, error: 'NO_CONFIG' } satisfies ApiResponse)
      return
    }
    res.status(200).json({ success: true, data: config } satisfies ApiResponse<PollConfig>)
  } catch (e: any) {
    // 基础错误捕获
    res
      .status(500)
      .json({ success: false, error: e?.message || 'INTERNAL_ERROR' } satisfies ApiResponse)
  }
}