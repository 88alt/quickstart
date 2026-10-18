# M70 首页包与安装

任务树：冻结业务提交 → 三架构 runtime → App Hub 配方/资源 → 独立 feed 工作树 → 可审计 SDK 测试输入 → x64/ARM64 IPK+APK → fetch/元数据/ELF/Web → B IPK 安装/配置保留/真实 root UI 复验。

验收标准：各架构 build.status 成功、六包准确、SHA256SUMS 与输入补丁/feed/SDK 锁一致；包内二进制和 Web 与冻结提交一致；B 的 opkg 版本/实际文件/进程/API/UI 一致；首页配置与网络配置保持。APK 无适用固件时只记录构建，不冒充实装。24小时观察仍延期，ARM64 数据面问题不由打包通过代替。

冻结源码 `6fcc4bae1a00a0313b77cd9247d4bad326097567`，版本 `0.16.0-test20261018`。runtime 三架构由干净源码 make release 产生；持久归档 `bin/releases/6fcc4ba/`（忽略目录），SHA256 `a22c1f7b1d3d1ee816a397bb666bd2a7cfb33ba839f21ec428551ba90b449dc6`。资源版本 `0.16.0-test20261018-release-bd9944bb18ad`，manifest 含 CSS/vendor。

## 测试输入与隔离

未获授权推送 Git、上传 Release 或触发 Action，因此未执行。采用构建器正式指南第3.3节允许的未发布测试输入：固定 canonical feed 基点 + 入档的 FEED_PATCHES + 精确 hash 的 runtime 下载缓存预置；不能称为已经公开发布的 canonical 包。

构建器根目录有其他 LinkEase 任务的未提交修改，远端 current 也在服务该任务。未覆盖这些内容：单独工作树分支 `quickstart-home-016`，构建器提交 `17d5fa0b0cd6d07d2b8b22067910180d03400307`，单独 deployment `/builders/projects/quickstart-home-builder`、runtime `runtime-17d5fa0b0cd6`。原 `/builders/projects/openwrt-sdk-builder/current` 保持原指向。

profiles：quickstart-home-x64 / quickstart-home-arm64。feed 基点 nas `bee9750470cf903ce5d9f3c563dc1ea2ac56929e`、nas_luci `a370c0b3a56f9175192b449830c9116d46fada16`，第三方 istore 由最终 feed lock 记录。nas 已含 NetPolicy ARM64 配方，不重复旧补丁。NetPolicy 仍使用 canonical 0.2.0-test20260928 的分架构 runtime/hash，不声称本轮修改或验证其数据面。

补丁生成后在真实目录副本反向 dry-run 通过；最初用符号链接搭建验证目录被 patch 的路径保护拒绝，属于工具夹具问题，没有执行写入。make test（10项）、ops-preflight、ops-init/release/deploy/verify 通过。预置 runtime 用硬链接防覆盖既有共享文件，前后 SHA256 均匹配配方。

x64 Build ID `quickstart-home-x64-20261018-0750-6fcc4ba` 已启动；尚未据此宣布构建或安装成功。

## 缓存与 fetch 范围修正

首次 ARM64 `0752` SDK下载约28KiB/s，显式停止本任务唯一匹配 BUILD_ID 和 output mount 的容器；原始失败状态/日志保留。复用旧构建器现有只读归档，ARM IPK SHA `7ac9801311275b63aea3cba74e68c27fc74ced2a50a0c8f4b0d9adfd8ae768ea`、ARM APK `ef6739acc91c346bd1b6b1bea8a6a950120892136cd0b9b849428203d6d6fa94` 与固定 platform 相同，x64 APK `4abb32a6dd05f80c24fc1a487a94b1f5f0a5d4cd560ff3dd8c1bf77793a2d5dc`。仅在新实例缓存创建硬链接，没有覆盖或删除原缓存；x64 IPK首次下载自行完成。

`0750/0754` 初始 base 克隆仍慢；新增本实例独立 bare object seed，原 SDK checkout 只读，不依赖其工作树当发布输入。确认标签 peeled commit 21.02.3 `42a15ca378e1bc52f125f894d748c31ce3c52903`、24.10.8 `0b795ce79e23b553aa184080c390f9ce92a2b6d4`；APK SDK实际配置固定 commit `d266501ad6188cce279a487b1ce61f4f327cd496`，不伪造25.12.2 Git标签。seed 无 alternates、fsck通过。

