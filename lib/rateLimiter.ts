interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  
  // Rate limit settings
  private readonly MAX_REQUESTS = 10 // Max requests per window
  private readonly WINDOW_MS = 60000 // 1 minute window
  
  checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.limits.get(identifier)
    
    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.WINDOW_MS
      })
      return { allowed: true, remaining: this.MAX_REQUESTS - 1, resetTime: now + this.WINDOW_MS }
    }
    
    if (entry.count >= this.MAX_REQUESTS) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime }
    }
    
    // Increment count
    entry.count++
    this.limits.set(identifier, entry)
    
    return { 
      allowed: true, 
      remaining: this.MAX_REQUESTS - entry.count, 
      resetTime: entry.resetTime 
    }
  }
  
  // Clean up expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }
}

export const rateLimiter = new RateLimiter()

// Clean up expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup()
}, 5 * 60 * 1000) 