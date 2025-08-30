// src/components/QuestionGrid.tsx
import React from 'react'
import QuestionBlock from './QuestionBlock'

/**
 * 题目网格组件
 * @param props QuestionGridProps
 */
export interface QuestionGridProps {
  total: number
  choiceMap: Record<number, { optionCount: number; selectedOptions?: string[] }>
  wrongSet?: Set<number>
  onQuestionClick: (id: number) => void
  getQuestionType: (id: number) => 'normal' | 'choice'
  className?: string
}

const QuestionGrid: React.FC<QuestionGridProps> = ({
  total,
  choiceMap,
  wrongSet,
  onQuestionClick,
  getQuestionType,
  className = ''
}) => {
  // 渲染题目方块列表
  const blocks: React.ReactNode[] = []
  for (let i = 1; i <= total; i++) {
    const type = getQuestionType(i)
    const isWrong = wrongSet?.has(i)
    const choiceCfg = choiceMap[i]
    blocks.push(
      <QuestionBlock
        key={i}
        id={i}
        type={type}
        optionCount={choiceCfg?.optionCount}
        selectedOptions={choiceCfg?.selectedOptions}
        isWrong={isWrong}
        onClick={() => onQuestionClick(i)}
        className=""
      />
    )
  }

  return (
    <div
      className={`grid grid-cols-5 gap-3 p-2 bg-white rounded-lg shadow-sm ${className}`}
    >
      {blocks}
    </div>
  )
}

export default QuestionGrid
