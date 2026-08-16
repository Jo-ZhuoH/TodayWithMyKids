const activities = [
  { name: 'Toddler Storytime', type: '图书馆活动 · 今日推荐', category: 'library', drive: 7, place: 'indoor', free: true, featured: true, age: '幼儿友好', availability: 'calendarRequired', needsConfirmation: true, water: '待核实', note: '此活动仅在官方日历确认当天有场次时显示。', url: 'https://www.amespubliclibrary.org/events/list' },
  { name: 'Ames Public Library 儿童区', type: '安静室内备选', category: 'library', drive: 7, place: 'indoor', free: true, age: '0–3 岁友好', water: '待核实', note: '没有固定活动时也可读书、活动身体，是下雨天的低成本备选。', url: 'https://www.amespubliclibrary.org/' },
  { name: 'Labyrinth Coffee', type: '咖啡 + 儿童玩耍区', category: 'play', drive: 10, place: 'indoor', free: false, age: '低龄友好', water: '待核实', note: '有家长推荐的儿童玩耍区、玩具和 Lego；出发前核对当天开放时间。', url: 'https://www.labyrinthcoffeeames.org/' },
  { name: 'Play Pals Indoor Playground', type: '低龄室内玩耍', category: 'play', drive: 10, place: 'indoor', free: false, age: '5 岁及以下', needsConfirmation: true, water: '待核实', availability: 'schoolYearWeekdayMorning', note: 'Community Center 的玩具、滑梯和骑乘玩具；仅在 Labor Day 到 Memorial Day 之间的周一至周五 9–11 点显示。', url: 'https://www.cityofames.org/My-Government/Departments/Parks-and-Recreation/Facilities/Community-Center' },
  { name: 'Stuart Smith Park', type: '户外 Playground', category: 'park', drive: 10, place: 'outdoor', free: true, age: '新 playground，成人看护', water: '未列出饮水设施', note: '有 playground、开放草地和步行/自行车路径；市政府在 2025 年完成新 playground。', url: 'https://www.cityofames.org/My-Government/Departments/Parks-and-Recreation/Parks/Stuart-Smith-Park' },
  { name: 'Brookside Park', type: '户外 Playground + 散步', category: 'park', drive: 8, place: 'outdoor', free: true, age: 'Playground，成人看护', water: '有', note: '有 playground、步行路径和自然区域；适合想玩一会儿再散步的日子。', url: 'https://www.cityofames.org/My-Government/Departments/Parks-and-Recreation/Parks/Brookside-Park' },
  { name: 'Inis Grove Park', type: '包容性 Playground + 徒步', category: 'park', drive: 10, place: 'outdoor', free: true, age: '两处 playground，成人看护', water: '有', note: '有 Barnes Family Inclusive Playground、两处 playground 和 hiking trails。', url: 'https://www.cityofames.org/My-Government/Departments/Parks-and-Recreation/Parks/Inis-Grove-Park' },
  { name: 'Moore Memorial Park', type: '自然散步 + Playground', category: 'park', drive: 15, place: 'outdoor', free: true, age: 'Playground，成人看护', water: '有', note: '有 playground、步行/自行车路径、自然区域与钓鱼区域；靠近水域时需全程看护。', url: 'https://www.cityofames.org/My-Government/Departments/Parks-and-Recreation/Parks/Moore-Memorial-Park' },
  { name: 'Schainker Plaza Splash Pad', type: '季节性戏水', category: 'park', drive: 8, place: 'outdoor', free: true, age: '低龄可玩，须全程看护', needsConfirmation: true, water: '待核实', splash: '可以玩水', note: '炎热日子的短时活动；出发前确认季节性开放状态。', url: 'https://www.cityofames.org/News-articles/Schainker-Plaza-Opening-June-15' },
  { name: 'Furman Aquatic Center', type: '水上乐园', category: 'play', drive: 10, place: 'outdoor', free: false, age: '有 toddler slide', needsConfirmation: true, water: '待核实', splash: '可以玩水', note: '有 zero-depth entry、喷水设施和 toddler slide；出发前确认开放时间与天气。', url: 'https://www.cityofames.org/My-Government/Departments/Parks-and-Recreation/Facilities/Furman-Aquatic-Center' },
  { name: 'Prairie Flower Parent-Child Playgroup', type: '亲子活动', category: 'community', drive: 15, place: 'indoor', free: false, age: '14 个月–3 岁', needsConfirmation: true, registration: '需要查看报名', water: '待核实', note: '很贴合 18 个月年龄段；地点在 Bethesda Lutheran Church 内。', url: 'https://www.prairieflowercc.org/' },
  { name: 'Ames Play Yard', type: '室内游乐 + 咖啡', category: 'play', drive: 15, place: 'indoor', free: false, age: '有幼儿区域', water: '待核实', note: '有幼儿和大孩子区域，成人也可买咖啡；适合天气不好时放电。', url: 'https://www.amesplayyard.com/' },
  { name: 'Reiman Gardens', type: '花园与自然探索 · 特别推荐', category: 'park', drive: 20, place: 'outdoor', free: false, featured: true, age: '适合亲子散步', needsConfirmation: true, registration: '查看当日安排', water: '待核实', note: '天气好、愿意多开一会儿车时的半日目的地，有室内空间可作为辅助。', url: 'https://reimangardens.com/' }
];

