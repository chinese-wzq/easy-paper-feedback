/**
 * 真实后端 API 封装（第三阶段）
 * 替换原本的本地 mock
 */
import { PollConfig, FrontendVoteState, VoteSubmission, ApiResponse, PollResults } from '../types/poll'

/** 通用请求封装：失败时抛出 Error，message=error code */
async function handleResponse<T>(res: Response): Promise<T> {
  let json: ApiResponse<T>
  try {
    json = await res.json()
  } catch {
    throw new Error('INVALID_JSON')
  }
  if (!json.success) {
    throw new Error(json.error || 'UNKNOWN_ERROR')
  }
  return json.data as T
}

/** GET /api/poll */
export async function fetchPollConfig(): Promise<PollConfig | null> {
  const res = await fetch('/api/poll')
  const data = await res.json() as ApiResponse<PollConfig>
  if (!data.success) {
    if (data.error === 'NO_CONFIG') return null
    throw new Error(data.error || 'UNKNOWN_ERROR')
  }
  return data.data!
}

/** POST /api/admin/config */
export async function saveConfig(payload: {
  title: string
  totalQuestions: number
  choiceQuestions: Record<number, { optionCount: number }>
  isActive?: boolean
  id?: string
}): Promise<PollConfig> {
  const res = await fetch('/api/admin/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return handleResponse<PollConfig>(res)
}

/** 将前端本地状态转换为提交载荷 */
function mapVoteState(state: FrontendVoteState): VoteSubmission {
  return {
    wrongQuestions: Array.from(state.wrongSet),
    choiceSelections: Object.fromEntries(
      Object.entries(state.choiceSelections).map(([k, set]) => [k, Array.from(set)])
    )
  }
}

/** POST /api/vote （含一次简单重试：网络或 5xx） */
export async function submitVote(frontState: FrontendVoteState): Promise<void> {
  const submission = mapVoteState(frontState)
  async function once() {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    })
    await handleResponse<null | { ok: boolean }>(res)
  }
  try {
    await once()
  } catch (e: any) {
    // 简单重试（只重试一次）
    console.warn('submitVote 首次失败，重试一次：', e?.message)
    await once()
  }
}

/** GET /api/admin/results */
export async function fetchResults(): Promise<{ config: PollConfig; results: PollResults }> {
  const res = await fetch('/api/admin/results')
  return handleResponse<{ config: PollConfig; results: PollResults }>(res)
}

/** POST /api/admin/clear-results 清空聚合结果 */
export async function clearResults(): Promise<PollResults> {
  const res = await fetch('/api/admin/clear-results', { method: 'POST' })
  return handleResponse<PollResults>(res)
}
