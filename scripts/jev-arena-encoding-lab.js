#!/usr/bin/env node
'use strict';
// Bounded local-only replay of fixed INPUTS, never re-executes imported orders.
const fs=require('node:fs'),path=require('node:path');
const combat=require('../posts/jev-system-one-research/arena-combat');
const {checkIdle}=require('./jev-arena-lab');
const directions={move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]};
function encode(request,snapshot,variant,rotation=0){
  if(!Number.isSafeInteger(rotation)||rotation<0||rotation>64)throw new Error('invalid_rotation');
  if(!['original','neutral','compact','compact-neutral','canonical'].includes(variant))throw new Error('invalid_variant');
  const req=structuredClone(request),mapping={};
  if(variant.startsWith('compact')||variant==='canonical'){
    req.states[0].state='Tank combat. Objective: destroy enemies. Prefer dealing enemy damage; otherwise get to a firing position. These are assisted snapshot facts, not future guarantees. One action per tank, no automatic follow-up.\n'+(request.states[0].state.split('\n').find(s=>s.startsWith('Bullets:'))||'');
    for(const [id,q]of Object.entries(req.states[0].questions)){
      const t=snapshot.tanks.find(t=>t.id===id),info=combat.analyse(snapshot,t);
      q.instructions=`Which action best attacks the enemy for ${id} at (${t.x},${t.y}), HP${t.hp}, reload${t.cooldown}? Current firing-position distance: ${info.current??'unreachable'} moves. `+snapshot.tanks.filter(e=>e.id!==id&&e.hp>0).map(e=>`${e.side===t.side?'Ally':'Enemy'} ${e.id} (${e.x},${e.y}) HP${e.hp} shield${e.shield}.`).join(' ');
      for(const key of Object.keys(q.criteria)){
        const d=directions[key];
        if(d){const x=t.x+d[0],y=t.y+d[1];q.criteria[key]=info.open(x,y)?`Move ${key.slice(5)} to (${x},${y}). Enemy damage: 0. Firing-position distance after moving: ${info.distances[y][x]??'unreachable'}.`:`Move ${key.slice(5)} to (${x},${y}) is blocked. No movement or damage.`;}
        else {const enemy=snapshot.tanks.find(e=>e.id===key.slice(5)),shot=combat.shot(snapshot,t,enemy,t.side);if(!shot.clear)q.criteria[key]='Cannot hit the enemy: '+shot.reason+'. Damage: 0.';else{const v=shot.victim,damage=t.power_until>snapshot.tick?20:12,shield=Math.min(v.shield,damage),hp=Math.min(v.hp,damage-shield);q.criteria[key]=`Shoot ${enemy.id}. Clear shot: ${hp} enemy HP damage and ${shield} shield damage if target stays still. ${hp===v.hp?'Destroys target.':''}`;}}
      }
    }
  }
  for(const [id,q]of Object.entries(req.states[0].questions)){
    if(variant==='canonical') {
      const t=snapshot.tanks.find(t=>t.id===id),info=combat.analyse(snapshot,t);
      q.instructions=`Which action best achieves the combat objective for the controlled tank? Current distance to a firing position: ${info.current??'unreachable'} moves.`;
      for(const key of Object.keys(q.criteria))q.criteria[key]=q.criteria[key].replace(/ to \(\d+,\d+\)/g,'').replace(/Shoot [BR][01]/g,'Shoot the enemy');
    }
    mapping[id]={};const criteria={};Object.entries(q.criteria).forEach(([key,text],i)=>{const alias=(variant.includes('neutral')||variant==='canonical')?'option_'+((i+rotation)%Object.keys(q.criteria).length):key;mapping[id][alias]=key;criteria[alias]=text;});q.criteria=criteria;
  }
  return {request:req,mapping};
}
function decode(result,mapping){return Object.fromEntries(Object.entries(result.decision).map(([id,key])=>{if(!mapping[id]||!Object.hasOwn(mapping[id],key))throw new Error('invalid_alias');return [id,mapping[id][key]];}));}
async function run({file,output,indices,variants,providers=['nanojev-fp32'],origin='http://127.0.0.1:62848',consent=false,rotation=0}){
  if(!consent)throw new Error('consent_required');
  if(typeof file!=='string'||typeof output!=='string'||!file||!output||!Number.isSafeInteger(rotation)||rotation<0||rotation>64)throw new Error('invalid_config');
  if(!Array.isArray(indices)||!indices.length||!indices.every(Number.isSafeInteger)||!Array.isArray(variants)||!variants.length||variants.some(v=>!['original','neutral','compact','compact-neutral','canonical'].includes(v))||providers.some(p=>!['nanojev-fp32','nanojev-4bit'].includes(p))||!providers.length||indices.length*variants.length*providers.length>20)throw new Error('invalid_budget_or_config');
  if(fs.statSync(file).size>10*1024*1024)throw new Error('record_too_large');const record=JSON.parse(fs.readFileSync(file,'utf8'));
  if(record.schema!=='study-room.tank-diagnostic.v1')throw new Error('diagnostic_required');
  const selected=indices.map(index=>{const d=record.decisions.find(d=>d.index===index);if(!d?.request?.questions||!d.observation_snapshot)throw new Error('input_missing');return d;});
  await checkIdle(origin);fs.mkdirSync(output,{recursive:true,mode:0o700});if(fs.lstatSync(output).isSymbolicLink()||(fs.statSync(output).mode&0o077))throw new Error('unsafe_output');
  const fd=fs.openSync(path.join(output,'receipts.jsonl'),'wx',0o600),summary=[];
  try{for(const d of selected)for(const variant of variants)for(const provider of providers){
    const wire=encode({states:[{id:'arena',...d.request}]},d.observation_snapshot,variant,rotation),session=await checkIdle(origin);
    const response=await fetch(new URL(origin).origin+'/api/jev/arena/probe',{method:'POST',redirect:'error',headers:{Origin:new URL(origin).origin,'Content-Type':'application/json','X-Jev-Csrf':session.csrf},body:JSON.stringify({consent:true,jobs:[{provider,request:wire.request}]}),signal:AbortSignal.timeout(35000)});
    const data=await response.json(),result=data.results?.[0];
    const receipt={schema:'study-room.tank-encoding-lab.v1',source_match:record.match_id,source_index:d.index,variant,provider,rotation,observation_snapshot:d.observation_snapshot,...wire,result:response.ok?result:null,error:response.ok?(result?.ok?null:result?.error):data.error?.code||'probe_failed'};
    if(!receipt.error)receipt.decoded_decision=decode(result,wire.mapping);
    fs.writeSync(fd,JSON.stringify(receipt)+'\n');fs.fsyncSync(fd);
    if(receipt.error)throw new Error(receipt.error);
    summary.push({index:d.index,variant,provider,decision:receipt.decoded_decision,ms:Math.round(result.lab_elapsed_ms)});
  }}finally{fs.closeSync(fd);}return summary;
}
if(require.main===module){const args=process.argv.slice(2),get=k=>args.includes(k)?args[args.indexOf(k)+1]:undefined;run({file:get('--record'),output:get('--output'),indices:(get('--indices')||'').split(',').map(Number),variants:(get('--variants')||'').split(','),providers:(get('--providers')||'nanojev-fp32').split(','),origin:get('--origin')||'http://127.0.0.1:62848',consent:args.includes('--consent-local'),rotation:Number(get('--rotation')||0)}).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(/^[a-z_]+$/.test(e.message)?e.message:'encoding_lab_failed');process.exitCode=1;});}
module.exports={encode,decode,run};
