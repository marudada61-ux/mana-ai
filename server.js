import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3000);
const MODEL = process.env.OPENAI_MODEL || 'gpt-6-luna';

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY. Add it to your private .env file.');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// This starter serves its own frontend, so it does not enable cross-origin access.
// CSP is disabled here because the first demo keeps its CSS/JS inline; add a strict CSP before production.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'చాలా వేగంగా సందేశాలు పంపుతున్నారు. ఒక నిమిషం తర్వాత మళ్లీ ప్రయత్నించండి.' }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'MANA AI' });
});

app.post('/api/chat', chatLimiter, async (req, res) => {
  const messages = req.body?.messages;

  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 12) {
    return res.status(400).json({ error: 'సందేశాల జాబితా సరైనది కాదు.' });
  }

  const safeMessages = [];
  for (const message of messages) {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
      return res.status(400).json({ error: 'సందేశం సరైన ఫార్మాట్‌లో లేదు.' });
    }
    const content = message.content.trim();
    if (!content || content.length > 4000) {
      return res.status(400).json({ error: 'ఒక్కో సందేశం 1 నుంచి 4000 అక్షరాల మధ్య ఉండాలి.' });
    }
    safeMessages.push({ role: message.role, content });
  }

  if (safeMessages[safeMessages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'చివరి సందేశం user నుంచి రావాలి.' });
  }

  try {
    const response = await openai.responses.create({
      model: MODEL,
      instructions: [
        'You are MANA AI, a helpful and respectful assistant.',
        'Understand and answer naturally in Telugu or English, matching the language used by the user.',
        'For Telugu, use clear, simple Telugu. If the user mixes Telugu and English, you may do the same.',
        'Be honest about uncertainty. Do not claim to have performed actions outside this chat.',
        'Keep answers useful, safe, and easy for a beginner to understand.'
      ].join(' '),
      input: safeMessages,
      max_output_tokens: 700,
      store: false
    });

    const reply = (response.output_text || '').trim();
    if (!reply) {
      return res.status(502).json({ error: 'AI నుంచి ఖాళీ సమాధానం వచ్చింది. మళ్లీ ప్రయత్నించండి.' });
    }
    return res.json({ reply });
  } catch (error) {
    // Keep the provider's raw error and any credentials out of the browser response.
    console.error('MANA AI API request failed:', error?.message || 'Unknown error');
    return res.status(502).json({ error: 'AI సేవ ప్రస్తుతం స్పందించడం లేదు. API Key, model access, billing, మరియు internet కనెక్షన్ చెక్ చేయండి.' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MANA AI is running at http://localhost:${PORT}`);
  console.log(`Configured model: ${MODEL}`);
});
