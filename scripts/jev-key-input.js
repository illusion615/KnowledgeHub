'use strict';
// Inspect only structural mistakes. Never return key text, length, fragments, or hashes.
function credentialIssue(key) {
  if (typeof key !== 'string' || !key.trim()) return 'key_missing';
  if (/^((?:export|read|node|npm|pnpm)\s|AI_GATEWAY_API_KEY\s*=|TYPESAFE_API_KEY\s*=|Bearer\s)/i.test(key.trim())) return 'key_command';
  if (/^["']|["']$/.test(key.trim())) return 'key_quotes';
  if (/\s/.test(key)) return 'key_whitespace';
  if (['your_api_key_here', 'your_api_key', 'your-key-here', 'api_key', 'ai_gateway_api_key', 'typesafe_api_key', 'sk-xxxxxx', '<api_key>'].indexOf(key.toLowerCase()) >= 0) return 'key_placeholder';
  return null;
}
function promptSecret(label, input, output) {
  input = input || process.stdin; output = output || process.stdout;
  if (!input.isTTY || !output.isTTY) return Promise.reject(new Error('interactive_terminal_required'));
  return new Promise(function (resolve, reject) {
    var muted = new (require('node:stream').Writable)({ write: function (_, encoding, done) { done(); } });
    var readline = require('node:readline');
    var settled = false;
    var rl = readline.createInterface({ input: input, output: muted, terminal: true, historySize: 0 });
    output.write(label + ' (hidden input; paste the key only, then Enter): ');
    rl.once('SIGINT', function () {
      settled = true; rl.close(); output.write('\n'); reject(new Error('cancelled'));
    });
    rl.once('close', function () { if (!settled) reject(new Error('input_closed')); });
    rl.question('', function (answer) {
      settled = true; rl.close(); output.write('\n');
      // Clipboard whitespace is not part of an API key. No other transformation is made.
      resolve(answer.trim());
    });
  });
}
module.exports = { credentialIssue: credentialIssue, promptSecret: promptSecret };
