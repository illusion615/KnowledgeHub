/**
 * CORS reverse proxy for local TTS server (mlx-audio / MOSS-TTS-Nano).
 *
 * Listens on port 18084, forwards all requests to the TTS server on port 8000,
 * and adds CORS headers so the Study Room pages can call it from any origin.
 *
 * Usage:
 *   1. Start mlx-audio server:  mlx_audio.server --port 8000
 *   2. Start this proxy:        node scripts/moss-tts-cors-proxy.js
 *   3. The narration settings in Study Room default to http://localhost:18084
 *
 * Zero npm dependencies — uses only Node.js built-in http module.
 */

var http = require('http');

var PROXY_PORT = parseInt(process.env.PROXY_PORT, 10) || 18084;
var TARGET_HOST = process.env.TARGET_HOST || 'localhost';
var TARGET_PORT = parseInt(process.env.TARGET_PORT, 10) || 8000;
var TARGET_API_KEY = process.env.TARGET_API_KEY || '';

function applyCorsHeaders(headers) {
  headers['access-control-allow-origin'] = '*';
  headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  headers['access-control-allow-headers'] = 'Content-Type, Authorization';
}

var server = http.createServer(function (clientReq, clientRes) {
  // Handle CORS preflight
  if (clientReq.method === 'OPTIONS') {
    var preflightHeaders = {
      'access-control-max-age': '86400'
    };
    applyCorsHeaders(preflightHeaders);
    clientRes.writeHead(204, preflightHeaders);
    clientRes.end();
    return;
  }

  var options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: clientReq.url,
    method: clientReq.method,
    headers: clientReq.headers
  };
  // Remove host header so it matches the target
  delete options.headers.host;
  // If configured, inject Bearer auth for local servers that require API key.
  if (TARGET_API_KEY && !options.headers.authorization) {
    options.headers.authorization = 'Bearer ' + TARGET_API_KEY;
  }

  var proxyReq = http.request(options, function (proxyRes) {
    // Copy response headers and add CORS
    var headers = {};
    Object.keys(proxyRes.headers).forEach(function (key) {
      // Avoid duplicate CORS headers when upstream already sets them.
      if (key.toLowerCase().indexOf('access-control-allow-') === 0) {
        return;
      }
      headers[key] = proxyRes.headers[key];
    });
    applyCorsHeaders(headers);

    clientRes.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(clientRes, { end: true });
  });

  proxyReq.on('error', function (err) {
    console.error('[proxy] Target connection failed:', err.message);
    var errorHeaders = {
      'content-type': 'application/json'
    };
    applyCorsHeaders(errorHeaders);
    clientRes.writeHead(502, errorHeaders);
    clientRes.end(JSON.stringify({
      error: 'Cannot reach MOSS-TTS-Nano at ' + TARGET_HOST + ':' + TARGET_PORT +
             '. Is "moss-tts-nano serve" running?'
    }));
  });

  clientReq.pipe(proxyReq, { end: true });
});

server.listen(PROXY_PORT, function () {
  console.log('');
  console.log('  Local TTS CORS Proxy');
  console.log('  ====================');
  console.log('  Proxy:  http://localhost:' + PROXY_PORT);
  console.log('  Target: http://' + TARGET_HOST + ':' + TARGET_PORT);
  if (TARGET_API_KEY) {
    console.log('  Auth:   Bearer token injection enabled');
  }
  console.log('');
  console.log('  Start TTS server first:  mlx_audio.server --port ' + TARGET_PORT);
  console.log('  Study Room will connect to http://localhost:' + PROXY_PORT);
  console.log('');
});
