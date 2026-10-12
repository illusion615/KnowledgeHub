'use strict';
// Source-level helper for material moved into the runtime popup library.
function block(html,id){const escaped=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),m=html.match(new RegExp(`<(?<tag>section|div|details|template|article) id="${escaped}"[^>]*>`));if(!m)throw Error('missing block '+id);const tag=m.groups.tag,re=new RegExp(`<\\/?${tag}\\b[^>]*>`,'g');re.lastIndex=m.index;let depth=0,t;while((t=re.exec(html))){depth+=t[0].startsWith('</')?-1:1;if(!depth)return {start:m.index,end:re.lastIndex,text:html.slice(m.index,re.lastIndex)};}throw Error('unclosed '+id);}
function readingSource(html){const ids=[...html.matchAll(/<div id="([^"]+)" class="popup-source"/g)].map(m=>m[1]),ranges=ids.map(id=>block(html,id)).sort((a,b)=>b.start-a.start);for(const r of ranges)html=html.slice(0,r.start)+html.slice(r.end);return html;}
module.exports={block,readingSource};
