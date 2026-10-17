// Design entry only: production vite.config.ts never imports this configuration.
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
const owner=path.resolve(__dirname, '../docs/product/ui-design')
const nativeActions=['action-nas','action-nas/linkease','action-nas/unishare','action-docker','action-download','action-domain','action-ddnsto','action-disk','action-disk-part','action-disk-format','action-disk-mount','action-confirm']
const actionBridge={
  name:'quickstart-design-native-actions',enforce:'pre' as const,
  resolveId(source:string,importer?:string){
    if(source.includes('?')||!importer)return
    const resolved=source.startsWith('/@/')?path.resolve(__dirname,'src',source.slice(3)):source.startsWith('.')?path.resolve(path.dirname(importer.split('?')[0]),source):source
    const kind=nativeActions.find(name=>[path.resolve(__dirname,'src/components',name),path.resolve(__dirname,'src/components',name,'index.ts')].includes(resolved))
    if(kind)return '\0design-native-action:'+kind
  },
  load(id:string){if(!id.startsWith('\0design-native-action:'))return;const kind=id.slice('\0design-native-action:'.length);return `import {dispatchNativeAction} from ${JSON.stringify(path.resolve(__dirname,'src/design/nativeActionBridge.ts'))};import original from ${JSON.stringify(path.resolve(__dirname,'src/components',kind,'index.ts')+'?native-original')};export default (props={})=>dispatchNativeAction(${JSON.stringify(kind)},props,original);`},
  transform(code:string,id:string){
    if(id===path.resolve(__dirname,'src/pages/index/components/Card.vue'))return code.replace('<script setup>','<script setup>\nimport NativeCardMenu from "/@/design/NativeCardMenu.vue"').replace('<!-- 下拉菜单 -->','<NativeCardMenu/><!-- 下拉菜单 -->')
    const disk=id===path.resolve(__dirname,'src/pages/index/info/DiskInfo.vue'),sharing=id===path.resolve(__dirname,'src/pages/index/Storage/index.vue')
    if(disk||sharing){let scoped=code.replace('<script lang="ts" setup>','<script lang="ts" setup>\nimport {useNativeReadScope} from "/@/design/nativePreviewScope"\nconst nativeReadScope=useNativeReadScope()');for(const [reader,channel]of (disk?[['request.Nas.Disk.Status.GET()','disks'],['request.Raid.List.GET()','raid']]:[['request.Nas.Service.Status.GET()','sharing']]))scoped=scoped.replace(reader,`nativeReadScope(${reader},'${channel}')`);return scoped}
    const frame=id===path.resolve(__dirname,'src/components/action-ddnsto/setup-ddnsto-login.vue')?'auth':id===path.resolve(__dirname,'src/components/action-ddnsto/setup-ddnsto-bind.vue')?'bind':''
    if(frame)return code.replace('<script setup lang="ts">','<script setup lang="ts">\nimport NativeRemoteFrame from "/@/design/NativeRemoteFrame.vue"').replace(/<iframe[^>]+\/>/,`<NativeRemoteFrame stage="${frame}"/>`)
    if(!['src/pages/index/info/Docker.vue','src/pages/index/service/DownloadService.vue'].some(file=>id===path.resolve(__dirname,file)))return
    return code.replace('<script lang="ts" setup>','<script lang="ts" setup>\nimport {nativeStartup} from "/@/design/nativeStartup"').replace('setTimeout(getData,','nativeStartup(getData,')
  },
}
const controlMiddleware=(server:any)=>{
  server.middlewares.use('/health', (_req:any,res:any)=>{
    res.setHeader('Content-Type','application/json')
    res.end(JSON.stringify({owner,pid:process.pid,mode:'vue-design-built'}))
  })
  server.middlewares.use('/cgi-bin/', (_req:any,res:any)=>{res.statusCode=403;res.end('Design server never forwards router requests')})
}

export default defineConfig({
  root: __dirname,
  cacheDir: path.join(process.env.BUILD_CACHE_WORK_DIR || '/tmp/quickstart-design-cache', 'vite'),
  resolve: { alias: [{ find: '/@', replacement: path.resolve(__dirname, 'src') }] },
  plugins: [actionBridge,vue(), {
    name: 'quickstart-design-entry',
    transformIndexHtml: {enforce:'pre',transform(html) { return html.replace('/src/main.ts','/src/design/main.ts') }},
    configureServer:controlMiddleware,
    configurePreviewServer:controlMiddleware,
  }],
  css: { preprocessorOptions: { scss: { charset: false, additionalData: '@import "./src/style/theme.scss";' } } },
  server: { host: '0.0.0.0', port: 5180, strictPort: true, hmr: { overlay: true } },
  build: { outDir:path.join(process.env.BUILD_CACHE_WORK_DIR || '/tmp/quickstart-design-cache','vue-preview'),emptyOutDir:true,chunkSizeWarningLimit:4096 },
  preview: { host:'0.0.0.0',port:5180,strictPort:true },
})
