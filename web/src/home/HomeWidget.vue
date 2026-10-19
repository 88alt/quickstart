<template>
  <div class="layout-widget" ref="element" :inert="editing" :class="['widget-'+id,{narrow:width<450,medium:width<650,short:!natural&&height<310}]" :data-layout-card="id" :data-natural-card="natural||undefined" :data-presentation="resolved.id" :data-chart-stretch="id==='traffic'&&chartStretch||undefined">
    <template v-if="id==='traffic'"><NetworkFlow v-if="nativeVisible" :key="theme"/><div class="traffic-header-actions widget-action-group"><WidgetPrimaryAction icon="activity" class="layout-speed" @click="speedTest" :aria-label="t('网络测速','Network speed test')">{{t('测速','Test')}}</WidgetPrimaryAction></div><span v-if="errors.traffic" class="layout-data-notice">{{t('流量采样暂不可用','Traffic sampling unavailable')}}</span></template>
    <NetworkConnectionCard v-else-if="id==='connection'" :data="data.network" :error="errors.network" :summary="resolved.id==='summary'" @navigate="$emit('navigate',$event)" @retry="$emit('retry')"/>
    <NetworkInterfaceCard :legacy-summary="resolved.legacy" v-else-if="id==='networkInterface'" :data="data.ports" :error="errors.ports" :summary="resolved.id==='summary'" @navigate="$emit('navigate',$event)" @retry="$emit('retry')"/>
    <HomeApplications v-else-if="id==='applications'" :collapsed="false" :fallback-entries="[]" :contained="contained" :preference="preference" :natural="natural" :network="data.network" @navigate="$emit('navigate',$event)"/>
    <BusinessCard v-else-if="['storage','sharing','docker','downloads','remote','system'].includes(id)" :id="id" :data="data" :errors="errors" :summary="resolved.id==='summary'" @retry="$emit('retry')"/>
    <DeviceWidget v-else :data="data" :errors="errors" :devices="devices" :summary="resolved.id==='summary'" :summary-limit="id==='devices'?resolved.capacity:undefined" :disk-limit="contained?4:undefined" contextual-actions @navigate="$emit('navigate',$event)" @device="$emit('device',$event)" @retry="$emit('retry')"/>
  </div>
</template>
<script setup lang="ts">
import WidgetPrimaryAction from './WidgetPrimaryAction.vue'
import {computed,onMounted,onUnmounted,provide,ref} from 'vue'
import type {DeviceListItem} from '../pages/device/deviceInventory'
import type {WidgetId} from './layout/rowLayout'
import NetworkFlow from '../pages/index/network/NetworkFlow.vue'
import DeviceWidget from './DeviceWidget.vue'
import appUtils from '../utils/app'
import {widgetContext} from './widgetContext'
import HomeApplications from './HomeApplications.vue'
import NetworkConnectionCard from './NetworkConnectionCard.vue'
import NetworkInterfaceCard from './NetworkInterfaceCard.vue'
import BusinessCard from './BusinessCard.vue'
import {resolvePresentation,type WidgetPreference} from './layout/widgetPresentation'
const props=defineProps<{id:WidgetId;data:Record<string,any>;errors:Record<string,string>;devices:DeviceListItem[];theme:string;contained?:boolean;preference?:WidgetPreference;natural?:boolean;role?:'ordinary'|'stacked';chartStretch?:boolean;editing?:boolean}>()
provide(widgetContext,{data:props.data,bounded:()=>true,details:()=>{},invalidate:()=>emit('retry')})
async function speedTest(){if(await appUtils.checkAndInstallApp('app-meta-fastnet',t('FastNet','FastNet')))window.location.assign('/cgi-bin/luci/admin/services/fastnet')}
const emit=defineEmits<{(e:'navigate',path:string):void;(e:'device',id:string):void;(e:'retry'):void}>()
const english=window.vue_lang==='en',t=(zh:string,en:string)=>english?en:zh
const element=ref<HTMLElement|null>(null),width=ref(600),height=ref(320)
const resolved=computed(()=>resolvePresentation(props.id,props.preference||{mode:'auto',iconRows:0},{width:width.value,height:props.natural?100000:height.value,role:props.role||'ordinary',favoriteCount:4,mobile:width.value<650,natural:props.natural}))
// Design container owns visibility. The reused native chart has delayed setup;
// unmounting while hidden also prevents a not-yet-started initial sample.
const nativeVisible=ref(!document.hidden),visibility=()=>nativeVisible.value=!document.hidden
let observer:ResizeObserver|undefined
onMounted(()=>{if(props.id==='traffic')document.addEventListener('visibilitychange',visibility);observer=new ResizeObserver(entries=>{width.value=entries[0].contentRect.width;height.value=entries[0].contentRect.height});if(element.value)observer.observe(element.value)})
onUnmounted(()=>{observer?.disconnect();document.removeEventListener('visibilitychange',visibility)})
</script>
<style src="./layoutPreviewCard.css" scoped></style>
