// src/pages/AdminPage.tsx
import React, { useState } from 'react'
import QuestionGrid from '../components/QuestionGrid'
import { PollConfig, ChoiceQuestionConfig } from '../types/poll'

/**
 * 管理端页面
 * 支持题目总数、选择题配置、预览与保存
 */
const AdminPage: React.FC = () => {
  // 题目总数
  const [totalQuestions, setTotalQuestions] = useState<number>(20)
  // 选择题配置（key:题号，value:选项数）
  const [choiceConfigMap, setChoiceConfigMap] = useState<Record<number, ChoiceQuestionConfig>>({
    2: { optionCount: 4 },
    5: { optionCount: 3 },
    9: { optionCount: 4 }
  })

  // 判断题型
  function getQuestionType(id: number) {
    return choiceConfigMap[id] ? 'choice' : 'normal'
  }

  // 网格点击：普通题 <-> 选择题切换
  function handleQuestionClick(id: number) {
    if (getQuestionType(id) === 'normal') {
      setChoiceConfigMap(prev => ({
        ...prev,
        [id]: { optionCount: 4 }
      }))
    } else {
      // 选择题切换为普通题
      const next = { ...choiceConfigMap }
      delete next[id]
      setChoiceConfigMap(next)
    }
  }

  // 切换选项数（2->3->4->2）
  function handleOptionCountCycle(id: number) {
    if (!choiceConfigMap[id]) return
    const curr = choiceConfigMap[id].optionCount
    const next = curr === 2 ? 3 : curr === 3 ? 4 : 2
    setChoiceConfigMap(prev => ({
      ...prev,
      [id]: { optionCount: next }
    }))
  }

  // 组装 choiceMap 供预览
  function getChoiceMap() {
    const map: Record<number, { optionCount: number }> = {}
    for (const key in choiceConfigMap) {
      const id = Number(key)
      map[id] = { optionCount: choiceConfigMap[id].optionCount }
    }
    return map
  }

  // 保存配置
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
          设置题目总数与选择题配置，点击题目切换类型，选择题可循环选项数。
        </p>
      </header>

      {/* 配置区 */}
      <section className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-gray-700 font-medium">题目总数：</label>
          <input
            type="number"
            min={1}
            max={100}
            value={totalQuestions}
            onChange={e => setTotalQuestions(Number(e.target.value))}
            className="w-20 px-2 py-1 border rounded"
          />
        </div>
        <div className="text-gray-500 text-sm">
          点击题目切换普通题/选择题，选择题可循环选项数（2/3/4）。
        </div>
      </section>

      {/* 预览区 */}
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        {/* 主点击：切换 普通题 <-> 选择题；角标按钮：循环 2/3/4 */}
        <QuestionGrid
          total={totalQuestions}
          choiceMap={getChoiceMap()}
          onQuestionClick={handleQuestionClick}
          getQuestionType={getQuestionType}
          onCycleOptionCount={handleOptionCountCycle}
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
