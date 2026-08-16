# Today With My Kids — Ames MVP

一个为 Ames, Iowa 家长设计的本地亲子活动发现网页。第一版服务的默认家庭是：

- 孩子：18 个月
- 常用半径：10 分钟车程（最多 15 分钟）
- 值得专程去的活动：20–30 分钟
- 优先类型：公园、图书馆、免费室内活动、徒步、戏水与周末临时活动

## 第一版目标

首页固定回答“今天去哪儿”；用户再按车程、室内/室外和费用筛选。默认仅显示 3 个分散类型的建议，可点击“换一批”。卡片只显示决策必要信息：年龄、距离、费用和仅在需要时显示的预约/戏水提醒。饮水设施保留在数据层，暂不在界面显示。

## 当前原型

`index.html` 是无需安装任何软件即可打开的交互式原型。它混合展示少量已核实地点与待核实条目；天气状态也只是界面示例，不应作为真实出行信息。

在 Finder 双击 `index.html`，或用浏览器打开它即可查看。

## 首批可靠数据来源

- Ames Public Library 活动日历：<https://www.amespubliclibrary.org/events/list>
- City of Ames Parks & Recreation：<https://www.cityofames.org/My-Government/Departments/Parks-and-Recreation>
- Reiman Gardens：<https://reimangardens.com/>

每项数据均应保留原始链接与“最后核实日期”。不要把 Google 搜索结果当作可长期自动抓取的数据源。

## 接下来三步

1. 手动验证并加入 15 个你确认过的 Ames 地点与活动；先做少而准，不追求完整覆盖。
2. 请 3–5 位本地家长用原型找一次活动，记录他们会筛选什么、还缺什么。
3. 再安装 Node.js，升级为 Next.js + Supabase + 正式天气/地图 API 的网页应用。

## 手工验证（下一步）

从 [data/ames-activities.csv](data/ames-activities.csv) 开始。每次只验证一个地点或活动：

1. 打开主办方网页，核对地址、费用、预约要求和当天开放状态。
2. 对公园，补充实际观察到的低龄设施、饮水 fountain 和是否有戏水。
3. 写入 `last_verified` 日期；不知道的字段写 `unknown`，不要猜测。

第一轮建议只做：你常去的 5 个公园、图书馆、一个室内备选、一个戏水点和 5–7 个本周末活动。

`data/ames-park-exploration.csv` 是公园探索清单：其中 `confirmed` 表示已由官方页面核实有 playground；`likely_playground` 只是待你或官方详情页确认的探索候选，不能直接在产品中当成事实展示。

## 已接入的实时信息

- 天气：网页会以 Ames 坐标读取当日预报，只在有降雨、强风或高紫外线等需要行动的情况显示提醒。
- 导航：每张卡片的“导航”使用 Google Maps URL，目的地为活动名称；未保存或传送家庭住址。
