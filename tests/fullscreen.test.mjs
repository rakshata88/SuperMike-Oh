import test from 'node:test';
import assert from 'node:assert/strict';
import {createFullscreenController} from '../src/fullscreen.js';
function setup({touch=true,request=true,lock=true,rejectLock=false,rejectRequest=false}={}){
  const events={},calls=[],classes=new Set(),notice={},button={setAttribute(){}},shell={classList:{toggle(k,v){v?classes.add(k):classes.delete(k)}}};
  const doc={addEventListener(k,fn){events[k]=fn},async exitFullscreen(){calls.push('exit');this.fullscreenElement=null;events.fullscreenchange?.()}};
  if(request)shell.requestFullscreen=async()=>{calls.push('fullscreen');if(rejectRequest)throw Error('Denied');doc.fullscreenElement=shell};
  const orientation={type:'portrait-primary',unlock(){calls.push('unlock')},addEventListener(k,fn){events.orientation=fn}};
  if(lock)orientation.lock=async value=>{calls.push(value);if(rejectLock)throw Error('Denied');orientation.type='landscape-primary'};
  const win={screen:{orientation},innerWidth:390,innerHeight:844,addEventListener(k,fn){events[k]=fn}};
  const controller=createFullscreenController({shell,notice,button,doc,win,isTouch:()=>touch,onChange:()=>calls.push('change'),onNotice:()=>calls.push('notice')});
  return {controller,calls,classes,notice,orientation,events,doc};
}
test('mobile requests fullscreen before landscape, then releases its lock on exit',async()=>{
  const s=setup();await s.controller.toggle();assert.ok(s.calls.indexOf('fullscreen')<s.calls.indexOf('landscape'));assert.equal(s.notice.hidden,true);assert.ok(s.classes.has('is-fullscreen'));
  await s.controller.toggle();assert.equal(s.controller.active,false);assert.ok(s.calls.includes('unlock'));assert.ok(s.calls.includes('exit'));assert.ok(!s.classes.has('is-fullscreen'));
});
for(const options of [{lock:false},{rejectLock:true},{request:false,lock:false},{rejectRequest:true,rejectLock:true}])test(`portrait fallback is usable: ${JSON.stringify(options)}`,async()=>{
  const s=setup(options);await s.controller.toggle();assert.equal(s.controller.active,true);assert.equal(s.notice.hidden,false);
  s.orientation.type='landscape-primary';s.controller.refresh();assert.equal(s.notice.hidden,true);await s.controller.exit();assert.equal(s.controller.active,false);
});
test('desktop fullscreen does not request rotation',async()=>{const s=setup({touch:false});await s.controller.toggle();assert.ok(!s.calls.includes('landscape'));assert.equal(s.notice.hidden,true)});
test('native browser exit cleans up orientation and fallback Escape exits without fullscreen APIs',async()=>{
  const s=setup();await s.controller.toggle();s.doc.fullscreenElement=null;s.events.fullscreenchange();assert.equal(s.controller.active,false);assert.ok(s.calls.includes('unlock'));
  const f=setup({request:false,lock:false});await f.controller.toggle();assert.equal(f.controller.handleEscape(),true);assert.equal(f.controller.active,false);assert.equal(f.controller.handleEscape(),false);
});
