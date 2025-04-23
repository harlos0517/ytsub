import { Button, FileInput, TextInput } from '@mantine/core'
import React, { useState } from 'react'

const apiUrl = import.meta.env.VITE_API_URL

type Props = {
  videoId: string
  onUploadSuccess: () => void
  handleLogin: () => Promise<string | null>
}

export const UploadSubtitle = ({ videoId, onUploadSuccess, handleLogin }: Props) => {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const verifyToken = async() => {
    const { user } = await chrome.storage.local.get('user')
    const idToken = user?.idToken as string
    if (idToken) {
      const res = await fetch(`${apiUrl}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      })
      if (res.ok) return idToken
      else return await handleLogin()
    } else return await handleLogin()
  }

  const handleUpload = async() => {
    const token = await verifyToken()
    if (!token) return

    if (!file || !videoId || !name) {
      setStatus('All fields are required.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('videoId', videoId)
    formData.append('name', name)
    formData.append('idToken', token)

    try {
      const res = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (res.ok) {
        setStatus(`✅ Uploaded: ${data.name}`)
        setName('')
        setFile(null)
        onUploadSuccess()
      } else {
        setStatus(`❌ Upload failed: ${data.error || res.statusText}`)
      }
    } catch (err) {
      console.error(err)
      setStatus('❌ Network error')
    }
  }

  return (
    <>
      <TextInput
        placeholder="Subtitle name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <FileInput
        placeholder="Upload .vtt or .srt"
        accept=".vtt, .srt"
        value={file}
        onChange={setFile}
      />
      <Button onClick={handleUpload}>Upload</Button>
      {status && <p style={{ fontSize: '13px', marginTop: '6px' }}>{status}</p>}
    </>
  )
}
