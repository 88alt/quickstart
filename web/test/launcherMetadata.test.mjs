import assert from 'node:assert/strict'
import test from 'node:test'
import {homeModule} from './homeModule.mjs'
const {normalizeInstalled}=await homeModule('../src/home/launcherMetadata.ts')
test('invalid identity makes catalogue unknown instead of reporting an uninstall',()=>{
 for(const row of [null,{}, {name:''},{name:'bad/name'}])assert.throws(()=>normalizeInstalled([{name:'valid-app',entry:'/app'},row]))
 assert.deepEqual(normalizeInstalled([]),[])
})
test('valid missing entry and duplicate identity retain their existing semantics',()=>{
 const rows=normalizeInstalled([{name:'valid-app'},{name:'valid-app',entry:'/other'}])
 assert.equal(rows.length,1)
 assert.equal(rows[0].id,'valid-app')
 assert.equal(rows[0].path,'')
})
