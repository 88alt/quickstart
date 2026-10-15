# Quickstart Vue 首页设计原型

## 当前原型：M66.19～M66.24 槽位编辑

用户已认可“真实页面选行布局、填槽位为主，整页布局总览为辅”。产品指导统一见[布局交互规范1.0](../quickstart-home-layout-interaction-spec.md)，实施任务树、测试目标及证据位置见[M66.19～M66.24计划](../quickstart-home-slot-edit-milestones.md)。[阶段状态](../../evidence/m66/slot-edit/status.md)：19～23自检通过，24当前候选技术验收通过、已交付，待用户最终体验确认。

公开入口：[默认首页](http://192.168.9.19:5180/?layout=ordered) · [应用半宽](http://192.168.9.19:5180/?layout=ordered&preset=half)。顶部设计预览也提供半宽、左右上下组合、三列服务、状态、权限及语言选择。刷新旧标签页加载当前构建。左侧系统菜单保持；内存应用、刷新恢复示例。

1. “自定义首页”默认进入真实页面编辑；每行“布局”选择五种结构。缩槽明确选择保留项，不再自动新建行收纳多余模块。
2. 空槽位添加、已有模块替换或从首页移除。选择器说明适配及已有来源；选中后在底部预览影响，再确认。已有模块移来，来源留空，被替换模块仅隐藏，不交换。
3. 分隔线或行工具调整比例／高度；放不下时明确说明，不裁切或自动拉高。空槽位编辑中保留，完成前预览整理；复杂上下组合须补齐或换结构。
4. 次级“布局总览”压缩四行结构便于移动。点击名称→移动→选择位置，或拖名称；整行有独立手柄。普通单／双列边缘可扩列，满三列和上下组合不隐式扩容。返回真实页面判断尺寸。
5. 撤销恢复一个完整动作；取消恢复进入时布局；完成更新本次内存，详情往返保持，刷新重置。Escape先取消当前动作／关闭面板。应用卡按容器宽高换列，全部面板保留常用管理、系统工具及软件中心。

当前[技术验收](../../evidence/m66/slot-edit/24-review/acceptance.md)、[场景覆盖](../../evidence/m66/slot-edit/24-review/coverage.md)、[候选资源](../../evidence/m66/slot-edit/24-review/candidate.json)、[人工任务卡](../../evidence/m66/slot-edit/24-review/review-guide.md)。当前公开入口index.76bdeab0.js；源指纹及3个JS/CSS资源校验见候选，不能使用旧截图代替当前候选。

检查入口：`slot-contract-review.cjs`、`slot-module-review.cjs`、`slot-primary-review.cjs`、`slot-normalization-review.cjs`、`slot-overview-review.cjs`、`slot-input-review.cjs`、`slot-resource-review.cjs`、`slot-navigation-review.cjs`、`slot-final-review.cjs`、`slot-candidate.cjs`。均通过`rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/<入口>`；重验给`QS_DESIGN_EVIDENCE_ROOT`新的独立目录。最终视觉脚本逐轮保留子目录，结束后再以该子目录运行`ordered-screenshot-audit.cjs`，不要在报告生成前启动审计。权限专项复用`ordered-authority-popover-review.cjs`。下文均为历史实现说明，不作为当前操作指南。

## 历史：M66.13～M66.18 就地编辑

此前公开入口为[5180首页](http://192.168.9.19:5180/)。用户已认可功能基线并授权执行就地编辑计划；M66.13～17已自检通过，M66.18技术检查通过、候选已交付，最终体验尚待用户确认。[该轮阶段状态](../../evidence/m66/direct-edit/status.md) · [评审指南](../../evidence/m66/direct-edit/18-review/review-guide.md) · [计划](../quickstart-home-direct-edit-milestones.md)。以下操作说明记录该轮实现，本次未重新验证服务状态；后续交互目标以文首新规范为准。

1. 刷新页面，右上“自定义首页”进入编辑。上方只保留紧凑工具条，原大表单已移走。
2. 拖卡片手柄到高亮目标：交换、空位或独占新行；也可点手柄→移动→点目标，跨屏用“目标列表”。整行有独立移动手柄。
3. 拖分隔线调整比例，或从行边缘“布局”打开结构缩略图、行高档位与比例小样；精确数值可展开。手机通过同一结构面板调整桌面比例，单列阅读不改写原配置。
4. 添加模块打开临时面板，选择模块后选择位置；已添加模块可定位或隐藏。隐藏全部后仍可添加或从“更多”恢复推荐。
5. 撤销一次恢复一个成功动作；取消恢复上次完成的布局；完成只保留预览内存。设备详情往返保持，刷新恢复URL示例。Escape取消当前操作或关闭面板。

设计预览控件继续集中在顶部，可切换默认、左右堆叠、三列服务、数据状态、DHCP分配方、语言与主题。320px使用“预览/Preview”短标题，读屏名称保留完整含义。左侧系统菜单不在编辑范围。

新检查入口：`direct-editor-review.cjs`、`direct-movement-review.cjs`、`direct-layout-review.cjs`、`direct-input-review.cjs`、`direct-visual-review.cjs`、`direct-resource-review.cjs`。均使用`rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/<入口>`；新一轮给`QS_DESIGN_EVIDENCE_ROOT`指定独立目录，保留失败历史。PNG审计在visual报告完成后运行`ordered-screenshot-audit.cjs`，其证据根必须与visual一致。

## 历史：M66.10～M66.12 的完整原型

最新产品反馈（2026-10-15）：用户认可功能定义并要求提交当前代码；当前大表单编辑交互仍需优化。此认可作为功能基线，不能标记最终视觉/交互验收完成，见[确认记录](../../evidence/m66/row-layout/12-design-signoff/functional-baseline-approval.md)。

当前验收状态（2026-10-15）：用户授权继续后，320px权限弹层越界已修正，整页截图捕获期间的临时视口重排已定位并采用同宽完整内容捕获。当前TypeScript、13组编辑交互、24基准/42状态/13临界点/生命周期、72次权限说明点击及48张真实PNG图表区域审计均通过；见 [本轮验收](../../evidence/m66/row-layout/11-review/continuation-1/acceptance.md)。M66.12已交付，待用户实际确认视觉和交互，见 [评审指南](../../evidence/m66/row-layout/12-design-signoff/review-guide.md)。上轮失败证据原样保留。

当前公开入口：[默认首页](http://192.168.9.19:5180/?layout=ordered)。请刷新旧标签页，当前服务使用构建后预览。

- [左大右上下](http://192.168.9.19:5180/?layout=ordered&preset=stacked)：320px原曲线旁是连接/系统两个紧凑摘要。
- [左上下右大](http://192.168.9.19:5180/?layout=ordered&preset=mirrored)：同一组合的镜像。
- [三列服务](http://192.168.9.19:5180/?layout=ordered&preset=services)：Docker、下载、远程作为独立三列行。

顶部“设计预览”统一选择布局示例、数据场景、地址分配方和语言；旁边切换主题。无需先编辑，就能查看三种组合的普通浏览态。切换布局示例或语言会刷新当前示例，先完成或取消草稿。

“自定义首页”使用流程：

1. 选择某一行，点击整行／两列／三列／左大右上下／镜像缩略图。
2. 在槽位选择卡片，已经显示的模块会移动或交换，不重复；减少槽位时多出的模块移到后续新行。
3. 改变列宽、行高、上下比例，可用分隔线指针或键盘；最小尺寸优先，不够高会阻止并说明。
4. 拖动可视区域内卡片手柄交换，跨屏或触屏可用选择器；整行上移/下移按钮排序。模块清单开关十类内容，重新开启的模块独占新行。
5. 取消恢复上次应用，撤销恢复上一步；应用在本次浏览器预览中保留，进入设备详情返回仍在，刷新恢复URL示例。恢复推荐也先作用于草稿，可取消或撤销。

空布局仍有添加、恢复、页脚应用/工具入口。六类紧凑摘要为连接、系统、共享、Docker、下载、远程，不开放任意递归嵌套。手机按列优先展开，单列使用标准卡片自身高度，变宽恢复偏好。

当前规格见 [完整R原型规格](../quickstart-home-ordered-prototype-spec.md)；证据在 [M66.10](../../evidence/m66/row-layout/10-interactions/acceptance.md)、[M66.11](../../evidence/m66/row-layout/11-review/acceptance.md)。自动化和自检不代表M66.12用户视觉验收。

```sh
rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/ordered-interaction-review.cjs
rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/ordered-visual-review.cjs
rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/ordered-screenshot-audit.cjs
```

再次复验时给每条命令加同一个新的`QS_DESIGN_EVIDENCE_ROOT`环境变量，保留历史报告，例如`docs/evidence/m66/row-layout/11-review/recheck-YYYYMMDD-HHMM`。先运行交互和主视觉检查，再对主视觉产物运行截图审计；权限专项入口为`ordered-authority-popover-review.cjs`。本轮所有报告单独保存在`11-review/continuation-1/`。

## 历史：M66.7～M66.9 布局方案比较

最新：用户已明确选择R有序自定义布局，G/F保留比较，不再等待方案选择。当前讨论R的一行三列与单侧上下堆叠设计，尚未改变5180实现；下文代表交互及限制保持有效。

公开入口：[首页](http://192.168.9.19:5180/)。刷新旧标签页加载当前构建。三方案入口：

- [R 有序行＋比例卡片（已选，比较小样）](http://192.168.9.19:5180/?layout=layout-lab&variant=rows&stage=compare)：默认网络60/40等高，应用独占一行，设备/系统组合。
- [G 自动等宽网格](http://192.168.9.19:5180/?layout=layout-lab&variant=grid)：列数、卡片密度优先，结构更规整，比例表达较少。
- [F 自由画布](http://192.168.9.19:5180/?layout=layout-lab&variant=free)：位置和尺寸自由度高，需要用户维护空间秩序。

底部方案条切换R/G/F，右上“体验布局调整”打开当前方案的代表控制；`tools=0`仅隐藏评审方案条，不隐藏产品操作入口。选择推荐R仍需用户反馈，不以方向认可代替具体选型。

评审步骤：

1. 先比较普通态首屏和整页。三方案使用同样七个默认模块及合成数据，扩展服务开关统一补齐Docker、下载、远程共十类。
2. R：拖动网络两卡之间的分隔线，或用比例预设；分隔线可用键盘左右键。改变网络行高，两卡仍等高。
3. 调整“内容预览宽度”，查看按最小尺寸拆行，再点“自动宽度”；宽屏恢复原比例和顺序，不改原偏好。
4. G：改变列数与密度，再缩窄容器。F：拖动手柄移动、缩放，恢复示例；窄屏按顺序堆叠，不保留二维坐标外观。
5. 右上切换主题/示例场景；可加`lang=en`比较英文。点击设备仍进入同一合成身份详情。

这一步验证代表交互，尚无完整跨行编辑、全部卡片显隐、布局应用/取消/撤销，也没有F碰撞自动整理或真实偏好存储。布局示例刷新恢复；这些完整交互在M66.9选型后进入M66.10。全部使用Quickstart Vue/CSS、原曲线组件、既有设备身份语义；左侧只是不操作的系统宿主占位，不能编辑或覆盖。

自检证据：[执行状态](../../evidence/m66/row-layout/status.md)、[M66.8视觉](../../evidence/m66/row-layout/08-visual-options/acceptance.md)、[M66.9交互与选型](../../evidence/m66/row-layout/09-selection/acceptance.md)。原型通过不代表用户美感确认或真实设备验收。

```sh
rtk ./scripts/ui-design.sh status
rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/row-layout-visual-review.cjs
rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/row-layout-interaction-review.cjs
```

## 以下为历史设计与运行说明

用户访问入口为 `http://192.168.9.19:5180/`，已在该入口复验实际浏览器加载、三种结构与切换条。`192.168.98.2` 为此前使用的容器地址；两者目前返回同一预览服务owner/PID，评审链接统一使用用户入口。
上一轮默认入口为 [A 紧凑概览＋应用](http://192.168.9.19:5180/?variant=canvas)，对照 [B 右侧工具台](http://192.168.9.19:5180/?variant=sidebar)、[C 底部操作台](http://192.168.9.19:5180/?variant=stage)。历史依据见 [主视觉与操作空间](../quickstart-home-canvas.md)。
2026-10-15 更新：图表独立288～352px，不被连接卡和配置工具撑高。“应用与工具”移到网络区下方，默认四个常用入口、最多六个；八个系统工具在另一页签；软件中心作为安装更新入口。“全部应用”可搜索，常用入口支持选择/排序/取消/应用；应用清单的空、加载、失败、大量状态可切换。Docker/下载/远程详情卡默认收起，可单独开启。B/C 保留作历史对照，未确认最终选型。
本轮证据在 `docs/evidence/m66/compact-applications/`：8组多端主题、7种状态、13个点击目标及交互/采样验证通过。所有应用目录均为合成示例，不代表测试路由器安装状态。
系统左侧菜单保持原样，所有设计仅作用于右侧内容。桌面左边为明确标注的不可操作宿主占位区，不是菜单设计；暂预留200px，不代表真实菜单宽度。A/B 页面工具位于内容区右边，浮动条和弹窗也遵守边界；正式页面不引入这套占位外壳。
本次边界证据为 `docs/evidence/m66/system-boundary/`，实际公开入口通过18组多端主题组合及设备详情/工具导航检查。复验命令：`rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/system-boundary-review.cjs`。
底部悬浮条显示A/B/C；`tools=0`会隐藏该评审条。已打开旧页面时重新加载，构建后预览不会自动替换浏览器已运行的旧JavaScript。
顶部不放五个快捷卡片；原 `NetworkFlow.vue` 大图保留，配置位置与设备摘要独立。
上一轮入口组织证据在 `docs/evidence/m66/contextual-actions/`；此前全宽与边界版本证据分别在 canvas/system-boundary 中，保持历史结果。下文更早的设计可用 `layout=studio` 或旧 variant 保留对照。请刷新旧标签页加载新版设计。

当前可重复验收：

```sh
rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/compact-applications-review.cjs
```

A 在原图下方统一组织常用入口与系统工具，B 保留内容区右侧工具台，C 保留内容区底部操作台作对照。
手机 A 使用模块内入口，B/C 保留操作台作对照。“自定义首页”独立选择设备、系统、磁盘、共享、Docker、下载、远程访问；内容区支持排序和宽度调整，主图是本轮固定锚点。

以下为前一轮首页设计，见 [当时的分析与设计依据](../quickstart-home-redesign.md)。
使用 Quickstart 的 Vue、request 层、原创设备图标与身份呈现函数，布局和视觉重新设计；正式首页入口未引入设计代码。

- [A 均衡概览](http://192.168.98.2:5180/?variant=studio)
- [B 网络监控](http://192.168.98.2:5180/?variant=network&theme=dark)
- [C 设备优先](http://192.168.98.2:5180/?variant=device)

底部切换方案，右上“预览设置”切换数据场景、DHCP权限、主题与语言。
“自定义首页”打开模块编辑器：开关、拖动/上下排序、选择宽度、恢复预设、草稿取消与应用。
选择仅在本页内存中生效，进入设备详情再返回保留布局；刷新恢复预设。
`tools=0` 隐藏底部方案切换器用于截图。

新版可重复验收：

```sh
rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/studio-review.cjs
```

证据在 `docs/evidence/m66/redesign/`。新增 `network-error|storage-error|services-error` 场景验证局部降级。
以下入口与脚本是旧版忠实复用对照，仍可访问，不是最新推荐设计。

当前预览直接使用 `web/src/pages/index/index.vue`、原 App、原卡片/网络/NAS/服务/系统组件和 CSS。
新增摘要位于独立 `web/src/design/`，正式入口不导入它；两个空插槽和共享身份呈现函数不改变正式首页布局。
产品语义来自 [唯一基线](../../lan-device-management-product-architecture.md)，实施与评审见 [M66 计划](../quickstart-home-design-review.md)。

```sh
rtk ./scripts/ui-design.sh start
rtk ./scripts/ui-design.sh status
rtk ./scripts/ui-design.sh logs
rtk ./scripts/ui-design.sh stop
# 前台运行
rtk ./scripts/ui-design.sh run
```

start/run 通过 `/var/cache/build-cache/run.sh` 加载 SSD 环境，先构建独立 Vue 原型，再启动预览。
Vite 缓存与原型输出位于该工作树的 SSD work 目录；正式 `web/dist` 和 `node_modules` 不移动、不覆盖。
修改组件后 stop → start 重新构建设计快照。初次安装依赖先使用 ssd-build-cache 技能的入口执行 npm ci。

使用构建后预览是为避免长时间评审依赖 HMR WebSocket；仍是项目 Vue/CSS 编译结果，不是手写 HTML 仿制。
此前开发服务器曾在连续页面检查中发生动态模块导入失败，记录保留在 `docs/evidence/m66/vue/05-review/`。

访问：

- 当前首页：`http://192.168.98.2:5180/?layout=baseline`
- 推荐位置：`http://192.168.98.2:5180/?layout=below-network`
- 对照位置：`http://192.168.98.2:5180/?layout=above-network`

参数：`scenario=normal|many|empty|loading|error|stale|old|permission|no-speed|disabled|speed-error|unsupported`，
`authority=external|local|unknown`，`theme=light|dark`，`lang=zh-cn|en`，`tools=0` 隐藏评审工具。
单设备深链：`/devicemanagement?layout=below-network&filter=all&device=<合成deviceId>`。
管理页、抽屉与移动详情使用正式组件，由设计专用适配器驱动；正式路由支持留给 M69。

所有数据均为合成示例。资料/策略应用只改变本页内存；重新加载恢复示例。
仅明确列出的读接口和内存写入接口有响应；未知 GET 为 501、未模拟写入为 403，服务端不转发 `/cgi-bin/`。
无需 SSH、LuCI 登录或路由器后台，不安装/重启测试设备。原有家长控制、测速等外部工具入口需在正式环境使用。

服务绑定 `0.0.0.0:5180`，nohup + setsid 持续运行。PID、锁、日志按仓库路径隔离，
只停止命令行归属本仓库 Node 服务（兼容停止旧 Python 服务）的 PID。
端口被其他项目占用时拒绝启动，不停止其进程。`/health` 返回 owner/PID/mode。
本机通过 LAN 地址访问已验证；C 的跨网段访问此前超时，不能将本机成功说成所有网络均可访问。

可重复评审：

```sh
rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/vue-review.cjs 01-preview
rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/vue-review.cjs 03-summary
rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/vue-review.cjs 04-navigation
rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/vue-state-review.cjs
rtk proxy /var/cache/build-cache/run.sh -- env NODE_PATH=/config/playwright-runner/node_modules node docs/product/ui-design/vue-polling-review.cjs
```

证据写入 `docs/evidence/m66/vue/`。`index.html`、`app.js`、`style.css`、`serve.py`、`review.cjs`
是首次 HTML 原型的历史文件，当前服务不使用它们；根目录 M66 截图不能替代新 Vue 原型证据。
