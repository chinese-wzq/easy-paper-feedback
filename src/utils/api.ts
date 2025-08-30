// src/utils/api.ts
// 投票相关本地假 API，后续可接后端

import { PollConfig, FrontendVoteState } from '../types/poll'

/**
 * 获取投票配置（本地 mock 数据）
 */
export async function fetchPollConfig(): Promise<PollConfig> {
  // 假数据，后续可从后端获取
  return {
    id: 'demo',
    title: '试卷错题反馈',
    totalQuestions: 20,
    choiceQuestions: {
      2: { optionCount: 4 },
      5: { optionCount: 3 },
      9: { optionCount: 4 }
    },
    isActive: true,
    createdAt: '2025-08-30T00:00:00.000Z',
    updatedAt: '2025-08-30T00:00:00.000Z'
  }
}

/**
 * 提交投票（仅 console.log，模拟异步）
 */
export async function submitVote(vote: FrontendVoteState): Promise<{ success: boolean }> {
  // 输出到控制台，后续可接后端
  console.log('提交投票：', vote)
  return Promise.resolve({ success: true })
}
