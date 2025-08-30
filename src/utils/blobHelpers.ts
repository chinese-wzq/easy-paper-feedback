/**
 * 基于 Vercel Blob 的简易 JSON 读写工具
 * 固定文件名：
 *  - poll-config.json
 *  - poll-results.json
 *
 * 注意：这里不做复杂的并发控制（无 ETag / CAS），仅提供基础读写。
 */
import { put, list, get } from '@vercel/blob'

/** 固定文件名常量 */
export const CONFIG_FILENAME = 'poll-config.json'
export const RESULTS_FILENAME = 'poll-results.json'

/** 简化的 blob 列表项类型（避免隐式 any） */
interface SimpleBlobItem {
  pathname: string
  url: string
}

/**
 * 在 blob 列表中查找指定文件的下载 URL
 * 兼容 pathname 可能包含子路径的情况
 */
async function findBlobUrl(filename: string): Promise<string | null> {
  const { blobs } = await list()
  const hit = (blobs as SimpleBlobItem[]).find(
    (b: SimpleBlobItem) => b.pathname === filename || b.pathname.endsWith('/' + filename)
  )
  return hit ? hit.url : null
}

/**
 * 读取 JSON（若不存在返回 null）
 */
export async function readJson<T = unknown>(filename: string): Promise<T | null> {
  const url = await findBlobUrl(filename)
  if (!url) return null
  const res = await get(url)
  if (!res.ok) {
    throw new Error(`GET_FAILED_${filename}`)
  }
  return (await res.json()) as T
}

/**
 * 覆盖写入 JSON（public 访问权限）
 */
export async function writeJson(filename: string, data: unknown) {
  await put(filename, JSON.stringify(data), { access: 'public' })
}

/**
 * 尝试读取，不存在则用 factory 创建并写入再返回
 */
export async function readOrInit<T>(filename: string, factory: () => T): Promise<T> {
  const existing = await readJson<T>(filename)
  if (existing) return existing
  const created = factory()
  await writeJson(filename, created)
  return created
}