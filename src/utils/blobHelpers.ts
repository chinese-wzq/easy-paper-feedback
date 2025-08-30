/**
 * 基于 Vercel Blob 的简易 JSON 读写工具
 * 注意：
 *  - 读取：@vercel/blob 不再提供 get，直接 fetch(blob.url)
 *  - 覆盖写入：>=1.0.0 同路径重复 put 需显式 allowOverwrite:true
 */
import { put, list } from '@vercel/blob'

export const CONFIG_FILENAME = 'poll-config.json'
export const RESULTS_FILENAME = 'poll-results.json'

interface SimpleBlobItem {
  pathname: string
  url: string
}

/** 查找文件对应的公开 URL（不存在返回 null） */
async function findBlobUrl(filename: string): Promise<string | null> {
  const { blobs } = await list()
  const hit = (blobs as SimpleBlobItem[]).find(
    (b: SimpleBlobItem) => b.pathname === filename || b.pathname.endsWith('/' + filename)
  )
  return hit ? hit.url : null
}

/** 读取 JSON（若不存在返回 null） */
export async function readJson<T = unknown>(filename: string): Promise<T | null> {
  const url = await findBlobUrl(filename)
  if (!url) return null
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`GET_FAILED_${filename}`)
  return (await res.json()) as T
}

/** 覆盖写入 JSON（public + allowOverwrite） */
export async function writeJson(filename: string, data: unknown) {
  await put(filename, JSON.stringify(data), {
    access: 'public',
    allowOverwrite: true, // 允许覆盖，否则同名第二次写入会抛错
    addRandomSuffix: false // 保持固定文件名
  })
}

/** 读取或初始化 */
export async function readOrInit<T>(filename: string, factory: () => T): Promise<T> {
  const existing = await readJson<T>(filename)
  if (existing) return existing
  const created = factory()
  await writeJson(filename, created)
  return created
}