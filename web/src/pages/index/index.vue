<template>
 <HomeLayout :config="config.layout.value" :data="model.data" :errors="model.errors" :theme="theme" :favorite-ids="config.launcher.value.favorites" :can-edit="config.layoutEditable.value" :external-busy="config.state.launcher.saving" :persist="saveLayout" @editing="layoutEditing" @visible="previewIds=$event" @navigate="navigate" @device="openDevice" @toggle-theme="toggleTheme">
  <template #status><div v-for="domain in domains" :key="domain" class="home-config-state" :data-config-domain="domain" role="status" v-show="config.state[domain].loading||config.state[domain].error||config.state[domain].snapshot?.state!=='saved'">
   <span>{{statusText(domain)}}</span><button v-if="!config.state[domain].loading&&!config.state[domain].saving" @click="config.read(domain)">{{t('重新读取','Reload')}}</button><button v-if="!editing&&['backup','damaged'].includes(config.state[domain].snapshot?.state||'')" :disabled="config.state[domain].saving" @click="recover(domain)">{{config.state[domain].snapshot?.state==='backup'?t('恢复有效备份','Restore valid backup'):t('保留损坏文件并恢复默认','Keep damaged file and restore defaults')}}</button>
  </div></template>
  <template #widget="slot"><HomeWidget v-bind="slot" :data="model.data" :errors="model.errors" :devices="model.devices.value" :theme="theme" contained @navigate="navigate" @device="openDevice" @retry="model.invalidate(slot.id)"/></template>
  <template #launcher><HomeApplications collapsed :fallback-entries="[]" :network="model.data.network" @navigate="navigate"/></template>
 </HomeLayout>
</template>
<script setup lang="ts">
import {computed,onMounted,onUnmounted,ref} from 'vue'
import {useRouter} from 'vue-router'
import HomeWidget from '/@/home/HomeWidget.vue'
import HomeApplications from '/@/home/HomeApplications.vue'
// Load the shared shell after its views, preserving the accepted override order.
import HomeLayout from '/@/home/HomeLayout.vue'
import {useHomeConfig} from '/@/home/useHomeConfig'
import {useHomeData} from '/@/home/useHomeData'
import {provideLauncher} from '/@/home/launcherContext'
import type {WidgetId} from '/@/home/layout/rowLayout'
import {visibleIds} from '/@/home/layout/orderedLayout'
import {getTheme} from '/@/utils/theme'
import type {ConfigDomain,LayoutConfig} from '/@/home/configContract'
const previewIds=ref<WidgetId[]|null>(null)
const config=useHomeConfig(),launcher=provideLauncher(config),model=useHomeData(computed(()=>previewIds.value||visibleIds(config.layout.value.rows)))
const router=useRouter(),editing=ref(false),theme=ref(getTheme()),domains:ConfigDomain[]=['layout','launcher']
const t=(zh:string,en:string)=>window.vue_lang==='en'?en:zh
function statusText(domain:ConfigDomain){const s=config.state[domain];return (domain==='layout'?t('首页布局：','Homepage: '):t('应用工具：','Apps & tools: '))+(s.loading?t('正在校验路由器配置…','Checking router configuration…'):s.error||({backup:t('原文件异常，临时使用有效备份；请恢复后编辑。','Original file invalid. Showing valid backup; restore before editing.'),damaged:t('配置损坏，临时显示默认内容，未覆盖原文件。','Configuration damaged. Showing defaults without replacing the file.'),future:t('配置来自更新版本，当前页面只读。','Configuration requires a newer version. This page is read only.'),missing:t('配置尚未初始化，请重试。','Configuration not initialized. Retry.')} as Record<string,string>)[s.snapshot?.state||'']||'')}
function recover(domain:ConfigDomain){if(window.confirm(t('将保留损坏文件，恢复此项配置；其他设置不变。确定继续？','Keep the damaged file and restore this setting? Other settings are unchanged.')))void config.recover(domain)}
function layoutEditing(value:boolean){editing.value=value;if(value)config.begin('layout')}
const saveLayout=(value:LayoutConfig)=>config.save('layout',value)
function navigate(path:string){if(editing.value)return;if(path.startsWith('/cgi-bin/'))window.location.assign(path);else void router.push(path)}
function openDevice(id:string){if(!editing.value)void router.push({path:'/devicemanagement',query:{device:id}})}
function toggleTheme(){theme.value=theme.value==='dark'?'light':'dark';document.body.setAttribute('theme',theme.value)}
let observer:MutationObserver|undefined
onMounted(()=>{observer=new MutationObserver(()=>theme.value=getTheme());observer.observe(document.body,{attributes:true,attributeFilter:['theme']})})
onUnmounted(()=>observer?.disconnect())
</script>
<style scoped>
.home-config-state{max-width:1640px;margin:12px auto;padding:10px 14px;border:1px solid var(--c-line);border-radius:8px;color:var(--c-muted);font-size:13px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}.home-config-state button{background:none;border:0;color:var(--c-accent);font:inherit;cursor:pointer}
</style>
