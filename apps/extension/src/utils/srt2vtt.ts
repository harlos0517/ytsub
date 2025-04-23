import { parseSRT } from "./parseSRT"

export const convertSRTtoVTT = (srt: string): string => {
  const cues = parseSRT(srt)
  const lines = ['WEBVTT', '']

  for (const cue of cues) {
    const start = formatTime(cue.start)
    const end = formatTime(cue.end)
    lines.push(`${start} --> ${end}`)
    lines.push(cue.text)
    lines.push('')
  }

  return lines.join('\n')
}

const formatTime = (seconds: number): string =>{
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = (seconds % 60).toFixed(3)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s.padStart(6, '0')}`
}
