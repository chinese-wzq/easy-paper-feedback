/**
 * GET /api/admin/results
 * 返回当前配置 + 聚合结果
 * 若无配置：{ success:false, error:'NO_CONFIG' }
 */
import { readJson, CONFIG_FILENAME, RESULTS_FILENAME } from '../../src/utils/blobHelpers'
import type { PollConfig, PollResults, ApiResponse } from '../../src/types/poll'

export default async function handler(_: any, res: any) {
  try {
    const config = await readJson<PollConfig>(CONFIG_FILENAME)
    if (!config) {
      res.status(200).json({ success: false, error: 'NO_CONFIG' } satisfies ApiResponse)
      return
    }
    const results =
      (await readJson<PollResults>(RESULTS_FILENAME)) ??
      ({
        pollId: config.id,
        totalVoters: 0,
        votes: {},
        updatedAt: new Date().toISOString()
      } as PollResults)

    res
      .status(200)
      .json({ success: true, data: { config, results } } satisfies ApiResponse<{
        config: PollConfig
        results: PollResults
      }>)
  } catch (e: any) {
    res
      .status(500)
      .json({ success: false, error: e?.message || 'INTERNAL_ERROR' } satisfies ApiResponse)
  }
}