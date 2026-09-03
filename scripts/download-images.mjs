#!/usr/bin/env node
// Script para descargar todas las imágenes de anime y músicos localmente

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, '../public');

// ── Anime via AniList GraphQL ──────────────────────────────────────────────────

const ANIME = [
  { id: 'demon-slayer',     malId: 101922 },
  { id: 'jujutsu-kaisen',   malId: 40748  },
  { id: 'attack-on-titan',  malId: 16498  },
  { id: 'one-piece',        malId: 21     },
  { id: 'solo-leveling',    malId: 52701  },
  { id: 'naruto-shippuden', malId: 1735   },
  { id: 'chainsaw-man',     malId: 44511  },
  { id: 'death-note',       malId: 1535   },
  { id: 'evangelion',       malId: 30     },
  { id: 'bocchi-the-rock',  malId: 130003 },
  { id: 'hunter-x-hunter',  malId: 11061  },
  { id: 'edgerunners',      malId: 42310  },
];

// ── Músicos via Wikipedia REST ────────────────────────────────────────────────

const MUSICIANS = [
  { id: 'freddie-mercury',  wikiTitle: 'Freddie_Mercury'     },
  { id: 'jimi-hendrix',     wikiTitle: 'Jimi_Hendrix'        },
  { id: 'david-bowie',      wikiTitle: 'David_Bowie'         },
  { id: 'billie-eilish',    wikiTitle: 'Billie_Eilish'       },
  { id: 'kurt-cobain',      wikiTitle: 'Kurt_Cobain'         },
  { id: 'lady-gaga',        wikiTitle: 'Lady_Gaga'           },
  { id: 'michael-jackson',  wikiTitle: 'Michael_Jackson'     },
  { id: 'taylor-swift',     wikiTitle: 'Taylor_Swift'        },
  { id: 'kendrick-lamar',   wikiTitle: 'Kendrick_Lamar'      },
  { id: 'the-weeknd',       wikiTitle: 'The_Weeknd'          },
  { id: 'prince',           wikiTitle: 'Prince_(musician)'   },
  { id: 'amy-winehouse',    wikiTitle: 'Amy_Winehouse'       },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, { ...options, headers: { 'User-Agent': 'CreativeNexus/1.0', ...(options.headers || {}) } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    lib.get(url, { headers: { 'User-Agent': 'CreativeNexus/1.0' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Fetch & download anime covers ─────────────────────────────────────────────

async function getAnilistImage(malId) {
  const query = `query { Media(idMal: ${malId}, type: ANIME) { coverImage { large } } }`;
  const res = await fetchJson('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (res.status !== 200) throw new Error(`AniList ${res.status} for malId ${malId}`);
  return res.body?.data?.Media?.coverImage?.large;
}

// ── Fetch & download musician photos ─────────────────────────────────────────

async function getWikiImage(wikiTitle) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
  const res = await fetchJson(url);
  if (res.status !== 200) throw new Error(`Wikipedia ${res.status} for ${wikiTitle}`);
  const src = res.body?.thumbnail?.source;
  if (!src) throw new Error(`No thumbnail for ${wikiTitle}`);
  return src.replace(/\/\d+px-/, '/400px-');
}

// ── Main ─────────────────────────────────────────────────────────────────────

const results = { anime: {}, musicians: {} };

console.log('\n📺 Descargando portadas de anime desde AniList...\n');
for (const a of ANIME) {
  try {
    console.log(`  → ${a.id}...`);
    const imgUrl = await getAnilistImage(a.malId);
    const ext = imgUrl.split('?')[0].split('.').pop() || 'jpg';
    const dest = path.join(PUBLIC, 'images', 'anime', `${a.id}.${ext}`);
    await downloadFile(imgUrl, dest);
    results.anime[a.id] = `/images/anime/${a.id}.${ext}`;
    console.log(`     ✅ guardado (${ext})`);
    await sleep(400); // respetar rate-limit de AniList
  } catch (e) {
    console.log(`     ❌ ERROR: ${e.message}`);
    results.anime[a.id] = null;
  }
}

console.log('\n🎵 Descargando fotos de músicos desde Wikipedia...\n');
for (const m of MUSICIANS) {
  try {
    console.log(`  → ${m.id}...`);
    const imgUrl = await getWikiImage(m.wikiTitle);
    const filename = imgUrl.split('/').pop().split('?')[0];
    const ext = filename.split('.').pop() || 'jpg';
    const dest = path.join(PUBLIC, 'images', 'musicians', `${m.id}.${ext}`);
    await downloadFile(imgUrl, dest);
    results.musicians[m.id] = `/images/musicians/${m.id}.${ext}`;
    console.log(`     ✅ guardado (${ext})`);
    await sleep(200);
  } catch (e) {
    console.log(`     ❌ ERROR: ${e.message}`);
    results.musicians[m.id] = null;
  }
}

console.log('\n📋 Resultados finales:');
console.log(JSON.stringify(results, null, 2));

// Guardar mapa de rutas para que el agente pueda actualizar los JSON
fs.writeFileSync(path.join(__dirname, 'image-map.json'), JSON.stringify(results, null, 2));
console.log('\n✅ Mapa guardado en scripts/image-map.json\n');
