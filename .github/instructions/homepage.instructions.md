---
applyTo: "index.html"
---

# Homepage Knowledge Graph Conventions

- Homepage is a full-screen interactive canvas — NOT a traditional page layout
- All `var` declarations must be at the top of the DOMContentLoaded scope (avoid hoisting bugs)
- Three layout modes: Galaxy (orbital), Cards (grid), Infographic (arc hierarchy)
- All visible text must have `data-zh` and `data-en` attributes for bilingual support
- Settings (theme, lang, layout) persist via `localStorage`

## Knowledge Data Architecture

- **唯一数据源**: `assets/knowledge-data.js` 中的 `knowledgeTree[]` 数组（邻接表）
- **禁止**: 在 `index.html` 中直接硬编码知识点数据
- `index.html` 通过树工具函数从 `knowledgeTree` 自动派生 `planets`、`groups`、`posts`

### 添加新文章（叶子节点）
1. 创建 `posts/{slug}/index.html`
2. 在 `assets/knowledge-data.js` 的 `knowledgeTree[]` 末尾添加：
   ```js
   { id: '{slug}', parentId: '{父节点id}', type: 'article',
     title: { zh: '...', en: '...' }, summary: { zh: '...', en: '...' },
     tags: [...], date: 'YYYY-MM-DD', url: 'posts/{slug}/index.html',
     color: '#hex', phase: N, speed: N, relations: [] }
   ```
3. `parentId` 指向任意已存在的 topic 节点 id
4. 错开 `phase` 值避免视觉重叠

### 添加新分类/分组（分支节点）
- 在 `knowledgeTree[]` 添加：
  ```js
  { id: '{group-id}', parentId: '{父节点id或null}', type: 'topic',
    label: { zh: '...', en: '...' }, color: '#hex',
    phase: N, speed: N }
  ```
- `parentId: null` → 根节点（顶级星球），需额外设置 `orbitIndex`
- `parentId: '{topic-id}'` → 子分组，层级无上限

### 移动节点层级
- 仅需修改该节点的 `parentId` 字段，无需动其他文件

### 渲染规则（自动）
- Galaxy: depth=0 围绕中心，depth=N 围绕 depth=N-1 的父节点，轨道半径逐级缩小
- Cards: 按 parentId 递归分组显示
- Infographic: 弧线轮盘，左右键切圆弧，上下键转动轮盘
