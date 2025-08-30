/**
 * 基于 Vercel Blob 的简易 JSON 读写工具
 * 注意：
 *  - 读取：@vercel/blob 不再提供 get，直接 fetch(blob.url)
 *  - 覆盖写入：>=1.0.0 同路径重复 put 需显式 allowOverwrite:true
 *  - 若未配置 BLOB_READ_WRITE_TOKEN：list()/put 会失败，这里做降级处理
 */
import { put, list } from '@vercel/blob'

export const CONFIG_FILENAME = 'poll-config.json'
export const RESULTS_FILENAME = 'poll-results.json'

interface SimpleBlobItem {
  pathname: string
  url: string
}

/** dev 环境判定（避免直接引用 process 导致 TS 无 @types/node 报错） */
const isDev = (() => {
  try {
    // 使用 globalThis 防止类型缺失
    return (globalThis as any)?.process?.env?.NODE_ENV !== 'production'
  } catch {
    return false
  }
})()

/** 安全 list（缺 token / 权限等失败时返回空数组，不抛出） */
async function safeList(): Promise<SimpleBlobItem[]> {
  try {
    const { blobs } = await list()
    return blobs as SimpleBlobItem[]
  } catch (e) {
    if (isDev) {
      console.error('[blob] list 失败（可能缺少 BLOB_READ_WRITE_TOKEN）：', e)
    }
    return []
  }
}

/** 查找文件对应的公开 URL（不存在返回 null） */
async function findBlobUrl(filename: string): Promise<string | null> {
  const blobs = await safeList()
  const hit = blobs.find(
    (b: SimpleBlobItem) => b.pathname === filename || b.pathname.endsWith('/' + filename)
  )
  return hit ? hit.url : null
}

/** 读取 JSON（若不存在返回 null） */
export async function readJson<T = unknown>(filename: string): Promise<T | null> {
  try {
    const url = await findBlobUrl(filename)
    if (!url) return null
    const res = await fetch(url, { cache: 'no-cache' })
    if (!res.ok) throw new Error(`GET_FAILED_${filename}`)
    return (await res.json()) as T
  } catch (e: any) {
    // 读取阶段统一吞掉存储异常，交由上层判断是否视为“无配置”
    if (isDev) {
      console.error(`[blob] readJson 异常(${filename})：`, e?.message || e)
    }
    return null
  }
}

/** 写入 JSON（public）。说明：当前使用的 @vercel/blob 版本类型中无 allowOverwrite 字段，移除以避免 TS 构建错误。
 *  若线上出现同名写入冲突（409），需升级 @vercel/blob 到支持 allowOverwrite 的版本并恢复该参数。 */
export async function writeJson(filename: string, data: unknown) {
  try {
    await put(filename, JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false // 期望保持固定文件名；若版本不支持覆盖可能抛冲突
    } as any)
  } catch (e: any) {
    throw new Error('BLOB_WRITE_FAILED')
  }
}

/** 读取或初始化 */
export async function readOrInit<T>(filename: string, factory: () => T): Promise<T> {
  const existing = await readJson<T>(filename)
  if (existing) return existing
  const created = factory()
  await writeJson(filename, created)
  return created
}