<template>
  <div class="layout-widget" ref="element" :class="['widget-'+id,{narrow:width<450,medium:width<650,short:height<310}]" :data-layout-card="id">
    <template v-if="id==='traffic'"><NetworkFlow :key="theme"/><button class="layout-speed" @click="$emit('navigate','/networkSpeedTest')" :aria-label="t('网络测速','Network speed test')"><StudioGlyph name="activity"/>{{t('测速','Test')}}</button><span v-if="errors.network" class="layout-data-notice">{{t('流量采样暂不可用','Traffic sampling unavailable')}}</span></template>
    <section v-else-if="id==='connection'" class="layout-connection">
      <header><h2><StudioGlyph name="network"/>{{t('网络连接','Connection')}}</h2><button @click="$emit('navigate','/network')">{{t('网络设置','Settings')}}<StudioGlyph name="arrow"/></button></header>
      <div class="layout-health"><span :class="{ready}"><StudioGlyph :name="ready?'check':'network'"/></span><div><strong>{{ready?t('连接正常','Connected'):errors.network?t('状态待确认','Unconfirmed'):t('读取连接中','Reading connection')}}</strong><small>{{data.network?.defaultInterface||'—'}} · {{data.network?.proto==='static'?t('静态网络','Static network'):data.network?.proto||'—'}}</small></div><span class="layout-health-caption" v-if="width>430">{{ready?'ONLINE':'—'}}</span></div>
      <dl><div><dt>IPv4</dt><dd>{{data.network?.ipv4addr?(addresses?data.network.ipv4addr:'••••••••••'):'—'}}<button @click="addresses=!addresses" :aria-label="t('显示或隐藏地址','Show or hide address')">{{addresses?'◉':'◎'}}</button></dd></div><div><dt>{{t('网关','Gateway')}}</dt><dd>{{data.network?.gateway||'—'}}</dd></div><div><dt>DNS</dt><dd>{{data.network?.dnsList?.join(' · ')||'—'}}</dd></div><div><dt>IPv6</dt><dd>{{data.network?.ipv6addr||t('未观察到地址','No address observed')}}</dd></div></dl>
      <footer><div><span v-for="port in data.ports?.ports||[]" :key="port.name"><i :class="{up:port.linkState==='UP'}"></i>{{port.name}}</span></div><button @click="details=true">{{t('接口详情','Interfaces')}}<StudioGlyph name="arrow"/></button></footer>
      <section v-if="details" class="layout-inline-details" role="dialog" :aria-label="t('接口详情','Interfaces')" @keydown.esc.stop="details=false"><header><h2>{{t('接口详情','Interfaces')}}</h2><button @click="details=false" :aria-label="t('关闭详情','Close details')">×</button></header><p>{{t('DNS来源','DNS source')}} · {{data.network?.dnsProto||'—'}}</p><p v-for="port in data.ports?.ports||[]" :key="port.name">{{port.name}} · {{port.interfaceNames.join(' / ')}} · {{port.linkState==='UP'?t('已连接','Connected'):t('未连接','Disconnected')}}</p></section>
    </section>
    <HomeApplications v-else-if="id==='applications'" :collapsed="false" :fallback-entries="[]" :contained="contained" @navigate="$emit('navigate',$event)"/>
    <CanvasModule v-else :item="moduleItem" :data="data" :errors="errors" :devices="devices" :summary-limit="summaryLimit" :disk-limit="contained?4:undefined" contextual-actions @navigate="$emit('navigate',$event)" @device="$emit('device',$event)" @retry="$emit('retry')"/>
  </div>
</template>
<script setup lang="ts">
import {computed,onMounted,onUnmounted,ref} from 'vue'
import type {DeviceListItem} from '../pages/device/deviceInventory'
import type {CanvasModuleKey} from './canvasLayout'
import type {WidgetId} from './rowLayout'
import NetworkFlow from '../pages/index/network/NetworkFlow.vue'
import CanvasModule from './CanvasModule.vue'
import HomeApplications from './HomeApplications.vue'
import StudioGlyph from './StudioGlyph.vue'
const props=defineProps<{id:WidgetId;data:Record<string,any>;errors:Record<string,string>;devices:DeviceListItem[];theme:string;contained?:boolean}>()
defineEmits<{(e:'navigate',path:string):void;(e:'device',id:string):void;(e:'retry'):void}>()
const english=window.vue_lang==='en',t=(zh:string,en:string)=>english?en:zh
const element=ref<HTMLElement|null>(null),width=ref(600),height=ref(320),addresses=ref(false),details=ref(false)
const ready=computed(()=>Boolean(props.data.network?.internetConnected)&&!props.errors.network)
const summaryLimit=computed(()=>{const columns=width.value>=650?3:width.value>=450?2:1;const rows=height.value<330?1:columns===1?(height.value>=370?3:2):2;return Math.min(6,rows*columns)})
const moduleItem=computed(()=>({id:props.id as CanvasModuleKey,enabled:true,span:width.value>=500?8:4}))
let observer:ResizeObserver|undefined
onMounted(()=>{observer=new ResizeObserver(entries=>{width.value=entries[0].contentRect.width;height.value=entries[0].contentRect.height});if(element.value)observer.observe(element.value)})
onUnmounted(()=>observer?.disconnect())
</script>
<style src="./layoutPreviewCard.css" scoped></style>
