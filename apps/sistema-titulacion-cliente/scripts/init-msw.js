/**
 * Script para inicializar el Service Worker de MSW
 *
 * Este script copia el service worker de MSW a la carpeta public
 * para que pueda ser usado por el navegador.
 *
 * Ejecutar: node scripts/init-msw.js
 * O usar: npm run init-msw (si está configurado en package.json)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '../public');
const swPath = path.join(publicDir, 'mockServiceWorker.js');

try {
  // Verificar que existe la carpeta public
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generar el service worker usando el CLI de MSW
  console.log('Inicializando MSW Service Worker...');
  execSync(`npx msw init ${publicDir} --save`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });

  if (fs.existsSync(swPath)) {
    console.log('Service Worker generado exitosamente en:', swPath);
  } else {
    console.warn(
      'El Service Worker no se generó. Verifica que MSW esté instalado.'
    );
  }
} catch (error) {
  console.error('Error al inicializar MSW:', error.message);
  process.exit(1);
}
