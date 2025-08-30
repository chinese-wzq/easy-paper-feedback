/**
 * 投票系统核心类型（第三阶段：接入 Vercel Blob 持久化）
 * 仅保留当前阶段所需结构，移除未使用的旧字段，避免概念噪音
 */

/* =========================
 * 配置与结果
 * ========================= */

/** 管理端配置结构（持久化文件：poll-config.json） */
export interface PollConfig {
  id: string;                     // 配置 ID
  title: string;                  // 标题
  totalQuestions: number;         // 题目总数（1~200）
  choiceQuestions: Record<number, { optionCount: number }>; // 选择题题号 -> 选项数（2~4）
  isActive: boolean;              // 是否开放投票
  createdAt: string;              // 创建时间 ISO
  updatedAt: string;              // 最近更新时间 ISO
}

/** 投票聚合结果（持久化文件：poll-results.json） */
export interface PollResults {
  pollId: string;                 // 对应配置 ID
  totalVoters: number;            // 提交人数（每次提交 +1）
  votes: {
    [questionId: number]: {
      wrongCount: number;         // 该题被标记为错题的次数
      choiceVotes: Record<string, number>; // 选项票数（A-D）
    };
  };
  updatedAt: string;              // 最近更新时间
}

/* =========================
 * 前端临时状态 & 提交载荷
 * ========================= */

/** 学生端本地临时状态（非直接存储，仅页面内使用） */
export interface FrontendVoteState {
  wrongSet: Set<number>;                      // 错题集合
  choiceSelections: Record<number, Set<string>>; // 题号 -> 已选择选项集合
}

/** 学生投票提交载荷（POST /api/vote） */
export interface VoteSubmission {
  wrongQuestions: number[];                   // 错题题号数组
  choiceSelections: Record<number, string[]>; // 题号 -> 选中的选项数组
}

/* =========================
 * 通用响应封装
 * ========================= */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/* =========================
 * 其它辅助（仍被现有代码引用，保留空壳）
 * ========================= */

/** 选择题配置（局部 UI 使用） */
export interface ChoiceQuestionConfig {
  optionCount: number;
  selectedOptions?: string[];
}

/** 默认导出常量（占位，可按需扩展） */
export const DEFAULT_MAX_SELECT = 3;