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
KEYWORDS = re.compile(r"toddler|child|children|kid|family|playdate|fair|festival|farmers.? market|heritage|cultural|camp|class|workshop", re.I)
EXCLUDE = re.compile(r"adult|senior|board meeting|commission meeting|veterans", re.I)
ALL_AGES = ["baby", "toddler", "preschool", "schoolage"]

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
        if not today <= event_date <= today + timedelta(days=120):
            continue
        time = clean((re.search(r"mec-time-details.*?</svg>(.*?)</div>", article, re.S) or [None, ""])[1])
        venue = clean((re.search(r"mec-venue-details.*?<span>(.*?)</span>", article, re.S) or [None, ""])[1])
        groups = ["schoolage"] if re.search(r"camp|workshop", f"{title} {description}", re.I) else ALL_AGES
        events.append({"title": title, "when": f"{date} {time}".strip(), "location": venue, "url": link.group(1), "source": "Discover Ames", "confidence": "亲子线索 · 请核对", "startDate": event_date.isoformat(), "endDate": event_date.isoformat(), "ageGroups": groups})
    return events

def story_county_events(page: str) -> list[dict[str, object]]:
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
        when = clean(date.group(1))
        match = re.search(r"([A-Z][a-z]+)\s+(\d{1,2}),\s*(\d{4})", when)
        if not match:
            continue
        event_date = datetime.strptime(" ".join(match.groups()), "%B %d %Y").date()
        today = datetime.now(ZoneInfo("America/Chicago")).date()
        if not today <= event_date <= today + timedelta(days=120):
            continue
        if re.search(r"camp|completed \d+(?:st|nd|rd|th) grades?", title_text, re.I):
            groups = ["schoolage"]
        elif re.search(r"playdate|nature play", title_text, re.I):
            groups = ["toddler", "preschool", "schoolage"]
        else:
            groups = ALL_AGES
        events.append({"title": title_text, "when": when, "location": location, "url": "https://www.storycountyiowa.gov" + html.unescape(link.group(1)), "source": "Story County", "confidence": "亲子线索 · 请核对", "startDate": event_date.isoformat(), "endDate": event_date.isoformat(), "ageGroups": groups})
    return events

def canonicalize_story_event(event: dict[str, object]) -> dict[str, object]:
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
    if today <= fair_end:
        state_fair.append({"title": "Iowa State Fair", "when": "Aug 13–23 · 大型活动，建议白天前往", "location": "Iowa State Fairgrounds · Des Moines", "url": "https://www.iowastatefair.org/entertainment/fair-schedule/", "source": "Iowa State Fair", "confidence": "主办方已核对", "startDate": fair_start.isoformat(), "endDate": fair_end.isoformat(), "ageGroups": ALL_AGES})
    reiman_events = []
    tortoise_date = datetime(2026, 8, 27).date()
    if today <= tortoise_date:
        reiman_events.append({"title": "Tortoise Tales: Live Animal Meet-and-Greet", "when": "Aug 27 · 4:00–7:00 PM", "location": "Reiman Gardens · Ames", "url": "https://reimangardens.com/events", "source": "Reiman Gardens", "confidence": "All ages · 请核对入园门票与当日安排", "startDate": tortoise_date.isoformat(), "endDate": tortoise_date.isoformat(), "ageGroups": ALL_AGES})
    reiman_events.extend([
        {"title": "Family Movie Night: Disney's A Bug's Life", "when": "Aug 29 · 7:00–10:00 PM", "location": "Reiman Gardens · Ames", "url": "https://reimangardens.com/events", "source": "Reiman Gardens", "confidence": "All ages · 晚间活动，较适合 3 岁以上", "startDate": "2026-08-29", "endDate": "2026-08-29", "ageGroups": ["preschool", "schoolage"]},
        {"title": "Youth Day Camp: Survival Skills", "when": "Sep 14 · 9:00 AM–4:00 PM", "location": "Reiman Gardens · Ames", "url": "https://reimangardens.com/events", "source": "Reiman Gardens", "confidence": "需报名 · 6–10 岁 · $55–70", "startDate": "2026-09-14", "endDate": "2026-09-14", "ageGroups": ["schoolage"]},
    ])
    center_grove_events = []
    butterfly_release_start = datetime(2026, 8, 29).date()
    if today <= butterfly_release_start:
        center_grove_events.append({"title": "Butterfly Release", "when": "Aug 29–30 · 11:00 AM 或 4:00 PM", "location": "Center Grove Orchard · Cambridge", "url": "https://centergroveorchard.com/pages/events/events-gqgphckl", "source": "Center Grove Orchard", "confidence": "亲子自然活动 · 需购票", "startDate": "2026-08-29", "endDate": "2026-08-30", "ageGroups": ALL_AGES})
    center_grove_events.append({"title": "Country Celebration", "when": "Sep 1–30 · 季节性农场活动", "location": "Center Grove Orchard · Cambridge", "url": "https://centergroveorchard.com/pages/fall-on-the-farm", "source": "Center Grove Orchard", "confidence": "适合家庭 · 出发前确认开放时间与门票", "startDate": "2026-09-01", "endDate": "2026-09-30", "ageGroups": ALL_AGES})
    prairie_flower = {"title": "Little Song Parent-Child Club", "when": "秋季学期 · 12 次每周课程；本期时间与报名待确认", "location": "Bethesda Lutheran Church · Ames", "url": "https://www.prairieflowercc.org/parent-child-club.html", "source": "Prairie Flower", "confidence": "需要提前报名 · 15 个月–3 岁 · $15/次", "startDate": "2026-09-01", "endDate": "2026-11-30", "ageGroups": ["toddler", "preschool"]}
    unique = {f"{e['source']}|{e['title']}|{e['when']}": e for e in discover + story + state_fair + reiman_events + center_grove_events + [prairie_flower]}
    OUT.write_text(json.dumps({"updatedAt": datetime.now(ZoneInfo("America/Chicago")).isoformat(timespec="seconds"), "windowDays": 120, "events": list(unique.values()), "sources": ["Discover Ames", "Story County", "Ames Parks & Recreation", "Reiman Gardens", "Center Grove Orchard"]}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Synced {len(unique)} community event leads.")

if __name__ == "__main__":
    main()
