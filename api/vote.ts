/**
 * POST /api/vote
 * 学生提交一次投票
 * 流程：
 *  a. 读取 poll-config.json，若缺失 -> { success:false, error:'NO_CONFIG' }
 *  b. 读取 / 初始化 poll-results.json
 *  c. 聚合：wrongQuestions 递增 wrongCount；choiceSelections 递增各选项
 *  d. totalVoters++
 *  e. 写回（失败一次再重试一次）
 *  f. 返回 { success:true }
 *
 * 并发策略：简单覆盖 + 单次重试，不做 ETag CAS
 */
import { readJson, writeJson, CONFIG_FILENAME, RESULTS_FILENAME } from '../src/utils/blobHelpers'
import type { PollConfig, PollResults, ApiResponse, VoteSubmission } from '../src/types/poll'

/** 读取原始请求体 */
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
    let payload: VoteSubmission
    try {
      payload = raw ? JSON.parse(raw) : {}
    } catch {
      res.status(200).json({ success: false, error: 'INVALID_JSON' } satisfies ApiResponse)
      return
    }

    // 基础结构校验（最小）
    if (
      !payload ||
      !Array.isArray(payload.wrongQuestions) ||
      typeof payload.choiceSelections !== 'object' ||
      payload.choiceSelections === null
    ) {
      res.status(200).json({ success: false, error: 'INVALID_PAYLOAD' } satisfies ApiResponse)
      return
    }

    // 读取配置
    const config = await readJson<PollConfig>(CONFIG_FILENAME)
    if (!config) {
      res.status(200).json({ success: false, error: 'NO_CONFIG' } satisfies ApiResponse)
      return
    }

    // 读取结果（不存在则初始化空对象）
    let results =
      (await readJson<PollResults>(RESULTS_FILENAME)) ??
      ({
        pollId: config.id,
        totalVoters: 0,
        votes: {},
        updatedAt: new Date().toISOString()
      } as PollResults)

    // 聚合逻辑
    for (const q of payload.wrongQuestions) {
      const qid = Number(q)
      if (!results.votes[qid]) {
        results.votes[qid] = { wrongCount: 0, choiceVotes: {} }
      }
      results.votes[qid].wrongCount += 1
    }

    for (const key in payload.choiceSelections) {
      const qid = Number(key)
      const selections = payload.choiceSelections[qid]
      if (!Array.isArray(selections)) continue
      if (!results.votes[qid]) {
        results.votes[qid] = { wrongCount: 0, choiceVotes: {} }
      }
      for (const opt of selections) {
        if (!results.votes[qid].choiceVotes[opt]) {
          results.votes[qid].choiceVotes[opt] = 0
        }
        results.votes[qid].choiceVotes[opt] += 1
      }
    }

    results.totalVoters += 1
    results.updatedAt = new Date().toISOString()

    // 写回（一次重试）
    try {
      await writeJson(RESULTS_FILENAME, results)
    } catch (e) {
      console.warn('写入结果首次失败，重试一次', e)
      await writeJson(RESULTS_FILENAME, results)
    }

    // 控制台日志（适度）
    console.log('[vote] 投票已聚合：', {
      totalVoters: results.totalVoters
    })

    res.status(200).json({ success: true } satisfies ApiResponse)
  } catch (e: any) {
    res
      .status(500)
      .json({ success: false, error: e?.message || 'INTERNAL_ERROR' } satisfies ApiResponse)
  }
}