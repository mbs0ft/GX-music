const NUM_LAYERS = 5;
const audioLayers = [];
let currentIntensity = 1;
let globalVolume = 1;
let isPlaying = true;
let activityScore = 0;
const MAX_SCORE = 60;
let listeningSeconds = 0;
let timerInterval = setInterval(() => {
  if (isPlaying) listeningSeconds++;
}, 1000);

function getAudioUrl(i) {
  return chrome.runtime.getURL(`res/4_${i}.ogg`);
}

for (let i = 1; i <= NUM_LAYERS; i++) {
  try {
    const audio = new Audio(getAudioUrl(i));
    audio.loop = true;
    audio.volume = i === 1 ? 1 : 0;
    audio.preload = 'auto';
    audioLayers.push(audio);
  } catch (e) {
    console.warn(`Audio file res/4_${i}.ogg missing or failed to load.`);
  }
}

function playAll() {
  isPlaying = true;
  audioLayers.forEach(a => {
    if (a.paused) a.play().catch(()=>{});
  });
  updateVolumes();
}

function pauseAll() {
  isPlaying = false;
  audioLayers.forEach(a => a.pause());
}

function setVolume(vol) {
  globalVolume = vol;
  updateVolumes();
}

function setIntensity(newIntensity) {
  if (newIntensity === currentIntensity) return;
  currentIntensity = newIntensity;
  updateVolumes();
}

function updateVolumes() {
  for (let i = 0; i < NUM_LAYERS; i++) {
    const targetVolume = (i < currentIntensity && isPlaying) ? globalVolume : 0;
    fadeTo(audioLayers[i], targetVolume, 200);
  }
}

function fadeTo(audio, target, duration) {
  if (!audio) return;
  const step = 0.05;
  const interval = duration / (1 / step);
  const fade = setInterval(() => {
    if (Math.abs(audio.volume - target) < step) {
      audio.volume = target;
      clearInterval(fade);
    } else {
      audio.volume += (audio.volume < target ? step : -step);
      audio.volume = Math.max(0, Math.min(1, audio.volume));
    }
  }, interval);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'activity') {
    activityScore = Math.min(MAX_SCORE, activityScore + msg.amount);
  } else if (msg.type === 'set_volume') {
    setVolume(msg.value);
  } else if (msg.type === 'stop_music') {
    pauseAll();
  } else if (msg.type === 'start_music') {
    playAll();
  } else if (msg.type === 'get_state') {
    sendResponse({ isPlaying, volume: globalVolume });
    return true;
  } else if (msg.type === 'get_time') {
    sendResponse({ listeningSeconds });
    return true;
  }
});

setInterval(() => {
  activityScore = Math.max(0, activityScore - 1);
  const intensity = Math.max(1, Math.ceil((activityScore / MAX_SCORE) * 6));
  setIntensity(intensity);
}, 600);

chrome.tabs.onActivated.addListener(() => {
  if (!isPlaying) return;
  playAll();
}); 