`0759` 揭示镜像克隆后的 wildcard fetch 导致 SDK 的 git pull 拉取全部上游分支（812459 objects）。构建器 `e9325f491a8989d18d038eaad7645c157dd9e74b` 将 tag/branch 的 refspec 限定为请求项并禁用自动额外 tags；新增真实 Git 临时仓库 pull 测试，11项通过。再次 preflight/release/deploy/verify 通过。上述慢任务按精确归属停止、保留失败证据；没有把中止当编译通过，也没有改FEED_REFRESH=always或改canonical origin。

最终启动 IDs：x64 `quickstart-home-x64-20261018-0803-6fcc4ba`，ARM64 `quickstart-home-arm64-20261018-0803-6fcc4ba`。独立 runtime `runtime-e9325f491a89`，输入补丁 SHA256 `294833706e0a65ab03d8adbaa5a060757e231f7bf9668159c0d9e2ed92adc104`。配方本地提交 nas `70405b1`、nas_luci `26f688d`、App Hub `bba2b39`，均未推送。

B普通 opkg update 已完成、所有源签名通过，日志在 `/root/quickstart-package-candidates/home-016-6fcc4ba/opkg-update.log`；smartmontools-drivedb 7.5-r1 可用，无需删依赖或强制依赖。B正式包安装仍等待本轮产物核验。

## 目录补漏后的最终版本

6fcc4ba 的0.16.0归档已经进入不可覆盖的测试下载缓存，后续目录身份异常补漏不能复用该文件名/hash。353533f 的同名本地归档仅保留为中间构建，未覆盖服务器缓存。最终候选升为 `0.16.1-test20261018`，重新生成完整runtime/资源版本/配方/SDK输入；旧0.16.0与慢构建仅为历史证据，不是最终安装候选。

最终业务源码 `f2c7434e0769c273aa2077ed947894cc93692793`，runtime归档 SHA256 `6e4a111175ea3375e0edf962cdba44464d1ab0fc0c2dee32d60cec8cfea678b1`，资源版本 `0.16.1-test20261018-release-2332b07136c2`。已持久保存 `bin/releases/f2c7434/`，新增版本独立预置缓存，没有覆盖0.16.0。B完整候选 `b-candidate-f2c7434-1` 八项真实业务/主题断言通过，文件和进程匹配，API/控制台/pageerror零、配置恢复、会话销毁。最终源码 make test、104项前端、vue-tsc、make test-ops、make verify-lan-device-business 均通过；homeconfig/app 定向 race 通过；本地完整正式页面回归 `formal-f2c7434-final` 通过。

## 包内容发现的问题与修正候选2

`quickstart-home-arm64-0161-20261018-1` 的IPK已生成，但实际解包发现SDK再次strip预编译ELF：Quickstart预期93f3178c…而包内ef08226e…，NetPolicy manifest预期7fa35c1c…而包内80e0b2b3…。未安装这些包。配方现在RSTRIP=:保留runtime原始字节，两后端与LuCI包revision同步升2，检查脚本继续要求完整hash一致，未放宽断言。App Hub包契约新增原始payload和八条首页备份路径校验，2项通过；资源cache key旧版本相等假设更新为当前版本+内容hash格式，不删版本/三个资源键断言。

同次ARM APK在lucihttp构建缺lua.h，原因是25.12的Lua已在官方packages feed，原profile只含base/luci。仅本次profiles显式启用各SDK默认packages固定commit：IPK21 `78bcd00c13587571b5c79ed2fc3363aa674aaef7`、IPK24 `23abaa6f3b0fdfd76b570031107e5718476ff0c8`、APK25 `268d92d3d46147efe1e81892e3a618f8bbd4806b`。从官方openwrt/packages镜像读取这些Git对象到本实例cache，checkout仍使用SDK默认canonical origin，fsck通过，无Git push。iStore依赖固定为此前成功canonical刷新得到的a97ace34f2da358a015b094d326bba2697697f2e，避免移动main分支和瞬时TLS失败改变输入。

APK rooted feed种子落点修正为base_root，缺固定对象时先读取object cache再访问origin；真实Git测试覆盖root链接和缺pin补齐。本实例错误的旧种子移动到私有work/seed-diagnostics目录保留，未删除共享SDK/cache。构建器13项测试、preflight/release/deploy/verify通过；新runtime `runtime-138538c8fab5`。原构建器current仍为runtime-linkease-176-source-date-fix-20260930，未修改其他任务工作树。输入patch采用固定canonical基点的零上下文生成并在完整目录副本反向dry-run通过，避免patch正文上下文被Git源码空白lint误判。

修正候选2 IDs：`quickstart-home-x64-0161-20261018-2`、`quickstart-home-arm64-0161-20261018-2`；正在构建。前一个构建的失败/中止日志与状态保留，不算最终通过。
