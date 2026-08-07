const DAY_MS = 86_400_000;

export function spotlightIndexes(dayNumber, rosterLength, offsets = [0, 11, 23]) {
  if (!Number.isInteger(rosterLength) || rosterLength <= 0) return [];
  return offsets.map((offset) => (
    ((dayNumber + offset) % rosterLength + rosterLength) % rosterLength
  ));
}

export function rotateRoster(items, offset) {
  if (items.length === 0) return [];
  const start = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

export function taipeiDayNumber(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return Math.floor(Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
  ) / DAY_MS);
}

function spotlightCard(card, slot) {
  const figure = document.createElement('figure');
  figure.className = 'hall-spotlight-portrait';
  const image = card.querySelector('img').cloneNode();
  image.alt = '';
  image.loading = 'eager';
  figure.append(image);

  const copy = document.createElement('div');
  copy.className = 'hall-spotlight-copy';
  const name = card.querySelector('.hall-card-name').cloneNode(true);
  name.className = 'hall-spotlight-name';
  const meta = card.querySelector('.hall-card-meta').cloneNode(true);
  meta.className = 'hall-spotlight-meta';
  copy.append(name, meta);

  slot.replaceChildren(figure, copy);
}

export function initHallOfVoices(root) {
  const roster = root.querySelector('[data-hall-roster]');
  if (!roster) return;
  const cards = [...roster.querySelectorAll('[data-creator-id]')];
  if (cards.length === 0) return;

  const offsets = (root.dataset.spotlightOffsets || '0,11,23')
    .split(',')
    .map(Number)
    .filter(Number.isFinite);
  const dayNumber = taipeiDayNumber();
  const indexes = spotlightIndexes(dayNumber, cards.length, offsets);
  const slots = [...root.querySelectorAll('[data-spotlight-slot]')];
  slots.forEach((slot, index) => spotlightCard(cards[indexes[index]], slot));

  const rotated = rotateRoster(cards, dayNumber);
  roster.replaceChildren(...rotated);

  const date = root.querySelector('[data-rotation-date]');
  if (date) {
    date.textContent = new Intl.DateTimeFormat(root.lang || document.documentElement.lang, {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }

  const stage = root.querySelector('[data-hall-stage]');
  if (stage) stage.hidden = false;
  root.classList.add('hall-enhanced');
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-hall-of-voices]').forEach(initHallOfVoices);
}
