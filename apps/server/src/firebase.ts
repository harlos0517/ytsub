import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

import serviceAccountKey from '../serviceAccountKey.json'

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
