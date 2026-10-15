// Product R02: display capabilities are independent of installed router services.
import {widgetDefinitions,type WidgetId} from './rowLayout'
export type DisplaySpec='full'|'standard'|'compact'
const summaries:WidgetId[]=['connection','system','sharing','docker','downloads','remote']
export const moduleCapabilities=widgetDefinitions.map(w=>({
  id:w.id,minWidth:w.minWidth,minHeight:w.minHeight,
  mobileMinWidth:240,stacked:summaries.includes(w.id),compactHeight:summaries.includes(w.id)?148:0,
  specs:(summaries.includes(w.id)||w.id==='applications'?['full','standard','compact']:['full','standard']) as DisplaySpec[],
  summary:w.id==='applications'?'launch-grid':summaries.includes(w.id)?'summary':'standard',
}))
export const capability=(id:WidgetId)=>moduleCapabilities.find(c=>c.id===id)!
export function spaceIssue(id:WidgetId,width:number,height:number,stacked=false,mobile=false):string{
  const c=capability(id)
  if(stacked&&!c.stacked)return 'compact'
  if(width<(mobile?c.mobileMinWidth:c.minWidth))return 'width:'+ (mobile?c.mobileMinWidth:c.minWidth)
  const minimum=stacked?c.compactHeight:c.minHeight
  return height<minimum?'height:'+minimum:''
}
