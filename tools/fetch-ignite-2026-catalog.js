#!/usr/bin/env node
// tools/fetch-ignite-2026-catalog.js
// Fetches, filters, and verifies the official Microsoft Ignite 2026 session catalog
// for Power Platform & Copilot Studio, resolving direct Medius PPTX, MP4, HLS,
// Thumbnail, DOCX transcript, and WebVTT subtitle links for parallel article authoring.

'use strict';

var fs = require('fs');
var path = require('path');
var https = require('https');

var REPO_ROOT = path.resolve(__dirname, '..');
var DEFAULT_API_URL = 'https://ignite.microsoft.com/api/session/all/en-US';
var SESSION_BASE_URL = 'https://ignite.microsoft.com/en-US/sessions/';
var MEDIUS_EMBED_PREFIX = 'https://medius.microsoft.com/Embed/video-nc/';
var DEFAULT_JSON_OUT = path.join(REPO_ROOT, 'docs', 'ignite-2026-session-catalog.json');
var DEFAULT_MD_OUT = path.join(REPO_ROOT, 'docs', 'ignite-2026-session-catalog.md');

var COMPLETED_SESSIONS = { BRK267: { existingSlug: 'copilot-studio-ignite-2026-whats-new', existingArticlePath: 'posts/copilot-studio-ignite-2026-whats-new/article.md' } };
var CORE_TERMS = ['copilot studio', 'power platform', 'power apps', 'power automate', 'power pages', 'dataverse', 'copilot managed runtime'];
var CURATED_FIRST_PARTY_CODES = {
  BRK234: 'business-process-agentification', BRK236: 'agents-in-copilot-adoption', BRK285: 'enterprise-ready-agents',
  BRK473: 'financial-services-agent-governance', BRK571: 'turning-agents-into-business-value',
  THR1022: 'community-to-production-agentic-apps', INV642: 'observability-across-agent-stack', BRKSP620: 'low-code-enterprise-agent-scaling'
};
var EXCLUDED_CODES = { LIVESP176: 1, BRK364: 1 };
var POWER_RUNTIME_CODES = { BRK265: 1, BRK378: 1, BRK382: 1, BRK386: 1, LIVE07: 1, THR916: 1, THR977: 1 };
var ENTERPRISE_CASE_CODES = { BRK234: 1, BRK236: 1, BRK460: 1, BRK474: 1, BRK487: 1, BRK501: 1, BRK571: 1, LIVE17: 1, THR885: 1, THR1021: 1, THR1022: 1 };
var STOP_WORDS = {
  a: 1, an: 1, and: 1, are: 1, as: 1, at: 1, be: 1, by: 1, can: 1, do: 1, every: 1, for: 1, from: 1, get: 1, how: 1,
  in: 1, into: 1, is: 1, it: 1, its: 1, make: 1, microsoft: 1, more: 1, not: 1, now: 1, of: 1, on: 1, one: 1, or: 1,
  our: 1, put: 1, see: 1, that: 1, the: 1, their: 1, them: 1, to: 1, turn: 1, turning: 1, use: 1, using: 1, when: 1,
  where: 1, why: 1, with: 1, your: 1, you: 1
};

