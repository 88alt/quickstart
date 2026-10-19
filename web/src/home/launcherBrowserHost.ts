// The independent launcher host survives responsive row reconstruction. Cards request its
// editor; drafts are not owned by a disposable layout slot.
type OpenBrowser=(edit:boolean,network?:Record<string,any>)=>void
import type {HomeApplication} from './homeApplications'
let host:OpenBrowser|undefined
let activate:((app:HomeApplication)=>void)|undefined
export function registerLauncherBrowser(next:OpenBrowser,launch?:(app:HomeApplication)=>void){host=next;activate=launch;return ()=>{if(host===next){host=undefined;activate=undefined}}}
export function requestLauncherBrowser(edit:boolean,network?:Record<string,any>){if(!host)return false;host(edit,network);return true}
export function requestLauncherApp(app:HomeApplication){if(!activate)return false;activate(app);return true}
