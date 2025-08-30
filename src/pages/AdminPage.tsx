/**
 * 管理端页面：接入后端保存配置 + 查看结果
 * 功能：
 *  - 本地编辑题目总数 & 选择题配置
 *  - 保存 => POST /api/admin/config
 *  - 刷新结果 => GET /api/admin/results (console.log 输出)
 *  - 错误提示条
 */
import React, { useState } from 'react'
import QuestionGrid from '../components/QuestionGrid'
import { ChoiceQuestionConfig, PollConfig } from '../types/poll'
import { saveConfig, fetchResults } from '../utils/api'

const AdminPage: React.FC = () => {
  // 基础编辑状态
  const [totalQuestions, setTotalQuestions] = useState<number>(20)
  const [choiceConfigMap, setChoiceConfigMap] = useState<Record<number, ChoiceQuestionConfig>>({
    2: { optionCount: 4 },
    5: { optionCount: 3 },
    9: { optionCount: 4 }
  })
  const [editTypeMode, setEditTypeMode] = useState<boolean>(true)

  // UI 状态
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSavedConfig, setLastSavedConfig] = useState<PollConfig | null>(null)

  /** 判断题型 */
  function getQuestionType(id: number) {
    return choiceConfigMap[id] ? 'choice' : 'normal'
  }

  /** 切换题型（普通 ↔ 选择） */
  function toggleQuestionType(id: number) {
    setChoiceConfigMap(prev => {
      if (prev[id]) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: { optionCount: 4 } }
    })
  }

  /** 循环选项数 2→3→4→2 */
  function cycleOptionCount(id: number) {
    const cfg = choiceConfigMap[id]
    if (!cfg) return
    const curr = cfg.optionCount
    const next = curr === 2 ? 3 : curr === 3 ? 4 : 2
    setChoiceConfigMap(prev => ({ ...prev, [id]: { optionCount: next } }))
  }

  /** 题目格子点击主行为 */
  function handleGridClick(id: number) {
    if (editTypeMode) {
      toggleQuestionType(id)
    } else {
      if (choiceConfigMap[id]) {
        cycleOptionCount(id)
      }
    }
  }

  /** 组装给 QuestionGrid 的 choiceMap */
  function getChoiceMap() {
    const map: Record<number, { optionCount: number }> = {}
    for (const k in choiceConfigMap) {
      const id = Number(k)
      map[id] = { optionCount: choiceConfigMap[id].optionCount }
    }
    return map
  }

  /** 保存配置到后端 */
  async function handleSave() {
    setError(null)
    if (totalQuestions < 1 || totalQuestions > 200) {
      setError('题目总数需在 1~200')
      return
    }
    // 简单本地校验
    for (const key in choiceConfigMap) {
      const id = Number(key)
      if (id < 1 || id > totalQuestions) {
        setError(`选择题题号 ${id} 超出范围`)
        return
      }
      const oc = choiceConfigMap[id].optionCount
      if (oc < 2 || oc > 4) {
        setError(`题号 ${id} 选项数非法`)
        return
      }
    }

    const payload = {
      title: '试卷错题反馈',
      totalQuestions,
      choiceQuestions: Object.fromEntries(
        Object.entries(choiceConfigMap).map(([k, v]) => [Number(k), { optionCount: v.optionCount }])
      )
    }
    setSaving(true)
    try {
      const saved = await saveConfig(payload)
      setLastSavedConfig(saved)
      console.log('[admin] 配置已保存：', saved)
    } catch (e: any) {
      setError(e?.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  /** 刷新结果 */
  async function handleRefreshResults() {
    setError(null)
    try {
      const data = await fetchResults()
      console.log('[admin] 当前配置 + 结果：', data)
    } catch (e: any) {
      setError(e?.message || '拉取结果失败')
    }
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
        <h1 className="text-2xl font-bold">管理后台</h1>
        <p className="text-sm text-gray-600">
          使用上方工具开关控制点击行为：开启=切换题型；关闭=循环选项数。
        </p>
      </header>

      {/* 工具与基础配置 */}
      <section className="rounded-lg border bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center gap-8">
          {/* 题目总数设置 */}
            <div className="flex items-center gap-2">
              <label className="text-gray-700 font-medium">题目总数：</label>
              <input
                type="number"
                min={1}
                max={200}
                value={totalQuestions}
                onChange={e => setTotalQuestions(Number(e.target.value) || 0)}
                className="w-24 px-2 py-1 border rounded"
              />
            </div>

          {/* 题型切换模式开关 */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
              <input
                type="checkbox"
                checked={editTypeMode}
                onChange={e => setEditTypeMode(e.target.checked)}
                className="accent-blue-600 w-4 h-4"
              />
              <span className="font-medium">题型切换模式</span>
            </label>
            <span className="text-xs text-gray-400">
              {editTypeMode ? '单击=切换普通/选择题' : '单击=循环选项数'}
            </span>
          </div>
        </div>

        {/* 模式说明 */}
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-3 leading-relaxed">
          <div>
            当前模式：
            <span className="font-semibold text-blue-600 ml-1">
              {editTypeMode ? '题型切换' : '选项循环'}
            </span>
          </div>
          <div className="mt-1">
            {editTypeMode
              ? '点击任意题目：普通题 ↔ 选择题（新建选择题默认 4 个选项）'
              : '点击选择题：循环选项数 2 → 3 → 4 → 2（普通题点击无动作）'}
          </div>
        </div>

        {/* 保存状态 */}
        {lastSavedConfig && (
          <div className="text-xs text-green-600">
            最近保存：{new Date(lastSavedConfig.updatedAt).toLocaleTimeString()}
          </div>
        )}
      </section>

      {/* 预览区 */}
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <QuestionGrid
          total={totalQuestions}
          choiceMap={getChoiceMap()}
          onQuestionClick={handleGridClick}
          getQuestionType={getQuestionType}
        />
      </section>

      {/* 操作按钮 */}
      <section className="flex gap-4 justify-end">
        <button
          className={`px-5 py-2 rounded font-bold text-white ${
            saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存配置'}
        </button>
        <button
          className="px-5 py-2 rounded bg-indigo-500 text-white font-bold hover:bg-indigo-600"
          onClick={handleRefreshResults}
          disabled={saving}
        >
          刷新结果(打印)
        </button>
      </section>
    </main>
  )
}

export default AdminPage
