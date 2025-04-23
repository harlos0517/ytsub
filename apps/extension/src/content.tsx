import { MantineProvider } from '@mantine/core'
import React from 'react'
import ReactDOM from 'react-dom/client'

import '@mantine/core/styles.css'

import { subsIconSvg } from './assets/subsIcon'
import { SubtitlesUI } from './ui/SubtitlesUI'

const injectReactUI = () => {
  if (document.getElementById('ytsub-menu')) return setTimeout(injectReactUI, 500)

  const controls = document.querySelector('.ytp-right-controls') as HTMLDivElement
  if (!controls) return setTimeout(injectReactUI, 500)

  const btn = document.createElement('button')
  btn.id = 'subtitle-toggle-btn'
  btn.className = 'ytp-button'
  btn.innerHTML = subsIconSvg
  btn.title = 'Toggle Subtitles Panel'
  btn.onclick = () => {
    const panel = document.getElementById('ytsub-menu')
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none'
  }

  controls.prepend(btn)

  const container = document.createElement('div')
  container.id = 'ytsub-menu'
  container.className = 'ytp-popup ytp-settings-menu'
  container.style.display = 'none'
  document.querySelector('video')?.parentElement?.parentElement?.appendChild(container)

  const root = ReactDOM.createRoot(container)
  root.render(
    <MantineProvider>
      <SubtitlesUI />
    </MantineProvider>
  )
}

injectReactUI()
