/**
 * 临时类型声明：@vercel/blob
 * 说明：
 *  - 解决本地开发/TS Server 报 “找不到模块 '@vercel/blob'” 的问题
 *  - 若正式包已提供类型，TS 会自动合并，保持最小侵入
 *  - 这里只声明用到的最小子集（put / list）
 */

declare module '@vercel/blob' {
  /** put 返回的最小结果结构 */
  interface PutBlobResult {
    url: string
    pathname: string
  }

  interface PutOptions {
    access?: 'public' | 'private'
    allowOverwrite?: boolean
    addRandomSuffix?: boolean
    multipart?: boolean
  }

  /** list 返回的最小结果结构 */
  interface ListBlobResult {
    blobs: { pathname: string; url: string }[]
    cursor?: string
  }

  export function put(
    pathname: string,
    body: string | Blob | ArrayBuffer | Uint8Array | ReadableStream | NodeJS.ReadableStream,
    options?: PutOptions
  ): Promise<PutBlobResult>

  export function list(options?: { cursor?: string; limit?: number; prefix?: string }): Promise<ListBlobResult>
}