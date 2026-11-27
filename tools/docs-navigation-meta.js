// tools/docs-navigation-meta.js
// Metadata & taxonomy routing rules for Study Room `docs/navigation.json` synchronization.

'use strict';

var fs = require('fs');
var path = require('path');
var fm = require('./markdown-compiler/frontmatter');

var UNMAPPED_TOPIC_ROUTING = {
  'markdown-genesis-lab': 'knowledge-hub-design-docs',
  'agentic-sales-mobile-proposal-review': 'agentic-crm',
  'mindray-crm-ai-proposal': 'industry-solution',
  'mindray-crm-ai-proposal-design': 'industry-solution',
  'four-schools-profile': 'edu-admissions-planning',
  'jianping-class-14-dali': 'edu-admissions-planning',
  'jianping-clubs-gaokao-planning': 'edu-admissions-planning',
  'sh-top12-gaokao': 'edu-admissions-planning',
  'shanghai-zizhao-2026': 'edu-admissions-planning',
  'zhongkao-policy-data': 'edu-admissions-planning',
  'zhongkao-quota-2025-analysis': 'edu-admissions-planning',
  'zhongkao-scoreline-2026-forecast': 'edu-admissions-planning',
  'zhongkao-volunteer-strategy': 'edu-admissions-planning',
  'leshan-jiading-103-property-strategy': 'edu-asset-strategy',
  'shanghai-asset-upgrade-strategy': 'edu-asset-strategy',
  'shanghai-rongchuang-no1-property-strategy': 'edu-asset-strategy',
  'xihuamen-22-property-strategy': 'edu-asset-strategy',
  'yuqiao-xinhuayuan-property-strategy': 'edu-asset-strategy'
};

var TOPIC_GOAL_MAP = {
  'ai-engineering-practice': 'content-ai-research',
  'ai-research-model': 'topic-ai-models',
  'ai-research-vibe-coding': 'topic-vibe-radar',
  'ai-industry-watch': 'topic-vibe-radar',
  'ai-radar': 'topic-vibe-radar',
  'ai-research-agent': 'topic-agent-claw',
  'claw-code': 'topic-agent-claw',
  'fc-agentic': 'topic-fc-agentic',
  'microsoft-ai': 'content-microsoft-ai',
  'ignite-2026': 'topic-ignite-2026',
  'copilot-studio': 'topic-copilot-studio',
  'copilot-studio-customer-innovation': 'topic-copilot-studio',
  'agentic-ai-innovation-governance': 'topic-copilot-studio',
  'power-apps': 'topic-power-enterprise',
  'power-platform': 'topic-power-enterprise',
  'business-ai-solution': 'topic-power-enterprise',
  'industry-solution': 'topic-power-enterprise',
  'agentic-crm-solution': 'topic-agentic-crm',
  'agentic-crm': 'topic-agentic-crm',
  'agentic-service': 'topic-agentic-crm',
  'agentic-service-mobile': 'topic-agentic-crm',
  'ai-project-practice': 'content-project-practice',
  'ai-mud': 'topic-ai-mud',
  'knowledge-hub': 'topic-knowledge-hub',
  'knowledge-hub-reviews': 'topic-knowledge-hub',
  'knowledge-hub-design-docs': 'topic-knowledge-hub',
  'aye-aye-captain': 'topic-agent-platform',
  'agent-platform': 'topic-agent-platform',
  'education-planning': 'content-education-math',
  'edu-fundamentals': 'content-education-math',
  'edu-high-school-math': 'topic-high-school-math',
  'edu-high-school-algebra-functions': 'topic-high-school-math',
  'edu-high-school-geometry-algebra': 'topic-high-school-math',
  'edu-calculus': 'topic-high-school-math',
  'edu-physics': 'topic-middle-physics',
  'physics-zizhao-sprint': 'topic-middle-physics',
  'physics-mechanics': 'topic-middle-physics',
  'physics-thermodynamics': 'topic-middle-physics',
  'physics-electromagnetism': 'topic-middle-physics',
  'physics-optics': 'topic-middle-physics',
  'physics-modern': 'topic-middle-physics',
  'edu-admissions-planning': 'admission-reference',
  'edu-asset-strategy': 'planning-map-exploration'
};

