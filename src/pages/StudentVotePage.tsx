/* src/pages/StudentVotePage.tsx
 * 接入真实后端：
 *  - 初次加载 GET /api/poll（可能返回 NO_CONFIG => 显示提示）
 *  - 提交 POST /api/vote（成功后重置本地状态）
 *  - 基础错误展示（顶部条）
 */
import React, { useEffect, useState } from 'react'
import { fetchPollConfig, submitVote } from '../utils/api'
import { PollConfig } from '../types/poll'
import QuestionGrid from '../components/QuestionGrid'
import ChoiceModal from '../components/ChoiceModal'
import { useVoteState } from '../hooks/useVoteState'

const StudentVotePage: React.FC = () => {
  const [config, setConfig] = useState<PollConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 弹窗相关
  const [activeModal, setActiveModal] = useState<number | null>(null)
  const [modalOptionCount, setModalOptionCount] = useState(4)
  const [modalSelected, setModalSelected] = useState<string[]>([])

  // 投票本地状态
  const vote = useVoteState()

  // 拉取配置（初始化）
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const cfg = await fetchPollConfig()
        if (!cfg) {
          setError('当前尚未创建配置，请联系老师或管理员。')
        } else {
          setConfig(cfg)
        }
      } catch (e: any) {
        setError(e?.message || '加载失败')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  function getQuestionType(id: number) {
    return config?.choiceQuestions[id] ? 'choice' : 'normal'
  }

  function handleQuestionClick(id: number) {
    if (!config) return
    if (getQuestionType(id) === 'normal') {
      vote.toggleWrong(id)
    } else {
      setActiveModal(id)
      setModalOptionCount(config.choiceQuestions[id]?.optionCount || 4)
      const selSet = vote.choiceSelections[id]
      setModalSelected(selSet ? Array.from(selSet) : [])
    }
  }

  function handleModalConfirm(opts: string[]) {
    if (activeModal != null) {
      vote.setChoiceSelections(activeModal, opts)
    }
    setActiveModal(null)
  }

  function handleModalClose() {
    setActiveModal(null)
  }

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

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    try {
      await submitVote(vote.getState())
      console.log('[student] 投票成功')
      vote.reset()
    } catch (e: any) {
      setError(e?.message || '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    vote.reset()
  }

  return (
    <main className="container-responsive py-10 space-y-6">
      {/* 错误条 */}
      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <header className="space-y-2">
        <h1 className="text-2xl font-bold">试卷讲解优先级投票</h1>
        <p className="text-sm text-gray-600">
          请选择你认为需要优先讲解的题目，错题直接点击标记，选择题可多选选项。
        </p>
      </header>

      <section className="rounded-lg border bg-white p-6 shadow-sm min-h-[200px]">
        {loading ? (
          <div className="text-gray-400">加载中...</div>
        ) : !config ? (
          <div className="text-gray-400">暂无配置</div>
        ) : (
          <QuestionGrid
            total={config.totalQuestions}
            choiceMap={getChoiceMap()}
            wrongSet={vote.wrongSet}
            onQuestionClick={handleQuestionClick}
            getQuestionType={getQuestionType}
          />
        )}
      </section>

      <ChoiceModal
        open={!!config && activeModal != null}
        questionId={activeModal}
        optionCount={modalOptionCount}
        selected={modalSelected}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />

      <section className="flex gap-4 justify-end">
        <button
          disabled={!config || submitting}
          className={`px-5 py-2 rounded font-bold text-white ${
            !config || submitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          onClick={handleSubmit}
        >
          {submitting ? '提交中...' : '提交'}
        </button>
        <button
          className="px-5 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
          onClick={handleReset}
          disabled={submitting}
        >
          重置
        </button>
      </section>
    </main>
  )
}

export default StudentVotePage
