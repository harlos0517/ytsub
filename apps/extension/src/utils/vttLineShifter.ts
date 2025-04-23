export const adjustVttCueLines = (vttText: string, lineValue = '85%') => {
  const lines = vttText.split('\n')
  const output: string[] = []
  const timecodeRegex = /^(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})(.*)$/

  for (const line of lines) {
    const match = line.match(timecodeRegex)
    if (match) {
      let [, start, end, settings] = match
      settings = settings.replace(/\s*line:\d+%?/, '') // remove existing line
      settings += ` line:${lineValue}`
      output.push(`${start} --> ${end}${settings}`)
    } else {
      output.push(line)
    }
  }

  return output.join('\n')
}
