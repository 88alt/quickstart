# 手机scroll诊断

起点1388e6a未修改产品代码。单独首次真实Web往返的baseline偶尔通过1020→1020，说明不能只验证一次干净路径。组合旧路径后existing-loop捕获到1028，但新封装未初始化checks数组导致报告push中断，保留此封装失败，不把它当成业务断言。

修正封装并压缩到旧helper首次往返+稳定后断言，minimized明确失败：保存/离开1020，返回即时/网络稳定/再等500ms均1028；命令为run.sh env QS_ACCEPT_SCROLL_TRACE=1 QS_SCROLL_TRACE_EXISTING=1 QS_PIN_RETURN_ONLY=1（以及对应1388e6a MANIFEST/root会话保护）python3 scripts/ops/home-current-acceptance.py。它驱动真实首页恢复代码和目标导航，不是源码字符串检查。

时间线显示restore确实调用scrollTo(1020)，随后focus(preventScroll:true)也仍1020；但聚焦时图标处在临时排版，文档坐标约2127，下一帧变为约1429，期间没有第二个scrollTo却变成1028。body margin始终0，不是浏览器默认8px margin。

排序假设：1）恢复早于响应式/自然行排版收敛，等待目标几何稳定应消失；2）浏览器锚定在临时几何上，单独禁用overflow-anchor应消失；3）焦点触发补滚，推迟焦点应消失。已向用户说明后逐项验证。

probe-anchor唯一改变是在测试浏览器中禁用CSS锚定，旧恢复逻辑和容差不变：同一minimized用例即时/稳定/500ms均1020，通过。确认锚定参与偏移，永久禁用锚定不作为产品方案。

第一候选：有界恢复owner暂时关闭原生scrollRestoration和CSS锚定，等目标位置/尺寸连续三帧相同且文档可容纳原scroll，再恢复位置/焦点；成功/超时/卸载还原原inline值及priority、原历史模式。用户pointer/touch/wheel/keyboard操作立即取消并清掉待恢复记忆，不与用户争抢滚动。仅在本次有历史记忆时采样，最多10秒，不持久化测量或增加业务读取。
