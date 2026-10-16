// Shared, finite display contract. No DOM, requests, or layout writes.
import {widgetDefinitions,widget,type WidgetId} from './rowLayout'
import type {OrderedRow} from './orderedLayout'
export type PresentationId='standard'|'summary'|'grid'|'strip'
export type WidgetPreference={mode:'auto'|PresentationId;iconRows:0|1|2|3}
export type WidgetPreferences=Record<WidgetId,WidgetPreference>
export type PositionRole='ordinary'|'large'|'stacked'
export type PresentationContext={width:number;height:number;role:PositionRole;favoriteCount:number;mobile?:boolean}
export type ResolvedPresentation={id:PresentationId;minWidth:number;minHeight:number;preferredHeight:number;columns:number;rows:number;capacity:number;issue:string}
const summaryIds:WidgetId[]=['connection','networkInterface','system','sharing','docker','downloads','remote']
export const presentationDefinitions=widgetDefinitions.map(w=>({id:w.id,forms:w.id==='applications'?['grid','strip'] as PresentationId[]:w.id==='devices'||summaryIds.includes(w.id)?['standard','summary'] as PresentationId[]:['standard'] as PresentationId[],stacked:summaryIds.includes(w.id)}))
export const definition=(id:WidgetId)=>presentationDefinitions.find(w=>w.id===id)!
export function defaultPreferences():WidgetPreferences{return Object.fromEntries(widgetDefinitions.map(w=>[w.id,{mode:'auto',iconRows:0}])) as WidgetPreferences}
export function preferenceIssue(id:WidgetId,p:WidgetPreference){return !p||!['auto',...definition(id).forms].includes(p.mode)||![0,1,2,3].includes(p.iconRows)||id!=='applications'&&p.iconRows!==0?'preference':''}
export function resolvePresentation(id:WidgetId,p:WidgetPreference,ctx:PresentationContext):ResolvedPresentation{
 const d=definition(id),w=widget(id),count=Math.min(6,Math.max(0,ctx.favoriteCount)),role=ctx.role
 const form:PresentationId=p.mode==='auto'?(role==='stacked'?'summary':id==='applications'?'grid':'standard'):p.mode
 let issue=preferenceIssue(id,p)||(role==='stacked'&&(!d.stacked||form!=='summary')?'compact':!d.forms.includes(form)?'form':'')
 let minWidth=ctx.mobile?240:form==='summary'&&id==='devices'?240:w.minWidth,minHeight=role==='stacked'?148:form==='summary'?(id==='devices'?(ctx.width<450?280:260):176):w.minHeight
 let columns=1,rows=1,capacity=1,preferredHeight=minHeight
 if(id==='applications'){
  // 36px icon, two 16px name lines, 82px tile, 12px gap; 94px chrome
  // including the two border pixels. Header All also carries overflow count.
  // Columns remain bounded even in very wide rows. The preferred row count
  // changes packing, while fewer items never create fake empty tiles.
  const maximum=Math.max(1,Math.min(6,Math.floor((ctx.width-32+12)/112))),target=form==='strip'?1:p.iconRows
  columns=target?Math.min(maximum,Math.max(1,Math.ceil(count/target))):Math.min(maximum,Math.max(1,Math.ceil(count/Math.max(1,Math.ceil(count/maximum)))))
  const desired=Math.max(1,Math.ceil(count/columns)),limit=target||3
  const tileHeight=form==='strip'?56:82,pitch=tileHeight+12
  rows=Math.min(limit,desired);preferredHeight=94+rows*tileHeight+(rows-1)*12
  minHeight=target?preferredHeight:176
  const available=Math.max(0,Math.floor((ctx.height-94+12)/pitch));rows=Math.max(0,Math.min(rows,available));capacity=rows*columns
 }else if(id==='devices'){
  columns=ctx.width>=650?3:ctx.width>=450?2:1
  rows=ctx.height<330?1:columns===1?(ctx.height>=370?3:2):2
  capacity=form==='summary'?0:Math.min(6,rows*columns)
 }
 if(!issue&&ctx.width<minWidth)issue='width:'+minWidth
 if(!issue&&ctx.height<minHeight)issue='height:'+minHeight
 return {id:form,minWidth,minHeight,preferredHeight,columns,rows,capacity,issue}
}
export function placementMinimum(id:WidgetId,p?:WidgetPreference,stacked=false){return resolvePresentation(id,p||defaultPreferences()[id],{width:1000,height:1000,role:stacked?'stacked':'ordinary',favoriteCount:4})}
// Effective grid tracks follow CSS minmax(minimum, weight*fr), including
// consecutive responsive fragments. A tiny overview never becomes a size input.
export function columnWidths(row:OrderedRow,width:number,prefs:WidgetPreferences):number[]{
 const minima=row.columns.map(c=>Math.max(0,...c.cards.map(id=>id?Math.min(width,placementMinimum(id,prefs[id],c.cards.length===2).minWidth):Math.min(width,260))))
 const widths=Array(row.columns.length).fill(0),groups:number[][]=[];let group:number[]=[],sum=0
 minima.forEach((m,i)=>{if(group.length&&sum+m+18*group.length>width){groups.push(group);group=[];sum=0}group.push(i);sum+=m});if(group.length)groups.push(group)
 for(const indices of groups){let free=width-18*(indices.length-1),pending=[...indices]
  while(pending.length){const total=pending.reduce((n,i)=>n+row.columns[i].weight,0),fixed=pending.filter(i=>free*row.columns[i].weight/total<minima[i]);if(!fixed.length){for(const i of pending)widths[i]=free*row.columns[i].weight/total;break}for(const i of fixed){widths[i]=minima[i];free-=minima[i]}pending=pending.filter(i=>!fixed.includes(i))}
 }
 return widths
}
export function presentationHeight(row:OrderedRow,prefs:WidgetPreferences,width=1160,favoriteCount=4){
 const widths=columnWidths(row,width,prefs);let height=0,issue=''
 row.columns.forEach((c,ci)=>c.cards.forEach((id,si)=>{if(!id)return;const stacked=c.cards.length===2,p=resolvePresentation(id,prefs[id],{width:widths[ci],height:100000,role:stacked?'stacked':row.columns.some(col=>col.cards.length===2)?'large':'ordinary',favoriteCount,mobile:width<650});if(p.issue&&!p.issue.startsWith('height:'))issue=p.issue;height=Math.max(height,stacked?p.minHeight/((si===0?c.split:100-c.split)/100)+18:p.minHeight)}))
 return {height:Math.ceil(height),issue}
}
