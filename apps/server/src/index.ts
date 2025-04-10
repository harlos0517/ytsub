import cors from 'cors'
import express from 'express'
import multer from 'multer'

import { bucket } from './firebase'
import { prisma } from './prisma'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())

// GET /api/subtitles?v=VIDEO_ID
app.get('/api/subtitles', async (req, res) => {
  const videoId = req.query.v as string
  if (!videoId) return res.status(400).json({ error: 'Missing video ID' })

  const subs = await prisma.subtitle.findMany({
    where: { videoId },
    orderBy: { createdAt: 'asc' },
  })

  // Generate public URL (placeholder for now)
  const formatted = subs.map(sub => ({
    name: sub.name,
    url: `https://storage.googleapis.com/${bucket.name}/${sub.storagePath}`
  }))

  res.json(formatted)
})

const upload = multer({ storage: multer.memoryStorage() })

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const file = req.file
  const { videoId, name } = req.body

  if (!file || !videoId || !name) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const storagePath = `subtitles/${videoId}/${name}.vtt`
  const fileRef = bucket.file(storagePath)

  await fileRef.save(file.buffer, {
    contentType: 'text/vtt',
    metadata: {
      cacheControl: 'public, max-age=3600'
    }
  })

  // Make it public (optional)
  await fileRef.makePublic()

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

  const subtitle = await prisma.subtitle.create({
    data: {
      videoId,
      name,
      storagePath
    }
  })

  res.json({
    id: subtitle.id,
    name: subtitle.name,
    videoId: subtitle.videoId,
    url: publicUrl
  })
})

app.listen(PORT, () => {
  console.log(`🟢 Subtitle server running on http://localhost:${PORT}`)
})
