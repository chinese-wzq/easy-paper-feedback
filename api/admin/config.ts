/**
 * POST /api/admin/config
 * 保存/覆盖投票配置（Vercel Blob）
 * Body: PollConfig 去掉时间字段（允许省略 id / isActive，后端补齐）
 * 校验：
 *  - totalQuestions 1~200
 *  - choiceQuestions 题号不超过 totalQuestions
 *  - optionCount 2~4
 * 成功：写入 poll-config.json；若无 poll-results.json 则初始化空结果
 * 失败：{ success:false, error:<CODE> }
 */
import { readJson, writeJson, CONFIG_FILENAME, RESULTS_FILENAME } from '../../src/utils/blobHelpers'
import type { PollConfig, PollResults, ApiResponse } from '../../src/types/poll'

interface IncomingConfigLike {
  id?: string
  title: string
  totalQuestions: number
  choiceQuestions: Record<number, { optionCount: number }>
  isActive?: boolean
}

/** 读取请求体（Node 原生 req） */
async function readBody(req: any): Promise<string> {
  return await new Promise(resolve => {
    let data = ''
    req.on('data', (chunk: any) => {
      data += chunk
    })
    req.on('end', () => resolve(data))
  })
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' } satisfies ApiResponse)
    return
  }

  try {
    const raw = await readBody(req)
    let payload: IncomingConfigLike
    try {
      payload = raw ? JSON.parse(raw) : {}
    } catch {
      res.status(200).json({ success: false, error: 'INVALID_JSON' } satisfies ApiResponse)
      return
    }

    // 基本字段存在性校验
    if (
      !payload ||
      typeof payload.title !== 'string' ||
      typeof payload.totalQuestions !== 'number' ||
      typeof payload.choiceQuestions !== 'object'
    ) {
      res.status(200).json({ success: false, error: 'INVALID_PAYLOAD' } satisfies ApiResponse)
      return
    }

    // 业务校验
    const { totalQuestions, choiceQuestions } = payload
    if (totalQuestions < 1 || totalQuestions > 200) {
      res.status(200).json({ success: false, error: 'VALIDATION_ERROR' } satisfies ApiResponse)
      return
    }
    for (const key in choiceQuestions) {
      const qId = Number(key)
      const cfg = choiceQuestions[qId]
      if (qId < 1 || qId > totalQuestions) {
        res.status(200).json({ success: false, error: 'VALIDATION_ERROR' } satisfies ApiResponse)
        return
      }
      if (!cfg || typeof cfg.optionCount !== 'number' || cfg.optionCount < 2 || cfg.optionCount > 4) {
        res.status(200).json({ success: false, error: 'VALIDATION_ERROR' } satisfies ApiResponse)
        return
      }
    }

    // 读取旧配置以保留 createdAt
    const existingConfig = await readJson<PollConfig>(CONFIG_FILENAME)
    const now = new Date().toISOString()

    const finalConfig: PollConfig = {
      id: payload.id || existingConfig?.id || 'default',
      title: payload.title,
      totalQuestions,
      choiceQuestions,
      isActive: payload.isActive ?? true,
      createdAt: existingConfig?.createdAt || now,
      updatedAt: now
    }

    await writeJson(CONFIG_FILENAME, finalConfig)

    // 若还没有结果文件则初始化
    const existingResults = await readJson<PollResults>(RESULTS_FILENAME)
    if (!existingResults) {
      const initResults: PollResults = {
        pollId: finalConfig.id,
        totalVoters: 0,
        votes: {},
        updatedAt: now
      }
      await writeJson(RESULTS_FILENAME, initResults)
    }

    res.status(200).json({ success: true, data: finalConfig } satisfies ApiResponse<PollConfig>)
  } catch (e: any) {
    res
      .status(500)
      .json({ success: false, error: e?.message || 'INTERNAL_ERROR' } satisfies ApiResponse)
  }
}