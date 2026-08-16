#!/usr/bin/env python3
"""Fetch today's Ames Public Library events for the static website."""

from __future__ import annotations

import html
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

SITE = "https://www.amespubliclibrary.org"
EVENT_FEED = f"{SITE}/events/feed/html"
OUTPUT = Path(__file__).resolve().parents[1] / "data" / "library-events.json"
TARGET_EVENTS = {"Toddler Storytime"}

def fetch_today_events() -> tuple[str, list[dict[str, str]]]:
    today = datetime.now(ZoneInfo("America/Chicago")).date().isoformat()
    query = urlencode({"_wrapper_format": "lc_calendar_feed", "adjust_range": "1", "bundles": "lc_closing,lc_event", "current_date": today, "ongoing_events": "hide"})
    request = Request(f"{EVENT_FEED}?{query}", headers={"User-Agent": "TodayWithMyKids/1.0"})
    with urlopen(request, timeout=30) as response:
        page = response.read().decode("utf-8")
    events, seen = [], set()
    pattern = re.compile(r'<a[^>]+aria-label="View Details - &quot;(?P<name>[^&]+)&quot;[^>]+href="(?P<href>[^"]+)"[^>]*>', re.IGNORECASE)
    for match in pattern.finditer(page):
        name = html.unescape(match.group("name")).strip()
        if name not in TARGET_EVENTS:
            continue
        aria_label = html.unescape(match.group(0))
        time_match = re.search(r"@\s*([^\-]+?)\s*[-–]", aria_label)
        event = {"name": name, "time": time_match.group(1).strip() if time_match else "查看官方日历", "url": f"{SITE}{match.group('href')}"}
        key = (event["name"], event["time"])
        if key not in seen:
            events.append(event)
            seen.add(key)
    return today, events

def main() -> None:
    try:
        date, events = fetch_today_events()
    except Exception as error:
        print(f"Unable to sync library calendar: {error}", file=sys.stderr)
        raise SystemExit(1)
    OUTPUT.write_text(json.dumps({"date": date, "updatedAt": datetime.now(ZoneInfo("America/Chicago")).isoformat(timespec="seconds"), "source": f"{SITE}/events/list", "events": events}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Synced {len(events)} matching library event(s) for {date}.")

if __name__ == "__main__":
    main()
