import { Avatar, Box, Button, Checkbox, Divider, Stack, Text } from '@mantine/core'
import React, { useEffect, useState } from 'react'

import { parseSRT } from '../utils/parseSRT'
import { parseVTT } from '../utils/parseVTT'
import { renderHTMLsubtitles } from '../utils/renderHTMLsubs'
import { convertSRTtoVTT } from '../utils/srt2vtt'
import { adjustVttCueLines } from '../utils/vttLineShifter'
import { UploadSubtitle } from './UploadSubtitle'

const apiUrl = import.meta.env.VITE_API_URL

type SubtitleInfo = {
  name: string
  url: string
}

type User = {
  name: string
  email: string
  picture?: string
  accessToken: string
  idToken?: string
}

const getYouTubeVideoID = (): string | null => {
  const url = new URL(window.location.href)
  return url.searchParams.get('v')
}

export const SubtitlesUI = () => {
  const videoId = getYouTubeVideoID()

  const [user, setUser] = useState<User | null>(null)
  const [subs, setSubs] = useState<SubtitleInfo[]>([])
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useHTMLsubs, setUseHTMLsubs] = useState(false)

  const loadSubtitles = async() => {
    setLoading(true)
    setError(null)
    try {
      if (!videoId) throw new Error('No video ID found')
      const res = await fetch(`${apiUrl}/api/subtitles?v=${videoId}`)
      if (!res.ok) throw new Error(`Server responded ${res.status}`)
      setSubs(await res.json())
    } catch (err) {
      console.error('Failed to fetch subtitles:', err)
      setError('Could not load subtitles: ' + (err instanceof Error ? err.message : String(err)))
      setSubs([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSubtitles()
  }, [videoId])

  useEffect(() => {
    if (!currentSubtitle) return
    handleLoadSubtitle(currentSubtitle?.url)
  }, [useHTMLsubs, currentSubtitle])

  useEffect(() => {
    chrome.storage.local.get('user', ({ user }) => {
      if (user) setUser(user)
    })

    // This is mount on the video, so no need to check for videoId change anymore
    // const interval = setInterval(() => {
    //   const currentVideoId = getYouTubeVideoID()
    //   if (currentVideoId !== videoId) setVideoId(currentVideoId)
    // }, 500)
    // return () => clearInterval(interval)

    const stopPropagation = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') e.stopPropagation()
    }
    window.addEventListener('keydown', stopPropagation, true)

    return () => window.removeEventListener('keydown', stopPropagation, true)
  }, [])

  const handleLogin = async() => {
    const response = await chrome.runtime.sendMessage({ type: 'LOGIN_WITH_GOOGLE' })
    if (response) {
      chrome.storage.local.set({ user: response })
      setUser(response)
      return String(response?.idToken)
    } else {
      alert('Login failed')
      return null
    }
  }

  const handleLoadSubtitle = async(url: string) => {
    const video = document.querySelector('video')
    if (!video) return
    video.querySelectorAll('track[label^="Custom"]').forEach(t => t.remove())
    document.getElementById('ytsub-html')?.remove()

    const res = await fetch(url)
    const text = await res.text()
    const isSRT = url.endsWith('.srt')
    const isVTT = url.endsWith('.vtt')
    if (!isSRT && !isVTT) {
      alert('Unsupported subtitle format. Only .srt and .vtt are supported.')
      return
    }

    if (useHTMLsubs) {
      const cues = isSRT ? parseSRT(text) : parseVTT(text)
      renderHTMLsubtitles(cues, video, 'ytsub-html')
    } else {
      const vttBlob = isSRT
        ? new Blob([adjustVttCueLines(convertSRTtoVTT(text), '85%')], { type: 'text/vtt' })
        : new Blob([adjustVttCueLines(text, '85%')], { type: 'text/vtt' })
    
      const url = URL.createObjectURL(vttBlob)
      const track = document.createElement('track')
      track.kind = 'subtitles'
      track.label = 'Custom Sutitle'
      track.src = url
      track.default = true
      video.appendChild(track)
    }
  }

  return (
    <Box
      p="md"
      style={{ background: '#1a1a1a', borderRadius: 'md', width: 280 }}
    >
      <Stack gap="md">
        {/* Login Info */}
        {user ? (
          <Stack gap="xs">
            <Avatar src={user.picture} size="sm" radius="xl" />
            <Text size="sm">{user.name}</Text>
          </Stack>
        ) : (
          <Button onClick={handleLogin}>Login</Button>
        )}

        <Divider label="Subtitles" labelPosition="center" />
        
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}

        {/* Subtitle List */}
        {subs.map(sub => (
          <Button
            key={sub.name}
            variant="subtle"
            onClick={() => setCurrentSubtitle(sub)}
          >
            {sub.name}
          </Button>
        ))}

        <Checkbox
          checked={useHTMLsubs}
          onChange={() => setUseHTMLsubs(!useHTMLsubs)}
          label="Use HTML subtitles"
        />

        {/* Upload */}
        {videoId && <>
          <Divider label="Upload" labelPosition="center" />
          <UploadSubtitle videoId={videoId} onUploadSuccess={loadSubtitles} handleLogin={handleLogin} />
        </>}
      </Stack>
    </Box>
  )
}
