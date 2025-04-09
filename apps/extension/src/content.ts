function injectSubtitleTrack() {
  const video = document.querySelector('video');
  if (!video) {
    console.warn('No video element found.');
    return;
  }

  // Prevent duplicate injection
  if (video.querySelector('track[label="Custom Subtitles"]')) return;

  const track = document.createElement('track');
  track.kind = 'subtitles';
  track.label = 'Custom Subtitles';
  track.srclang = 'en';
  track.src = chrome.runtime.getURL('subtitle.vtt');
  track.default = true;
  video.appendChild(track);
}

function waitForVideo() {
  const interval = setInterval(() => {
    const video = document.querySelector('video');
    if (video) {
      clearInterval(interval);
      injectSubtitleTrack();
    }
  }, 500);
}

waitForVideo();
