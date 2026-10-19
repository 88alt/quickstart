import {nextTick,onMounted,onUnmounted,watch} from 'vue'
import {useRoute} from 'vue-router'
import {homeEntryMemory} from './launcherRouteState'

// A homepage launch keeps its existing history entry; it never creates a panel URL.
export function useHomeEntryReturn(enabled:boolean,ready:()=>boolean){
 const route=useRoute();let observer:MutationObserver|undefined,timer:number|undefined,restoring=false,active=false,previousRestoration:ScrollRestoration|undefined
 const stop=()=>{active=false;observer?.disconnect();observer=undefined;window.clearTimeout(timer);timer=undefined;if(previousRestoration!==undefined){window.history.scrollRestoration=previousRestoration;previousRestoration=undefined}}
 async function restore(){
  if(!active||restoring||!ready()||route.path!=='/'||route.query.panel)return
  const memory=homeEntryMemory(window.history.state?.qsHomeEntry);if(!memory){stop();return}
  const selector='[data-favorite-app="'+CSS.escape(memory.id)+'"]'
  if(!document.querySelector(selector))return
  restoring=true;await nextTick();await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())))
  const target=document.querySelector<HTMLElement>(selector)
  if(active&&target&&!route.query.panel){window.scrollTo({top:memory.scroll,behavior:'auto'});target.focus({preventScroll:true});const state={...window.history.state};delete state.qsHomeEntry;window.history.replaceState(state,'');stop()}
  restoring=false
 }
 function start(){if(!enabled)return;stop();const memory=homeEntryMemory(window.history.state?.qsHomeEntry);if(!memory)return;active=true;previousRestoration=memory.restoration||window.history.scrollRestoration;window.history.scrollRestoration='manual';observer=new MutationObserver(()=>{void restore()});observer.observe(document.querySelector('.canvas-home')||document.body,{childList:true,subtree:true});timer=window.setTimeout(stop,10000);void restore()}
 function remember(id:string){if(!enabled)return;const memory=homeEntryMemory({v:1,id,scroll:window.scrollY,restoration:window.history.scrollRestoration});if(memory){window.history.replaceState({...window.history.state,qsHomeEntry:memory},'');window.history.scrollRestoration='manual'}}
 watch(()=>[ready(),route.fullPath],()=>{if(enabled)void restore()},{flush:'post'})
 onMounted(()=>{if(enabled){start();window.addEventListener('pageshow',start)}})
 onUnmounted(()=>{active=false;stop();window.removeEventListener('pageshow',start)})
 return {remember}
}
