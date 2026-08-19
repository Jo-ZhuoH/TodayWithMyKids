const eventList = document.getElementById('allEventList');
fetch('data/special-events.json', { cache: 'no-store' }).then(response => response.json()).then(data => {
  const labels = { baby: 'Baby', toddler: 'Toddler', preschool: '3–5 岁', schoolage: '6–10 岁' };
  const events = (Array.isArray(data.events) ? data.events : []).sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
  eventList.innerHTML = events.length ? events.map(event => {
    const ages = Array.isArray(event.ageGroups) ? event.ageGroups.map(age => labels[age]).join(' · ') : '年龄待确认';
    return `<article class="special-event"><p class="eyebrow">${event.source} · ${ages}</p><h3>${event.title}</h3><p>${event.when}${event.location ? ` · ${event.location}` : ''}</p><p class="event-note">${event.confidence}</p><a href="${event.url}" target="_blank" rel="noreferrer">查看主办方信息 ↗</a></article>`;
  }).join('') : '<p class="special-empty">还没有已记录的未来活动。</p>';
}).catch(() => { eventList.innerHTML = '<p class="special-empty">活动数据暂时无法读取。</p>'; });
