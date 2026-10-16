// Design entry only: production vite.config.ts never imports this configuration.
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
const owner=path.resolve(__dirname, '../docs/product/ui-design')
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
  plugins: [vue(), {
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
