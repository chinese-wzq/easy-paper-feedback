# 试卷讲解优先级投票系统

> 基于 React + TypeScript + Vite + Vercel Serverless + Vercel Blob 的简易投票 / 统计工具  
> 用于课堂中“哪些题目优先讲解”快速收集。  
> ⚠️重要声明：本项目核心代码 & 文档完全由 AI 生成（由我这名外行的监督下进行迭代），可能存在安全 / 逻辑 / 合规 / 性能等风险，使用者与部署者需自行评估并承担全部风险。

## 功能概览
- 管理端（/admin）：
  - 设置试卷名称、题目总数（1~200）、配置哪些题是选择题以及其选项数（2~4）
  - 保存配置并（可选）清空旧投票结果
  - 查看实时（存在一定延迟）聚合统计：错题次数、各选项票数、总投票人数
- 学生端（/）：
  - 显示当前生效试卷
  - 标记错题（单击编号）/ 为选择题选择一个或多个选项
  - 提交一次投票（后端聚合写入）

## 延迟与一致性
使用 Vercel Blob（公共读 URL + CDN 分发 + 最终一致性）。写入后短时间（数秒~1 分钟）再次读取可能仍得到旧数据。UI 已加入提示；关键操作（保存配置、清空结果）立即使用后端返回数据更新前端状态以减轻感知。

## 目录结构（核心）
```
api/
  admin/
    config.ts          # 保存/覆盖配置  POST /api/admin/config
    results.ts         # 获取配置+结果  GET  /api/admin/results
    clear-results.ts   # 清空统计      POST /api/admin/clear-results
  poll.ts              # 学生端拉配置   GET  /api/poll
  vote.ts              # 学生提交投票   POST /api/vote
src/
  pages/
    AdminPage.tsx
    StudentVotePage.tsx
  utils/
    api.ts             # 前端 fetch 封装
    blobHelpers.ts     # Blob 读写辅助
  types/
    poll.ts            # 类型定义
```

## 核心文件引用
- 配置保存逻辑：[`config.ts`](api/admin/config.ts)
- 结果聚合查询：[`results.ts`](api/admin/results.ts)
- 清空结果：[`clear-results.ts`](api/admin/clear-results.ts)
- 学生端获取配置：[`poll.ts`](api/poll.ts)
- 投票提交：[`vote.ts`](api/vote.ts)
- Blob 工具：[`blobHelpers.ts`](src/utils/blobHelpers.ts)
- 前端 API 层：[`api.ts`](src/utils/api.ts)
- 管理页面：[`AdminPage.tsx`](src/pages/AdminPage.tsx)
- 学生页面：[`StudentVotePage.tsx`](src/pages/StudentVotePage.tsx)
- 类型：[`poll.ts`](src/types/poll.ts)

## 数据模型（简化）
PollConfig:
```ts
interface PollConfig {
  id: string
  title: string
  totalQuestions: number
  choiceQuestions: Record<number,{ optionCount:number }>
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```
PollResults:
```ts
interface PollResults {
  pollId: string
  totalVoters: number
  votes: {
    [questionId:number]: {
      wrongCount: number
      choiceVotes: Record<string, number>
    }
  }
  updatedAt: string
}
```

## 后端 API（约定响应）
所有端点统一返回：
```json
{ "success": true, "data": ... }
{ "success": false, "error": "CODE" }
```
主要错误码：NO_CONFIG / INVALID_JSON / INVALID_PAYLOAD / VALIDATION_ERROR / BLOB_WRITE_FAILED / METHOD_NOT_ALLOWED

| Endpoint | Method | 描述 |
|----------|--------|------|
| /api/poll | GET | 拉取当前配置（无则返回 success:false + NO_CONFIG） |
| /api/admin/config | POST | 保存配置（并在首次时初始化结果） |
| /api/vote | POST | 提交一次投票，聚合计数 |
| /api/admin/results | GET | 获取配置 + 聚合结果 |
| /api/admin/clear-results | POST | 清空结果（不改配置） |

## 本地开发
```bash
pnpm i         # 或 npm i / yarn
pnpm dev       # 启动开发
```
访问 http://localhost:5173

## 部署到 Vercel
1. 直接在创建项目时导入本仓库
2. 为项目关联 Vercel Blob

## 使用流程（建议）
1. 打开 /admin 设置试卷名称 / 题目总数 / 选择题
2. 保存配置（必要）
3. 若是新试卷且需要清零旧数据：点击“清空投票结果”
4. 等待 ~1 分钟（或手动刷新）确认学生端看到正确题目
5. 通知学生访问根路径进行投票
6. 管理端间隔性刷新“获取最新结果”查看统计

## 一致性与策略
- 为缓解 CDN 缓存：服务端 API 间接读取 Blob，并在关键写操作后直接把最新结构返回给前端使用
- 若需要强一致，可迁移到 KV / Postgres / Redis 等具备原子写的存储

## 风险提示
- 本项目“按现状”提供，无任何明示或暗示担保
- 由 AI 生成，可能存在：安全漏洞、并发逻辑缺陷、未处理的异常、数据竞争、延迟与缓存不一致
- 在考试 / 正式教学环节使用前请自行 Code Review 与测试

## 可改进方向
- 鉴权（简单密码 / 访问令牌）防止学生直接访问 /admin
- 更细分的多试卷支持（多 config + 切换）
- 导出 CSV
- WebSocket / SSE 实时推送结果
- 避免 CDN 缓存：改用 Vercel KV 或第三方持久层
- 单题点击热度排序 / 权重算法

---
若你在课堂中改进了它，欢迎提交 PR 或 Issue。玩得开心:)
