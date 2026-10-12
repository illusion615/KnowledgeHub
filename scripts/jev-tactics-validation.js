#!/usr/bin/env node
'use strict';
// Bounded development fixtures, not independent tactical win-rate evidence.
const core=require('../posts/jev-system-one-research/arena-core');
const utility=require('../posts/jev-system-one-research/arena-utility');
const report=require('../posts/jev-system-one-research/arena-report');
function open(){const g=core.create('tactics-development','step','utility-tactics','tactical');g.map=Array.from({length:9},(_,y)=>Array.from({length:13},(_,x)=>x===0||x===12||y===0||y===8?'#':'.').join(''));g.rewards=[];g.tick=24;return g;}
function fixtures(){
  const approach=open();
  const dodge=open();Object.assign(dodge.tanks[0],{x:1,y:3,hp:8});Object.assign(dodge.tanks[1],{x:1,y:6});Object.assign(dodge.tanks[2],{x:7,y:3,cooldown:5});dodge.shot_seq=1;dodge.bullets=[{id:1,owner:'R0',side:1,fired_tick:24,spawn_x:7,spawn_y:3,x:6,y:3,dx:-1,dy:0,damage:12,life:5}];
  const repair=open();Object.assign(repair.tanks[0],{x:2,y:3,hp:20});Object.assign(repair.tanks[2],{x:8,y:3});repair.rewards=[{type:'repair',x:2,y:2}];
  const cover=open();Object.assign(cover.tanks[0],{x:3,y:3,hp:35});Object.assign(cover.tanks[2],{x:7,y:3});cover.map[2]=cover.map[2].slice(0,4)+'#'+cover.map[2].slice(5);
  const coordinate=open();Object.assign(coordinate.tanks[0],{x:2,y:3});Object.assign(coordinate.tanks[1],{x:2,y:5});Object.assign(coordinate.tanks[2],{x:6,y:4,hp:4});coordinate.tanks[3].hp=0;
  return [{id:'range-first',game:approach},{id:'incoming-lethal-dodge',game:dodge},{id:'wounded-repair',game:repair},{id:'wall-cover',game:cover},{id:'avoid-redundant-lethal-shots',game:coordinate}];
}
async function main(){
  const fs=require('node:fs'),path=require('node:path'),args=process.argv.slice(2),get=(key,defaultValue)=>{const i=args.indexOf(key);return i<0?defaultValue:args[i+1];};
  if(!args.includes('--consent-local'))throw new Error('local_inference_consent_required');
  const output=get('--output');if(!output)throw new Error('fresh_output_directory_required');
  const origin=new URL(get('--origin','http://127.0.0.1:62848')).origin;if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin))throw new Error('loopback_origin_required');
  fs.mkdirSync(output,{mode:0o700});fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({schema:'study-room.tactics-development.v1',planned_calls:10,created_at:new Date().toISOString(),scope:'Five predeclared development boards x two local models. Shared effect templates; not unseen-text holdouts, model training, or match outcomes. No cloud, retries or warmups.'},null,2),{mode:0o600,flag:'wx'});
  const fd=fs.openSync(path.join(output,'receipts.jsonl'),'wx',0o600);
  try{for(const fixture of fixtures()){
    const session=await fetch(origin+'/api/jev/status').then(r=>r.json());if(session.arena_busy||session.experiment_busy)throw new Error('busy');
    const snapshot=report.snapshot(fixture.game),logical=core.request(fixture.game,0),wire=utility.build(logical,snapshot);
    const response=await fetch(origin+'/api/jev/arena/probe',{method:'POST',redirect:'error',signal:AbortSignal.timeout(35000),headers:{Origin:origin,'Content-Type':'application/json','X-Jev-Csrf':session.csrf},body:JSON.stringify({consent:true,jobs:['nanojev-fp32','nanojev-4bit'].map(provider=>({provider,request:wire.request}))})});const body=await response.json();if(!response.ok)throw new Error(body.error?.code||'probe_failed');
    let failed=false;for(let i=0;i<body.results.length;i++){const result=body.results[i],selected=result.ok?utility.read(result.binary_gates,wire):null;fs.writeSync(fd,JSON.stringify({scenario:fixture.id,provider:i===0?'nanojev-fp32':'nanojev-4bit',snapshot,logical,wire,result,selected})+'\n');fs.fsyncSync(fd);console.log(JSON.stringify({scenario:fixture.id,provider:i===0?'nanojev-fp32':'nanojev-4bit',decision:selected?.decision||null,error:result.error||null}));if(!result.ok)failed=true;}if(failed)throw new Error('probe_failed_no_retry');
  }}finally{fs.closeSync(fd);}
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={open,fixtures};
