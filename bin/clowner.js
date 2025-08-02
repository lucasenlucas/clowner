#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const args = process.argv.slice(2);

// 📥 Input check
if (args.length < 1) {
  console.error("❌ Gebruik: clowner <url> [-o <output-folder>]");
  process.exit(1);
}

const url = args[0];
const outputFlag = args.indexOf("-o");
const outputDir = outputFlag !== -1 && args[outputFlag + 1] ? args[outputFlag + 1] : "cloned-site";

// 📂 Mappen
const htmlDir = path.join(outputDir, "html");
const cssDir = path.join(outputDir, "css");

async function main() {
  try {
    console.log(`🌐 Downloading HTML from: ${url}`);
    const res = await axios.get(url);
    const html = res.data;

    const $ = cheerio.load(html);
    await fs.ensureDir(htmlDir);
    await fs.ensureDir(cssDir);

    // 🎨 CSS-bestanden downloaden
    const cssLinks = $("link[rel='stylesheet']");
    await Promise.all(cssLinks.map(async (i, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      const fullUrl = href.startsWith("http") ? href : new URL(href, url).href;
      const filename = `style${i}.css`;
      const savePath = path.join(cssDir, filename);

      try {
        const cssRes = await axios.get(fullUrl);
        await fs.writeFile(savePath, cssRes.data);
        $(el).attr("href", `../css/${filename}`);
        console.log(`✅ CSS: ${filename}`);
      } catch {
        console.warn(`⚠️  CSS kon niet geladen worden: ${fullUrl}`);
      }
    }).get());

    // 📝 HTML opslaan
    await fs.writeFile(path.join(htmlDir, "index.html"), $.html());
    console.log(`✅ Klaar! HTML en CSS opgeslagen in: ${outputDir}/`);
  } catch (err) {
    console.error("❌ Er ging iets mis:", err.message);
  }
}

main();
