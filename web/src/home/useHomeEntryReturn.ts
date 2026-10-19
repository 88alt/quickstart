import {nextTick,onMounted,onUnmounted,watch} from 'vue'
import {useRoute} from 'vue-router'
import {homeEntryMemory} from './launcherRouteState'

// A homepage launch keeps its existing history entry; it never creates a panel URL.
export function useHomeEntryReturn(enabled:boolean,ready:()=>boolean){
 const route=useRoute();let observer:MutationObserver|undefined,timer:number|undefined,restoring=false,active=false
 const stop=()=>{active=false;observer?.disconnect();observer=undefined;window.clearTimeout(timer);timer=undefined}
 async function restore(){
  if(!active||restoring||!ready()||route.path!=='/'||route.query.panel)return
  const memory=homeEntryMemory(window.history.state?.qsHomeEntry);if(!memory){stop();return}
  const selector='[data-favorite-app="'+CSS.escape(memory.id)+'"]'
  if(!document.querySelector(selector))return
  restoring=true;await nextTick();await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()))
  const target=document.querySelector<HTMLElement>(selector)
  if(active&&target&&!route.query.panel){target.focus({preventScroll:true});window.scrollTo({top:memory.scroll,behavior:'auto'});const state={...window.history.state};delete state.qsHomeEntry;window.history.replaceState(state,'');stop()}
  restoring=false
 }
 function start(){if(!enabled)return;stop();if(!homeEntryMemory(window.history.state?.qsHomeEntry))return;active=true;observer=new MutationObserver(()=>{void restore()});observer.observe(document.querySelector('.canvas-home')||document.body,{childList:true,subtree:true});timer=window.setTimeout(stop,10000);void restore()}
 function remember(id:string){if(!enabled)return;const memory=homeEntryMemory({v:1,id,scroll:window.scrollY});if(memory)window.history.replaceState({...window.history.state,qsHomeEntry:memory},'')}
 watch(()=>[ready(),route.fullPath],()=>{if(enabled)void restore()},{flush:'post'})
 onMounted(()=>{if(enabled){start();window.addEventListener('pageshow',start)}})
 onUnmounted(()=>{active=false;stop();window.removeEventListener('pageshow',start)})
 return {remember}
}
