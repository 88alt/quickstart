# 安装后限速准备入口

任务树：保留B已装但未启用NetPolicy的状态 → 读取实际selected/provider/capability → 建立禁止重复安装的红灯 → 修正共用能力与设备/设置引导 → 新版本runtime/包 → B重新验收。

验收标准：原eQoS选择与所有规则不改；不启动引擎；已安装NetPolicy不再提供重复安装动作；现有执行方式可用时保持原能力；未安装时保留安装流程；引导用户进入原设置预览后再决定切换；真实B保护断言通过，包/资源/进程匹配新冻结版本。每个候选最多三轮优化；本子任务优化1开始。

原始证据 `../b-installed-0162-provider-guard-2/`：selected=eqos，eqos未装，quickstart-native已装但engine_unavailable，能力却给install quickstart-netpolicy，实际红灯。guard-1使用了错误provider ID，已保留并在guard-2修正夹具，不当作产品失败原因。假设按证据排序：选中执行方能力与固定安装目标不一致（源码已证实）；进程缓存过期（新登录仍重现，不支持）；安装包漏文件（包与设备原始字节匹配，排除）。

修正边界是准备状态/动作，不扩展数据面、策略迁移或服务控制。不得通过自动选择native或实际开启引擎使测试过关。

优化1：共用能力在原执行方不可用、native已装时提供独立selected_provider_unavailable诊断与retry，不再install/enable另一执行方。原执行方可用保持available；原生执行方保留其自身诊断；没有安装包仍可安装。设备详情与LAN设置说明和安装按钮共用该事实，中英文同步。没有新增布局、表单或另一执行方式编辑器。

本地make verify-lan-device-business通过：Go全量、105项前端、vue-tsc、部署契约和局域网确定性门。最初新增Go测试把CapabilityState写成string导致编译失败，修正测试类型后通过；不是服务端执行失败。gofmt只读差异检查为空。B红灯在修正前建立，新版本实机复验尚未执行。
