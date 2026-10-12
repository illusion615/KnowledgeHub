#!/usr/bin/env node
'use strict';
// Fixed independent regression scenarios. Real local calls require an explicit
// flag; no cloud, retry, live-match mutation, or overwrite of previous evidence.
const fs=require('node:fs'),path=require('node:path');
const core=require('../posts/jev-system-one-research/arena-core'),report=require('../posts/jev-system-one-research/arena-report'),utility=require('../posts/jev-system-one-research/arena-utility'),combat=require('../posts/jev-system-one-research/arena-combat');
const {checkIdle}=require('./jev-arena-lab');
function scenarios(){
  const open=core.create('utility-validation-20260921','step','engage-first');open.map=Array.from({length:9},(_,y)=>y===0||y===8?'#############':'#...........#');open.rewards=[];
  open.tanks.forEach((t,i)=>{[t.x,t.y]=[[2,2],[2,6],[7,2],[7,6]][i];t.recent_positions=[{x:t.x,y:t.y}];});
  const kill=core.copy(open);kill.tanks.forEach((t,i)=>{[t.x,t.y]=[[4,4],[4,6],[8,4],[4,2]][i];t.recent_positions=[{x:t.x,y:t.y}];});kill.tanks[2].hp=4;
  const shield=core.copy(open);shield.tanks[2].shield=30;shield.tanks[3].shield=30;
  const ally=core.create('tank-2026','step','engage-first');ally.tanks.forEach((t,i)=>{[t.x,t.y]=[[1,4],[2,5],[9,4],[11,6]][i];t.recent_positions=[{x:t.x,y:t.y}];});
  return [{id:'new-map-approach',game:core.create('offense-unseen-20260921','step','engage-first'),side:1},{id:'clear-shots',game:open,side:0},{id:'lethal-choice',game:kill,side:0},{id:'shielded-targets',game:shield,side:0},{id:'ally-contested-approach',game:ally,side:0}];
}
async function run(output){
  const origin='http://127.0.0.1:62848';await checkIdle(origin);fs.mkdirSync(output,{recursive:true,mode:0o700});if(fs.lstatSync(output).isSymbolicLink()||(fs.statSync(output).mode&0o077))throw new Error('unsafe_output');const fd=fs.openSync(path.join(output,'receipts.jsonl'),'wx',0o600),rows=[];
  try{for(const scenario of scenarios()){
    const snapshot=report.snapshot(scenario.game),logical=core.request(scenario.game,scenario.side),wire=utility.build(logical,snapshot),session=await checkIdle(origin);
    const response=await fetch(origin+'/api/jev/arena/probe',{method:'POST',redirect:'error',signal:AbortSignal.timeout(35000),headers:{Origin:origin,'Content-Type':'application/json','X-Jev-Csrf':session.csrf},body:JSON.stringify({consent:true,jobs:['nanojev-fp32','nanojev-4bit'].map(provider=>({provider,request:wire.request}))})}),data=await response.json();if(!response.ok)throw new Error(data.error?.code||'probe_failed');
    for(const [i,result]of data.results.entries()){
      const selected=result.ok?utility.select(result.binary_gates,wire.mapping,wire.plans):null,receipt={scenario:scenario.id,provider:i===0?'nanojev-fp32':'nanojev-4bit',snapshot,logical,wire,result,selected};fs.writeSync(fd,JSON.stringify(receipt)+'\n');fs.fsyncSync(fd);if(!result.ok)throw new Error(result.error||'probe_failed');
      const checks=Object.entries(selected.decision).map(([id,action])=>{const t=snapshot.tanks.find(t=>t.id===id),d={move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]}[action],info=combat.analyse(snapshot,t);return {tank:id,action,geometry:report.geometry(snapshot,id,action).status,before_steps:info.current,after_steps:d?info.distances[t.y+d[1]][t.x+d[0]]:0};});rows.push({scenario:scenario.id,provider:receipt.provider,decision:selected.decision,checks});
    }
  }}finally{fs.closeSync(fd);}return rows;
}
if(require.main===module){if(!process.argv.includes('--consent-local')){console.error('consent_required');process.exitCode=1;}else run(process.argv[process.argv.indexOf('--output')+1]).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});}
module.exports={scenarios,run};
