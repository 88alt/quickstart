<template>
  <section v-if="!collapsed" ref="hub" class="home-applications fluid-applications" :class="{'applications-strip':resolved.id==='strip'}" :data-app-form="resolved.id" data-applications-hub>
    <header class="applications-heading">
      <div><StudioGlyph name="grid"/><h2>{{t('应用与工具','Apps & tools')}}</h2></div>
      <div class="applications-actions"><button @click="openBrowser(false)" data-all-apps>{{t('全部','All')}}<small v-if="catalogueState==='ready'&&favorites.length>capacity" class="applications-overflow" data-app-overflow>{{t('还有','More: ')}}{{favorites.length-capacity}}{{t('个','')}}</small><StudioGlyph name="arrow" v-else/></button></div>
    </header>
    <div v-if="tab==='tools'" class="applications-system-tools" data-applications-tools><CanvasTools @navigate="navigate"/></div>
    <template v-else>
      <div v-if="catalogueState!=='ready'" class="applications-state" :class="catalogueState" data-applications-state><StudioGlyph :name="catalogueState==='loading'?'activity':'grid'"/><span>{{stateText}}</span><button v-if="catalogueState==='error'" @click="recovered=true">{{t('重试','Retry')}}</button><button v-if="resolved.id!=='strip'" @click="tab='tools'">{{t('打开系统工具','Open system tools')}}</button></div>
      <div v-else-if="!favorites.length" class="applications-state"><StudioGlyph name="grid"/><span>{{t('把常用应用放在这里','Keep your favorite apps here')}}</span><button @click="openBrowser(true)">{{t('选择应用','Choose apps')}}</button></div>
      <div v-else class="applications-favorites" :style="{gridTemplateColumns:'repeat('+columns+', minmax(0,1fr))'}" :data-app-columns="columns" :data-app-capacity="capacity"><button v-for="app in favorites.slice(0,capacity)" :key="app.id" @click="navigate(app.path)" :title="t(app.zh,app.en)" :data-favorite-app="app.id"><span class="application-icon" :class="app.tone"><StudioGlyph :name="app.glyph"/></span><span><strong>{{t(app.zh,app.en)}}</strong></span></button></div>
    </template>
    <div v-if="fallbackEntries.length" class="applications-fallback" data-applications-fallback><span>{{t('快捷操作','Quick actions')}}</span><button v-for="entry in fallbackEntries" :key="entry.path" @click="navigate(entry.path)" :data-home-entry="entry.path"><StudioGlyph :name="entry.glyph"/>{{t(entry.zh,entry.en)}}<StudioGlyph name="arrow"/></button></div>
  </section>
  <button v-else class="applications-collapsed" @click="openBrowser(false)" data-open-applications><StudioGlyph name="grid"/>{{t('应用与工具','Apps & tools')}}</button>

  <template v-if="browserOpen">
    <div class="applications-backdrop" @click="closeBrowser"></div>
    <section class="applications-browser" role="dialog" aria-modal="true" :aria-label="editing?t('自定义常用应用','Customize favorite apps'):t('全部应用与工具','All apps and tools')" @keydown.esc.stop="closeBrowser" data-applications-browser>
      <header><div><span>{{editing?t('首页常用入口','YOUR FAVORITES'):t('应用与工具','APPS & TOOLS')}}</span><h2>{{editing?t('留下常用的，刚刚好','A place for your favorites'):t('打开你的应用','Your applications')}}</h2></div><button class="applications-close" @click="closeBrowser" :aria-label="t('关闭应用面板','Close apps')">×</button></header>
      <div class="applications-browser-body">
        <template v-if="editing"><p class="applications-hint">{{t('最多选择6个，按选择顺序展示。应用运行信息可在首页模块中单独开启。','Choose up to 6, shown in selection order. Service status cards can be enabled separately.')}}</p><div class="favorite-order" v-if="draft.length"><div v-for="(id,index) in draft" :key="id"><span>{{index+1}}. {{appName(id)}}</span><button :disabled="index===0" @click="moveFavorite(index,-1)" :aria-label="t('上移','Move up ')+appName(id)">↑</button><button :disabled="index===draft.length-1" @click="moveFavorite(index,1)" :aria-label="t('下移','Move down ')+appName(id)">↓</button><button @click="toggleFavorite(id)" :aria-label="t('移除','Remove ')+appName(id)">×</button></div></div></template>
        <label class="application-search"><StudioGlyph name="grid"/><input v-model="search" :placeholder="t('搜索应用或系统工具','Search apps or system tools')" :aria-label="t('搜索应用或系统工具','Search apps or system tools')"/></label>
        <div class="browser-category-tabs" role="tablist" aria-label="应用清单分类"><button role="tab" :aria-selected="browserTab==='apps'" @click="browserTab='apps'">{{t('应用','Apps')}}<small>{{catalogueState==='ready'?catalogue.filter(a=>a.kind==='app').length:'—'}}</small></button><button role="tab" :aria-selected="browserTab==='builtin'" @click="browserTab='builtin'">{{t('内置功能','Built-in')}}</button><button v-if="!editing" role="tab" :aria-selected="browserTab==='tools'" @click="browserTab='tools'">{{t('系统工具','System tools')}}</button></div>
        <template v-if="browserTab==='tools'"><div v-if="filteredTools.length" class="browser-tool-list"><button v-for="tool in filteredTools" :key="tool.path" @click="navigate(tool.path)" :data-browser-tool="tool.path"><StudioGlyph :name="tool.glyph"/>{{t(tool.zh,tool.en)}}<StudioGlyph name="arrow"/></button></div><p v-else class="applications-hint">{{t('没有匹配的工具','No matching tools')}}</p></template>
        <template v-else>
          <div v-if="browserTab==='apps'&&catalogueState!=='ready'" class="applications-state" data-applications-state><span>{{stateText}}</span><button v-if="catalogueState==='error'" @click="recovered=true">{{t('重试','Retry')}}</button></div>
          <div v-else-if="!filteredApps.length" class="applications-state"><span>{{t('没有匹配的应用','No matching apps')}}</span></div>
          <div v-else class="application-catalogue"><div v-for="app in filteredApps" :key="app.id"><span class="application-icon" :class="app.tone"><StudioGlyph :name="app.glyph"/></span><div><strong>{{t(app.zh,app.en)}}</strong><small>{{t(app.detail,app.detailEn)}} · {{app.kind==='app'?t('已安装 · 示例','Installed · Sample'):t('内置功能','Built-in')}}</small></div><button v-if="editing" @click="toggleFavorite(app.id)" :disabled="!draft.includes(app.id)&&draft.length>=6" :aria-pressed="draft.includes(app.id)" :aria-label="t('选择','Select ')+t(app.zh,app.en)" :data-select-app="app.id">{{draft.includes(app.id)?'✓':'+'}}</button><button v-else @click="navigate(app.path)" :aria-label="t('打开','Open ')+t(app.zh,app.en)" :data-open-app="app.id"><StudioGlyph name="arrow"/></button></div></div>
        </template>
        <p class="application-limit" v-if="editing&&draft.length>=6">{{t('已选6个，可先移除或调整顺序。','6 selected. Remove an item or adjust the order.')}}</p>
        <div v-if="!editing&&fallbackEntries.length" class="browser-fallback"><h3>{{t('快捷操作','Quick actions')}}</h3><button v-for="entry in fallbackEntries" :key="entry.path" @click="navigate(entry.path)" :data-browser-quick="entry.path"><StudioGlyph :name="entry.glyph"/>{{t(entry.zh,entry.en)}}<StudioGlyph name="arrow"/></button></div>
      </div>
      <footer><template v-if="editing"><button @click="closeBrowser">{{t('取消','Cancel')}}</button><button class="applications-save" @click="saveFavorites">{{t('应用到首页','Apply to home')}} · {{draft.length}}/6</button></template><template v-else><button @click="editing=true;draft=[...homeApplicationSession.favorites]" data-manage-favorites>{{t('管理常用','Edit favorites')}}</button><button class="software-center" @click="navigate('/applications')" data-browser-software-center>{{t('软件中心','Software center')}}<StudioGlyph name="arrow"/></button></template></footer>
    </section>
  </template>
