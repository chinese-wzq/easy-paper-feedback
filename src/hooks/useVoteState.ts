// src/hooks/useVoteState.ts
import { useState } from 'react'
import { FrontendVoteState } from '../types/poll'

/**
 * 学生端投票状态管理 hook
 * 管理错题集合与选择题选项
 */
export function useVoteState(initial?: Partial<FrontendVoteState>) {
  // 错题集合
  const [wrongSet, setWrongSet] = useState<Set<number>>(initial?.wrongSet ?? new Set())
  // 选择题选项
  const [choiceSelections, setChoiceSelections] = useState<Record<number, Set<string>>>(
    initial?.choiceSelections ?? {}
  )

  // 切换错题标记
  function toggleWrong(id: number) {
    setWrongSet(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // 设置选择题选项
  function setChoice(id: number, opts: string[]) {
    setChoiceSelections(prev => ({
      ...prev,
      [id]: new Set(opts)
    }))
  }

  // 重置状态
  function reset() {
    setWrongSet(new Set())
    setChoiceSelections({})
  }

  // 导出当前状态
  function getState(): FrontendVoteState {
    return {
      wrongSet,
      choiceSelections
    }
  }

  return {
    wrongSet,
    choiceSelections,
    toggleWrong,
    setChoiceSelections: setChoice,
    reset,
    getState
  }
}
