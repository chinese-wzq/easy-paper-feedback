/**
 * GET /api/_diag
 * 诊断 Vercel Blob 运行环境
 *
 * 返回：
 * {
 *   success: true,
 *   data: {
 *     hasToken: boolean
 *     vercelEnv: string | null
 *     listOk: boolean
 *     listError?: string
 *     writeTestOk: boolean
 *     writeTestError?: string
 *     blobsSample?: { pathname: string }[]
 *   }
 * }
 *
 * 用法：部署后访问 /api/_diag
 * 若 hasToken=false => 必然需要在 Vercel Project Settings -> Environment Variables 配置 BLOB_READ_WRITE_TOKEN (Production + Preview) 并重新部署
 * 若 listOk=false => token 缺失 / 权限错误 / 网络问题
 * 若 writeTestOk=false 但 listOk=true => token 只读或 put 参数问题
 */
import { list, put } from '@vercel/blob'

interface ApiResponse<T=unknown> {
  success: boolean
  data?: T
  error?: string
}

export default async function handler(_req: any, res: any) {
  const env = (globalThis as any)?.process?.env || {}
  const hasToken = !!env.BLOB_READ_WRITE_TOKEN
  const vercelEnv = env.VERCEL_ENV || env.NODE_ENV || null

  let listOk = false
  let listError: string | undefined
  let writeTestOk = false
  let writeTestError: string | undefined
  let blobsSample: { pathname: string }[] | undefined

  // list 测试
  try {
    const r = await list()
    listOk = true
    // 仅返回前 5 个 pathname，避免输出过大
    blobsSample = r.blobs.slice(0, 5).map(b => ({ pathname: b.pathname }))
  } catch (e: any) {
    listError = e?.message || String(e)
  }

  // put 测试（固定文件名，允许覆盖，避免垃圾文件堆积）
  if (listOk) {
    try {
      await put('blob-diag-probe.json', JSON.stringify({ ts: Date.now() }), {
        access: 'public',
        allowOverwrite: true,
        addRandomSuffix: false
      })
      writeTestOk = true
    } catch (e: any) {
      writeTestError = e?.message || String(e)
    }
  }

  res.status(200).json({
    success: true,
    data: {
      hasToken,
      vercelEnv,
      listOk,
      listError,
      writeTestOk,
      writeTestError,
      blobsSample
    }
  } as ApiResponse)
}