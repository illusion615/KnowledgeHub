/* =============================================================================
 * zhongkao-data.js — 上海中考（浦东新区）统一数据源 / Single Source of Truth
 * -----------------------------------------------------------------------------
 * 目的：多篇中考文章（名额分配分析、分数线预测、自招指南等）共用同一份核验过的
 *       结构化数据，避免每篇各存一份、各自处理、互不同步。新文章只需引入本文件
 *       并查询 window.ZhongkaoData，不要再在文章内硬编码分数线 / 席位。
 *
 * 引入方式（文章 <body> 末尾、渲染脚本之前）：
 *   <script src="../../assets/zhongkao-data.js"></script>
 *
 * 口径约定（务必区分，三条线不同尺度）：
 *   - 名额分配到区线 / 到校线：满分 800（学业 750 + 综合素质评价 50）。
 *   - 统一招生（俗称「1 至 15 志愿」/ 平行志愿 / 统招）：满分 750 裸分，不含综评。
 *   - 还原对比：到区裸分 = 到区线 − 50，可与统招裸分同尺度比较。
 *
 * 数据范围：浦东新区，目标高中含四校（全市投放）、浦东境内四校分校、八大成员建平，
 *           及进才/洋泾/川沙/南汇/高桥/上师大附中/上海实验等区属市重点。
 *           覆盖 2023 / 2024 / 2025 录取年度 + 2026 预测。
 *
 * 官方来源：
 *   [到区/到校] 上海市教育考试院《名额分配到区、到校招生录取最低分数线》
 *              2025-07-14 https://www.shmeea.edu.cn/page/03600/20250714/19623.html
 *              2024-07-15 https://www.shmeea.edu.cn/download/20240715/1.pdf
 *   [统招]     浦东新区人民政府《高中学校「1 至 15 志愿」统一招生录取最低分数线（浦东新区）》
 *              2024 https://www.pudong.gov.cn/zwgk/zzzk-jyjzdgz/2024/200/328840.html
 *              2023 https://www.pudong.gov.cn/zwgk/zzzk-jyjzdgz/2023/209/313022.html
 *   [控分线]   上海市教育考试院《高中阶段学校招生最低投档控制分数线》
 *              2025-07-08 https://www.shmeea.edu.cn/page/03600/20250708/19583.html
 *   [席位/预测] 见 zhongkao-scoreline-2026-forecast 一文逐项核验（2026 招生计划席位）。
 *
 * 注意：纯 vanilla JS、无构建、IE 兼容（不使用箭头函数 / 模板字符串于热路径）。
 *       修改本文件后须跑 node tests/validate.js（exit 0）。
 *
 * 待补（后续阶段，勿臆造）：
 *   - selfAdmission 自招计划数（见 shanghai-zizhao-2026，21 校，含招生代码）。
 *   - 名额分配到校 初中×高中 明细矩阵（当前留在 zhongkao-quota-2025-analysis 文章内）。
 *   - 末位录取考生分科分（语数外/数学/语文/综合，统招 PDF 内逐校一行）。
 *   - 2023 / 2024 全市控分线。
 * ============================================================================= */
