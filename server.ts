import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  const apiUrl = process.env['API_URL'] || 'http://localhost:8080';
  const apiPublicUrl = process.env['API_PUBLIC_URL'] || apiUrl;
  const recaptchaSiteKey = process.env['RECAPTCHA_SITE_KEY']
  const googleMapsApiKey = process.env['GOOGLE_MAPS_API_KEY'] || '';

  server.get('/health', async (_req, res) => {
    try {
      const response = await fetch(`${apiUrl}/health`)
      if (response.ok) {
        console.log('[Health] Frontend OK — Backend reachable')
        res.status(200).json({ status: 'ok', backend: 'reachable' })
      } else {
        console.warn('[Health] Frontend OK — Backend unhealthy')
        res.status(200).json({ status: 'ok', backend: 'unhealthy' })
      }
    } catch {
      console.error('[Health] Frontend OK — Backend unreachable')
      res.status(200).json({ status: 'ok', backend: 'unreachable' })
    }
  })

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) =>
        res.send(
          html.replace(
            '</head>',
            `<script>window.__API_URL__=${JSON.stringify(apiPublicUrl)};window.__RECAPTCHA_SITE_KEY__=${JSON.stringify(recaptchaSiteKey)}</script>${googleMapsApiKey ? `<script async defer src="https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&loading=async"></script>` : ''}</head>`
          )
        )
      )
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  // Railway routes the public domain to this port; bind on all interfaces.
  const port = Number(process.env['PORT']) || 8080;
  const host = '0.0.0.0';

  // Start up the Node server
  const server = app();
  server.listen(port, host, () => {
    console.log(`Node Express server listening on http://${host}:${port}`);
  });
}

run();
