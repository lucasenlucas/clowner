#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Gebruik: clowner <url> [-o <mapnaam>]');
  process.exit(1);
}

const url = args[0];
const outputIndex = args.indexOf('-o');
const outputDir = outputIndex !== -1 ? args[outputIndex + 1] : 'cloned-site';

async function main() {
  try {
    const res = await axios.get(url);
    const html = res.data;
    const $ = cheerio.load(html);

    // Maak outputmap
    fs.mkdirSync(outputDir, { recursive: true });

    // Schrijf index.html
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
    console.log(`✅ HTML opgeslagen in ${outputDir}/index.html`);

    // Zoek CSS links en download ze
    const cssLinks = $('link[rel="stylesheet"]');

    for (let i = 0; i < cssLinks.length; i++) {
      const href = $(cssLinks[i]).attr('href');
      if (!href) continue;

      const fullUrl = href.startsWith('http') ? href : new URL(href, url).href;
      const cssRes = await axios.get(fullUrl);
      const filename = path.basename(href.split('?')[0]);

      fs.writeFileSync(path.join(outputDir, filename), cssRes.data);
      console.log(`🎨 CSS opgeslagen: ${filename}`);
    }

    console.log('✅ Clowner completed!');
  } catch (err) {
    console.error('❌ Fout bij downloaden:', err.message);
  }
}

main();
