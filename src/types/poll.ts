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
export interface PollConfig {
  /* 投票配置 ID（例如某次考试/试卷的唯一标识） */
  id: string;
  /* 标题：例如 “2024 上学期期末数学试卷讲解优先级投票” */
  title: string;
  /* 描述：向学生说明投票规则 */
  description?: string;
  /* 选项列表 */
  options: PollOption[];
  /* 是否允许多选 */
  allowMultiple: boolean;
  /* 是否允许重复提交（默认 false） */
  allowDuplicate?: boolean;
  /* 每个学生最多可选几个（仅 allowMultiple = true 时生效；undefined 代表不限制） */
  maxSelectCount?: number;
  /* 是否关闭（关闭后学生不可再投） */
  closed?: boolean;
  /* 创建时间 ISO 字符串 */
  createdAt: string;
  /* 更新时间 ISO 字符串 */
  updatedAt?: string;
  /* 额外元数据：可扩展存储任意结构化信息 */
  meta?: Record<string, unknown>;
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