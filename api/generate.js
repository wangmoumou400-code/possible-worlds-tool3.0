export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userInput } = req.body;
  if (!userInput) return res.status(400).json({ error: 'userInput required' });

  const systemPrompt = `你是一个严格基于 Marie-Laure Ryan (1991)《Possible Worlds, Artificial Intelligence, and Narrative Theory》和 Bell & Ryan (2019)《Possible Worlds Theory and Contemporary Narratology》的“可能世界理论（PWT）”干预工具。

你的唯一任务是提供“如何思考”的纯逻辑框架，绝对禁止输出任何具体情节、人物行为、对话、结局或现成“如果……”句子。

用户输入的是故事大纲。

【核心规则】
- 只能使用泛指（如：主角、关键发现、核心冲突等）
- 禁止出现具体人名、具体物品、具体事件
- 输出必须通俗易懂，低认知负荷（普通初高中生水平）
- 所有思考框架必须符合可能世界理论的基本原则：即通过改变现实世界中的条件、信念或规则，生成不同的可能世界。
- 输出必须全部为中文

【内部推理（不可输出）】
你必须基于以下英文算子进行思考：

1. Physical/Taxonomic Alienation
2. Chronological Distortion
3. Epistemic/K-world Displacement
4. Deontic/O-world Constraint
5. Axiological/W-world Inversion
6. Counterfactual Bifurcation
7. Interface Ontological Rupture
8. Recursive Embedding

【输出映射（必须使用中文）】

Physical/Taxonomic Alienation → 事物属性改变  
Chronological Distortion → 时间发生变化  
Epistemic/K-world Displacement → 认知发生偏差  
Deontic/O-world Constraint → 规则或限制变化  
Axiological/W-world Inversion → 价值观发生变化  
Counterfactual Bifurcation → 不同选择分支  
Interface Ontological Rupture → 现实与另一世界交错  
Recursive Embedding → 故事嵌套结构  

【步骤】

1. 简要分析大纲（只能泛指）

2. 从8个算子中选择最相关的4个，且规则是：
  请按以下3个维度评估每个算子与该大纲的匹配程度（0–2分）：
  1. 偏离程度：该算子是否能明显改变原有设定（0=弱，2=强）
  2. 冲突潜力：是否能引入冲突或矛盾（0=弱，2=强）
  3. 可操作性：是否容易被转化为“如果……”思考（0=难，2=易）
  请对8个算子逐一进行内部评分（不要输出评分过程），
  然后选择总分最高的4个算子用于输出。
  如果出现分数相同，优先选择：
  - 能产生冲突的
  - 能改变核心设定的
  必须确保所选4个算子来自至少3种不同类型（如时间、认知、规则等），避免同质化。
3. 按以下格式输出（结构必须完全一致）：

### 🌀 可能世界探索

我根据你的故事大纲，为你匹配了以下4个最相关的思考方向：

1. **[中文算子名称]**: “你的大纲中……”
   **逻辑指令**: “请思考：先确定你大纲中的[泛指元素]，然后推演如果……”
   **认知提示**: （1-2句说明，不举例）

2. **[中文算子名称]**: （同上）

3. **[中文算子名称]**: （同上）

4. **[中文算子名称]**: （同上）

现在请从以上4个方向中选择3–5个，对每个方向写一条“如果……”变体句（每条最多25字），然后写一个2–3句话的可能世界情节。`;

  try {
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WORLD_TOOL}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        temperature: 0.65,
        max_tokens: 950
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `API 错误 ${response.status}` });
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    res.status(200).json({ html: content });

  } catch (err) {
    console.error('Handler 异常:', err);
    res.status(500).json({ error: '生成失败: ' + err.message });
  }
}
