import { Cue } from "../types/cue"

export const renderHTMLsubtitles = (cues: Cue[], video: HTMLVideoElement, containerId: string) => {
  let currentCue: Cue | null = null

  let div = document.getElementById(containerId) as HTMLDivElement
  if (!div) {
    div = document.createElement('div')
    div.id = containerId
    Object.assign(div.style, {
      position: 'absolute',
      bottom: '12%',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '4px 8px',
      fontSize: '18px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      zIndex: '99999',
      maxWidth: '80%',
      pointerEvents: 'none',
      borderRadius: '8px',
      whiteSpace: 'pre-wrap',
    })
    video.parentElement?.parentElement?.appendChild(div)
  }

  const update = () => {
    const t = video.currentTime
    const cue = cues.find(c => c.start <= t && t <= c.end)
    div.style.display = cue ? 'block' : 'none'
    if (cue !== currentCue) {
      currentCue = cue || null
      div.innerHTML = cue?.text || ''
    }
  }

  update()
  video.addEventListener('timeupdate', update)
}
