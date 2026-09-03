#!/usr/bin/env node
// Script para re-descargar las imágenes que fallaron

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, '../public');

// ── Anime fallidos (malIds corregidos) ────────────────────────────────────────
const ANIME_RETRY = [
  { id: 'demon-slayer',    malId: 38000  }, // Kimetsu no Yaiba S1
  { id: 'bocchi-the-rock', malId: 47917  }, // Bocchi the Rock!
];

// ── Músicos (TODOS, usando MediaWiki API) ─────────────────────────────────────
const MUSICIANS = [
  { id: 'freddie-mercury',  wikiTitle: 'Freddie Mercury'    },
  { id: 'jimi-hendrix',     wikiTitle: 'Jimi Hendrix'       },
  { id: 'david-bowie',      wikiTitle: 'David Bowie'        },
  { id: 'billie-eilish',    wikiTitle: 'Billie Eilish'      },
  { id: 'kurt-cobain',      wikiTitle: 'Kurt Cobain'        },
  { id: 'lady-gaga',        wikiTitle: 'Lady Gaga'          },
  { id: 'michael-jackson',  wikiTitle: 'Michael Jackson'    },
  { id: 'taylor-swift',     wikiTitle: 'Taylor Swift'       },
  { id: 'kendrick-lamar',   wikiTitle: 'Kendrick Lamar'     },
  { id: 'the-weeknd',       wikiTitle: 'The Weeknd'         },
  { id: 'prince',           wikiTitle: 'Prince (musician)'  },
  { id: 'amy-winehouse',    wikiTitle: 'Amy Winehouse'      },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'CreativeNexus/1.0 (https://github.com/jdgz17/creative-nexus; educational project)',
        'Accept': 'application/json',
        ...headers,
      }
    }, res => {
      let data = '';
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return get(res.headers.location, headers).then(resolve).catch(reject);
      }
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function post(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CreativeNexus/1.0 (educational project)',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      }
    }, res => {
      let out = '';
      res.on('data', c => out += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(out) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function downloadBinary(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'CreativeNexus/1.0 (https://github.com/jdgz17; educational project)',
      }
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadBinary(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', err => { fs.unlinkSync(dest); reject(err); });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── AniList GraphQL ───────────────────────────────────────────────────────────

async function getAnilistImage(malId) {
  const query = `query { Media(idMal: ${malId}, type: ANIME) { coverImage { large } } }`;
  const res = await post('https://graphql.anilist.co', { query });
  if (res.status !== 200) throw new Error(`AniList ${res.status}`);
  const url = res.body?.data?.Media?.coverImage?.large;
  if (!url) throw new Error('No coverImage returned');
  return url;
}

// ── MediaWiki API (mejor que REST para descargas) ─────────────────────────────

async function getWikiImage(title) {
  // Step 1: get the page image filename via MediaWiki API
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=400&pilicense=any`;
  const res = await get(apiUrl);
  if (res.status !== 200) throw new Error(`MediaWiki API ${res.status}`);
  const json = JSON.parse(res.body);
  const pages = json?.query?.pages;
  const page = pages && Object.values(pages)[0];
  const thumbUrl = page?.thumbnail?.source;
  if (!thumbUrl) throw new Error(`No thumbnail for "${title}"`);
  // Upgrade to 400px
  return thumbUrl.replace(/\/\d+px-/, '/400px-');
}

// ── Main ─────────────────────────────────────────────────────────────────────

const results = {};

console.log('\n📺 Re-descargando anime fallidos...\n');
for (const a of ANIME_RETRY) {
  try {
    process.stdout.write(`  → ${a.id} (malId ${a.malId})... `);
    const imgUrl = await getAnilistImage(a.malId);
    const ext = imgUrl.split('?')[0].split('.').pop() || 'jpg';
    const dest = path.join(PUBLIC, 'images', 'anime', `${a.id}.${ext}`);
    await downloadBinary(imgUrl, dest);
    results[a.id] = `/images/anime/${a.id}.${ext}`;
    console.log(`✅ (${ext})`);
    await sleep(500);
  } catch (e) {
    console.log(`❌ ${e.message}`);
    results[a.id] = null;
  }
}

console.log('\n🎵 Descargando músicos via MediaWiki API...\n');
for (const m of MUSICIANS) {
  try {
    process.stdout.write(`  → ${m.id}... `);
    const imgUrl = await getWikiImage(m.wikiTitle);
    const filename = imgUrl.split('/').pop().split('?')[0];
    const ext = filename.split('.').pop().toLowerCase().replace('jpeg','jpg') || 'jpg';
    const dest = path.join(PUBLIC, 'images', 'musicians', `${m.id}.${ext}`);
    await downloadBinary(imgUrl, dest);
    results[m.id] = `/images/musicians/${m.id}.${ext}`;
    console.log(`✅ (${ext})`);
    await sleep(300);
  } catch (e) {
    console.log(`❌ ${e.message}`);
    results[m.id] = null;
  }
}

console.log('\n📋 Resultado:\n', JSON.stringify(results, null, 2));

// Merge con el mapa anterior
const mapPath = path.join(__dirname, 'image-map.json');
const existing = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
for (const [id, val] of Object.entries(results)) {
  if (val) {
    if (ANIME_RETRY.find(a => a.id === id)) existing.anime[id] = val;
    else existing.musicians[id] = val;
  }
}
fs.writeFileSync(mapPath, JSON.stringify(existing, null, 2));
console.log('\n✅ image-map.json actualizado\n');
