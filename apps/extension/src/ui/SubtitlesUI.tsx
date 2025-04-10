import React, { useCallback, useEffect, useState } from 'react'
import { UploadSubtitle } from './UploadSubtitle'

type SubtitleInfo = {
  name: string
  url: string
}

function getYouTubeVideoID(): string | null {
  const url = new URL(window.location.href)
  return url.searchParams.get('v')
}

export function SubtitlesUI() {
  const [subs, setSubs] = useState<SubtitleInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const videoId = getYouTubeVideoID()

  const loadSubtitles = useCallback(() => {
    if (!videoId) {
      setError('No video ID found in URL.')
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(`http://localhost:3000/api/subtitles?v=${videoId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`)
        return res.json()
      })
      .then((data: SubtitleInfo[]) => {
        setSubs(data)
      })
      .catch(err => {
        console.error('Failed to fetch subtitles:', err)
        setError('Could not load subtitles')
        setSubs([])
      })
      .finally(() => setLoading(false))
  }, [videoId])

  useEffect(() => {
    loadSubtitles()
  }, [loadSubtitles])

  const handleLoadSubtitle = async (url: string) => {
    const res = await fetch(url)
    const text = await res.text()
    const blob = new Blob([text], { type: 'text/vtt' })
    const blobURL = URL.createObjectURL(blob)

    const video = document.querySelector('video')
    if (!video) return

    video.querySelectorAll('track[label^="Custom"]').forEach(t => t.remove())

    const track = document.createElement('track')
    track.kind = 'subtitles'
    track.label = 'Custom Subtitle'
    track.srclang = 'en'
    track.src = blobURL
    track.default = true
    video.appendChild(track)
  }

  return (
    <div style={{
      background: 'rgba(0,0,0,0.85)',
      color: 'white',
      padding: '12px',
      borderRadius: '10px',
      fontSize: '14px',
      fontFamily: 'sans-serif',
      boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      maxWidth: '220px'
    }}>
      <strong>Subtitles</strong>
      <div style={{ marginTop: '8px' }}>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && subs.length === 0 && <div>No subtitles found.</div>}
        {!loading && subs.length > 0 && subs.map((s, i) => (
          <div
            key={i}
            onClick={() => handleLoadSubtitle(s.url)}
            style={{ cursor: 'pointer', margin: '6px 0', textDecoration: 'underline' }}
          >
            {s.name}
          </div>
        ))}
      </div>

      <UploadSubtitle onUploadSuccess={loadSubtitles} />
    </div>
  )
}
