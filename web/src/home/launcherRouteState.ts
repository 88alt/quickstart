export type LauncherTab='all'|'apps'|'tools'|'links'
export type LauncherView={tab:LauncherTab;page:number}
export type LauncherMemory={v:1;search:string;scroll:number;focus:string;from?:string}
export function launcherView(query:Record<string,unknown>):LauncherView|null{
 if(query.panel!=='applications')return null
 const tab=(['all','apps','tools','links'].includes(String(query.tab))&&typeof query.tab==='string'?query.tab:'all') as LauncherTab
 const page=typeof query.page==='string'&&/^[1-9][0-9]{0,2}$/.test(query.page)?Number(query.page):1
 return {tab,page}
}
export function launcherQuery(query:Record<string,any>,view:LauncherView|null){
 const result={...query};delete result.panel;delete result.tab;delete result.page
 return view?{...result,panel:'applications',tab:view.tab,page:String(Math.max(1,Math.min(999,Math.floor(view.page)||1)))}:result
}
export function launcherMemory(value:unknown):LauncherMemory{
 const m=value&&typeof value==='object'?value as Record<string,unknown>:{}
 const text=(v:unknown,max:number)=>typeof v==='string'?v.replace(/[\u0000-\u001f]/g,'').slice(0,max):''
 return {v:1,search:text(m.search,256),scroll:typeof m.scroll==='number'&&Number.isFinite(m.scroll)?Math.max(0,Math.min(1000000,m.scroll)):0,focus:text(m.focus,128),...(typeof m.from==='string'&&m.from.startsWith('/')&&m.from.length<=2048?{from:m.from}:{})}
}