function extractCleanMarkdownTitle(repoRoot, relPath) {
  var abs = path.join(repoRoot, relPath);
  if (!fs.existsSync(abs)) return path.basename(relPath, path.extname(relPath));
  var raw = fs.readFileSync(abs, 'utf8');
  var parsed = fm.parseFrontmatter(raw);
  if (parsed.meta && parsed.meta.title) {
    var tPair = fm.parseBilingual(parsed.meta.title);
    if (tPair.zh) return tPair.zh.slice(0, 160);
  }
  var lines = parsed.body.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var m = lines[i].trim().match(/^#{1,3}\s+(.+)$/);
    if (m) {
      var h = m[1].replace(/^#[a-zA-Z][\w-]*\s+/, '');
      if (h.indexOf('::') !== -1) h = h.split('::').slice(1).join('::').trim();
      var hp = fm.parseBilingual(h);
      return hp.zh.replace(/[`*_~]/g, '').trim().slice(0, 160);
    }
  }
  return path.basename(relPath);
}

function resolveGoalIds(slug, topicChain, knownGoals) {
  var artGoal = 'art-' + slug;
  if (knownGoals.size === 0) return ['knowledge-discovery'];
  if (knownGoals.has(artGoal)) return [artGoal];
  for (var i = topicChain.length - 1; i >= 0; i--) {
    var topicId = topicChain[i];
    var mapped = TOPIC_GOAL_MAP[topicId];
    if (mapped && knownGoals.has(mapped)) return [mapped];
    if (topicId === 'ignite-2026' && knownGoals.has('topic-copilot-studio')) {
      return ['topic-copilot-studio'];
    }
  }
  return [knownGoals.has('read-markdown-article') ? 'read-markdown-article' : 'knowledge-discovery'];
}

function inferEngineeringMeta(repoRoot, relPath, knownGoals) {
  var pickGoal = function (preferred) {
    if (knownGoals.size === 0 || knownGoals.has(preferred)) return [preferred];
    return ['knowledge-authoring'];
  };
  var title = extractCleanMarkdownTitle(repoRoot, relPath);

  if (relPath === 'README.md') {
    return {
      title: 'Study Room (Knowledge Hub) 项目总览与快速上手',
      audience: 'human',
      doc_class: 'user_manual',
      diataxis: ['tutorial', 'explanation'],
      component_ids: [
        'knowledge-home', 'graph-navigation', 'mini-games', 'interactive-lab-embed',
        'jev-playground', 'article-assistant', 'narration-ui', 'reading-runtime',
        'markdown-article', 'presentation-runtime', 'narration-engine', 'pptx-rendering',
        'model-discovery', 'copilot-http-bridge', 'tts-local-proxy', 'jev-http-bridge',
        'nanojev-mlx-runtime', 'knowledge-catalog', 'admission-reference-data',
        'diagram-authoring', 'verification-tools', 'copilot-benchmark-harness'
      ],
      goal_ids: pickGoal('knowledge-discovery')
    };
  }
  if (relPath === 'RELEASE.md') {
    return {
      title: '版本发布说明与里程碑记录 (RELEASE)',
      audience: 'human',
      doc_class: 'ops_and_governance',
      diataxis: ['reference'],
      component_ids: ['verification-tools'],
      goal_ids: pickGoal('knowledge-authoring')
    };
  }
  if (relPath === 'AGENTS.md' || relPath === 'CLAUDE.md') {
    return {
      title: relPath + ' 智能体协作规范与工程约定',
      audience: 'agent',
      doc_class: 'ops_and_governance',
      diataxis: ['reference'],
      component_ids: ['verification-tools'],
      goal_ids: pickGoal('knowledge-authoring')
    };
  }
  if (relPath.indexOf('copilot-provider') !== -1) {
    return {
      title: title,
      audience: 'human',
      doc_class: 'detailed_design',
      diataxis: ['how_to', 'reference'],
      component_ids: ['model-discovery', 'copilot-http-bridge'],
      goal_ids: pickGoal('model-connections')
    };
  }
  if (relPath.indexOf('diagram-visualization') !== -1) {
    return {
      title: title,
      audience: 'human',
      doc_class: 'high_level_design',
      diataxis: ['explanation'],
      component_ids: ['diagram-authoring', 'markdown-article'],
      goal_ids: pickGoal('author-diagrams')
    };
  }
  if (relPath.indexOf('markdown-framework') !== -1 || relPath.indexOf('aye-aye-captain-docs') !== -1) {
    return {
      title: title,
      audience: 'human',
      doc_class: 'high_level_design',
      diataxis: ['explanation', 'reference'],
      component_ids: ['markdown-article', 'knowledge-catalog'],
      goal_ids: pickGoal('read-markdown-article')
    };
  }
  if (relPath.indexOf('jev') !== -1 || relPath.indexOf('laya') !== -1) {
    var isExp = relPath.indexOf('tests/experiments/') === 0;
    return {
      title: title,
      audience: isExp ? 'agent' : 'human',
      doc_class: isExp ? 'ops_and_governance' : 'detailed_design',
      diataxis: ['reference'],
      component_ids: relPath.indexOf('nanojev') !== -1 ? ['nanojev-mlx-runtime', 'jev-playground'] : ['jev-playground', 'jev-http-bridge'],
      goal_ids: pickGoal('jev-inspection')
    };
  }
  if (relPath.indexOf('video-') !== -1) {
    return {
      title: title,
      audience: 'human',
      doc_class: 'detailed_design',
      diataxis: ['how_to', 'explanation'],
      component_ids: ['graph-navigation', 'presentation-runtime'],
      goal_ids: pickGoal('article-presentation')
    };
  }
  if (relPath.indexOf('minimax') !== -1) {
    return {
      title: title,
      audience: 'human',
      doc_class: 'detailed_design',
      diataxis: ['how_to', 'reference'],
      component_ids: ['markdown-article'],
      goal_ids: pickGoal('knowledge-authoring')
    };
  }
  if (relPath.indexOf('copilot-model-benchmark') !== -1 || relPath.indexOf('tmp/') === 0) {
    return {
      title: title,
      audience: 'agent',
      doc_class: 'ops_and_governance',
      diataxis: ['reference'],
      component_ids: ['copilot-benchmark-harness', 'verification-tools'],
      goal_ids: pickGoal('art-copilot-model-benchmark')
    };
  }
  if (relPath.indexOf('authoring/') === 0 || relPath.indexOf('tests/') === 0) {
    return {
      title: title,
      audience: relPath === 'tests/README.md' ? 'human' : 'agent',
      doc_class: 'ops_and_governance',
      diataxis: ['reference'],
      component_ids: ['verification-tools'],
      goal_ids: pickGoal('knowledge-authoring')
    };
  }
  return {
    title: title,
    audience: 'human',
    doc_class: 'detailed_design',
    diataxis: ['explanation'],
    component_ids: ['knowledge-catalog'],
    goal_ids: pickGoal('knowledge-authoring')
  };
}

module.exports = {
  UNMAPPED_TOPIC_ROUTING: UNMAPPED_TOPIC_ROUTING,
  extractCleanMarkdownTitle: extractCleanMarkdownTitle,
  resolveGoalIds: resolveGoalIds,
  inferEngineeringMeta: inferEngineeringMeta
};
