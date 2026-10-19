# Device Management

## Current homepage production work

2026-10-19 user confirmed retaining software-center GET`/cgi-bin/luci/admin/store/installed`: once on mount, independent loading,8-second timeout, explicit user retry on errors/timeouts, no automatic retry/polling or alternate source. New frontend`efbd8a6` adds a distinct bilingual timeout message and Retry; B key`0.16.6-test20261018-preview-efbd8a6-5e45ac53284a` now directly replaced, backendc9624a3/opkg0.16.5 retained. 114 frontend/type/Web and local5-group/8-view checks passed. Chinese and English B each7 scenarios passed including real6 apps, repeat-open reuse,503/403/invalid/empty and8s timeout recovery, other device data/system tools load independently, one click one GET, no config writes. Actual desktop/mobile/error and bilingual timeout screenshots opened,20 protected paths/LAN/default route unchanged,4 root sessions destroyed. [Final manual-retry evidence](docs/evidence/m70/installed-apps/manual-retry/acceptance.md). First candidate passed; no APK deployment or SDK/push/release.

2026-10-19 installed-source analysis: user designated opkgB192.168.30.244 and APK192.168.9.140 (EasePiR2/iStoreOS25.12.5, store0.2.1-r1). Read-only SSH and3 serial authenticated installed GETs each passed,6 API IDs equal each device's metadata and installed app-meta package IDs;10 protected paths unchanged per device,2 root sessions destroyed. B store0.1.29-4 median19.59ms; APK54.68ms incl network/LuCI, small sample no contention testing. Both use installed-cache lock distinct from install-task lock; APK first GET naturally created/tmp cache/lock. Recommendation is retain current software-center GET unless zero backend writes/explicit file locks become hard constraints or actual waits justify own reader; not a user decision to redesign. Missing metadata can be returned as empty and mtime caching has freshness limits. Existing catalog is not yet a fully compatible replacement. [Analysis/evidence](docs/evidence/m70/installed-apps/opkg-apk-analysis-20261019/analysis.md). No deployment/config changes, APK Quickstart UI/package acceptance remains unproved.

Latest installed-app fix on B: frontend`d235975`, key`0.16.6-test20261018-preview-d235975-118247342b18`; backend remainsc9624a3/0.16.6 and opkg0.16.5. Production launcher now reads software center's authenticated GET`/cgi-bin/luci/admin/store/installed` raw array; the former catalogue depended on absent/tmp metadata and returned a business error. Real software-center/home ID sets now match all6 apps. Never call configured/entrysh/package actions to populate the list. Empty/failed/permission states remain separate; /apps/ installed entry performs full same-origin navigation. Favorites, links and layout are unchanged. 114 frontend tests/type/Web, two local UI groups and current B five scenarios passed first candidate; actual desktop/mobile/error screenshots opened, two temporary sessions destroyed,20 protected paths/LAN/default route unchanged. [Evidence](docs/evidence/m70/installed-apps/acceptance.md). Fast direct Web replacement only, no new SDK/package/push/release. Earlier system-loading/device-IP fixes remain included.

Latest device tile update on B: frontend`31cc6e6`, key`0.16.6-test20261018-preview-31cc6e6-42c7b4144b3d`; backend remainsc9624a3/0.16.6, opkg0.16.5. The second line now shows the device's current IP instead of repeated type-unconfirmed text, preserving two lines and height. Current IPv4 first, IPv6 if needed; historical explicitly labelled, MAC/identity fallback. Full address/brand/type remain in title/aria and original details; stable deviceId/navigation unchanged. 110 tests/type/Web build, two local UI groups and current B address/height/navigation checks passed first candidate. B1440 height302.078125px unchanged; actual desktop/mobile screenshots opened. Current B has some IPv6-only observations; do not infer missing IPv4. User layout and system-loading fix retained, no config writes; two temporary sessions destroyed. [Evidence](docs/evidence/m70/device-address/acceptance.md). No SDK/push/public release; prepared older package/feed inputs have not yet been resynchronized to these independent frontend fixes.

System widget refresh fix now on B: frontend `929317e` / cache key `0.16.6-test20261018-preview-929317e-b4cc06b47373`, backend remains frozen `c9624a3`/0.16.6, opkg remains0.16.5. Render the same complete standard/summary component from first paint, blur its body while status/version are pending, use unknown placeholders, and keep the structure for full failure/retry. No persistent live cache or measured-height writes. Baseline62→290px reproduced; local five cases and final B five cases passed. Current B user layout places system in a stacked column, so it resolves to summary: desktop loading/data/failure/retry all148.984375px; 390px153.984375px and320px English183.984375px remain stable. Do not reset the user's layout to the old default. B first two harness failures (fixed wait, omitted stacked role) retained; third passed. Six temporary sessions destroyed, no homepage writes; [current evidence](docs/evidence/m70/system-loading/acceptance.md). Other historic failures remain separate.

