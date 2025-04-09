import React from 'react'
import ReactDOM from 'react-dom/client'
import { SubtitlesUI } from './ui/SubtitlesUI'

function injectReactUI() {
  if (document.getElementById('ytsub-menu')) return

  const container = document.createElement('div')
  container.id = 'ytsub-menu'
  container.style.position = 'fixed'
  container.style.bottom = '20px'
  container.style.right = '20px'
  container.style.zIndex = '999999'
  document.body.appendChild(container)

  const root = ReactDOM.createRoot(container)
  root.render(<SubtitlesUI />)
}

injectReactUI()


async function appendSubtitle() {
  const res = await fetch(chrome.runtime.getURL("subtitle.vtt"))
  const blob = new Blob([await res.text()], { type: 'text/vtt' })
  const blobURL = URL.createObjectURL(blob)

  let video
  while (!(video = document.querySelector('video')))
    await new Promise(resolve => setInterval(resolve, 500))

  // Prevent duplicate injection
  if (video.querySelector('track[label="Custom Subtitles"]')) return

  const track = document.createElement('track')
  track.kind = 'subtitles'
  track.label = 'Custom Subtitles'
  track.srclang = 'en'
  track.src = blobURL
  track.default = true
  video.appendChild(track)
}

appendSubtitle()
