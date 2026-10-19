import test from 'node:test'
import assert from 'node:assert/strict'
import {homeModule} from './homeModule.mjs'
const {homeEntryMemory}=await homeModule('../src/home/launcherRouteState.ts')
test('homepage return state is a bounded identity and scroll, without target URL or credentials',()=>{
 assert.deepEqual(homeEntryMemory({v:1,id:'istoreenhance',scroll:270,url:'https://secret/',token:'private'}),{v:1,id:'istoreenhance',scroll:270})
 assert.equal(homeEntryMemory({v:1,id:'app',scroll:-20}).scroll,0)
 assert.equal(homeEntryMemory({v:1,id:'app',scroll:1e9}).scroll,1000000)
 for(const value of [null,{},[],{v:2,id:'app',scroll:0},{v:1,id:'bad"]',scroll:0},{v:1,id:'app',scroll:Infinity},{v:1,id:'app',scroll:'20'}])assert.equal(homeEntryMemory(value),null)
})
