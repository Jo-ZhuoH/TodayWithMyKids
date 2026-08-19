#!/usr/bin/env python3
"""Collect cautious family-event leads from the three public local calendars."""
from __future__ import annotations

import html
import json
import re
from datetime import datetime, timedelta
from pathlib import Path
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

OUT = Path(__file__).resolve().parents[1] / "data" / "special-events.json"
KEYWORDS = re.compile(r"toddler|child|children|kid|family|playdate|fair|festival|farmers.? market|heritage|cultural", re.I)
EXCLUDE = re.compile(r"adult|senior|board meeting|commission meeting|camp|veterans", re.I)

def get(url: str) -> str:
    with urlopen(Request(url, headers={"User-Agent": "TodayWithMyKids/1.0"}), timeout=30) as response:
        return response.read().decode("utf-8")

def clean(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", value))).strip()

def discover_events(page: str) -> list[dict[str, str]]:
    events = []
    today = datetime.now(ZoneInfo("America/Chicago")).date()
    for article in re.findall(r"<article class=\"mec-event-article.*?</article>", page, re.S):
        link = re.search(r"mec-event-title.*?href=\"([^\"]+)\"[^>]*>(.*?)</a>", article, re.S)
        if not link:
            continue
        title = clean(link.group(2))
        description = clean((re.search(r"mec-event-description\">(.*?)</div>", article, re.S) or [None, ""])[1])
        if EXCLUDE.search(f"{title} {description}") or not KEYWORDS.search(f"{title} {description}"):
            continue
        date = clean((re.search(r"mec-start-date-label\">(.*?)</span>", article, re.S) or [None, ""])[1])
        try:
            event_date = datetime.strptime(f"{date} {today.year}", "%d %b %Y").date()
        except ValueError:
            continue
        if not today <= event_date <= today + timedelta(days=14):
            continue
        time = clean((re.search(r"mec-time-details.*?</svg>(.*?)</div>", article, re.S) or [None, ""])[1])
        venue = clean((re.search(r"mec-venue-details.*?<span>(.*?)</span>", article, re.S) or [None, ""])[1])
        events.append({"title": title, "when": f"{date} {time}".strip(), "location": venue, "url": link.group(1), "source": "Discover Ames", "confidence": "亲子线索 · 请核对"})
    return events

def story_county_events(page: str) -> list[dict[str, str]]:
    events = []
    for block in re.findall(r"<div id=\"parentdiv.*?(?=<div id=\"parentdiv|</table>)", page, re.S):
        title = re.search(r"<h3[^>]*>(.*?)</h3>", block, re.S)
        link = re.search(r"href=\"(/Calendar\.aspx\?EID=[^\"]+)", block)
        date = re.search(r"<div class=\"date\">(.*?)</div>", block, re.S)
        if not title or not link or not date:
            continue
        title_text = clean(title.group(1))
        if EXCLUDE.search(title_text) or not KEYWORDS.search(title_text):
            continue
        location = clean((re.search(r"eventLocation.*?<div class=\"name\">(.*?)</div>", block, re.S) or [None, ""])[1])
        events.append({"title": title_text, "when": clean(date.group(1)), "location": location, "url": "https://www.storycountyiowa.gov" + html.unescape(link.group(1)), "source": "Story County", "confidence": "亲子线索 · 请核对"})
    return events

def canonicalize_story_event(event: dict[str, str]) -> dict[str, str]:
    """Prefer MyCountyParks details when Story County links to the same event."""
    try:
        detail = get(event["url"])
        external = re.search(r'href="(https://www\.mycountyparks\.com/[^"]+)', detail)
        if not external:
            return event
        page = get(html.unescape(external.group(1)))
        title = clean((re.search(r"<h1>(.*?)</h1>", page, re.S) or [None, event["title"]])[1])
        date = clean((re.search(r'<p class="date">(.*?)</p>', page, re.S) or [None, event["when"]])[1])
        location = clean((re.search(r'fa-location-dot.*?</i>\s*<a[^>]*>(.*?)</a>', page, re.S) or [None, event["location"]])[1])
        return {**event, "title": title, "when": date, "location": location, "url": html.unescape(external.group(1)), "confidence": "主办方已核对"}
    except Exception:
        return event

def main() -> None:
    discover = discover_events(get("https://discoverames.com/events/"))
    story = [canonicalize_story_event(event) for event in story_county_events(get("https://www.storycountyiowa.gov/Calendar.aspx"))]
    # Ames Parks & Recreation is an official source, but currently rejects automated reads
    # and does not expose a stable public event-list feed. Keep it in the UI source list
    # without allowing that limitation to block the other two calendars.
    today = datetime.now(ZoneInfo("America/Chicago")).date()
    fair_start, fair_end = datetime(2026, 8, 13).date(), datetime(2026, 8, 23).date()
    state_fair = []
    if today <= fair_end and today + timedelta(days=14) >= fair_start:
        state_fair.append({"title": "Iowa State Fair", "when": "Aug 13–23 · 大型活动，建议白天前往", "location": "Iowa State Fairgrounds · Des Moines", "url": "https://www.iowastatefair.org/entertainment/fair-schedule/", "source": "Iowa State Fair", "confidence": "主办方已核对"})
    reiman_events = []
    tortoise_date = datetime(2026, 8, 27).date()
    if today <= tortoise_date <= today + timedelta(days=14):
        reiman_events.append({"title": "Tortoise Tales: Live Animal Meet-and-Greet", "when": "Aug 27 · 4:00–7:00 PM", "location": "Reiman Gardens · Ames", "url": "https://reimangardens.com/events", "source": "Reiman Gardens", "confidence": "All ages · 请核对入园门票与当日安排"})
    prairie_flower = {"title": "Little Song Parent-Child Club", "when": "秋季学期 · 12 次每周课程；本期时间与报名待确认", "location": "Bethesda Lutheran Church · Ames", "url": "https://www.prairieflowercc.org/parent-child-club.html", "source": "Prairie Flower", "confidence": "需要提前报名 · 15 个月–3 岁 · $15/次"}
    unique = {f"{e['source']}|{e['title']}|{e['when']}": e for e in discover + story + state_fair + reiman_events + [prairie_flower]}
    OUT.write_text(json.dumps({"updatedAt": datetime.now(ZoneInfo("America/Chicago")).isoformat(timespec="seconds"), "windowDays": 14, "events": list(unique.values()), "sources": ["Discover Ames", "Story County", "Ames Parks & Recreation"]}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Synced {len(unique)} community event leads.")

if __name__ == "__main__":
    main()
