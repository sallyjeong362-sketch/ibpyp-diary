const functions = require('@google-cloud/functions-framework');

const MODEL = 'claude-haiku-4-5-20251001';

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set');
    res.status(500).json({ error: 'Server not configured' });
    return;
  }

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error('Anthropic API error', claudeRes.status, errText);
      res.status(502).json({ error: 'AI service error' });
      return;
    }

    const data = await claudeRes.json();
    const raw = (data.content && data.content[0] && data.content[0].text) || '[]';

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
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
});
