import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { readFileSync } from 'fs'

import { FIREBASE_CONFIG_PATH } from './config'

const firebaseConfigPath = FIREBASE_CONFIG_PATH
if (!firebaseConfigPath) throw new Error('FIREBASE_CONFIG_PATH is not set')
const serviceAccountKey = JSON.parse(await readFileSync(firebaseConfigPath, 'utf-8'))

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: serviceAccountKey.project_id,
      clientEmail:serviceAccountKey.client_email,
      privateKey: serviceAccountKey.private_key?.replace(/\\n/g, '\n'),
    }),
    storageBucket: `${serviceAccountKey.project_id}.firebasestorage.app`
  })
}

export const bucket = getStorage().bucket()