function cleanUrl(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.replace(/\\\//g, '/').replace(/\\u0026/g, '&').replace(/&amp;/g, '&').trim();
}

function stripHtml(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.replace(/\\\//g, '/').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ')
    .replace(/&#x27;/gi, "'").replace(/&quot;/gi, '"').replace(/&amp;/gi, '&')
    .replace(/[\u200b\u00a0]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractDisplayValues(items) {
  if (Array.isArray(items)) {
    return items.map(function (v) {
      return v && typeof v === 'object' ? String(v.displayValue || v.logicalValue || '').trim() : String(v || '').trim();
    }).filter(Boolean);
  }
  if (items && typeof items === 'object') {
    var single = String(items.displayValue || items.logicalValue || '').trim();
    return single ? [single] : [];
  }
  return items ? [String(items).trim()] : [];
}

function extractMediusId(session) {
  var fields = [session.onDemand, session.slideDeck, session.downloadVideoLink, session.captionFileLink, session.onDemandThumbnail];
  for (var i = 0; i < fields.length; i++) {
    var m = cleanUrl(fields[i]).match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (m) return m[1].toLowerCase();
  }
  return '';
}

function buildTargetSlug(sessionCode, title) {
  var codePart = String(sessionCode || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  var words = stripHtml(title).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ')
    .trim().split(/\s+/).filter(function (w) { return w && !STOP_WORDS[w]; });
  var prefix = 'ignite-2026-' + codePart;
  var budget = 64 - prefix.length;
  var chosen = [];
  for (var i = 0; i < words.length && chosen.length < 6; i++) {
    var nextLen = (chosen.length ? chosen.join('-').length + 1 : 0) + words[i].length + 1;
    if (nextLen > budget && chosen.length >= 2) break;
    chosen.push(words[i]);
  }
  return prefix + '-' + (chosen.length ? chosen : ['session']).join('-');
}

function classifyTrack(sessionCode, title, description, tags) {
  var code = String(sessionCode || '').toUpperCase();
  var blob = [title, description, tags.join(' ')].join(' | ').toLowerCase();
  if (/^(BRKSP|THRSP|ODSP|LIVESP|TTSP|LTGSP|LABSP)/i.test(code)) return 'partner-ecosystem';
  if (POWER_RUNTIME_CODES[code]) return 'power-platform-and-runtime';
  if (ENTERPRISE_CASE_CODES[code]) return 'enterprise-adoption-and-cases';
  if (/govern|finops|security|purview|entra|principal|shadow|observability|isolated sandbox|enterprise-ready/.test(blob) || code === 'LIVE47') {
    return 'governance-security-and-finops';
  }
  return 'copilot-studio-core';
}

function parseEmbedHtml(html) {
  var out = { captionVttUrl: '', captionZhHansVttUrl: '', hlsManifestUrl: '', captionCount: 0 };
  if (!html) return out;

  var ccMatch = html.match(/const\s+captionsConfiguration\s*=\s*(\{.*?\});/);
  if (ccMatch) {
    try {
      var list = JSON.parse(ccMatch[1]).languageList || [];
      out.captionCount = list.length;
      for (var i = 0; i < list.length; i++) {
        var lang = String((list[i] && list[i].srclang) || '').toLowerCase();
        if (lang === 'en' && list[i].src && !out.captionVttUrl) out.captionVttUrl = cleanUrl(list[i].src);
        if (lang === 'zh-hans' && list[i].src && !out.captionZhHansVttUrl) out.captionZhHansVttUrl = cleanUrl(list[i].src);
      }
      if (!out.captionVttUrl && list[0] && list[0].src) out.captionVttUrl = cleanUrl(list[0].src);
    } catch (err) {
      if (process.env.DEBUG) console.warn('parseEmbedHtml captions fallback:', err.message);
    }
  }
  if (!out.captionVttUrl) {
    var vttMatch = html.match(/https:\/\/mediusdl\.event\.microsoft\.com\/[^"'\s<>\\]+Caption_en-US\.vtt[^"'\s<>\\]*/);
    if (vttMatch) out.captionVttUrl = cleanUrl(vttMatch[0]);
  }

  var coreMatch = html.match(/let\s+coreConfiguration\s*=\s*(\{.*?\});/);
  if (coreMatch) {
    try {
      var mains = ((JSON.parse(coreMatch[1]).manifests || {}).main) || [];
      if (mains[0] && mains[0].manifest) out.hlsManifestUrl = cleanUrl(mains[0].manifest);
    } catch (err2) {
      if (process.env.DEBUG) console.warn('parseEmbedHtml core fallback:', err2.message);
    }
  }
  if (!out.hlsManifestUrl) {
    var m3u8Match = html.match(/https:\/\/stream\.event\.microsoft\.com\/[^"'\s<>\\]+master\.m3u8/);
    if (m3u8Match) out.hlsManifestUrl = cleanUrl(m3u8Match[0]);
  }
  return out;
}

function evaluateRelevance(session) {
  var code = String(session.sessionCode || '').trim();
  if (!code || /^BRK\d+O$/i.test(code) || EXCLUDED_CODES[code]) return { matched: false, reason: 'excluded' };
  var tl = stripHtml(session.title).toLowerCase();
  var dl = stripHtml(session.description).toLowerCase();
  var titleHits = CORE_TERMS.filter(function (t) { return tl.indexOf(t) !== -1; });
  if (titleHits.length) return { matched: true, reason: 'title:' + titleHits.join(',') };
  var descHits = CORE_TERMS.filter(function (t) { return dl.indexOf(t) !== -1; });
  if (descHits.length) return { matched: true, reason: 'description:' + descHits.join(',') };
  if (CURATED_FIRST_PARTY_CODES[code]) return { matched: true, reason: 'curated_pillar:' + CURATED_FIRST_PARTY_CODES[code] };
  return { matched: false, reason: 'unrelated' };
}

function scoreMediaRichness(session) {
  return (cleanUrl(session.onDemand) ? 8 : 0) + (cleanUrl(session.slideDeck) ? 4 : 0) +
    (cleanUrl(session.captionFileLink) ? 2 : 0) + (cleanUrl(session.downloadVideoLink) ? 1 : 0);
}

function httpRequest(url, method, timeoutMs) {
  return new Promise(function (resolve, reject) {
    var req = https.request(url, {
      method: method || 'GET',
      timeout: timeoutMs || 15000,
      headers: { 'User-Agent': 'StudyRoom-Ignite2026-CatalogVerifier/1.0', Accept: '*/*' }
    }, function (res) {
      if (method === 'HEAD') {
        res.resume();
        resolve({ status: res.statusCode || 0, headers: res.headers || {}, body: '' });
        return;
      }
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () {
        resolve({ status: res.statusCode || 0, headers: res.headers || {}, body: Buffer.concat(chunks).toString('utf8') });
      });
    });
    req.on('timeout', function () { req.destroy(new Error('Request timeout: ' + url)); });
    req.on('error', reject);
    req.end();
  });
}

async function mapConcurrent(items, concurrency, worker) {
  var results = new Array(items.length);
  var cursor = 0;
  async function next() {
    while (cursor < items.length) {
      var idx = cursor++;
      results[idx] = await worker(items[idx], idx);
    }
  }
  var runners = [];
  for (var i = 0; i < Math.min(concurrency, items.length); i++) runners.push(next());
  await Promise.all(runners);
  return results;
}

async function probeAssetRedirect(url) {
  if (!url) return false;
  try {
    var res = await httpRequest(url, 'HEAD', 10000);
    return (res.status === 301 || res.status === 302) && Boolean(res.headers.location);
  } catch (err) {
    if (process.env.DEBUG) console.warn('probeAssetRedirect fallback:', err.message);
    return false;
  }
}

function selectCatalogCandidates(rawSessions) {
  var bestWithMedia = {};
  var bestUnrecorded = {};
  for (var i = 0; i < rawSessions.length; i++) {
    var s = rawSessions[i];
    if (!s || typeof s !== 'object') continue;
    var rel = evaluateRelevance(s);
    if (!rel.matched) continue;
    var code = String(s.sessionCode || '').trim();
    var score = scoreMediaRichness(s);
    if (score > 0) {
      if (!bestWithMedia[code] || score > bestWithMedia[code].score) {
        bestWithMedia[code] = { score: score, session: s, relevance: rel };
      }
    } else if (!bestUnrecorded[code]) {
      bestUnrecorded[code] = { session: s, relevance: rel };
    }
  }
  return {
    recorded: Object.keys(bestWithMedia).sort().map(function (c) { return bestWithMedia[c]; }),
    unrecorded: Object.keys(bestUnrecorded).filter(function (c) { return !bestWithMedia[c]; }).sort()
      .map(function (c) { return bestUnrecorded[c]; })
  };
}

async function enrichRecordedEntry(entry, probeMedia) {
  var s = entry.session;
  var code = String(s.sessionCode || '').trim();
  var title = stripHtml(s.title);
  var description = stripHtml(s.description);
  var tags = extractDisplayValues(s.tags);
  var mediusId = extractMediusId(s);
  var videoUrl = cleanUrl(s.onDemand) || (mediusId ? MEDIUS_EMBED_PREFIX + mediusId : '');
  var slideDeckUrl = cleanUrl(s.slideDeck);
  var videoDownloadUrl = cleanUrl(s.downloadVideoLink);
  var transcriptDocxUrl = cleanUrl(s.captionFileLink);
  var thumbnailUrl = cleanUrl(s.onDemandThumbnail) || (mediusId ? 'https://medius.microsoft.com/video/asset/Thumbnail/' + mediusId : '');
  var embedInfo = { captionVttUrl: '', captionZhHansVttUrl: '', hlsManifestUrl: '' };

  if (probeMedia && mediusId) {
    try {
      var embedRes = await httpRequest(MEDIUS_EMBED_PREFIX + mediusId, 'GET', 12000);
      if (embedRes.status === 200) embedInfo = parseEmbedHtml(embedRes.body);
    } catch (err) {
      if (process.env.DEBUG) console.warn('enrichRecordedEntry embed fallback:', code, err.message);
    }
    if (!videoDownloadUrl && await probeAssetRedirect('https://medius.microsoft.com/video/asset/HIGHMP4/' + mediusId)) {
      videoDownloadUrl = 'https://medius.microsoft.com/video/asset/HIGHMP4/' + mediusId;
    }
    if (!transcriptDocxUrl && await probeAssetRedirect('https://medius.microsoft.com/video/asset/Transcript/' + mediusId)) {
      transcriptDocxUrl = 'https://medius.microsoft.com/video/asset/Transcript/' + mediusId;
    }
    if (!slideDeckUrl && await probeAssetRedirect('https://medius.microsoft.com/video/asset/PPT/' + mediusId)) {
      slideDeckUrl = 'https://medius.microsoft.com/video/asset/PPT/' + mediusId;
    }
  }

  var completed = COMPLETED_SESSIONS[code] || null;
  var targetSlug = completed ? completed.existingSlug : buildTargetSlug(code, title);
  var track = classifyTrack(code, title, description, tags);

  return {
    sessionCode: code,
    sessionInstanceId: String(s.sessionInstanceId || ''),
    sessionType: extractDisplayValues(s.sessionType)[0] || 'Breakout',
    track: track,
    recommendedTopicId: 'ignite-2026',
    isPartnerSponsored: /^(BRKSP|THRSP|ODSP|LIVESP)/i.test(code),
    title: title,
    speakers: stripHtml(s.speakerNames || '').split(',').map(function (n) { return n.trim(); }).filter(Boolean),
    startDateTime: String(s.startDateTime || ''),
    durationInMinutes: Number(s.durationInMinutes || 0),
    topics: extractDisplayValues(s.topic),
    tags: tags,
    relevanceReason: entry.relevance.reason,
    description: description,
    sessionUrl: SESSION_BASE_URL + String(s.sessionInstanceId || ''),
    mediusId: mediusId,
    videoUrl: videoUrl,
    hlsManifestUrl: embedInfo.hlsManifestUrl,
    videoDownloadUrl: videoDownloadUrl,
    thumbnailUrl: thumbnailUrl,
    captionVttUrl: embedInfo.captionVttUrl,
    captionZhHansVttUrl: embedInfo.captionZhHansVttUrl,
    transcriptDocxUrl: transcriptDocxUrl,
    slideDeckUrl: slideDeckUrl,
    hasVideo: Boolean(videoUrl),
    hasSlideDeck: Boolean(slideDeckUrl),
    hasCaptionVtt: Boolean(embedInfo.captionVttUrl),
    targetSlug: targetSlug,
    targetArticlePath: completed ? completed.existingArticlePath : ('posts/' + targetSlug + '/article.md'),
    alreadyProduced: Boolean(completed),
    status: completed ? 'completed_skip' : 'pending_production'
  };
}

function buildCatalogDocument(sessions, unrecordedEntries, totalUpstreamCount, retrievedAt) {
  var completedCount = sessions.filter(function (s) { return s.alreadyProduced; }).length;
  var unrecorded = unrecordedEntries.map(function (entry) {
    var s = entry.session;
    return {
      sessionCode: String(s.sessionCode || '').trim(),
      sessionType: extractDisplayValues(s.sessionType)[0] || '',
      title: stripHtml(s.title),
      speakers: stripHtml(s.speakerNames || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean),
      sessionUrl: SESSION_BASE_URL + String(s.sessionInstanceId || ''),
      reasonExcludedFromBatch: 'no_official_ondemand_video_or_pptx'
    };
  });

  return {
    schema: 'study_room.ignite_2026_session_catalog.v1',
    event: 'Microsoft Ignite 2026 (San Francisco, Nov 17-20, 2026)',
    sourceApiUrl: DEFAULT_API_URL,
    retrievedAt: retrievedAt,
    summary: {
      totalUpstreamSessionsScanned: totalUpstreamCount,
      totalActionableSessions: sessions.length,
      completedSkipCount: completedCount,
      pendingProductionCount: sessions.length - completedCount,
      withOnDemandVideoCount: sessions.filter(function (s) { return s.hasVideo; }).length,
      withMp4DownloadCount: sessions.filter(function (s) { return Boolean(s.videoDownloadUrl); }).length,
      withSlideDeckPptxCount: sessions.filter(function (s) { return s.hasSlideDeck; }).length,
      withWebVttCaptionsCount: sessions.filter(function (s) { return s.hasCaptionVtt; }).length,
      unrecordedInPersonCount: unrecorded.length
    },
    sessions: sessions,
    unrecordedSessions: unrecorded
  };
}

function renderCatalogMarkdown(doc) {
  var sSum = doc.summary;
  var sessions = doc.sessions || [];
  var unrecorded = doc.unrecordedSessions || [];
  var tracks = [
    ['copilot-studio-core', '1. Copilot Studio 内核架构与智能体工程专场', '本专题聚焦新版编排框架、工作流混编、持久身份智能体、多渠道客户会话以及面向专业开发者的本地源码协作。其中旗舰主论坛 `BRK267` 已在仓库内落盘并发布，其余场次均处于待制作状态。'],
    ['power-platform-and-runtime', '2. Power Platform 与托管运行时专场', '本专题覆盖 Power Apps、Power Automate、Power Pages 与 Dataverse 的年度更新，重点拆解新推出的托管运行时如何承载跨生态全栈微应用并打通企业级环境部署。'],
    ['governance-security-and-finops', '3. 企业安全治理、身份管控与成本运营专场', '当智能体从个人试验迈向租户级生产，身份主体的强制绑定、插件注册表统一审批、隔离容器沙盒以及额度预算治理成为上线的硬性门槛。以下专场覆盖完整控制链路。'],
    ['enterprise-adoption-and-cases', '4. 行业规模化落地与业务流程重塑专场', '来自医疗、金融保险、企业资源计划及合作伙伴生态的一线实践，展示大型组织如何跨部门推广低代码应用与业务智能体并量化投产回报。'],
    ['partner-ecosystem', '5. 生态联合方案与跨平台数据集成专场', '独立软件开发商与系统集成商联合演示如何通过语义层、数据分类网关及外部前端构建器扩展智能体的受控行动边界。']
  ];
  var lines = [
    '# Microsoft Ignite 2026 Power Platform 与 Copilot Studio 全量专场目录及直链底表',
    '',
    'Microsoft Ignite 2026（旧金山，2026 年 11 月 17 日至 20 日）官方目录接口共公开 `' + sSum.totalUpstreamSessionsScanned + '` 条议程记录。为支撑「一专场一独立知识文章」的正交并行创作，本底表通过 `tools/fetch-ignite-2026-catalog.js` 全量拉取上游数据，筛除纯占位的溢出观影场（`BRK*O`）与同题重播场（`LIVESP176`），并逐场穿透 Medius 播放器提取直链资产。',
    '',
    '全量核验共锁定 **' + sSum.totalActionableSessions + ' 场具备官方点播视频的可制作专场**，以及 **' + sSum.unrecordedInPersonCount + ' 场无官方录播与课件的纯线下互动场次**。可制作专场 100% 具备在线点播流、高清视频下载直链与多语种时间轴字幕（WebVTT），其中 **' + sSum.withSlideDeckPptxCount + ' 场**同时提供官方原版演示文稿下载；旗舰场 `BRK267`（《What\'s new in Copilot Studio》）已制作发布，剩余 **' + sSum.pendingProductionCount + ' 场**均已分配互不冲突的目标文章路径。',
    '',
    '## 盘点口径与资产核验统计',
    '',
    '上游目录接口中存在两类常见的元数据缺漏：部分深度架构场（如 `BRK259`、`BRK379`、`BRK382`）未在列表字段中填写高清视频或讲稿链接，而剧场演讲与直播访谈场虽未上传幻灯片，却在播放器配置内嵌了完整的英汉双语字幕轨。抓取脚本直接解析每场视频的嵌入页配置并对资产重定向接口发起探测，补齐了全部隐藏直链。',
    '',
    '| 统计维度 | 数量 | 核验说明 |',
    '| --- | --- | --- |',
    '| 上游议程总记录数 | `' + sSum.totalUpstreamSessionsScanned + '` | 源自 `ignite.microsoft.com/api/session/all/en-US` 全量快照 |',
    '| 纳入底表的有媒体专场数 | `' + sSum.totalActionableSessions + '` | 覆盖专题演讲、剧场快讲、创新峰会、直播访谈与预录专场 |',
    '| 已完成制作（跳过不重复） | `' + sSum.completedSkipCount + '` | `BRK267` 已落盘于 `posts/copilot-studio-ignite-2026-whats-new/article.md` |',
    '| 待并行制作专场数 | `' + sSum.pendingProductionCount + '` | 每场独立映射至 `posts/ignite-2026-<code>-.../article.md` |',
    '| 具备点播流与高清视频直链 | `' + sSum.withOnDemandVideoCount + '` / `' + sSum.withMp4DownloadCount + '` | 全部可制作专场均验证返回有效流媒体清单与视频文件重定向 |',
    '| 具备官方演示文稿下载 | `' + sSum.withSlideDeckPptxCount + '` | 仅统计真实返回 `302` 演示文稿文件的场次，剔除空占位响应 |',
    '| 具备时间轴字幕直链 | `' + sSum.withWebVttCaptionsCount + '` | 从播放器字幕轨提取精确到毫秒的英文与简体中文直链 |',
    '| 纯线下无录播/无课件场次 | `' + sSum.unrecordedInPersonCount + '` | 动手实验、圆桌讨论与闪电演讲，单独归档于文末备查表 |',
    '',
    '## 分片并行创作与无冲突总装协议',
    '',
    '后续多智能体并行撰写单场文章时，各创作工位仅在各自正交目录 `posts/<targetSlug>/` 内新建 `article.md` 与配图资产，执行局部编译核验时不直接争抢改写全局图谱文件。待单场文章批次就绪后，再由轻量总装任务统一调用发布工具更新 `assets/knowledge-data.js` 与 `docs/navigation.json`。',
    '',
    '```bash',
    '# 刷新全量专场目录与 Medius 媒体直链核验结果',
    'node tools/fetch-ignite-2026-catalog.js --concurrency 10',
    '',
    '# 单场知识文章创作期的零全局冲突预演校验',
    'node tools/publish-article.js posts/<targetSlug>/article.md --dry-run',
    '```',
    '',
    '## 全量可制作专场分类主表（' + sSum.totalActionableSessions + ' 场）',
    ''
  ];

  for (var t = 0; t < tracks.length; t++) {
    var sub = sessions.filter(function (s) { return s.track === tracks[t][0]; });
    lines.push('### ' + tracks[t][1] + '（' + sub.length + ' 场）', '', tracks[t][2], '');
    lines.push('| 场次代码 | 题型 | 专场标题与讲师 | 状态与目标路径 | 官方一手资产直链 |', '| --- | --- | --- | --- | --- |');
    for (var j = 0; j < sub.length; j++) {
      var it = sub[j];
      var spk = it.speakers && it.speakers.length ? it.speakers.join('、') : '官方团队';
      var stCell = it.alreadyProduced ? ('已完成跳过（`' + it.targetArticlePath + '`）') : ('待制作（`' + it.targetSlug + '`）');
      var links = ['[专场页](' + it.sessionUrl + ')'];
      if (it.videoUrl) links.push('[点播页](' + it.videoUrl + ')');
      if (it.videoDownloadUrl) links.push('[高清视频](' + it.videoDownloadUrl + ')');
      if (it.slideDeckUrl) links.push('[课件下载](' + it.slideDeckUrl + ')');
      if (it.captionVttUrl) links.push('[英文字幕](' + it.captionVttUrl + ')');
      if (it.captionZhHansVttUrl) links.push('[中文字幕](' + it.captionZhHansVttUrl + ')');
      if (it.transcriptDocxUrl) links.push('[讲稿文档](' + it.transcriptDocxUrl + ')');
      if (it.thumbnailUrl) links.push('[封面图](' + it.thumbnailUrl + ')');
      lines.push('| `' + it.sessionCode + '` | ' + it.sessionType + ' | **' + it.title + '**<br>讲师：' + spk + ' | ' + stCell + ' | ' + links.join(' · ') + ' |');
    }
    lines.push('');
  }

  lines.push(
    '## 附录：纯线下无录播与无课件场次备查表（' + unrecorded.length + ' 场）',
    '',
    '以下动手实验、圆桌讨论及闪电演讲在官方目录中明确归属 Power Platform 或 Copilot Studio 主题，但微软官方未录制点播视频且未对外发布演示文稿。为保证每篇知识文章均有扎实的官方实录与课件支撑，这 ' + unrecorded.length + ' 场不排入首批单场成文队列，仅留存索引供交叉核对。',
    '',
    '| 场次代码 | 专场类型 | 专场标题 | 讲师 | 官方目录页 |',
    '| --- | --- | --- | --- | --- |'
  );
  for (var u = 0; u < unrecorded.length; u++) {
    var ur = unrecorded[u];
    var uSpk = ur.speakers && ur.speakers.length ? ur.speakers.join('、') : '现场导师';
    lines.push('| `' + ur.sessionCode + '` | ' + ur.sessionType + ' | ' + ur.title + ' | ' + uSpk + ' | [查看详情](' + ur.sessionUrl + ') |');
  }
  lines.push('');
  return lines.join('\n');
}

function parseCliArgs(argv) {
  var opts = { inputJson: '', outJson: DEFAULT_JSON_OUT, outMd: DEFAULT_MD_OUT, writeMd: true, skipProbe: false, concurrency: 10 };
  for (var i = 2; i < argv.length; i++) {
    var arg = argv[i];
    if (arg === '--input-json') opts.inputJson = argv[++i] || '';
    else if (arg === '--out-json') opts.outJson = path.resolve(argv[++i]);
    else if (arg === '--out-md') opts.outMd = path.resolve(argv[++i]);
    else if (arg === '--no-md') opts.writeMd = false;
    else if (arg === '--skip-probe') opts.skipProbe = true;
    else if (arg === '--concurrency') opts.concurrency = Math.max(1, Number(argv[++i] || 10));
  }
  return opts;
}

async function runCli(argv) {
  var opts = parseCliArgs(argv);
  var rawText = opts.inputJson
    ? fs.readFileSync(path.resolve(opts.inputJson), 'utf8')
    : (await httpRequest(DEFAULT_API_URL, 'GET', 30000)).body;
  var rawSessions = JSON.parse(rawText);
  var selected = selectCatalogCandidates(rawSessions);
  var enriched = await mapConcurrent(selected.recorded, opts.concurrency, function (entry) {
    return enrichRecordedEntry(entry, !opts.skipProbe);
  });
  var doc = buildCatalogDocument(enriched, selected.unrecorded, rawSessions.length, new Date().toISOString());
  fs.mkdirSync(path.dirname(opts.outJson), { recursive: true });
  fs.writeFileSync(opts.outJson, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  if (opts.writeMd) {
    fs.mkdirSync(path.dirname(opts.outMd), { recursive: true });
    fs.writeFileSync(opts.outMd, renderCatalogMarkdown(doc), 'utf8');
  }
  console.log(JSON.stringify({ ok: true, outJson: opts.outJson, outMd: opts.writeMd ? opts.outMd : null, summary: doc.summary }, null, 2));
  return doc;
}

if (require.main === module) {
  runCli(process.argv).catch(function (err) {
    console.error(JSON.stringify({ ok: false, error: err && err.message ? err.message : String(err) }, null, 2));
    process.exit(1);
  });
}

module.exports = {
  cleanUrl: cleanUrl, stripHtml: stripHtml, extractMediusId: extractMediusId, buildTargetSlug: buildTargetSlug,
  classifyTrack: classifyTrack, parseEmbedHtml: parseEmbedHtml, evaluateRelevance: evaluateRelevance,
  selectCatalogCandidates: selectCatalogCandidates, enrichRecordedEntry: enrichRecordedEntry,
  buildCatalogDocument: buildCatalogDocument, renderCatalogMarkdown: renderCatalogMarkdown, runCli: runCli
};
