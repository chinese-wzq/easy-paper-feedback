/**
 * 基于 Vercel Blob 的简易 JSON 读写工具（添加进程级 URL 缓存，避免重复 list() 高级操作）
 * 注意：
 *  - 读取：@vercel/blob 不再提供 get，直接 fetch(blob.url)
 *  - 覆盖写入：>=1.0.0 同路径重复 put 需显式 allowOverwrite:true
 *  - 若未配置 BLOB_READ_WRITE_TOKEN：list()/put 会失败，这里做降级处理
 *  - 优化：仅在缓存缺失且尚未 list 过时执行一次 list()，后续全部走内存缓存
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
    return (globalThis as any)?.process?.env?.NODE_ENV !== 'production'
  } catch {
    return false
  }
})()

/** 进程级 URL 缓存（filename -> url） */
const urlCache: Map<string, string> = (globalThis as any).__blobUrlCache ||= new Map<string, string>()
/** 是否已尝试过 list（无论成功与否，只尝试一次，避免每次读取都产生高级操作） */
let listedOnce: boolean = (globalThis as any).__blobListedOnce || false
function markListed() {
  ;(globalThis as any).__blobListedOnce = true
  listedOnce = true
}

/**
 * 仅首次调用执行 list()（成功则批量填充 urlCache）
 * 失败后不再抛出，并标记已尝试，防止每次 read 反复触发 list
 */
async function ensureListedOnce() {
  if (listedOnce) return
  try {
    const { blobs } = await list()
    for (const b of blobs as SimpleBlobItem[]) {
      // pathname 是唯一键；若已有则不覆盖（理论上无冲突）
      if (!urlCache.has(b.pathname)) {
        urlCache.set(b.pathname.split('/').pop() === b.pathname ? b.pathname : b.pathname, b.url)
        // 再加入“纯文件名”索引（支持 endsWith 匹配场景）
        const base = b.pathname.split('/').pop()
        if (base && !urlCache.has(base)) {
          urlCache.set(base, b.url)
        }
      }
    }
  } catch (e) {
    if (isDev) {
      console.error('[blob] 首次 list 失败（可能缺少 BLOB_READ_WRITE_TOKEN）：', e)
    }
    // 忽略，后续仍会按“未找到”处理
  } finally {
    markListed()
  }
}

/** 查找文件对应的公开 URL（不存在返回 null） */
async function findBlobUrl(filename: string): Promise<string | null> {
  // 1. 直接命中缓存
  const hitDirect = urlCache.get(filename)
  if (hitDirect) return hitDirect

  // 2. 若尚未做过 list，进行一次批量获取
  if (!listedOnce) {
    await ensureListedOnce()
    const afterList = urlCache.get(filename)
    if (afterList) return afterList
  }

  // 3. 兜底：遍历缓存查找可能的子路径命中（极少使用）
  for (const [k, v] of urlCache) {
    if (k === filename || k.endsWith('/' + filename)) return v
  }
  return null
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
    const result = await put(filename, JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false
    } as any)
    // 写入成功后立即缓存 URL（这样第一次写 -> 之后读无需 list）
    urlCache.set(filename, result.url)
    // 也缓存真实 pathname（含可能的目录前缀）
    if (result.pathname && result.pathname !== filename) {
      urlCache.set(result.pathname, result.url)
    }
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