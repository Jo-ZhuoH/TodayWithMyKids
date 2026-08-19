# Today With My Kids — Ames

一个为 Ames, Iowa 家长设计的本地亲子活动网页。它的目标不是列出所有可能性，而是每天给出少量、能立刻出门的建议，并保留未来活动供提前规划。

## 第二版功能

- **今天的 3 个建议**：按年龄段、车程、室内/室外与免费筛选；可“换一批”。默认年龄段为 Toddler，另支持 Baby、3–5 岁、6–10 岁。
- **当天实用天气**：显示 Ames 当前天气、未来 5 小时温度和降雨概率；只有降雨、强风或高紫外线等需要注意时才显示提醒。
- **图书馆日历同步**：仅在当天官方日历确认有场次时才推荐 Toddler Storytime；同步工作流每 3 小时更新一次。
- **本周特别活动**：按本周内实际日期和时间排序；也包括本周尚未来到的固定活动，例如 Caterpillar Club。
- **未来活动列表**：保存单次、季节性与需提前报名的活动；显示日期、时间、地点、适合年龄、路线和主办方链接。
- **路线导航**：不读取或保存用户的精确位置；活动卡只将目的地传给 Google Maps 进行驾车导航。

## 使用方式

打开 [index.html](index.html)，或访问 GitHub Pages 版本。首页的“查看全部未来活动”会打开站内的 [all-activities.html](all-activities.html)。

“推荐活动”提交入口已预留，后续将连接 Google Form：提交者只需填写活动链接，可选勾选适合年龄；所有提交由网站维护者审核后才会加入公开列表。

## 数据来源

### 日常地点与活动

- [Ames Public Library 活动日历](https://www.amespubliclibrary.org/events/list)
- [City of Ames Parks & Recreation](https://www.cityofames.org/My-Government/Departments/Parks-and-Recreation)
- [Reiman Gardens](https://reimangardens.com/)

### 本周与未来特别活动

- [Discover Ames 活动日历](https://discoverames.com/events/)
- [Story County Calendar](https://www.storycountyiowa.gov/Calendar.aspx)；若其详情页链接到 MyCountyParks，则优先采用该主办方页面的地点和链接
- [Iowa State Fair](https://www.iowastatefair.org/)
- [Center Grove Orchard](https://centergroveorchard.com/pages/calendar)
- [Prairie Flower Parent-Child Club](https://www.prairieflowercc.org/parent-child-club.html)

### 服务数据

- 天气：[Open-Meteo](https://open-meteo.com/)
- 路线：[Google Maps Directions](https://developers.google.com/maps/documentation/urls/get-started)

自动同步仅用于公开日历的活动线索；卡片保留主办方链接，出发前仍应核对当天时间、报名、费用与季节性开放状态。Ames Parks & Recreation 目前没有稳定、适合自动读取的公开活动列表，因此相关信息仍需手工核对。

## 数据维护

- `scripts/sync_library_calendar.py`：读取当天 Ames Public Library 儿童活动。
- `scripts/sync_special_events.py`：读取近期公开活动，并补充已核实的未来活动。
- `.github/workflows/sync-library-calendar.yml`：每 3 小时运行以上同步脚本；若数据变更，会提交更新后的 JSON 文件。
- `data/ames-park-exploration.csv`：公园探索清单。`confirmed` 表示官方资料已确认；`likely_playground` 仍待现场或官方详情页核实。

不要把搜索结果直接当成长期事实。每个活动都应保留原始主办方链接；不确定的年龄、费用、地点或开放状态应标记为“待核对”。

## 接下来的方向

1. 继续手工验证常去公园的低龄设施、饮水 fountain、戏水与步道信息。
2. 连接 Google Form，让其他家长提交活动链接，并保持人工审核后发布。
3. 在用户明确授权时，提供一次性定位或家庭地址作为更精确车程的可选功能。