Latest user screenshot correction (2026-10-18): restore the full-width blue utility bar with white website text/settings icon, remove the entire legacy QuickActions row below it (network setup/devices/speed/parental/store), keep only the approved new widget body and no custom footer. This supersedes the earlier interpretation below. Existing business actions stay in the original routes, widgets and full library. See [new task tree](docs/evidence/m70/header-correction/status.md); do not reopen the separate unchanged English320 connection-title gate as part of this correction or erase its failure.

Current B runtime is now `0.16.6-test20261018` / `c9624a3`, directly replaced at the user's explicit request for the fastest build-and-view path. Opkg remains0.16.5; do not claim0.16.6 package installation. Blue header/removal and current desktop+English touch page checks passed, actual screenshots opened; local77 and B11 widget dimensions/forms unchanged. Original parental action returned404: installed OAF5.0.7 registers network/appfilter while the existing action uses services/appfilter. Preserve that failed navigation group and the independent old English320 title failure. No SDK build/deploy, push, Release or Action; current evidence and boundaries: [B fast-candidate report](docs/evidence/m70/header-correction/acceptance.md). All eight temporary sessions destroyed; no homepage config writes during these B UI checks. The0.16.5 paragraphs below describe the previous candidate.

Latest 2026-10-18 user-approved top/footer implementation is installed, with a remaining visual gate: restore the former formal website/settings and QuickActions top, retain the new ordered widgets, remove added brand/hero/custom footer. Settings opens the same production editor; LuCI system shell stays unchanged. Runtime `9d74bd3` / `0.16.5-test20261018` is on B (Quickstart -2, LuCI -r2; NetPolicy unchanged/disabled). Final Go/105 frontend/type/build, five local UI automation groups, matched x64 SDK/IPK and five authenticated B automation groups passed. Final screenshot review and one extra read-only measurement found the unchanged Connection & IP title overlaps its action by about7.23px at320px English/touch; do not claim all visual acceptance passed. The user allowed at most three rounds, so no fourth product revision: pause this visual dependency, retain the implemented top/footer and current test candidate. Ten group sessions plus one diagnostic session destroyed; primary values restored without revision rollback, test-affected backups restored byte-for-byte, service-restart/final preservation passed. See [task tree and evidence](docs/evidence/m70/home-shell/status.md). The earlier0.16.4 candidate failed OS-dark icon contrast and was never installed. Older0.16.3 evidence is historical; APK/DHNS/ARM/24h gates remain independent, not newly passed.

