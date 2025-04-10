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
