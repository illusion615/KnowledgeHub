'use strict';
// One application-wide lane for managed local GPU requests. Cancelling a queued
// call removes it; a submitted forward is not preemptible and retains the lane
// until its HTTP operation settles. This does not govern unrelated oMLX clients.
let tail=Promise.resolve();
async function run(signal,work){
  const before=tail;let release;tail=new Promise(r=>{release=r;});
  try{await before;if(signal?.aborted)throw Object.assign(new Error('cancelled'),{code:'cancelled'});return await work();}
  finally{release();}
}
module.exports={run};
