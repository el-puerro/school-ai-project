'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 1337;
const { createProxyMiddleware } = require('http-proxy-middleware');

const apiProxy = createProxyMiddleware('/api', {
    target: 'https://37.120.170.56:31432',
    changeOrigin: true,
    secure: false, // bei selbstsignierten Zertifikaten
    pathRewrite: {
        '^/api': '/v1', // Pfad umschreiben
    },
});

const server = http.createServer((req, res) => {
    // Setze Content-Type Header für alle HTML-Antworten
    if (req.url.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    // Überprüfe, ob die Anfrage an den Proxy weitergeleitet werden soll
    if (req.url.startsWith('/api')) {
        apiProxy(req, res);
        return;
    }
    // API-Endpunkt für das Aktualisieren der Temperatur
    if (req.method === 'POST' && req.url === '/update-temperature') {
        // Hier würdest du die Logik für das Aktualisieren der Temperatur einfügen
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Temperatur aktualisiert' }));
    } else {
        // Statische Dateien bedienen
        let filePath = '.' + req.url;
        if (filePath === './') {
            filePath = './index.html';
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.wasm': 'application/wasm'
        };

        const contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    fs.readFile('./404.html', (error, content) => {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    });
                } else {
                    res.writeHead(500);
                    res.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
                }
            } else {
                res.writeHead(200, {
                    'Content-Type': 'contentType; charset=utf-8' });
                res.end(content, 'utf-8');
            }
        });
    }
});

server.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
