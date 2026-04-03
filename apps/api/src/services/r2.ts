import { R2Bucket } from '@cloudflare/workers-types'

export class R2Service {
  constructor(private bucket: R2Bucket) {}

  // Upload content to R2
  async uploadContent(key: string, content: string, contentType = 'text/markdown'): Promise<void> {
    await this.bucket.put(key, content, {
      httpMetadata: {
        contentType,
      },
    })
  }

  // Delete content from R2
  async deleteContent(key: string): Promise<boolean> {
    await this.bucket.delete(key)
    return true
  }

  // Check if content exists
  async contentExists(key: string): Promise<boolean> {
    const object = await this.bucket.head(key)
    return object !== null
  }

  // Download content from R2
  async downloadContent(key: string): Promise<string | null> {
    const object = await this.bucket.get(key)
    if (!object) return null

    const text = await object.text()
    return text
  }

  // Generate content hash (SHA-256)
  async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }
}
