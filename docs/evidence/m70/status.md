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