const el = (id) => document.getElementById(id);
let selectedPlace = 'any';
let selectedPrice = 'any';
let rotation = 0;
const recommendationLimit = 5;
let libraryEvents = [];
let specialEvents = [];

const weatherCodeText = {
  0: ['☀️', '晴朗'], 1: ['🌤️', '大致晴朗'], 2: ['⛅', '局部多云'], 3: ['☁️', '阴天'],
  45: ['🌫️', '有雾'], 48: ['🌫️', '有雾'], 51: ['🌦️', '毛毛雨'], 53: ['🌦️', '毛毛雨'],
  55: ['🌦️', '毛毛雨'], 61: ['🌧️', '下雨'], 63: ['🌧️', '下雨'], 65: ['🌧️', '大雨'],
  80: ['🌦️', '阵雨'], 81: ['🌦️', '阵雨'], 82: ['🌧️', '强阵雨'], 95: ['⛈️', '雷雨']
};

function formatHour(isoTime) {
  return new Intl.DateTimeFormat('zh-CN', { hour: 'numeric', minute: '2-digit' }).format(new Date(isoTime));
}

function directionsUrl(activity) {
  const destination = encodeURIComponent(`${activity.name}, Ames, IA`);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isIOS
    ? `comgooglemaps://?daddr=${destination}&directionsmode=driving`
    : googleMapsUrl;
}

async function loadWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=42.0347&longitude=-93.62&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=uv_index_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago&forecast_days=1';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('weather unavailable');
    const data = await response.json();
    const [icon, description] = weatherCodeText[data.current.weather_code] || ['🌤️', '当前天气'];
    const alerts = [];
    const now = new Date();
    const firstUpcomingHour = Math.max(0, data.hourly.time.findIndex(time => new Date(time) >= now));
    const nextHours = data.hourly.time.slice(firstUpcomingHour, firstUpcomingHour + 5);
    const upcomingRain = nextHours.findIndex((time, index) => data.hourly.precipitation_probability[firstUpcomingHour + index] >= 40);
    if (upcomingRain >= 0) {
      const rainIndex = firstUpcomingHour + upcomingRain;
      alerts.push(`${formatHour(data.hourly.time[rainIndex])} 降雨可能 ${data.hourly.precipitation_probability[rainIndex]}%`);
    }
    if (data.current.wind_speed_10m >= 20) alerts.push(`风速 ${Math.round(data.current.wind_speed_10m)} mph，户外注意风大`);
    if (data.daily.uv_index_max[0] >= 6) alerts.push(`紫外线 ${Math.round(data.daily.uv_index_max[0])}，建议涂防晒`);
    el('weatherIcon').textContent = icon;
    el('weatherHeadline').textContent = `Ames · ${Math.round(data.current.temperature_2m)}°F · ${description}`;
    el('weatherAlerts').textContent = alerts.join(' · ');
    el('weatherAlerts').hidden = alerts.length === 0;
    el('hourlyWeather').innerHTML = nextHours.map((time, index) => {
      const hourIndex = firstUpcomingHour + index;
      const [hourIcon] = weatherCodeText[data.hourly.weather_code[hourIndex]] || ['🌤️'];
      return `<div class="hourly-slot"><time>${formatHour(time)}</time><strong>${hourIcon} ${Math.round(data.hourly.temperature_2m[hourIndex])}°</strong><span>雨 ${data.hourly.precipitation_probability[hourIndex]}%</span></div>`;
    }).join('');
  } catch {
    el('weatherHeadline').textContent = '天气暂时无法读取';
  }
}

