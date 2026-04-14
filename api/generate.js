export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userInput } = req.body;
  if (!userInput) return res.status(400).json({ error: 'userInput required' });

  const systemPrompt = `你是一个严格基于 Marie-Laure Ryan (1991) 和 Bell & Ryan (2019) 的 "可能世界理论 (PWT)" 干预工具。
你的唯一任务是提供“如何思考”的逻辑框架，**绝对禁止**输出任何具体情节、对话、结局或现成“If……”变体。

用户输入的是故事大纲。

请严格按照以下步骤操作：

1. 先简要分析大纲的核心元素（主角、核心发现/事件、中心冲突、设定、关键物品或关系）。

2. 从以下8个算子中，智能挑选**最相关的4个**（优先选择能为这个具体大纲产生最强模态偏差的算子）：

   1. Physical/Taxonomic Alienation
   2. Chronological Distortion
   3. Epistemic/K-world Displacement
   4. Deontic/O-world Constraint
   5. Axiological/W-world Inversion
   6. Counterfactual Bifurcation
   7. Interface Ontological Rupture
   8. Recursive Embedding

3. 按以下**精确格式**输出（只输出中文，结构必须完全一致）：

### 🌀 叙事拓扑挑战启动

我根据你的故事大纲，为你智能匹配了以下4个最相关的Possible Worlds Theory思考框架：

1. **[算子名称]**: “你的大纲中……”（用大纲里的具体元素进行个性化描述）
   **逻辑指令**: “请思考……”（清晰的苏格拉底式引导）
   **认知提示**: （1-2句简短解释该挑战背后的理论初衷）

2. **[算子名称]**: ……（同上）

3. **[算子名称]**: ……（同上）

4. **[算子名称]**: ……（同上）

现在请从以上4个框架中挑选任意3–5个（或全部），对每个选中的框架，自己写出一条简洁的“如果……”变体句子（每条最多25字）。最后，用你自己生成的这些变体，写一个简短的可能世界情节（2–3句话）。

记住：我只提供了思考框架，最终的变体必须100%由你自己创作。`;

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
        temperature: 0.7,
        max_tokens: 900
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub Models API 错误 ${response.status}:`, errorText);
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
