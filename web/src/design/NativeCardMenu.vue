<template><WidgetMenu v-if="scope?.preview&&!scope.compact" :label="english?'More widget actions':'更多组件操作'" :items="items" @select="select" data-native-card-menu/></template>
<script setup lang="ts">
import {computed,inject,nextTick,onMounted,onUnmounted,ref} from 'vue'
import {nativePreviewScope} from './nativePreviewScope'
import WidgetMenu from './WidgetMenu.vue'
const scope=inject(nativePreviewScope,undefined),english=window.vue_lang==='en',anchors=ref<HTMLAnchorElement[]>([])
const items=computed(()=>[{id:'complete',label:english?'Complete information':'完整信息'},...anchors.value.map((a,i)=>({id:'original-'+i,label:(a.textContent||'').trim()}))])
function select(id:string){if(id==='complete')scope?.details();else anchors.value[Number(id.slice(9))]?.click()}
let observer:MutationObserver|undefined
onMounted(async()=>{if(!scope?.preview||scope.compact)return;await nextTick();const surface=scope.surface(),menu=surface?.querySelector<HTMLElement>('.reusable-card>.card-header .dropdown-menu');if(!menu||scope.id==='system')return;const read=()=>anchors.value=Array.from(menu.querySelectorAll<HTMLAnchorElement>('a')).filter(a=>(a.textContent||'').trim());read();observer=new MutationObserver(read);observer.observe(menu,{childList:true,subtree:true,characterData:true})})
onUnmounted(()=>observer?.disconnect())
</script>
