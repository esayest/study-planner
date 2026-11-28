import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
});

/** Parse --port / -l CLI arguments or PORT env var cleanly. */
function parsePort(argv, env = process.env) {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === '--port' || arg === '-p' || arg === '-l') && argv[i + 1]) {
      const parsed = Number(argv[i + 1]);
      if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 65535) return parsed;
    }
    if (arg.startsWith('--port=')) {
      const parsed = Number(arg.slice('--port='.length));
      if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 65535) return parsed;
    }
  }
  const envPort = Number(env.PORT);
  if (Number.isInteger(envPort) && envPort > 0 && envPort <= 65535) return envPort;
  return 3000;
}

/** Resolve request pathname safely inside rootDir, rejecting dotfile/traversal segments. */
export function resolveSafeFilePath(urlPath, rootDir = ROOT_DIR) {
  const rawPathname = String(urlPath || '/').split('?')[0];
  let decoded;
  try {
    decoded = decodeURIComponent(rawPathname);
  } catch {
    return { errorStatus: 400, filePath: null };
  }

  const rawSegments = decoded.split(/[\\/]/).filter(Boolean);
  if (rawSegments.some(seg => seg === '..' || seg.startsWith('.'))) {
    return { errorStatus: 403, filePath: null };
  }

  const candidate = path.resolve(rootDir, ...rawSegments);
  const relCheck = path.relative(rootDir, candidate);
  if (relCheck.startsWith('..') || path.isAbsolute(relCheck)) {
    return { errorStatus: 403, filePath: null };
  }
  return { errorStatus: 0, filePath: candidate };
}

function getContentType(filePath) {
  const base = path.basename(filePath).toLowerCase();
  if (base === 'manifest.json') return 'application/manifest+json; charset=utf-8';
  const ext = path.extname(base);
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function sendText(res, statusCode, text, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    ...extraHeaders,
  });
  res.end(text);
}

/** Create a zero-dependency static file server for local and offline usage. */
export function createStaticServer(rootDir = ROOT_DIR) {
  return http.createServer(async (req, res) => {
    const method = req.method || 'GET';
    if (method !== 'GET' && method !== 'HEAD') {
      sendText(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
      return;
    }

    const { errorStatus, filePath: targetCandidate } = resolveSafeFilePath(req.url || '/', rootDir);
    if (!targetCandidate) {
      sendText(res, errorStatus || 403, errorStatus === 400 ? 'Bad Request' : 'Forbidden');
      return;
    }

    let targetPath = targetCandidate;
    try {
      const stat = await fs.promises.stat(targetPath);
      if (stat.isDirectory()) {
        targetPath = path.join(targetPath, 'index.html');
        await fs.promises.access(targetPath, fs.constants.R_OK);
      }
      const data = await fs.promises.readFile(targetPath);
      res.writeHead(200, {
        'Content-Type': getContentType(targetPath),
        'Content-Length': data.byteLength,
        'Cache-Control': 'no-cache',
      });
      res.end(method === 'HEAD' ? undefined : data);
    } catch (err) {
      if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
        sendText(res, 404, 'Not Found');
        return;
      }
      sendText(res, 500, 'Internal Server Error');
    }
  });
}

const resolvedArgv = process.argv[1] ? path.resolve(process.argv[1]) : '';
const isEntryPoint = Boolean(
  resolvedArgv &&
  (process.platform === 'win32'
    ? resolvedArgv.toLowerCase() === __filename.toLowerCase()
    : resolvedArgv === __filename)
);
if (isEntryPoint) {
  const port = parsePort(process.argv.slice(2));
  const host = process.env.HOST || '127.0.0.1';
  const server = createStaticServer(ROOT_DIR);

  server.on('error', (err) => {
    console.error(`Failed to start server on http://${host}:${port}:`, err.message);
    process.exit(1);
  });

  server.listen(port, host, () => {
    const addr = server.address();
    const activePort = typeof addr === 'object' && addr ? addr.port : port;
    console.log(`Study Planner local server running at http://${host}:${activePort}/`);
  });

  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
