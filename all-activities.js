const eventList = document.getElementById('allEventList');
const fixedWeeklyEvents = [{
  title: 'Caterpillar Club', source: 'Reiman Gardens', location: 'Reiman Gardens · Ames',
  url: 'https://reimangardens.com/events', confidence: '每周固定活动 · 2–5 岁，成人陪同 · 需入园门票', categoryLabel: 'Weekly family activity',
  ageGroups: ['toddler', 'preschool'], time: '10:15–11:00 AM', startDate: 'recurring', endDate: 'recurring'
}];

function dateLabel(event) {
  if (event.startDate === 'recurring') return 'Every Thu';
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const start = new Date(`${event.startDate}T12:00:00`);
  const end = new Date(`${event.endDate || event.startDate}T12:00:00`);
  const startLabel = new Intl.DateTimeFormat('en-US', options).format(start);
  if (event.startDate === event.endDate) return startLabel;
  if (start.getMonth() === end.getMonth()) return `${startLabel}–${end.getDate()}`;
  return `${startLabel}–${new Intl.DateTimeFormat('en-US', options).format(end)}`;
}

function timeLabel(event) {
  if (event.time) return event.time;
  const raw = event.when || '';
  const match = raw.match(/\d{1,2}:\d{2}\s*(?:a\.?m\.?|p\.?m\.?)(?:\s*(?:-|–)\s*\d{1,2}:\d{2}\s*(?:a\.?m\.?|p\.?m\.?))?/i);
  if (!match) return raw.includes('·') ? raw.split('·').slice(1).join('·').trim() : '';
  return match[0].replace(/\s*(?:-|–)\s*/g, '–').replace(/a\.?m\.?/gi, 'AM').replace(/p\.?m\.?/gi, 'PM');
}

fetch('data/special-events.json', { cache: 'no-store' }).then(response => response.json()).then(data => {
  const labels = { baby: 'Baby', toddler: 'Toddler', preschool: '3–5 岁', schoolage: '6–10 岁' };
  const events = [...fixedWeeklyEvents, ...(Array.isArray(data.events) ? data.events : [])].sort((a, b) => (a.startDate === 'recurring' ? '' : a.startDate || '').localeCompare(b.startDate === 'recurring' ? '' : b.startDate || ''));
  eventList.innerHTML = events.length ? events.map(event => {
    const ages = Array.isArray(event.ageGroups) ? event.ageGroups.map(age => labels[age]).join(' · ') : '年龄待确认';
    const timing = [dateLabel(event), timeLabel(event)].filter(Boolean).join(' · ');
    const sourceName = (event.source || '').toLowerCase();
    const locationName = (event.location || '').toLowerCase();
    const titleName = (event.title || '').toLowerCase();
    const repeatsSource = sourceName && (locationName.includes(sourceName) || titleName === sourceName);
    const label = event.categoryLabel || (!repeatsSource ? event.source : '');
    const location = repeatsSource || locationName === titleName ? '' : event.location;
    return `<article class="special-event">${label ? `<p class="eyebrow">${label} · ${ages}</p>` : `<p class="eyebrow">${ages}</p>`}<h3>${event.title}</h3><p class="event-time">${timing}</p>${location ? `<p>${location}</p>` : ''}<p class="event-note">${event.confidence}</p><a href="${event.url}" target="_blank" rel="noreferrer">查看主办方信息 ↗</a></article>`;
  }).join('') : '<p class="special-empty">还没有已记录的未来活动。</p>';
}).catch(() => { eventList.innerHTML = '<p class="special-empty">活动数据暂时无法读取。</p>'; });
