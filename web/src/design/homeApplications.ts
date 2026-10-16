// Design-only application catalogue: synthetic examples, never installation evidence.
import { reactive } from 'vue'
export type HomeApplication={id:string;zh:string;en:string;detail:string;detailEn:string;glyph:string;path:string;kind:'app'|'builtin';tone:string}
export const homeApplications:HomeApplication[]=[
  {id:'files',zh:'文件管理',en:'Files',detail:'磁盘与文件',detailEn:'Disks & files',glyph:'folder',path:'/nas',kind:'builtin',tone:'blue'},
  {id:'docker',zh:'Docker',en:'Docker',detail:'容器管理',detailEn:'Containers',glyph:'layers',path:'/docker',kind:'app',tone:'blue'},
  {id:'qbittorrent',zh:'qBittorrent',en:'qBittorrent',detail:'下载管理',detailEn:'Downloads',glyph:'download',path:'/download',kind:'app',tone:'teal'},
  {id:'ddnsto',zh:'DDNSTO',en:'DDNSTO',detail:'远程访问',detailEn:'Remote access',glyph:'globe',path:'/ddns',kind:'app',tone:'violet'},
  {id:'linkease',zh:'易有云',en:'LinkEase',detail:'文件与远程',detailEn:'Files & remote access',glyph:'folder',path:'/storage',kind:'app',tone:'teal'},
  {id:'fastnet',zh:'网络测速',en:'Speed test',detail:'FastNet',detailEn:'FastNet',glyph:'activity',path:'/networkSpeedTest',kind:'app',tone:'blue'},
  {id:'oaf',zh:'家长控制',en:'Parental controls',detail:'应用过滤',detailEn:'App filtering',glyph:'shield',path:'/parental',kind:'app',tone:'violet'},
  {id:'devices',zh:'局域网设备',en:'LAN devices',detail:'设备与策略',detailEn:'Devices & policies',glyph:'devices',path:'/devicemanagement',kind:'builtin',tone:'blue'},
  {id:'network',zh:'网络向导',en:'Network setup',detail:'网络配置',detailEn:'Network configuration',glyph:'network',path:'/network',kind:'builtin',tone:'teal'},
]
export const applicationDefaults=['files','docker','qbittorrent','ddnsto']
// Memory only: route navigation retains choices; refreshing restores the proposal.
const favoriteSample=new URLSearchParams(location.search).get('favorites')
export const homeApplicationSession=reactive({favorites:favoriteSample===null?[...applicationDefaults]:[...applicationDefaults,'linkease','fastnet'].slice(0,Math.max(0,Math.min(6,Number(favoriteSample)||0)))})
