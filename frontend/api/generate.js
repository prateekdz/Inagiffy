const axios = require('axios');

function sampleResources(topic) {
  return [
    { title: `${topic} - Official Guide`, url: `https://example.com/${encodeURIComponent(topic)}` },
    { title: `${topic} - Video Intro`, url: `https://youtube.com/results?search_query=${encodeURIComponent(topic)}` }
  ];
}

function generateMapLocal(topic, level) {
  const t = (topic || '').toLowerCase();
  if (t.includes('web')) {
    return {
      id: `root-${Date.now()}`,
      label: topic,
      description: 'A learning roadmap for web development.',
      children: [
        { id: 'frontend', label: 'Frontend', description: 'UI, HTML/CSS, JS frameworks', resources: sampleResources('Frontend'), children: [
          { id: 'html', label: 'HTML', description: 'Structure web pages', resources: sampleResources('HTML') },
          { id: 'css', label: 'CSS', description: 'Styling and layout', resources: sampleResources('CSS') },
          { id: 'react', label: 'React', description: 'Component-based UI', resources: sampleResources('React') }
        ]},
        { id: 'backend', label: 'Backend', description: 'Servers, APIs, auth', resources: sampleResources('Backend'), children: [
          { id: 'node', label: 'Node.js', description: 'JavaScript runtime', resources: sampleResources('Node.js') },
          { id: 'apis', label: 'APIs', description: 'REST / GraphQL', resources: sampleResources('APIs') }
        ]},
        { id: 'databases', label: 'Databases', description: 'Data storage', resources: sampleResources('Databases'), children: [
          { id: 'sql', label: 'SQL', description: 'Relational DBs', resources: sampleResources('SQL') },
          { id: 'nosql', label: 'NoSQL', description: 'Document DBs', resources: sampleResources('NoSQL') }
        ]}
      ]
    };
  }
  if (t.includes('garden') || t.includes('gardening')) {
    return {
      id: `root-${Date.now()}`,
      label: topic,
      description: 'A roadmap for gardening topics.',
      children: [
        { id: 'soil', label: 'Soil Basics', description: 'Soil types and nutrition', resources: sampleResources('Soil') },
        { id: 'plants', label: 'Plant Types', description: 'Annuals, perennials, shrubs', resources: sampleResources('Plant Types') },
        { id: 'watering', label: 'Watering', description: 'Water schedules and techniques', resources: sampleResources('Watering') }
      ]
    };
  }
  const words = (topic || '').split(/\s+/).slice(0,3);
  return {
    id: `root-${Date.now()}`,
    label: topic,
    description: `Overview for ${topic}`,
    children: words.map((w, i) => ({ id: `${w}-${i}`, label: w.charAt(0).toUpperCase()+w.slice(1), description: `About ${w}`, resources: sampleResources(w) }))
  };
}

const callLLM = async (messages) => {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not set');
  const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages,
    temperature: 0.6,
    max_tokens: 900
  }, {
    headers: { Authorization: `Bearer ${OPENAI_KEY}` }
  });
  return resp.data?.choices?.[0]?.message?.content || resp.data?.choices?.[0]?.text || null;
};

const extractJSON = (text) => {
  if (!text || typeof text !== 'string') return null;
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  const attempts = [];
  if (first >= 0 && last > first) attempts.push(text.slice(first, last + 1));
  attempts.push(text);
  for (const t of attempts) {
    try {
      return JSON.parse(t);
    } catch (e) {
      const cleaned = t.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      try { return JSON.parse(cleaned); } catch (e2) { /* continue */ }
    }
  }
  return null;
};

const validateNode = (node) => {
  if (!node || typeof node !== 'object') return false;
  if (typeof node.id !== 'string' || typeof node.label !== 'string') return false;
  if (node.description && typeof node.description !== 'string') return false;
  if (node.resources) {
    if (!Array.isArray(node.resources)) return false;
    for (const r of node.resources) {
      if (!r || typeof r.title !== 'string' || typeof r.url !== 'string') return false;
    }
  }
  if (node.children) {
    if (!Array.isArray(node.children)) return false;
    for (const c of node.children) if (!validateNode(c)) return false;
  }
  return true;
};

const generateMapLLM = async (topic, level) => {
  try {
    const system = `You are an assistant that returns a learning roadmap as JSON only. Strictly return valid JSON and nothing else. The JSON root must be a node object with fields: id (string), label (string), description (optional string), resources (array of objects with title and url), and children (array of nodes with the same shape).`;
    const user = `Generate a concise learning roadmap for the topic: "${topic}" at level: "${level}". Produce up to 3 top-level branches and up to 3 child nodes each. Return only the JSON object (no markdown, no explanation).`;
    const initial = await callLLM([{ role: 'system', content: system }, { role: 'user', content: user }]);
    let parsed = extractJSON(initial);
    if (parsed && validateNode(parsed)) return parsed;
    const repairPrompt = `The previous response could not be parsed as valid JSON matching the schema. Please return only a single valid JSON object that matches the node schema exactly (id, label, description?, resources[], children[]). Do NOT include any explanation.`;
    const repair = await callLLM([{ role: 'system', content: system }, { role: 'user', content: initial + '\n\n' + repairPrompt }]);
    parsed = extractJSON(repair);
    if (parsed && validateNode(parsed)) return parsed;
    if (parsed) return parsed;
    return null;
  } catch (err) {
    console.error('LLM generate error', err?.response?.data || err.message || err);
    return null;
  }
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).send('ok');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { topic, level } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'topic required' });
  const llmResult = await generateMapLLM(topic, level).catch(() => null);
  if (llmResult) return res.json({ root: llmResult, source: 'llm' });
  const local = generateMapLocal(topic, level);
  return res.json({ root: local, source: 'local' });
};
