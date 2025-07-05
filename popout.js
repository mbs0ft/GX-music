let isPlaying = true;
const toggleBtn = document.getElementById('toggle-btn');
const volumeSlider = document.getElementById('volume-slider');
const timerDisplay = document.getElementById('timer-display');

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateTimer() {
  chrome.runtime.sendMessage({ type: 'get_time' }, (response) => {
    if (response && typeof response.listeningSeconds === 'number') {
      timerDisplay.textContent = `You've been listening music for ${formatTime(response.listeningSeconds)}`;
    }
  });
}

chrome.runtime.sendMessage({ type: 'get_state' }, (response) => {
  if (response) {
    isPlaying = response.isPlaying;
    toggleBtn.textContent = isPlaying ? 'Stop' : 'Start';
    volumeSlider.value = Math.round((response.volume ?? 1) * 100);
    updateTimer();
  }
});

let timerInterval = setInterval(updateTimer, 1000);

toggleBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  toggleBtn.textContent = isPlaying ? 'Stop' : 'Start';
  chrome.runtime.sendMessage({ type: isPlaying ? 'start_music' : 'stop_music' });
  setTimeout(updateTimer, 200); // timer update
});

volumeSlider.addEventListener('input', (e) => {
  const volume = volumeSlider.value / 100;
  chrome.runtime.sendMessage({ type: 'set_volume', value: volume });
});
