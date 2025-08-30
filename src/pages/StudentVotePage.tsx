// src/pages/StudentVotePage.tsx
import React, { useEffect, useState } from 'react'
import { fetchPollConfig, submitVote } from '../utils/api'
import { PollConfig } from '../types/poll'
import QuestionGrid from '../components/QuestionGrid'
import ChoiceModal from '../components/ChoiceModal'
import { useVoteState } from '../hooks/useVoteState'

/**
 * 学生端投票页面
 * 展示题目网格，支持错题标记与选择题选项
 */
const StudentVotePage: React.FC = () => {
  // 投票配置
  const [config, setConfig] = useState<PollConfig | null>(null)
  // 当前弹窗题号（选择题）
  const [activeModal, setActiveModal] = useState<number | null>(null)
  // 选择题弹窗选项数
  const [modalOptionCount, setModalOptionCount] = useState(4)
  // 当前弹窗已选项
  const [modalSelected, setModalSelected] = useState<string[]>([])

  // 投票本地状态
  const vote = useVoteState()

  // 拉取配置
  useEffect(() => {
    fetchPollConfig().then(cfg => setConfig(cfg))
  }, [])

  // 判断题型
  function getQuestionType(id: number) {
    return config?.choiceQuestions[id] ? 'choice' : 'normal'
  }

  // 处理题目点击
  function handleQuestionClick(id: number) {
    if (getQuestionType(id) === 'normal') {
      vote.toggleWrong(id)
    } else {
      setActiveModal(id)
      setModalOptionCount(config?.choiceQuestions[id]?.optionCount || 4)
      // 取当前已选项
      const selSet = vote.choiceSelections[id]
      setModalSelected(selSet ? Array.from(selSet) : [])
    }
  }

  // 弹窗确认
  function handleModalConfirm(opts: string[]) {
    if (activeModal != null) {
      vote.setChoiceSelections(activeModal, opts)
    }
    setActiveModal(null)
  }

  // 弹窗关闭
  function handleModalClose() {
    setActiveModal(null)
  }

  // 组装 QuestionGrid 需要的 choiceMap
  function getChoiceMap() {
    const map: Record<number, { optionCount: number; selectedOptions?: string[] }> = {}
    if (!config) return map
    for (const key in config.choiceQuestions) {
      const id = Number(key)
      map[id] = {
        optionCount: config.choiceQuestions[id].optionCount,
        selectedOptions: vote.choiceSelections[id] ? Array.from(vote.choiceSelections[id]) : []
      }
    }
    return map
  }

  // 提交
  function handleSubmit() {
    const payload = vote.getState()
    console.log('投票提交：', payload)
    submitVote(payload)
  }

  // 重置
  function handleReset() {
    vote.reset()
  }

  return (
    <main className="container-responsive py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">试卷讲解优先级投票</h1>
        <p className="text-sm text-gray-600">
          请选择你认为需要优先讲解的题目，错题直接点击标记，选择题可多选选项。
        </p>
      </header>

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        {/* 题目网格 */}
        {config ? (
          <QuestionGrid
            total={config.totalQuestions}
            choiceMap={getChoiceMap()}
            wrongSet={vote.wrongSet}
            onQuestionClick={handleQuestionClick}
            getQuestionType={getQuestionType}
          />
        ) : (
          <div className="text-gray-400">加载中...</div>
        )}
      </section>

      {/* 选择题弹窗 */}
      <ChoiceModal
        open={activeModal != null}
        questionId={activeModal}
        optionCount={modalOptionCount}
        selected={modalSelected}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />

      {/* 底部操作区 */}
      <section className="flex gap-4 justify-end">
        <button
          className="px-5 py-2 rounded bg-blue-500 text-white font-bold hover:bg-blue-600"
          onClick={handleSubmit}
        >
          提交
        </button>
        <button
          className="px-5 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
          onClick={handleReset}
        >
          重置
        </button>
      </section>
    </main>
  )
}

export default StudentVotePage
