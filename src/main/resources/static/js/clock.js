const segmentMap = {
  0: ['a','b','c','d','e','f'],
  1: ['b','c'],
  2: ['a','b','g','e','d'],
  3: ['a','b','c','d','g'],
  4: ['f','g','b','c'],
  5: ['a','f','g','c','d'],
  6: ['a','f','e','d','c','g'],
  7: ['a','b','c'],
  8: ['a','b','c','d','e','f','g'],
  9: ['a','b','c','d','f','g']
};

function createDigit(num) {
  const digit = document.createElement('div');
  digit.className = 'digit';
  ['a','b','c','d','e','f','g'].forEach(seg => {
    const s = document.createElement('div');
    s.className = 'segment seg-' + seg;
    if (segmentMap[num]?.includes(seg)) s.classList.add('on');
    digit.appendChild(s);
  });
  return digit;
}

function createColon() {
  const colon = document.createElement('div');
  colon.className = 'colon';
  colon.innerHTML = '<div>.</div><div>.</div>';
  return colon;
}

function updateClock() {
  const now = new Date();

  const timeString = now.getUTCHours().toString().padStart(2, '0') + ':' +
                     now.getUTCMinutes().toString().padStart(2, '0') + ':' +
                     now.getUTCSeconds().toString().padStart(2, '0');

  const container = document.getElementById('digital-clock');
  if (container) {
    container.innerHTML = '';
    for (const char of timeString) {
      if (char === ':') {
        container.appendChild(createColon());
      } else {
        container.appendChild(createDigit(parseInt(char)));
      }
    }
  }

  const utcDateStr = now.toUTCString().split(' ').slice(0, 4).join(' ');
  const dateContainer = document.getElementById('utc-date');
  if (dateContainer) {
    dateContainer.textContent = utcDateStr;
  }
}

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);
});
