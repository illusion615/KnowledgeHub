'use strict';
// Private local evidence, never served by the website or uploaded. Archiving
// observes finished attempts; it must not keep a disconnected match alive.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const report = require('../posts/jev-system-one-research/arena-report');
const DEFAULT_DIRECTORY = path.join(os.homedir(), '.cache/study-room/jev-evaluation/matches');
function saveDiagnostic(record, directory = DEFAULT_DIRECTORY) {
  const diagnostic = report.create(record, {source:'local-server-record'});
  if (!/^[a-f0-9-]{36}$/.test(record.id)) throw new Error('invalid_match_id');
  fs.mkdirSync(directory,{recursive:true,mode:0o700});
  const stat=fs.lstatSync(directory);
  if(!stat.isDirectory()||stat.isSymbolicLink()||(stat.mode&0o077)||typeof process.getuid==='function'&&stat.uid!==process.getuid())throw new Error('unsafe_record_directory');
  const file=path.join(directory,record.id+'.json');
  // Exclusive creation: do not overwrite old evidence, even on a repeated save.
  fs.writeFileSync(file,JSON.stringify(diagnostic,null,2)+'\n',{flag:'wx',mode:0o600});
  return file;
}
module.exports={saveDiagnostic,DEFAULT_DIRECTORY};
