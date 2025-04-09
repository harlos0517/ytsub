import React from 'react'

const SUBS = [
  { label: 'English (Default)', url: chrome.runtime.getURL('subtitle.vtt') },
  { label: 'Japanese (Test)', url: 'https://example.com/jp-sub.vtt' },
  { label: 'Custom (From CDN)', url: 'https://example.com/custom.vtt' }
]

export function SubtitlesUI() {
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
    }}>
      <strong>Subtitles</strong>
      <div style={{ marginTop: '8px' }}>
        {SUBS.map((s, i) => (
          <div
            key={i}
            onClick={() => handleLoadSubtitle(s.url)}
            style={{ cursor: 'pointer', margin: '6px 0', textDecoration: 'underline' }}
          >
            {s.label}
          </div>
        ))}
      </div>
    </div>
  )
}
