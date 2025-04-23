import { Cue } from "../types/cue"
import { parseTime } from "./parseTime"

export const parseVTT = (vtt: string): Cue[] => {
  const lines = vtt.split(/\r?\n/)
  const cues: Cue[] = []

  let start = 0
  let end = 0
  let text = ''
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.includes('-->')) {
      const [startStr, endStr] = line.split('-->').map(s => s.trim().split(' ')[0])
      start = parseTime(startStr)
      end = parseTime(endStr)
      text = ''
      while (lines[++i] && lines[i].trim()) {
        text += (text ? '\n' : '') + lines[i].trim()
      }
      cues.push({ start, end, text })
    }
  }

  return cues
}
