#!/usr/bin/env node
'use strict';
// No inference or authentication secrets are written to disk/stdout. The CSRF
// token stays in this local process, just as it does in the normal page client.
const { saveDiagnostic, DEFAULT_DIRECTORY } = require('./jev-arena-records');
async function capture({origin='http://127.0.0.1:62848',output=DEFAULT_DIRECTORY,fetchImpl=fetch}={}) {
  const url=new URL(origin);
  if(url.protocol!=='http:'||!['127.0.0.1','localhost'].includes(url.hostname)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('loopback_origin_required');
  origin=url.origin;
  const status=await fetchImpl(origin+'/api/jev/status',{redirect:'error',signal:AbortSignal.timeout(5000)});
  if(!status.ok)throw new Error('backend_unavailable');
  const session=await status.json();
  if(session.backend!=='study-room-jev-live-v1'||! /^[a-f0-9]{64}$/.test(session.csrf))throw new Error('invalid_backend');
  const response=await fetchImpl(origin+'/api/jev/arena/latest',{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{Origin:origin,'Content-Type':'application/json','X-Jev-Csrf':session.csrf},body:'{}'});
  if(!response.ok)throw new Error(response.status===404?'no_match':'capture_failed');
  const record=await response.json();
  if(record.status==='running'||record.pending>0)throw new Error('match_still_running');
  const file=saveDiagnostic(record,output);
  return {id:record.id,status:record.status,decisions:record.decisions.length,file};
}
if(require.main===module){
  const args=process.argv.slice(2),options={};
  for(let i=0;i<args.length;i+=2){if(!['--origin','--output'].includes(args[i])||!args[i+1]){console.error('invalid_argument');process.exitCode=1;break;}options[args[i].slice(2)]=args[i+1];}
  if(!process.exitCode)capture(options).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(['loopback_origin_required','backend_unavailable','invalid_backend','no_match','capture_failed','match_still_running','unsafe_record_directory'].includes(e.message)?e.message:e.code==='EEXIST'?'already_archived':'capture_failed');process.exitCode=1;});
}
module.exports={capture};