</template>
<script setup lang="ts">
import {computed,nextTick,onMounted,onUnmounted,ref,watch} from 'vue'
import StudioGlyph from './StudioGlyph.vue'
import CanvasTools from './CanvasTools.vue'
import {configurationTools,quickEntrances} from './canvasLayout'
import {homeApplications,homeApplicationSession,type HomeApplication} from './homeApplications'
import {demo} from './fixtures'
import {resolvePresentation,type WidgetPreference} from './widgetPresentation'
const props=defineProps<{collapsed:boolean;fallbackEntries:Array<typeof quickEntrances[number]>;contained?:boolean;preference?:WidgetPreference}>()
const emit=defineEmits<{(e:'navigate',path:string):void;(e:'close'):void}>()
const hub=ref<HTMLElement|null>(null),hubWidth=ref(600),hubHeight=ref(240)
const resolved=computed(()=>resolvePresentation('applications',props.preference||{mode:'auto',iconRows:0},{width:hubWidth.value,height:hubHeight.value,role:'ordinary',favoriteCount:favorites.value.length,mobile:hubWidth.value<650}))
const columns=computed(()=>resolved.value.columns)
const capacity=computed(()=>resolved.value.capacity)
let hubObserver:ResizeObserver|undefined
const english=window.vue_lang==='en',t=(zh:string,en:string)=>english?en:zh
const tab=ref('favorites'),browserTab=ref('apps'),browserOpen=ref(false),editing=ref(false),search=ref(''),draft=ref<string[]>([]),recovered=ref(false)
const catalogueState=computed(()=>!recovered.value&&demo.scenario==='apps-error'?'error':demo.scenario==='apps-loading'?'loading':demo.scenario==='apps-empty'?'empty':'ready')
const catalogue=computed<HomeApplication[]>(()=>[
  ...homeApplications.filter(a=>a.kind==='builtin'||catalogueState.value==='ready'),
  ...(demo.scenario==='apps-many'?Array.from({length:24},(_,i)=>({id:'example-'+i,zh:'示例应用 '+(i+1),en:'Sample app '+(i+1),detail:'设计示例',detailEn:'Design sample',glyph:'grid',path:'/app-example/'+i,kind:'app' as const,tone:['blue','teal','violet'][i%3]})):[]),
])
const favorites=computed(()=>homeApplicationSession.favorites.map(id=>catalogue.value.find(a=>a.id===id)).filter((a):a is HomeApplication=>Boolean(a)))
const stateText=computed(()=>catalogueState.value==='error'?t('应用清单暂不可用，系统工具仍可使用。','Apps unavailable. System tools remain available.'):catalogueState.value==='loading'?t('正在读取应用清单…','Loading applications…'):t('还没有安装扩展应用，去软件中心发现更多。','No additional apps installed. Explore the software center.'))
const matches=(zh:string,en:string)=>[zh,en].some(s=>s.toLowerCase().includes(search.value.trim().toLowerCase()))
const filteredApps=computed(()=>catalogue.value.filter(a=>a.kind===(browserTab.value==='builtin'?'builtin':'app')&&matches(a.zh+' '+a.detail,a.en+' '+a.detailEn)))
const filteredTools=computed(()=>configurationTools.filter(a=>matches(a.zh,a.en)))
const appName=(id:string)=>{const app=homeApplications.find(a=>a.id===id)||catalogue.value.find(a=>a.id===id);return app?t(app.zh,app.en):id}
let opener:HTMLElement|null=null,bodyOverflow=''
async function openBrowser(edit:boolean){opener=document.activeElement as HTMLElement;editing.value=edit;search.value='';browserTab.value='apps';draft.value=[...homeApplicationSession.favorites];bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';browserOpen.value=true;await nextTick();document.querySelector<HTMLButtonElement>('.applications-close')?.focus()}
function closeBrowser(){browserOpen.value=false;document.body.style.overflow=bodyOverflow;opener?.focus({preventScroll:true});emit('close')}
function saveFavorites(){homeApplicationSession.favorites=[...draft.value];closeBrowser()}
function toggleFavorite(id:string){if(draft.value.includes(id))draft.value=draft.value.filter(v=>v!==id);else if(draft.value.length<6)draft.value.push(id)}
function moveFavorite(index:number,delta:number){const list=[...draft.value];[list[index],list[index+delta]]=[list[index+delta],list[index]];draft.value=list}
function navigate(path:string){if(browserOpen.value)closeBrowser();emit('navigate',path)}
function keyboard(event:KeyboardEvent){if(!browserOpen.value)return;if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeBrowser();return}if(event.key==='Tab'){const controls=Array.from(document.querySelectorAll<HTMLElement>('.applications-browser button:not(:disabled),.applications-browser input'));const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}}
watch(()=>demo.scenario,()=>recovered.value=false)
watch(tab,async value=>{if(value==='tools'&&props.contained){tab.value='favorites';await openBrowser(false);browserTab.value='tools'}})
onMounted(()=>{document.addEventListener('keydown',keyboard,true);if(hub.value){hubObserver=new ResizeObserver(()=>{const box=hub.value!.getBoundingClientRect();hubWidth.value=box.width;hubHeight.value=box.height});hubObserver.observe(hub.value)}});onUnmounted(()=>{hubObserver?.disconnect();document.removeEventListener('keydown',keyboard,true);if(browserOpen.value)document.body.style.overflow=bodyOverflow})
</script>
<style src="./homeApplications.css" scoped></style>
