import cors from 'cors'
import express from 'express'
import { OAuth2Client } from 'google-auth-library'
import multer from 'multer'

import { bucket } from './firebase'
import { prisma } from './prisma'
import { uploadRateLimiter } from './rateLimiter'

const PORT = process.env.PORT || 3000
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const upload = multer({ storage: multer.memoryStorage() })


const app = express()
app.use(express.json())

const verifyToken = async(idToken: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()
  if (!payload) return null

  const user = await prisma.user.upsert({
    where: { googleId: payload.sub },
    update: {},
    create: {
      googleId: payload.sub,
      email: payload.email!,
      name: payload.name,
      avatar: payload.picture
    }
  })

  return user
}

app.use(cors({
  origin: 'https://www.youtube.com',
  credentials: true
}))

app.post('/auth/verify', async (req, res) => {
  const { idToken } = req.body
  if (!idToken) return res.status(400).json({ error: 'Missing token' })

  try {
    const user = await verifyToken(idToken)
    if (!user) throw new Error('No payload')

    res.json({ userId: user.id, email: user.email, name: user.name })
  } catch (err) {
    console.error('Token verification failed:', err)
    res.status(401).json({ error: 'Invalid token' })
  }
})

// GET /api/subtitles?v=VIDEO_ID
app.get('/api/subtitles', async (req, res) => {
  const videoId = req.query.v as string
  if (!videoId) return res.status(400).json({ error: 'Missing video ID' })

  const subs = await prisma.subtitle.findMany({
    where: { videoId },
    orderBy: { createdAt: 'asc' },
  })

  const formatted = subs.map(sub => ({
    name: sub.name,
    url: `https://storage.googleapis.com/${bucket.name}/${sub.storagePath}`
  }))

  res.json(formatted)
})

app.post('/api/upload',
  upload.single('file'),
  async (req, res, next) => {
    const idToken = req.body.idToken
    if (!idToken) return res.status(400).json({ error: 'Missing token' })
    const user = await verifyToken(idToken)
    if (!user) throw new Error('No payload')
    ;(req as any).userId = user.id
    next()
  },
  uploadRateLimiter,
  async (req, res) => {
    const { videoId, name, idToken } = req.body
    const file = req.file

    if (!file || !videoId || !name || !idToken)
      return res.status(400).json({ error: 'Missing fields or token' })

    try {
      const user = await verifyToken(idToken)
      if (!user) throw new Error('No payload')

      const storagePath = `subtitles/${videoId}/${name}.vtt`
      const fileRef = bucket.file(storagePath)

      await fileRef.save(file.buffer, {
        contentType: 'text/vtt',
        metadata: { cacheControl: 'public,max-age=3600' }
      })

      await fileRef.makePublic()

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

      const subtitle = await prisma.subtitle.create({
        data: {
          videoId,
          name,
          storagePath,
          uploaderId: user.id
        }
      })

      res.json({
        id: subtitle.id,
        name: subtitle.name,
        videoId: subtitle.videoId,
        url: publicUrl,
        uploader: { id: user.id, name: user.name }
      })
    } catch (err) {
      console.error('Upload failed:', err)
      res.status(401).json({ error: 'Authentication failed' })
    }
  }
)

app.listen(PORT, () => {
  console.log(`Subtitle server running on PORT ${PORT}`)
})
