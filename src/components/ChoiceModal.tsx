// src/components/ChoiceModal.tsx
import React, { useState, useEffect } from 'react'

/**
 * 选择题弹窗组件
 * @param props ChoiceModalProps
 */
export interface ChoiceModalProps {
  open: boolean
  questionId: number | null
  optionCount: number
  selected: string[]
  onClose: () => void
  onConfirm: (opts: string[]) => void
}

const optionLabels = ['A', 'B', 'C', 'D']

const ChoiceModal: React.FC<ChoiceModalProps> = ({
  open,
  questionId,
  optionCount,
  selected,
  onClose,
  onConfirm
}) => {
  // 内部选项状态
  const [localSelected, setLocalSelected] = useState<string[]>([])

  useEffect(() => {
    setLocalSelected(selected)
  }, [selected, questionId, open])

  if (!open || questionId == null) return null

  // 切换选项
  const toggleOption = (opt: string) => {
    setLocalSelected(prev =>
      prev.includes(opt)
        ? prev.filter(o => o !== opt)
        : [...prev, opt]
    )
  }

  // 选项按钮渲染
  const optionBtns = optionLabels.slice(0, optionCount).map(opt => (
    <button
      key={opt}
      className={`w-10 h-10 rounded border mx-1 text-lg font-bold transition-all
        ${localSelected.includes(opt)
          ? 'bg-blue-500 text-white border-blue-600'
          : 'bg-white text-blue-500 border-blue-300'}`}
      onClick={() => toggleOption(opt)}
      type="button"
    >
      {opt}
    </button>
  ))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[260px]">
        <div className="mb-3 text-base font-semibold text-blue-600">
          选择题 {questionId}
        </div>
        <div className="flex justify-center mb-4">{optionBtns}</div>
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
            onClick={onClose}
            type="button"
          >
            取消
          </button>
          <button
            className="px-4 py-1 rounded bg-blue-500 text-white font-bold hover:bg-blue-600"
            onClick={() => onConfirm(localSelected)}
            type="button"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChoiceModal
