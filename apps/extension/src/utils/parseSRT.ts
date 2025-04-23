import { Cue } from "../types/cue"
import { parseTime } from "./parseTime"

export const parseSRT = (srt: string): Cue[] => {
  const blocks = srt.split(/\r?\n\r?\n/)
  const cues: Cue[] = []

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) continue

    const timeLine = lines[1].includes('-->') ? lines[1] : lines[0]
    const [startStr, endStr] = timeLine.replace(',', '.').split('-->').map(s => s.trim())
    const start = parseTime(startStr)
    const end = parseTime(endStr)

    const textLines = lines.slice(lines[1].includes('-->') ? 2 : 1)
    const text = textLines.join('\n')

    cues.push({ start, end, text })
  }

  return cues
}

