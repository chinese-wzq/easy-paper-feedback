// src/pages/AdminPage.tsx
import React, { useState } from 'react'
import QuestionGrid from '../components/QuestionGrid'
import { PollConfig, ChoiceQuestionConfig } from '../types/poll'

/**
 * 管理端页面（带题型切换工具开关）
 * 工具：题型切换模式开关
 * - 开启：单击方块 => 普通题 ↔ 选择题（新增选择题默认 4 选项）
 * - 关闭：单击方块 => 若为选择题循环选项数 2→3→4→2；普通题忽略
 */
const AdminPage: React.FC = () => {
  // 题目总数
  const [totalQuestions, setTotalQuestions] = useState<number>(20)
  // 选择题配置
  const [choiceConfigMap, setChoiceConfigMap] = useState<Record<number, ChoiceQuestionConfig>>({
    2: { optionCount: 4 },
    5: { optionCount: 3 },
    9: { optionCount: 4 }
  })
  // 题型切换模式开关
  const [editTypeMode, setEditTypeMode] = useState<boolean>(true)

  // 判断题型
  function getQuestionType(id: number) {
    return choiceConfigMap[id] ? 'choice' : 'normal'
  }

  // 切换题型（普通 ↔ 选择）
  function toggleQuestionType(id: number) {
    if (choiceConfigMap[id]) {
      // 删除选择题配置，变为普通题
      const next = { ...choiceConfigMap }
      delete next[id]
      setChoiceConfigMap(next)
    } else {
      // 添加选择题配置，默认 4 选项
      setChoiceConfigMap(prev => ({
        ...prev,
        [id]: { optionCount: 4 }
      }))
    }
  }

  // 循环选项数 2→3→4→2
  function cycleOptionCount(id: number) {
    const cfg = choiceConfigMap[id]
    if (!cfg) return
    const curr = cfg.optionCount
    const next = curr === 2 ? 3 : curr === 3 ? 4 : 2
    setChoiceConfigMap(prev => ({
      ...prev,
      [id]: { optionCount: next }
    }))
  }

  // 主点击行为（由模式控制）
  function handleGridClick(id: number) {
    if (editTypeMode) {
      // 题型切换模式：点击切换普通题 ↔ 选择题
      toggleQuestionType(id)
    } else {
      // 选项循环模式：点击选择题循环选项数
      if (choiceConfigMap[id]) {
        cycleOptionCount(id)
      }
      // 普通题在此模式下点击无动作
    }
  }

  // 组装 choiceMap
  function getChoiceMap() {
    const map: Record<number, { optionCount: number }> = {}
    for (const k in choiceConfigMap) {
      const id = Number(k)
      map[id] = { optionCount: choiceConfigMap[id].optionCount }
    }
    return map
  }

  // 保存配置（当前仅 console.log）
  function handleSave() {
    const payload: Partial<PollConfig> = {
      title: '试卷错题反馈',
      totalQuestions,
      choiceQuestions: choiceConfigMap
    }
    console.log('保存配置：', payload)
  }

  return (
    <main className="container-responsive py-10 space-y-6">
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

      {/* 保存按钮 */}
      <section className="flex gap-4 justify-end">
        <button
          className="px-5 py-2 rounded bg-blue-500 text-white font-bold hover:bg-blue-600"
          onClick={handleSave}
        >
          保存配置
        </button>
      </section>
    </main>
  )
}

export default AdminPage
