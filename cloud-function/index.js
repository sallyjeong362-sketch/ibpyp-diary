const functions = require('@google-cloud/functions-framework');
const { AnthropicVertex } = require('@anthropic-ai/vertex-sdk');

const MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-5-5';

// API 키 없이 동작합니다 — 이 함수에 연결된 서비스 계정의 Google Cloud 자격
// 증명으로 인증돼요. 배포 시 ANTHROPIC_VERTEX_PROJECT_ID 환경 변수(Firebase/
// GCP 프로젝트 ID)만 설정해주면 되고, 리전은 가용성이 가장 넓은 "global"을
// 기본값으로 씁니다.
const client = new AnthropicVertex({
  projectId: process.env.ANTHROPIC_VERTEX_PROJECT_ID,
  region: process.env.CLOUD_ML_REGION || 'global',
});

const SYSTEM_PROMPT = `You are a friendly, encouraging English writing tutor reviewing a K-12 student's short English diary entry.
Find real grammar, spelling, and clarity issues: missing articles, wrong verb tense, sentence fragments, typos, subject-verb agreement, missing punctuation, etc.
Ignore things that are already correct and skip minor style preferences.
Reply with ONLY a JSON array (no markdown fences, no prose before or after) of objects shaped like:
[{"original": "the exact flawed phrase or sentence copied from the text", "suggestion": "the corrected version", "explanation": "one short, simple sentence explaining the fix, appropriate for a young English learner"}]
If there are no issues, reply with exactly: []`;

functions.http('checkGrammar', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const text = ((req.body && req.body.text) || '').toString().slice(0, 4000);
  if (!text.trim()) {
    res.status(200).json({ suggestions: [] });
    return;
  }

  if (!process.env.ANTHROPIC_VERTEX_PROJECT_ID) {
    console.error('ANTHROPIC_VERTEX_PROJECT_ID 환경 변수가 설정되지 않았습니다.');
    res.status(500).json({ error: 'Server not configured' });
    return;
  }

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    });

    const raw = (message.content && message.content[0] && message.content[0].text) || '[]';

    let suggestions = [];
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      suggestions = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      if (!Array.isArray(suggestions)) suggestions = [];
    } catch (parseErr) {
      console.error('Failed to parse Claude response as JSON', raw);
      suggestions = [];
    }

    res.status(200).json({ suggestions });
  } catch (e) {
    console.error('Vertex AI error', e);
    res.status(500).json({ error: 'Internal error' });
  }
});
