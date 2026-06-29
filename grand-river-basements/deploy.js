#!/usr/bin/env node
/**
 * Deploy the built site (dist/) to Hostinger FTP  OR  Cloudflare Pages.
 * Reads credentials from .env in this directory.
 * Usage:  node deploy.js
 */
require('dotenv').config({ path: __dirname + '/.env' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');

if (!fs.existsSync(DIST)) {
  console.log('dist/ not found — building first…');
  execSync('node ' + path.join(__dirname, 'build.js'), { stdio: 'inherit' });
}

// ── Cloudflare Pages ──────────────────────────────────────────────────────────
if (process.env.CF_API_TOKEN && process.env.CF_ACCOUNT_ID) {
  console.log('Deploying to Cloudflare Pages…');
  try {
    execSync('npx --yes wrangler pages deploy dist ' +
      `--project-name="${process.env.CF_PROJECT_NAME || 'grand-river-basements'}" ` +
      `--branch=main`,
      {
        stdio: 'inherit',
        cwd: __dirname,
        env: {
          ...process.env,
          CLOUDFLARE_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
          CLOUDFLARE_API_TOKEN: process.env.CF_API_TOKEN,
        }
      }
    );
    console.log('Done — Cloudflare Pages deploy complete.');
  } catch (e) {
    process.exit(1);
  }
  return;
}

// ── FTP (Hostinger / cPanel) ──────────────────────────────────────────────────
if (process.env.FTP_HOST && process.env.FTP_USER && process.env.FTP_PASS) {
  console.log('Deploying via FTP to ' + process.env.FTP_HOST + ' …');

  // Install basic-ftp if needed
  try { require.resolve('basic-ftp'); }
  catch (_) { execSync('npm install --no-save basic-ftp', { stdio: 'inherit', cwd: __dirname }); }

  const ftp = require('basic-ftp');
  (async () => {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    try {
      await client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASS,
        secure: false,
      });
      const remoteDir = process.env.FTP_REMOTE_DIR || '/public_html';
      console.log('Connected. Uploading dist/ → ' + remoteDir);
      await client.ensureDir(remoteDir);
      await client.clearWorkingDir();
      await client.uploadFromDir(DIST);
      console.log('Done — FTP upload complete.');
    } catch (err) {
      console.error('FTP error:', err.message);
      process.exit(1);
    } finally {
      client.close();
    }
  })();
  return;
}

console.error('No credentials found. Fill in .env (FTP or Cloudflare) and re-run.');
process.exit(1);