async function loadLibraryCalendar() {
  try {
    const response = await fetch('data/library-events.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('calendar unavailable');
    const data = await response.json();
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
    libraryEvents = data.date === today && Array.isArray(data.events) ? data.events : [];
  } catch {
    libraryEvents = [];
  }
  render();
}

function renderSpecialEvents() {
  const list = el('specialEventList');
  list.innerHTML = specialEvents.length ? specialEvents.slice(0, 4).map(event => `<article class="special-event"><p class="eyebrow">${event.source} · ${event.confidence}</p><h3>${event.title}</h3><p>${event.when}${event.location ? ` · ${event.location}` : ''}</p><a href="${event.url}" target="_blank" rel="noreferrer">查看主办方信息 ↗</a></article>`).join('') : '<p class="special-empty">本周尚未找到适合 toddler 的特别活动。可以查看全部来源，或稍后再刷新。</p>';
}

async function loadSpecialEvents() {
  try {
    const response = await fetch('data/special-events.json', { cache: 'no-store' });
    const data = await response.json();
    specialEvents = Array.isArray(data.events) ? data.events : [];
  } catch { specialEvents = []; }
  renderSpecialEvents();
}

function firstMondayOfSeptember(year) {
  const date = new Date(year, 8, 1);
  date.setDate(1 + ((8 - date.getDay()) % 7));
  return date;
}

function lastMondayOfMay(year) {
  const date = new Date(year, 5, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

function isAvailableToday(activity, now = new Date()) {
  if (activity.availability === 'calendarRequired') return libraryEvents.some(event => event.name === activity.name);
  if (activity.availability !== 'schoolYearWeekdayMorning') return true;
  const laborDay = firstMondayOfSeptember(now.getFullYear());
  const memorialDay = lastMondayOfMay(now.getFullYear());
  const inSchoolYear = now >= laborDay || now <= memorialDay;
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return inSchoolYear && isWeekday && minutes >= 9 * 60 && minutes < 11 * 60;
}

function spreadCategories(items) {
  const remaining = [...items];
  const result = [];
  const used = new Set();
  while (remaining.length && result.length < recommendationLimit) {
    const index = remaining.findIndex(item => !used.has(item.category));
    const next = remaining.splice(index === -1 ? 0 : index, 1)[0];
    result.push(next);
    used.add(next.category);
  }
  return result;
}

function render() {
  const maxDrive = Number(el('driveFilter').value);
  const matches = activities.filter(a => isAvailableToday(a) && a.drive <= maxDrive && (selectedPlace === 'any' || a.place === selectedPlace) && (selectedPrice === 'any' || a.free));
  const rotated = matches.length ? [...matches.slice(rotation % matches.length), ...matches.slice(0, rotation % matches.length)] : [];
  const shown = spreadCategories(rotated);
  el('resultCount').textContent = matches.length > recommendationLimit ? `今天先给你 ${recommendationLimit} 个建议 · 还有 ${matches.length - recommendationLimit} 个可换` : `今天为你找到 ${matches.length} 个建议`;
  el('activityList').innerHTML = shown.length ? shown.map(a => `
    <article class="activity ${a.place}${a.featured ? ' featured' : ''}">
      <div class="topline"><div><p class="eyebrow">${a.type}${a.splash ? ` · ${a.splash}` : ''}</p><h3>${a.name}</h3></div></div>
      <p>${a.note}</p>
      <div class="details">${a.drive} 分钟车程 · ${a.free ? '免费' : '可能收费'}${a.registration ? ` · ${a.registration}` : ''}</div>
      <div class="card-actions"><a class="navigate-button" href="${directionsUrl(a)}">路线 ↗</a>${a.needsConfirmation ? `<a class="source" href="${a.url}" target="_blank" rel="noreferrer">确认信息 ↗</a>` : ''}</div>
    </article>`).join('') : '<p class="empty">没有匹配结果。试试扩大车程或取消“只看免费”。</p>';
}
document.querySelectorAll('select').forEach(control => control.addEventListener('change', () => { rotation = 0; render(); }));
document.querySelectorAll('.place-button').forEach(button => button.addEventListener('click', () => {
  selectedPlace = button.dataset.place;
  rotation = 0;
  document.querySelectorAll('.place-button').forEach(item => item.classList.toggle('active', item === button));
  render();
}));
document.querySelectorAll('.price-button').forEach(button => button.addEventListener('click', () => {
  selectedPrice = button.dataset.price;
  rotation = 0;
  document.querySelectorAll('.price-button').forEach(item => item.classList.toggle('active', item === button));
  render();
}));
el('refreshChoices').addEventListener('click', () => { rotation += recommendationLimit; render(); });
el('refreshChoicesBottom').addEventListener('click', () => { rotation += recommendationLimit; render(); });
render();
loadWeather();
loadLibraryCalendar();
loadSpecialEvents();
