export async function chatWithMistral(messages, context = {}, model = 'mistral-small-latest') {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context, model })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error || 'Chat API error');
  }
  return resp.json();
}

export async function chatWithMistralStream(messages, context = {}, model = 'mistral-small-latest', onChunk, signal) {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context, model, stream: true }),
    signal,
  });
  if (!resp.ok || !resp.body) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error || 'Chat API error');
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';
  
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // Parser les lignes de donnees SSE
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Garder la ligne incomplete
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6); // Enlever 'data: '
        
        if (data === '[DONE]') {
          continue;
        }
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed?.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk?.(fullContent);
          }
        } catch (e) {
          // Ignorer les erreurs de parsing JSON
        }
      }
    }
  }
}

