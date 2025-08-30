/**
 * 试卷讲解反馈收集系统 - 核心类型定义
 * 使用场景：
 * - PollConfig: 管理端配置投票（题目讲解优先级等）
 * - VoteSubmission: 学生端提交投票
 * - VoteResults: 聚合后的统计结果
 */

/* 单个可投票选项 */
export interface PollOption {
  /* 选项唯一 ID（可用于统计） */
  id: string;
  /* 选项展示文本，例如：第5题 / 选择题部分 / 解题策略 等 */
  label: string;
  /* 可选的说明补充 */
  description?: string;
  /* 排序权重（可选），数字越小越靠前 */
  order?: number;
}

/* 投票配置 */
/**
 * 扩展后的投票配置类型，兼容本地 mock 数据结构
 */
export interface PollConfig {
  id: string;
  title: string;
  totalQuestions: number; // 题目总数
  choiceQuestions: Record<number, ChoiceQuestionConfig>; // 选择题配置，key 为题号
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // 可选：描述、meta 等
  description?: string;
  meta?: Record<string, unknown>;
}

/**
 * 选择题配置
 */
export interface ChoiceQuestionConfig {
  optionCount: number; // 选项数（2~4）
  selectedOptions?: string[]; // 学生端选项（A/B/C/D）
}

/**
 * 学生端临时投票状态
 */
export interface FrontendVoteState {
  wrongSet: Set<number>; // 错题题号集合
  choiceSelections: Record<number, Set<string>>; // 选择题已选项
}

/* 学生单次投票提交 */
export interface VoteSubmission {
  /* 对应的投票配置 ID */
  pollId: string;
  /* 选择的 option id 列表 */
  selection: string[];
  /* 客户端标识（可用于去重），根据业务可换成 userId / openId 等 */
  clientId?: string;
  /* 投票时间 */
  submittedAt: string;
  /* 额外信息（例如 IP Hash、UserAgent 等脱敏字段） */
  meta?: Record<string, unknown>;
}

/* 单个选项统计 */
export interface VoteOptionStat {
  optionId: string;
  count: number;
  percentage: number; // 0 ~ 100
}

/* 聚合统计结果 */
export interface VoteResults {
  pollId: string;
  totalVotes: number;
  /* 如果是多选投票，这里的 totalVotes 代表提交次数；
     各选项 count 代表被勾选出现次数 */
  optionStats: VoteOptionStat[];
  /* 统计时间 */
  generatedAt: string;
}

/* 管理端更新投票配置的载荷（部分字段可选） */
export interface PollConfigUpdatePayload {
  title?: string;
  description?: string;
  options?: PollOption[];
  allowMultiple?: boolean;
  allowDuplicate?: boolean;
  maxSelectCount?: number;
  closed?: boolean;
  meta?: Record<string, unknown>;
}

/* 统一的响应包装（可在调用 Edge Config 或 API Route 时使用） */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/* 工具类型：通过泛型限制传入对象必须包含 id:string */
export type WithId<T> = T & { id: string };

/* 常量建议：默认每人最大可选数量（可按业务调整） */
export const DEFAULT_MAX_SELECT = 3;