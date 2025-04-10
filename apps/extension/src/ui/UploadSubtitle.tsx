import React, { useEffect, useState } from 'react'

type Props = {
  onUploadSuccess: () => void
}

function getYouTubeVideoID(): string | null {
  const url = new URL(window.location.href)
  return url.searchParams.get('v')
}

export function UploadSubtitle({ onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [videoId, setVideoId] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const id = getYouTubeVideoID()
    if (id) setVideoId(id)
  }, [])

  const handleUpload = async () => {
    if (!file || !videoId || !name) {
      setStatus('All fields are required.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('videoId', videoId)
    formData.append('name', name)

    try {
      const res = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (res.ok) {
        setStatus(`✅ Uploaded: ${data.name}`)
        setName('')
        setFile(null)
        onUploadSuccess() // 🚀 Trigger refresh
      } else {
        setStatus(`❌ Upload failed: ${data.error || res.statusText}`)
      }
    } catch (err) {
      console.error(err)
      setStatus('❌ Network error')
    }
  }

  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid #555', paddingTop: '10px' }}>
      <strong>Upload a Subtitle</strong>
      <div style={{ margin: '8px 0' }}>
        <input
          type="text"
          value={name}
          placeholder="Subtitle Name"
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div style={{ margin: '8px 0' }}>
        <input
          type="file"
          accept=".vtt"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
      </div>
      <button onClick={handleUpload}>Upload</button>
      {status && <p style={{ fontSize: '13px', marginTop: '6px' }}>{status}</p>}
    </div>
  )
}
