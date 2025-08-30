/**
 * POST /api/admin/clear-results
 * 功能：清空当前配置对应的聚合结果（votes / totalVoters 重置）
 * 前置：必须已经存在 poll-config.json
 * 返回：
 *  - 成功：{ success:true, data: PollResults }
 *  - 失败：{ success:false, error:'NO_CONFIG' | 'BLOB_WRITE_FAILED' | 'INTERNAL_ERROR' }
 */
import { readJson, writeJson, CONFIG_FILENAME, RESULTS_FILENAME } from '../../src/utils/blobHelpers'
import type { PollConfig, PollResults, ApiResponse } from '../../src/types/poll'

/** 读取 body（虽然本接口当前不需要，但保持一致性，便于以后扩展） */
async function readBody(req: any): Promise<string> {
  return await new Promise(resolve => {
    let data = ''
    req.on('data', (c: any) => (data += c))
    req.on('end', () => resolve(data))
  })
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' } satisfies ApiResponse)
    return
  }

  try {
    await readBody(req) // 占位：忽略内容
    const config = await readJson<PollConfig>(CONFIG_FILENAME)
    if (!config) {
      res.status(200).json({ success: false, error: 'NO_CONFIG' } satisfies ApiResponse)
      return
    }
    const now = new Date().toISOString()
    const cleared: PollResults = {
      pollId: config.id,
      totalVoters: 0,
      votes: {},
      updatedAt: now
    }
    await writeJson(RESULTS_FILENAME, cleared)
    res.status(200).json({ success: true, data: cleared } satisfies ApiResponse<PollResults>)
  } catch (e: any) {
    res
      .status(500)
      .json({ success: false, error: e?.message || 'INTERNAL_ERROR' } satisfies ApiResponse)
  }
}