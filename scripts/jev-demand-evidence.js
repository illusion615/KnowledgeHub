'use strict';
// Offline arithmetic and chart rendering from a public HN index snapshot.
// No HTTP requests, credentials, inference, or current point-score reconstruction.
const fs=require('node:fs'),path=require('node:path');
const DAY=86400000,ids=['jev','qwen3','gptoss','deepseekr1','gpt6','opus5'];
function summarize(input){
  if(input.schema!=='study-room.jev-demand-observations.v1'||input.window_days!==8||input.cohorts.length!==ids.length)throw Error('invalid_snapshot');
  const cohorts=input.cohorts.map((c,index)=>{
    if(c.id!==ids[index]||!Array.isArray(c.stories)||!Array.isArray(c.comments))throw Error('invalid_cohort');
    const start=Date.parse(c.start),end=Date.parse(c.end_exclusive),storyIds=new Set(),storyTimes=new Map(),commentIds=new Set(),active=new Set();
    if(!Number.isFinite(start)||end-start!==8*DAY)throw Error('invalid_window');
    const daily=Array.from({length:8},(_,day)=>({day,date:new Date(start+day*DAY).toISOString().slice(0,10),posts:0,comments:0}));
    function bucket(row){const at=Date.parse(row.created_at);if(!Number.isFinite(at)||at<start||at>=end)throw Error('outside_window');return Math.floor((at-start)/DAY);}
    for(const row of c.stories){if(storyIds.has(row.id))throw Error('duplicate_story');storyIds.add(row.id);storyTimes.set(row.id,Date.parse(row.created_at));daily[bucket(row)].posts++;}
    for(const row of c.comments){if(commentIds.has(row.id)||!storyIds.has(row.story_id))throw Error('invalid_comment');commentIds.add(row.id);active.add(row.story_id);daily[bucket(row)].comments++;}
    // URL counts are descriptive only: the plotted unit stays HN submissions.
    const links=new Set(c.stories.filter(r=>r.url).map(r=>r.url));
    const totals={posts:c.stories.length,comments:c.comments.length,threads_with_comments:active.size,threads_without_comments:c.stories.length-active.size,show_hn_posts:c.stories.filter(r=>r.show_hn).length,distinct_exact_urls:links.size,comments_before_current_thread_timestamp:c.comments.filter(r=>Date.parse(r.created_at)<storyTimes.get(r.story_id)).length};
    const late={posts:daily.slice(4).reduce((n,r)=>n+r.posts,0),comments:daily.slice(4).reduce((n,r)=>n+r.comments,0)};
    const threadCounts=new Map();for(const r of c.comments)threadCounts.set(r.story_id,(threadCounts.get(r.story_id)||0)+1);
    const top=[...threadCounts].sort((a,b)=>b[1]-a[1])[0];
    return {id:c.id,name:c.name,start:c.start,end_exclusive:c.end_exclusive,queries:c.queries,pattern:c.pattern,version_scope:c.version_scope||null,launch_reference:c.launch_reference||null,candidates:c.candidates,excluded:c.excluded,daily,totals,days_4_to_7:late,late_share_percent:{posts:Number((late.posts/totals.posts*100).toFixed(1)),comments:Number((late.comments/totals.comments*100).toFixed(1))},largest_thread:{id:top?.[0]||null,comments:top?.[1]||0}};
  });
  return {schema:'study-room.jev-demand-summary.v1',collected_at:input.collected_at,expanded_at:input.expanded_at,revision:input.revision,version_selection:input.version_selection,cutoff_exclusive:input.cutoff_exclusive,window_days:8,cohorts,scope:input.scope,selection:input.selection,alias_rule:input.alias_rule,retrieval:input.retrieval,provider_source:input.provider_source,interpretation:'Jev submissions grow later in this observed window; comments show launch and later peaks, not monotonic growth. GPT-6 Astra, Claude Opus 5, DeepSeek-R1 and GPT-OSS all have more total in-window comments than Jev. DeepSeek-R1 also has strong later-window activity, so renewed discussion is not unique to structured decision models. Submissions, comments and Gateway trial adoption are different measures; none establishes sentiment, retained demand, willingness to pay or causal category superiority.'};
}
function svg(summary,key,mobile=false){
  if(!['posts','comments'].includes(key))throw Error('invalid_metric');
  const peak=Math.max(...summary.cohorts.flatMap(c=>c.daily.map(r=>r[key]))),step=[1,2,5,10,20,25,50,100,200,250,500,1000,2000,5000].find(v=>v>=peak/5)||Math.ceil(peak/5),max=Math.max(step,Math.ceil(peak/step)*step),x0=mobile?48:62,x1=mobile?458:890,y0=55,y1=mobile?228:273,width=mobile?480:940,height=mobile?435:420;
  const x=d=>x0+d*(x1-x0)/7,y=v=>y1-v/max*(y1-y0),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const title=key==='posts'?'新增主帖 / New HN submissions':mobile?'新增评论 / New comments':'新增评论 / New comments in matched threads';
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">${title}</title><desc id="desc">Eight complete UTC dates per launch. ${esc(summary.cohorts.map(c=>c.name+': '+c.start.slice(0,10)).join('; '))}. Lines connect observed daily counts, not cumulative scores or sentiment. Exact values are also in the accompanying table.</desc><rect width="${width}" height="${height}" fill="#fff"/><g font-family="Arial, Noto Sans SC, sans-serif" fill="#253645"><text x="${x0}" y="25" font-size="17" font-weight="700">${title}</text>`;
  for(let v=0;v<=max;v+=step)s+=`<path d="M ${x0} ${y(v)} H ${x1}" stroke="#dce2e8"/><text x="${x0-14}" y="${y(v)+4}" text-anchor="end" font-size="12">${v}</text>`;
  for(let d=0;d<8;d++)s+=`<text x="${x(d)}" y="${y1+23}" text-anchor="middle" font-size="13">D${d}</text>`;
  const styles={jev:{color:'#007f7a',dash:'',mark:'circle'},qwen3:{color:'#6252ad',dash:'3 5',mark:'square'},gptoss:{color:'#b95300',dash:'9 5',mark:'triangle'},deepseekr1:{color:'#ba2d56',dash:'12 4 2 4',mark:'diamond'},gpt6:{color:'#1769c2',dash:'',mark:'square'},opus5:{color:'#5b6830',dash:'5 4',mark:'cross'}};
  function marker(st,cx,cy){if(st.mark==='circle')return `<circle cx="${cx}" cy="${cy}" r="4" fill="${st.color}"/>`;if(st.mark==='square')return `<rect x="${cx-4}" y="${cy-4}" width="8" height="8" fill="${st.color}"/>`;if(st.mark==='diamond')return `<path d="M${cx} ${cy-5}l5 5-5 5-5-5z" fill="${st.color}"/>`;if(st.mark==='cross')return `<path d="M${cx-4} ${cy-4}l8 8m0-8l-8 8" stroke="${st.color}" stroke-width="2"/>`;return `<path d="M${cx} ${cy-5}l5 9h-10z" fill="${st.color}"/>`;}
  summary.cohorts.forEach((c,i)=>{
    const st=styles[c.id],points=c.daily.map(r=>`${x(r.day).toFixed(2)},${y(r[key]).toFixed(2)}`).join(' ');
    s+=`<polyline points="${points}" fill="none" stroke="${st.color}" stroke-width="3" stroke-dasharray="${st.dash}"/>`;
    for(const r of c.daily)s+=marker(st,x(r.day),y(r[key]));
    const cols=mobile?2:3,lx=mobile?25+(i%cols)*235:110+(i%cols)*280,ly=345+Math.floor(i/cols)*27;
    s+=`<path d="M${lx} ${ly}h35" stroke="${st.color}" stroke-width="3" stroke-dasharray="${st.dash}"/>`+marker(st,lx+17,ly)+`<text x="${lx+43}" y="${ly+5}" font-size="14">${esc(c.name)}</text>`;
  });
  s+=mobile?'<text x="240" y="281" text-anchor="middle" font-size="15">发布后日数 / Days since launch</text><text x="240" y="308" text-anchor="middle" font-size="12">8 UTC dates · HN sample · '+esc(summary.collected_at.slice(0,10))+'</text>':'<text x="476" y="321" text-anchor="middle" font-size="13">发布后日数（UTC 日期） / Days since launch (UTC dates)</text><text x="62" y="413" font-size="11" fill="#596a78">Source: HN Algolia · 8-day windows · Collected '+esc(summary.collected_at.slice(0,10))+' · Not the whole web or market demand</text>';
  return s+'</g></svg>\n';
}
if(require.main===module){
  try{const dir=process.argv[2]||path.resolve(__dirname,'../posts/jev-system-one-research/examples/demand');const input=JSON.parse(fs.readFileSync(path.join(dir,'observations.json'),'utf8')),summary=summarize(input);fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify(summary,null,2)+'\n');for(const key of ['posts','comments'])for(const mobile of [false,true])fs.writeFileSync(path.join(dir,key+(mobile?'-mobile':'')+'.svg'),svg(summary,key,mobile));console.log('Recomputed HN daily series and charts from local snapshot; zero network/inference.');}
  catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={summarize,svg};