2026-10-18 user decision: the router has only root login; all visitors after login share one router-owned customized homepage, launcher pins and link library. No account-scoped or browser-owned settings. All valid root sessions have the same read/write capability; still handle expired sessions, private configuration and concurrent editors. This resolves the former scope question. The current 5180 product was inspected again; see [implementation work packages](docs/product/quickstart-home-production.md#5180当前产品复核与正式实施细化) and [current product review](docs/evidence/m69/production-plan-20261018/acceptance.md).

2026-10-18: the user confirms the homepage product/visual design is complete and authorizes formal implementation, current-device acceptance and packaging closeout. Historical pending aesthetic signoff is not a new gate. Follow [production contract and existing M69/M70 task tree](docs/product/quickstart-home-production.md), [current execution state](docs/evidence/m69/01-layout-preferences/status.md), the layout specification and VS01–VS12. Initial checkout HEAD is `d1fa2a6`, clean; do not substitute the handoff hash or historical test totals for current evidence.

Previous baseline: formal runtime was frozen at `c78f62c`, version `0.16.3-test20261018`: root-shared durable layout/launcher, explicit business adapters and real device list. B `192.168.30.244` then had matching opkg packages: Quickstart `0.16.3-test20261018-2`, LuCI `0.16.3-test20261018-r2`, NetPolicy `0.2.0-test20260928-2` (disabled). Those package/file/serve+startdhns process/API/resource checks, seven authenticated UI groups, service-restart persistence and actual system-backup byte comparison passed. Six baseline x64/ARM64 IPKs passed; APK remains paused after three rounds at missing DNSTAP host generators, ARM64 has no physical installation conclusion, and 24h observation is deferred. [M70 evidence](docs/evidence/m70/status.md) retains the earlier DHNS port initialization; the 0.16.3 upgrade itself passed strict configuration preservation without exceptions. A supplementary DHNS recovery-proxy HTTP probe timed out and is not claimed passed; isolate that legacy path before fault testing. No Git push, public Release or Action. A/C/D remain untouched. Earlier version/status paragraphs below are historical.

This context describes how Quickstart identifies LAN devices, presents their state, and applies per-device network policy.

The earlier 0.16.3 fix, retained in 0.16.5, preserves the selected eQoS mode/rules and replaces the misleading reinstallation action for an already installed NetPolicy with settings guidance. Its local Go/105 frontend/type/business gates, formal UI, nine compatibility cases, matched SDK/B upgrade and real provider/DHCP-authority checks passed. [The M70 follow-up](docs/evidence/m70/netpolicy-preparation/status.md) records immutable inputs, failures, cleanup and scope. APK's three-round pause remains in effect.

## Language

**Device**:
A LAN client represented as one product entity even when it has multiple observations or addresses.
_Avoid_: Host, client row, IP device

**Device Identity**:
The stable reference used to recognize the same Device across observations; an address or display name alone is not an identity.
_Avoid_: IP identity, hostname identity

**Observation**:
Evidence that a Device or address was seen from a local network source at a particular time.
_Avoid_: Device record

**Current Address**:
An IPv4 or IPv6 address presently owned by a Device according to current observations.
_Avoid_: Active device

**Historical Address**:
An address previously owned by a Device during the retained history window but not currently owned by it.
_Avoid_: Old device

**Online Device**:
A Device with sufficiently recent direct presence evidence on the LAN.
_Avoid_: Active device

**Offline Device**:
A previously observed Device without sufficiently recent direct presence evidence on the LAN.
_Avoid_: Disabled device, blocked device

**Capability**:
A device-management function that the current router installation and configuration can actually provide.
_Avoid_: Feature flag, plugin state

**Device Policy**:
The desired static addressing, gateway, speed, or network-access rules associated with a Device.
_Avoid_: Device state, device config

**Telemetry**:
Time-sensitive traffic measurements attributed to a Device, distinct from its identity and Device Policy.
_Avoid_: Device status

**Manufacturer**:
The raw organization name associated with a Device observation, usually from an OUI registry; it is evidence and may not be the consumer-facing maker.
_Avoid_: Brand, device type

**Brand**:
A normalized, consumer-facing maker name that can be shown as factual text when supported by Manufacturer or model evidence.
_Avoid_: Manufacturer, logo

**Device Category**:
A generic product form such as computer, phone, television, camera, or network device used to select the Device's visual shape; it is not an exact model claim.
_Avoid_: Brand, model, scene logo

**Device Classification**:
The current Brand and Device Category conclusion for a Device, together with its evidence source and confidence.
_Avoid_: Device Identity, Manufacturer

**Classification Source**:
The strongest evidence that produced a Device Classification: manual correction, model, hostname, manufacturer default, or fallback.
_Avoid_: Data source health

**Manual Classification**:
A user-confirmed Device Category that takes precedence over automatic classification until the user resets it.
_Avoid_: Device name, Device Policy

**Device Alias**:
A user-owned display name for a Device that remains independent of DHCP hostname and Address Reservation.
_Avoid_: Hostname, DHCP name

**DHCP Hostname**:
An optional protocol-compatible ASCII host label advertised or assigned through DHCP configuration; it may affect network name resolution and is never the user's Unicode-capable Device Alias.
_Avoid_: Device Alias, display name

**Device Profile**:
The durable, user-owned metadata for a Device Identity: Device Alias, explicit Brand or Device Category corrections, and Icon Preference. It contains neither Device Group membership nor network policy.
_Avoid_: Device Group, Device Policy, DHCP host

**Icon Preference**:
The user's choice to follow automatic Brand-and-Category visual resolution or pin a specific approved icon for a Device.
_Avoid_: Manufacturer logo, Device Category

**Desired Policy**:
The network outcome the user has asked Quickstart to maintain for a Device or Device Group.
_Avoid_: Applied Configuration, Observed Effect

**Applied Configuration**:
The router configuration that Quickstart has successfully written and verified as representing a Desired Policy.
_Avoid_: Desired Policy, Observed Effect

**Observed Effect**:
Bounded evidence about what happened after configuration was applied; it may be pending or unverifiable when the endpoint cannot be observed.
_Avoid_: Save result, Applied Configuration, Online Device

**Address Reservation**:
A DHCP rule that reserves an IPv4 or IPv6 address for a Device Identity; it is distinct from the Device's currently observed address.
_Avoid_: Current Address, static device

**Internet Path**:
The user-facing choice of which Gateway Target a Device should receive, with DNS following the same path unless a future product decision explicitly changes that rule.
_Avoid_: DHCP tag, route label

**Gateway Target**:
A selectable next-hop destination such as this router, an upstream router, a bypass router, or a Floating Gateway.
_Avoid_: Device, node role

**DHCP Policy Tag**:
An internal dnsmasq tag that binds a DHCP host rule to DHCP options such as gateway and DNS server; it is an implementation mechanism, not a user organization label.
_Avoid_: Device tag, Device Group

**Floating Gateway**:
A virtual IPv4 address that can move between a preferred node and a fallback node according to health checks; DHCP must separately advertise it as a Gateway Target.
_Avoid_: Floating route, DHCP gateway

**Gateway Node**:
A router participating in a Floating Gateway pair, described to users by its real role (preferred service node or takeover node) rather than the plugin's internal role value.
_Avoid_: Device, client

**Device Group**:
A user-facing collection used to organize Devices and assign shared policy; it must not reuse the DHCP Policy Tag name or storage semantics.
_Avoid_: DHCP Policy Tag

**Internet Access Policy**:
The Desired Policy that determines whether a Device may access the network, independently of any speed-limiting capability.
_Avoid_: Online Device, Speed Policy

**Speed Policy**:
The optional Desired Policy that limits upload or download throughput for a Device or Device Group.
_Avoid_: Internet Access Policy, Traffic Quota

**Usage Policy**:
The schedules, quotas, Internet Access Policy, and Speed Policy associated with a Device or Device Group.
_Avoid_: Telemetry, online state

**Router Context**:
The router's evidence-backed role and DHCP allocation authority for one selected LAN, used to explain whether Internet Path changes are locally editable.
_Avoid_: Global bypass-router flag, Capability

**Policy Precedence**:
The deterministic rule that explains which global, group, and per-device policy wins when more than one policy applies.
_Avoid_: Rule order, UCI order

**Traffic Insights**:
Bounded, locally persisted hourly/daily/monthly usage derived from Device Telemetry; it is separate from real-time speed and optional connection/DNS adapters.
_Avoid_: Live speed, Bandix data

**Traffic Quota**:
A daily, weekly, or monthly byte allowance that can notify or temporarily block a Device; an enabled quota is an explicit background telemetry consumer.
_Avoid_: Speed limit, schedule

**Audit Event**:
A bounded, privacy-safe explanation that a device lifecycle, policy, conflict, quota, probe, or observed gateway-holder change occurred.
_Avoid_: Debug log, DNS history

**Policy Bundle**:
A versioned export of Device Groups, per-device group exceptions, and Traffic Quotas that must be previewed and version-checked before restoration.
_Avoid_: Full router backup, UCI archive

## Homepage Language

Latest visual revision: [M66.69 title actions](docs/product/quickstart-home-header-actions-m66-69.md). Existing homepage primary actions use leading business icons plus text, with the same joined More control. WidgetPrimaryAction owns only native button/presentation; original callbacks, menus, native templates, app/link state, layout and body arrows remain protected. [Current acceptance](docs/evidence/m66/header-actions/review/acceptance.md): 19 browser suites / 210 groups pass; 341 source files, six business scripts and 64 original files protected; actual three public assets and source/test hashes match. One test adaptation handles the native remote button's direct text node; failed evidence retained. The user requested archiving this implementation; [commit note](docs/evidence/m66/header-actions/commit-note.md) preserves tested pre-commit fingerprints. Human confirmation remains separate. This supersedes earlier runtime assets below; the prior 318-group application acceptance remains that phase's evidence.

Current revision is [interaction specification 1.7](docs/product/quickstart-home-layout-interaction-spec.md), [M66.63–M66.68 full application launchpad](docs/product/quickstart-home-launchpad-m66-63-68.md). All opens a unified icon library (48 per page), independent of the 24 homepage pins; user links have a separate 64-entry memory budget and namespaced identity. Save lands on the entry's actual page, unpin retains the library entry, deletion confirms and cleans the pin reference. The eight original tools, layout, other widgets and system menu remain protected. [Current-candidate acceptance](docs/evidence/m66/launchpad/68-review/acceptance.md): 28 browser suites / 318 groups plus 16 model groups passed, 341 frozen sources and 64 original business files unchanged, actual public assets and source/test fingerprints match; two M66.68 optimizations retained failed evidence. The user requested archiving this implementation and evidence; [commit note](docs/evidence/m66/launchpad/commit-note.md) preserves the tested pre-commit fingerprints. This supersedes the prior 263-group candidate below. Synthetic sources and memory-only preferences/links still apply; formal API/ACL/persistence and human confirmation remain separate.

The user has accepted the customizable homepage layout as complete; the archived prototype is commit `ed30df5` (M66.38–M66.50). Shared widget chrome was applied in `d4d00ea`; the five-row default layout is `fc9df26`. After [M66.51–M66.56 visual refinement](docs/product/quickstart-home-visual-refinement-m66-51-56.md), [M66.57–M66.62 apps and tools launcher](docs/product/quickstart-home-launcher-m66-57-62.md) completed 22 current-candidate suites / 263 groups plus protected-source checks; see [current acceptance](docs/evidence/m66/launcher/62-review/acceptance.md). The launcher defaults to eight original tools, supports 24 saved shortcuts and an independent drag editor hosted outside responsive slots. Catalogue errors remain unknown, unavailable pins retain identity and are reachable through All, and layout transactions remain separate. [Interaction specification 1.6](docs/product/quickstart-home-layout-interaction-spec.md) and the [shared visual contract](docs/product/quickstart-home-widget-visual-standard.md) are the product baselines. This remains the isolated Vue prototype with synthetic installed apps and memory-only favorites; formal API/error semantics, ACL, persistence and actual-device integration remain future work. Human aesthetic confirmation is separate from technical checks.

Current boundary interaction revision: [M66.50 task tree](docs/product/quickstart-home-boundary-resize-m66-50.md), specification 1.5 R37–R40. Default intrinsic layout remains; selected-row editing adds column, stack and bottom-edge grips. Optional `minHeight` / `upperShare` store intent only. Responsive/content clamping never writes measured sizes or changes widget forms. Prototype-only; current verification lives in `docs/evidence/m66/boundary-resize/` and human acceptance is separate. Earlier sections below remain historical.

Current layout revision: [structure and presentation separation, M66.44–49](docs/product/quickstart-home-structure-presentation-m66-44-49.md), [current 192-group checks](docs/evidence/m66/structure-presentation/48-review/acceptance.md), and [human tasks](docs/evidence/m66/structure-presentation/49-handoff/review-guide.md). Stacking no longer forces summary; validated forms carry position and stretch capability. A complete connection and compact named ports can share one column beside an expanding flow chart. Schema v3 preserves earlier automatic rule profiles (v1=0, v2=1, current=2). Overview geometry is separate from actual card geometry. The following natural-layout revision is historical; current rules are specification 1.4 R31–R36. Human experience for this revision remains pending.

Current prototype business baseline: [six original home widgets](docs/product/quickstart-home-business-widgets-alignment.md), with [historical parity checks](docs/evidence/m66/business-widgets/status.md). Original Vue cards/forms remain the source of business behavior; the ordered design entry provides synthetic reads/writes and isolated action hosting. Layout edits must not write business configuration. Component styling follows business parity; prototype evidence does not establish router/install acceptance.

Current layout contract: [natural rows and system forms, M66.38–43](docs/product/quickstart-home-natural-layout-m66-38-43.md), [current technical checks](docs/evidence/m66/natural-home/42-review/acceptance.md), and [human review tasks](docs/evidence/m66/natural-home/43-handoff/review-guide.md). Ordinary rows size from bounded content; same-row frames stretch equally. Actual measured height never selects a form or becomes persisted state. System summary and complete forms retain one widget identity and shared business data. Legacy height/split are compatibility metadata, not ordinary editing controls. Human confirmation for this revision remains pending.

**Home Widget**:
A separately selectable homepage business unit whose display form may change while its business responsibilities and actions remain identifiable.
_Avoid_: Display form as a separate business module

**Network Connection**:
The router's observed outbound connectivity, addressing, and DNS information; it is distinct from individual network port link states and from a LAN Device's Internet Path.
_Avoid_: Network Interface Status, Device online state

**Network Interface Status**:
The observed link state, negotiated speed, and details of the router's network ports and their associated logical interfaces; a connected port alone does not establish Internet connectivity.
_Avoid_: Network Connection, Internet availability

2026-10-18 后续：正式首页、root共享配置、一次迁移、独立域保存/恢复和十一控件接入已编码，本地测试与审图见 docs/evidence/m69/02-business/status.md。版本推进为0.16.0-test20261018。当前B仍为旧安装，下一步完整候选部署和真实认证验收；本地app-hub已登记配置升级保留，尚未推送/发布/SDK打包。
