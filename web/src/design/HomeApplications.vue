<template>
  <section v-if="!collapsed" ref="hub" class="home-applications fluid-applications" :class="{'applications-strip':resolved.id==='strip'}" :data-app-form="resolved.id" data-applications-hub>
    <header class="applications-heading">
      <div><StudioGlyph name="grid"/><h2>{{t('应用与工具','Apps & tools')}}</h2></div>
      <div class="applications-actions widget-action-group"><button @click="openBrowser(false)" data-all-apps>{{t('全部','All')}}<small v-if="favorites.length>capacity" class="applications-overflow" data-app-overflow>{{t('还有','More: ')}}{{favorites.length-capacity}}{{t('个','')}}</small><StudioGlyph name="arrow" v-else/></button><WidgetMenu :label="t('应用与工具更多操作','More app and tool actions')" :items="[{id:'favorites',label:t('编辑快捷入口','Edit shortcuts')}]" @select="openBrowser(true)"/></div>
    </header>
      <div v-if="!favorites.length" class="applications-state"><StudioGlyph name="grid"/><span>{{t('把常用应用放在这里','Keep your favorite apps here')}}</span><button @click="openBrowser(true)">{{t('选择应用','Choose apps')}}</button></div>
      <div v-else class="applications-favorites" :style="{gridTemplateColumns:'repeat('+columns+', minmax(0,1fr))'}" :data-app-columns="columns" :data-app-capacity="capacity"><button v-for="app in favorites.slice(0,capacity)" :key="app.id" @click="activate(app)" :title="t(app.zh,app.en)+(entryAvailability(app)==='available'?'':' · '+availabilityText(app))" :data-favorite-app="app.id" :data-availability="entryAvailability(app)"><span class="application-icon" :class="app.tone"><StudioGlyph :name="app.glyph"/><i v-if="app.tool==='firmware'&&systemStore.checkUpdate?.needUpdate" class="launcher-update-dot" :aria-label="t('有可用更新','Update available')"/></span><span><strong>{{t(app.zh,app.en)}}</strong><small v-if="entryAvailability(app)!=='available'">{{availabilityText(app)}}</small></span></button></div>
    <div v-if="fallbackEntries.length" class="applications-fallback" data-applications-fallback><span>{{t('快捷操作','Quick actions')}}</span><button v-for="entry in fallbackEntries" :key="entry.path" @click="navigate(entry.path)" :data-home-entry="entry.path"><StudioGlyph :name="entry.glyph"/>{{t(entry.zh,entry.en)}}<StudioGlyph name="arrow"/></button></div>
  </section>
  <button v-else class="applications-collapsed" @click="openBrowser(false)" data-open-applications><StudioGlyph name="grid"/>{{t('应用与工具','Apps & tools')}}</button>

  <Teleport v-if="browserOpen" to=".canvas-home">
    <div class="applications-backdrop" @click="closeBrowser"></div>
    <section class="applications-browser" role="dialog" aria-modal="true" :aria-label="editing?t('编辑快捷入口','Edit shortcuts'):t('全部应用与工具','All apps and tools')" @keydown.esc.stop="closeBrowser" data-applications-browser :data-shortcut-history="history.length">
      <header><div><span>{{editing?t('首页常用入口','YOUR FAVORITES'):t('应用与工具','APPS & TOOLS')}}</span><h2>{{editing?t('留下常用的，刚刚好','A place for your favorites'):t('打开你的应用','Your applications')}}</h2></div><button class="applications-close" @click="closeBrowser" :aria-label="t('关闭应用面板','Close apps')">×</button></header>
      <div class="applications-browser-body">
        <template v-if="editing"><LauncherFavoriteGrid :ids="draft" :columns="editorColumns" :limit="24" @remove="toggleFavorite" @reorder="commit"/><div class="launcher-editor-toolbar"><button @click="undoFavorite" :disabled="!history.length" data-shortcut-undo>↶ {{t('撤销','Undo')}}</button><button @click="commit(applicationDefaults)" data-shortcut-restore>{{t('恢复默认八项','Restore eight defaults')}}</button></div><h3 class="launcher-library-heading">{{t('添加快捷入口','Add shortcuts')}}<small>{{t('应用目录为合成示例','Synthetic app catalogue')}}</small></h3></template>
        <label class="application-search"><StudioGlyph name="grid"/><input v-model="search" :placeholder="t('搜索应用或系统工具','Search apps or system tools')" :aria-label="t('搜索应用或系统工具','Search apps or system tools')"/></label>
        <div class="browser-category-tabs" role="tablist" :aria-label="t('入口分类','Shortcut categories')"><button role="tab" :aria-selected="browserTab==='tools'" @click="browserTab='tools'">{{t('系统工具','Tools')}}</button><button role="tab" :aria-selected="browserTab==='apps'" @click="browserTab='apps'">{{t('已安装应用','Installed apps')}}<small>{{catalogueState==='ready'?catalogue.filter(a=>a.kind==='app').length:'—'}}</small></button><button role="tab" :aria-selected="browserTab==='builtin'" @click="browserTab='builtin'">{{t('内置功能','Built-in')}}</button></div>
          <div v-if="browserTab==='apps'&&catalogueState!=='ready'" class="applications-state" data-applications-state><span>{{stateText}}</span><button v-if="catalogueState==='error'" @click="provider.retry">{{t('重试','Retry')}}</button></div>
          <div v-else-if="!filteredApps.length" class="applications-state"><span>{{browserTab==='apps'&&catalogueState==='ready'&&!provider.state.apps.length?t('没有已安装的扩展应用，可前往软件中心。','No additional apps installed. Explore the software center.'):t('没有匹配的入口','No matching shortcuts')}}</span></div>
          <div v-else class="application-catalogue"><div v-for="app in filteredApps" :key="app.id"><span class="application-icon" :class="app.tone"><StudioGlyph :name="app.glyph"/></span><div><strong>{{t(app.zh,app.en)}}</strong><small>{{entryAvailability(app)!=='available'?availabilityText(app):t(app.detail,app.detailEn)}} · {{app.kind==='app'?t('已安装 · 示例','Installed · Sample'):app.kind==='tool'?t('系统工具','System tool'):t('内置功能','Built-in')}}</small></div><button v-if="editing" @click="toggleFavorite(app.id)" :disabled="!draft.includes(app.id)&&(draft.length>=24||entryAvailability(app)!=='available')" :aria-pressed="draft.includes(app.id)" :aria-label="t('选择','Select ')+t(app.zh,app.en)" :data-select-app="app.id">{{draft.includes(app.id)?'✓':'+'}}</button><button v-else @click="activate(app)" :aria-label="t('打开','Open ')+t(app.zh,app.en)" :data-open-app="app.id" :data-browser-tool="app.kind==='tool'?app.id:undefined"><StudioGlyph name="arrow"/></button></div></div>
        <p class="application-limit" v-if="editing&&draft.length>=24">{{t('已保存24个，请先移除一个再添加。','24 selected. Remove a shortcut to add another.')}}</p>
        <section v-if="!editing&&unavailableFavorites.length" class="launcher-unavailable-favorites"><h3>{{t('已收藏 · 当前不可用','Saved · Currently unavailable')}}</h3><p>{{t('入口仍保留在首页顺序中，可查看原因或在编辑中移除。','These shortcuts keep their saved positions. View the reason or remove them in the editor.')}}</p><div class="application-catalogue"><div v-for="app in unavailableFavorites" :key="app.id"><span class="application-icon" :class="app.tone"><StudioGlyph :name="app.glyph"/></span><div><strong>{{t(app.zh,app.en)}}</strong><small>{{availabilityText(app)}}</small></div><button @click="activate(app)" :data-unavailable-shortcut="app.id" :aria-label="t('查看原因：','View reason: ')+t(app.zh,app.en)"><StudioGlyph name="arrow"/></button></div></div></section>
        <div v-if="!editing&&!collapsed&&fallbackEntries.length" class="browser-fallback"><h3>{{t('快捷操作','Quick actions')}}</h3><button v-for="entry in fallbackEntries" :key="entry.path" @click="navigate(entry.path)" :data-browser-quick="entry.path"><StudioGlyph :name="entry.glyph"/>{{t(entry.zh,entry.en)}}<StudioGlyph name="arrow"/></button></div>
      </div>
      <footer><template v-if="editing"><button @click="closeBrowser">{{t('取消','Cancel')}}</button><button class="applications-save" @click="saveFavorites">{{t('保存到首页','Save to home')}} · {{draft.length}}/24</button></template><template v-else><button @click="startEditing" data-manage-favorites>{{t('编辑快捷入口','Edit shortcuts')}}</button><button class="software-center" @click="navigate('/cgi-bin/luci/admin/store/pages/store')" data-browser-software-center>{{t('软件中心','Software center')}}<StudioGlyph name="arrow"/></button></template></footer>
    </section>
  </Teleport>
  <LauncherToolAction v-if="activeTool" :app="activeTool" @close="activeTool=null"/>
  <NetworkWidgetDialog v-if="unavailableApp" :title="t('入口暂不可用','Shortcut unavailable')" @close="unavailableApp=null"><div data-shortcut-unavailable><p>{{t(unavailableApp.zh,unavailableApp.en)}} · {{availabilityText(unavailableApp)}}</p><p>{{t('入口保留在原位置，你可以在编辑快捷入口中移除。','The shortcut stays in place. You can remove it in Edit shortcuts.')}}</p></div></NetworkWidgetDialog>
