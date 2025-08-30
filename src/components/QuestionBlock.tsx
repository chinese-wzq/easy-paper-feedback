// src/components/QuestionBlock.tsx
import React from 'react'

/**
 * 单个题目方块组件
 * 支持普通题/选择题两种状态
 * @param props QuestionBlockProps
 */
export interface QuestionBlockProps {
  id: number
  type: 'normal' | 'choice'
  optionCount?: number
  selectedOptions?: string[] // 仅选择题
  isWrong?: boolean // 普通题的错题标记
  onClick: () => void
  onCycleOptionCount?: (id: number) => void // （管理端）循环选项数
  className?: string
}

/* 无用变量已移除 */

const QuestionBlock: React.FC<QuestionBlockProps> = ({
  id,
  type,
  optionCount,
  selectedOptions,
  isWrong,
  onClick,
  onCycleOptionCount,
  className = ''
}) => {
  // 计算样式
  let border = 'border-gray-300'
  let bg = 'bg-white'
  let text = 'text-gray-800'
  let inner = null

  if (type === 'normal') {
    if (isWrong) {
      border = 'border-red-500'
      bg = 'bg-red-50'
      inner = (
        <span className="text-red-500 font-bold text-lg">✓</span>
      )
    }
  } else if (type === 'choice') {
    border = 'border-blue-500'
    if (selectedOptions && selectedOptions.length > 0) {
      bg = 'bg-blue-50'
      inner = (
        <span className="text-blue-600 font-semibold">
          {selectedOptions.join('')}
        </span>
      )
    } else {
      inner = (
        <span className="text-xs text-blue-400 px-1 py-0.5 rounded bg-blue-100">选</span>
      )
    }
  }

  // 角标：选择题显示选项数
  const corner =
    type === 'choice' && optionCount ? (
      onCycleOptionCount ? (
        <button
          type="button"
            /* 角标按钮：点击只循环选项数，不触发父级 onClick */
          onClick={e => {
            e.stopPropagation()
            onCycleOptionCount(id)
          }}
          className="absolute top-1 right-1 text-[10px] leading-none rounded bg-blue-100 text-blue-600 px-1 border border-blue-200 hover:bg-blue-200"
          title="循环选项数 2/3/4"
        >
          {optionCount}
        </button>
      ) : (
        <span className="absolute top-1 right-1 text-xs rounded-full bg-blue-100 text-blue-500 px-1">
          {optionCount}
        </span>
      )
    ) : null

  return (
    <button
      className={`relative w-12 h-12 flex items-center justify-center rounded border ${border} ${bg} ${text} font-medium transition-all ${className}`}
      onClick={onClick}
      type="button"
    >
      {/* 题号居中显示 */}
      <span className="">{id}</span>
      {/* 状态内容覆盖题号右下角 */}
      <span className="absolute bottom-1 right-1">{inner}</span>
      {/* 角标 */}
      {corner}
    </button>
  )
}

export default QuestionBlock
