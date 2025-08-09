// Vercel Serverless Function: /api/chat
// Utilise l'API Mistral pour générer des réponses de chatbot

/**
 * Expected POST body:
 * {
 *   messages: [{ role: 'user'|'assistant'|'system', content: string }...],
 *   context: { path?: string, category?: string, listingId?: string }
 * }
 */

const ALLOWED_MODELS = ['mistral-small-latest', 'mistral-large-latest'];
const DEFAULT_MODEL = 'mistral-small-latest';

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Clé API Mistral (dépôt privé)
    const apiKey = process.env.MISTRAL_API_KEY || 'rJHJdTtKsu58p2k1j5jkBmUwyc56z5tP';
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing MISTRAL_API_KEY' });
    }

    const { messages, context = {}, model, stream } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages is required' });
    }

    const chosenModel = ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL;

    const systemPrompt = [
      "Tu es MaxiMarket Assistant, le chatbot du site MaxiMarket (marketplace Afrique de l'Ouest).",
      'Règles:',
      '- Réponds en français, ton professionnel, concis et actionnable.',
      "- Si l'utilisateur demande à trouver des annonces, propose des filtres (catégorie, prix XOF, localisation) et des actions (ouvrir résultats, affiner).",
      "- Si un contexte d'annonce est présent (context.listing), priorise des réponses spécifiques à cette annonce: cite le titre, le prix (XOF) et la ville si disponibles; propose d'ouvrir la page /annonce/:id, de contacter le vendeur ou d'ouvrir WhatsApp.",
      "- N'invente pas de données; si une information manque, dis-le et propose une action (recherche, contacter vendeur).",
      '- Évite les données personnelles sensibles. Aucune clé/API côté client.',
      '- Style: réponses courtes, listes claires si utile, pas de verbiage inutile.'
    ].join('\n');

    const contextBlock = `\nContexte page: ${JSON.stringify(context)}`;

    const mistralBody = {
      model: chosenModel,
      messages: [
        { role: 'system', content: systemPrompt + contextBlock },
        ...messages,
      ],
      temperature: 0.4,
      max_tokens: 600,
      stream: !!stream,
      safe_prompt: true,
    };

    // Streaming mode: proxy l'event-stream Mistral
    if (mistralBody.stream) {
      const upstream = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(mistralBody),
      });

      if (!upstream.ok) {
        const errText = await upstream.text();
        return res.status(upstream.status).json({ error: 'Mistral API error', details: errText });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        res.write(text);
      }
      res.end();
      return;
    }

    // Non-stream mode
    const upstream = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(mistralBody),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return res.status(upstream.status).json({ error: 'Mistral API error', details: errText });
    }

    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content, model: data?.model || chosenModel });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

