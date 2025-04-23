import type { Request } from 'express'
import rateLimit from 'express-rate-limit'

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit to 5 uploads per window
  keyGenerator: (req: Request) => {
    const userId = (req as any).userId
    if (userId) return `user:${userId}`
    return 'user:anonymous'
  },
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded. Try again later.'
    })
  }
})
