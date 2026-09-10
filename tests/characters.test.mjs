import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {FRAMES,drawCharacter,loadCharacters} from '../src/characters.js';

// Inspect the actual generated PNG; this reads pixels without modifying the artwork.
function pngPixels(file){
  const b=readFileSync(file),width=b.readUInt32BE(16),height=b.readUInt32BE(20);
  assert.equal(b[24],8);assert.equal(b[25],6,'Atlas must have a real RGBA alpha channel');assert.equal(b[28],0);
  const chunks=[];for(let i=8;i<b.length;){const len=b.readUInt32BE(i);if(b.toString('ascii',i+4,i+8)==='IDAT')chunks.push(b.subarray(i+8,i+8+len));i+=len+12}
  const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,pixels=Buffer.alloc(stride*height);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c};
  for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=4?pixels[i-4]:0,up=y?pixels[i-stride]:0,diag=y&&x>=4?pixels[i-stride-4]:0;const pred=[0,a,up,Math.floor((a+up)/2),paeth(a,up,diag)][filter];pixels[i]=(raw[y*(stride+1)+1+x]+pred)&255}}
  return {width,height,pixels};
}

test('bundled character atlas has transparent surroundings and populated, bounded pose frames',()=>{
  const {width,height,pixels}=pngPixels(new URL('../assets/characters/mike-xiaboo-atlas.png',import.meta.url));
  assert.equal(width,1774);assert.equal(height,887);
  let transparent=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0)transparent++;
  assert.ok(transparent>width*height*.35,'Empty sprite background must be truly transparent');
  for(const [kind,frames] of Object.entries(FRAMES)){assert.equal(frames.length,6);for(const [x,y,w,h,pivot] of frames){assert.ok(x>=0&&y>=0&&x+w<=width&&y+h<=height);assert.ok(pivot>0&&pivot<w);let opaque=0;for(let yy=y;yy<y+h;yy+=4)for(let xx=x;xx<x+w;xx+=4)if(pixels[(yy*width+xx)*4+3]>200)opaque++;assert.ok(opaque>200,`${kind} frame must contain visible artwork`)}}
});

test('loaded sprites draw all gameplay poses and mirror correctly without changing frame bounds',async()=>{
  globalThis.Image=class{naturalWidth=1774;naturalHeight=887;set src(value){queueMicrotask(()=>this.onload())}async decode(){}};
  await loadCharacters();const calls=[],scales=[];const c={save(){},restore(){},translate(){},scale(...v){scales.push(v)},drawImage(...args){calls.push(args)}};
  for(const kind of Object.keys(FRAMES))for(const pose of ['idle','run','jump','duck','attack','win'])assert.ok(drawCharacter(c,kind,100,200,1,pose,.1,-1));
  assert.equal(calls.length,18);assert.ok(scales.some(([x])=>x===-1));
  const runs=[];c.drawImage=(...args)=>runs.push(args);drawCharacter(c,'normal',0,0,1,'run',.01);drawCharacter(c,'normal',0,0,1,'run',.11);assert.notEqual(runs[0][1],runs[1][1]);
  for(const args of calls)assert.ok(args.slice(1).every(Number.isFinite));
});
