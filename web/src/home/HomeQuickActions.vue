<template>
  <nav class="home-quick-actions" :aria-label="t('快捷操作','Quick actions')" data-home-quick-actions>
    <QuickActions v-for="card in cards" :key="card.icon" :card="card" role="button" :tabindex="disabled||busy?-1:0" :aria-disabled="disabled||busy" :aria-label="card.title" :data-home-quick="card.icon" @click="activate(card.icon)" @keydown.enter.prevent="activate(card.icon)" @keydown.space.prevent="activate(card.icon)"/>
  </nav>
</template>
<script setup lang="ts">
import {computed,onMounted,onUnmounted,ref} from 'vue'
import QuickActions from '../pages/index/nav/QuickActions.vue'
import request from '../request'
import appUtils from '../utils/app'
const props=defineProps<{disabled:boolean}>()
const emit=defineEmits<{(e:'navigate',path:string):void}>()
const t=(zh:string,en:string)=>window.vue_lang==='en'?en:zh
const parentalInstalled=ref(false),busy=ref(false)
// The installed-app library lists published launchers, not every installed
// package. Retain the original one-time package check for the OAF shortcut.
let alive=true
onMounted(async()=>{try{const r=await request.App.Check.POST({name:'luci-app-oaf'});if(alive)parentalInstalled.value=!r?.data?.error&&r?.data?.result?.status==='installed'}catch{}})
onUnmounted(()=>{alive=false})
const cards=computed(()=>[
 {icon:'navigation' as const,color:'purple' as const,title:t('网络向导','Network setup'),subtitle:t('网络配置引导','Network configuration guide'),tag:t('智能配置','Guided setup')},
 {icon:'topology' as const,color:'blue' as const,title:t('局域网设备管理','LAN device management'),subtitle:t('管理网络中的所有设备','Manage devices on your network')},
 {icon:'speed' as const,color:'skyblue' as const,title:t('网络测速','Speed test'),subtitle:t('检测网络速度','Test network speed')},
 ...(parentalInstalled.value?[{icon:'baby' as const,color:'pink' as const,title:t('家长控制','Parental controls'),subtitle:t('儿童上网保护','Protect children online')}]:[]),
 {icon:'appStore' as const,color:'orange' as const,title:t('应用商店','App store'),subtitle:t('百款应用，自由选择','Discover more applications')},
])
async function activate(icon:string){
 if(props.disabled||busy.value)return
 if(icon==='navigation'){emit('navigate','/network');return}
 if(icon==='topology'){emit('navigate','/devicemanagement');return}
 if(icon==='appStore'){emit('navigate','/cgi-bin/luci/admin/store/pages/store');return}
 busy.value=true
 try{
  const ready=icon==='speed'?await appUtils.checkAndInstallApp('app-meta-fastnet',t('FastNet','FastNet')):await appUtils.checkAndInstallApp('luci-app-oaf',t('应用过滤','App filtering'))
  if(ready&&alive&&!props.disabled)emit('navigate',icon==='speed'?'/cgi-bin/luci/admin/services/fastnet':'/cgi-bin/luci/admin/services/appfilter')
 }finally{busy.value=false}
}
</script>
<style scoped>
.home-quick-actions{display:flex;flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;gap:16px;width:100%;padding-bottom:10px;-webkit-overflow-scrolling:touch;scrollbar-gutter:stable;scrollbar-width:thin;scrollbar-color:#0006 transparent}
.home-quick-actions>.feature-card{flex:0 0 auto}
/* The old mobile rules hardcode light colors. Adapt this restored top only. */
.home-quick-actions>.feature-card{border-color:var(--c-line)}
.home-quick-actions :deep(.feature-card .content .title){color:var(--c-text)!important}
.home-quick-actions :deep(.feature-card .content .subtitle){color:var(--c-muted)!important}
.home-quick-actions>[aria-disabled=true]{cursor:default;opacity:.5}
.home-quick-actions>[aria-disabled=true]:hover{transform:none;box-shadow:none}
.home-quick-actions::-webkit-scrollbar{height:8px}.home-quick-actions::-webkit-scrollbar-thumb{border-radius:4px;background:#0006}
@media(max-width:768px){.home-quick-actions{scrollbar-width:none}.home-quick-actions::-webkit-scrollbar{display:none}}
</style>
