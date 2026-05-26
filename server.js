const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

  // API Endpoint per il caricamento dei file (foto/documenti) direttamente sul disco (CMS locale)
  if (req.method === 'POST' && req.url === '/api/upload') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const { filename, base64Data } = parsed;
        
        if (!filename || !base64Data) {
          throw new Error('Nome file o dati mancanti');
        }

        // Pulisce il base64 (rimuove ad es. "data:image/jpeg;base64,")
        const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');
        
        // Assicura che esista la cartella 'uploads'
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir);
        }

        const filePath = path.join(uploadDir, filename);
        
        fs.writeFile(filePath, buffer, (err) => {
          if (err) {
            console.error('\x1b[31m%s\x1b[0m', `Errore nel caricamento del file: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
            return;
          }
          console.log('\x1b[32m%s\x1b[0m', `File '${filename}' caricato con successo localmente in uploads/!`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, url: `uploads/${filename}` }));
        });
      } catch (e) {
        console.error('\x1b[31m%s\x1b[0m', `Errore nel caricamento del file: ${e.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // API Endpoint per il salvataggio dei dati direttamente sul disco (usato dal CMS locale)
  if (req.method === 'POST' && req.url === '/api/save') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        // Valida che sia JSON valido prima di salvare
        const parsed = JSON.parse(body);
        
        fs.writeFile(
          path.join(__dirname, 'data.json'),
          JSON.stringify(parsed, null, 2),
          'utf8',
          (err) => {
            if (err) {
              console.error('\x1b[31m%s\x1b[0m', `Errore nel salvataggio del file: ${err.message}`);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
              return;
            }
            console.log('\x1b[32m%s\x1b[0m', 'data.json salvato con successo dal CMS!');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          }
        );
      } catch (e) {
        console.error('\x1b[31m%s\x1b[0m', `Errore nel parsing del JSON ricevuto: ${e.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'JSON non valido' }));
      }
    });
    return;
  }

  // Gestione dei file statici
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Rimuovi eventuali query string o hash dal percorso
  const queryIndex = filePath.indexOf('?');
  if (queryIndex !== -1) {
    filePath = filePath.substring(0, queryIndex);
  }
  const hashIndex = filePath.indexOf('#');
  if (hashIndex !== -1) {
    filePath = filePath.substring(0, hashIndex);
  }

  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File non trovato, restituisci index.html per supportare SPA routing in caso, o 404
        fs.readFile(path.join(__dirname, '404.html'), (err, fallbackContent) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          if (err) {
            res.end('<h1>404 - Pagina Non Trovata</h1><p>Il file richiesto non esiste.</p>');
          } else {
            res.end(fallbackContent);
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Errore del server: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('\n\x1b[36m%s\x1b[0m', '==================================================');
  console.log('\x1b[32m%s\x1b[0m', '   SITO ASSOCIAZIONE & CMS LOCALE AVVIATI!');
  console.log('\x1b[36m%s\x1b[0m', '==================================================');
  console.log(`   Sito web pubblico:   \x1b[33mhttp://localhost:${PORT}\x1b[0m`);
  console.log(`   Pannello Amministratore:  \x1b[33mhttp://localhost:${PORT}/admin.html\x1b[0m`);
  console.log('\x1b[36m%s\x1b[0m', '==================================================');
  console.log(' Premi CTRL+C per arrestare il server locale.\n');
});