</template>
<script setup lang="ts">
import {computed,nextTick,onMounted,onUnmounted,ref,watch} from 'vue'
import StudioGlyph from './StudioGlyph.vue'
import WidgetMenu from './WidgetMenu.vue'
import {quickEntrances} from './canvasLayout'
import {applicationDefaults,homeApplicationSession,type HomeApplication} from './homeApplications'
import LauncherFavoriteGrid from './LauncherFavoriteGrid.vue'
import {registerLauncherBrowser,requestLauncherBrowser} from './launcherBrowserHost'
import {useLauncherCatalog,entryAvailability} from './launcherCatalog'
import LauncherToolAction from './LauncherToolAction.vue'
import {useNetworkStore,useSystemStore} from '../plugins/store'
import NetworkWidgetDialog from './NetworkWidgetDialog.vue'
import {demo} from './fixtures'
import {resolvePresentation,type WidgetPreference} from './widgetPresentation'
const props=defineProps<{collapsed:boolean;fallbackEntries:Array<typeof quickEntrances[number]>;contained?:boolean;preference?:WidgetPreference;natural?:boolean;network?:any}>()
const emit=defineEmits<{(e:'navigate',path:string):void;(e:'close'):void}>()
const hub=ref<HTMLElement|null>(null),hubWidth=ref(600),hubHeight=ref(240)
const resolved=computed(()=>resolvePresentation('applications',props.preference||{mode:'auto',iconRows:0},{width:hubWidth.value,height:props.natural?100000:hubHeight.value,role:'ordinary',favoriteCount:favorites.value.length,mobile:hubWidth.value<650,natural:props.natural}))
const columns=computed(()=>resolved.value.columns)
const capacity=computed(()=>resolved.value.capacity)
let hubObserver:ResizeObserver|undefined
const english=window.vue_lang==='en',t=(zh:string,en:string)=>english?en:zh
const browserTab=ref('tools'),browserOpen=ref(false),editing=ref(false),search=ref(''),draft=ref<string[]>([]),history=ref<string[][]>([])
const editorColumns=ref(window.innerWidth<650?2:4)
const provider=useLauncherCatalog(),catalogueState=computed(()=>provider.state.status),catalogue=provider.catalogue
const activeTool=ref<HomeApplication|null>(null),unavailableApp=ref<HomeApplication|null>(null),systemStore=useSystemStore()
const favorites=computed(()=>homeApplicationSession.favorites.map(provider.resolve))
const stateText=computed(()=>catalogueState.value==='permission'?t('没有读取应用目录的权限，系统工具仍可使用。','No permission to read apps. System tools remain available.'):catalogueState.value==='error'?t('应用清单暂不可用，系统工具仍可使用。','Apps unavailable. System tools remain available.'):catalogueState.value==='loading'?t('正在读取应用清单…','Loading applications…'):t('还没有安装扩展应用，去软件中心发现更多。','No additional apps installed. Explore the software center.'))
function availabilityText(app:HomeApplication){const status=entryAvailability(app);return status==='uninstalled'?t('应用已卸载','App uninstalled'):status==='permission'?t('无访问权限','No access'):status==='unsupported'?t('固件不支持','Unsupported'):status==='no-entry'?t('暂无可用入口','No verified entry'):t('状态待确认','Status unknown')}
const matches=(zh:string,en:string)=>[zh,en].some(s=>s.toLowerCase().includes(search.value.trim().toLowerCase()))
const filteredApps=computed(()=>catalogue.value.map(a=>provider.resolve(a.id)).filter(a=>a.kind===(browserTab.value==='tools'?'tool':browserTab.value==='builtin'?'builtin':'app')&&matches(a.zh+' '+a.detail,a.en+' '+a.detailEn)))
const unavailableFavorites=computed(()=>favorites.value.filter(a=>a.kind==='app'&&['uninstalled','unknown','permission'].includes(entryAvailability(a))&&matches(a.zh+' '+a.detail,a.en+' '+a.detailEn)))
const networkStore=useNetworkStore()
function activate(app:HomeApplication){const snapshot=props.network||browserNetwork;if(browserOpen.value)closeBrowser();if(app.kind==='tool'){if(snapshot)networkStore.updateNetworkStatus({...snapshot});activeTool.value=app;return}if(entryAvailability(app)!=='available'){unavailableApp.value=app;return}emit('navigate',app.path)}
let opener:HTMLElement|null=null,bodyOverflow='',inerted:HTMLElement[]=[],browserNetwork:Record<string,any>|undefined,unregisterBrowser:(()=>void)|undefined
function startEditing(){editing.value=true;draft.value=[...homeApplicationSession.favorites];history.value=[]}
async function openBrowser(edit:boolean){if(!props.collapsed&&requestLauncherBrowser(edit,props.network))return;if(document.querySelector('.ordered-editing')||document.querySelector('[data-applications-browser]'))return;opener=document.activeElement as HTMLElement;editing.value=edit;search.value='';browserTab.value='tools';draft.value=[...homeApplicationSession.favorites];history.value=[];bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';browserOpen.value=true;await nextTick();const root=document.querySelector('.canvas-home');inerted=Array.from(root?.children||[]).filter((node):node is HTMLElement=>node instanceof HTMLElement&&!node.matches('.applications-browser,.applications-backdrop')&&!node.hasAttribute('inert'));inerted.forEach(node=>node.setAttribute('inert',''));document.querySelector<HTMLButtonElement>('.applications-close')?.focus()}
function releaseModal(){inerted.forEach(node=>node.removeAttribute('inert'));inerted=[];document.body.style.overflow=bodyOverflow}
function closeBrowser(){browserOpen.value=false;releaseModal();draft.value=[];history.value=[];browserNetwork=undefined;const target=opener?.isConnected?opener:document.querySelector<HTMLElement>('[data-applications-hub] [data-widget-more]');target?.focus({preventScroll:true});opener=null;emit('close')}
function saveFavorites(){homeApplicationSession.favorites=[...draft.value];closeBrowser()}
function commit(ids:string[]){const next=[...new Set(ids)].slice(0,24);if(next.join('|')===draft.value.join('|'))return;history.value=[...history.value.slice(-29),[...draft.value]];draft.value=next}
function undoFavorite(){if(history.value.length)draft.value=history.value.pop()!}
function toggleFavorite(id:string){if(draft.value.includes(id))commit(draft.value.filter(v=>v!==id));else if(draft.value.length<24)commit([...draft.value,id])}
function navigate(path:string){if(browserOpen.value)closeBrowser();emit('navigate',path)}
function keyboard(event:KeyboardEvent){if(!browserOpen.value)return;if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeBrowser();return}if(event.key==='Tab'){const controls=Array.from(document.querySelectorAll<HTMLElement>('.applications-browser button:not(:disabled),.applications-browser input'));const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}}
function resizeEditor(){editorColumns.value=window.innerWidth<650?2:4}
function visibility(){if(document.hidden){if(browserOpen.value)closeBrowser();activeTool.value=null;unavailableApp.value=null}}
onMounted(()=>{if(props.collapsed)unregisterBrowser=registerLauncherBrowser((edit,network)=>{browserNetwork=network;void openBrowser(edit)});document.addEventListener('keydown',keyboard,true);document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',resizeEditor);if(hub.value){hubObserver=new ResizeObserver(()=>{const box=hub.value!.getBoundingClientRect();hubWidth.value=box.width;hubHeight.value=box.height});hubObserver.observe(hub.value)}});onUnmounted(()=>{unregisterBrowser?.();hubObserver?.disconnect();document.removeEventListener('keydown',keyboard,true);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',resizeEditor);if(browserOpen.value)releaseModal()})
</script>
<style src="./homeApplications.css" scoped></style>
