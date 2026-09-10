import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initializeOpening,openingMarkup,OPENING_ART} from '../src/opening.js';

test('opening progress waits for actual work and reports failed assets without blocking the game',async()=>{
  let finish;const pending=new Promise(resolve=>finish=resolve),progress=[];
  const work=initializeOpening([
    {name:'fast',run:()=>Promise.resolve(),message:'First ready'},
    {name:'slow',run:()=>pending,message:'Second ready'},
    {name:'failed',run:()=>Promise.reject(new Error('offline')),message:'Fallback ready'},
  ],percent=>progress.push(percent));
  await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(progress,[33,67]);
  finish();assert.deepEqual(await work,['failed']);assert.deepEqual(progress,[33,67,100]);
});

test('opening presents the three supplied posters and starts with its entry button disabled',()=>{
  const html=openingMarkup();assert.match(html,/id="opening-enter"[^>]*disabled/);
  assert.equal((html.match(/<image /g)||[]).length,3);
  for(const url of Object.values(OPENING_ART)){
    assert.ok(html.includes(url));const png=readFileSync(new URL(url));
    assert.equal(png.readUInt32BE(16),1122);assert.equal(png.readUInt32BE(20),1402);
  }
  assert.ok(!html.includes('mike-xiaboo-atlas'));
});
