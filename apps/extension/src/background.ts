chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'LOGIN_WITH_GOOGLE') {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', '660529147192-u6o8u5sfh7k1defm2rnq1gio5jhsrjm5.apps.googleusercontent.com')
    authUrl.searchParams.set('response_type', 'token id_token')
    authUrl.searchParams.set('redirect_uri', chrome.identity.getRedirectURL())
    authUrl.searchParams.set('scope', 'openid email profile')
    authUrl.searchParams.set('prompt', 'select_account')
    authUrl.searchParams.set('nonce', 'ytsub')

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.toString(),
        interactive: true
      },
      async (redirectedTo) => {
        if (chrome.runtime.lastError || !redirectedTo) {
          console.error('OAuth error:', chrome.runtime.lastError)
          return sendResponse(null)
        }

        const hash = new URLSearchParams(new URL(redirectedTo).hash.slice(1))
        const accessToken = hash.get('access_token')
        const idToken = hash.get('id_token')
        if (!accessToken || !idToken) return sendResponse(null)

        const reponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        const profile = await reponse.json()

        const user = {
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          accessToken,
          idToken
        }
        chrome.storage.local.set({ user })
        sendResponse(user)
      }
    )

    return true
  }
})
