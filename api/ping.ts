/**
 * GET /api/ping
 * 极简探针：用于验证 Vercel 是否正确构建并识别 /api 目录里的函数。
 * 如果这个端点仍然被前端 index.html 吃掉（看到 SPA 首页而不是 JSON），说明：
 *   1. 函数根本没被打包（Vercel 认为纯静态站点）
 *   2. 或 rewrites 把 /api 也重写了（当前配置看不应如此，但仍需验证实际生效）
 *   3. 或项目根不是部署根（你在 Vercel 选了子目录作为 Root Directory，导致 api/ 不在部署根）
 *
 * 排查步骤（部署后）：
 *  - 直接浏览器新窗口访问 https://你的域名/api/ping
 *  - 期望：{"success":true,"ts":...,"note":"ping-ok"}
 *  - 实际若是首页 HTML：查看 Vercel 项目 Settings -> General -> Root Directory 是否为空；若设置了子目录，需要把 api/ 也放进去或调整 root。
 */
export default async function handler(_req: any, res: any) {
  res.status(200).json({
    success: true,
    ts: Date.now(),
    note: 'ping-ok'
  })
}