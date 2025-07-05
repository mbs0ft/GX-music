function sendActivity(amount) {
  chrome.runtime.sendMessage({ type: 'activity', amount });
}

window.addEventListener('scroll', () => sendActivity(0.5));
window.addEventListener('keydown', () => sendActivity(3));
window.addEventListener('mousedown', () => sendActivity(2)); 