(function (root) {
  'use strict';

  // 高中类别枚举（用于分组展示）
  var CATS = ['四校', '四校分', '八大', '浦东市重点'];

  // ── 名额分配到区线 + 统一招生（统招）线：按高中 × 年份 ──
  // 每条：{ key, name, cat, district(到区线/800), unified(统招线/750裸分) }
  // 某校某年若无该批次招生记录，则该年数组中不含此校。
  var admissionLines = {
    '2025': [
      { key: 'shsz', name: '上海中学', cat: '四校', district: 750.5, unified: 710.0 },
      { key: 'huaer', name: '华二', cat: '四校', district: 759.5, unified: 709.5 },
      { key: 'fudan', name: '复旦附中', cat: '四校', district: 761.0, unified: 710.0 },
      { key: 'jiaoda', name: '交大附中', cat: '四校', district: 756.5, unified: 709.5 },
      { key: 'shszdong', name: '上中东校', cat: '四校分', district: 744.0, unified: 692.0 },
      { key: 'fudanpd', name: '浦东复旦附中分校', cat: '四校分', district: 756.0, unified: 703.5 },
      { key: 'jianping', name: '建平中学', cat: '八大', district: 753.5, unified: 699.5 },
      { key: 'jincai', name: '进才中学', cat: '浦东市重点', district: 749.0, unified: 696.5 },
      { key: 'yangjing', name: '洋泾中学', cat: '浦东市重点', district: 738.5, unified: 689.5 },
      { key: 'chuansha', name: '川沙中学', cat: '浦东市重点', district: 735.0, unified: 686.5 },
      { key: 'nanhui', name: '南汇中学', cat: '浦东市重点', district: 728.0, unified: 674.0 },
      { key: 'gaoqiao', name: '高桥中学', cat: '浦东市重点', district: 721.5, unified: 672.5 },
      { key: 'shishida', name: '上师大附中', cat: '浦东市重点', district: 732.0, unified: 695.5 },
      { key: 'shiyan', name: '上海市实验学校', cat: '浦东市重点', district: 740.5, unified: 703.0 }
    ],
    '2024': [
      { key: 'shsz', name: '上海中学', cat: '四校', district: 759.0, unified: 706.5 },
      { key: 'huaer', name: '华二', cat: '四校', district: 756.0, unified: 706.0 },
      { key: 'fudan', name: '复旦附中', cat: '四校', district: 757.0, unified: 706.5 },
      { key: 'jiaoda', name: '交大附中', cat: '四校', district: 753.0, unified: 706.5 },
      { key: 'shszdong', name: '上中东校', cat: '四校分', district: 732.0, unified: 685.0 },
      { key: 'fudanpd', name: '浦东复旦附中分校', cat: '四校分', district: 751.0, unified: 697.0 },
      { key: 'jianping', name: '建平中学', cat: '八大', district: 749.5, unified: 695.0 },
      { key: 'jincai', name: '进才中学', cat: '浦东市重点', district: 745.0, unified: 690.5 },
      { key: 'yangjing', name: '洋泾中学', cat: '浦东市重点', district: 727.5, unified: 682.5 },
      { key: 'chuansha', name: '川沙中学', cat: '浦东市重点', district: 727.5, unified: 680.5 },
      { key: 'nanhui', name: '南汇中学', cat: '浦东市重点', district: 720.0, unified: 671.5 },
      { key: 'gaoqiao', name: '高桥中学', cat: '浦东市重点', district: 719.0, unified: 669.0 }
    ],
    '2023': [
      { key: 'shsz', name: '上海中学', cat: '四校', district: 757.0, unified: 704.0 },
      { key: 'huaer', name: '华二', cat: '四校', district: 753.0, unified: 705.0 },
      { key: 'fudan', name: '复旦附中', cat: '四校', district: 752.5, unified: 703.5 },
      { key: 'jiaoda', name: '交大附中', cat: '四校', district: 753.0, unified: 703.0 },
      { key: 'shszdong', name: '上中东校', cat: '四校分', district: 742.5, unified: 686.0 },
      { key: 'fudanpd', name: '浦东复旦附中分校', cat: '四校分', district: 749.5, unified: 693.0 },
      { key: 'jianping', name: '建平中学', cat: '八大', district: 753.0, unified: 693.5 },
      { key: 'jincai', name: '进才中学', cat: '浦东市重点', district: 749.0, unified: 689.0 },
      { key: 'shishida', name: '上师大附中', cat: '浦东市重点', district: 736.0, unified: 688.0 },
      { key: 'shiyan', name: '上海市实验学校', cat: '浦东市重点', district: 747.5, unified: 696.5 },
      { key: 'yangjing', name: '洋泾中学', cat: '浦东市重点', district: 734.5, unified: 683.5 },
      { key: 'chuansha', name: '川沙中学', cat: '浦东市重点', district: 733.5, unified: 681.0 },
      { key: 'nanhui', name: '南汇中学', cat: '浦东市重点', district: 732.0, unified: 677.0 }
    ]
  };

  // ── 名额分配到校 代表线（2025，来自预测文交叉信号）──
  // 注：完整「初中 × 高中」到校明细矩阵当前留在 zhongkao-quota-2025-analysis 文章内。
  //     此处仅记录每所高中在 2025 年具代表性的到校最低分锚点（— 表示该校未单列）。
  var schoolQuotaAnchors2025 = {
    shsz: 760.0, shszdong: 736.0, jianping: 752.5, jincai: 743.5,
    yangjing: 729.5, chuansha: 726.5, nanhui: 710.0, gaoqiao: 710.5
  };

  // ── 名额分配到区 席位（实配/计划数）：2025 → 2026 ──
  var districtSeats = {
    shsz: { '2025': 43, '2026': 43 },
    huaer: { '2025': 132, '2026': 132 },
    fudan: { '2025': 42, '2026': 46 },
    jiaoda: { '2025': 66, '2026': 67 },
    fudanpd: { '2025': 6, '2026': 8 },
    shszdong: { '2025': 14, '2026': 16 },
    jianping: { '2025': 11, '2026': 11 },
    jincai: { '2025': 11, '2026': 11 },
    shiyan: { '2025': 52, '2026': 52 },
    shishida: { '2025': 105, '2026': 117 },
    yangjing: { '2025': 11, '2026': 11 },
    chuansha: { '2025': 9, '2026': 9 },
    nanhui: { '2025': 14, '2026': 14 },
    gaoqiao: { '2025': 10, '2026': 10 }
  };

  // ── 名额分配到校 计划数（席位）：按年份 × 初中 × 高中 ──
  // 「分数（名额）」用：某初中在某高中的到校席位数，与 ZK_SCHOOLS 到校分逐格对应。
  // 来源：浦东新区《名额分配到校招生计划分配结果》官方 PDF（逐初中明细），
  //       2025 已逐格交叉核验（每个有到校分的格子席位均 >0，零冲突）。2023/2024 待补。
  // 注：席位为「计划分配数」，是到校分的母体；一所初中可在某校有席位但当年未录取（故席位 ⊇ 到校分）。
  var schoolSeatsByMiddle = {
    '2025': {
    "三墩学校":{shishida:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "三林中学东校":{jianping:1,jincai:1,yangjing:2,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "三林中学北校":{shsz:1,jianping:2,jincai:2,yangjing:3,chuansha:3,nanhui:3,gaoqiao:3,fudanpd:1,shszdong:3},
    "三灶学校":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "三灶实验中学":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "上中东校初中部":{huaer:1,jianping:2,jincai:3,yangjing:3,chuansha:2,nanhui:4,gaoqiao:1,fudanpd:1,shszdong:2},
    "上南中学东校":{huaer:1,jianping:3,jincai:4,yangjing:3,chuansha:2,nanhui:5,gaoqiao:2,fudanpd:1,shszdong:2},
    "上南中学北校":{huaer:1,jianping:1,jincai:2,yangjing:1,chuansha:1,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:1},
    "上南中学南校":{jiaoda:1,jianping:1,jincai:2,yangjing:2,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:2},
    "东城学校":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "东昌东校":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "东林中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "东沟中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "东海学校":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "中医药大学附属浦东鹤沙学校":{shiyan:1,jianping:1,jincai:2,yangjing:2,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:2},
    "临港实验中学":{jiaoda:1,jianping:1,jincai:2,yangjing:2,chuansha:1,nanhui:3,gaoqiao:1,fudanpd:1,shszdong:2},
    "临港第一中学":{fudan:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "书院中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "五三中学":{jianping:3,jincai:2,yangjing:2,chuansha:2,nanhui:4,gaoqiao:3,fudanpd:1,shszdong:2},
    "交通大学附属浦东实验中学":{jiaoda:1,jianping:2,jincai:1,yangjing:2,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "侨光中学":{shishida:1,jianping:4,jincai:3,yangjing:4,chuansha:2,nanhui:4,gaoqiao:2,fudanpd:1,shszdong:2},
    "傅雷中学":{huaer:1,jianping:3,jincai:3,yangjing:3,chuansha:4,nanhui:5,gaoqiao:4,shszdong:4},
    "六团中学":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "六灶中学":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "凌桥中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "北蔡中学":{jianping:3,jincai:3,yangjing:4,chuansha:3,nanhui:4,gaoqiao:3,shszdong:3},
    "华东师范大学张江实验中学":{shishida:1,jianping:2,jincai:1,yangjing:2,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "华东师范大学第二附属中学前滩学校":{jianping:1,jincai:1,yangjing:1,chuansha:2,nanhui:1,gaoqiao:2,fudanpd:1,shszdong:1},
    "华东师范大学附属东昌中学南校":{shiyan:1,jianping:3,jincai:2,yangjing:2,chuansha:1,nanhui:3,gaoqiao:2,fudanpd:1,shszdong:1},
    "华林中学":{shiyan:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "南汇第一中学":{jianping:4,jincai:3,yangjing:3,chuansha:2,nanhui:4,gaoqiao:3,fudanpd:1,shszdong:2},
    "南汇第三中学":{jiaoda:1,jianping:2,jincai:3,yangjing:3,chuansha:1,nanhui:4,gaoqiao:1,fudanpd:1,shszdong:1},
    "南汇第二中学":{jiaoda:1,jianping:5,jincai:5,yangjing:6,chuansha:4,nanhui:7,gaoqiao:3,fudanpd:1,shszdong:4},
    "南汇第五中学":{shiyan:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:1},
    "南汇第四中学":{fudan:1,jianping:4,jincai:5,yangjing:4,chuansha:3,nanhui:5,gaoqiao:3,fudanpd:1,shszdong:3},
    "历城中学":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "合庆中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "周浦实验学校":{fudan:1,jianping:2,jincai:3,yangjing:3,chuansha:2,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:2},
    "周浦育才学校":{jiaoda:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,shszdong:1},
    "坦直中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "大团中学":{fudan:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "孙桥中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "实验学校东校":{jianping:2,jincai:3,yangjing:3,chuansha:2,nanhui:5,gaoqiao:2,fudanpd:1,shszdong:3},
    "实验学校南校":{jianping:3,jincai:3,yangjing:2,chuansha:1,nanhui:3,gaoqiao:2,fudanpd:1,shszdong:1},
    "实验学校附属光明学校":{jiaoda:1,jianping:2,jincai:2,yangjing:1,chuansha:2,nanhui:3,gaoqiao:2,fudanpd:1,shszdong:1},
    "宣桥学校":{shishida:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "川沙中学华夏西校":{jianping:4,jincai:3,yangjing:3,chuansha:3,nanhui:4,gaoqiao:3,fudanpd:1,shszdong:2},
    "川沙中学南校":{shishida:1,jianping:4,jincai:5,yangjing:4,chuansha:3,nanhui:7,gaoqiao:3,fudanpd:1,shszdong:3},
    "师范大学附属浦东临港中学":{shsz:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "师范大学附属高桥实验中学":{shsz:1,jianping:4,jincai:3,yangjing:3,chuansha:3,nanhui:5,gaoqiao:3,fudanpd:1,shszdong:2},
    "康城学校":{shishida:1,jianping:2,jincai:2,yangjing:2,chuansha:1,nanhui:3,gaoqiao:1,fudanpd:1,shszdong:1},
    "建平中学西校":{huaer:1,jianping:10,jincai:10,yangjing:9,chuansha:7,nanhui:15,gaoqiao:8,shszdong:7},
    "建平临港中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "建平南汇实验学校":{jianping:1,jincai:2,yangjing:1,chuansha:1,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:1},
    "建平培德实验中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "建平实验中学":{shishida:1,jianping:5,jincai:6,yangjing:6,chuansha:5,nanhui:7,gaoqiao:4,fudanpd:1,shszdong:5},
    "建平实验地杰中学":{shsz:1,jianping:4,jincai:5,yangjing:5,chuansha:4,nanhui:6,gaoqiao:4,shszdong:4},
    "建平实验张江中学":{shishida:1,jianping:1,jincai:1,yangjing:1,chuansha:2,nanhui:1,gaoqiao:2,fudanpd:1,shszdong:2},
    "建平康梧中学":{huaer:1,jianping:1,jincai:2,yangjing:2,chuansha:1,nanhui:3,gaoqiao:1,fudanpd:1,shszdong:1},
    "建平香梅中学":{shsz:1,jianping:2,jincai:3,yangjing:2,chuansha:2,nanhui:4,gaoqiao:2,fudanpd:1,shszdong:2},
    "张江集团中学":{fudan:1,jianping:3,jincai:3,yangjing:2,chuansha:1,nanhui:3,gaoqiao:2,fudanpd:1,shszdong:1},
    "彭镇中学":{huaer:1,jianping:1,jincai:2,yangjing:2,chuansha:1,nanhui:3,gaoqiao:1,fudanpd:1,shszdong:2},
    "懿德中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "戏剧学院附属浦东实验中学":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "教育学院附属实验中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "新云台中学":{shsz:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "新场实验中学":{jiaoda:1,jianping:2,jincai:1,yangjing:2,chuansha:2,nanhui:2,gaoqiao:2,fudanpd:1,shszdong:2},
    "新港中学":{fudan:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "施湾中学":{shishida:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "杨园中学":{jianping:1,jincai:2,yangjing:2,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "杨思中学":{shishida:1,jianping:2,jincai:3,yangjing:2,chuansha:2,nanhui:4,gaoqiao:2,fudanpd:1,shszdong:2},
    "民办东鼎外国语学校":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "民办中芯学校":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "民办光华中学":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "民办华曜浦东实验学校":{shsz:1,jianping:2,jincai:2,yangjing:1,chuansha:1,nanhui:3,gaoqiao:1,fudanpd:1,shszdong:1},
    "民办协和双语学校":{shsz:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "民办启能东方外国语学校":{fudan:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "民办宏文学校":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "民办尚德实验学校":{jianping:5,jincai:5,yangjing:4,chuansha:3,nanhui:7,gaoqiao:3,fudanpd:1,shszdong:3},
    "民办平和学校":{shiyan:1,jianping:2,jincai:1,yangjing:2,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "民办恒洋外国语学校":{shishida:1,jianping:2,jincai:1,yangjing:1,chuansha:2,nanhui:2,gaoqiao:2,fudanpd:1,shszdong:1},
    "民办更新学校":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "民办欣竹中学":{shishida:1,jianping:4,jincai:3,yangjing:3,chuansha:3,nanhui:4,gaoqiao:3,fudanpd:1,shszdong:3},
    "民办正达外国语中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "民办浦东交中初级中学":{shiyan:1,jianping:1,jincai:1,yangjing:1,chuansha:2,nanhui:1,gaoqiao:2,fudanpd:1,shszdong:2},
    "民办进德外国语中学":{fudan:1,jianping:2,jincai:1,yangjing:1,chuansha:1,nanhui:3,gaoqiao:2,fudanpd:1,shszdong:1},
    "民办远翔实验学校":{shishida:1,jianping:2,jincai:1,yangjing:1,chuansha:2,nanhui:3,gaoqiao:2,fudanpd:1,shszdong:1},
    "民办金苹果学校":{shsz:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:1},
    "江镇中学":{shiyan:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:1},
    "沪新中学":{shishida:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,shszdong:1},
    "泥城中学":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "泾南中学":{shiyan:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "洋泾中学东校":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,shszdong:1},
    "洋泾中学南校":{jiaoda:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:1},
    "洋泾菊园实验学校":{huaer:1,jianping:2,jincai:2,yangjing:2,chuansha:1,nanhui:3,gaoqiao:1,fudanpd:1,shszdong:2},
    "洪山中学":{fudan:1,jianping:2,jincai:1,yangjing:1,chuansha:2,nanhui:2,gaoqiao:2,fudanpd:1,shszdong:2},
    "浦东外国语学校东校":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,shszdong:1},
    "浦东教育发展研究院附属中学":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "浦东模范中学":{jianping:2,jincai:2,yangjing:3,chuansha:2,nanhui:3,gaoqiao:2,fudanpd:1,shszdong:2},
    "浦东模范中学东校":{jiaoda:1,jianping:2,jincai:2,yangjing:2,chuansha:1,nanhui:3,gaoqiao:2,fudanpd:1,shszdong:1},
    "浦东模范实验中学":{huaer:1,jianping:2,jincai:1,yangjing:2,chuansha:1,nanhui:1,gaoqiao:1,shszdong:1},
    "浦东民办未来科技学校":{huaer:1,jianping:1,jincai:2,yangjing:2,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:2},
    "浦兴中学":{huaer:1,jianping:2,jincai:1,yangjing:1,chuansha:1,nanhui:2,gaoqiao:2,fudanpd:1,shszdong:1},
    "浦泾中学":{shiyan:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "清流中学":{shsz:1,jianping:4,jincai:3,yangjing:4,chuansha:2,nanhui:4,gaoqiao:2,fudanpd:1,shszdong:2},
    "澧溪中学":{shiyan:1,jianping:5,jincai:5,yangjing:4,chuansha:4,nanhui:7,gaoqiao:4,fudanpd:1,shszdong:4},
    "王港中学":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "秋萍学校":{jiaoda:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "科技大学附属学校":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:1},
    "立信会计金融学院附属学校":{jiaoda:1,jianping:4,jincai:3,yangjing:4,chuansha:3,nanhui:5,gaoqiao:3,fudanpd:1,shszdong:3},
    "立信会计金融学院附属高行中学":{jiaoda:1,jianping:2,jincai:2,yangjing:2,chuansha:1,nanhui:3,gaoqiao:1,fudanpd:1,shszdong:1},
    "竹园中学":{huaer:1,jianping:1,jincai:2,yangjing:2,chuansha:1,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:1},
    "第二工业大学附属龚路中学":{shishida:1,jianping:1,jincai:1,yangjing:2,chuansha:2,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:2},
    "绿川学校":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "罗山中学":{huaer:1,jianping:3,jincai:3,yangjing:3,chuansha:1,nanhui:3,gaoqiao:1,fudanpd:1,shszdong:1},
    "老港中学":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "育人中学":{huaer:1,jianping:1,jincai:2,yangjing:2,chuansha:2,nanhui:3,gaoqiao:1,fudanpd:1,shszdong:2},
    "育民中学":{jianping:2,jincai:2,yangjing:1,chuansha:1,nanhui:3,gaoqiao:1,fudanpd:1,shszdong:1},
    "致远中学":{shishida:1,jianping:2,jincai:2,yangjing:3,chuansha:2,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:2},
    "航头学校":{shishida:1,jianping:3,jincai:3,yangjing:3,chuansha:3,nanhui:4,gaoqiao:2,fudanpd:1,shszdong:3},
    "蔡路中学":{jiaoda:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "进才万祥学校":{shiyan:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "进才中学东校":{jianping:2,jincai:1,yangjing:1,chuansha:2,nanhui:3,gaoqiao:2,fudanpd:1,shszdong:1},
    "进才中学北校":{shsz:1,jianping:8,jincai:7,yangjing:7,chuansha:6,nanhui:10,gaoqiao:6,fudanpd:1,shszdong:6},
    "进才中学南校":{jianping:2,jincai:1,yangjing:1,chuansha:2,nanhui:1,gaoqiao:2,fudanpd:1,shszdong:1},
    "进才实验中学":{shishida:1,jianping:3,jincai:4,yangjing:4,chuansha:3,nanhui:5,gaoqiao:3,fudanpd:1,shszdong:4},
    "进才实验中学南校":{shishida:1,jianping:2,jincai:1,yangjing:1,chuansha:1,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:1},
    "进才森兰实验中学":{shiyan:1,jianping:2,jincai:1,yangjing:1,chuansha:2,nanhui:3,gaoqiao:2,fudanpd:1,shszdong:2},
    "金川中学":{shishida:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "金杨中学":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:1},
    "长岛中学":{shishida:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "陆行中学北校":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:1},
    "陆行中学南校":{shishida:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:2,gaoqiao:1,shszdong:1},
    "顾路中学":{huaer:1,jianping:1,jincai:2,yangjing:2,chuansha:2,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:2},
    "香山中学":{jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "高东中学":{jiaoda:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "黄楼中学":{shishida:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:1,gaoqiao:1,fudanpd:1,shszdong:1},
    "黄路学校":{huaer:1,jianping:1,jincai:1,yangjing:1,chuansha:1,nanhui:2,gaoqiao:1,fudanpd:1,shszdong:1}
    }
  };

  // ── 2026 到区线预测区间（满分 800）──
  var forecast2026 = {
    shsz: '755-760', huaer: '758-762', fudan: '758-762', jiaoda: '755-759',
    fudanpd: '752-756', shszdong: '741-745', jianping: '752-755', jincai: '747-751',
    shiyan: '738-743', shishida: '727-732', yangjing: '734-739', chuansha: '733-737',
    nanhui: '726-731', gaoqiao: '719-723'
  };

  // ── 全市最低投档控制分数线（满分 750）──
  var controlLines = {
    '2025': { putonggao: 513, zizhaoMingefenpei: 605 }
  };

  // ── 统一招生（1 至 15 志愿）计划数：按高中 × 年份（用于「统招分（名额）」展示）──
  // 浦东未单独公示统招计划；统招计划在全市《招生计划》册中（四校等面向全市口径，区属市重点为本区口径）。
  // 现为占位（待补，勿臆造）；getUnifiedSeats() 缺值返回 null。
  var unifiedSeats = {
    // '2025': { shsz: <num>, ... }
  };

  // ── 查询辅助 ──
  function getAdmissionLines(year) {
    return admissionLines[String(year)] || [];
  }
  function getDistrictSeats(key, year) {
    var y = String(year);
    return districtSeats[key] && districtSeats[key][y] != null ? districtSeats[key][y] : null;
  }
  function getUnifiedSeats(key, year) {
    var y = String(year);
    return unifiedSeats[y] && unifiedSeats[y][key] != null ? unifiedSeats[y][key] : null;
  }
  // 某初中在某目标高中的名额分配到校席位数（用于「到校分（名额）」展示）。缺值返回 null。
  function getMiddleSeats(middleName, hsKey, year) {
    var y = String(year);
    var t = schoolSeatsByMiddle[y];
    if (!t) { return null; }
    var row = t[middleName];
    if (!row || row[hsKey] == null) { return null; }
    return row[hsKey];
  }
  // 返回某高中跨年度的全部口径数据：{ key, name, cat, byYear:{year:{district,unified,seats,anchor}}, forecast2026 }
  function getHighSchool(key) {
    var out = { key: key, name: null, cat: null, byYear: {}, forecast2026: forecast2026[key] || null };
    var years = ['2023', '2024', '2025'];
    years.forEach(function (y) {
      var row = null;
      admissionLines[y].forEach(function (r) { if (r.key === key) { row = r; } });
      if (row) {
        out.name = row.name;
        out.cat = row.cat;
        out.byYear[y] = {
          district: row.district,
          unified: row.unified,
          districtSeats: getDistrictSeats(key, y),
          schoolQuotaAnchor: y === '2025' && schoolQuotaAnchors2025[key] != null ? schoolQuotaAnchors2025[key] : null
        };
      }
    });
    return out;
  }

  root.ZhongkaoData = {
    meta: {
      district: '浦东新区',
      scale: { quota: 800, quotaEvaluation: 50, unified: 750 },
      years: ['2023', '2024', '2025'],
      forecastYear: '2026',
      updated: '2026-06-25'
    },
    cats: CATS,
    admissionLines: admissionLines,
    schoolQuotaAnchors2025: schoolQuotaAnchors2025,
    districtSeats: districtSeats,
    schoolSeatsByMiddle: schoolSeatsByMiddle,
    unifiedSeats: unifiedSeats,
    forecast2026: forecast2026,
    controlLines: controlLines,
    getAdmissionLines: getAdmissionLines,
    getDistrictSeats: getDistrictSeats,
    getUnifiedSeats: getUnifiedSeats,
    getMiddleSeats: getMiddleSeats,
    getHighSchool: getHighSchool
  };
}(typeof window !== 'undefined' ? window : this));
