import path from 'node:path';
import react from '@vitejs/plugin-react';
import { createLogger, defineConfig } from 'vite';

const configHorizonsViteErrorHandler = `
const observer = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		for (const addedNode of mutation.addedNodes) {
			if (
				addedNode.nodeType === Node.ELEMENT_NODE &&
				(
					addedNode.tagName?.toLowerCase() === 'vite-error-overlay' ||
					addedNode.classList?.contains('backdrop')
				)
			) {
				handleViteOverlay(addedNode);
			}
		}
	}
});

observer.observe(document.documentElement, {
	childList: true,
	subtree: true
});

function handleViteOverlay(node) {
	if (!node.shadowRoot) {
		return;
	}

	const backdrop = node.shadowRoot.querySelector('.backdrop');

	if (backdrop) {
		const overlayHtml = backdrop.outerHTML;
		const parser = new DOMParser();
		const doc = parser.parseFromString(overlayHtml, 'text/html');
		const messageBodyElement = doc.querySelector('.message-body');
		const fileElement = doc.querySelector('.file');
		const messageText = messageBodyElement ? messageBodyElement.textContent.trim() : '';
		const fileText = fileElement ? fileElement.textContent.trim() : '';
		const error = messageText + (fileText ? ' File:' + fileText : '');

		window.parent.postMessage({
			type: 'horizons-vite-error',
			error,
		}, '*');
	}
}
`;

const configHorizonsRuntimeErrorHandler = `
function showRuntimeErrorBanner(text) {
  try {
    var banner = document.getElementById('runtime-error-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'runtime-error-banner';
      banner.style.position = 'fixed';
      banner.style.top = '0';
      banner.style.left = '0';
      banner.style.right = '0';
      banner.style.zIndex = '999999';
      banner.style.background = '#111827';
      banner.style.color = '#fca5a5';
      banner.style.fontFamily = 'monospace';
      banner.style.fontSize = '12px';
      banner.style.whiteSpace = 'pre-wrap';
      banner.style.padding = '12px 16px';
      banner.style.borderBottom = '2px solid #ef4444';
      document.body.appendChild(banner);
    }
    banner.textContent = 'Runtime error: ' + text;
  } catch (e) {
    // ignore
  }
}

window.addEventListener('error', function (event) {
  var errorObj = event.error || {};
  var message = (event.message || '') + (errorObj && errorObj.stack ? ('\n' + errorObj.stack) : '');
  showRuntimeErrorBanner(message);
  window.parent.postMessage({
    type: 'horizons-runtime-error',
    message: message,
    error: errorObj ? JSON.stringify({
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }) : null
  }, '*');
}, true);

window.addEventListener('unhandledrejection', function (event) {
  var reason = event.reason;
  var text = typeof reason === 'string' ? reason : (reason && (reason.stack || reason.message)) || String(reason);
  showRuntimeErrorBanner('Unhandled promise rejection: ' + text);
  window.parent.postMessage({
    type: 'horizons-runtime-error',
    message: text,
    error: null
  }, '*');
}, true);
`;

const configHorizonsConsoleErrroHandler = `
const originalConsoleError = console.error;
console.error = function(...args) {
	originalConsoleError.apply(console, args);

	let errorString = '';

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg instanceof Error) {
			errorString = arg.stack || \`\${arg.name}: \${arg.message}\`;
			break;
		}
	}

	if (!errorString) {
		errorString = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
	}

	window.parent.postMessage({
		type: 'horizons-console-error',
		error: errorString
	}, '*');
};
`;

const configWindowFetchMonkeyPatch = `
const originalFetch = window.fetch;

window.fetch = function(...args) {
	const url = args[0] instanceof Request ? args[0].url : args[0];

	// Skip WebSocket URLs
	if (url.startsWith('ws:') || url.startsWith('wss:')) {
		return originalFetch.apply(this, args);
	}

	return originalFetch.apply(this, args)
		.then(async response => {
			const contentType = response.headers.get('Content-Type') || '';

			// Exclude HTML document responses
			const isDocumentResponse =
				contentType.includes('text/html') ||
				contentType.includes('application/xhtml+xml');

			if (!response.ok && !isDocumentResponse) {
					const responseClone = response.clone();
					const errorFromRes = await responseClone.text();
					const requestUrl = response.url;
					console.error(\`Fetch error from \${requestUrl}: \${errorFromRes}\`);
			}

			return response;
		})
		.catch(error => {
			if (!url.match(/\.html?$/i)) {
				console.error(error);
			}

			throw error;
		});
};
`;

const addTransformIndexHtml = {
	name: 'add-transform-index-html',
	transformIndexHtml(html) {
		return {
			html,
			tags: [
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configHorizonsRuntimeErrorHandler,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configHorizonsViteErrorHandler,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: {type: 'module'},
					children: configHorizonsConsoleErrroHandler,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configWindowFetchMonkeyPatch,
					injectTo: 'head',
				},
			],
		};
	},
};

console.warn = () => {};

const logger = createLogger()
const loggerError = logger.error

logger.error = (msg, options) => {
	if (options?.error?.toString().includes('CssSyntaxError: [postcss]')) {
		return;
	}

	loggerError(msg, options);
}

export default defineConfig({
	customLogger: logger,
  plugins: [
    react(),
    addTransformIndexHtml,
    {
      name: 'dev-chat-endpoint',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use('/api/chat', async (req, res, next) => {
          try {
            if (req.method !== 'POST') {
              res.setHeader('Allow', 'POST');
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }
            // Cle API Mistral (depot prive)
            const apiKey = process.env.MISTRAL_API_KEY || 'rJHJdTtKsu58p2k1j5jkBmUwyc56z5tP';
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const body = JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}');
            const { messages, context = {}, model = 'mistral-small-latest', stream } = body;
            if (!Array.isArray(messages) || messages.length === 0) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'messages is required' }));
              return;
            }
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
              model,
              messages: [
                { role: 'system', content: systemPrompt + contextBlock },
                ...messages,
              ],
              temperature: 0.4,
              max_tokens: 600,
              stream: !!stream,
              safe_prompt: true,
            };
            if (!apiKey) {
              // Fallback local: renvoyer une reponse minimale en dev si la cle manque
              const content = 'Le chatbot n\'est pas configuré. Veuillez vérifier la configuration de l\'API Mistral.';
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ content, model: 'offline-dev' }));
              return;
            }

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
              res.statusCode = upstream.status;
              res.end(JSON.stringify({ error: 'Mistral API error', details: errText }));
              return;
            }
            if (mistralBody.stream) {
              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache');
              res.setHeader('Connection', 'keep-alive');
              const reader = upstream.body.getReader();
              const decoder = new TextDecoder();
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                res.write(decoder.decode(value));
              }
              res.end();
              return;
            }
            const data = await upstream.json();
            const content = data?.choices?.[0]?.message?.content || '';
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ content, model: data?.model || model }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error (dev chat)', details: String(err?.message || err) }));
          }
        });
      }
    }
  ],
	server: {
		cors: true,
		headers: {
			'Cross-Origin-Embedder-Policy': 'credentialless',
		},
		allowedHosts: true,
    proxy: {
      // Chatbot local (ne pas proxy /api/chat)
      '/api/chat': {
        target: 'http://localhost:5173',
        changeOrigin: false,
        secure: false,
        ws: false,
      },
      // Backend historique
      '/api': {
        target: 'https://officielbenome-backend.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
	},
	resolve: {
		extensions: ['.jsx', '.js', '.tsx', '.ts', '.json', ],
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
