/**
 * Agentic Sales Mobile · Prototype Sample Data
 * Drives the interactive iPhone prototype on index.html.
 * No external deps. Attached to window.AgenticSalesData.
 */
(function () {
  window.AgenticSalesData = {
    user: { name: 'Maria Souza', initial: 'M' },

    /* ───────────────── Brief Me · 6 章节 ───────────────── */
    briefing: {
      title_zh: '今日播报 · 6 章节 2 分 40 秒',
      title_en: 'Brief Me · 6 chapters 2m 40s',
      chapters: [
        {
          prio_zh: '夜间情报', prio_en: 'Overnight',
          headline_zh: '昨夜 3 条新邮件 · 1 条采购意向',
          headline_en: '3 new emails overnight · 1 procurement intent',
          summary_zh: 'Hospital Beta 采购科 23:40 来信，对 N17 监护仪报价单确认需要 12 台，可作为今天首件跟进事项。',
          summary_en: 'Hospital Beta procurement emailed at 23:40 confirming demand for 12 units of N17 monitor; treat as today\u2019s first action.',
          speech_zh: '昨夜共有 3 条新邮件需要关注，最关键的是 Hospital Beta 在晚间 11 点 40 分发来确认，对 N17 监护仪 12 台报价单已经走完审批流程，今天可以推进合同签署。',
          speech_en: 'Three new emails came in overnight. The most important is from Hospital Beta at 11:40 PM confirming approval for the N17 monitor quote of 12 units. Today is a good day to move toward contract signing.'
        },
        {
          prio_zh: '今日行程', prio_en: 'Schedule',
          headline_zh: '今日 4 个拜访 · 重点 Hospital Alpha 9:00',
          headline_en: '4 visits today · key Hospital Alpha 9:00',
          summary_zh: '上午两场偏产品演示，下午两场偏关系维护。Hospital Alpha 9 点的 A3 演示反馈是关键卡点。',
          summary_en: 'Two product demos in the morning, two relationship calls in the afternoon. The 9 AM A3 demo feedback at Hospital Alpha is the key checkpoint.',
          speech_zh: '今天总共安排了 4 场拜访。上午两场，9 点的 Hospital Alpha 是 A3 产品演示反馈，请提前准备 demo 用机；下午两场偏关系维护。',
          speech_en: 'Four visits are scheduled today. Two in the morning, the 9 AM at Hospital Alpha is the A3 demo feedback, please bring the demo unit. Two more in the afternoon are relationship visits.'
        },
        {
          prio_zh: '风险预警', prio_en: 'Risk',
          headline_zh: 'A 客户两次延期回复 · 履约掉至 78%',
          headline_en: 'Account A: 2 reply delays \u00b7 fulfilment 78%',
          summary_zh: '14 天内 2 次延期：付款承诺 4/18 \u2192 4/26 \u2192 5/03；今晨内部群已被 @ 两次，履约从 96% 跌到 78%。',
          summary_en: '2 delays in 14 d: payment 4/18 \u2192 4/26 \u2192 5/03; you were @-mentioned twice today, fulfilment dropped from 96% to 78%.',
          points_zh: [
            '采购总监本周休假 · 接口人切换为副总监 Lucia',
            '信用风险分上调至 B+，回款超 30 天将触发预警'
          ],
          points_en: [
            'Procurement lead on PTO; contact switched to deputy Lucia',
            'Credit risk raised to B+; >30 d overdue triggers alert'
          ],
          metrics: [
            { tone: 'down', text_zh: '-18% \u00b7 履约', text_en: '-18% \u00b7 fulfilment' },
            { tone: 'down', text_zh: 'SLA 超 4 天', text_en: 'SLA +4 d' },
            { tone: '', text_zh: '\u00a5620 万 在途', text_en: '\u00a56.2M in-flight' }
          ],
          context_zh: '今天 15:30 你在浦东 \u00b7 距 A 客户 2.4 km \u00b7 副总监今日在岗',
          context_en: 'You\u2019re in Pudong at 15:30 \u00b7 2.4 km from Account A \u00b7 deputy on-site',
          cta_zh: '加入今日拜访', cta_en: 'Add to today',
          speech_zh: '风险提示。A 客户最近 14 天内两次延期回复，付款承诺已经从 4 月 18 日推到 5 月 3 日。今晨内部群里你已经被点名两次，履约率从 96 跌到 78。建议今天下午 15 点 30 分顺路拜访，副总监 Lucia 在岗。',
          speech_en: 'Risk alert. Account A delayed twice in the past 14 days, payment date pushed from April 18 to May 3. You were @-mentioned twice in the team chat today; fulfilment dropped from 96 to 78. Recommend dropping by at 3:30 PM today, deputy Lucia is on site.'
        },
        {
          prio_zh: '商机进展', prio_en: 'Opportunity',
          headline_zh: 'Hospital Delta · A1 商机升级',
          headline_en: 'Hospital Delta \u00b7 A1 advanced to Negotiate',
          summary_zh: '昨天的演示反馈正向，建议今天推合同细节。',
          summary_en: 'Yesterday\u2019s demo feedback was positive; push contract details today.',
          speech_zh: 'Hospital Delta 的 A1 商机昨天演示反馈正向，今天可以进入合同谈判阶段，金额预计 96 万人民币。',
          speech_en: 'Hospital Delta A1 opportunity received positive demo feedback yesterday. Today you can enter contract negotiation; estimated value 96 thousand US dollars.'
        },
        {
          prio_zh: '行业动态', prio_en: 'Industry',
          headline_zh: '本周三家医院发布新一轮设备 RFP',
          headline_en: 'Three hospitals issued new equipment RFPs this week',
          summary_zh: 'Hospital Gamma / Epsilon / Zeta 各发出一份 RFP，截止日均在 5 月底前。',
          summary_en: 'Hospital Gamma, Epsilon, Zeta each issued an RFP, all closing by end of May.',
          speech_zh: '行业动态。本周共有三家医院发布新一轮设备 RFP，分别是 Gamma、Epsilon 和 Zeta，截止日期都在 5 月底前。',
          speech_en: 'Industry update. Three hospitals issued new equipment RFPs this week: Gamma, Epsilon, and Zeta. All close by end of May.'
        },
        {
          prio_zh: '收尾建议', prio_en: 'Wrap',
          headline_zh: '今日建议优先 3 项',
          headline_en: 'Top 3 suggested actions today',
          summary_zh: '1) 上午回复 Beta 报价；2) 下午顺访 A 客户；3) 晚上准备 Delta 合同初稿。',
          summary_en: '1) Reply Beta quote in the morning; 2) Visit Account A in the afternoon; 3) Draft Delta contract tonight.',
          speech_zh: '今日建议优先三项。上午回复 Hospital Beta 的报价确认；下午 15 点 30 分顺访 A 客户；晚上准备 Hospital Delta 合同初稿。播报结束。',
          speech_en: 'Three priorities today. Reply Hospital Beta quote in the morning. Drop by Account A at 3:30 PM. Draft Hospital Delta contract tonight. End of brief.'
        }
      ]
    },

    /* ───────────────── Copilot 知识库 ───────────────── */
    copilot: {
      placeholder_zh: '问点别的\u2026',
      placeholder_en: 'Ask anything else\u2026',
      welcome_zh: 'Hospital Beta 的最新商机进度？',
      welcome_en: 'What\u2019s the latest opportunity status for Hospital Beta?',
      intents: [
        {
          keywords: ['beta', '\u8d1d\u5854', 'hospital beta'],
          replies: [
            { type: 'agent', name_zh: '\u2299 \u5546\u673a\u8bc4\u4f30 Agent', name_en: '\u2299 Opportunity Agent',
              text_zh: 'Hospital Beta \u5f53\u524d 3 \u4e2a\u6d3b\u8dc3\u5546\u673a\uff1a',
              text_en: 'Hospital Beta has 3 active opportunities:' },
            { type: 'list', items: [
              { name_zh: '\u76d1\u62a4\u4eea N17', name_en: 'Monitor N17', qty: '\u00d7 12', stage: 'Negotiate' },
              { name_zh: '\u76d1\u62a4\u4eea A2', name_en: 'Monitor A2', qty: '\u00d7 4', stage: 'Identify' },
              { name_zh: '\u8d85\u58f0 R9', name_en: 'Ultrasound R9', qty: '\u00d7 2', stage: 'Propose' }
            ] },
            { type: 'agent', name_zh: '\u2299 \u5ba2\u6237\u753b\u50cf Agent', name_en: '\u2299 Customer Profile Agent',
              text_zh: '\u6700\u8fd1 30 \u5929 4 \u6b21\u62dc\u8bbf \u00b7 NPS \u63d0\u5347 12 \u70b9 \u00b7 \u4e0a\u6b21\u63a5\u89e6 04/22',
              text_en: '4 visits in 30 d \u00b7 NPS +12 \u00b7 last touch 04/22' },
            { type: 'source', text_zh: '\u6765\u81ea ERP \u00b7 Dataverse Virtual Table', text_en: 'From ERP \u00b7 Dataverse Virtual Table' }
          ]
        },
        {
          keywords: ['alpha', '\u963f\u5c14\u6cd5', 'hospital alpha'],
          replies: [
            { type: 'agent', name_zh: '\u2299 \u5546\u673a\u8bc4\u4f30 Agent', name_en: '\u2299 Opportunity Agent',
              text_zh: 'Hospital Alpha \u672c\u6708 1 \u4e2a\u65b0\u5546\u673a\uff1a',
              text_en: 'Hospital Alpha has 1 new opportunity this month:' },
            { type: 'list', items: [
              { name_zh: '\u76d1\u62a4\u4eea A1', name_en: 'Monitor A1', qty: '\u00d7 8', stage: 'Identify' }
            ] },
            { type: 'agent', name_zh: '\u2299 \u8ba2\u5355\u67e5\u8be2 Agent', name_en: '\u2299 Order Lookup Agent',
              text_zh: '\u8fc7\u53bb 12 \u4e2a\u6708\u540c\u7c7b\u4ea7\u54c1\u6210\u4ea4 24 \u53f0 \u00b7 \u5e73\u5747\u5355\u4ef7 11.8K USD',
              text_en: '24 similar units sold in past 12 mo \u00b7 avg unit price 11.8K USD' },
            { type: 'source', text_zh: '\u6765\u81ea ERP \u00b7 Dataverse Virtual Table', text_en: 'From ERP \u00b7 Dataverse Virtual Table' }
          ]
        },
        {
          keywords: ['delta', '\u5fb7\u5c14\u5854', 'hospital delta'],
          replies: [
            { type: 'agent', name_zh: '\u2299 \u5546\u673a\u8bc4\u4f30 Agent', name_en: '\u2299 Opportunity Agent',
              text_zh: 'Hospital Delta A1 \u5546\u673a\u521a\u521a\u5347\u7ea7\u5230 Negotiate \u9636\u6bb5\uff1a',
              text_en: 'Hospital Delta A1 just advanced to Negotiate:' },
            { type: 'list', items: [
              { name_zh: '\u76d1\u62a4\u4eea A1', name_en: 'Monitor A1', qty: '\u00d7 6', stage: 'Negotiate' }
            ] },
            { type: 'source', text_zh: '\u6765\u81ea CRM \u00b7 \u4eca\u65e5 9:14 \u66f4\u65b0', text_en: 'From CRM \u00b7 updated today 9:14' }
          ]
        }
      ],
      fallback: {
        replies: [
          { type: 'agent', name_zh: '\u2299 \u667a\u80fd\u52a9\u624b', name_en: '\u2299 Copilot',
            text_zh: '\u6211\u6682\u65f6\u6ca1\u67e5\u5230\u8fd9\u4e2a\u5ba2\u6237\u7684\u4fe1\u606f\uff0c\u8bd5\u8bd5\u95ee Hospital Beta\u3001Alpha \u6216 Delta\u3002',
            text_en: 'I do not have data on this account yet. Try Hospital Beta, Alpha, or Delta.' }
        ]
      }
    },

    /* ───────────────── Capture · 录音转写示例 ───────────────── */
    capture: {
      sampleTranscripts: {
        zh: [
          '\u521a\u62dc\u8bbf Hospital Alpha\uff0c\u9662\u65b9\u5bf9 A1 \u578b\u53f7\u6bd4\u8f83\u611f\u5174\u8da3\uff0c\u9884\u8ba1\u4e0b\u5b63\u5ea6\u91c7\u8d2d 8 \u53f0\uff0c\u4e0b\u5468\u4e09\u518d\u4e0a\u95e8\u505a\u6280\u672f\u6f14\u793a\u3002',
          'Hospital Beta \u91c7\u8d2d\u90e8\u4eca\u5929\u4e0b\u5348\u786e\u8ba4\u4e86 N17 \u62a5\u4ef7\uff0c\u8981\u6c42\u4e0b\u5468\u524d\u63d0\u4ea4\u5408\u540c\u521d\u7a3f\uff0c\u540c\u65f6\u9700\u8981\u8865\u5145 3 \u5e74\u8d28\u4fdd\u6761\u6b3e\u3002',
          'Hospital Delta \u4ea7\u54c1\u603b\u76d1\u53cd\u9988\u6f14\u793a\u6548\u679c\u4e0d\u9519\uff0c\u5e0c\u671b\u4e0b\u5468\u516d\u8fdb\u884c\u4e8c\u6b21\u8bd5\u673a\uff0c\u9700\u63d0\u524d 3 \u5929\u53d1\u5e8f\u5217\u53f7\u3002'
        ],
        en: [
          'Just visited Hospital Alpha. They are interested in the A1 model, plan to buy 8 units next quarter, want a tech demo next Wednesday.',
          'Hospital Beta procurement confirmed the N17 quote this afternoon, asks for a draft contract before next week, plus a 3-year warranty clause.',
          'Hospital Delta product head liked the demo, wants a second hands-on next Saturday; needs serial numbers 3 days in advance.'
        ]
      }
    }
  };
})();
