const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });
let videoFile = null;
let selectedAction = null;

window.addEventListener('load', () => {
  // Ensure popup is hidden initially
  document.getElementById('popup').style.display = 'none';
});

document.getElementById('videoInput').addEventListener('change', (e) => {
  videoFile = e.target.files[0];
  if (videoFile) {
    document.querySelector('.options').style.display = 'flex';
  }
});

async function loadFFmpeg() {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
}

function showPopup(message, action) {
  selectedAction = action;
  document.getElementById('popupMessage').innerText = message;
  document.getElementById('popup').style.display = 'flex';
}

document.getElementById('optionVideo').addEventListener('click', () => {
  showPopup("Do you want to extract the video without sound?", "video");
});

document.getElementById('optionAudio').addEventListener('click', () => {
  showPopup("Do you want to extract the audio track?", "audio");
});

document.getElementById('confirmBtn').addEventListener('click', async () => {
  document.getElementById('popup').style.display = 'none';
  if (selectedAction === "video") {
    await extractVideoWithoutSound();
  } else if (selectedAction === "audio") {
    await extractAudio();
  }
});

document.getElementById('cancelBtn').addEventListener('click', () => {
  document.getElementById('popup').style.display = 'none';
});

async function extractVideoWithoutSound() {
  if (!videoFile) return;
  await loadFFmpeg();

  ffmpeg.setProgress(({ ratio }) => updateProgress(ratio));

  document.getElementById('progressContainer').style.display = 'block';
  ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoFile));
  await ffmpeg.run('-i', 'input.mp4', '-an', 'output.mp4');
  const data = ffmpeg.FS('readFile', 'output.mp4');
  downloadFile(data, 'video_no_sound.mp4');
  resetProgress();
}

async function extractAudio() {
  if (!videoFile) return;
  await loadFFmpeg();

  ffmpeg.setProgress(({ ratio }) => updateProgress(ratio));

  document.getElementById('progressContainer').style.display = 'block';
  ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoFile));
  await ffmpeg.run('-i', 'input.mp4', '-q:a', '0', '-map', 'a', 'audio.mp3');
  const data = ffmpeg.FS('readFile', 'audio.mp3');
  downloadFile(data, 'audio_track.mp3');
  resetProgress();
}

function updateProgress(ratio) {
  const percent = Math.min(Math.round(ratio * 100), 100);
  document.getElementById('progressText').innerText = percent + '%';
  document.getElementById('progressBar').style.width = percent + '%';
}

function resetProgress() {
  document.getElementById('progressContainer').style.display = 'none';
  document.getElementById('progressText').innerText = '0%';
  document.getElementById('progressBar').style.width = '0%';
}

function downloadFile(data, filename) {
  const blob = new Blob([data.buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
